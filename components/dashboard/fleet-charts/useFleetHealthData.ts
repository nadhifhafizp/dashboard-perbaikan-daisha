import { useState, useMemo, useEffect } from 'react';
import { FleetUnit } from '@/components/maintenance/FleetExplorer';
import { Ticket } from '@/types/ticket';
import { JenisHealthItem, BreakdownItem, RecurringUnitItem, CatalogItemData } from './types';
import { DAFTAR_SEKSI } from '@/lib/masterData';

// Normalisasi nomor daisha untuk pencocokan akurat tanpa terpengaruh spasi, strip, atau huruf besar/kecil
export function normalizeDaishaCode(val: string | null | undefined): string {
  if (!val) return '';
  return val.trim().toUpperCase().replace(/[\s\-_]+/g, '');
}

// 'OK' dan 'REPAIR_DONE' keduanya berarti unit sudah selesai diperbaiki / siap operasi.
// Hanya 'RUSAK' atau 'SCRAP' yang berarti unit belum siap operasi.
function isConditionNG(cond: string | null | undefined): boolean {
  return cond === 'RUSAK' || cond === 'SCRAP';
}

interface UseFleetHealthDataProps {
  units: FleetUnit[];
  tickets: Ticket[];
  selectedSeksi?: string;
  onSelectSeksi?: (seksi: string) => void;
  catalogStats?: {
    totalAllUnits: number;
    totalPmUnits?: number;
    bySeksi: Record<string, number>;
    pmBySeksi?: Record<string, number>;
    catalogs?: CatalogItemData[];
  };
}

export function useFleetHealthData({
  units,
  tickets,
  selectedSeksi = '',
  onSelectSeksi,
  catalogStats,
}: UseFleetHealthDataProps) {
  const [currentSeksi, setCurrentSeksi] = useState<string>(selectedSeksi || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HAS_BROKEN' | 'ALL_READY'>('ALL');
  const [sortOrder, setSortOrder] = useState<'TOTAL' | 'BROKEN'>('TOTAL');

  useEffect(() => {
    setCurrentSeksi(selectedSeksi || '');
  }, [selectedSeksi]);

  const handleSeksiChange = (seksi: string) => {
    setCurrentSeksi(seksi);
    if (onSelectSeksi) {
      onSelectSeksi(seksi);
    }
  };

  // Daftar seksi yang tersedia dengan jumlah unit armada resmi katalog
  const availableSeksiList = useMemo(() => {
    if (catalogStats?.bySeksi) {
      const allSeksiKeys = Array.from(
        new Set([...DAFTAR_SEKSI, ...Object.keys(catalogStats.bySeksi)])
      ).filter((s) => Boolean(s) && s.toLowerCase() !== 'all seksi' && s.toLowerCase() !== 'all');

      return allSeksiKeys
        .map((name) => ({
          name,
          count: catalogStats.bySeksi[name] ?? 0,
        }))
        .sort((a, b) => b.count - a.count);
    }
    const map: Record<string, number> = {};
    units.forEach((u) => {
      if (u.seksi && u.seksi.toLowerCase() !== 'all seksi') {
        map[u.seksi] = (map[u.seksi] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [units, catalogStats]);

  // Set nomor daisha yang saat ini SEDANG dalam antrean servis / perbaikan bengkel (tiket Open / Progress / Pending)
  const activeRepairNoDaishaSet = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.status === 'Open' || t.status === 'Progress' || t.status === 'Pending') {
        const norm = normalizeDaishaCode(t.noDaisha);
        if (norm && norm !== '-') {
          set.add(norm);
        }
      }
    });
    return set;
  }, [tickets]);

  // Fungsi penentu apakah unit terhitung NG (Dalam antrean bengkel / Scrap)
  // Single Source of Truth: Menjamin angka NG di KPI selalu 100% klop dengan antrean tindakan bengkel
  const isUnitNG = useMemo(() => {
    return (u: FleetUnit): boolean => {
      const norm = normalizeDaishaCode(u.nomor_daisha);
      if (!norm) return false;
      // Jika data tiket sudah termuat, antrean bengkel menjadi penentu mutlak unit yang NG
      if (tickets.length > 0) {
        if (activeRepairNoDaishaSet.has(norm)) return true;
        if (u.last_condition === 'SCRAP') return true;
        return false;
      }
      // Fallback sementara saat tiket sedang proses dimuat
      return isConditionNG(u.last_condition);
    };
  }, [activeRepairNoDaishaSet, tickets.length]);

  // Filter unit berdasarkan seksi jika ada seleksi aktif
  const targetUnits = useMemo(() => {
    if (!currentSeksi || currentSeksi === 'all') return units;
    return units.filter((u) => (u.seksi || '').toLowerCase() === currentSeksi.toLowerCase());
  }, [units, currentSeksi]);

  // 1. STATISTIK KESEHATAN ARMADA (2 POIN UTAMA: OKE VS NG)
  const globalStats = useMemo(() => {
    let broken = 0;
    const seksiSet = new Set<string>();
    const jenisSet = new Set<string>();

    targetUnits.forEach((u) => {
      if (u.seksi) seksiSet.add(u.seksi);
      if (u.jenis) jenisSet.add(u.jenis);

      const isNG = isUnitNG(u);

      if (isNG) {
        broken++;
      }
    });

    let total = targetUnits.length;
    if (catalogStats) {
      if (!currentSeksi || currentSeksi === 'all') {
        total = catalogStats.totalAllUnits > 0 ? catalogStats.totalAllUnits : targetUnits.length;
      } else {
        const matchedKey = Object.keys(catalogStats.bySeksi).find(
          (k) => k.toLowerCase() === currentSeksi.toLowerCase()
        );
        if (matchedKey && catalogStats.bySeksi[matchedKey] !== undefined) {
          total = catalogStats.bySeksi[matchedKey];
        }
      }
    }

    const ready = Math.max(0, total - broken);
    const pctReady = total > 0 ? (ready / total) * 100 : 100;
    const pctBroken = total > 0 ? (broken / total) * 100 : 0;

    // Unit bolak-balik bengkel dari tiket repair
    const unitTicketMap: Record<string, number> = {};
    tickets.forEach((t) => {
      if (currentSeksi && currentSeksi !== 'all' && (t.seksi || '').toLowerCase() !== currentSeksi.toLowerCase()) {
        return;
      }
      if (t.noDaisha && t.noDaisha !== '-') {
        unitTicketMap[t.noDaisha] = (unitTicketMap[t.noDaisha] || 0) + 1;
      }
    });

    const recurringUnitsCount = Object.values(unitTicketMap).filter((cnt) => cnt > 1).length;

    return {
      total,
      ready,
      broken,
      pctReady,
      pctBroken,
      totalSeksi: seksiSet.size,
      totalJenis: jenisSet.size,
      recurringUnitsCount,
    };
  }, [targetUnits, tickets, isUnitNG, currentSeksi, catalogStats]);

  // Breakdown KPI Jumlah Daisha dari Setiap Seksi (Total, OKE, NG)
  const seksiBreakdownList = useMemo<BreakdownItem[]>(() => {
    const map: Record<string, { label: string; seksi: string; total: number; oke: number; ng: number }> = {};
    
    // Inisialisasi dari seluruh seksi yang tercatat di katalog master
    const allKnownSeksi = Array.from(
      new Set([
        ...DAFTAR_SEKSI,
        ...(catalogStats?.bySeksi ? Object.keys(catalogStats.bySeksi) : []),
      ])
    ).filter((s) => Boolean(s) && s.toLowerCase() !== 'all seksi' && s.toLowerCase() !== 'all');

    allKnownSeksi.forEach((s) => {
      const offTotal = catalogStats?.bySeksi[s] ?? 0;
      map[s] = { label: s, seksi: s, total: offTotal, oke: 0, ng: 0 };
    });

    units.forEach((u) => {
      const rawS = u.seksi && u.seksi.trim() ? u.seksi.trim() : '';
      if (!rawS || rawS.toLowerCase() === 'all seksi' || rawS.toLowerCase() === 'all') return;
      
      // Cocokkan ke daftar seksi resmi atau pakai nama aslinya jika seksi baru
      const matchedSeksi = DAFTAR_SEKSI.find(
        (ds) => ds.toLowerCase() === rawS.toLowerCase()
      ) || rawS;

      if (!map[matchedSeksi]) {
        map[matchedSeksi] = { label: matchedSeksi, seksi: matchedSeksi, total: catalogStats?.bySeksi[matchedSeksi] ?? 0, oke: 0, ng: 0 };
      }
      const isNG = isUnitNG(u);
      if (isNG) {
        map[matchedSeksi].ng++;
      }
    });

    return Object.values(map)
      .map((item) => {
        const finalTotal = catalogStats?.bySeksi[item.seksi] ?? item.total;
        const finalOke = Math.max(0, finalTotal - item.ng);
        return {
          ...item,
          total: finalTotal,
          oke: finalOke,
          pctOke: finalTotal > 0 ? (finalOke / finalTotal) * 100 : 100,
          pctNg: finalTotal > 0 ? (item.ng / finalTotal) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [units, isUnitNG, catalogStats]);

  // 2. DATA PER JENIS DAISHA - Sinkron langsung dengan DaishaCatalog (Registri Daisha)
  const perJenisData = useMemo(() => {
    // A. Jika data katalog master (DaishaCatalog) tersedia, jadikan sebagai basis utama
    if (catalogStats?.catalogs && catalogStats.catalogs.length > 0) {
      // Saring katalog sesuai seksi aktif jika ada filter
      const targetCatalogs = catalogStats.catalogs.filter((cat) => {
        if (!currentSeksi || currentSeksi === 'all') return true;
        return (cat.seksi || '').toLowerCase() === currentSeksi.toLowerCase();
      });

      const processedNames = new Set<string>();

      const catalogList: JenisHealthItem[] = targetCatalogs.map((cat) => {
        const normCatName = normalizeDaishaCode(cat.name);
        processedNames.add(normCatName);

        // Hitung total unit resmi dari varian atau totalUnits
        let total = Number(cat.totalUnits) || 0;
        const variants = Array.isArray(cat.variants) ? cat.variants : [];
        if (variants.length > 0) {
          const vSum = variants.reduce((acc, v) => {
            const vUnits = Number(v.totalUnits) || 0;
            const minNum = Number(v.minNumber) || 1;
            const maxNum = Number(v.maxNumber) || (minNum + vUnits - 1);
            return acc + (vUnits > 0 ? vUnits : (maxNum >= minNum ? maxNum - minNum + 1 : 0));
          }, 0);
          if (vSum > 0) total = vSum;
        }

        // Cari unit yang rusak (NG) dari unit armada atau tiket aktif
        const brokenNoSet = new Set<string>();
        targetUnits.forEach((u) => {
          const normUName = normalizeDaishaCode(u.nama_daisha || u.jenis);
          const normNo = normalizeDaishaCode(u.nomor_daisha);
          const isMatching =
            normUName === normCatName ||
            (cat.codePrefix && normNo.startsWith(normalizeDaishaCode(cat.codePrefix))) ||
            variants.some((v) => v.codePrefix && normNo.startsWith(normalizeDaishaCode(v.codePrefix)));

          if (isMatching && isUnitNG(u)) {
            brokenNoSet.add(normNo);
          }
        });

        const broken = brokenNoSet.size;
        const ready = Math.max(0, total - broken);

        return {
          id: cat.id,
          nama: cat.name,
          seksi: cat.seksi,
          total,
          ready,
          broken,
          pctReady: total > 0 ? (ready / total) * 100 : 100,
          pctBroken: total > 0 ? (broken / total) * 100 : 0,
          seksiList: [cat.seksi || 'Building'],
          codePrefix: cat.codePrefix,
          components: cat.components || [],
          variants,
        };
      });

      // Tambahkan unit ad-hoc yang mungkin belum ada di DaishaCatalog
      const adhocMap: Record<string, { nama: string; total: number; ready: number; broken: number; seksiSet: Set<string> }> = {};
      targetUnits.forEach((u) => {
        const j = (u.nama_daisha || u.jenis || 'LAINNYA').trim();
        const normJ = normalizeDaishaCode(j);
        if (processedNames.has(normJ)) return;

        if (!adhocMap[j]) {
          adhocMap[j] = { nama: j, total: 0, ready: 0, broken: 0, seksiSet: new Set() };
        }
        adhocMap[j].total++;
        if (u.seksi) adhocMap[j].seksiSet.add(u.seksi);
        if (isUnitNG(u)) {
          adhocMap[j].broken++;
        } else {
          adhocMap[j].ready++;
        }
      });

      const adhocList: JenisHealthItem[] = Object.values(adhocMap).map((item) => ({
        nama: item.nama,
        seksi: Array.from(item.seksiSet)[0] || 'Lainnya',
        total: item.total,
        ready: item.ready,
        broken: item.broken,
        pctReady: item.total > 0 ? (item.ready / item.total) * 100 : 100,
        pctBroken: item.total > 0 ? (item.broken / item.total) * 100 : 0,
        seksiList: Array.from(item.seksiSet),
      }));

      return [...catalogList, ...adhocList];
    }

    // B. Fallback: Kelompokkan dari targetUnits jika katalog belum termuat
    const map: Record<
      string,
      { nama: string; total: number; ready: number; broken: number; seksiSet: Set<string> }
    > = {};

    targetUnits.forEach((u) => {
      const j = (u.nama_daisha || u.jenis || 'LAINNYA').trim();
      if (!map[j]) {
        map[j] = { nama: j, total: 0, ready: 0, broken: 0, seksiSet: new Set() };
      }
      map[j].total++;
      if (u.seksi) map[j].seksiSet.add(u.seksi);

      const isNG = isUnitNG(u);

      if (isNG) {
        map[j].broken++;
      } else {
        map[j].ready++;
      }
    });

    const list: JenisHealthItem[] = Object.values(map).map((item) => ({
      nama: item.nama,
      seksi: Array.from(item.seksiSet)[0] || 'Lainnya',
      total: item.total,
      ready: item.ready,
      broken: item.broken,
      pctReady: item.total > 0 ? (item.ready / item.total) * 100 : 100,
      pctBroken: item.total > 0 ? (item.broken / item.total) * 100 : 0,
      seksiList: Array.from(item.seksiSet),
    }));

    return list;
  }, [catalogStats?.catalogs, targetUnits, currentSeksi, isUnitNG]);

  // Breakdown saat seksi difilter (mengikuti langsung perJenisData agar 100% konsisten)
  const jenisInSeksiBreakdownList = useMemo<BreakdownItem[]>(() => {
    if (!currentSeksi || currentSeksi === 'all') return [];

    return perJenisData
      .map((item) => ({
        label: item.nama,
        seksi: item.seksi || currentSeksi,
        jenis: item.nama,
        total: item.total,
        oke: item.ready,
        ng: item.broken,
        pctOke: item.pctReady,
        pctNg: item.pctBroken,
      }))
      .sort((a, b) => b.total - a.total);
  }, [currentSeksi, perJenisData]);

  const isSeksiFiltered = Boolean(currentSeksi && currentSeksi !== 'all');
  const activeBreakdownList: BreakdownItem[] = isSeksiFiltered ? jenisInSeksiBreakdownList : seksiBreakdownList;

  // Data donat master
  const globalDonutData = useMemo(
    () => [
      { name: 'OKE (Siap Operasi)', value: globalStats.ready, color: '#059669' },
      { name: 'NG (Perlu Servis/Bengkel)', value: globalStats.broken, color: '#dc2626' },
    ],
    [globalStats.ready, globalStats.broken]
  );

  // Filter & Sort per jenis daisha
  const filteredJenisData = useMemo(() => {
    let result = [...perJenisData];

    if (statusFilter === 'HAS_BROKEN') {
      result = result.filter((j) => j.broken > 0);
    } else if (statusFilter === 'ALL_READY') {
      result = result.filter((j) => j.broken === 0);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (j) =>
          j.nama.toLowerCase().includes(q) ||
          j.seksiList.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (sortOrder === 'BROKEN') {
      result.sort((a, b) => b.broken - a.broken || b.total - a.total);
    } else {
      result.sort((a, b) => b.total - a.total);
    }

    return result;
  }, [perJenisData, statusFilter, searchTerm, sortOrder]);

  const countHasBroken = useMemo(() => perJenisData.filter((j) => j.broken > 0).length, [perJenisData]);
  const countAllReady = useMemo(() => perJenisData.filter((j) => j.broken === 0).length, [perJenisData]);

  // 3. TOP UNIT BOLAK-BALIK BENGKEL (PARETO RECURRING REPAIR)
  const topRecurringUnits = useMemo<RecurringUnitItem[]>(() => {
    const unitMap: Record<string, RecurringUnitItem> = {};

    tickets.forEach((t) => {
      if (currentSeksi && currentSeksi !== 'all' && (t.seksi || '').toLowerCase() !== currentSeksi.toLowerCase()) {
        return;
      }
      if (t.noDaisha && t.noDaisha !== '-') {
        if (!unitMap[t.noDaisha]) {
          unitMap[t.noDaisha] = {
            noDaisha: t.noDaisha,
            namaDaisha: t.namaDaisha || 'Daisha',
            seksi: t.seksi || '-',
            repairCount: 0,
            activeInWorkshop: t.status === 'Open' || t.status === 'Progress' || t.status === 'Pending',
          };
        }
        unitMap[t.noDaisha].repairCount++;
        if (t.status === 'Open' || t.status === 'Progress' || t.status === 'Pending') {
          unitMap[t.noDaisha].activeInWorkshop = true;
        }
      }
    });

    return Object.values(unitMap)
      .filter((u) => u.repairCount > 1)
      .sort((a, b) => b.repairCount - a.repairCount)
      .slice(0, 10);
  }, [tickets, currentSeksi]);

  return {
    currentSeksi,
    handleSeksiChange,
    availableSeksiList,
    targetUnits,
    globalStats,
    seksiBreakdownList,
    isSeksiFiltered,
    activeBreakdownList,
    globalDonutData,
    perJenisData,
    filteredJenisData,
    countHasBroken,
    countAllReady,
    topRecurringUnits,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
  };
}
