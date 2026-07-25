import type { DrizzleAppDatabase } from "@/db";
import * as schema from "@/db/schema";
import { withResolvedLocationCoordinates } from "@/modules/map/services/locationCoordinatesService";
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

  public async create(data: NewContactRow): Promise<Contact> {
    const id = data.id || crypto.randomUUID();
    const dataWithLocation = await withResolvedLocationCoordinates(data);

    await (this.db as any).insert(schema.contacts).values({
      ...dataWithLocation,
      id,
    });

    const created = await this.get(id);

    if (!created) {
      throw new Error("Failed to create contact");
    }

    return created;
  }

  public async update(
    id: string,
    data: Partial<NewContactRow>,
  ): Promise<Contact> {
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
      .update(schema.contacts)
      .set(updatePayload)
      .where(eq(schema.contacts.id, id));

    const updated = await this.get(id);

    if (!updated) {
      throw new Error("Failed to update contact");
    }

    return updated;
  }

  public async delete(id: string): Promise<void> {
    await (this.db as any)
      .delete(schema.contacts)
      .where(eq(schema.contacts.id, id));
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
