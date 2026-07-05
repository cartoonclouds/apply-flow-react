import * as schema from "@/db/schema";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { Application } from "../types";

export class ApplicationRepository {
  constructor(private readonly db: PgliteDatabase<typeof schema>) {}

  public async list(): Promise<Application[]> {
    return this.db.select().from(schema.applications);
  }
}
