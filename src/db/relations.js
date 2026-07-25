import { defineRelations } from "drizzle-orm";

import { applicationContacts } from "./schema/application-contacts.js";
import { applicationDocuments } from "./schema/application-documents.js";
import { applicationStages } from "./schema/application-stages.js";
import { applications } from "./schema/applications.js";
import { companies } from "./schema/companies.js";
import { contacts } from "./schema/contacts.js";
import { documents } from "./schema/documents.js";

const schema = {
  applicationContacts,
  applicationDocuments,
  applicationStages,
  applications,
  companies,
  contacts,
  documents,
};

export const relations = defineRelations(schema, (r) => ({
  companies: {
    contacts: r.many.contacts({
      from: r.companies.id,
      to: r.contacts.companyId,
    }),
    applications: r.many.applications({
      from: r.companies.id,
      to: r.applications.companyId,
    }),
  },
  contacts: {
    company: r.one.companies({
      from: r.contacts.companyId,
      to: r.companies.id,
    }),
    applications: r.many.applications({
      from: r.contacts.id.through(r.applicationContacts.contactId),
      to: r.applications.id.through(r.applicationContacts.applicationId),
    }),
  },
  applications: {
    stage: r.one.applicationStages({
      from: r.applications.stageId,
      to: r.applicationStages.id,
    }),
    company: r.one.companies({
      from: r.applications.companyId,
      to: r.companies.id,
    }),
    contacts: r.many.contacts({
      from: r.applications.id.through(r.applicationContacts.applicationId),
      to: r.contacts.id.through(r.applicationContacts.contactId),
    }),
    documents: r.many.documents({
      from: r.applications.id.through(r.applicationDocuments.applicationId),
      to: r.documents.id.through(r.applicationDocuments.documentId),
    }),
  },
  documents: {
    applications: r.many.applications({
      from: r.documents.id.through(r.applicationDocuments.documentId),
      to: r.applications.id.through(r.applicationDocuments.applicationId),
    }),
  },
  applicationStages: {
    applications: r.many.applications({
      from: r.applicationStages.id,
      to: r.applications.stageId,
    }),
  },
  applicationContacts: {
    application: r.one.applications({
      from: r.applicationContacts.applicationId,
      to: r.applications.id,
      optional: false,
    }),
    contact: r.one.contacts({
      from: r.applicationContacts.contactId,
      to: r.contacts.id,
      optional: false,
    }),
  },
  applicationDocuments: {
    application: r.one.applications({
      from: r.applicationDocuments.applicationId,
      to: r.applications.id,
      optional: false,
    }),
    document: r.one.documents({
      from: r.applicationDocuments.documentId,
      to: r.documents.id,
      optional: false,
    }),
  },
}));
