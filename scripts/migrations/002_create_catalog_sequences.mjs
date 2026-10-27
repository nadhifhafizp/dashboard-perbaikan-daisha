import postgres from 'postgres';

const connString = process.env.DATABASE_URL;
if (!connString) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}
const sql = postgres(connString, { ssl: 'require', prepare: false });

async function initSeqs() {
  const [maxC] = await sql`
    SELECT COALESCE(MAX((c.value->>'id')::int), 0) as m 
    FROM "DaishaCatalog", 
    LATERAL jsonb_array_elements(COALESCE(components, '[]'::jsonb)) c(value)
  `;
  const [maxS] = await sql`
    SELECT COALESCE(MAX((s.value->>'id')::int), 0) as m 
    FROM "DaishaCatalog", 
    LATERAL jsonb_array_elements(COALESCE(components, '[]'::jsonb)) c(value), 
    LATERAL jsonb_array_elements(COALESCE(c.value->'symptoms', '[]'::jsonb)) s(value)
  `;
  const [maxV] = await sql`
    SELECT COALESCE(MAX((v.value->>'id')::int), 0) as m 
    FROM "DaishaCatalog", 
    LATERAL jsonb_array_elements(COALESCE(variants, '[]'::jsonb)) v(value)
  `;

  const nextC = Math.max(Number(maxC.m) + 1, 300);
  const nextS = Math.max(Number(maxS.m) + 1, 600);
  const nextV = Math.max(Number(maxV.m) + 1, 100);

  console.log('Next IDs:', { nextC, nextS, nextV });

  await sql`CREATE SEQUENCE IF NOT EXISTS "DaishaComponent_id_seq"`;
  await sql`SELECT setval('"DaishaComponent_id_seq"', ${nextC}, false)`;

  await sql`CREATE SEQUENCE IF NOT EXISTS "DaishaSymptom_id_seq"`;
  await sql`SELECT setval('"DaishaSymptom_id_seq"', ${nextS}, false)`;

  await sql`CREATE SEQUENCE IF NOT EXISTS "DaishaVariant_id_seq"`;
  await sql`SELECT setval('"DaishaVariant_id_seq"', ${nextV}, false)`;

  console.log('Sequences DaishaComponent_id_seq, DaishaSymptom_id_seq, DaishaVariant_id_seq successfully created & set!');
  await sql.end();
}

initSeqs().catch((err) => {
  console.error('Error init sequences:', err);
  process.exit(1);
});
