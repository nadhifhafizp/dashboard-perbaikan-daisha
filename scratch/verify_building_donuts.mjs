import postgres from 'postgres';
import { SECTION_DAISHA_MAP, getSectionDaishaList } from '../lib/masterData.ts';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

async function run() {
  try {
    const activeSeksi = 'Building';
    const officialTypes = getSectionDaishaList(activeSeksi);
    console.log("Official types for Building:", officialTypes);

    const units = await sql`
      SELECT id, nomor_daisha, jenis, nama_daisha, seksi, last_maintenance_date
      FROM "Daisha"
      WHERE LOWER(seksi) = LOWER(${activeSeksi})
    `;
    console.log(`Total units fetched for ${activeSeksi}:`, units.length);

    const map = new Map();
    officialTypes.forEach(t => {
      map.set(t.toLowerCase(), { name: t, total: 0, maintained: 0, unmaintained: 0, dailyTarget: 0 });
    });

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

    units.forEach(u => {
      const isMaintained = u.last_maintenance_date && new Date(u.last_maintenance_date) >= startOfYear && new Date(u.last_maintenance_date) <= endOfYear;
      const unitName = (u.nama_daisha || u.jenis || '').trim();
      const unitKey = unitName.toLowerCase();
      let matchedKey = Array.from(map.keys()).find(k => k === unitKey || unitKey.includes(k) || k.includes(unitKey));
      if (!matchedKey) {
        matchedKey = unitKey;
        map.set(matchedKey, { name: unitName, total: 0, maintained: 0, unmaintained: 0, dailyTarget: 0 });
      }
      const entry = map.get(matchedKey);
      entry.total++;
      if (isMaintained) entry.maintained++;
      else entry.unmaintained++;
    });

    const remainingWorkDays = 50;
    const result = Array.from(map.values()).map(v => ({
      ...v,
      dailyTarget: v.unmaintained > 0 ? Math.max(1, Math.ceil(v.unmaintained / remainingWorkDays)) : 0
    })).sort((a, b) => b.total - a.total);

    console.log("\nSimulated 6 Donut Charts for Seksi Building:");
    console.table(result);
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
