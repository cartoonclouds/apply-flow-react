import { relations } from "drizzle-orm";

import { applicationContacts } from "./application-contacts";
import { applicationDocuments } from "./application-documents";
import { applications } from "./applications";
import { companies } from "./companies";
import { contacts } from "./contacts";
import { documents } from "./documents";

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
