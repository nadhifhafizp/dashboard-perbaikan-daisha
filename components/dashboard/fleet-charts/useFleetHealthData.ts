'use client';

import { useState, useMemo, useEffect } from 'react';
import { FleetUnit } from '@/components/maintenance/FleetExplorer';
import { Ticket } from '@/types/ticket';
import { JenisHealthItem, BreakdownItem, RecurringUnitItem } from './types';

interface UseFleetHealthDataProps {
  units: FleetUnit[];
  tickets: Ticket[];
  selectedSeksi?: string;
  onSelectSeksi?: (seksi: string) => void;
}

export function useFleetHealthData({
  units,
  tickets,
  selectedSeksi = '',
  onSelectSeksi,
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

  // Daftar seksi yang tersedia dengan jumlah unit armada
  const availableSeksiList = useMemo(() => {
    const map: Record<string, number> = {};
    units.forEach((u) => {
      if (u.seksi) {
        map[u.seksi] = (map[u.seksi] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [units]);

  // Set nomor daisha yang saat ini SEDANG dalam antrean servis / perbaikan bengkel (tiket Open / Progress / Pending)
  const activeRepairNoDaishaSet = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.status === 'Open' || t.status === 'Progress' || t.status === 'Pending') {
        if (t.noDaisha && t.noDaisha.trim() && t.noDaisha !== '-') {
          set.add(t.noDaisha.trim().toUpperCase());
        }
      }
    });
    return set;
  }, [tickets]);

  // Filter unit berdasarkan seksi jika ada seleksi aktif
  const targetUnits = useMemo(() => {
    if (!currentSeksi || currentSeksi === 'all') return units;
    return units.filter((u) => (u.seksi || '').toLowerCase() === currentSeksi.toLowerCase());
  }, [units, currentSeksi]);

  // 1. STATISTIK KESEHATAN ARMADA (2 POIN UTAMA: OKE VS NG)
  const globalStats = useMemo(() => {
    const total = targetUnits.length;
    let ready = 0;
    let broken = 0;
    const seksiSet = new Set<string>();
    const jenisSet = new Set<string>();

    targetUnits.forEach((u) => {
      if (u.seksi) seksiSet.add(u.seksi);
      if (u.jenis) jenisSet.add(u.jenis);

      const isNG =
        activeRepairNoDaishaSet.has((u.nomor_daisha || '').trim().toUpperCase()) ||
        u.last_condition === 'RUSAK';

      if (isNG) {
        broken++;
      } else {
        ready++;
      }
    });

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
  }, [targetUnits, tickets, activeRepairNoDaishaSet, currentSeksi]);

  // Breakdown KPI Jumlah Daisha dari Setiap Seksi (Total, OKE, NG)
  const seksiBreakdownList = useMemo<BreakdownItem[]>(() => {
    const map: Record<string, { label: string; seksi: string; total: number; oke: number; ng: number }> = {};
    units.forEach((u) => {
      const s = u.seksi && u.seksi.trim() ? u.seksi.trim() : 'Lainnya';
      if (!map[s]) {
        map[s] = { label: s, seksi: s, total: 0, oke: 0, ng: 0 };
      }
      map[s].total++;
      const isNG =
        activeRepairNoDaishaSet.has((u.nomor_daisha || '').trim().toUpperCase()) ||
        u.last_condition === 'RUSAK';
      if (isNG) {
        map[s].ng++;
      } else {
        map[s].oke++;
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        pctOke: item.total > 0 ? (item.oke / item.total) * 100 : 100,
        pctNg: item.total > 0 ? (item.ng / item.total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [units, activeRepairNoDaishaSet]);

  // Breakdown saat seksi difilter
  const jenisInSeksiBreakdownList = useMemo<BreakdownItem[]>(() => {
    if (!currentSeksi || currentSeksi === 'all') return [];

    const map: Record<string, { label: string; jenis: string; total: number; oke: number; ng: number }> = {};
    targetUnits.forEach((u) => {
      const j = u.jenis && u.jenis.trim() ? u.jenis.trim() : 'LAINNYA';
      if (!map[j]) {
        map[j] = { label: j, jenis: j, total: 0, oke: 0, ng: 0 };
      }
      map[j].total++;
      const isNG =
        activeRepairNoDaishaSet.has((u.nomor_daisha || '').trim().toUpperCase()) ||
        u.last_condition === 'RUSAK';
      if (isNG) {
        map[j].ng++;
      } else {
        map[j].oke++;
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        pctOke: item.total > 0 ? (item.oke / item.total) * 100 : 100,
        pctNg: item.total > 0 ? (item.ng / item.total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [targetUnits, currentSeksi, activeRepairNoDaishaSet]);

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

  // 2. DATA PER JENIS DAISHA
  const perJenisData = useMemo(() => {
    const map: Record<
      string,
      { nama: string; total: number; ready: number; broken: number; seksiSet: Set<string> }
    > = {};

    targetUnits.forEach((u) => {
      const j = u.jenis ? u.jenis.trim() : 'LAINNYA';
      if (!map[j]) {
        map[j] = { nama: j, total: 0, ready: 0, broken: 0, seksiSet: new Set() };
      }
      map[j].total++;
      if (u.seksi) map[j].seksiSet.add(u.seksi);

      const isNG =
        activeRepairNoDaishaSet.has((u.nomor_daisha || '').trim().toUpperCase()) ||
        u.last_condition === 'RUSAK';

      if (isNG) {
        map[j].broken++;
      } else {
        map[j].ready++;
      }
    });

    const list: JenisHealthItem[] = Object.values(map).map((item) => ({
      nama: item.nama,
      total: item.total,
      ready: item.ready,
      broken: item.broken,
      pctReady: item.total > 0 ? (item.ready / item.total) * 100 : 100,
      pctBroken: item.total > 0 ? (item.broken / item.total) * 100 : 0,
      seksiList: Array.from(item.seksiSet),
    }));

    return list;
  }, [targetUnits, activeRepairNoDaishaSet]);

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
