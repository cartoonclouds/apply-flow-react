import { seed } from "drizzle-seed";

export async function seedContacts(db: unknown, schema: unknown, count = 10) {
  const contacts = (schema as { contacts?: unknown }).contacts;

  if (!contacts) {
    throw new Error("contacts table is required in schema for contact seeding");
  }

  await (seed(db as any, { contacts } as any, { count }) as any).refine(
    (funcs: any) => ({
      contacts: {
        columns: {
          id: funcs.uuid(),
          companyId: funcs.default({ defaultValue: null }),
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
