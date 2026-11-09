/**
 * lib/daishaCatalogSync.ts
 * 
 * Sinkronisasi Unit Daisha dengan TWMSDaishaCatalog.
 * Memastikan tabel "TWMSDaishaCatalog" dan KPI Jumlah Daisha 100% konsisten.
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

  // Khusus Building Vertical (S00, M00, L00) & GT Ring (S30, S40, M30, L30): panjang total 6 karakter!
  if (p.startsWith('S0') || p.startsWith('M0') || p.startsWith('L0') || p.startsWith('S3') || p.startsWith('S4') || p.startsWith('M3') || p.startsWith('L3')) {
    const letter = p.charAt(0);
    return `${letter}${String(num).padStart(5, '0')}`;
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
  totalUnits: number
): Promise<number> {
  if (totalUnits <= 0) return 0;

  const prefix = (codePrefix || '').trim();
  const unitsToInsert: Array<{
    UnitCode: string;
    DaishaType: string;
    SizeSpec: string;
    SectionName: string;
    CurrentCondition: string;
  }> = [];

  for (let i = 1; i <= totalUnits; i++) {
    const noD = prefix && prefix !== 'null'
      ? `${prefix}${String(i).padStart(4, '0')}`
      : `${name.replace(/[^A-Za-z0-9]/g, '').substring(0, 6).toUpperCase()}-${String(i).padStart(3, '0')}`;

    unitsToInsert.push({
      UnitCode: noD.toUpperCase(),
      DaishaType: name,
      SizeSpec: 'NONE',
      SectionName: seksi,
      CurrentCondition: 'OK',
    });
  }

  if (unitsToInsert.length > 0) {
    const batchSize = 250;
    for (let i = 0; i < unitsToInsert.length; i += batchSize) {
      const chunk = unitsToInsert.slice(i, i + batchSize);
      await sql`
        INSERT INTO "TWMSDaishaCatalog" ("UnitCode", "DaishaType", "SizeSpec", "SectionName", "CurrentCondition", "UpdateDate")
        SELECT 
          u."UnitCode", u."DaishaType", u."SizeSpec", u."SectionName", u."CurrentCondition", NOW()
        FROM ${sql(chunk, 'UnitCode', 'DaishaType', 'SizeSpec', 'SectionName', 'CurrentCondition')} AS u
        ON CONFLICT ("UnitCode") DO UPDATE SET
          "DaishaType" = EXCLUDED."DaishaType",
          "SectionName" = EXCLUDED."SectionName",
          "UpdateDate" = NOW()
      `;
    }
  }

  invalidateMaintenanceCache();
  return unitsToInsert.length;
}
