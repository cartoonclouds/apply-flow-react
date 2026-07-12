import type { DrizzleAppDatabase } from "@/db";
import { Repository } from "@/types";
import type { Company, NewCompanyRow } from "../types";

export class CompanyRepository implements Repository<
  Company,
  NewCompanyRow,
  Partial<NewCompanyRow>,
  string
> {
  constructor(private readonly db: DrizzleAppDatabase) {}

  public async get(id: string): Promise<Company | null> {
    const row = await this.db.query.companies.findFirst({
      where: { id },
      with: {
        contacts: true,
        applications: true,
      },
    });

    if (!row) {
      return null;
    }

    return {
      ...row,
      contacts: row.contacts,
      applications: row.applications,
    };
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
    const companyRows = await this.db.query.companies.findMany({
      with: {
        contacts: true,
        applications: true,
      },
    });

    return companyRows.map((row) => ({
      ...row,
      contacts: row.contacts,
      applications: row.applications,
    }));
  }
}
