import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dbCredentials: {
    url: `postgresql://localhost:5432/${import.meta.env?.VITE_DATABASE_NAME || "jaa-react"}`,
  },
});
