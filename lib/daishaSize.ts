/**
 * lib/daishaSize.ts — Algoritma Deteksi Ukuran & Susunan Fisik Daisha
 * 
 * ============================================================================
 * FUNGSI UTAMA:
 * Mendeteksi klasifikasi ukuran fisik Daisha (Small / Medium / Large) dan
 * tingkatan susunan (Susun 3 / Susun 4) berdasarkan konvensi prefix nomor seri fisik.
 * Digunakan untuk:
 * - Badge visual di antarmuka tabel tiket & antrean
 * - Pengelompokan analitik rekapitulasi workshop
 * - Kolom otomatis pada ekspor laporan Excel
 * ============================================================================
 */

export type DaishaSize = 'Small' | 'Medium' | 'Large' | 'Other';

export interface DaishaSizeInfo {
  size: DaishaSize;
  code: 'S' | 'M' | 'L' | '?';
  label: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  description: string;
  susunan?: 'Susun 3' | 'Susun 4';
}

/**
 * Mendeteksi ukuran dan susunan Daisha secara otomatis dari nomor seri fisik.
 * 
 * Aturan Deteksi:
 * 1. Khusus GT Ring (Building):
 *    - S3... = Small (Susun 3)
 *    - S4... = Small (Susun 4)
 *    - M3... = Medium (Susun 3)
 *    - L3... = Large (Susun 3)
 * 2. Tipe Umum / Vertical:
 *    - S...  = Small
 *    - M...  = Medium
 *    - L...  = Large
 * 
 * @param noDaisha - Nomor Daisha (misal: "S30015", "S4-012", "M004")
 * @returns DaishaSizeInfo berisi data styling badge dan label, atau null jika format bebas
 */
export function detectDaishaSize(noDaisha?: string | null): DaishaSizeInfo | null {
  if (!noDaisha) return null;
  const clean = noDaisha.trim().toUpperCase().replace(/[\s\-_]/g, '');
  if (!clean) return null;

  // GT Ring khusus susunan & ukuran
  if (clean.startsWith('S3')) {
    return {
      size: 'Small',
      code: 'S',
      label: 'Small (Susun 3)',
      badgeBg: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
      description: 'GT Ring Small - Susun 3 (S30xxx)',
      susunan: 'Susun 3',
    };
  }
  if (clean.startsWith('S4')) {
    return {
      size: 'Small',
      code: 'S',
      label: 'Small (Susun 4)',
      badgeBg: 'bg-emerald-50',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-300',
      description: 'GT Ring Small - Susun 4 (S40xxx)',
      susunan: 'Susun 4',
    };
  }
  if (clean.startsWith('M3')) {
    return {
      size: 'Medium',
      code: 'M',
      label: 'Medium (Susun 3)',
      badgeBg: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-300',
      description: 'GT Ring Medium - Susun 3 (M30xxx)',
      susunan: 'Susun 3',
    };
  }
  if (clean.startsWith('L3')) {
    return {
      size: 'Large',
      code: 'L',
      label: 'Large (Susun 3)',
      badgeBg: 'bg-purple-50',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300',
      description: 'GT Ring Large - Susun 3 (L30xxx)',
      susunan: 'Susun 3',
    };
  }

  // Umum / Vertical
  const firstChar = clean.charAt(0);
  if (firstChar === 'S') {
    return {
      size: 'Small',
      code: 'S',
      label: 'Small (S)',
      badgeBg: 'bg-emerald-50',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-300',
      description: 'Unit Daisha Ukuran Kecil (Small)',
    };
  }
  if (firstChar === 'M') {
    return {
      size: 'Medium',
      code: 'M',
      label: 'Medium (M)',
      badgeBg: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
      description: 'Unit Daisha Ukuran Sedang (Medium)',
    };
  }
  if (firstChar === 'L') {
    return {
      size: 'Large',
      code: 'L',
      label: 'Large (L)',
      badgeBg: 'bg-purple-50',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300',
      description: 'Unit Daisha Ukuran Besar (Large)',
    };
  }

  return null;
}
