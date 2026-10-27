import postgres from 'postgres';

const connString = process.env.DATABASE_URL;
const sql = postgres(connString, { ssl: 'require', prepare: false });

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS "Section" (
      "id" SERIAL PRIMARY KEY,
      "name" VARCHAR(100) UNIQUE NOT NULL,
      "colorName" VARCHAR(50),
      "badgeBg" VARCHAR(50),
      "textColor" VARCHAR(50),
      "borderColor" VARCHAR(50),
      "accentBorder" VARCHAR(50),
      "updatedAt" TIMESTAMPTZ DEFAULT now()
    );
  `;
  console.log('Section table verified!');
  await sql.end();
}

main().catch(console.error);
