/**
 * lib/daishaCatalogSync.ts
 * 
 * Sinkronisasi Otomatis antara Registri Daisha (DaishaCatalog) dan Master Unit Daisha (Daisha).
 * Memastikan tabel "Daisha" dan KPI Jumlah Daisha 100% konsisten dan mengacu ke Registri Daisha.
 */
import sql from '@/lib/db';
import { invalidateMaintenanceCache } from '@/app/api/maintenance/route';

export interface SyncCatalogResult {
  success: boolean;
  totalCatalogUnits: number;
  totalMasterUnits: number;
  inserted: number;
  updated: number;
  deletedObsolete: number;
  bySeksi: Record<string, number>;
}

/**
 * Format nomor Daisha dari varian katalog secara presisi
 */
export function formatVariantUnitNumber(prefix: string, num: number, rangeFormat?: string | null, customPad?: number | null): string {
  const p = (prefix || '').trim();
  if (!p || p === 'null') {
    return `UNIT-${String(num).padStart(3, '0')}`;
  }

  // Tentukan panjang padding berdasarkan format atau prefix
  let padLen = customPad && customPad > 0 ? customPad : 4;
  if (p.startsWith('S0') || p.startsWith('M0') || p.startsWith('L0') || p.startsWith('S3') || p.startsWith('S4') || p.startsWith('M3') || p.startsWith('L3')) {
    padLen = 5;
  } else if (p.startsWith('OHA-')) {
    padLen = 3;
  } else if (rangeFormat && rangeFormat.includes('s/d')) {
    const match = rangeFormat.match(/(\d+)\s*$/);
    if (match && match[1]) {
      padLen = match[1].length;
    }
  }

  return `${p}${String(num).padStart(padLen, '0')}`;
}

/**
 * Sinkronkan tabel master "Daisha" dari data terkini tabel "DaishaCatalog"
 */
export async function syncDaishaMasterFromCatalog(): Promise<SyncCatalogResult> {
  const catalogRows = await sql<Array<{
    id: number;
    name: string;
    seksi: string;
    codePrefix: string | null;
    totalUnits: number | null;
    variants: Array<{
      id: number;
      name: string;
      ukuran?: string | null;
      susunan?: string | null;
      tipe?: string | null;
      codePrefix?: string | null;
      padLength?: number | null;
      minNumber?: number | null;
      maxNumber?: number | null;
      totalUnits?: number | null;
      rangeFormat?: string | null;
    }>;
  }>>`
    SELECT id, name, seksi, "codePrefix", "totalUnits", variants
    FROM "DaishaCatalog"
    ORDER BY id ASC
  `;

  const validUnitsMap = new Map<string, {
    nomor_daisha: string;
    nama_daisha: string;
    jenis: string;
    ukuran: string;
    seksi: string;
  }>();

  const bySeksi: Record<string, number> = {};
  let totalCatalogUnits = 0;

  for (const cat of catalogRows) {
    const seksi = cat.seksi && cat.seksi.trim() ? cat.seksi.trim() : 'Building';
    const daishaName = cat.name.trim();
    const variants = Array.isArray(cat.variants) ? cat.variants : [];

    if (variants.length > 0) {
      for (const v of variants) {
        const vUnits = Number(v.totalUnits) || 0;
        const prefix = (v.codePrefix || cat.codePrefix || '').trim();
        const minNum = Number(v.minNumber) || 1;
        const maxNum = Number(v.maxNumber) || (minNum + vUnits - 1);
        const count = vUnits > 0 ? vUnits : (maxNum >= minNum ? maxNum - minNum + 1 : 0);
        const ukuran = (v.ukuran || 'NONE').toUpperCase();

        totalCatalogUnits += count;
        bySeksi[seksi] = (bySeksi[seksi] || 0) + count;

        if (prefix && prefix !== 'null') {
          for (let i = minNum; i < minNum + count; i++) {
            const noD = formatVariantUnitNumber(prefix, i, v.rangeFormat, v.padLength);
            validUnitsMap.set(noD.toUpperCase(), {
              nomor_daisha: noD,
              nama_daisha: daishaName,
              jenis: daishaName,
              ukuran,
              seksi,
            });
          }
        } else {
          // Unit fleksibel tanpa prefix
          for (let i = 1; i <= count; i++) {
            const cleanPrefix = daishaName.replace(/[^A-Za-z0-9]/g, '').substring(0, 6).toUpperCase();
            const noD = `${cleanPrefix}-${String(i).padStart(3, '0')}`;
            validUnitsMap.set(noD.toUpperCase(), {
              nomor_daisha: noD,
              nama_daisha: daishaName,
              jenis: daishaName,
              ukuran,
              seksi,
            });
          }
        }
      }
    } else {
      // Model tanpa varian
      const count = Number(cat.totalUnits) || 1;
      totalCatalogUnits += count;
      bySeksi[seksi] = (bySeksi[seksi] || 0) + count;
      const prefix = (cat.codePrefix || '').trim();

      for (let i = 1; i <= count; i++) {
        const noD = prefix && prefix !== 'null'
          ? `${prefix}${String(i).padStart(4, '0')}`
          : `${daishaName.replace(/[^A-Za-z0-9]/g, '').substring(0, 6).toUpperCase()}-${String(i).padStart(3, '0')}`;
        validUnitsMap.set(noD.toUpperCase(), {
          nomor_daisha: noD,
          nama_daisha: daishaName,
          jenis: daishaName,
          ukuran: 'NONE',
          seksi,
        });
      }
    }
  }

  // 1. Ambil seluruh daisha yang saat ini ada di DB
  const existingDaisha = await sql<Array<{
    id: string;
    nomor_daisha: string;
    last_maintenance_date: Date | null;
    last_repair_date: Date | null;
  }>>`
    SELECT id, nomor_daisha, last_maintenance_date, last_repair_date 
    FROM "Daisha"
  `;

  const existingMap = new Map<string, { id: string; lastMaint: Date | null; lastRepair: Date | null }>();
  for (const ed of existingDaisha) {
    existingMap.set(ed.nomor_daisha.toUpperCase(), {
      id: ed.id,
      lastMaint: ed.last_maintenance_date,
      lastRepair: ed.last_repair_date,
    });
  }

  // 2. Cek unit mana yang punya referensi di Ticket atau MaintenanceLog
  const referencedUnits = await sql<Array<{ nomor: string }>>`
    SELECT DISTINCT UPPER("noDaisha") as nomor FROM "Ticket" WHERE "noDaisha" IS NOT NULL
    UNION
    SELECT DISTINCT UPPER(nomor_daisha) as nomor FROM "MaintenanceLog" WHERE nomor_daisha IS NOT NULL
  `;
  const referencedSet = new Set(referencedUnits.map((r) => r.nomor.trim().toUpperCase()));

  // 3. Batch insert / update unit dari katalog
  let inserted = 0;
  let updated = 0;

  const validUnitsList = Array.from(validUnitsMap.values());
  const batchSize = 250;

  for (let i = 0; i < validUnitsList.length; i += batchSize) {
    const chunk = validUnitsList.slice(i, i + batchSize);
    
    await sql`
      INSERT INTO "Daisha" ${sql(chunk, 'nomor_daisha', 'nama_daisha', 'jenis', 'ukuran', 'seksi')}
      ON CONFLICT ("nomor_daisha") DO UPDATE SET
        "nama_daisha" = EXCLUDED."nama_daisha",
        "jenis" = EXCLUDED."jenis",
        "ukuran" = EXCLUDED."ukuran",
        "seksi" = EXCLUDED."seksi",
        "updated_at" = NOW()
    `;

    for (const u of chunk) {
      if (existingMap.has(u.nomor_daisha.toUpperCase())) {
        updated++;
      } else {
        inserted++;
      }
    }
  }

  // 4. Hapus unit usang (yang TIDAK ADA di katalog DAN TIDAK MEMILIKI referensi di Ticket / MaintenanceLog)
  const validKeys = Array.from(validUnitsMap.keys());
  let deletedObsolete = 0;

  // Hapus unit dummy lama (misal S-001..200 dsb) yang tidak terhubung dengan log/tiket apa pun
  const deleteResult = await sql`
    DELETE FROM "Daisha"
    WHERE UPPER(nomor_daisha) NOT IN ${sql(validKeys)}
      AND UPPER(nomor_daisha) NOT IN ${sql(Array.from(referencedSet))}
      AND last_maintenance_date IS NULL
      AND last_repair_date IS NULL
    RETURNING id
  `;
  deletedObsolete = deleteResult.length;

  // 5. Invalidate cache agar API segera menampilkan data terbaru
  invalidateMaintenanceCache();

  const totalMaster = await sql`SELECT count(*)::int as c FROM "Daisha"`;

  return {
    success: true,
    totalCatalogUnits,
    totalMasterUnits: totalMaster[0].c,
    inserted,
    updated,
    deletedObsolete,
    bySeksi,
  };
}
