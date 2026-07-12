import { sql } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

import { temporalTimestamp } from "../custom-types/temporalTimestamp.ts";

export const documents = pgTable("documents", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  kind: text("kind").notNull(),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  checksum: text("checksum"),
  createdAt: temporalTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: temporalTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});
