/**
 * lib/daishaCoding.ts
 *
 * Standar Pengkodean Resmi 29 Daisha Plant Bridgestone.
 * Referensi kanonikal untuk format kode, awalan (prefix), panjang nomor seri,
 * serta pemetaan ke Seksi dan Jenis Daisha.
 */

export interface DaishaCodeSpec {
  no: number;
  seksi: string;
  namaDaisha: string;
  kodeContoh: string;
  codePrefix: string;
  padLength: number;
  // Metadata untuk klasifikasi varian
  jenisDaisha: string;
  ukuran?: 'Small' | 'Medium' | 'Large';
  susunan?: 'Susun 3' | 'Susun 4';
}

/**
 * Tabel 29 Spesifikasi Pengkodean Daisha Bridgestone
 */
export const DAISHA_CANONICAL_SPECS: DaishaCodeSpec[] = [
  // 1-7: Seksi Bead
  {
    no: 1,
    seksi: 'Bead',
    namaDaisha: 'Bead Preset',
    kodeContoh: 'B/P---0001',
    codePrefix: 'B/P---',
    padLength: 4,
    jenisDaisha: 'Bead Preset',
  },
  {
    no: 2,
    seksi: 'Bead',
    namaDaisha: 'Covering',
    kodeContoh: 'COV---0001',
    codePrefix: 'COV---',
    padLength: 4,
    jenisDaisha: 'Covering',
  },
  {
    no: 3,
    seksi: 'Bead',
    namaDaisha: 'Layer',
    kodeContoh: 'LAYER-0001',
    codePrefix: 'LAYER-',
    padLength: 4,
    jenisDaisha: 'Layer',
  },
  {
    no: 4,
    seksi: 'Bead',
    namaDaisha: 'Monowire',
    kodeContoh: 'MONO--0001',
    codePrefix: 'MONO--',
    padLength: 4,
    jenisDaisha: 'Monowire',
  },
  {
    no: 5,
    seksi: 'Bead',
    namaDaisha: 'Ohaba Chaffer',
    kodeContoh: 'OHA-CH-001',
    codePrefix: 'OHA-CH-',
    padLength: 3,
    jenisDaisha: 'Ohaba Chaffer',
  },
  {
    no: 6,
    seksi: 'Bead',
    namaDaisha: 'Ohaba Layer',
    kodeContoh: 'OHA-LY-001',
    codePrefix: 'OHA-LY-',
    padLength: 3,
    jenisDaisha: 'Ohaba layer',
  },
  {
    no: 7,
    seksi: 'Bead',
    namaDaisha: 'RTB',
    kodeContoh: 'RTBF--0001',
    codePrefix: 'RTBF--',
    padLength: 4,
    jenisDaisha: 'RTB',
  },

  // 8-10: Seksi Banbury
  {
    no: 8,
    seksi: 'Banbury',
    namaDaisha: 'Palet B/B Type A',
    kodeContoh: 'BAN-A-0001',
    codePrefix: 'BAN-A-',
    padLength: 4,
    jenisDaisha: 'Palet B/B',
  },
  {
    no: 9,
    seksi: 'Banbury',
    namaDaisha: 'Palet B/B Type B',
    kodeContoh: 'BAN-B-0001',
    codePrefix: 'BAN-B-',
    padLength: 4,
    jenisDaisha: 'Palet B/B',
  },
  {
    no: 10,
    seksi: 'Banbury',
    namaDaisha: 'Palet B/B Type C',
    kodeContoh: 'BAN-C-0001',
    codePrefix: 'BAN-C-',
    padLength: 4,
    jenisDaisha: 'Palet B/B',
  },

  // 11-14: Seksi Cutt/Cal
  {
    no: 11,
    seksi: 'Cutt/Cal',
    namaDaisha: 'Inner Liner',
    kodeContoh: 'I/L---0001',
    codePrefix: 'I/L---',
    padLength: 4,
    jenisDaisha: 'Inner Liner',
  },
  {
    no: 12,
    seksi: 'Cutt/Cal',
    namaDaisha: 'Omakitan (A-truck)',
    kodeContoh: 'CAL---0001',
    codePrefix: 'CAL---',
    padLength: 4,
    jenisDaisha: 'Omakitan (A-truck)',
  },
  {
    no: 13,
    seksi: 'Cutt/Cal',
    namaDaisha: 'Ply',
    kodeContoh: 'PLY---0001',
    codePrefix: 'PLY---',
    padLength: 4,
    jenisDaisha: 'Ply',
  },
  {
    no: 14,
    seksi: 'Cutt/Cal',
    namaDaisha: 'Reel Belt',
    kodeContoh: 'BELT--0001',
    codePrefix: 'BELT--',
    padLength: 4,
    jenisDaisha: 'Reel Belt',
  },

  // 15-20: Seksi Extruding
  {
    no: 15,
    seksi: 'Extruding',
    namaDaisha: 'Reel Filler',
    kodeContoh: 'FIL-A-0001',
    codePrefix: 'FIL-A-',
    padLength: 4,
    jenisDaisha: 'Reel Filler',
  },
  {
    no: 16,
    seksi: 'Extruding',
    namaDaisha: 'Nagara Filler',
    kodeContoh: 'FIL-B-0001',
    codePrefix: 'FIL-B-',
    padLength: 4,
    jenisDaisha: 'A-Truck Nagara Filler',
  },
  {
    no: 17,
    seksi: 'Extruding',
    namaDaisha: 'Reel Side',
    kodeContoh: 'SIDE-A0001',
    codePrefix: 'SIDE-A',
    padLength: 4,
    jenisDaisha: 'Reel Side',
  },
  {
    no: 18,
    seksi: 'Extruding',
    namaDaisha: 'B-TRUCK SIDE',
    kodeContoh: 'SIDE-B0001',
    codePrefix: 'SIDE-B',
    padLength: 4,
    jenisDaisha: 'Slide B-Truck',
  },
  {
    no: 19,
    seksi: 'Extruding',
    namaDaisha: 'Reel Top Biasa',
    kodeContoh: 'TOP-A-0001',
    codePrefix: 'TOP-A-',
    padLength: 4,
    jenisDaisha: 'Reel Top',
  },
  {
    no: 20,
    seksi: 'Extruding',
    namaDaisha: 'Reel Top Sansuki',
    kodeContoh: 'TOP-B-0001',
    codePrefix: 'TOP-B-',
    padLength: 4,
    jenisDaisha: 'Reel Top Sansuki',
  },

  // 21-24: Seksi Building (GT Ring)
  {
    no: 21,
    seksi: 'Building',
    namaDaisha: 'GT Ring Small Susun 3',
    kodeContoh: 'S30001',
    codePrefix: 'S3',
    padLength: 4,
    jenisDaisha: 'GT Ring',
    ukuran: 'Small',
    susunan: 'Susun 3',
  },
  {
    no: 22,
    seksi: 'Building',
    namaDaisha: 'GT Ring Small Susun 4',
    kodeContoh: 'S40001',
    codePrefix: 'S4',
    padLength: 4,
    jenisDaisha: 'GT Ring',
    ukuran: 'Small',
    susunan: 'Susun 4',
  },
  {
    no: 23,
    seksi: 'Building',
    namaDaisha: 'GT Ring Medium Susun 3',
    kodeContoh: 'M30001',
    codePrefix: 'M3',
    padLength: 4,
    jenisDaisha: 'GT Ring',
    ukuran: 'Medium',
    susunan: 'Susun 3',
  },
  {
    no: 24,
    seksi: 'Building',
    namaDaisha: 'GT Ring Large Susun 3',
    kodeContoh: 'L30001',
    codePrefix: 'L3',
    padLength: 4,
    jenisDaisha: 'GT Ring',
    ukuran: 'Large',
    susunan: 'Susun 3',
  },

  // 25-27: Seksi Building (Vertical)
  {
    no: 25,
    seksi: 'Building',
    namaDaisha: 'Vertical-Small',
    kodeContoh: 'S00001',
    codePrefix: 'S',
    padLength: 5,
    jenisDaisha: 'Vertical',
    ukuran: 'Small',
  },
  {
    no: 26,
    seksi: 'Building',
    namaDaisha: 'Vertical-Medium',
    kodeContoh: 'M00001',
    codePrefix: 'M',
    padLength: 5,
    jenisDaisha: 'Vertical',
    ukuran: 'Medium',
  },
  {
    no: 27,
    seksi: 'Building',
    namaDaisha: 'Vertical-Big/Large',
    kodeContoh: 'L00001',
    codePrefix: 'L',
    padLength: 5,
    jenisDaisha: 'Vertical',
    ukuran: 'Large',
  },

  // 28-29: Seksi Extruding (Box Roll)
  {
    no: 28,
    seksi: 'Extruding',
    namaDaisha: 'Box Roll Side',
    kodeContoh: 'B-SIDE0001',
    codePrefix: 'B-SIDE',
    padLength: 4,
    jenisDaisha: 'Box roll side',
  },
  {
    no: 29,
    seksi: 'Extruding',
    namaDaisha: 'Box Roll Top',
    kodeContoh: 'B-TOP-0001',
    codePrefix: 'B-TOP-',
    padLength: 4,
    jenisDaisha: 'Box roll top',
  },
];

/**
 * Mencari spesifikasi kode berdasarkan nama daisha, ukuran, atau susunan
 */
export function findDaishaCodeSpec(
  namaDaisha: string,
  ukuran?: string | null,
  susunan?: string | null
): DaishaCodeSpec | undefined {
  if (!namaDaisha) return undefined;
  const cleanName = namaDaisha.trim().toLowerCase();

  // 1. Cek kecocokan nama langsung (cth: 'GT Ring Small Susun 3', 'Vertical-Medium')
  const direct = DAISHA_CANONICAL_SPECS.find(
    (s) => s.namaDaisha.toLowerCase() === cleanName
  );
  if (direct) return direct;

  // 2. Cek kecocokan jenisDaisha + ukuran + susunan
  const match = DAISHA_CANONICAL_SPECS.find((s) => {
    const isJenisMatch =
      s.jenisDaisha.toLowerCase() === cleanName ||
      cleanName.includes(s.jenisDaisha.toLowerCase());
    if (!isJenisMatch) return false;

    if (ukuran && s.ukuran) {
      if (s.ukuran.toLowerCase() !== ukuran.toLowerCase()) return false;
    }
    if (susunan && s.susunan) {
      if (s.susunan.toLowerCase() !== susunan.toLowerCase()) return false;
    }
    return true;
  });

  return match;
}

/**
 * Mendeteksi Seksi dan Jenis Daisha otomatis dari nomor fisik / barcode unit
 */
export function detectDaishaByUnitCode(
  noDaisha?: string | null
): { spec: DaishaCodeSpec; seksi: string; jenisDaisha: string } | null {
  if (!noDaisha) return null;
  const raw = noDaisha.trim().toUpperCase();
  const cleanNo = raw.replace(/[\s\-_]/g, '');
  if (!cleanNo) return null;

  // Urutkan spesifikasi dari prefix terpanjang lebih dulu
  const sorted = [...DAISHA_CANONICAL_SPECS].sort(
    (a, b) => b.codePrefix.length - a.codePrefix.length
  );

  // 1. Cek exact prefix match dengan format asli
  for (const s of sorted) {
    if (raw.startsWith(s.codePrefix.toUpperCase())) {
      return { spec: s, seksi: s.seksi, jenisDaisha: s.jenisDaisha };
    }
  }

  // 2. Cek prefix match setelah normalisasi simbol (- / _)
  for (const s of sorted) {
    const cleanPrefix = s.codePrefix.replace(/[\s\-_]/g, '').toUpperCase();
    if (cleanPrefix && cleanNo.startsWith(cleanPrefix)) {
      return { spec: s, seksi: s.seksi, jenisDaisha: s.jenisDaisha };
    }
  }

  // 3. Fallback cerdas untuk nomor Vertical (S00xxx, M00xxx, L00xxx)
  const firstChar = cleanNo.charAt(0);
  if (firstChar === 'M') {
    const spec = DAISHA_CANONICAL_SPECS.find((s) => s.no === 26)!; // Vertical-Medium
    return { spec, seksi: 'Building', jenisDaisha: 'Vertical' };
  }
  if (firstChar === 'L') {
    const spec = DAISHA_CANONICAL_SPECS.find((s) => s.no === 27)!; // Vertical-Big/Large
    return { spec, seksi: 'Building', jenisDaisha: 'Vertical' };
  }
  if (firstChar === 'S') {
    const spec = DAISHA_CANONICAL_SPECS.find((s) => s.no === 25)!; // Vertical-Small
    return { spec, seksi: 'Building', jenisDaisha: 'Vertical' };
  }

  return null;
}

/**
 * Format nomor Daisha dari awalan prefix dan angka urut
 */
export function formatCanonicalDaishaNumber(prefix: string, num: number): string {
  const p = (prefix || '').trim();
  if (!p) return `UNIT-${String(num).padStart(4, '0')}`;

  const spec = DAISHA_CANONICAL_SPECS.find(
    (s) =>
      s.codePrefix.toUpperCase() === p.toUpperCase() ||
      s.codePrefix.replace(/[\s\-_]/g, '').toUpperCase() ===
        p.replace(/[\s\-_]/g, '').toUpperCase()
  );

  if (spec) {
    return `${spec.codePrefix}${String(num).padStart(spec.padLength, '0')}`;
  }

  // Fallback standar
  if (p === 'S' || p === 'M' || p === 'L') {
    return `${p}${String(num).padStart(5, '0')}`;
  }
  if (p === 'S3' || p === 'S4' || p === 'M3' || p === 'L3') {
    return `${p}${String(num).padStart(4, '0')}`;
  }
  if (p.startsWith('OHA-')) {
    return `${p}${String(num).padStart(3, '0')}`;
  }

  return `${p}${String(num).padStart(4, '0')}`;
}
