import { sql } from "drizzle-orm";
import { doublePrecision, pgTable, text } from "drizzle-orm/pg-core";

import { temporalTimestamp } from "../custom-types/temporalTimestamp";

export const companies = pgTable("companies", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  websiteUrl: text("website_url"),
  linkedinUrl: text("linkedin_url"),
  industry: text("industry"),
  size: text("size"),
  locationText: text("location_text"),
  locationLat: doublePrecision("location_lat"),
  locationLng: doublePrecision("location_lng"),
  notes: text("notes"),
  createdAt: temporalTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: temporalTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});
