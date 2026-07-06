import { defineConfig } from "drizzle-kit";

const drizzleDbFile = process.env.DRIZZLE_DB_FILE || "./.pglite-seed";

export default defineConfig({
  dialect: "postgresql",
  driver: "pglite",
  schema: "./src/db/schema/*.js",
  out: "./drizzle",
  migrations: {
    table: "__drizzle_migrations",
    schema: "drizzle",
  },
  dbCredentials: {
    url: drizzleDbFile,
  },
});
