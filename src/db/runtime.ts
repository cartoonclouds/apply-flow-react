export type DbMode = "indexeddb" | "tauri-sqlite";

export const SQLITE_MIGRATIONS_TABLE = "__drizzle_migrations";

const DEFAULT_DB_NAME = "jaa-react";

function getEnvValue(key: keyof ImportMetaEnv): string | undefined {
  return import.meta.env?.[key];
}

export function getDatabaseName(): string {
  return getEnvValue("VITE_DATABASE_NAME") || DEFAULT_DB_NAME;
}

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function getDatabaseMode(): DbMode {
  const configured = getEnvValue("VITE_DB_DRIVER")?.toLowerCase();

  if (configured === "tauri-sqlite" || configured === "indexeddb") {
    return configured;
  }

  return isTauriRuntime() ? "tauri-sqlite" : "indexeddb";
}

export function getTauriSqlitePath(): string {
  const path = getEnvValue("VITE_TAURI_SQLITE_PATH")?.trim();

  if (!path) {
    throw new Error(
      "VITE_TAURI_SQLITE_PATH is required when using Tauri SQLite mode.",
    );
  }

  return path;
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
    rowsAffected?: number;
  }>("execute_sqlite_query", {
    path,
    sql,
    params,
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
