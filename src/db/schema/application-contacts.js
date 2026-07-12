import { sql } from "drizzle-orm";
import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";

import { temporalTimestamp } from "../custom-types/temporalTimestamp.ts";
import { applications } from "./applications.js";
import { contacts } from "./contacts.js";

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
  (t) => [primaryKey({ columns: [t.applicationId, t.contactId] })],
);
