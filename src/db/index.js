import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema/index.js";

const databaseName = import.meta.env?.VITE_DATABASE_NAME || "jaa-react";

export const client = new PGlite(`idb://${databaseName}`);

export const db = drizzle(client, { schema });
