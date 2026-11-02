import postgres from 'postgres';

const connString = process.env.DATABASE_URL || "postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(connString, { ssl: 'require', prepare: false });

async function checkMismatch() {
  try {
    // 1. Get active tickets (Open, Progress, Pending)
    const activeTickets = await sql`
      SELECT "idTiket", "noDaisha", "status", "namaPelapor", "waktuMasuk"
      FROM "Ticket"
      WHERE "status" IN ('Open', 'Progress', 'Pending')
      ORDER BY "waktuMasuk" DESC
    `;
    console.log(`Total active tickets in Ticket table: ${activeTickets.length}`);
    const activeTicketUnits = new Set(activeTickets.map(t => (t.noDaisha || '').trim().toUpperCase()));
    console.log(`Unique noDaisha in active tickets: ${activeTicketUnits.size}`);

    // 2. Get units in Daisha table with last_condition = 'RUSAK'
    const rusakDaisha = await sql`
      SELECT id, nomor_daisha, nama_daisha, seksi, last_condition, last_maintenance_date, last_repair_date
      FROM "Daisha"
      WHERE last_condition = 'RUSAK'
    `;
    console.log(`Total units with last_condition = 'RUSAK' in Daisha: ${rusakDaisha.length}`);

    // 3. Find the units that have last_condition = 'RUSAK' BUT do NOT have an active ticket
    const extraRusak = rusakDaisha.filter(d => !activeTicketUnits.has((d.nomor_daisha || '').trim().toUpperCase()));
    console.log(`\n--- 7 EXTRA UNITS IN DAISHA WITH last_condition='RUSAK' BUT NO ACTIVE TICKET (${extraRusak.length} units) ---`);
    for (const u of extraRusak) {
      console.log(`Unit: [${u.nomor_daisha}] (${u.nama_daisha || '-'}, Seksi: ${u.seksi}), last_maint: ${u.last_maintenance_date}, last_repair: ${u.last_repair_date}`);
      
      // Check tickets for this unit
      const tickets = await sql`
        SELECT "idTiket", "status", "waktuMasuk", "waktuSelesai"
        FROM "Ticket"
        WHERE UPPER(TRIM("noDaisha")) = UPPER(TRIM(${u.nomor_daisha}))
        ORDER BY "waktuMasuk" DESC
        LIMIT 5
      `;
      console.log(`  Tickets found: ${tickets.length}`);
      tickets.forEach(t => console.log(`    - Ticket ${t.idTiket}: status=${t.status}, masuk=${t.waktuMasuk}, selesai=${t.waktuSelesai}`));
    }

    // 4. Also check if there are active tickets whose units are NOT last_condition = 'RUSAK'
    const rusakDaishaSet = new Set(rusakDaisha.map(d => (d.nomor_daisha || '').trim().toUpperCase()));
    const missingRusak = activeTickets.filter(t => !rusakDaishaSet.has((t.noDaisha || '').trim().toUpperCase()));
    console.log(`\nActive tickets not marked RUSAK in Daisha: ${missingRusak.length}`);
    missingRusak.forEach(t => console.log(`  Ticket: ${t.idTiket}, Unit: [${t.noDaisha}], status: ${t.status}`));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

checkMismatch();

