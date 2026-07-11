import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzleSqliteProxy } from "drizzle-orm/sqlite-proxy";
import { migrateTauriSqliteDatabase } from "./migrate";
import {
    executeSqlite,
    getDatabaseMode,
    getDatabaseName,
    getTauriSqlitePath,
    invokeTauri,
    isTauriRuntime,
} from "./runtime";
import * as schema from "./schema/index.js";

const databaseName = getDatabaseName();
const dbMode = getDatabaseMode();

function createIndexedDbClient() {
  return new PGlite(`idb://${databaseName}`);
}

function createTauriSqliteDb() {
  const tauriSqlitePath = getTauriSqlitePath();

  if (!tauriSqlitePath) {
    throw new Error(
      "VITE_TAURI_SQLITE_PATH is required when VITE_DB_DRIVER=tauri-sqlite",
    );
  }

  if (!isTauriRuntime()) {
    throw new Error(
      "VITE_DB_DRIVER=tauri-sqlite requires the Tauri runtime (desktop app)",
    );
  }

  return drizzleSqliteProxy(
    async (sql, params) => {
      const result = await executeSqlite(tauriSqlitePath, sql, params);

      return {
        rows: result?.rows ?? [],
      };
    },
    { schema },
  );
}

const useTauriSqlite = dbMode === "tauri-sqlite";

export { dbMode };

export const client = useTauriSqlite ? null : createIndexedDbClient();

export const db = useTauriSqlite
  ? createTauriSqliteDb()
  : drizzlePglite(client, { schema });

export async function verifyDatabaseConnection() {
  if (!useTauriSqlite) {
    return;
  }

  const tauriSqlitePath = getTauriSqlitePath();

  await invokeTauri("read_sqlite_database", {
    path: tauriSqlitePath,
  });

  await migrateTauriSqliteDatabase(tauriSqlitePath);

  await executeSqlite(tauriSqlitePath, "SELECT 1 AS healthy", []);
}
