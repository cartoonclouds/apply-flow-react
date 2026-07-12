import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const pgDir = path.join(repoRoot, "drizzle");
const sqliteDir = path.join(repoRoot, "drizzle-sqlite");

async function listMigrationDirectories(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function normalizePgStatementToSqlite(statement) {
  let normalized = statement.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("CREATE TYPE ")) {
    return null;
  }

  if (
    normalized.startsWith("ALTER TABLE ") &&
    normalized.includes(" ADD CONSTRAINT ")
  ) {
    return null;
  }

  normalized = normalized
    .replaceAll('"public".', "")
    .replaceAll(" double precision", " real")
    .replaceAll(" timestamp with time zone", " text")
    .replaceAll(" timestamp", " text")
    .replaceAll(" boolean", " integer")
    .replaceAll(" DEFAULT now()", " DEFAULT CURRENT_TIMESTAMP")
    .replaceAll(" DEFAULT false", " DEFAULT 0")
    .replaceAll(" DEFAULT true", " DEFAULT 1")
    .replaceAll('"attendance_type" "attendance_type"', '"attendance_type" text')
    .replaceAll('"employment_type" "employment_type"', '"employment_type" text')
    .replaceAll('"type" "contact_type"', '"type" text');

  return normalized;
}

function renderSqliteMigration(sqlText) {
  const statements = sqlText
    .split("--> statement-breakpoint")
    .map((statement) => normalizePgStatementToSqlite(statement))
    .filter((statement) => Boolean(statement));

  return `${statements.join("\n--> statement-breakpoint\n")}\n`;
}

async function syncSqliteMigrations() {
  const pgMigrationDirs = await listMigrationDirectories(pgDir);

  await mkdir(sqliteDir, { recursive: true });

  const validMigrationDirs = new Set(pgMigrationDirs);

  const existingSqliteEntries = await readdir(sqliteDir, {
    withFileTypes: true,
  });
  for (const entry of existingSqliteEntries) {
    if (entry.isDirectory() && validMigrationDirs.has(entry.name)) {
      continue;
    }

    await rm(path.join(sqliteDir, entry.name), {
      recursive: true,
      force: true,
    });
  }

  for (const migrationDir of pgMigrationDirs) {
    const pgMigrationPath = path.join(pgDir, migrationDir, "migration.sql");
    const sqliteMigrationDir = path.join(sqliteDir, migrationDir);
    const sqliteMigrationPath = path.join(sqliteMigrationDir, "migration.sql");

    const pgSql = await readFile(pgMigrationPath, "utf8");
    const sqliteSql = renderSqliteMigration(pgSql);

    await rm(sqliteMigrationDir, { recursive: true, force: true });
    await mkdir(sqliteMigrationDir, { recursive: true });
    await writeFile(sqliteMigrationPath, sqliteSql, "utf8");
  }
}

syncSqliteMigrations().catch((error) => {
  console.error("Failed to sync sqlite migrations", error);
  process.exitCode = 1;
});
