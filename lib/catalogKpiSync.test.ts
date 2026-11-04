import { describe, it, expect } from 'vitest';
import { normalizeDaishaCode, normalizeSeksiName } from '@/components/dashboard/fleet-charts/useFleetHealthData';
import { formatVariantUnitNumber } from '@/lib/daishaCatalogSync';

describe('Catalog to KPI Synchronization & Normalization', () => {
  it('harus menormalisasi kode daisha dan nama seksi dengan tepat', () => {
    expect(normalizeDaishaCode(' S-00001 ')).toBe('S00001');
    expect(normalizeDaishaCode('vertical')).toBe('VERTICAL');
    expect(normalizeDaishaCode('A-Truck Nagara Filler')).toBe('ATRUCKNAGARAFILLER');
    expect(normalizeDaishaCode('')).toBe('');
    expect(normalizeDaishaCode(null)).toBe('');

    expect(normalizeSeksiName('Seksi Building')).toBe('building');
    expect(normalizeSeksiName('Building')).toBe('building');
    expect(normalizeSeksiName('seksi Extruding')).toBe('extruding');
    expect(normalizeSeksiName('')).toBe('');
  });

  it('harus memformat nomor unit varian dengan aturan padding pabrik Bridgestone', () => {
    // Building Vertical (S00, M00, L00) total 6 karakter
    expect(formatVariantUnitNumber('S00', 1)).toBe('S00001');
    expect(formatVariantUnitNumber('S00', 500)).toBe('S00500');
    expect(formatVariantUnitNumber('M00', 1)).toBe('M00001');
    expect(formatVariantUnitNumber('L00', 220)).toBe('L00220');

    // Standar custom pad
    expect(formatVariantUnitNumber('BOX-', 5, undefined, 4)).toBe('BOX-0005');
  });

  it('harus menghitung total unit dari katalog master dan varian secara akurat', () => {
    const mockCatalog = [
      {
        id: 1,
        name: 'Vertical',
        seksi: 'Building',
        totalUnits: 0,
        variants: [
          { name: 'Small', totalUnits: 500, minNumber: 1, maxNumber: 500 },
          { name: 'Medium', totalUnits: 1040, minNumber: 1, maxNumber: 1040 },
          { name: 'Large', totalUnits: 220, minNumber: 1, maxNumber: 220 },
        ],
        components: [
          { id: 1, name: 'Roda tetap', symptoms: [] },
          { id: 2, name: 'Spring tray', symptoms: [] },
        ],
      },
      {
        id: 2,
        name: 'Tread Extruder',
        seksi: 'Extruding',
        totalUnits: 150,
        variants: [],
        components: [{ id: 3, name: 'Stopper', symptoms: [] }],
      },
    ];

    let totalAllUnits = 0;
    const bySeksi: Record<string, number> = {};

    for (const cat of mockCatalog) {
      let units = Number(cat.totalUnits) || 0;
      if (cat.variants && cat.variants.length > 0) {
        const vSum = cat.variants.reduce((acc, v) => acc + v.totalUnits, 0);
        if (vSum > 0) units = vSum;
      }
      totalAllUnits += units;
      bySeksi[cat.seksi] = (bySeksi[cat.seksi] || 0) + units;
    }

    expect(totalAllUnits).toBe(1760 + 150); // 1910
    expect(bySeksi['Building']).toBe(1760);
    expect(bySeksi['Extruding']).toBe(150);
  });
});

