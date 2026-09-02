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
export function detectDaishaSize(noDaisha?: string | null): DaishaSizeInfo | null {
  if (!noDaisha) return null;
  const clean = noDaisha.trim().toUpperCase();
  if (!clean) return null;

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
