import type { Application } from "@/modules/applications/types";
import type { Company } from "@/modules/companies/types";
import type { Temporal } from "@js-temporal/polyfill";

/**
 * All mutable data fields shared across contact read and write models,
 * excluding system-managed identifiers and audit timestamps.
 */
export interface Contact {
  /** Unique contact identifier. */
  id?: string;
  /** Full name of the contact. */
  fullName: string;
  /** Email address, when available. */
  email: string | null;
  /** Phone number, when available. */
  phone: string | null;
  /** LinkedIn profile URL, when available. */
  linkedinUrl: string | null;
  /** Contact category. */
  type: ContactType;
  /** Related company, when available. */
  company?: Company | null;
  /** Related applications, when available. */
  applications?: Application[];
  /** Free-form notes about the contact. */
  notes: string | null;
  /** Associated tag identifiers. */
  tagIds?: string[];
  /** Creation timestamp. */
  createdAt: Temporal.PlainDateTime;
  /** Last update timestamp. */
  updatedAt: Temporal.PlainDateTime;
}
