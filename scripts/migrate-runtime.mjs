import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/db/schema/index.js";

const databasePath = process.env.DRIZZLE_DB_FILE || "./.pglite-seed";

const client = new PGlite(databasePath);
const db = drizzle(client, { schema });

await migrate(db, {
  migrationsFolder: "./drizzle",
  migrationsTable: "__drizzle_migrations",
  migrationsSchema: "drizzle",
});

console.log("Runtime migrations applied successfully.");
