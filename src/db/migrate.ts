import type { PgliteDatabase } from "drizzle-orm/pglite";
import journal from "../../drizzle/meta/_journal.json";

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

const browserMigrationModules = import.meta.glob("../../drizzle/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function getBrowserMigrations() {
  return journal.entries.map((entry) => {
    const migrationPath = `../../drizzle/${entry.tag}.sql`;
    const sqlText = browserMigrationModules[migrationPath];

    if (!sqlText) {
      throw new Error(`Missing migration SQL file: ${migrationPath}`);
    }

    return {
      sql: sqlText
        .split("--> statement-breakpoint")
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0),
      bps: entry.breakpoints,
      folderMillis: entry.when,
      hash: entry.tag,
    };
  });
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
