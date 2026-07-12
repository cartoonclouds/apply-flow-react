import { pluck } from "@/lib/map-defined";
import { seed } from "drizzle-seed";

export async function seedContacts(db: unknown, schema: unknown, count = 10) {
  const typedSchema = schema as {
    contacts?: any;
    companies?: any;
  };
  const contacts = typedSchema.contacts;
  const companies = typedSchema.companies;

  if (!contacts) {
    throw new Error("contacts table is required in schema for contact seeding");
  }

  if (!companies) {
    throw new Error("companies table is required for contact relationships");
  }

  const companyRows = await (db as any)
    .select({ id: companies.id })
    .from(companies);
  const companyIds = pluck(companyRows as Array<{ id: string }>, "id");

  if (companyIds.length === 0) {
    throw new Error("seedContacts requires at least one seeded company");
  }

  await (seed(db as any, { contacts } as any, { count }) as any).refine(
    (funcs: any) => ({
      contacts: {
        columns: {
          id: funcs.uuid(),
          companyId: funcs.valuesFromArray({ values: companyIds }),
          fullName: funcs.fullName(),
          email: funcs.email(),
          phone: funcs.phoneNumber(),
          linkedinUrl: funcs.default({
            defaultValue: "https://linkedin.com/in/example",
          }),
          type: funcs.valuesFromArray({ values: ["company", "recruiter"] }),
          locationText: funcs.default({ defaultValue: "Remote" }),
          locationLat: funcs.number({
            minValue: -90,
            maxValue: 90,
            precision: 1000000,
          }),
          locationLng: funcs.number({
            minValue: -180,
            maxValue: 180,
            precision: 1000000,
          }),
          notes: funcs.loremIpsum({ sentencesCount: 1 }),
          createdAt: funcs.timestamp(),
          updatedAt: funcs.timestamp(),
        },
      },
    }),
  );
}
