/**
 * lib/masterData.ts - Definisi Seksi & Tipe Data Daisha
 * Data katalog Daisha dimigrasikan ke PostgreSQL; modul ini memuat konstanta seksi dan helper kompatibilitas.
 */

export interface DaishaMasterInfo {
  seksi: string;
  jenisKerusakan: Record<string, string[]>;
}

export const DAFTAR_SEKSI = [
  'Building',
  'Cutt/Cal',
  'Banbury',
  'Extruding',
  'Bead',
  'Poly Film',
] as const;

/**
 * 6 Kategori Daisha Resmi Khusus Program Preventive Maintenance (PM) Workshop
 * Sesuai arahan operasional plant:
 * 1. Vertikal (Vertical)
 * 2. Ply
 * 3. IL (Inner Liner)
 * 4. A-Truck Nagara Filler
 * 5. B-Truck Side (Slide B-Truck)
 * 6. GT Ring
 */
export const DAFTAR_PM_DAISHA = [
  'Vertical',
  'GT Ring',
  'Ply',
  'Slide B-Truck',
  'Inner Liner',
  'A-Truck Nagara Filler',
] as const;

export type PmDaishaType = (typeof DAFTAR_PM_DAISHA)[number];

/**
 * Filter penentu kelayakan unit untuk modul & analitik PM
 */
export function isPmEligibleDaisha(jenisOrName?: string | null): boolean {
  if (!jenisOrName) return false;
  const s = jenisOrName.trim().toLowerCase();

  // 1. Vertikal
  if (s.includes('vertic') || s.includes('vertik')) return true;

  // 2. Ply
  if (s === 'ply' || s.startsWith('ply ') || s.endsWith(' ply')) return true;

  // 3. IL (Inner Liner)
  if (
    s.includes('inner liner') ||
    s.includes('innerliner') ||
    s === 'il' ||
    s.startsWith('il-') ||
    s.startsWith('il ')
  )
    return true;

  // 4. A-Truck Nagara Filler / NAGARA_FILTER
  if (
    s.includes('nagara') ||
    s.includes('nagara_filter') ||
    s.includes('a-truck nagara filler')
  )
    return true;

  // 5. B-Truck Side / Slide B-Truck
  if (
    s.includes('slide b-truck') ||
    s.includes('b-truck side') ||
    s.includes('slide b truck') ||
    s === 'b-truck' ||
    s === 'b truck'
  )
    return true;

  // 6. GT Ring
  if (s.includes('gt ring') || s.includes('gt-ring') || s.includes('gtring'))
    return true;

  return false;
}

/**
 * Normalisasi nama daisha ke 6 kategori standar PM
 */
export function getCanonicalPmJenis(raw?: string | null): string {
  if (!raw) return 'Vertical';
  const s = raw.trim();
  const lower = s.toLowerCase();

  if (lower.includes('vertic') || lower.includes('vertik')) return 'Vertical';
  if (lower === 'ply' || lower.startsWith('ply ') || lower.endsWith(' ply'))
    return 'Ply';
  if (
    lower.includes('inner liner') ||
    lower.includes('innerliner') ||
    lower === 'il' ||
    lower.startsWith('il-') ||
    lower.startsWith('il ')
  )
    return 'Inner Liner';
  if (lower.includes('nagara') || lower.includes('nagara_filter'))
    return 'A-Truck Nagara Filler';
  if (
    lower.includes('slide b-truck') ||
    lower.includes('b-truck side') ||
    lower.includes('slide b truck') ||
    lower === 'b-truck' ||
    lower === 'b truck'
  )
    return 'Slide B-Truck';
  if (
    lower.includes('gt ring') ||
    lower.includes('gt-ring') ||
    lower.includes('gtring')
  )
    return 'GT Ring';

  return s;
}

export const DAFTAR_SEMUA_DAISHA: string[] = [
  'A-Truck Nagara Filler',
  'Battery car',
  'Bead Preset',
  'Box roll side',
  'Box roll top',
  'Can Auto Pigmen',
  'Can Chemical Omny',
  'Covering',
  'Daisha auto pigmen',
  "Daisha Comp' Kiriage",
  'Daisha chip polyfilm',
  'GT Ring',
  'Inner Liner',
  'KB drum / Jikogu',
  'Layer',
  'Monowire',
  'Ohaba Chaffer',
  'Ohaba layer',
  'Omakitan (A-truck)',
  'Omakitan (B-truck)',
  'Palet B/B',
  'Ply',
  'RTB',
  'Reel Belt',
  'Reel Filler',
  'Reel Side',
  'Reel Top',
  'Slide B-Truck',
  'Transfer box roll',
  'Transfer reel belt',
  'Transfer reproses',
  'Vertical',
];

export const DAFTAR_SEMUA_KOMPONEN: string[] = [
  'Body frame',
  'Gandengan belakang',
  'Gandengan depan',
  'Roda Putar',
  'Roda tetap',
  'Plat No',
  'Tag case',
  'Hanger',
  'Dorongan',
  'Others',
];

// Pemetaan Resmi Jenis Daisha per Seksi (Sesuai Katalog Master & Form Input Kerusakan)
export const SECTION_DAISHA_MAP: Record<string, string[]> = {
  'Building': [
    'Vertical',
    'GT Ring',
    'Battery car',
    'KB drum / Jikogu',
    'Transfer reel belt',
    'Transfer reproses',
  ],
  'Extruding': [
    'A-Truck Nagara Filler',
    'Box roll side',
    'Box roll top',
    "Daisha Comp' Kiriage",
    'Reel Filler',
    'Reel Side',
    'Reel Top',
    'Slide B-Truck',
    'Transfer box roll',
  ],
  'Cutt/Cal': [
    'Inner Liner',
    'Omakitan (A-truck)',
    'Omakitan (B-truck)',
    'Ply',
    'Reel Belt',
  ],
  'Banbury': [
    'Palet B/B',
    'Can Auto Pigmen',
    'Can Chemical Omny',
    'Daisha auto pigmen',
  ],
  'Bead': [
    'Bead Preset',
    'Covering',
    'Layer',
    'Monowire',
    'Ohaba Chaffer',
    'Ohaba layer',
    'RTB',
  ],
  'Poly Film': [
    'Daisha chip polyfilm',
  ],
  'All seksi': [
    'Battery car',
  ],
};

export function getSectionDaishaList(seksi?: string): string[] {
  if (!seksi || seksi.toLowerCase() === 'all seksi' || seksi.toLowerCase() === 'semua seksi' || seksi === '') {
    return DAFTAR_SEMUA_DAISHA;
  }
  const clean = Object.keys(SECTION_DAISHA_MAP).find(
    (k) => k.toLowerCase() === seksi.toLowerCase()
  );
  return clean ? SECTION_DAISHA_MAP[clean] : DAFTAR_SEMUA_DAISHA;
}

// Pemetaan Khusus 6 Kategori Daisha PM per Seksi
export const SECTION_PM_DAISHA_MAP: Record<string, string[]> = {
  'Building': [
    'Vertical',
    'GT Ring',
  ],
  'Cutt/Cal': [
    'Ply',
    'Inner Liner',
  ],
  'Extruding': [
    'Slide B-Truck',
    'A-Truck Nagara Filler',
  ],
};

export function getSectionPmDaishaList(seksi?: string): string[] {
  if (!seksi || seksi.toLowerCase() === 'all seksi' || seksi.toLowerCase() === 'semua seksi' || seksi === '') {
    return [...DAFTAR_PM_DAISHA];
  }
  const clean = Object.keys(SECTION_PM_DAISHA_MAP).find(
    (k) => k.toLowerCase() === seksi.toLowerCase()
  );
  return clean ? SECTION_PM_DAISHA_MAP[clean] : [...DAFTAR_PM_DAISHA];
}

// Objek masterDataDaisha kosong untuk kompatibilitas tipe tanpa membebani ukuran bundle
export const masterDataDaisha: Record<string, DaishaMasterInfo> = {};

export function getDaishaBySeksi(seksi?: string): string[] {
  return getSectionDaishaList(seksi);
}

export function getKomponenKerusakan(_namaDaisha?: string): string[] {
  return DAFTAR_SEMUA_KOMPONEN;
}

export function getDetailKerusakan(_namaDaisha?: string, _komponen?: string): string[] {
  return [];
}
