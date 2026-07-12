import type { DrizzleAppDatabase } from "@/db";
import * as schema from "@/db/schema";
import { mapDefined, mapToId, pluck } from "@/lib/map-defined";
import { Repository } from "@/types";
import { inArray } from "drizzle-orm";
import type { Contact, NewContactRow } from "../types";

export class ContactRepository implements Repository<
  Contact,
  NewContactRow,
  Partial<NewContactRow>,
  string
> {
  constructor(private readonly db: DrizzleAppDatabase) {}

  get(_id: string): Promise<Contact | null> {
    throw new Error("Method not implemented.");
  }

  create(_data: NewContactRow): Promise<Contact> {
    throw new Error("Method not implemented.");
  }

  update(_id: string, _data: Partial<NewContactRow>): Promise<Contact> {
    throw new Error("Method not implemented.");
  }

  delete(_id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async list(): Promise<Contact[]> {
    const contactRows = await this.db.query.contacts.findMany();

    if (contactRows.length === 0) {
      return [];
    }

    const companyIds = mapDefined(contactRows, (row) => row.companyId);
    const contactIds = pluck(contactRows, "id");

    const [companyRows, applicationContactRows] = await Promise.all([
      companyIds.length
        ? this.db.query.companies.findMany({
            where: inArray(schema.companies.id, companyIds),
          })
        : Promise.resolve([]),
      this.db.query.applicationContacts.findMany({
        where: inArray(schema.applicationContacts.contactId, contactIds),
      }),
    ]);

    const applicationIds = pluck(applicationContactRows, "applicationId");
    const applicationRows = applicationIds.length
      ? await this.db.query.applications.findMany({
          where: inArray(schema.applications.id, applicationIds),
        })
      : [];

    const companiesById = mapToId(companyRows);
    const applicationsById = mapToId(applicationRows);

    const applicationsByContactId = new Map<string, Contact["applications"]>();
    for (const relation of applicationContactRows) {
      const application = applicationsById.get(relation.applicationId);
      if (!application) {
        continue;
      }

      const existing = applicationsByContactId.get(relation.contactId) ?? [];
      existing.push(application);
      applicationsByContactId.set(relation.contactId, existing);
    }

    return contactRows.map((row) => ({
      ...row,
      company: row.companyId
        ? (companiesById.get(row.companyId) ?? null)
        : null,
      applications: applicationsByContactId.get(row.id) ?? [],
    }));
  }
}
