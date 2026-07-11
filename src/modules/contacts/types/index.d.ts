import type { contacts } from "@/db/schema";
import type { Application } from "@/modules/applications/types";
import type { Company } from "@/modules/companies/types";

export type ContactRow = typeof contacts.$inferSelect;
export type NewContactRow = typeof contacts.$inferInsert;
export type ContactType = ContactRow["type"];

export type Contact = ContactRow & {
  company?: Company | null;
  applications?: Application[];
};
