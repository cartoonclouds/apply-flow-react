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
    return this.db.select().from(schema.applications);
  }
}
