import postgres from 'postgres';

const connString = process.env.DATABASE_URL || "postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(connString, { ssl: 'require', prepare: false });

async function syncAll() {
  console.log('--- FAST BULK SYNCHRONIZING DAISHA & TICKETS ---');

  // 1. Set RUSAK untuk daisha yang memiliki tiket aktif
  const resRusak = await sql`
    UPDATE "Daisha"
    SET "last_condition" = 'RUSAK', "updated_at" = NOW()
    WHERE "nomor_daisha" IN (
      SELECT "noDaisha"
      FROM "Ticket"
      WHERE status IN ('Open', 'Progress', 'Pending')
        AND "noDaisha" IS NOT NULL
        AND "noDaisha" != '-'
    )
    AND ("last_condition" IS NULL OR "last_condition" != 'RUSAK')
  `;
  console.log(`Updated ${resRusak.count} Daisha menjadi RUSAK.`);

  // 2. Set OK untuk daisha yang TIDAK memiliki tiket aktif dan bukan SCRAP
  const resOk = await sql`
    UPDATE "Daisha"
    SET "last_condition" = 'OK', "updated_at" = NOW()
    WHERE "last_condition" != 'OK'
      AND "last_condition" != 'SCRAP'
      AND "nomor_daisha" NOT IN (
        SELECT "noDaisha"
        FROM "Ticket"
        WHERE status IN ('Open', 'Progress', 'Pending')
          AND "noDaisha" IS NOT NULL
          AND "noDaisha" != '-'
      )
  `;
  console.log(`Updated ${resOk.count} Daisha menjadi OK.`);

  // 3. Verifikasi
  const rusakCount = await sql`SELECT count(*)::int as c FROM "Daisha" WHERE "last_condition" = 'RUSAK'`;
  const activeTicketUnits = await sql`
    SELECT count(DISTINCT "noDaisha")::int as c
    FROM "Ticket"
    WHERE status IN ('Open', 'Progress', 'Pending')
      AND "noDaisha" IS NOT NULL
      AND "noDaisha" != '-'
  `;
  console.log(`Daisha RUSAK di DB: ${rusakCount[0].c}`);
  console.log(`Unit di Tiket Aktif di DB: ${activeTicketUnits[0].c}`);

  await sql.end();
}

syncAll().catch(console.error);
