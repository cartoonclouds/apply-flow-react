import { mapDefined } from "@/lib/map-defined";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import sqliteJournal from "../../drizzle-sqlite/meta/_journal.json";
import journal from "../../drizzle/meta/_journal.json";
import { SQLITE_MIGRATIONS_TABLE, executeSqlite } from "./runtime";

type BrowserMigratableDatabase = {
  dialect: {
    migrate: (
      migrations: unknown,
      session: unknown,
      config: unknown,
    ) => Promise<void>;
  };
  session: unknown;
};

const MIGRATIONS_FOLDER = "./drizzle";
const MIGRATIONS_TABLE = "__drizzle_migrations";
const MIGRATIONS_SCHEMA = "drizzle";
const SQLITE_RELATION_COMPATIBILITY_VIEWS = [
  ["companies_contacts", "contacts"],
  ["companies_applications", "applications"],
  ["contacts_applications", "application_contacts"],
  ["applications_contacts", "application_contacts"],
  ["applications_documents", "application_documents"],
  ["documents_application", "application_documents"],
] as const;

const browserMigrationModules = import.meta.glob("../../drizzle/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const sqliteMigrationModules = import.meta.glob("../../drizzle-sqlite/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function splitMigrationStatements(sqlText: string): string[] {
  return mapDefined(sqlText.split("--> statement-breakpoint"), (statement) => {
    const trimmed = statement.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });
}

function getBrowserMigrations() {
  return journal.entries.map((entry) => {
    const migrationPath = `../../drizzle/${entry.tag}.sql`;
    const sqlText = browserMigrationModules[migrationPath];

    if (!sqlText) {
      throw new Error(`Missing migration SQL file: ${migrationPath}`);
    }

    return {
      sql: splitMigrationStatements(sqlText),
      bps: entry.breakpoints,
      folderMillis: entry.when,
      hash: entry.tag,
    };
  });
}

function getSqliteMigrations() {
  return sqliteJournal.entries.map((entry) => {
    const migrationPath = `../../drizzle-sqlite/${entry.tag}.sql`;
    const sqlText = sqliteMigrationModules[migrationPath];

    if (!sqlText) {
      throw new Error(`Missing migration SQL file: ${migrationPath}`);
    }

    return {
      hash: entry.tag,
      statements: splitMigrationStatements(sqlText),
    };
  });
}

function isIgnorableSqliteMigrationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("already exists") ||
    message.includes("duplicate column name")
  );
}

export async function migratePgliteDatabase(
  db: PgliteDatabase<Record<string, never>>,
) {
  if (typeof window === "undefined") {
    const migratorModulePath = "drizzle-orm/pglite/migrator";
    const { migrate } = await import(/* @vite-ignore */ migratorModulePath);
    await migrate(db, {
      migrationsFolder: MIGRATIONS_FOLDER,
      migrationsTable: MIGRATIONS_TABLE,
      migrationsSchema: MIGRATIONS_SCHEMA,
    });
    return;
  }

  const migrations = getBrowserMigrations();
  const browserDb = db as unknown as BrowserMigratableDatabase;
  await browserDb.dialect.migrate(migrations, browserDb.session, {
    migrationsTable: MIGRATIONS_TABLE,
    migrationsSchema: MIGRATIONS_SCHEMA,
  });
}

async function ensureSqliteMigrationsTable(path: string) {
  await executeSqlite(
    path,
    `CREATE TABLE IF NOT EXISTS ${SQLITE_MIGRATIONS_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    [],
  );
}

async function getAppliedSqliteMigrationHashes(path: string) {
  const result = await executeSqlite(
    path,
    `SELECT hash FROM ${SQLITE_MIGRATIONS_TABLE};`,
    [],
  );

  return new Set((result?.rows || []).map((row) => String(row.hash)));
}

async function ensureSqliteRelationCompatibilityViews(path: string) {
  for (const [viewName, tableName] of SQLITE_RELATION_COMPATIBILITY_VIEWS) {
    await executeSqlite(
      path,
      `CREATE VIEW IF NOT EXISTS "${viewName}" AS SELECT * FROM "${tableName}";`,
      [],
    );
  }
}

export async function migrateTauriSqliteDatabase(path: string) {
  await ensureSqliteMigrationsTable(path);

  const appliedHashes = await getAppliedSqliteMigrationHashes(path);
  const migrations = getSqliteMigrations();

  for (const migration of migrations) {
    if (appliedHashes.has(migration.hash)) {
      continue;
    }

    for (const statement of migration.statements) {
      try {
        await executeSqlite(path, statement, []);
      } catch (error) {
        if (!isIgnorableSqliteMigrationError(error)) {
          throw error;
        }
      }
    }

    await executeSqlite(
      path,
      `INSERT INTO ${SQLITE_MIGRATIONS_TABLE} (hash) VALUES (?);`,
      [migration.hash],
    );
  }

  await ensureSqliteRelationCompatibilityViews(path);
}
