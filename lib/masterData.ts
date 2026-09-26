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

// Objek masterDataDaisha kosong untuk kompatibilitas tipe tanpa membebani ukuran bundle
export const masterDataDaisha: Record<string, DaishaMasterInfo> = {};

export function getDaishaBySeksi(seksi?: string): string[] {
  if (!seksi || seksi.toLowerCase() === 'all seksi') return DAFTAR_SEMUA_DAISHA;
  return DAFTAR_SEMUA_DAISHA;
}

export function getKomponenKerusakan(namaDaisha?: string): string[] {
  return DAFTAR_SEMUA_KOMPONEN;
}

export function getDetailKerusakan(namaDaisha?: string, komponen?: string): string[] {
  return [];
}
