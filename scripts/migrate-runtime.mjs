import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { relations } from "../src/db/relations.js";

const databasePath = process.env.DRIZZLE_DB_FILE || "./.pglite-seed";

const client = new PGlite(databasePath);
const db = drizzle(client, { relations });

await migrate(db, {
  migrationsFolder: "./drizzle",
  migrationsTable: "__drizzle_migrations",
  migrationsSchema: "drizzle",
});

console.log("Runtime migrations applied successfully.");
