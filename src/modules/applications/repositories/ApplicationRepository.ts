import * as schema from "@/db/schema";
import { Repository } from "@/types";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { Application } from "../types";

export class ApplicationRepository implements Repository<Application> {
  constructor(private readonly db: PgliteDatabase<typeof schema>) {}

  get(id: number): Promise<Application | null> {
    throw new Error("Method not implemented.");
  }

  create(data: Partial<Application>): Promise<Application> {
    throw new Error("Method not implemented.");
  }

  update(id: number, data: Partial<Application>): Promise<Application> {
    throw new Error("Method not implemented.");
  }

  delete(id: number): Promise<void> {
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
