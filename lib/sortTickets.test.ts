import { describe, it, expect } from 'vitest';
import { sortTickets } from './sortTickets';
import { Ticket } from '@/types/ticket';

describe('lib/sortTickets - Ticket Sorting Engine', () => {
  const dummyTickets: Ticket[] = [
    {
      id: '1',
      idTiketAsli: 'T-001',
      noTiket: 'T-001',
      noDaisha: 'S-010',
      namaDaisha: 'Daisha Building S',
      seksi: 'Building',
      pelapor: 'Budi',
      namaPelapor: 'Budi',
      status: 'Queue',
      tglMasuk: '2026-10-25 08:00',
      tglKeluar: '-',
      jenisKerusakan: 'Roda',
      detail: 'Roda macet',
    },
    {
      id: '2',
      idTiketAsli: 'T-002',
      noTiket: 'T-002',
      noDaisha: 'S-002',
      namaDaisha: 'Daisha Banbury S',
      seksi: 'Banbury',
      pelapor: 'Agus',
      namaPelapor: 'Agus',
      status: 'Done',
      tglMasuk: '2026-10-26 10:00',
      tglKeluar: '2026-10-26 14:00',
      jenisKerusakan: 'Handle',
      detail: 'Handle patah',
    },
    {
      id: '3',
      idTiketAsli: 'T-003',
      noTiket: 'T-003',
      noDaisha: 'L-001',
      namaDaisha: 'Daisha Cutt/Cal L',
      seksi: 'Cutt/Cal',
      pelapor: 'Dedi',
      namaPelapor: 'Dedi',
      status: 'Done',
      tglMasuk: '2026-10-27 09:00',
      tglKeluar: '2026-10-27 11:00',
      jenisKerusakan: 'Body',
      detail: 'Cat mengelupas',
    },
  ];

  it('harus mengurutkan tiket berdasarkan tanggal masuk terbaru (input_desc)', () => {
    const sorted = sortTickets(dummyTickets, 'input_desc');
    expect(sorted.map((t) => t.idTiketAsli)).toEqual(['T-003', 'T-002', 'T-001']);
  });

  it('harus mengurutkan tiket berdasarkan tanggal masuk terlama (input_asc)', () => {
    const sorted = sortTickets(dummyTickets, 'input_asc');
    expect(sorted.map((t) => t.idTiketAsli)).toEqual(['T-001', 'T-002', 'T-003']);
  });

  it('harus mengurutkan nomor Daisha secara alphanumeric natural (unit_asc)', () => {
    const sorted = sortTickets(dummyTickets, 'unit_asc');
    expect(sorted.map((t) => t.noDaisha)).toEqual(['L-001', 'S-002', 'S-010']);
  });

  it('harus mengurutkan nama pelapor secara alfabetis (pelapor_asc)', () => {
    const sorted = sortTickets(dummyTickets, 'pelapor_asc');
    expect(sorted.map((t) => t.namaPelapor)).toEqual(['Agus', 'Budi', 'Dedi']);
  });

  it('harus tidak memutasi array asli saat melakukan sorting', () => {
    const originalCopy = [...dummyTickets];
    sortTickets(dummyTickets, 'input_desc');
    expect(dummyTickets).toEqual(originalCopy);
  });
});
