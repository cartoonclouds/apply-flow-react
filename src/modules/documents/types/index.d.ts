import type { Application } from "@/modules/applications/types";
import type { Temporal } from "@js-temporal/polyfill";

export interface Document {
  /** Unique document identifier. */
  id?: string;
  /** Document title. */
  title: string;
  /** Document kind/category. */
  kind: string;
  /** Storage path for the document file. */
  filePath: string;
  /** MIME type, when available. */
  mimeType: string | null;
  /** File size in bytes, when available. */
  sizeBytes: number | null;
  /** Content checksum, when available. */
  checksum: string | null;
  /** Related applications, when available. */
  applications?: Application[];
  /** Creation timestamp. */
  createdAt: Temporal.PlainDateTime;
  /** Last update timestamp. */
  updatedAt: Temporal.PlainDateTime;
}
