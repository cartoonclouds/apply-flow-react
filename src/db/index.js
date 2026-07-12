import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzleSqliteProxy } from "drizzle-orm/sqlite-proxy";
import { migrateTauriSqliteDatabase } from "./migrate";
import { relations } from "./relations.js";
import {
  DEFAULT_DB_NAME,
  deleteIndexedDbDatabase,
  deleteSqliteDatabase,
  executeSqlite,
  getDatabaseMode,
  invokeTauri,
  isTauriRuntime,
  TAURI_SQLITE_PATH,
} from "./runtime";

const dbMode = getDatabaseMode();

function createIndexedDbClient() {
  return new PGlite(`idb://${DEFAULT_DB_NAME}`);
}

function createTauriSqliteDb() {
  if (!isTauriRuntime()) {
    throw new Error(
      "TAURI_SQLITE_PATH=tauri-sqlite requires the Tauri runtime (desktop app)",
    );
  }

  return drizzleSqliteProxy(
    async (sql, params, method) => {
      const result = await executeSqlite(TAURI_SQLITE_PATH, sql, params);

      if (method === "get") {
        return {
          rows: result?.values?.[0] ?? [],
        };
      }

      if (method === "all" || method === "values") {
        return {
          rows: result?.values ?? [],
        };
      }

      return {
        rows: [],
      };
    },
    { relations },
  );
}

const useTauriSqlite = dbMode === "tauri-sqlite";

export { dbMode };

export const client = useTauriSqlite ? null : createIndexedDbClient();

export const db = useTauriSqlite
  ? createTauriSqliteDb()
  : drizzlePglite(client, { relations });

export async function verifyDatabaseConnection() {
  if (!useTauriSqlite) {
    return;
  }

  await invokeTauri("read_sqlite_database", {
    path: TAURI_SQLITE_PATH,
  });

  await migrateTauriSqliteDatabase(TAURI_SQLITE_PATH);

  await executeSqlite(TAURI_SQLITE_PATH, "SELECT 1 AS healthy", []);
}

export async function resetDatabase() {
  if (useTauriSqlite) {
    await deleteSqliteDatabase(TAURI_SQLITE_PATH);
    return;
  }

  if (client && typeof client.close === "function") {
    await client.close();
  }

  await deleteIndexedDbDatabase(DEFAULT_DB_NAME);
}
