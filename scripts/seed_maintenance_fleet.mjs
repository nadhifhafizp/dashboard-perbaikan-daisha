import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function seed() {
  try {
    const existingCount = await sql`SELECT count(*) as count FROM "Daisha"`;
    console.log('Current Daisha count:', existingCount[0].count);

    if (parseInt(existingCount[0].count, 10) > 0) {
      console.log('Daisha table already has records. Checking details...');
      const summary = await sql`
        SELECT jenis, ukuran, count(*) as count 
        FROM "Daisha" 
        GROUP BY jenis, ukuran 
        ORDER BY jenis, ukuran
      `;
      console.log('Current summary:', summary);
      return;
    }

    console.log('Seeding Master Daisha fleet...');
    const unitsToInsert = [];

    // 1. Daisha Vertical - Small (1..200)
    for (let i = 1; i <= 200; i++) {
      const pad = String(i).padStart(3, '0');
      unitsToInsert.push({
        nomor_daisha: `S-${pad}`,
        jenis: 'VERTICAL',
        ukuran: 'SMALL',
      });
    }

    // 2. Daisha Vertical - Medium (1..200)
    for (let i = 1; i <= 200; i++) {
      const pad = String(i).padStart(3, '0');
      unitsToInsert.push({
        nomor_daisha: `M-${pad}`,
        jenis: 'VERTICAL',
        ukuran: 'MEDIUM',
      });
    }

    // 3. Daisha Vertical - Large (1..200)
    for (let i = 1; i <= 200; i++) {
      const pad = String(i).padStart(3, '0');
      unitsToInsert.push({
        nomor_daisha: `L-${pad}`,
        jenis: 'VERTICAL',
        ukuran: 'LARGE',
      });
    }

    // 4. Daisha Nagara Filter (1..50)
    for (let i = 1; i <= 50; i++) {
      const pad = String(i).padStart(2, '0');
      unitsToInsert.push({
        nomor_daisha: `NF-${pad}`,
        jenis: 'NAGARA_FILTER',
        ukuran: 'NONE',
      });
    }

    console.log(`Inserting ${unitsToInsert.length} units in batches...`);
    const chunkSize = 100;
    for (let i = 0; i < unitsToInsert.length; i += chunkSize) {
      const chunk = unitsToInsert.slice(i, i + chunkSize);
      await sql`
        INSERT INTO "Daisha" ("nomor_daisha", "jenis", "ukuran")
        VALUES ${sql(chunk.map(u => [u.nomor_daisha, u.jenis, u.ukuran]))}
        ON CONFLICT ("nomor_daisha") DO NOTHING
      `;
    }

    // Seed some initial maintenance logs for 2026 to show realistic data
    console.log('Seeding sample maintenance & repair records in 2026...');
    const allDaisha = await sql`SELECT id, nomor_daisha, jenis, ukuran FROM "Daisha"`;
    
    const logsToInsert = [];
    // Say ~35% of Small, ~40% of Medium, ~30% of Large, and ~45% of Nagara Filter have been maintained in 2026
    const now = new Date('2026-10-01T09:00:00Z');
    
    for (const d of allDaisha) {
      const num = parseInt(d.nomor_daisha.replace(/\D/g, ''), 10) || 1;
      let maintained = false;
      let daysAgo = 0;
      let jobType = 'RUTIN';

      if (d.ukuran === 'SMALL' && num <= 70) {
        maintained = true;
        daysAgo = (num * 3) % 200 + 5;
        jobType = num % 4 === 0 ? 'REPAIR' : 'RUTIN';
      } else if (d.ukuran === 'MEDIUM' && num <= 85) {
        maintained = true;
        daysAgo = (num * 2.5) % 220 + 2;
        jobType = num % 3 === 0 ? 'REPAIR' : 'RUTIN';
      } else if (d.ukuran === 'LARGE' && num <= 60) {
        maintained = true;
        daysAgo = (num * 4) % 240 + 7;
        jobType = num % 5 === 0 ? 'REPAIR' : 'RUTIN';
      } else if (d.jenis === 'NAGARA_FILTER' && num <= 22) {
        maintained = true;
        daysAgo = (num * 8) % 200 + 10;
        jobType = num % 2 === 0 ? 'REPAIR' : 'RUTIN';
      }

      if (maintained) {
        const logDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        logsToInsert.push({
          daisha_id: d.id,
          nomor_daisha: d.nomor_daisha,
          jenis_pekerjaan: jobType,
          tanggal_pengerjaan: logDate,
          admin_id: 'Darman (Admin)',
          catatan: jobType === 'REPAIR' ? 'Perbaikan roda & stopper' : 'Pemeliharaan tahunan rutin',
        });

        await sql`
          UPDATE "Daisha"
          SET "last_maintenance_date" = ${logDate}
          WHERE id = ${d.id}
        `;
      }
    }

    if (logsToInsert.length > 0) {
      for (let i = 0; i < logsToInsert.length; i += chunkSize) {
        const chunk = logsToInsert.slice(i, i + chunkSize);
        await sql`
          INSERT INTO "MaintenanceLog" ("daisha_id", "nomor_daisha", "jenis_pekerjaan", "tanggal_pengerjaan", "admin_id", "catatan")
          VALUES ${sql(chunk.map(l => [l.daisha_id, l.nomor_daisha, l.jenis_pekerjaan, l.tanggal_pengerjaan, l.admin_id, l.catatan]))}
        `;
      }
    }

    console.log(`Seeding complete! ${logsToInsert.length} logs inserted.`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await sql.end();
  }
}

seed();
