import { seed } from "drizzle-seed";

function countRelationsForApplication(index: number): number {
  return (index % 3) + 1;
}

export async function seedRelationships(
  db: unknown,
  schema: unknown,
): Promise<void> {
  const typedSchema = schema as {
    applications?: any;
    contacts?: any;
    documents?: any;
    applicationContacts?: any;
    applicationDocuments?: any;
  };

  const applications = typedSchema.applications;
  const contacts = typedSchema.contacts;
  const documents = typedSchema.documents;
  const applicationContacts = typedSchema.applicationContacts;
  const applicationDocuments = typedSchema.applicationDocuments;

  if (
    !applications ||
    !contacts ||
    !documents ||
    !applicationContacts ||
    !applicationDocuments
  ) {
    throw new Error(
      "relationship seeding requires applications, contacts, documents, and junction tables",
    );
  }

  const applicationRows: Array<{ id: string; companyId: string | null }> =
    await (db as any)
      .select({ id: applications.id, companyId: applications.companyId })
      .from(applications);
  const contactRows: Array<{ id: string; companyId: string | null }> = await (
    db as any
  )
    .select({ id: contacts.id, companyId: contacts.companyId })
    .from(contacts);
  const documentRows: Array<{ id: string }> = await (db as any)
    .select({ id: documents.id })
    .from(documents);

  const contactsByCompanyId = new Map<string, string[]>();

  for (const contact of contactRows) {
    if (!contact.companyId) {
      continue;
    }

    const current = contactsByCompanyId.get(contact.companyId) ?? [];
    current.push(contact.id);
    contactsByCompanyId.set(contact.companyId, current);
  }

  const applicationContactRows: Array<{
    applicationId: string;
    contactId: string;
  }> = [];

  applicationRows.forEach(
    (application: { id: string; companyId: string | null }, index: number) => {
      if (!application.companyId) {
        return;
      }

      const companyContacts =
        contactsByCompanyId.get(application.companyId) ?? [];

      if (companyContacts.length === 0) {
        return;
      }

      const relationCount = Math.min(
        countRelationsForApplication(index),
        companyContacts.length,
      );

      for (
        let relationIndex = 0;
        relationIndex < relationCount;
        relationIndex += 1
      ) {
        applicationContactRows.push({
          applicationId: application.id,
          contactId:
            companyContacts[(index + relationIndex) % companyContacts.length],
        });
      }
    },
  );

  for (const relation of applicationContactRows) {
    await (
      seed(db as any, { applicationContacts } as any, { count: 1 }) as any
    ).refine((funcs: any) => ({
      applicationContacts: {
        columns: {
          applicationId: funcs.default({
            defaultValue: relation.applicationId,
          }),
          contactId: funcs.default({ defaultValue: relation.contactId }),
          relationType: funcs.default({ defaultValue: "owner" }),
          createdAt: funcs.timestamp(),
        },
      },
    }));
  }

  if (documentRows.length === 0) {
    return;
  }

  const applicationDocumentRows = applicationRows.map(
    (application: { id: string }, index: number) => ({
      applicationId: application.id,
      documentId: documentRows[index % documentRows.length].id,
    }),
  );

  for (const relation of applicationDocumentRows) {
    await (
      seed(db as any, { applicationDocuments } as any, { count: 1 }) as any
    ).refine((funcs: any) => ({
      applicationDocuments: {
        columns: {
          applicationId: funcs.default({
            defaultValue: relation.applicationId,
          }),
          documentId: funcs.default({ defaultValue: relation.documentId }),
          relationType: funcs.default({ defaultValue: "attachment" }),
          createdAt: funcs.timestamp(),
        },
      },
    }));
  }
}
