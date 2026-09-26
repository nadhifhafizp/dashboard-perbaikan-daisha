/**
 * lib/sortTickets.ts — Utilitas Pengurutan Data Tiket Perbaikan Daisha
 * 
 * ============================================================================
 * FUNGSI UTAMA:
 * Mengurutkan array tiket perbaikan berdasarkan berbagai kriteria:
 * - Waktu masuk (terbaru / terlama)
 * - Waktu penyelesaian perbaikan (terbaru / terlama)
 * - Nomor unit Daisha (pengurutan natural alphanumeric)
 * - Nama tipe Daisha, departemen/seksi, atau nama teknisi pelapor
 * ============================================================================
 */
import { Ticket } from '@/types/ticket';
import { parseToTimestamp } from './date';

export type SortOption =
  | 'input_desc'
  | 'input_asc'
  | 'done_desc'
  | 'done_asc'
  | 'unit_asc'
  | 'unit_desc'
  | 'daisha_asc'
  | 'daisha_desc'
  | 'seksi_asc'
  | 'seksi_desc'
  | 'pelapor_asc'
  | 'pelapor_desc';

export interface SortOptionItem {
  value: SortOption;
  label: string;
  shortLabel: string;
}

export const SORT_OPTIONS: SortOptionItem[] = [
  { value: 'input_desc', label: 'Masuk: Terbaru', shortLabel: 'Masuk Terbaru' },
  { value: 'input_asc', label: 'Masuk: Terlama', shortLabel: 'Masuk Terlama' },
  { value: 'done_desc', label: 'Selesai: Terbaru', shortLabel: 'Selesai Terbaru' },
  { value: 'done_asc', label: 'Selesai: Terlama', shortLabel: 'Selesai Terlama' },
  { value: 'unit_asc', label: 'No Unit: (0-9)', shortLabel: 'No Unit' },
];

/**
 * Mengurutkan array tiket secara non-mutatif.
 * 
 * @param tickets - Array tiket yang ingin diurutkan
 * @param sortBy - Opsi pengurutan (misal: 'input_desc', 'done_desc', 'unit_asc')
 * @returns Array baru berisi tiket yang telah terurut
 */
export function sortTickets(tickets: Ticket[], sortBy: SortOption): Ticket[] {
  return [...tickets].sort((a, b) => {
    switch (sortBy) {
      case 'input_asc': {
        const diff = parseToTimestamp(a.tglMasuk) - parseToTimestamp(b.tglMasuk);
        return diff !== 0 ? diff : String(a.idTiketAsli).localeCompare(String(b.idTiketAsli), undefined, { numeric: true });
      }
      case 'input_desc': {
        const diff = parseToTimestamp(b.tglMasuk) - parseToTimestamp(a.tglMasuk);
        return diff !== 0 ? diff : String(b.idTiketAsli).localeCompare(String(a.idTiketAsli), undefined, { numeric: true });
      }
      case 'done_desc': {
        const timeA = parseToTimestamp(a.tglKeluar);
        const timeB = parseToTimestamp(b.tglKeluar);
        if (timeA > 0 && timeB > 0 && timeA !== timeB) return timeB - timeA;
        if (timeA > 0 && timeB === 0) return -1;
        if (timeA === 0 && timeB > 0) return 1;
        return parseToTimestamp(b.tglMasuk) - parseToTimestamp(a.tglMasuk);
      }
      case 'done_asc': {
        const timeA = parseToTimestamp(a.tglKeluar);
        const timeB = parseToTimestamp(b.tglKeluar);
        if (timeA > 0 && timeB > 0 && timeA !== timeB) return timeA - timeB;
        if (timeA > 0 && timeB === 0) return -1;
        if (timeA === 0 && timeB > 0) return 1;
        return parseToTimestamp(a.tglMasuk) - parseToTimestamp(b.tglMasuk);
      }
      case 'unit_asc': return (a.noDaisha || '').trim().localeCompare((b.noDaisha || '').trim(), undefined, { numeric: true, sensitivity: 'base' });
      case 'unit_desc': return (b.noDaisha || '').trim().localeCompare((a.noDaisha || '').trim(), undefined, { numeric: true, sensitivity: 'base' });
      case 'daisha_asc': return (a.namaDaisha || '').trim().localeCompare((b.namaDaisha || '').trim(), undefined, { sensitivity: 'base' });
      case 'daisha_desc': return (b.namaDaisha || '').trim().localeCompare((a.namaDaisha || '').trim(), undefined, { sensitivity: 'base' });
      case 'seksi_asc': return (a.seksi || '').trim().localeCompare((b.seksi || '').trim(), undefined, { sensitivity: 'base' });
      case 'seksi_desc': return (b.seksi || '').trim().localeCompare((a.seksi || '').trim(), undefined, { sensitivity: 'base' });
      case 'pelapor_asc': return (a.pelapor || '').trim().localeCompare((b.pelapor || '').trim(), undefined, { sensitivity: 'base' });
      case 'pelapor_desc': return (b.pelapor || '').trim().localeCompare((a.pelapor || '').trim(), undefined, { sensitivity: 'base' });
      default: return 0;
    }
  });
}
