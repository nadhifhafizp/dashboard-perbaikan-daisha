import { useMemo } from 'react';
import { Ticket } from '@/types/ticket';
import { 
  masterDataDaisha, 
  getDaishaBySeksi, 
  getKomponenKerusakan, 
  getDetailKerusakan 
} from '@/lib/masterData';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { parseToISODate, parseToTimestamp, formatDisplayDate } from '@/lib/date';

export interface DashboardFilters {
  search: string;
  filterSeksi: string;
  filterDaisha: string;
  filterNoDaisha: string;
  filterKerusakan: string;
  filterDetail: string;
  filterPelapor: string;
  filterStatus: string;
  filterHanyaBerulang: boolean;
  startDate: string;
  endDate: string;
}

export interface KpiSummary {
  total: number;
  open: number;
  progress: number;
  done: number;
  scrap: number;
  doneRate: number;
  scrapRate: number;
  avgLeadTimeHours: number;
  unitUnikCount: number;
  repeatUnitCount: number;
}

export interface DashboardChartsData {
  trenHarian: { tanggal: string; Masuk: number; Selesai: number }[];
  statusData: { name: string; value: number; color: string }[];
  unitFreq: { unit: string; total: number; jenis: string }[];
  semuaDaisha: { jenis: string; total: number }[];
  kategori: { kategori: string; total: number; totalPcs: number }[];
  detailGejala: { gejala: string; total: number; totalPcs: number; komponen?: string }[];
  seksiStacked: { seksi: string; Open: number; Progress: number; Done: number; Scrap: number; Total: number }[];
  pelapor: { pelapor: string; seksi: string; total: number }[];
  leadTime: { rentang: string; total: number; persen: number }[];
  tindakanStats: {
    repairCount: number;
    gantiCount: number;
    total: number;
    repairPcs: number;
    gantiPcs: number;
    totalPcs: number;
  };
  sparepartKebutuhan: {
    nama: string;
    gejala: string;
    gantiPcs: number;
    repairPcs: number;
    totalPcs: number;
  }[];
}

export interface FilterOptions {
  pilihanDaisha: string[];
  pilihanKomponen: string[];
  pilihanDetail: string[];
  pilihanNoDaisha: string[];
  pilihanPelapor: string[];
}

export function useDashboardAnalytics(dataRaw: Ticket[], filters: DashboardFilters) {
  const {
    search,
    filterSeksi,
    filterDaisha,
    filterNoDaisha,
    filterKerusakan,
    filterDetail,
    filterPelapor,
    filterStatus,
    filterHanyaBerulang,
    startDate,
    endDate,
  } = filters;

  // 1. Repeat Unit Tracking Map (Simulasi SQL COUNT() GROUP BY noDaisha)
  const unitRepeatMap = useMemo(() => {
    const map: Record<string, number> = {};
    dataRaw.forEach(item => {
      if (item.noDaisha && item.noDaisha !== '-') {
        map[item.noDaisha] = (map[item.noDaisha] || 0) + 1;
      }
    });
    return map;
  }, [dataRaw]);

  // 2. Filter Multi-Dimensional (Simulasi SQL WHERE Clause)
  const filteredData = useMemo(() => {
    if (!dataRaw.length) return [];
    const searchLower = search.trim().toLowerCase();

    return dataRaw.filter(item => {
      if (filterSeksi && item.seksi !== filterSeksi) return false;
      if (filterDaisha && item.namaDaisha !== filterDaisha) return false;
      if (filterNoDaisha && item.noDaisha !== filterNoDaisha) return false;
      if (filterKerusakan) {
        const parts = item.jenisKerusakan ? item.jenisKerusakan.split(',').map(s => s.trim()) : [];
        if (!parts.includes(filterKerusakan) && item.jenisKerusakan !== filterKerusakan) return false;
      }
      if (filterDetail) {
        if (!item.detail || !item.detail.toLowerCase().includes(filterDetail.toLowerCase())) return false;
      }
      if (filterPelapor && item.pelapor !== filterPelapor) return false;
      if (filterStatus && item.status !== filterStatus) return false;

      // Filter khusus unit berulang (> 1x masuk)
      if (filterHanyaBerulang && item.noDaisha && (unitRepeatMap[item.noDaisha] || 0) <= 1) {
        return false;
      }

      const itemDate = parseToISODate(item.tglMasuk);
      if (startDate && itemDate && itemDate < startDate) return false;
      if (endDate && itemDate && itemDate > endDate) return false;

      if (searchLower) {
        const matchUnit = item.noDaisha?.toLowerCase().includes(searchLower);
        const matchNama = item.namaDaisha?.toLowerCase().includes(searchLower);
        const matchPelapor = item.pelapor?.toLowerCase().includes(searchLower);
        const matchTiket = item.idTiketAsli?.toLowerCase().includes(searchLower);
        const matchKerusakan = item.jenisKerusakan?.toLowerCase().includes(searchLower);
        const matchDetail = item.detail?.toLowerCase().includes(searchLower);
        const matchReason = item.reason?.toLowerCase().includes(searchLower);
        if (!matchUnit && !matchNama && !matchPelapor && !matchTiket && !matchKerusakan && !matchDetail && !matchReason) return false;
      }

      return true;
    });
  }, [
    dataRaw, 
    filterSeksi, 
    filterDaisha, 
    filterNoDaisha, 
    filterKerusakan, 
    filterDetail, 
    filterPelapor, 
    filterStatus, 
    filterHanyaBerulang, 
    startDate, 
    endDate, 
    search, 
    unitRepeatMap
  ]);

  // 3. Dropdown Cascading Options
  const filterOptions: FilterOptions = useMemo(() => {
    const setUnit = new Set<string>();
    const setPelapor = new Set<string>();

    dataRaw.forEach(d => {
      if (d.noDaisha && d.noDaisha !== '-') {
        if (!filterSeksi || d.seksi === filterSeksi) {
          if (!filterDaisha || d.namaDaisha === filterDaisha) {
            setUnit.add(d.noDaisha);
          }
        }
      }
      if (d.pelapor && d.pelapor !== '-') setPelapor.add(d.pelapor);
    });

    return {
      pilihanDaisha: getDaishaBySeksi(filterSeksi),
      pilihanKomponen: getKomponenKerusakan(filterDaisha),
      pilihanDetail: getDetailKerusakan(filterDaisha, filterKerusakan),
      pilihanNoDaisha: Array.from(setUnit).sort(),
      pilihanPelapor: Array.from(setPelapor).sort(),
    };
  }, [dataRaw, filterSeksi, filterDaisha, filterKerusakan]);

  // 4. KPI Ringkasan Eksekutif (Simulasi SQL Aggregations: COUNT, AVG)
  const kpi: KpiSummary = useMemo(() => {
    const total = filteredData.length;
    const open = filteredData.filter(d => d.status === 'Open').length;
    const progress = filteredData.filter(d => d.status === 'Progress').length;
    const done = filteredData.filter(d => d.status === 'Done').length;
    const scrap = filteredData.filter(d => d.status === 'Scrap').length;

    const doneRate = total > 0 ? Math.round((done / total) * 100) : 0;
    const scrapRate = total > 0 ? Math.round((scrap / total) * 100) : 0;

    let totalLeadTimeHours = 0;
    let countedLeadTime = 0;
    filteredData.forEach(d => {
      if (d.status === 'Done' && d.tglMasuk && d.tglKeluar && d.tglKeluar !== '-') {
        const masuk = parseToTimestamp(d.tglMasuk);
        const keluar = parseToTimestamp(d.tglKeluar);
        if (masuk > 0 && keluar >= masuk) {
          const diffHours = (keluar - masuk) / (1000 * 60 * 60);
          totalLeadTimeHours += diffHours;
          countedLeadTime++;
        }
      }
    });

    const avgLeadTimeHours = countedLeadTime > 0 ? Math.round(totalLeadTimeHours / countedLeadTime) : 0;

    const unitSet = new Set<string>();
    let repeatUnitCount = 0;
    filteredData.forEach(d => {
      if (d.noDaisha && d.noDaisha !== '-') {
        unitSet.add(d.noDaisha);
        if ((unitRepeatMap[d.noDaisha] || 0) > 1) {
          repeatUnitCount++;
        }
      }
    });

    return {
      total,
      open,
      progress,
      done,
      scrap,
      doneRate,
      scrapRate,
      avgLeadTimeHours,
      unitUnikCount: unitSet.size,
      repeatUnitCount
    };
  }, [filteredData, unitRepeatMap]);

  // 5. Seluruh Data Visualisasi Grafik (Simulasi SQL GROUP BY queries)
  const charts: DashboardChartsData = useMemo(() => {
    // 5.1 Throughput Masuk vs Selesai
    const datesMap: Record<string, { tanggal: string; Masuk: number; Selesai: number }> = {};
    filteredData.forEach(d => {
      const tglMasukISO = parseToISODate(d.tglMasuk);
      if (tglMasukISO) {
        if (!datesMap[tglMasukISO]) datesMap[tglMasukISO] = { tanggal: tglMasukISO, Masuk: 0, Selesai: 0 };
        datesMap[tglMasukISO].Masuk++;
      }
      if (d.status === 'Done') {
        const tglKeluarISO = parseToISODate(d.tglKeluar);
        if (tglKeluarISO) {
          if (!datesMap[tglKeluarISO]) datesMap[tglKeluarISO] = { tanggal: tglKeluarISO, Masuk: 0, Selesai: 0 };
          datesMap[tglKeluarISO].Selesai++;
        }
      }
    });
    const trenHarian = Object.values(datesMap)
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
      .slice(-14)
      .map(item => ({
        ...item,
        tanggal: formatDisplayDate(item.tanggal).split(' ')[0]
      }));

    // 5.2 Status Donut Data
    const statusData = [
      { name: 'Antre (Open)', value: kpi.open, color: '#f59e0b' },
      { name: 'Dikerjakan (Progress)', value: kpi.progress, color: '#3b82f6' },
      { name: 'Selesai (Done)', value: kpi.done, color: '#10b981' },
      { name: 'Afkir (Scrap)', value: kpi.scrap, color: '#e11d48' },
    ];

    // 5.3 Top 10 Repeat Failure Units
    const freq: Record<string, { unit: string; total: number; jenis: string }> = {};
    filteredData.forEach(d => {
      if (d.noDaisha && d.noDaisha !== '-') {
        if (!freq[d.noDaisha]) {
          freq[d.noDaisha] = { unit: d.noDaisha, total: 0, jenis: d.namaDaisha };
        }
        freq[d.noDaisha].total++;
      }
    });
    const unitFreq = Object.values(freq)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // 5.4 Distribusi Semua Jenis Daisha
    const daishaMap: Record<string, number> = {};
    Object.keys(masterDataDaisha).forEach(daisha => {
      daishaMap[daisha] = 0;
    });
    filteredData.forEach(d => {
      if (d.namaDaisha && d.namaDaisha !== '-') {
        daishaMap[d.namaDaisha] = (daishaMap[d.namaDaisha] || 0) + 1;
      }
    });
    const semuaDaisha = Object.entries(daishaMap)
      .filter(([, count]) => count > 0)
      .map(([jenis, total]) => ({ jenis, total }))
      .sort((a, b) => b.total - a.total);

    // 5.5 Pareto Komponen Rusak & 5.6 Detail Gejala Bersih & 5.10 Tindakan Stats
    const katMap: Record<string, { total: number; totalPcs: number }> = {};
    const gejMap: Record<string, { total: number; totalPcs: number; komponen: string }> = {};
    const partNeedsMap: Record<string, { nama: string; gejala: string; gantiPcs: number; repairPcs: number; totalPcs: number }> = {};

    let repairCount = 0;
    let gantiCount = 0;
    let repairPcs = 0;
    let gantiPcs = 0;

    filteredData.forEach(d => {
      const parsed = parseTicketDamageDetail(d.detail);

      gantiCount += parsed.gantiItems.length;
      repairCount += parsed.repairItems.length;
      gantiPcs += parsed.totalQtyGanti;
      repairPcs += parsed.totalQtyRepair;

      if (parsed.items.length > 0) {
        parsed.items.forEach(item => {
          const komp = item.komponen !== 'Umum' ? item.komponen : (d.jenisKerusakan && d.jenisKerusakan !== '-' ? d.jenisKerusakan : 'Umum');
          if (!katMap[komp]) katMap[komp] = { total: 0, totalPcs: 0 };
          katMap[komp].total += 1;
          katMap[komp].totalPcs += item.qty || 1;

          const gej = item.gejala || 'Kerusakan komponen';
          if (!gejMap[gej]) gejMap[gej] = { total: 0, totalPcs: 0, komponen: komp };
          gejMap[gej].total += 1;
          gejMap[gej].totalPcs += item.qty || 1;

          const partKey = `${komp}:::${gej}`;
          if (!partNeedsMap[partKey]) {
            partNeedsMap[partKey] = {
              nama: komp,
              gejala: gej,
              gantiPcs: 0,
              repairPcs: 0,
              totalPcs: 0,
            };
          }
          if (item.tindakan === 'Ganti') {
            partNeedsMap[partKey].gantiPcs += item.qty || 1;
          } else {
            partNeedsMap[partKey].repairPcs += item.qty || 1;
          }
          partNeedsMap[partKey].totalPcs += item.qty || 1;
        });
      } else {
        const komp = d.jenisKerusakan && d.jenisKerusakan !== '-' ? d.jenisKerusakan : 'Umum';
        if (!katMap[komp]) katMap[komp] = { total: 0, totalPcs: 0 };
        katMap[komp].total += 1;
        katMap[komp].totalPcs += 1;

        const gej = d.detail && d.detail !== '-' ? d.detail : 'Kerusakan umum';
        if (!gejMap[gej]) gejMap[gej] = { total: 0, totalPcs: 0, komponen: komp };
        gejMap[gej].total += 1;
        gejMap[gej].totalPcs += 1;
      }
    });

    const kategori = Object.entries(katMap)
      .map(([kat, val]) => ({ kategori: kat, total: val.total, totalPcs: val.totalPcs }))
      .sort((a, b) => b.totalPcs - a.totalPcs || b.total - a.total)
      .slice(0, 12);

    const detailGejala = Object.entries(gejMap)
      .map(([gejala, val]) => ({
        gejala,
        total: val.total,
        totalPcs: val.totalPcs,
        komponen: val.komponen,
      }))
      .sort((a, b) => b.totalPcs - a.totalPcs || b.total - a.total)
      .slice(0, 10);

    const sparepartKebutuhan = Object.values(partNeedsMap)
      .sort((a, b) => b.gantiPcs - a.gantiPcs || b.totalPcs - a.totalPcs)
      .slice(0, 8);

    // 5.7 Beban Seksi Stacked Bar
    const seksiMap: Record<string, { seksi: string; Open: number; Progress: number; Done: number; Scrap: number; Total: number }> = {};
    filteredData.forEach(d => {
      const s = d.seksi || 'Lainnya';
      if (!seksiMap[s]) {
        seksiMap[s] = { seksi: s, Open: 0, Progress: 0, Done: 0, Scrap: 0, Total: 0 };
      }
      const st = d.status as 'Open' | 'Progress' | 'Done' | 'Scrap';
      if (seksiMap[s][st] !== undefined) {
        seksiMap[s][st]++;
      }
      seksiMap[s].Total++;
    });
    const seksiStacked = Object.values(seksiMap)
      .filter(item => item.Total > 0)
      .sort((a, b) => b.Total - a.Total);

    // 5.8 Leaderboard Pelapor
    const pelMap: Record<string, { pelapor: string; seksi: string; total: number }> = {};
    filteredData.forEach(d => {
      const pel = d.pelapor && d.pelapor !== '-' ? d.pelapor : 'Anonim';
      if (!pelMap[pel]) {
        pelMap[pel] = { pelapor: pel, seksi: d.seksi || '-', total: 0 };
      }
      pelMap[pel].total++;
    });
    const pelapor = Object.values(pelMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // 5.9 Lead Time Buckets
    const buckets: Record<string, number> = {
      '< 4 Jam': 0,
      '4 - 12 Jam': 0,
      '12 - 24 Jam': 0,
      '1 - 3 Hari': 0,
      '> 3 Hari': 0
    };
    let totalDoneWithDate = 0;
    filteredData.forEach(d => {
      if (d.status === 'Done' && d.tglMasuk && d.tglKeluar && d.tglKeluar !== '-') {
        const masuk = parseToTimestamp(d.tglMasuk);
        const keluar = parseToTimestamp(d.tglKeluar);
        if (masuk > 0 && keluar >= masuk) {
          const diffHours = (keluar - masuk) / (1000 * 60 * 60);
          totalDoneWithDate++;
          if (diffHours < 4) buckets['< 4 Jam']++;
          else if (diffHours <= 12) buckets['4 - 12 Jam']++;
          else if (diffHours <= 24) buckets['12 - 24 Jam']++;
          else if (diffHours <= 72) buckets['1 - 3 Hari']++;
          else buckets['> 3 Hari']++;
        }
      }
    });
    const totalAll = totalDoneWithDate || 1;
    const leadTime = Object.entries(buckets).map(([rentang, total]) => ({
      rentang,
      total,
      persen: Math.round((total / totalAll) * 100)
    }));

    return {
      trenHarian,
      statusData,
      unitFreq,
      semuaDaisha,
      kategori,
      detailGejala,
      seksiStacked,
      pelapor,
      leadTime,
      tindakanStats: {
        repairCount,
        gantiCount,
        total: repairCount + gantiCount,
        repairPcs,
        gantiPcs,
        totalPcs: repairPcs + gantiPcs,
      },
      sparepartKebutuhan,
    };
  }, [filteredData, kpi]);

  return {
    filteredData,
    filterOptions,
    kpi,
    charts,
  };
}
