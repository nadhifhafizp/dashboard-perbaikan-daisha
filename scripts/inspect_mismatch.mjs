import postgres from 'postgres';

const connString = process.env.DATABASE_URL || "postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(connString, { ssl: 'require', prepare: false });

async function run() {
  const activeTickets = await sql`SELECT "idTiket", "noDaisha", status, "waktuMasuk" FROM "Ticket" WHERE status IN ('Open', 'Progress', 'Pending')`;
  const doneTickets = await sql`SELECT "idTiket", "noDaisha", status FROM "Ticket" WHERE status = 'Done'`;
  const allTickets = await sql`SELECT "idTiket", "noDaisha", status FROM "Ticket"`;
  const rusakDaisha = await sql`SELECT id, nomor_daisha, seksi, last_condition FROM "Daisha" WHERE last_condition = 'RUSAK'`;
  const allDaisha = await sql`SELECT id, nomor_daisha, seksi, last_condition FROM "Daisha"`;

  console.log('--- DB SUMMARY ---');
  console.log('Total Daisha in DB:', allDaisha.length);
  console.log('Total Tickets in DB:', allTickets.length);
  console.log('Active tickets count in DB:', activeTickets.length);
  console.log('Done tickets count in DB:', doneTickets.length);
  console.log('Rusak Daisha count in DB:', rusakDaisha.length);

  // Check 90 days filter if any
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const activeIn90 = activeTickets.filter(t => new Date(t.waktuMasuk) >= ninetyDaysAgo);
  const activeOlder90 = activeTickets.filter(t => new Date(t.waktuMasuk) < ninetyDaysAgo);
  console.log('Active tickets within 90 days:', activeIn90.length);
  console.log('Active tickets older than 90 days:', activeOlder90.length);

  const activeTicketNos = new Set(activeTickets.map(t => (t.noDaisha || '').trim().toUpperCase()));
  const rusakDaishaNos = new Set(rusakDaisha.map(d => (d.nomor_daisha || '').trim().toUpperCase()));

  console.log('Unique active ticket noDaisha:', activeTicketNos.size);
  console.log('Unique rusak daisha noDaisha:', rusakDaishaNos.size);

  const inDaishaNotTickets = [];
  for (const d of rusakDaisha) {
    const norm = (d.nomor_daisha || '').trim().toUpperCase();
    if (!activeTicketNos.has(norm)) {
      inDaishaNotTickets.push(d);
    }
  }

  const inTicketsNotDaisha = [];
  for (const t of activeTickets) {
    const norm = (t.noDaisha || '').trim().toUpperCase();
    if (!rusakDaishaNos.has(norm)) {
      inTicketsNotDaisha.push(t);
    }
  }

  console.log('Daisha RUSAK but NOT in active tickets (count):', inDaishaNotTickets.length);
  console.log('Details of Daisha RUSAK but NOT in active tickets:', inDaishaNotTickets);

  console.log('Active tickets but Daisha NOT RUSAK (count):', inTicketsNotDaisha.length);
  console.log('Details of Active tickets but Daisha NOT RUSAK:', inTicketsNotDaisha);

  await sql.end();
}

run();
