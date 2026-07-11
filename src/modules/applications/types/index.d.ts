import type { applications } from "@/db/schema";
import type { Company } from "@/modules/companies/types";
import type { Contact } from "@/modules/contacts/types";
import type { Document } from "@/modules/documents/types";

export type ApplicationRow = typeof applications.$inferSelect;
export type NewApplicationRow = typeof applications.$inferInsert;

export type Application = ApplicationRow & {
  company?: Company | null;
  contacts?: Contact[];
  documents?: Document[];
};
