/**
 * lib/daishaVariants.ts
 *
 * Definisi Type Interface dan Skema Warna Visual Seksi.
 * Seluruh data katalog varian, spesifikasi unit, dan rentang nomor seri
 * saat ini 100% tersimpan dan dikelola langsung di database PostgreSQL (tabel "DaishaVariant").
 */

export interface DaishaVariantInfo {
  id: string;
  name: string;
  ukuran?: 'Small' | 'Medium' | 'Large';
  susunan?: 'Susun 3' | 'Susun 4';
  tipe?: string;
  codePrefix: string;
  padLength?: number;
  minNumber: number;
  maxNumber: number;
  totalUnits: number;
  rangeFormat: string;
  badgeColor?: string;
}

export type SectionName =
  | 'Bead'
  | 'Banbury'
  | 'Cutt/Cal'
  | 'Extruding'
  | 'Building'
  | 'Poly Film'
  | 'All seksi';

export interface SectionMeta {
  name: SectionName;
  colorName: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  accentBorder: string;
}

/**
 * Metadata visual (skema warna badge & border) untuk masing-masing seksi di UI
 */
export const SECTION_METAS: Record<string, SectionMeta> = {
  'Bead': {
    name: 'Bead',
    colorName: 'Kuning (Yellow)',
    badgeBg: 'bg-amber-100',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-300',
    accentBorder: 'border-amber-500',
  },
  'Banbury': {
    name: 'Banbury',
    colorName: 'Hijau (Green)',
    badgeBg: 'bg-emerald-100',
    textColor: 'text-emerald-900',
    borderColor: 'border-emerald-300',
    accentBorder: 'border-emerald-500',
  },
  'Cutt/Cal': {
    name: 'Cutt/Cal',
    colorName: 'Biru Muda (Cyan)',
    badgeBg: 'bg-cyan-100',
    textColor: 'text-cyan-900',
    borderColor: 'border-cyan-300',
    accentBorder: 'border-cyan-500',
  },
  'Extruding': {
    name: 'Extruding',
    colorName: 'Beige / Cokelat Muda',
    badgeBg: 'bg-stone-100',
    textColor: 'text-stone-900',
    borderColor: 'border-stone-300',
    accentBorder: 'border-stone-500',
  },
  'Building': {
    name: 'Building',
    colorName: 'Merah (Red)',
    badgeBg: 'bg-red-100',
    textColor: 'text-red-900',
    borderColor: 'border-red-300',
    accentBorder: 'border-red-600',
  },
  'Poly Film': {
    name: 'Poly Film',
    colorName: 'Abu-abu (Grey)',
    badgeBg: 'bg-slate-100',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-300',
    accentBorder: 'border-slate-500',
  },
  'All seksi': {
    name: 'All seksi',
    colorName: 'Biru Tua (Navy)',
    badgeBg: 'bg-indigo-100',
    textColor: 'text-indigo-900',
    borderColor: 'border-indigo-300',
    accentBorder: 'border-indigo-600',
  },
};