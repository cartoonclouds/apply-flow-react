import { pgEnum } from "drizzle-orm/pg-core";

export const contactTypeEnum = pgEnum("contact_type", ["company", "recruiter"]);

export const attendanceTypeEnum = pgEnum("attendance_type", [
  "remote",
  "hybrid",
  "on-site",
]);

export const employmentTypeEnum = pgEnum("employment_type", [
  "part-time",
  "contract",
  "internship",
  "full-time",
  "volunteer",
]);
