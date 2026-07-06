import { sql } from "drizzle-orm";
import { doublePrecision, pgTable, text } from "drizzle-orm/pg-core";

import { temporalTimestamp } from "../custom-types/temporalTimestamp";
import { companies } from "./companies";
import { contactTypeEnum } from "./enums";

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  linkedinUrl: text("linkedin_url"),
  type: contactTypeEnum("type").notNull(),
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
