import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import {
  APPLICATION_ATTENDANCE_TYPE_VALUES,
  APPLICATION_EMPLOYMENT_TYPE_VALUES,
  CONTACT_TYPE_VALUES,
} from "../../constants/enum-values.js";
import { db as appDb, dbMode, verifyDatabaseConnection } from "../index";
import { migratePgliteDatabase } from "../migrate";
import {
  DEFAULT_DB_NAME,
  deleteIndexedDbDatabase,
  isTauriRuntime,
} from "../runtime";

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

const seedSchema = {
  applications,
  companies,
  contacts,
  documents,
  applicationContacts,
  applicationDocuments,
};

const COMPANY_INDUSTRIES = [
  "Software",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const DOCUMENT_KINDS = ["resume", "cover_letter", "portfolio", "certificate"];

const DOCUMENT_MIME_TYPES = ["application/pdf", "application/msword"];

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
    databaseName: DEFAULT_DB_NAME,
  };
}

const REQUIRED_TABLES = [
  applicationDocuments,
  applicationContacts,
  applications,
  contacts,
  documents,
  companies,
] as const;

async function resetSeedData(targetDb: unknown): Promise<void> {
  console.log("Resetting seed data for all tables.");

  for (const table of REQUIRED_TABLES) {
    await (targetDb as any).delete(table);
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
    schema: seedSchema,
  });

  await migratePgliteDatabase(db as any);
  await seedFactoryData(db, count);
}

async function seedFactoryData(targetDb: unknown, count: number) {
  await resetSeedData(targetDb);
  await seedCompanies(targetDb, { companies }, count);
  await seedContacts(targetDb, { contacts, companies }, count);
  await seedDocuments(targetDb, { documents }, count);
  await seedApplications(targetDb, { applications, companies }, count);
  await seedRelationships(targetDb, {
    applications,
    contacts,
    documents,
    applicationContacts,
    applicationDocuments,
  });
}

function pickValue<T>(values: readonly T[], index: number): T {
  return values[index % values.length];
}

function createTimestamp(offsetMinutes: number): string {
  return new Date(Date.now() - offsetMinutes * 60_000).toISOString();
}

async function seedSqliteFactoryData(targetDb: unknown, count: number) {
  await resetSeedData(targetDb);

  const companyRows = Array.from({ length: count }, (_, index) => ({
    id: crypto.randomUUID(),
    name: `Demo Company ${index + 1}`,
    websiteUrl: `https://company-${index + 1}.example.com`,
    linkedinUrl: `https://linkedin.com/company/demo-company-${index + 1}`,
    industry: pickValue(COMPANY_INDUSTRIES, index),
    size: pickValue(COMPANY_SIZES, index),
    locationText: pickValue(["Remote", "New York", "London", "Berlin"], index),
    locationLat: 40.7128 + index * 0.01,
    locationLng: -74.006 + index * 0.01,
    notes: `Generated company ${index + 1}`,
    createdAt: createTimestamp(index + 1),
    updatedAt: createTimestamp(index + 1),
  }));

  await (targetDb as any).insert(companies).values(companyRows);

  const contactRows = companyRows.map((company, index) => ({
    id: crypto.randomUUID(),
    companyId: company.id,
    fullName: `Contact ${index + 1}`,
    email: `contact${index + 1}@example.com`,
    phone: `+1-555-01${String(index).padStart(2, "0")}`,
    linkedinUrl: `https://linkedin.com/in/contact-${index + 1}`,
    type: pickValue(CONTACT_TYPE_VALUES, index),
    locationText: company.locationText,
    locationLat: company.locationLat,
    locationLng: company.locationLng,
    notes: `Primary contact for ${company.name}`,
    createdAt: createTimestamp(index + 11),
    updatedAt: createTimestamp(index + 11),
  }));

  await (targetDb as any).insert(contacts).values(contactRows);

  const documentRows = Array.from({ length: count }, (_, index) => ({
    id: crypto.randomUUID(),
    title: `Application Document ${index + 1}`,
    kind: pickValue(DOCUMENT_KINDS, index),
    filePath: `/documents/generated-${index + 1}.pdf`,
    mimeType: pickValue(DOCUMENT_MIME_TYPES, index),
    sizeBytes: 25_000 + index * 1_000,
    checksum: `checksum-${index + 1}`,
    createdAt: createTimestamp(index + 21),
    updatedAt: createTimestamp(index + 21),
  }));

  await (targetDb as any).insert(documents).values(documentRows);

  const applicationRows = companyRows.map((company, index) => ({
    id: crypto.randomUUID(),
    companyId: company.id,
    title: `Role ${index + 1}`,
    url: `https://jobs.example.com/roles/${index + 1}`,
    appliedAt: createTimestamp(index + 31),
    locationText: company.locationText,
    locationLat: company.locationLat,
    locationLng: company.locationLng,
    attendanceType: pickValue(APPLICATION_ATTENDANCE_TYPE_VALUES, index),
    employmentType: pickValue(APPLICATION_EMPLOYMENT_TYPE_VALUES, index),
    salaryMin: 45_000 + index * 2_500,
    salaryMax: 65_000 + index * 3_000,
    currency: "USD",
    description: `Generated application ${index + 1}`,
    interviewProcess: "Recruiter screen, hiring manager, panel interview",
    benefits: "Health, PTO, learning budget",
    priority: (index % 5) + 1,
    isArchived: false,
    deletedAt: null,
    createdAt: createTimestamp(index + 31),
    updatedAt: createTimestamp(index + 31),
  }));

  await (targetDb as any).insert(applications).values(applicationRows);

  const applicationContactRows = applicationRows.map((application, index) => ({
    applicationId: application.id,
    contactId: contactRows[index % contactRows.length].id,
    relationType: "owner",
    createdAt: createTimestamp(index + 41),
  }));

  await (targetDb as any)
    .insert(applicationContacts)
    .values(applicationContactRows);

  const applicationDocumentRows = applicationRows.map((application, index) => ({
    applicationId: application.id,
    documentId: documentRows[index % documentRows.length].id,
    relationType: "attachment",
    createdAt: createTimestamp(index + 51),
  }));

  await (targetDb as any)
    .insert(applicationDocuments)
    .values(applicationDocumentRows);
}

export async function runAllFactories() {
  const { count, refreshDatabase, databaseName } = resolveParameters();

  if (typeof window !== "undefined" && dbMode === "tauri-sqlite") {
    await verifyDatabaseConnection();
    await seedSqliteFactoryData(appDb, count);

    console.log(`Seeded ${count} records for each factory.`);
    console.log("Factory run completed.");
    return;
  }

  const isBrowser = !isTauriRuntime();
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
