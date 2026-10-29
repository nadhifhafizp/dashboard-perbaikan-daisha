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
