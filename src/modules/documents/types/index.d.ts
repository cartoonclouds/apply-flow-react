import type { documents } from "@/db/schema";
import type { Application } from "@/modules/applications/types";

export type DocumentRow = typeof documents.$inferSelect;
export type NewDocumentRow = typeof documents.$inferInsert;

export type Document = DocumentRow & {
  applications?: Application[];
};
