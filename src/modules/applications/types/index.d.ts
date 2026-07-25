import type { applications, applicationStages } from "@/db/schema";
import type { Company } from "@/modules/companies/types";
import type { Contact } from "@/modules/contacts/types";
import type { Document } from "@/modules/documents/types";

export type ApplicationStage = typeof applicationStages.$inferSelect;

export type ApplicationRow = typeof applications.$inferSelect;
export type NewApplicationRow = typeof applications.$inferInsert;

export type Application = ApplicationRow & {
  stage?: ApplicationStage | null;
  company?: Company | null;
  contacts?: Contact[];
  documents?: Document[];
};
