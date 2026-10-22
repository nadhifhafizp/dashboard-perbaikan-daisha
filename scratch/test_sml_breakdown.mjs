import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    const seksi = 'Building';
    const units = await sql`
      SELECT id, nomor_daisha, jenis, nama_daisha, seksi, ukuran, last_maintenance_date
      FROM "Daisha"
      WHERE LOWER(seksi) = LOWER(${seksi})
    `;
    console.log("Total units fetched:", units.length);

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

    const map = new Map();
    units.forEach((u) => {
      const isMaintained = u.last_maintenance_date && new Date(u.last_maintenance_date) >= startOfYear && new Date(u.last_maintenance_date) <= endOfYear;
      const unitName = (u.nama_daisha || u.jenis || 'Daisha').trim();
      const rawUkuran = (u.ukuran || '').toUpperCase();
      const hasSize = rawUkuran && rawUkuran !== 'NONE';
      const sizeLabel = hasSize
        ? rawUkuran === 'SMALL' ? 'Small'
        : rawUkuran === 'MEDIUM' ? 'Medium'
        : rawUkuran === 'LARGE' ? 'Large'
        : rawUkuran
        : '';

      const key = hasSize ? `${unitName.toLowerCase()}_${rawUkuran.toLowerCase()}` : unitName.toLowerCase();
      const displayName = hasSize ? `${unitName} (${sizeLabel})` : unitName;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: unitName,
          ukuran: hasSize ? sizeLabel : undefined,
          displayName,
          total: 0,
          maintained: 0,
          unmaintained: 0,
          dailyTarget: 0,
        });
      }

      const entry = map.get(key);
      entry.total++;
      if (isMaintained) entry.maintained++;
      else entry.unmaintained++;
    });

    const workDays = 50;
    const sizeOrder = { 'Small': 1, 'Medium': 2, 'Large': 3 };

    const result = Array.from(map.values())
      .map((v) => ({
        ...v,
        dailyTarget: v.unmaintained > 0 ? Math.max(1, Math.ceil(v.unmaintained / workDays)) : 0,
      }))
      .sort((a, b) => {
        if (a.name !== b.name) {
          return b.total - a.total;
        }
        const orderA = a.ukuran ? (sizeOrder[a.ukuran] || 4) : 0;
        const orderB = b.ukuran ? (sizeOrder[b.ukuran] || 4) : 0;
        return orderA - orderB;
      });

    console.table(result.map(r => ({
      displayName: r.displayName,
      ukuran: r.ukuran || '-',
      total: r.total,
      maintained: r.maintained,
      unmaintained: r.unmaintained,
      pct: `${Math.round((r.maintained / r.total) * 100)}%`,
      dailyTarget: `${r.dailyTarget}/hari`
    })));

  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
