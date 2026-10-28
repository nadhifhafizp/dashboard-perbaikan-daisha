import { describe, it, expect } from 'vitest';
import {
  getRomanMonth,
  getSeksiCode,
  formatNomorSurat,
  SEKSI_CODE_MAP,
} from './nomorSurat';

describe('lib/nomorSurat - Format Nomor Surat & Singkatan Seksi', () => {
  it('harus mengonversi bulan ke angka Romawi secara tepat', () => {
    expect(getRomanMonth(1)).toBe('I');
    expect(getRomanMonth(2)).toBe('II');
    expect(getRomanMonth(3)).toBe('III');
    expect(getRomanMonth(4)).toBe('IV');
    expect(getRomanMonth(5)).toBe('V');
    expect(getRomanMonth(6)).toBe('VI');
    expect(getRomanMonth(7)).toBe('VII');
    expect(getRomanMonth(8)).toBe('VIII');
    expect(getRomanMonth(9)).toBe('IX');
    expect(getRomanMonth(10)).toBe('X');
    expect(getRomanMonth(11)).toBe('XI');
    expect(getRomanMonth(12)).toBe('XII');

    // Test dari objek Date
    const octDate = new Date('2026-10-27T10:00:00Z');
    expect(getRomanMonth(octDate)).toBe('X');
  });

  it('harus memetakan seluruh singkatan seksi sesuai spesifikasi user', () => {
    expect(getSeksiCode('HRGA')).toBe('HRGA');
    expect(getSeksiCode('QA')).toBe('QA');
    expect(getSeksiCode('TEKNIKAL')).toBe('TECH');
    expect(getSeksiCode('LABORAT')).toBe('LAB');
    expect(getSeksiCode('BANBURRY')).toBe('B/B');
    expect(getSeksiCode('EXTRUDING')).toBe('EXTD');
    expect(getSeksiCode('CUTTING/CALENDER')).toBe('CUT/CAL');
    expect(getSeksiCode('BEAD')).toBe('BEAD');
    expect(getSeksiCode('BUILDING')).toBe('BUILD');
    expect(getSeksiCode('CURING')).toBe('CURE');
    expect(getSeksiCode('FINAL INPECTION')).toBe('FINAL');
    expect(getSeksiCode('FINAL INSPECTION')).toBe('FINAL');
    expect(getSeksiCode('RMW')).toBe('RMW');
    expect(getSeksiCode('TWH')).toBe('TWH');
    expect(getSeksiCode('TIRE EVAL')).toBe('EVAL');
    expect(getSeksiCode('ENGINEERING')).toBe('ENG');
  });

  it('harus memformat nomor surat secara utuh dengan padding 3 digit (NO/Seksi/Romawi/Tahun)', () => {
    const testDate = new Date('2026-10-27T12:00:00Z');
    expect(formatNomorSurat(1, 'BEAD', testDate)).toBe('001/BEAD/X/2026');
    expect(formatNomorSurat(2, 'EXTRUDING', testDate)).toBe('002/EXTD/X/2026');
    expect(formatNomorSurat(15, 'CUTTING/CALENDER', testDate)).toBe('015/CUT/CAL/X/2026');
    expect(formatNomorSurat(105, 'BANBURRY', testDate)).toBe('105/B/B/X/2026');
  });

  it('harus menangani variasi penulisan nama seksi dengan spasi atau huruf kecil', () => {
    const testDate = new Date('2026-05-15T12:00:00Z');
    expect(formatNomorSurat(3, '  seksi bead  ', testDate)).toBe('003/BEAD/V/2026');
    expect(formatNomorSurat(4, 'Banbury Produksi', testDate)).toBe('004/B/B/V/2026');
  });
});
