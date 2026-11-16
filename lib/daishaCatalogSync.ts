/**
 * lib/daishaCatalogSync.ts
 * 
 * Sinkronisasi Unit Daisha dengan TWMSDaishaCatalog.
 * Memastikan tabel "TWMSDaishaCatalog" dan KPI Jumlah Daisha 100% konsisten.
 */
import sql from '@/lib/db';
import { invalidateMaintenanceCache } from '@/app/api/maintenance/route';
import { formatCanonicalDaishaNumber } from '@/lib/daishaCoding';

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
 * Format nomor Daisha dari varian katalog secara presisi sesuai standar pengkodean 29 Daisha
 */
export function formatVariantUnitNumber(prefix: string, num: number, rangeFormat?: string | null, customPad?: number | null): string {
  const p = (prefix || '').trim();
  if (!p || p === 'null') {
    return `UNIT-${String(num).padStart(3, '0')}`;
  }

  // Khusus Building Vertical (S, M, L / S00, M00, L00): total 6 karakter (cth: S00001, M00001, L00001)
  if (
    p === 'S' || p === 'M' || p === 'L' ||
    p.startsWith('S0') || p.startsWith('M0') || p.startsWith('L0')
  ) {
    const letter = p.charAt(0);
    return `${letter}${String(num).padStart(5, '0')}`;
  }

  // Khusus Building GT Ring (S3, S4, M3, L3): awalan 2 char + 4 digit (cth: S30001, S40001, M30001, L30001)
  if (
    p.startsWith('S3') || p.startsWith('S4') || p.startsWith('M3') || p.startsWith('L3')
  ) {
    const prefix2 = p.substring(0, 2);
    return `${prefix2}${String(num).padStart(4, '0')}`;
  }

  // Jika ada spesifikasi kanonikal resmi
  if (!customPad && !rangeFormat) {
    return formatCanonicalDaishaNumber(p, num);
  }

  let padLen = customPad && customPad > 0 ? customPad : 4;
  if (p.startsWith('OHA-')) {
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
 * Sinkronkan tabel master TWMSDaishaCatalog dan perbarui agregasi armada
 */
export async function syncDaishaMasterFromCatalog(): Promise<SyncCatalogResult> {
  const totalMaster = await sql`SELECT count(*)::int as c FROM "TWMSDaishaCatalog" WHERE "IsActive" = TRUE`;
  const bySeksiRows = await sql`
    SELECT COALESCE("SectionName", 'Building') as seksi, count(*)::int as count 
    FROM "TWMSDaishaCatalog" 
    WHERE "IsActive" = TRUE 
    GROUP BY "SectionName"
  `;
  const bySeksi: Record<string, number> = {};
  for (const r of bySeksiRows) {
    bySeksi[r.seksi] = r.count;
  }

  invalidateMaintenanceCache();

  const totalCount = totalMaster[0]?.c || 0;
  return {
    success: true,
    totalCatalogUnits: totalCount,
    totalMasterUnits: totalCount,
    inserted: 0,
    updated: 0,
    deletedObsolete: 0,
    bySeksi,
  };
}

/**
 * Registrasi unit baru secara instan (< 50ms) ke tabel TWMSDaishaCatalog
 */
export async function insertNewDaishaUnits(
  name: string,
  seksi: string,
  codePrefix: string | null,
  totalUnits: number,
  sizeSpec: string = 'NONE',
  startNumber: number = 1
): Promise<number> {
  if (totalUnits <= 0) return 0;

  const prefix = (codePrefix || '').trim();
  const cleanSize = (sizeSpec || 'NONE').trim().toUpperCase();
  const actualPrefix = prefix && prefix !== 'null'
    ? prefix
    : `${name.replace(/[^A-Za-z0-9]/g, '').substring(0, 6).toUpperCase()}-`;

  // Cari angka suffix tertinggi di database untuk prefix ini agar tidak pernah bentrok
  let safeStartNum = Math.max(1, startNumber);
  try {
    const existing = await sql`
      SELECT "UnitCode" 
      FROM "TWMSDaishaCatalog" 
      WHERE "UnitCode" LIKE ${actualPrefix + '%'}
    `;
    let maxNum = 0;
    for (const row of existing) {
      if (row.UnitCode) {
        const match = row.UnitCode.match(/\d+$/);
        if (match && match[0]) {
          const n = parseInt(match[0], 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      }
    }
    if (maxNum >= safeStartNum) {
      safeStartNum = maxNum + 1;
    }
  } catch (err) {
    console.error('Error finding max existing UnitCode:', err);
  }

  const unitsToInsert: Array<{
    UnitCode: string;
    DaishaType: string;
    SizeSpec: string;
    SectionName: string;
    CurrentCondition: string;
    IsActive: boolean;
  }> = [];

  for (let i = safeStartNum; i < safeStartNum + totalUnits; i++) {
    const noD = `${actualPrefix}${String(i).padStart(4, '0')}`;

    unitsToInsert.push({
      UnitCode: noD.toUpperCase(),
      DaishaType: name,
      SizeSpec: cleanSize || 'NONE',
      SectionName: seksi,
      CurrentCondition: 'OK',
      IsActive: true,
    });
  }

  if (unitsToInsert.length > 0) {
    const batchSize = 250;
    for (let i = 0; i < unitsToInsert.length; i += batchSize) {
      const chunk = unitsToInsert.slice(i, i + batchSize);
      await sql`
        INSERT INTO "TWMSDaishaCatalog" ${sql(chunk, 'UnitCode', 'DaishaType', 'SizeSpec', 'SectionName', 'CurrentCondition', 'IsActive')}
        ON CONFLICT ("UnitCode") DO UPDATE SET
          "DaishaType" = EXCLUDED."DaishaType",
          "SizeSpec" = EXCLUDED."SizeSpec",
          "SectionName" = EXCLUDED."SectionName",
          "IsActive" = TRUE,
          "UpdateDate" = NOW()
      `;
    }
  }

  invalidateMaintenanceCache();
  return unitsToInsert.length;
}
