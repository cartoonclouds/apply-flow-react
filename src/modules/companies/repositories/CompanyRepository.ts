import type { DrizzleAppDatabase } from "@/db";
import * as schema from "@/db/schema";
import { Repository } from "@/types";
import { inArray } from "drizzle-orm";
import type { Company, NewCompanyRow } from "../types";

export class CompanyRepository implements Repository<
  Company,
  NewCompanyRow,
  Partial<NewCompanyRow>,
  string
> {
  constructor(private readonly db: DrizzleAppDatabase) {}

  get(_id: string): Promise<Company | null> {
    throw new Error("Method not implemented.");
  }

  create(_data: NewCompanyRow): Promise<Company> {
    throw new Error("Method not implemented.");
  }

  update(_id: string, _data: Partial<NewCompanyRow>): Promise<Company> {
    throw new Error("Method not implemented.");
  }

  delete(_id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async list(): Promise<Company[]> {
    const companyRows = await this.db.query.companies.findMany();

    if (companyRows.length === 0) {
      return [];
    }

    const companyIds = companyRows.map((row) => row.id);
    const [contactRows, applicationRows] = await Promise.all([
      this.db.query.contacts.findMany({
        where: inArray(schema.contacts.companyId, companyIds),
      }),
      this.db.query.applications.findMany({
        where: inArray(schema.applications.companyId, companyIds),
      }),
    ]);

    const contactsByCompanyId = new Map<string, Company["contacts"]>();
    for (const contact of contactRows) {
      if (!contact.companyId) {
        continue;
      }

      const existing = contactsByCompanyId.get(contact.companyId) ?? [];
      existing.push(contact);
      contactsByCompanyId.set(contact.companyId, existing);
    }

    const applicationsByCompanyId = new Map<string, Company["applications"]>();
    for (const application of applicationRows) {
      if (!application.companyId) {
        continue;
      }

      const existing = applicationsByCompanyId.get(application.companyId) ?? [];
      existing.push(application);
      applicationsByCompanyId.set(application.companyId, existing);
    }

    return companyRows.map((row) => ({
      ...row,
      contacts: contactsByCompanyId.get(row.id) ?? [],
      applications: applicationsByCompanyId.get(row.id) ?? [],
    }));
  }
}
