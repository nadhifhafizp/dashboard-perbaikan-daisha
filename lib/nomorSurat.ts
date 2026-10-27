/**
 * lib/nomorSurat.ts — Format Standar Nomor Surat / Nomor Tiket Request Seksi Bridgestone
 *
 * Format Baku: NO/Seksi/Romawi/Tahun
 * Contoh: 001/BEAD/X/2026, 002/EXTD/X/2026
 *
 * Sesuai kesepakatan administrasi (Opsi A - Terpusat):
 * Urutan nomor (NO) bersifat satu kesatuan global dari Workshop / Special Project
 * dan di-reset setiap pergantian tahun kalender.
 */

import sql from '@/lib/db';

export const SEKSI_CODE_MAP: Record<string, string> = {
  HRGA: 'HRGA',
  QA: 'QA',
  TEKNIKAL: 'TECH',
  TECHNICAL: 'TECH',
  LABORAT: 'LAB',
  LABORATORIUM: 'LAB',
  BANBURRY: 'B/B',
  BANBURY: 'B/B',
  EXTRUDING: 'EXTD',
  'CUTTING/CALENDER': 'CUT/CAL',
  'CUTTING / CALENDER': 'CUT/CAL',
  CUTTING: 'CUT/CAL',
  CALENDER: 'CUT/CAL',
  BEAD: 'BEAD',
  BUILDING: 'BUILD',
  CURING: 'CURE',
  'FINAL INPECTION': 'FINAL',
  'FINAL INSPECTION': 'FINAL',
  RMW: 'RMW',
  TWH: 'TWH',
  'TIRE EVAL': 'EVAL',
  'TIRE EVALUATION': 'EVAL',
  EVALUATION: 'EVAL',
  ENGINEERING: 'ENG',
};

export const ROMAN_MONTHS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
};

/**
 * Mengubah angka bulan (1 - 12) atau objek Date menjadi angka Romawi.
 */
export function getRomanMonth(dateOrMonth: number | Date = new Date()): string {
  const month = dateOrMonth instanceof Date ? dateOrMonth.getMonth() + 1 : dateOrMonth;
  return ROMAN_MONTHS[month] || 'I';
}

/**
 * Mengonversi nama seksi pemohon menjadi kode singkatan resmi Bridgestone.
 */
export function getSeksiCode(seksiName: string | null | undefined): string {
  if (!seksiName) return 'GEN';
  const clean = seksiName.trim().toUpperCase();

  // 1. Direct match
  if (SEKSI_CODE_MAP[clean]) {
    return SEKSI_CODE_MAP[clean];
  }

  // 2. Partial match (misal ada tambahan kata seperti 'Seksi Bead' atau 'Produksi')
  for (const [key, val] of Object.entries(SEKSI_CODE_MAP)) {
    if (clean.includes(key)) {
      return val;
    }
  }

  // Fallback: hapus karakter non-alfanumerik dan ambil max 6 karakter
  return clean.replace(/[^A-Z0-9/]/g, '').slice(0, 6) || 'SEKSI';
}

/**
 * Format string nomor surat dari komponen terpisah.
 */
export function formatNomorSurat(seq: number, seksiName: string, date: Date = new Date()): string {
  const noStr = String(seq).padStart(3, '0');
  const code = getSeksiCode(seksiName);
  const romanMonth = getRomanMonth(date);
  const year = date.getFullYear();

  return `${noStr}/${code}/${romanMonth}/${year}`;
}

/**
 * Generate nomor surat resmi berikutnya dari database (Opsi A - Global Sequence per Tahun).
 */
export async function generateNextNomorSurat(
  seksiPemohon: string,
  approvalDate: Date = new Date(),
  customDb?: typeof sql
): Promise<string> {
  const db = customDb || sql;
  const year = approvalDate.getFullYear();
  const yearPattern = `%/${year}`;

  // Ambil seluruh nomor surat pada tahun yang sama
  const existingRecords = await db<Array<{ nomorSurat: string }>>`
    SELECT "nomorSurat"
    FROM "SectionRequest"
    WHERE "nomorSurat" IS NOT NULL
      AND "nomorSurat" LIKE ${yearPattern}
  `;

  let maxSeq = 0;
  for (const row of existingRecords) {
    if (!row.nomorSurat) continue;
    // Format: NO/Seksi/Romawi/Tahun -> ambil bagian NO paling depan
    const parts = row.nomorSurat.split('/');
    if (parts.length >= 4) {
      const parsedSeq = parseInt(parts[0], 10);
      if (!isNaN(parsedSeq) && parsedSeq > maxSeq) {
        maxSeq = parsedSeq;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return formatNomorSurat(nextSeq, seksiPemohon, approvalDate);
}
