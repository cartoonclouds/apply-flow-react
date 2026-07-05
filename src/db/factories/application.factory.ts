import { seed } from "drizzle-seed";

export async function seedApplications(
  db: unknown,
  schema: unknown,
  count = 10,
) {
  const applications = (schema as { applications?: unknown }).applications;

  if (!applications) {
    throw new Error(
      "applications table is required in schema for application seeding",
    );
  }

  await (seed(db as any, { applications } as any, { count }) as any).refine(
    (funcs: any) => ({
      applications: {
        columns: {
          id: funcs.uuid(),
          companyId: funcs.default({ defaultValue: null }),
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
            values: ["remote", "hybrid", "on-site"],
          }),
          employmentType: funcs.valuesFromArray({
            values: [
              "part-time",
              "contract",
              "internship",
              "full-time",
              "volunteer",
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
