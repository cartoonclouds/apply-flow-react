import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";
import { temporalTimestamp } from "./custom-types/temporalTimestamp";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const contactTypeEnum = pgEnum("contact_type", ["company", "recruiter"]);
export const attendanceTypeEnum = pgEnum("attendance_type", [
  "remote",
  "hybrid",
  "on-site",
]);
export const employmentTypeEnum = pgEnum("employment_type", [
  "part-time",
  "contract",
  "internship",
  "full-time",
  "volunteer",
]);

// ─── companies ───────────────────────────────────────────────────────────────

export const companies = pgTable("companies", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  websiteUrl: text("website_url"),
  linkedinUrl: text("linkedin_url"),
  industry: text("industry"),
  size: text("size"),
  locationText: text("location_text"),
  locationLat: doublePrecision("location_lat"),
  locationLng: doublePrecision("location_lng"),
  notes: text("notes"),
  createdAt: temporalTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: temporalTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// ─── contacts ────────────────────────────────────────────────────────────────

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  linkedinUrl: text("linkedin_url"),
  type: contactTypeEnum("type").notNull(),
  locationText: text("location_text"),
  locationLat: doublePrecision("location_lat"),
  locationLng: doublePrecision("location_lng"),
  notes: text("notes"),
  createdAt: temporalTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: temporalTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// ─── applications ────────────────────────────────────────────────────────────

export const applications = pgTable("applications", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  url: text("url"),
  appliedAt: temporalTimestamp("applied_at")
    .notNull()
    .default(sql`now()`),
  locationText: text("location_text"),
  locationLat: doublePrecision("location_lat"),
  locationLng: doublePrecision("location_lng"),
  attendanceType: attendanceTypeEnum("attendance_type"),
  employmentType: employmentTypeEnum("employment_type"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  currency: text("currency"),
  description: text("description"),
  interviewProcess: text("interview_process"),
  benefits: text("benefits"),
  priority: integer("priority").notNull().default(3),
  isArchived: boolean("is_archived").notNull().default(false),
  deletedAt: temporalTimestamp("deleted_at"),
  createdAt: temporalTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: temporalTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// ─── documents ───────────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  kind: text("kind").notNull(),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  checksum: text("checksum"),
  createdAt: temporalTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: temporalTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// ─── application_documents (junction) ────────────────────────────────────────

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

// ─── application_contacts (junction) ─────────────────────────────────────────

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

// ─── Relations ────────────────────────────────────────────────────────────────

export const companiesRelations = relations(companies, ({ many }) => ({
  contacts: many(contacts),
  applications: many(applications),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  applicationContacts: many(applicationContacts),
}));

export const applicationsRelations = relations(
  applications,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [applications.companyId],
      references: [companies.id],
    }),
    applicationDocuments: many(applicationDocuments),
    applicationContacts: many(applicationContacts),
  }),
);

export const documentsRelations = relations(documents, ({ many }) => ({
  applicationDocuments: many(applicationDocuments),
}));

export const applicationDocumentsRelations = relations(
  applicationDocuments,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationDocuments.applicationId],
      references: [applications.id],
    }),
    document: one(documents, {
      fields: [applicationDocuments.documentId],
      references: [documents.id],
    }),
  }),
);

export const applicationContactsRelations = relations(
  applicationContacts,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationContacts.applicationId],
      references: [applications.id],
    }),
    contact: one(contacts, {
      fields: [applicationContacts.contactId],
      references: [contacts.id],
    }),
  }),
);
