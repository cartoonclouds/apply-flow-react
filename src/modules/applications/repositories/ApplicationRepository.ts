import type { DrizzleAppDatabase } from "@/db";
import * as schema from "@/db/schema";
import { Repository } from "@/types";
import { eq } from "drizzle-orm";
import type { Application, NewApplicationRow } from "../types";

export class ApplicationRepository implements Repository<
  Application,
  NewApplicationRow,
  Partial<NewApplicationRow>,
  string
> {
  constructor(private readonly db: DrizzleAppDatabase) {}

  public async get(id: string): Promise<Application | null> {
    const row = await this.db.query.applications.findFirst({
      where: { id },
      with: {
        stage: true,
        company: true,
        contacts: true,
        documents: true,
      },
    });

    if (!row) {
      return null;
    }

    return {
      ...row,
      attendanceType: row.attendanceType as Application["attendanceType"],
      employmentType: row.employmentType as Application["employmentType"],
      stage: row.stage,
      company: row.company,
      contacts: row.contacts,
      documents: row.documents,
    };
  }

  public async create(data: NewApplicationRow): Promise<Application> {
    const id = data.id || crypto.randomUUID();

    await (this.db as any).insert(schema.applications).values({
      ...data,
      id,
      title: data.title || "Untitled Application",
      priority: data.priority ?? 3,
      isArchived: data.isArchived ?? false,
    });

    const created = await this.get(id);

    if (!created) {
      throw new Error("Failed to create application");
    }

    return created;
  }

  public async update(
    id: string,
    data: Partial<NewApplicationRow>,
  ): Promise<Application> {
    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updatePayload[key] = value;
      }
    }

    await (this.db as any)
      .update(schema.applications)
      .set(updatePayload)
      .where(eq(schema.applications.id, id));

    const updated = await this.get(id);

    if (!updated) {
      throw new Error("Failed to update application");
    }

    return updated;
  }

  public async delete(id: string): Promise<void> {
    await (this.db as any)
      .delete(schema.applications)
      .where(eq(schema.applications.id, id));
  }

  public async list(): Promise<Application[]> {
    const applicationRows = await this.db.query.applications.findMany({
      with: {
        stage: true,
        company: true,
        contacts: true,
        documents: true,
      },
    });

    return applicationRows.map((row) => ({
      ...row,
      attendanceType: row.attendanceType as Application["attendanceType"],
      employmentType: row.employmentType as Application["employmentType"],
      stage: row.stage,
      company: row.company,
      contacts: row.contacts,
      documents: row.documents,
    }));
  }
}
