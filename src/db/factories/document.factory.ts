import { seed } from "drizzle-seed";

export async function seedDocuments(db: unknown, schema: unknown, count = 10) {
  const documents = (schema as { documents?: unknown }).documents;

  if (!documents) {
    throw new Error(
      "documents table is required in schema for document seeding",
    );
  }

  await (seed(db as any, { documents } as any, { count }) as any).refine(
    (funcs: any) => ({
      documents: {
        columns: {
          id: funcs.uuid(),
          title: funcs.default({ defaultValue: "Resume" }),
          kind: funcs.valuesFromArray({
            values: ["resume", "cover_letter", "portfolio", "certificate"],
          }),
          filePath: funcs.default({ defaultValue: "/documents/sample.pdf" }),
          mimeType: funcs.valuesFromArray({
            values: ["application/pdf", "application/msword"],
          }),
          sizeBytes: funcs.int({ minValue: 10_000, maxValue: 5_000_000 }),
          checksum: funcs.string(),
          createdAt: funcs.timestamp(),
          updatedAt: funcs.timestamp(),
        },
      },
    }),
  );
}
