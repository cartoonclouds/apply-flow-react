import * as schema from "@/db/schema";
import { Repository } from "@/types";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { Application, NewApplicationRow } from "../types";

export class ApplicationRepository implements Repository<
  Application,
  NewApplicationRow,
  Partial<NewApplicationRow>,
  string
> {
  constructor(private readonly db: PgliteDatabase<typeof schema>) {}

  get(id: string): Promise<Application | null> {
    throw new Error("Method not implemented.");
  }

  create(data: NewApplicationRow): Promise<Application> {
    throw new Error("Method not implemented.");
  }

  update(id: string, data: Partial<NewApplicationRow>): Promise<Application> {
    throw new Error("Method not implemented.");
  }

  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async list(): Promise<Application[]> {
    const rows = await this.db.query.applications.findMany({
      with: {
        company: true,
        applicationContacts: {
          with: {
            contact: true,
          },
        },
        applicationDocuments: {
          with: {
            document: true,
          },
        },
      },
    });

    return rows.map((row) => ({
      ...row,
      attendanceType: row.attendanceType as Application["attendanceType"],
      employmentType: row.employmentType as Application["employmentType"],
      company: row.company,
      contacts: row.applicationContacts.map((relation) => relation.contact),
      documents: row.applicationDocuments.map((relation) => relation.document),
    }));
  }
}
