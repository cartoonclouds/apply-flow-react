import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
} from "drizzle-orm/pg-core";

import {
  nullableTemporalTimestamp,
  temporalTimestamp,
} from "../custom-types/temporalTimestamp";
import { companies } from "./companies";
import { attendanceTypeEnum, employmentTypeEnum } from "./enums";

export const applications = pgTable("applications", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  url: text("url"),
  appliedAt: temporalTimestamp("applied_at")
    .notNull()
    .default(sql`now()`),
  locationText: text("location_text"),
  locationLat: doublePrecision("location_lat"),
  locationLng: doublePrecision("location_lng"),
  attendanceType: attendanceTypeEnum("attendance_type"),
  employmentType: employmentTypeEnum("employment_type"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  currency: text("currency"),
  description: text("description"),
  interviewProcess: text("interview_process"),
  benefits: text("benefits"),
  priority: integer("priority").notNull().default(3),
  isArchived: boolean("is_archived").notNull().default(false),
  deletedAt: nullableTemporalTimestamp("deleted_at"),
  createdAt: temporalTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: temporalTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});
