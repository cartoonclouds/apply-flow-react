import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import { migratePgliteDatabase } from "../migrate";
import { deleteIndexedDbDatabase, getDatabaseName } from "../runtime";

import {
    applicationContacts,
    applicationDocuments,
    applications,
    companies,
    contacts,
    documents,
} from "../schema/index.js";

import { seedApplications } from "./application.factory";
import { seedCompanies } from "./company.factory";
import { seedContacts } from "./contact.factory";
import { seedDocuments } from "./document.factory";
import { seedRelationships } from "./relationship.factory";

function resolveParameters() {
  const env = (
    import.meta as ImportMeta & {
      env?: {
        VITE_FACTORY_COUNT?: string;
        VITE_REFRESH_DATABASE?: string;
      };
    }
  ).env;

  const { VITE_FACTORY_COUNT, VITE_REFRESH_DATABASE } = env ?? {};

  console.log(VITE_FACTORY_COUNT, VITE_REFRESH_DATABASE);

  const rawFactoryCount =
    !Number.isFinite(Number(VITE_FACTORY_COUNT)) ||
    Number(VITE_FACTORY_COUNT) <= 0
      ? 10
      : Number(VITE_FACTORY_COUNT);
  const rawRefreshDatabase = VITE_REFRESH_DATABASE === "true";

  return {
    count: rawFactoryCount,
    refreshDatabase: rawRefreshDatabase,
    databaseName: getDatabaseName(),
  };
}

const REQUIRED_TABLES = [
  "companies",
  "contacts",
  "applications",
  "documents",
  "application_documents",
  "application_contacts",
] as const;

async function resetSeedData(client: PGlite): Promise<void> {
  const statements = REQUIRED_TABLES.map(
    (tableName) => `DELETE FROM ${tableName};`,
  );

  console.log(
    "Resetting seed data for all tables:",
    REQUIRED_TABLES.join(", "),
  );

  for (const statement of statements) {
    await client.exec(statement);
  }
}

function createFactoryClient(isBrowser: boolean) {
  const { databaseName } = resolveParameters();

  return isBrowser
    ? new PGlite(`idb://${databaseName}`)
    : new PGlite("./.pglite-seed");
}

async function seedFactories(client: PGlite, count: number) {
  const db = drizzle(client, {
    schema: {
      applications,
      companies,
      contacts,
      documents,
      applicationContacts,
      applicationDocuments,
    },
  });

  await migratePgliteDatabase(db as any);
  await resetSeedData(client);
  await seedCompanies(db, { companies }, count);
  await seedContacts(db, { contacts, companies }, count);
  await seedDocuments(db, { documents }, count);
  await seedApplications(db, { applications, companies }, count);
  await seedRelationships(db, {
    applications,
    contacts,
    documents,
    applicationContacts,
    applicationDocuments,
  });
}

export async function runAllFactories() {
  const { count, refreshDatabase, databaseName } = resolveParameters();
  const isBrowser = typeof window !== "undefined";
  let client = createFactoryClient(isBrowser);

  if (refreshDatabase) {
    console.log("Refreshing database and migrations as requested.");
    await deleteIndexedDbDatabase(databaseName);
    client = createFactoryClient(isBrowser);
  }

  try {
    await seedFactories(client, count);
  } catch (error) {
    if (!isBrowser) {
      throw error;
    }

    console.warn("Browser seed failed, rebuilding the database once.", error);
    await deleteIndexedDbDatabase(databaseName);
    client = createFactoryClient(isBrowser);
    await seedFactories(client, count);
  }

  console.log(`Seeded ${count} records for each factory.`);
  console.log("Factory run completed.");
}

if (typeof window === "undefined") {
  void runAllFactories();
}
