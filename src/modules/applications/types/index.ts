import type { Temporal } from "@js-temporal/polyfill";

export type ApplicationAttendanceType = "remote" | "hybrid" | "on-site";

export type ApplicationEmploymentType =
  | "part-time"
  | "contract"
  | "internship"
  | "full-time"
  | "volunteer";

export interface Application {
  /** Unique application identifier. */
  id?: string;
  /** Related company identifier, when available. */
  companyId: string | null;
  /** Application title. */
  title: string;
  /** URL where the application was discovered, when available. */
  url: string | null;
  /** Application submission date, when available. */
  appliedAt: Temporal.PlainDateTime | null;
  /** Preferred attendance mode, when known. */
  attendanceType: ApplicationAttendanceType | null;
  /** Employment type, when known. */
  employmentType: ApplicationEmploymentType | null;
  /** Minimum salary expectation. */
  salaryMin: number | null;
  /** Maximum salary expectation. */
  salaryMax: number | null;
  /** Preferred salary currency code. */
  currency: string | null;
  /** Free-form description or notes. */
  description: string | null;
  /** Notes about the interview process. */
  interviewProcess: string | null;
  /** Additional benefits or compensation notes. */
  benefits: string | null;
  /** Whether the application has been archived. */
  isArchived: boolean;
  /** Free-form location text. */
  locationText: string | null;
  /** Latitude for geocoded location data. */
  locationLat: number | null;
  /** Longitude for geocoded location data. */
  locationLng: number | null;
  /** Whether the application has been soft-deleted. */
  deletedAt: Temporal.PlainDateTime | null;
  /** Creation timestamp. */
  createdAt: Temporal.PlainDateTime;
  /** Last update timestamp. */
  updatedAt: Temporal.PlainDateTime;
}
