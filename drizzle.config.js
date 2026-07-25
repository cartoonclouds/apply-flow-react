import { defineConfig } from "drizzle-kit";

const drizzleDbFile = process.env.DRIZZLE_DB_FILE || "./.pglite-seed";

export default defineConfig({
  dialect: "postgresql",
  driver: "pglite",
  schema: [
    "./src/db/schema/application-contacts.js",
    "./src/db/schema/application-documents.js",
    "./src/db/schema/application-stages.js",
    "./src/db/schema/applications.js",
    "./src/db/schema/companies.js",
    "./src/db/schema/contacts.js",
    "./src/db/schema/documents.js",
    "./src/db/schema/enums.js",
  ],
  out: "./drizzle",
  migrations: {
    table: "__drizzle_migrations",
    schema: "drizzle",
  },
  dbCredentials: {
    url: drizzleDbFile,
  },
});
