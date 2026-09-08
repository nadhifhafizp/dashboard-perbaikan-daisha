import { Ticket } from '@/types/ticket';
import { parseToTimestamp } from './date';

export type SortOption =
  | 'input_desc'
  | 'input_asc'
  | 'unit_asc'
  | 'unit_desc'
  | 'daisha_asc'
  | 'daisha_desc'
  | 'seksi_asc'
  | 'pelapor_asc';

export interface SortOptionItem {
  value: SortOption;
  label: string;
  shortLabel: string;
  category: 'waktu' | 'angka' | 'abjad';
}

export const SORT_OPTIONS: SortOptionItem[] = [
  {
    value: 'input_desc',
    label: '🕒 Input Terbaru (Masuk Baru ➔ Lama)',
    shortLabel: 'Input Terbaru',
    category: 'waktu',
  },
  {
    value: 'input_asc',
    label: '⏳ Input Terlama (Masuk Lama ➔ Baru)',
    shortLabel: 'Input Terlama',
    category: 'waktu',
  },
  {
    value: 'unit_asc',
    label: '🔢 No Unit: Angka Kecil ➔ Besar (0-9)',
    shortLabel: 'No Unit (0-9)',
    category: 'angka',
  },
  {
    value: 'unit_desc',
    label: '🔢 No Unit: Angka Besar ➔ Kecil (9-0)',
    shortLabel: 'No Unit (9-0)',
    category: 'angka',
  },
  {
    value: 'daisha_asc',
    label: '🔤 Nama Daisha: Abjad (A ➔ Z)',
    shortLabel: 'Nama Daisha (A-Z)',
    category: 'abjad',
  },
  {
    value: 'daisha_desc',
    label: '🔤 Nama Daisha: Abjad (Z ➔ A)',
    shortLabel: 'Nama Daisha (Z-A)',
    category: 'abjad',
  },
  {
    value: 'seksi_asc',
    label: '🏢 Seksi: Abjad (A ➔ Z)',
    shortLabel: 'Seksi (A-Z)',
    category: 'abjad',
  },
  {
    value: 'pelapor_asc',
    label: '👤 Pelapor: Abjad (A ➔ Z)',
    shortLabel: 'Pelapor (A-Z)',
    category: 'abjad',
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

      case 'pelapor_asc': {
        const pelA = (a.pelapor || '').trim();
        const pelB = (b.pelapor || '').trim();
        return pelA.localeCompare(pelB, undefined, { sensitivity: 'base' });
      }

      default:
        return 0;
    }
  });
}
