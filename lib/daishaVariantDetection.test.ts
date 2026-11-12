import { describe, it, expect } from 'vitest';
import { detectDaishaSize } from '@/lib/daishaSize';

describe('Deteksi Varian & Ukuran Daisha (Vertical & GT Ring)', () => {
  it('harus mendeteksi ukuran Medium dari nomor seri berawalan M (cth: M00378)', () => {
    const size = detectDaishaSize('M00378');
    expect(size).not.toBeNull();
    expect(size?.size).toBe('Medium');
    expect(size?.code).toBe('M');
  });

  it('harus mendeteksi ukuran Large dari nomor seri berawalan L (cth: L-005, L00248)', () => {
    const size1 = detectDaishaSize('L00248');
    expect(size1?.size).toBe('Large');
    expect(size1?.code).toBe('L');

    const size2 = detectDaishaSize('L-005');
    expect(size2?.size).toBe('Large');
    expect(size2?.code).toBe('L');
  });

  it('harus mendeteksi ukuran Small dari nomor seri berawalan S (cth: S00539, S-004)', () => {
    const size1 = detectDaishaSize('S00539');
    expect(size1?.size).toBe('Small');
    expect(size1?.code).toBe('S');
  });

  it('harus mendeteksi GT Ring Small Susun 3 dan Susun 4 secara presisi', () => {
    const s3 = detectDaishaSize('S30024');
    expect(s3?.size).toBe('Small');
    expect(s3?.susunan).toBe('Susun 3');

    const s4 = detectDaishaSize('S40054');
    expect(s4?.size).toBe('Small');
    expect(s4?.susunan).toBe('Susun 4');
  });

  it('harus mendeteksi GT Ring Medium Susun 3 dan Large Susun 3', () => {
    const m3 = detectDaishaSize('M30012');
    expect(m3?.size).toBe('Medium');
    expect(m3?.susunan).toBe('Susun 3');

    const l3 = detectDaishaSize('L30046');
    expect(l3?.size).toBe('Large');
    expect(l3?.susunan).toBe('Susun 3');
  });

  it('harus mengembalikan null untuk nomor kosong atau format non-daisha', () => {
    expect(detectDaishaSize('')).toBeNull();
    expect(detectDaishaSize(null)).toBeNull();
    expect(detectDaishaSize('   ')).toBeNull();
    expect(detectDaishaSize('12345')).toBeNull();
  });
});

