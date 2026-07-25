const APPLICATION_STAGE_NAMES = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
] as const;

type ApplicationStageRow = {
  id: string;
  name: string;
};

export async function seedApplicationStages(
  db: unknown,
  schema: unknown,
): Promise<ApplicationStageRow[]> {
  const applicationStages = (schema as { applicationStages?: unknown })
    .applicationStages;

  if (!applicationStages) {
    throw new Error(
      "applicationStages table is required in schema for stage seeding",
    );
  }

  const rows = APPLICATION_STAGE_NAMES.map((name) => ({
    id: crypto.randomUUID(),
    name,
  }));

  await (db as any).insert(applicationStages).values(rows);

  return rows;
}
