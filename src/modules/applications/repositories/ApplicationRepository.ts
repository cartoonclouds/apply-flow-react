import type { DrizzleAppDatabase } from "@/db";
import { Repository } from "@/types";
import type { Application, NewApplicationRow } from "../types";

export class ApplicationRepository implements Repository<
  Application,
  NewApplicationRow,
  Partial<NewApplicationRow>,
  string
> {
  constructor(private readonly db: DrizzleAppDatabase) {}

  get(_id: string): Promise<Application | null> {
    throw new Error("Method not implemented.");
  }

  create(_data: NewApplicationRow): Promise<Application> {
    throw new Error("Method not implemented.");
  }

  update(_id: string, _data: Partial<NewApplicationRow>): Promise<Application> {
    throw new Error("Method not implemented.");
  }

  delete(_id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async list(): Promise<Application[]> {
    const applicationRows = await this.db.query.applications.findMany({
      with: {
        company: true,
        contacts: {
          with: {
            contact: true,
          },
        },
        documents: {
          with: {
            document: true,
          },
        },
      },
    });

    return applicationRows.map((row) => ({
      ...row,
      attendanceType: row.attendanceType as Application["attendanceType"],
      employmentType: row.employmentType as Application["employmentType"],
      company: row.company,
      contacts: row.contacts
        .map((relation) => relation.contact)
        .filter((contact): contact is NonNullable<typeof contact> =>
          Boolean(contact),
        ),
      documents: row.documents
        .map((relation) => relation.document)
        .filter((document): document is NonNullable<typeof document> =>
          Boolean(document),
        ),
    }));
  }
}
