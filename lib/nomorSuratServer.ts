/**
 * lib/nomorSuratServer.ts - Server-side Generator Nomor Surat Request Seksi Bridgestone
 *
 * File ini HANYA boleh di-import di server side (API Route Handlers / Server Actions).
 */

import sql from '@/lib/db';
import { formatNomorSurat } from './nomorSurat';

/**
 * Generate nomor request / surat resmi berikutnya dari database (Format: NO/SEKSI/ROMAWI/TAHUN).
 * Urutan nomor (001, 002, ...) adalah urutan global terpusat per tahun kalender.
 */
export async function generateNextNomorSurat(
  seksiPemohon: string,
  approvalDate: Date = new Date(),
  customDb?: typeof sql
): Promise<string> {
  const db = customDb || sql;
  const year = approvalDate.getFullYear();
  const yearPattern = `%/${year}`;

  // Ambil seluruh nomor request & surat pada tahun yang sama
  const existingRecords = await db<Array<{ nomorSurat: string | null; nomorRequest: string | null }>>`
    SELECT "nomorSurat", "nomorRequest"
    FROM "SectionRequest"
    WHERE ("nomorSurat" LIKE ${yearPattern} OR "nomorRequest" LIKE ${yearPattern})
  `;

  let maxSeq = 0;
  for (const row of existingRecords) {
    for (const val of [row.nomorSurat, row.nomorRequest]) {
      if (!val) continue;
      // Format: NO/Seksi/Romawi/Tahun -> ambil bagian NO paling depan
      const parts = val.split('/');
      if (parts.length >= 4) {
        const parsedSeq = parseInt(parts[0], 10);
        if (!isNaN(parsedSeq) && parsedSeq > maxSeq) {
          maxSeq = parsedSeq;
        }
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return formatNomorSurat(nextSeq, seksiPemohon, approvalDate);
}

export const generateNextNomorRequest = generateNextNomorSurat;
