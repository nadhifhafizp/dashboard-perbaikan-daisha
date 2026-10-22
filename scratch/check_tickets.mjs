import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  console.log('=== DISTINCT NAMA DAISHA IN TICKETS FOR BUILDING ===');
  const tickets = await sql`
    SELECT "namaDaisha", "noDaisha", COUNT(*)::int as count
    FROM "Ticket"
    WHERE seksi = 'Building'
    GROUP BY "namaDaisha", "noDaisha"
    ORDER BY "namaDaisha", count DESC;
  `;
  console.table(tickets);

  console.log('\n=== ALL DISTINCT NAMA DAISHA IN TICKETS ===');
  const allTicketNames = await sql`
    SELECT seksi, "namaDaisha", COUNT(*)::int as count
    FROM "Ticket"
    GROUP BY seksi, "namaDaisha"
    ORDER BY seksi, "namaDaisha";
  `;
  console.table(allTicketNames);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
