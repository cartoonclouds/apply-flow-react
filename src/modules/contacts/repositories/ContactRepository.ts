import type { DrizzleAppDatabase } from "@/db";
import { Repository } from "@/types";
import type { Contact, NewContactRow } from "../types";

export class ContactRepository implements Repository<
  Contact,
  NewContactRow,
  Partial<NewContactRow>,
  string
> {
  constructor(private readonly db: DrizzleAppDatabase) {}

  public async get(id: string): Promise<Contact | null> {
    const row = await this.db.query.contacts.findFirst({
      where: { id },
      with: {
        company: true,
        applications: true,
      },
    });

    if (!row) {
      return null;
    }

    return {
      ...row,
      company: row.company,
      applications: row.applications,
    };
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
    const contactRows = await this.db.query.contacts.findMany({
      with: {
        company: true,
        applications: true,
      },
    });

    return contactRows.map((row) => ({
      ...row,
      company: row.company,
      applications: row.applications,
    }));
  }
}
