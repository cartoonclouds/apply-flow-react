import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import { applications, companies, contacts, documents } from "../schema.js";

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
        VITE_DATABASE_NAME?: string;
      };
    }
  ).env;

  const { VITE_FACTORY_COUNT, VITE_REFRESH_DATABASE, VITE_DATABASE_NAME } =
    env ?? {};

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
    databaseName: VITE_DATABASE_NAME ?? "jaa-react",
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

async function getMissingTables(client: PGlite): Promise<string[]> {
  const missing: string[] = [];

  for (const tableName of REQUIRED_TABLES) {
    const result = await client.query<{ regclass: string | null }>(
      `select to_regclass('public.${tableName}') as regclass;`,
    );

    if (!result.rows[0]?.regclass) {
      missing.push(tableName);
    }
  }

  return missing;
}

async function getColumnDataType(
  client: PGlite,
  tableName: string,
  columnName: string,
): Promise<string | null> {
  const result = await client.query<{ data_type: string | null }>(
    `select data_type
     from information_schema.columns
     where table_schema = 'public'
       and table_name = '${tableName}'
       and column_name = '${columnName}';`,
  );

  return result.rows[0]?.data_type ?? null;
}

async function ensureSeedSchema(client: PGlite): Promise<void> {
  const statements = [
    `DO $$ BEGIN
      CREATE TYPE contact_type AS ENUM ('company', 'recruiter');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE attendance_type AS ENUM ('remote', 'hybrid', 'on-site');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE employment_type AS ENUM ('part-time', 'contract', 'internship', 'full-time', 'volunteer');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;`,
    `CREATE TABLE IF NOT EXISTS companies (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      website_url text,
      linkedin_url text,
      industry text,
      size text,
      location_text text,
      location_lat double precision,
      location_lng double precision,
      notes text,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );`,
    `CREATE TABLE IF NOT EXISTS contacts (
      id text PRIMARY KEY NOT NULL,
      company_id text,
      full_name text NOT NULL,
      email text,
      phone text,
      linkedin_url text,
      type contact_type NOT NULL,
      location_text text,
      location_lat double precision,
      location_lng double precision,
      notes text,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now(),
      CONSTRAINT contacts_company_fk FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
    );`,
    `CREATE TABLE IF NOT EXISTS applications (
      id text PRIMARY KEY NOT NULL,
      company_id text,
      title text NOT NULL,
      url text,
      applied_at timestamp NOT NULL DEFAULT now(),
      location_text text,
      location_lat double precision,
      location_lng double precision,
      attendance_type attendance_type,
      employment_type employment_type,
      salary_min integer,
      salary_max integer,
      currency text,
      description text,
      interview_process text,
      benefits text,
      priority integer NOT NULL DEFAULT 3,
      is_archived boolean NOT NULL DEFAULT false,
      deleted_at timestamp,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now(),
      CONSTRAINT applications_company_fk FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
    );`,
    `CREATE TABLE IF NOT EXISTS documents (
      id text PRIMARY KEY NOT NULL,
      title text NOT NULL,
      kind text NOT NULL,
      file_path text NOT NULL,
      mime_type text,
      size_bytes integer,
      checksum text,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );`,
    `CREATE TABLE IF NOT EXISTS application_documents (
      application_id text NOT NULL,
      document_id text NOT NULL,
      relation_type text NOT NULL DEFAULT 'attachment',
      created_at timestamp NOT NULL DEFAULT now(),
      PRIMARY KEY (application_id, document_id),
      CONSTRAINT app_docs_application_fk FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      CONSTRAINT app_docs_document_fk FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS application_contacts (
      application_id text NOT NULL,
      contact_id text NOT NULL,
      relation_type text NOT NULL DEFAULT 'owner',
      created_at timestamp NOT NULL DEFAULT now(),
      PRIMARY KEY (application_id, contact_id),
      CONSTRAINT app_contacts_application_fk FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      CONSTRAINT app_contacts_contact_fk FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );`,
  ];

  for (const statement of statements) {
    await client.exec(statement);
  }
}

async function ensureDatabaseAndMigrations(client: PGlite): Promise<void> {
  const missingBefore = await getMissingTables(client);

  if (missingBefore.length > 0) {
    console.log(
      `Running seed migrations because tables are missing: ${missingBefore.join(", ")}`,
    );
    await ensureSeedSchema(client);
  } else {
    console.log("Seed database and migrations already exist.");
    return;
  }

  const missingAfter = await getMissingTables(client);

  if (missingAfter.length > 0) {
    throw new Error(
      `Seed migrations incomplete. Missing tables: ${missingAfter.join(", ")}`,
    );
  }
}

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

function deleteBrowserDatabase(name: string): Promise<void> {
  if (typeof indexedDB === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onerror = () =>
      reject(request.error ?? new Error(`Failed to delete database ${name}`));
    request.onblocked = () => resolve();
    request.onsuccess = () => resolve();
  });
}

async function seedFactories(client: PGlite, count: number) {
  const db = drizzle(client, {
    schema: { applications, companies, contacts, documents },
  });

  await ensureDatabaseAndMigrations(client);
  await resetSeedData(client);
  await seedCompanies(db, { companies }, count);
  await seedContacts(db, { contacts }, count);
  await seedDocuments(db, { documents }, count);
  await seedApplications(db, { applications }, count);
  await seedRelationships(client);
}

export async function runAllFactories() {
  const { count, refreshDatabase, databaseName } = resolveParameters();
  const isBrowser = typeof window !== "undefined";
  let client = createFactoryClient(isBrowser);

  if (refreshDatabase) {
    console.log("Refreshing database and migrations as requested.");
    await deleteBrowserDatabase(databaseName);
    client = createFactoryClient(isBrowser);
  }

  try {
    await seedFactories(client, count);
  } catch (error) {
    if (!isBrowser) {
      throw error;
    }

    console.warn("Browser seed failed, rebuilding the database once.", error);
    await deleteBrowserDatabase(databaseName);
    client = createFactoryClient(isBrowser);
    await seedFactories(client, count);
  }

  console.log(`Seeded ${count} records for each factory.`);
  console.log("Factory run completed.");
}

if (typeof window === "undefined") {
  void runAllFactories();
}
