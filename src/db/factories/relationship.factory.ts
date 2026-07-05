import { PGlite } from "@electric-sql/pglite";

export async function seedRelationships(client: PGlite): Promise<void> {
  const statements = [
    `WITH indexed_contacts AS (
      SELECT id, row_number() OVER (ORDER BY id) - 1 AS rn
      FROM contacts
    ), indexed_companies AS (
      SELECT id, row_number() OVER (ORDER BY id) - 1 AS rn
      FROM companies
    ), company_count AS (
      SELECT count(*)::int AS cnt
      FROM companies
    )
    UPDATE contacts AS c
    SET company_id = ic.id
    FROM indexed_contacts ict
    JOIN company_count cc ON cc.cnt > 0
    JOIN indexed_companies ic ON ic.rn = (ict.rn % cc.cnt)
    WHERE c.id = ict.id;`,
    `WITH indexed_applications AS (
      SELECT id, row_number() OVER (ORDER BY id) - 1 AS rn
      FROM applications
    ), indexed_companies AS (
      SELECT id, row_number() OVER (ORDER BY id) - 1 AS rn
      FROM companies
    ), company_count AS (
      SELECT count(*)::int AS cnt
      FROM companies
    )
    UPDATE applications AS a
    SET company_id = ic.id
    FROM indexed_applications ia
    JOIN company_count cc ON cc.cnt > 0
    JOIN indexed_companies ic ON ic.rn = (ia.rn % cc.cnt)
    WHERE a.id = ia.id;`,
    `WITH indexed_applications AS (
      SELECT id, row_number() OVER (ORDER BY id) - 1 AS rn
      FROM applications
    ), indexed_contacts AS (
      SELECT id, row_number() OVER (ORDER BY id) - 1 AS rn
      FROM contacts
    ), contact_count AS (
      SELECT count(*)::int AS cnt
      FROM contacts
    )
    INSERT INTO application_contacts (application_id, contact_id, relation_type, created_at)
    SELECT ia.id, ic.id, 'owner', now()
    FROM indexed_applications ia
    JOIN contact_count cc ON cc.cnt > 0
    JOIN indexed_contacts ic ON ic.rn = (ia.rn % cc.cnt);`,
    `WITH indexed_applications AS (
      SELECT id, row_number() OVER (ORDER BY id) - 1 AS rn
      FROM applications
    ), indexed_documents AS (
      SELECT id, row_number() OVER (ORDER BY id) - 1 AS rn
      FROM documents
    ), document_count AS (
      SELECT count(*)::int AS cnt
      FROM documents
    )
    INSERT INTO application_documents (application_id, document_id, relation_type, created_at)
    SELECT ia.id, idoc.id, 'attachment', now()
    FROM indexed_applications ia
    JOIN document_count dc ON dc.cnt > 0
    JOIN indexed_documents idoc ON idoc.rn = (ia.rn % dc.cnt);`,
  ];

  for (const statement of statements) {
    await client.exec(statement);
  }
}
