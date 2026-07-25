import { sql } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

import { temporalTimestamp } from "../custom-types/temporalTimestamp.ts";

export const applicationStages = pgTable("application_stages", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  createdAt: temporalTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: temporalTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});
