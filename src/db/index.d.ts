import type { PGlite } from "@electric-sql/pglite";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import type * as schema from "./schema";

export type DrizzleAppDatabase =
  | PgliteDatabase<typeof schema>
  | SqliteRemoteDatabase<typeof schema>;

export const dbMode: "indexeddb" | "tauri-sqlite";
export const client: PGlite | null;
export const db: DrizzleAppDatabase;
export function verifyDatabaseConnection(): Promise<void>;
export function resetDatabase(): Promise<void>;
