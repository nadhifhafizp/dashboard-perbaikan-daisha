import postgres from 'postgres';

const connString = process.env.DATABASE_URL || "postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(connString, { ssl: 'require', prepare: false });

async function checkSync() {
  // Ambil semua tiket aktif
  const activeTickets = await sql`
    SELECT "idTiket", "noDaisha", "status"
    FROM "Ticket"
    WHERE status IN ('Open', 'Progress', 'Pending')
  `;
  console.log('Total tiket antre workshop (Open / Progress):', activeTickets.length);

  // Ambil unit yang berstatus RUSAK di Daisha
  const rusakDaisha = await sql`
    SELECT id, nomor_daisha, seksi, last_condition
    FROM "Daisha"
    WHERE last_condition = 'RUSAK'
  `;
  console.log('Total Daisha kondisi RUSAK:', rusakDaisha.length);

  const activeTicketNos = new Set(activeTickets.map(t => (t.noDaisha || '').trim().toUpperCase()));
  const rusakNos = new Set(rusakDaisha.map(d => (d.nomor_daisha || '').trim().toUpperCase()));

  console.log('Active tickets unique units:', activeTicketNos.size);
  console.log('Rusak daisha unique units:', rusakNos.size);

  // Cari unit yang ada di Ticket tapi tidak RUSAK di Daisha
  const ticketNotRusak = [];
  for (const t of activeTickets) {
    const n = (t.noDaisha || '').trim().toUpperCase();
    if (!rusakNos.has(n)) {
      ticketNotRusak.push(t);
    }
  }
  console.log('Ticket active but Daisha not RUSAK:', ticketNotRusak);

  // Cari unit yang RUSAK di Daisha tapi tidak ada di active tickets
  const rusakNoTicket = [];
  for (const d of rusakDaisha) {
    const n = (d.nomor_daisha || '').trim().toUpperCase();
    if (!activeTicketNos.has(n)) {
      rusakNoTicket.push(d);
    }
  }
  console.log('Daisha RUSAK but has no active ticket:', rusakNoTicket);

  await sql.end();
}

checkSync();

