import { seed } from "drizzle-seed";

export async function seedCompanies(db: unknown, schema: unknown, count = 10) {
  const companies = (schema as { companies?: unknown }).companies;

  if (!companies) {
    throw new Error(
      "companies table is required in schema for company seeding",
    );
  }

  await (seed(db as any, { companies } as any, { count }) as any).refine(
    (funcs: any) => ({
      companies: {
        columns: {
          id: funcs.uuid(),
          name: funcs.companyName(),
          websiteUrl: funcs.default({ defaultValue: "https://example.com" }),
          linkedinUrl: funcs.default({
            defaultValue: "https://linkedin.com/company/example",
          }),
          industry: funcs.valuesFromArray({
            values: [
              "Software",
              "Finance",
              "Healthcare",
              "Education",
              "Retail",
              "Manufacturing",
            ],
          }),
          size: funcs.valuesFromArray({
            values: ["1-10", "11-50", "51-200", "201-500", "500+"],
          }),
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
