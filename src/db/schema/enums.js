import { pgEnum } from "drizzle-orm/pg-core";
import {
  APPLICATION_ATTENDANCE_TYPE_VALUES,
  APPLICATION_EMPLOYMENT_TYPE_VALUES,
  CONTACT_TYPE_VALUES,
} from "../../constants/enum-values.js";

export const contactTypeEnum = pgEnum("contact_type", CONTACT_TYPE_VALUES);

export const attendanceTypeEnum = pgEnum(
  "attendance_type",
  APPLICATION_ATTENDANCE_TYPE_VALUES,
);

export const employmentTypeEnum = pgEnum(
  "employment_type",
  APPLICATION_EMPLOYMENT_TYPE_VALUES,
);
