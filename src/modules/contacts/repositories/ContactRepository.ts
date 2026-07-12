import type { DrizzleAppDatabase } from "@/db";
import * as schema from "@/db/schema";
import { mapDefined } from "@/lib/map-defined";
import { Repository } from "@/types";
import { eq } from "drizzle-orm";
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
      where: eq(schema.contacts.id, id),
      with: {
        company: true,
        applications: {
          with: {
            application: true,
          },
        },
      },
    });

    if (!row) {
      return null;
    }

    return {
      ...row,
      company: row.company,
      applications: mapDefined(
        row.applications,
        (relation) => relation.application,
      ),
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
        applications: {
          with: {
            application: true,
          },
        },
      },
    });

    return contactRows.map((row) => ({
      ...row,
      company: row.company,
      applications: mapDefined(
        row.applications,
        (relation) => relation.application,
      ),
    }));
  }
}
