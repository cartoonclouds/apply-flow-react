import { mapDefined } from "@/lib/map-defined";
import type { PgliteDatabase } from "drizzle-orm/pglite";
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

const browserMigrationModules = import.meta.glob(
  "../../drizzle/*/migration.sql",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

const sqliteMigrationModules = import.meta.glob(
  "../../drizzle-sqlite/*/migration.sql",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

function getOrderedMigrations(modules: Record<string, string>) {
  return Object.entries(modules)
    .map(([modulePath, sqlText]) => {
      const hash = modulePath.split("/").at(-2);

      if (!hash) {
        throw new Error(`Invalid migration module path: ${modulePath}`);
      }

      return {
        hash,
        sqlText,
      };
    })
    .sort((left, right) => left.hash.localeCompare(right.hash));
}

function getMigrationOrderValue(hash: string, index: number) {
  const sortablePrefix = hash.split("_")[0];
  const parsedPrefix = Number.parseInt(sortablePrefix || "", 10);

  return Number.isNaN(parsedPrefix) ? index + 1 : parsedPrefix;
}

function splitMigrationStatements(sqlText: string): string[] {
  return mapDefined(sqlText.split("--> statement-breakpoint"), (statement) => {
    const trimmed = statement.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });
}

function getBrowserMigrations() {
  return getOrderedMigrations(browserMigrationModules).map(
    ({ hash, sqlText }, index) => ({
      sql: splitMigrationStatements(sqlText),
      bps: false,
      folderMillis: getMigrationOrderValue(hash, index),
      hash,
    }),
  );
}

function getSqliteMigrations() {
  return getOrderedMigrations(sqliteMigrationModules).map(
    ({ hash, sqlText }) => ({
      hash,
      statements: splitMigrationStatements(sqlText),
    }),
  );
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
}
