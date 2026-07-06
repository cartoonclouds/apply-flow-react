import { sql } from "drizzle-orm";
import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";

import { temporalTimestamp } from "../custom-types/temporalTimestamp";
import { applications } from "./applications";
import { documents } from "./documents";

export const applicationDocuments = pgTable(
  "application_documents",
  {
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    relationType: text("relation_type").notNull().default("attachment"),
    createdAt: temporalTimestamp("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({ pk: primaryKey({ columns: [t.applicationId, t.documentId] }) }),
);
