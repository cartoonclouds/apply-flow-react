import { invokeTauri } from "@/db/runtime";

export interface SqliteMetadata {
  filePath: string;
  tableCount: number;
  tables: string[];
}

export async function readLocalSqliteDatabase(
  path: string,
): Promise<SqliteMetadata> {
  const normalizedPath = path.trim();

  if (!normalizedPath) {
    throw new Error("Database path cannot be empty.");
  }

  return invokeTauri<SqliteMetadata>("read_sqlite_database", {
    path: normalizedPath,
  });
}
