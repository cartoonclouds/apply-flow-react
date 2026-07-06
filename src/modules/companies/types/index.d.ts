
/**
 * Supported contact categories.
 */
export type ContactType = "company" | "recruiter";

export interface Company {
  /** Unique company identifier. */
  id?: string;
  /** Company name. */
  name: string;
  /** Company website URL, when available. */
  websiteUrl: string | null;
  /** LinkedIn company URL, when available. */
  linkedinUrl: string | null;
  /** Industry classification, when available. */
  industry: string | null;
  /** Company size descriptor, when available. */
  size: string | null;
  /** Additional notes about the company. */
  notes: string | null;
  /** Associated tag identifiers. */
  tagIds: string[];
  /** Free-form location text. */
  locationText: string | null;
  /** Latitude for geocoded location data. */
  locationLat: number | null;
  /** Longitude for geocoded location data. */
  locationLng: number | null;
  /** Creation timestamp. */
  createdAt: Temporal.PlainDateTime;
  /** Last update timestamp. */
  updatedAt: Temporal.PlainDateTime;
}
