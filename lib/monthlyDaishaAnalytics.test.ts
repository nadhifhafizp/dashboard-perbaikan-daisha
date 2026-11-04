import { describe, it, expect } from 'vitest';
import { extractYearMonth, aggregateMonthlyDaisha } from './monthlyDaishaAnalytics';
import { Ticket } from '@/types/ticket';

describe('lib/monthlyDaishaAnalytics - Ekstraksi dan Agregasi Daisha Masuk Bulanan', () => {
  it('harus mengekstrak tahun dan bulan dari format tanggal masuk dengan benar', () => {
    expect(extractYearMonth('2026-10-25 08:30')).toEqual({ year: '2026', month: '10' });
    expect(extractYearMonth('2026-05-12T14:00:00Z')).toEqual({ year: '2026', month: '05' });
    expect(extractYearMonth('25/11/2026')).toEqual({ year: '2026', month: '11' });
    expect(extractYearMonth(null)).toBeNull();
    expect(extractYearMonth('')).toBeNull();
  });

  it('harus mengagregasi total tiket daisha masuk setiap bulannya secara tepat', () => {
    const mockTickets: Ticket[] = [
      {
        id: 1,
        idTiketAsli: 'T1',
        pelapor: 'Admin',
        tglMasuk: '2026-01-10',
        tglKeluar: '2026-01-11',
        status: 'Done',
        namaDaisha: 'Vertical',
        seksi: 'BUILDING',
        noDaisha: 'V-001',
        jenisKerusakan: 'Roda Rusak',
        detail: 'Roda diganti',
      },
      {
        id: 2,
        idTiketAsli: 'T2',
        pelapor: 'Admin',
        tglMasuk: '2026-01-15',
        tglKeluar: '',
        status: 'Progress',
        namaDaisha: 'M010',
        seksi: 'CURING',
        noDaisha: 'M-002',
        jenisKerusakan: 'Pengelasan',
        detail: 'Braket patah',
      },
      {
        id: 3,
        idTiketAsli: 'T3',
        pelapor: 'Admin',
        tglMasuk: '2026-02-05',
        tglKeluar: '2026-02-06',
        status: 'Done',
        namaDaisha: 'Vertical',
        seksi: 'BUILDING',
        noDaisha: 'V-003',
        jenisKerusakan: 'Roda Aus',
        detail: 'Roda diganti',
      },
      {
        id: 4,
        idTiketAsli: 'T4',
        pelapor: 'Admin',
        tglMasuk: '2026-02-12',
        tglKeluar: '',
        status: 'Scrap',
        namaDaisha: 'Vertical',
        seksi: 'EXTRUDING',
        noDaisha: 'V-004',
        jenisKerusakan: 'Rangka hancur',
        detail: 'Scrap',
      },
    ];

    const result = aggregateMonthlyDaisha(mockTickets, '2026');

    expect(result.totalMasuk).toBe(4);
    expect(result.totalSelesai).toBe(2);
    expect(result.totalProses).toBe(1);
    expect(result.totalScrap).toBe(1);

    // Bulan 1 (Januari)
    const jan = result.monthlyData.find((m) => m.monthIndex === 1);
    expect(jan?.totalMasuk).toBe(2);
    expect(jan?.selesai).toBe(1);
    expect(jan?.proses).toBe(1);

    // Bulan 2 (Februari)
    const feb = result.monthlyData.find((m) => m.monthIndex === 2);
    expect(feb?.totalMasuk).toBe(2);
    expect(feb?.selesai).toBe(1);
    expect(feb?.scrap).toBe(1);
    expect(feb?.momDiff).toBe(0); // 2 vs 2
    expect(feb?.momGrowth).toBe(0);

    // Bulan 3 (Maret - kosong)
    const mar = result.monthlyData.find((m) => m.monthIndex === 3);
    expect(mar?.totalMasuk).toBe(0);
  });

  it('harus mendukung mode LAST_12_MONTHS', () => {
    const mockTickets: Ticket[] = [];
    const result = aggregateMonthlyDaisha(mockTickets, 'LAST_12_MONTHS');
    expect(result.monthlyData.length).toBe(12);
  });
});

