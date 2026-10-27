import { describe, it, expect } from 'vitest';
import { normalizeStatus, getValue, extractRawTicketArray } from './ticketParser';

describe('lib/ticketParser — Ticket Normalizer and Extractor', () => {
  describe('normalizeStatus', () => {
    it('harus menormalkan variasi status ke enum standar', () => {
      expect(normalizeStatus('dalam proses')).toBe('Progress');
      expect(normalizeStatus('PROSES')).toBe('Progress');
      expect(normalizeStatus('selesai')).toBe('Done');
      expect(normalizeStatus('complete')).toBe('Done');
      expect(normalizeStatus('afkir')).toBe('Scrap');
      expect(normalizeStatus('scrap')).toBe('Scrap');
      expect(normalizeStatus('menunggu part')).toBe('Pending');
      expect(normalizeStatus('pending')).toBe('Pending');
      expect(normalizeStatus('open')).toBe('Open');
      expect(normalizeStatus('antrean')).toBe('Open');
      expect(normalizeStatus(null)).toBe('Open');
      expect(normalizeStatus('')).toBe('Open');
    });
  });

  describe('getValue', () => {
    it('harus mengekstrak nilai pertama yang cocok dari daftar possibleKeys', () => {
      const obj = { no_daisha: 'S-001', namaPelapor: 'Rahmat' };
      expect(getValue(obj, ['nomorDaisha', 'noDaisha', 'no_daisha'])).toBe('S-001');
      expect(getValue(obj, ['namaPelapor', 'pelapor'])).toBe('Rahmat');
    });

    it('harus mentolerir perbedaan format snake_case dan camelCase', () => {
      const obj = { wakturincianmasuk: '2026-10-27' };
      expect(getValue(obj, ['waktu_rincian_masuk'])).toBe('2026-10-27');
    });

    it('harus mengembalikan null jika key tidak ditemukan', () => {
      const obj = { no_daisha: 'S-001' };
      expect(getValue(obj, ['tidak_ada'])).toBeNull();
    });
  });

  describe('extractRawTicketArray', () => {
    it('harus mengembalikan array jika input langsung array', () => {
      const arr = [{ id: 1 }, { id: 2 }];
      expect(extractRawTicketArray(arr)).toBe(arr);
    });

    it('harus mengekstrak array dari dalam wrapper object (data, records, result)', () => {
      expect(extractRawTicketArray({ data: [{ id: 1 }] })).toEqual([{ id: 1 }]);
      expect(extractRawTicketArray({ records: [{ id: 2 }] })).toEqual([{ id: 2 }]);
      expect(extractRawTicketArray({ result: [{ id: 3 }] })).toEqual([{ id: 3 }]);
    });

    it('harus mengembalikan array kosong jika input tidak sesuai', () => {
      expect(extractRawTicketArray(null)).toEqual([]);
      expect(extractRawTicketArray('string')).toEqual([]);
    });
  });
});
