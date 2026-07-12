export type DbMode = "indexeddb" | "tauri-sqlite";

export const DEFAULT_DB_NAME = "apply-flow";
export const SQLITE_MIGRATIONS_TABLE = "__drizzle_migrations";
export const TAURI_SQLITE_PATH = `./${DEFAULT_DB_NAME}.sqlite`;

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function getDatabaseMode(): DbMode {
  return isTauriRuntime() ? "tauri-sqlite" : "indexeddb";
}

export async function invokeTauri<T = unknown>(
  command: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, payload);
}

export async function executeSqlite(
  path: string,
  sql: string,
  params: unknown[] = [],
) {
  return invokeTauri<{
    columns?: string[];
    rows?: Record<string, unknown>[];
    values?: unknown[][];
    rowsAffected?: number;
  }>("execute_sqlite_query", {
    path,
    sql,
    params,
  });
}

export async function deleteSqliteDatabase(path: string): Promise<void> {
  await invokeTauri("delete_sqlite_database", {
    path,
  });
}

export function deleteIndexedDbDatabase(name: string): Promise<void> {
  if (typeof indexedDB === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onerror = () =>
      reject(request.error || new Error(`Failed to delete database ${name}`));
    request.onblocked = () => resolve();
    request.onsuccess = () => resolve();
  });
}
