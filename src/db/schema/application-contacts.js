import { sql } from "drizzle-orm";
import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";

import { temporalTimestamp } from "../custom-types/temporalTimestamp";
import { applications } from "./applications";
import { contacts } from "./contacts";

export const applicationContacts = pgTable(
  "application_contacts",
  {
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    contactId: text("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    relationType: text("relation_type").notNull().default("owner"),
    createdAt: temporalTimestamp("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({ pk: primaryKey({ columns: [t.applicationId, t.contactId] }) }),
);
