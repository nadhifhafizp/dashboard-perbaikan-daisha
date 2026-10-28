/**
 * lib/nomorSuratServer.ts - Server-side Generator Nomor Surat Request Seksi Bridgestone
 *
 * File ini HANYA boleh di-import di server side (API Route Handlers / Server Actions).
 */

import sql from '@/lib/db';
import { formatNomorSurat } from './nomorSurat';

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
