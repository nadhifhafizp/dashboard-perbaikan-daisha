import { describe, it, expect } from 'vitest';
import { calculatePlateArea, formatPlateDimension, normalizeMaterialsClient } from './materialArea';

describe('lib/materialArea — Plate Area & Material Utilities', () => {
  it('harus menghitung luas plat dalam cm² dan m² secara akurat', () => {
    // 100 cm x 50 cm = 5000 cm² = 0.5 m²
    const result = calculatePlateArea('100', '50');
    expect(result).not.toBeNull();
    expect(result?.cm2).toBe(5000);
    expect(result?.m2).toBe(0.5);
  });

  it('harus mentolerir koma desimal', () => {
    const result = calculatePlateArea('10,5', '20');
    expect(result).not.toBeNull();
    expect(result?.cm2).toBe(210);
  });

  it('harus mengembalikan null untuk nilai panjang atau lebar yang tidak valid', () => {
    expect(calculatePlateArea('', '50')).toBeNull();
    expect(calculatePlateArea('0', '50')).toBeNull();
    expect(calculatePlateArea('-10', '50')).toBeNull();
    expect(calculatePlateArea('abc', '50')).toBeNull();
  });

  it('harus memformat dimensi plat dengan benar', () => {
    expect(formatPlateDimension('100', '50', '2')).toBe('100 cm × 50 cm, tebal 2mm');
    expect(formatPlateDimension('80', '40')).toBe('80 cm × 40 cm');
  });

  it('harus menormalkan JSON array material mentah menjadi ClientMaterialItem', () => {
    const raw = JSON.stringify([
      { id: 1, namaKomponen: 'Roda Kestor 6"', qty: 2, satuan: 'Pcs' },
      { id: 2, namaKomponen: 'Plat Strip 3x30', qty: 1500, satuan: 'cm²', dimensi: '100 cm × 15 cm' },
    ]);

    const normalized = normalizeMaterialsClient(raw);
    expect(normalized).toHaveLength(2);
    expect(normalized[0].tipe).toBe('SPAREPART');
    expect(normalized[1].tipe).toBe('MATERIAL');
  });
});
