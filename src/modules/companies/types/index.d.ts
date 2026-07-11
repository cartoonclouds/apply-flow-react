import type { companies } from "@/db/schema";
import type { Application } from "@/modules/applications/types";
import type { Contact } from "@/modules/contacts/types";

export type CompanyRow = typeof companies.$inferSelect;
export type NewCompanyRow = typeof companies.$inferInsert;

export type Company = CompanyRow & {
  contacts?: Contact[];
  applications?: Application[];
};
