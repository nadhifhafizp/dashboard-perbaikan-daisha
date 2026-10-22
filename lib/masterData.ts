/**
 * lib/masterData.ts — Definisi Seksi & Tipe Data Daisha
 * 
 * ============================================================================
 * CATATAN ARSITEKTUR:
 * Seluruh data katalog Daisha, varian, dan rincian kerusakan kini telah
 * dimigrasikan sepenuhnya ke database PostgreSQL (tabel DaishaType,
 * DaishaComponent, DaishaSymptom, DaishaVariant, Section).
 * Modul ini hanya menyimpan daftar konstanta seksi dan helper ringan.
 * ============================================================================
 */

export interface DaishaMasterInfo {
  seksi: string;
  jenisKerusakan: Record<string, string[]>;
}

export const DAFTAR_SEKSI = [
  'All seksi',
  'Bead',
  'Building',
  'Banbury',
  'Cutt/Cal',
  'Extruding',
  'Poly Film',
] as const;

export const DAFTAR_SEMUA_DAISHA: string[] = [
  'Battery car',
  'Bead Preset',
  'Bladder',
  'Box Roll Slide',
  'Box Roll Top',
  'Can Auto Pigmen',
  'Can Chemical Omny',
  'Covering',
  'Daisha Auto Pigmen',
  'Daisha Comp\' Kiriage',
  'Daisha Polyfilm',
  'Filter Nagara',
  'Filter Reel',
  'Flat Bed',
  'GT Ring',
  'Green Tire PSR',
  'Green Tire TBR',
  'Inner Liner',
  'KB Drum / Jikogu',
  'Layer',
  'Monowire',
  'Ohaba Chaffer',
  'Ohaba Layer',
  'Omakitan A-truck',
  'Omakitan B-truck',
  'Palet B/B',
  'Ply',
  'RTB',
  'Reel Belt',
  'Reel Top',
  'Slide B-truck',
  'Slide Reel',
  'Transfer Box Roll',
  'Transfer Reel Belt',
  'Transfer Reproses',
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
    'Battery car',
    'GT Ring',
    'KB drum / Jikogu',
    'Transfer reel belt',
    'Transfer reproses',
    'Vertical',
  ],
  'Bead': [
    'Bead Preset',
    'Covering',
    'Layer',
    'Monowire',
    'Ohaba Chaffer',
    'Ohaba layer',
    'RTB',
    'Battery car',
  ],
  'Banbury': [
    'Can Auto Pigmen',
    'Can Chemical Omny',
    'Daisha auto pigmen',
    'Palet B/B',
    'Battery car',
  ],
  'Cutt/Cal': [
    'Inner Liner',
    'Omakitan (A-truck)',
    'Omakitan (B-truck)',
    'Ply',
    'Reel Belt',
    'Battery car',
  ],
  'Extruding': [
    'Box roll side',
    'Box roll top',
    "Daisha Comp' Kiriage",
    'Nagara Filler',
    'Reel Filler',
    'Reel Side',
    'Reel Top',
    'Slide B-Truck',
    'Transfer box roll',
    'Battery car',
  ],
  'Poly Film': [
    'Daisha chip polyfilm',
    'Battery car',
  ],
};

export function getSectionDaishaList(seksi?: string): string[] {
  if (!seksi || seksi.toLowerCase() === 'all seksi') {
    return DAFTAR_SEMUA_DAISHA;
  }
  const clean = Object.keys(SECTION_DAISHA_MAP).find(
    (k) => k.toLowerCase() === seksi.toLowerCase()
  );
  return clean ? SECTION_DAISHA_MAP[clean] : DAFTAR_SEMUA_DAISHA;
}

// Objek masterDataDaisha kosong untuk kompatibilitas tipe tanpa membebani ukuran bundle
export const masterDataDaisha: Record<string, DaishaMasterInfo> = {};

export function getDaishaBySeksi(seksi?: string): string[] {
  return getSectionDaishaList(seksi);
}

export function getKomponenKerusakan(namaDaisha?: string): string[] {
  return DAFTAR_SEMUA_KOMPONEN;
}

export function getDetailKerusakan(namaDaisha?: string, komponen?: string): string[] {
  return [];
}
