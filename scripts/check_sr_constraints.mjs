import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function check() {
  const cons = await sql`
    SELECT conname, contype, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = '"SectionRequest"'::regclass
  `;
  console.log('Constraints on SectionRequest:', cons);
  const rows = await sql`SELECT id, "nomorRequest", status, "waktuDibuat" FROM "SectionRequest" ORDER BY id DESC LIMIT 5`;
  console.log('Latest rows in SectionRequest:', rows);
  await sql.end();
}
check();
