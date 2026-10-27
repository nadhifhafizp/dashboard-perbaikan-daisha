import { describe, it, expect } from 'vitest';
import {
  formatJenisLabel,
  filterFleetUnits,
  aggregateJenisList,
  aggregateSeksiList,
  sortMatrixList,
} from './pmAnalytics';
import { FleetUnit } from '@/components/maintenance/FleetExplorer';

const mockUnits: FleetUnit[] = [
  {
    id: 1,
    nomor_daisha: 'D-001',
    jenis: 'FLAT_DECK_LARGE',
    ukuran: 'LARGE',
    seksi: 'Mixing',
    is_maintained: true,
    last_condition: 'OK',
    last_maintenance_date: '2026-01-10',
    days_since_last: 10,
  },
  {
    id: 2,
    nomor_daisha: 'D-002',
    jenis: 'FLAT_DECK_LARGE',
    ukuran: 'LARGE',
    seksi: 'Mixing',
    is_maintained: false,
    last_condition: 'RUSAK',
    last_maintenance_date: '2025-11-01',
    days_since_last: 70,
  },
  {
    id: 3,
    nomor_daisha: 'D-003',
    jenis: 'TUBULAR',
    ukuran: 'MEDIUM',
    seksi: 'Material',
    is_maintained: false,
    last_condition: 'OK',
    last_maintenance_date: '2025-12-15',
    days_since_last: 35,
  },
];

describe('pmAnalytics', () => {
  it('formatJenisLabel harus membersihkan suffix dan memformat title case', () => {
    expect(formatJenisLabel('FLAT_DECK_LARGE')).toBe('Flat Deck');
    expect(formatJenisLabel('SPECIAL_RACK_NONE')).toBe('Special Rack');
    expect(formatJenisLabel('')).toBe('Lainnya');
  });

  it('filterFleetUnits harus menyaring data berdasarkan parameter filter', () => {
    const filteredBySeksi = filterFleetUnits(mockUnits, {
      filterSeksi: 'Mixing',
      filterJenis: 'all',
      filterUkuran: 'all',
      filterPmStatus: 'all',
      filterCondition: 'all',
      searchQuery: '',
    });
    expect(filteredBySeksi).toHaveLength(2);

    const filteredByCondition = filterFleetUnits(mockUnits, {
      filterSeksi: 'all',
      filterJenis: 'all',
      filterUkuran: 'all',
      filterPmStatus: 'all',
      filterCondition: 'RUSAK',
      searchQuery: '',
    });
    expect(filteredByCondition).toHaveLength(1);
    expect(filteredByCondition[0].nomor_daisha).toBe('D-002');
  });

  it('aggregateJenisList harus menghitung total populasi, maintained, unmaintained dengan akurat', () => {
    const result = aggregateJenisList(mockUnits, {}, false, 10);
    expect(result.totalPopulasi).toBe(3);
    expect(result.totalMaintained).toBe(1);
    expect(result.totalUnmaintained).toBe(2);
    expect(result.jenisList.length).toBeGreaterThan(0);
  });

  it('aggregateSeksiList harus mengelompokkan unit berdasarkan seksi', () => {
    const result = aggregateSeksiList(mockUnits, 5);
    const mixing = result.find((s) => s.key === 'Mixing');
    expect(mixing).toBeDefined();
    expect(mixing?.total).toBe(2);
    expect(mixing?.rusakCount).toBe(1);
    expect(mixing?.maintained).toBe(1);
  });

  it('sortMatrixList harus mengurutkan item sesuai opsi sortBy', () => {
    const seksiList = aggregateSeksiList(mockUnits, 5);
    const sorted = sortMatrixList(seksiList, 'total');
    expect(sorted[0].total).toBeGreaterThanOrEqual(sorted[1].total);
  });
});
