import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kluouijxuflfphzxdhqr:rmWQ9PrXuvr8ZaDF@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(DATABASE_URL, { ssl: 'require', prepare: false });

async function main() {
  console.log('Seeding missing types into Daisha...');

  const missingGroups = [
    // Building (5 units each for smooth demonstration & tracking)
    { seksi: 'Building', jenis: 'Battery car', namaDaisha: 'Battery car', prefix: 'BC', count: 10 },
    { seksi: 'Building', jenis: 'KB drum / Jikogu', namaDaisha: 'KB drum / Jikogu', prefix: 'KBD', count: 15 },
    { seksi: 'Building', jenis: 'Transfer reel belt', namaDaisha: 'Transfer reel belt', prefix: 'TRB', count: 10 },
    { seksi: 'Building', jenis: 'Transfer reproses', namaDaisha: 'Transfer reproses', prefix: 'TRP', count: 10 },

    // Banbury
    { seksi: 'Banbury', jenis: 'Can Chemical Omny', namaDaisha: 'Can Chemical Omny', prefix: 'CCO', count: 10 },
    { seksi: 'Banbury', jenis: 'Daisha auto pigmen', namaDaisha: 'Daisha auto pigmen', prefix: 'DAP', count: 10 },

    // Cutt/Cal
    { seksi: 'Cutt/Cal', jenis: 'Omakitan (B-truck)', namaDaisha: 'Omakitan (B-truck)', prefix: 'OMKB', count: 10 },

    // Extruding
    { seksi: 'Extruding', jenis: "Daisha Comp' Kiriage", namaDaisha: "Daisha Comp' Kiriage", prefix: 'DCK', count: 10 },
    { seksi: 'Extruding', jenis: 'Transfer box roll', namaDaisha: 'Transfer box roll', prefix: 'TBR', count: 10 },

    // Poly Film
    { seksi: 'Poly Film', jenis: 'Daisha chip polyfilm', namaDaisha: 'Daisha chip polyfilm', prefix: 'DCP', count: 10 },
  ];

  for (const g of missingGroups) {
    for (let i = 1; i <= g.count; i++) {
      const pad = String(i).padStart(3, '0');
      const noDaisha = `${g.prefix}-${pad}`;

      await sql`
        INSERT INTO "Daisha" ("nomor_daisha", "jenis", "nama_daisha", "ukuran", "seksi")
        VALUES (${noDaisha}, ${g.jenis}, ${g.namaDaisha}, 'NONE', ${g.seksi})
        ON CONFLICT ("nomor_daisha") DO UPDATE
        SET "seksi" = ${g.seksi}, "jenis" = ${g.jenis}, "nama_daisha" = ${g.namaDaisha}, "ukuran" = 'NONE';
      `;
    }
    console.log(`Seeded ${g.count} units for ${g.jenis} (${g.seksi})`);
  }

  // Also update totalUnits in DaishaType for these types
  for (const g of missingGroups) {
    await sql`
      UPDATE "DaishaType"
      SET "totalUnits" = ${g.count}
      WHERE LOWER(name) = LOWER(${g.jenis});
    `;
    await sql`
      UPDATE "DaishaVariant"
      SET "totalUnits" = ${g.count}
      WHERE LOWER(name) = LOWER(${g.jenis});
    `;
  }

  console.log('All missing types successfully inserted into Daisha and synced to MasterDaisha!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
