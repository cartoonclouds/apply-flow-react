import { seed } from "drizzle-seed";

import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
} from "../../modules/applications/enums";

export async function seedApplications(
  db: unknown,
  schema: unknown,
  count = 10,
) {
  const typedSchema = schema as {
    applications?: any;
    companies?: any;
  };
  const applications = typedSchema.applications;
  const companies = typedSchema.companies;

  if (!applications) {
    throw new Error(
      "applications table is required in schema for application seeding",
    );
  }

  if (!companies) {
    throw new Error(
      "companies table is required for application relationships",
    );
  }

  const companyRows = await (db as any)
    .select({ id: companies.id })
    .from(companies);
  const companyIds = companyRows.map((row: { id: string }) => row.id);

  if (companyIds.length === 0) {
    throw new Error("seedApplications requires at least one seeded company");
  }

  await (seed(db as any, { applications } as any, { count }) as any).refine(
    (funcs: any) => ({
      applications: {
        columns: {
          id: funcs.uuid(),
          companyId: funcs.valuesFromArray({ values: companyIds }),
          title: funcs.jobTitle(),
          url: funcs.default({ defaultValue: "https://example.com/job" }),
          appliedAt: funcs.timestamp(),
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
          attendanceType: funcs.valuesFromArray({
            values: [
              ApplicationAttendanceType.Remote,
              ApplicationAttendanceType.Hybrid,
              ApplicationAttendanceType.OnSite,
            ],
          }),
          employmentType: funcs.valuesFromArray({
            values: [
              ApplicationEmploymentType.PartTime,
              ApplicationEmploymentType.Contract,
              ApplicationEmploymentType.Internship,
              ApplicationEmploymentType.FullTime,
              ApplicationEmploymentType.Volunteer,
            ],
          }),
          salaryMin: funcs.int({ minValue: 30000, maxValue: 120000 }),
          salaryMax: funcs.int({ minValue: 45000, maxValue: 170000 }),
          currency: funcs.default({ defaultValue: "USD" }),
          description: funcs.loremIpsum({ sentencesCount: 2 }),
          interviewProcess: funcs.loremIpsum({ sentencesCount: 1 }),
          benefits: funcs.loremIpsum({ sentencesCount: 1 }),
          priority: funcs.int({ defaultValue: 3 }),
          isArchived: funcs.boolean({ defaultValue: false }),
          deletedAt: funcs.default({ defaultValue: null }),
          createdAt: funcs.timestamp(),
          updatedAt: funcs.timestamp(),
        },
      },
    }),
  );
}
