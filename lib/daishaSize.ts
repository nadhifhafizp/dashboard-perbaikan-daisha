export type DaishaSize = 'Small' | 'Medium' | 'Large' | 'Other';

export interface DaishaSizeInfo {
  size: DaishaSize;
  code: 'S' | 'M' | 'L' | '?';
  label: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  description: string;
}

/**
 * Otomatis mendeteksi ukuran Daisha berdasarkan huruf awalan nomor unit:
 * - S = Small
 * - M = Medium
 * - L = Large
 * Bekerja baik saat diketik manual maupun hasil scan barcode kamera
 */
const SIZE_MAP: Record<string, DaishaSizeInfo> = {
  S: {
    size: 'Small',
    code: 'S',
    label: 'Small (S)',
    badgeBg: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    description: 'Unit Daisha Ukuran Kecil (Small)',
  },
  M: {
    size: 'Medium',
    code: 'M',
    label: 'Medium (M)',
    badgeBg: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    description: 'Unit Daisha Ukuran Sedang (Medium)',
  },
  L: {
    size: 'Large',
    code: 'L',
    label: 'Large (L)',
    badgeBg: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    description: 'Unit Daisha Ukuran Besar (Large)',
  },
};

export function detectDaishaSize(noDaisha?: string | null): DaishaSizeInfo | null {
  if (!noDaisha) return null;
  const firstChar = noDaisha.trim().toUpperCase().charAt(0);
  return SIZE_MAP[firstChar] || null;
}
