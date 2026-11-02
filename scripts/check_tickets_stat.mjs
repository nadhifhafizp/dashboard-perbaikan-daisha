import postgres from 'postgres';

const connString = process.env.DATABASE_URL || "postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(connString, { ssl: 'require', prepare: false });

async function checkAll() {
  try {
    const statuses = await sql`
      SELECT status, count(*)::int as count
      FROM "Ticket"
      GROUP BY status
    `;
    console.log('Ticket status counts in DB:', statuses);

    // Check how many tickets are in repair query with 90 days filter
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const tickets90Days = await sql`
      SELECT status, count(*)::int as count
      FROM "Ticket"
      WHERE "waktuMasuk" >= ${ninetyDaysAgo}::timestamptz
      GROUP BY status
    `;
    console.log('Ticket status counts (last 90 days):', tickets90Days);

    // Check Daisha table count
    const daishaCounts = await sql`
      SELECT last_condition, count(*)::int as count
      FROM "Daisha"
      GROUP BY last_condition
    `;
    console.log('Daisha table condition counts:', daishaCounts);

    // Let's check the date of the tickets
    const recentTickets = await sql`
      SELECT "idTiket", "noDaisha", "status", "waktuMasuk", "waktuSelesai"
      FROM "Ticket"
      ORDER BY "waktuMasuk" DESC
      LIMIT 10
    `;
    console.log('Recent 10 tickets:', recentTickets);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

checkAll();

