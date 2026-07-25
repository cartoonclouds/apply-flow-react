import type { DrizzleAppDatabase } from "@/db";
import * as schema from "@/db/schema";
import { withResolvedLocationCoordinates } from "@/modules/map/services/locationCoordinatesService";
import { Repository } from "@/types";
import { eq } from "drizzle-orm";
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

  public async create(data: NewCompanyRow): Promise<Company> {
    const id = data.id || crypto.randomUUID();
    const dataWithLocation = await withResolvedLocationCoordinates(data);

    await (this.db as any).insert(schema.companies).values({
      ...dataWithLocation,
      id,
    });

    const created = await this.get(id);

    if (!created) {
      throw new Error("Failed to create company");
    }

    return created;
  }

  public async update(
    id: string,
    data: Partial<NewCompanyRow>,
  ): Promise<Company> {
    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updatePayload[key] = value;
      }
    }

    if (Object.hasOwn(data, "locationText")) {
      const coordinates = await withResolvedLocationCoordinates({
        locationText: data.locationText,
      });
      updatePayload.locationLat = coordinates.locationLat;
      updatePayload.locationLng = coordinates.locationLng;
    }

    await (this.db as any)
      .update(schema.companies)
      .set(updatePayload)
      .where(eq(schema.companies.id, id));

    const updated = await this.get(id);

    if (!updated) {
      throw new Error("Failed to update company");
    }

    return updated;
  }

  public async delete(id: string): Promise<void> {
    await (this.db as any)
      .delete(schema.companies)
      .where(eq(schema.companies.id, id));
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
