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

// Opsi ringkas & esensial untuk dropdown di semua panel
export const SORT_OPTIONS: SortOptionItem[] = [
  {
    value: 'input_desc',
    label: '🕒 Masuk: Terbaru',
    shortLabel: 'Masuk Terbaru',
  },
  {
    value: 'input_asc',
    label: '⏳ Masuk: Terlama',
    shortLabel: 'Masuk Terlama',
  },
  {
    value: 'done_desc',
    label: '✅ Selesai: Terbaru',
    shortLabel: 'Selesai Terbaru',
  },
  {
    value: 'done_asc',
    label: '⌛ Selesai: Terlama',
    shortLabel: 'Selesai Terlama',
  },
  {
    value: 'unit_asc',
    label: '🔢 No Unit: (0-9)',
    shortLabel: 'No Unit',
  },
];

export function sortTickets(tickets: Ticket[], sortBy: SortOption): Ticket[] {
  const list = [...tickets];

  return list.sort((a, b) => {
    switch (sortBy) {
      case 'input_asc': {
        const timeA = parseToTimestamp(a.tglMasuk);
        const timeB = parseToTimestamp(b.tglMasuk);
        if (timeA !== timeB) return timeA - timeB;
        return String(a.idTiketAsli).localeCompare(String(b.idTiketAsli), undefined, { numeric: true });
      }

      case 'input_desc': {
        const timeA = parseToTimestamp(a.tglMasuk);
        const timeB = parseToTimestamp(b.tglMasuk);
        if (timeA !== timeB) return timeB - timeA;
        return String(b.idTiketAsli).localeCompare(String(a.idTiketAsli), undefined, { numeric: true });
      }

      case 'done_desc': {
        const timeA = parseToTimestamp(a.tglKeluar);
        const timeB = parseToTimestamp(b.tglKeluar);
        if (timeA > 0 && timeB > 0) {
          if (timeA !== timeB) return timeB - timeA;
          return parseToTimestamp(b.tglMasuk) - parseToTimestamp(a.tglMasuk);
        }
        if (timeA > 0 && timeB === 0) return -1;
        if (timeA === 0 && timeB > 0) return 1;
        return parseToTimestamp(b.tglMasuk) - parseToTimestamp(a.tglMasuk);
      }

      case 'done_asc': {
        const timeA = parseToTimestamp(a.tglKeluar);
        const timeB = parseToTimestamp(b.tglKeluar);
        if (timeA > 0 && timeB > 0) {
          if (timeA !== timeB) return timeA - timeB;
          return parseToTimestamp(a.tglMasuk) - parseToTimestamp(b.tglMasuk);
        }
        if (timeA > 0 && timeB === 0) return -1;
        if (timeA === 0 && timeB > 0) return 1;
        return parseToTimestamp(a.tglMasuk) - parseToTimestamp(b.tglMasuk);
      }

      case 'unit_asc': {
        const noA = (a.noDaisha || '').trim();
        const noB = (b.noDaisha || '').trim();
        return noA.localeCompare(noB, undefined, { numeric: true, sensitivity: 'base' });
      }

      case 'unit_desc': {
        const noA = (a.noDaisha || '').trim();
        const noB = (b.noDaisha || '').trim();
        return noB.localeCompare(noA, undefined, { numeric: true, sensitivity: 'base' });
      }

      case 'daisha_asc': {
        const namaA = (a.namaDaisha || '').trim();
        const namaB = (b.namaDaisha || '').trim();
        return namaA.localeCompare(namaB, undefined, { sensitivity: 'base' });
      }

      case 'daisha_desc': {
        const namaA = (a.namaDaisha || '').trim();
        const namaB = (b.namaDaisha || '').trim();
        return namaB.localeCompare(namaA, undefined, { sensitivity: 'base' });
      }

      case 'seksi_asc': {
        const seksiA = (a.seksi || '').trim();
        const seksiB = (b.seksi || '').trim();
        return seksiA.localeCompare(seksiB, undefined, { sensitivity: 'base' });
      }

      case 'seksi_desc': {
        const seksiA = (a.seksi || '').trim();
        const seksiB = (b.seksi || '').trim();
        return seksiB.localeCompare(seksiA, undefined, { sensitivity: 'base' });
      }

      case 'pelapor_asc': {
        const pelA = (a.pelapor || '').trim();
        const pelB = (b.pelapor || '').trim();
        return pelA.localeCompare(pelB, undefined, { sensitivity: 'base' });
      }

      case 'pelapor_desc': {
        const pelA = (a.pelapor || '').trim();
        const pelB = (b.pelapor || '').trim();
        return pelB.localeCompare(pelA, undefined, { sensitivity: 'base' });
      }

      default:
        return 0;
    }
  });
}
