import type { PGlite } from "@electric-sql/pglite";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { relations } from "./relations";

type AppDatabaseSurface = Pick<
  PgliteDatabase<typeof relations>,
  "query" | "insert" | "update" | "delete"
>;

export type DrizzleAppDatabase = AppDatabaseSurface;

export const dbMode: "indexeddb" | "tauri-sqlite";
export const client: PGlite | null;
export const db: DrizzleAppDatabase;
export function verifyDatabaseConnection(): Promise<void>;
export function resetDatabase(): Promise<void>;
