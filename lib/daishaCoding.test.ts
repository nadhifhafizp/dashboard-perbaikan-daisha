import { describe, it, expect } from 'vitest';
import {
  DAISHA_CANONICAL_SPECS,
  findDaishaCodeSpec,
  detectDaishaByUnitCode,
  formatCanonicalDaishaNumber,
} from './daishaCoding';
import { formatVariantUnitNumber } from './daishaCatalogSync';

describe('Standar Pengkodean 29 Daisha Plant Bridgestone', () => {
  it('harus memuat tepat 29 spesifikasi pengkodean daisha resmi', () => {
    expect(DAISHA_CANONICAL_SPECS).toHaveLength(29);
  });

  const testCases = [
    { no: 1, seksi: 'Bead', nama: 'Bead Preset', kode: 'B/P---0001', prefix: 'B/P---' },
    { no: 2, seksi: 'Bead', nama: 'Covering', kode: 'COV---0001', prefix: 'COV---' },
    { no: 3, seksi: 'Bead', nama: 'Layer', kode: 'LAYER-0001', prefix: 'LAYER-' },
    { no: 4, seksi: 'Bead', nama: 'Monowire', kode: 'MONO--0001', prefix: 'MONO--' },
    { no: 5, seksi: 'Bead', nama: 'Ohaba Chaffer', kode: 'OHA-CH-001', prefix: 'OHA-CH-' },
    { no: 6, seksi: 'Bead', nama: 'Ohaba Layer', kode: 'OHA-LY-001', prefix: 'OHA-LY-' },
    { no: 7, seksi: 'Bead', nama: 'RTB', kode: 'RTBF--0001', prefix: 'RTBF--' },
    { no: 8, seksi: 'Banbury', nama: 'Palet B/B Type A', kode: 'BAN-A-0001', prefix: 'BAN-A-' },
    { no: 9, seksi: 'Banbury', nama: 'Palet B/B Type B', kode: 'BAN-B-0001', prefix: 'BAN-B-' },
    { no: 10, seksi: 'Banbury', nama: 'Palet B/B Type C', kode: 'BAN-C-0001', prefix: 'BAN-C-' },
    { no: 11, seksi: 'Cutt/Cal', nama: 'Inner Liner', kode: 'I/L---0001', prefix: 'I/L---' },
    { no: 12, seksi: 'Cutt/Cal', nama: 'Omakitan (A-truck)', kode: 'CAL---0001', prefix: 'CAL---' },
    { no: 13, seksi: 'Cutt/Cal', nama: 'Ply', kode: 'PLY---0001', prefix: 'PLY---' },
    { no: 14, seksi: 'Cutt/Cal', nama: 'Reel Belt', kode: 'BELT--0001', prefix: 'BELT--' },
    { no: 15, seksi: 'Extruding', nama: 'Reel Filler', kode: 'FIL-A-0001', prefix: 'FIL-A-' },
    { no: 16, seksi: 'Extruding', nama: 'Nagara Filler', kode: 'FIL-B-0001', prefix: 'FIL-B-' },
    { no: 17, seksi: 'Extruding', nama: 'Reel Side', kode: 'SIDE-A0001', prefix: 'SIDE-A' },
    { no: 18, seksi: 'Extruding', nama: 'B-TRUCK SIDE', kode: 'SIDE-B0001', prefix: 'SIDE-B' },
    { no: 19, seksi: 'Extruding', nama: 'Reel Top Biasa', kode: 'TOP-A-0001', prefix: 'TOP-A-' },
    { no: 20, seksi: 'Extruding', nama: 'Reel Top Sansuki', kode: 'TOP-B-0001', prefix: 'TOP-B-' },
    { no: 21, seksi: 'Building', nama: 'GT Ring Small Susun 3', kode: 'S30001', prefix: 'S3' },
    { no: 22, seksi: 'Building', nama: 'GT Ring Small Susun 4', kode: 'S40001', prefix: 'S4' },
    { no: 23, seksi: 'Building', nama: 'GT Ring Medium Susun 3', kode: 'M30001', prefix: 'M3' },
    { no: 24, seksi: 'Building', nama: 'GT Ring Large Susun 3', kode: 'L30001', prefix: 'L3' },
    { no: 25, seksi: 'Building', nama: 'Vertical-Small', kode: 'S00001', prefix: 'S' },
    { no: 26, seksi: 'Building', nama: 'Vertical-Medium', kode: 'M00001', prefix: 'M' },
    { no: 27, seksi: 'Building', nama: 'Vertical-Big/Large', kode: 'L00001', prefix: 'L' },
    { no: 28, seksi: 'Extruding', nama: 'Box Roll Side', kode: 'B-SIDE0001', prefix: 'B-SIDE' },
    { no: 29, seksi: 'Extruding', nama: 'Box Roll Top', kode: 'B-TOP-0001', prefix: 'B-TOP-' },
  ];

  for (const tc of testCases) {
    it(`harus memformat kode nomor unit sesuai spesifikasi: #${tc.no} ${tc.nama} -> ${tc.kode}`, () => {
      const formatted = formatCanonicalDaishaNumber(tc.prefix, 1);
      expect(formatted).toBe(tc.kode);
    });

    it(`harus mendeteksi seksi dari kode: ${tc.kode} -> ${tc.seksi}`, () => {
      const match = detectDaishaByUnitCode(tc.kode);
      expect(match).not.toBeNull();
      expect(match?.seksi.toLowerCase()).toBe(tc.seksi.toLowerCase());
    });
  }

  it('harus memformat Vertical dengan 5 digit angka urut (S00001, M00001, L00001)', () => {
    expect(formatVariantUnitNumber('S', 1)).toBe('S00001');
    expect(formatVariantUnitNumber('M', 1)).toBe('M00001');
    expect(formatVariantUnitNumber('L', 1)).toBe('L00001');
    expect(formatVariantUnitNumber('M', 378)).toBe('M00378');
  });

  it('harus memformat GT Ring dengan 4 digit angka urut (S30001, S40001, M30001, L30001)', () => {
    expect(formatVariantUnitNumber('S3', 1)).toBe('S30001');
    expect(formatVariantUnitNumber('S4', 1)).toBe('S40001');
    expect(formatVariantUnitNumber('M3', 1)).toBe('M30001');
    expect(formatVariantUnitNumber('L3', 1)).toBe('L30001');
  });

  it('harus memformat Ohaba dengan 3 digit angka urut (OHA-CH-001, OHA-LY-001)', () => {
    expect(formatVariantUnitNumber('OHA-CH-', 1)).toBe('OHA-CH-001');
    expect(formatVariantUnitNumber('OHA-LY-', 1)).toBe('OHA-LY-001');
  });
});
