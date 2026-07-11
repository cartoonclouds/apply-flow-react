import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const pgDir = path.join(repoRoot, "drizzle");
const pgMetaPath = path.join(pgDir, "meta", "_journal.json");
const sqliteDir = path.join(repoRoot, "drizzle-sqlite");
const sqliteMetaDir = path.join(sqliteDir, "meta");
const sqliteMetaPath = path.join(sqliteMetaDir, "_journal.json");

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
  const pgJournalRaw = await readFile(pgMetaPath, "utf8");
  const pgJournal = JSON.parse(pgJournalRaw);

  await mkdir(sqliteDir, { recursive: true });
  await mkdir(sqliteMetaDir, { recursive: true });

  const validMigrationFiles = new Set(
    pgJournal.entries.map((entry) => `${entry.tag}.sql`),
  );

  const existingSqliteFiles = await readdir(sqliteDir);
  for (const fileName of existingSqliteFiles) {
    if (!fileName.endsWith(".sql")) {
      continue;
    }

    if (!validMigrationFiles.has(fileName)) {
      await unlink(path.join(sqliteDir, fileName));
    }
  }

  for (const entry of pgJournal.entries) {
    const pgMigrationPath = path.join(pgDir, `${entry.tag}.sql`);
    const sqliteMigrationPath = path.join(sqliteDir, `${entry.tag}.sql`);

    const pgSql = await readFile(pgMigrationPath, "utf8");
    const sqliteSql = renderSqliteMigration(pgSql);
    await writeFile(sqliteMigrationPath, sqliteSql, "utf8");
  }

  const sqliteJournal = {
    version: pgJournal.version,
    dialect: "sqlite",
    entries: pgJournal.entries,
  };

  await writeFile(
    sqliteMetaPath,
    `${JSON.stringify(sqliteJournal, null, 2)}\n`,
    "utf8",
  );
}

syncSqliteMigrations().catch((error) => {
  console.error("Failed to sync sqlite migrations", error);
  process.exitCode = 1;
});
