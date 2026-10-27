'use client';

import React, { useState, useMemo } from 'react';
import { BreakdownItem } from './MaintenanceKPICards';
import { DailyTrendItem } from './TargetVsActualChart';
import { FleetUnit } from './FleetExplorer';
import {
  filterFleetUnits,
  aggregateJenisList,
  aggregateSeksiList,
  sortMatrixList,
  UnifiedMatrixItem,
} from '@/lib/pmAnalytics';
import PmMeetingHeader, { ChartViewType } from './pm-meeting/PmMeetingHeader';
import PmMeetingCharts from './pm-meeting/PmMeetingCharts';
import PmMeetingFilterBar from './pm-meeting/PmMeetingFilterBar';
import PmMatrixTable from './pm-meeting/PmMatrixTable';

export type { UnifiedMatrixItem };

interface PmMeetingDashboardProps {
  breakdown: Record<string, BreakdownItem>;
  dailyTrend: DailyTrendItem[];
  units: FleetUnit[];
  remainingWorkDays: number;
  dailyTarget: number;
  todayActual: number;
  currentYear: number;
  conditionStats?: {
    okCount: number;
    rusakCount: number;
    totalCondition: number;
    okPercentage: number;
    rusakPercentage: number;
  };
  onExportRepair?: () => void;
  repairTicketsCount?: number;
  onYearChange?: (year: number) => void;
}

export default function PmMeetingDashboard({
  breakdown = {},
  dailyTrend = [],
  units = [],
  remainingWorkDays = 1,
  currentYear,
  conditionStats,
  onExportRepair,
  repairTicketsCount = 0,
  onYearChange,
}: PmMeetingDashboardProps) {
  // State interaksi tabel & chart
  const [groupingMode, setGroupingMode] = useState<'JENIS' | 'SEKSI'>('JENIS');
  const [splitBySize, setSplitBySize] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'backlog' | 'total' | 'rusak' | 'pct' | 'target' | 'name'
  >('backlog');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [unitStatusFilter, setUnitStatusFilter] = useState<
    'all' | 'unmaintained' | 'maintained' | 'rusak'
  >('all');
  const [unitSearch, setUnitSearch] = useState<string>('');
  const [chartView, setChartView] = useState<ChartViewType>('ALL');

  // Multi-Filter Mapping PM
  const [filterSeksi, setFilterSeksi] = useState<string>('all');
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [filterUkuran, setFilterUkuran] = useState<string>('all');
  const [filterPmStatus, setFilterPmStatus] = useState<
    'all' | 'maintained' | 'unmaintained'
  >('all');
  const [filterCondition, setFilterCondition] = useState<
    'all' | 'OK' | 'RUSAK'
  >('all');

  // Opsi Seksi dari data master armada
  const seksiOptions = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u) => {
      if (u.seksi && u.seksi.trim() && u.seksi.toLowerCase() !== 'all seksi') {
        set.add(u.seksi.trim());
      }
    });
    return Array.from(set).sort();
  }, [units]);

  // Opsi Jenis Daisha
  const jenisOptions = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u) => {
      if (u.jenis && u.jenis.trim()) {
        set.add(u.jenis.trim());
      }
    });
    return Array.from(set).sort();
  }, [units]);

  const hasActiveFilters =
    filterSeksi !== 'all' ||
    filterJenis !== 'all' ||
    filterUkuran !== 'all' ||
    filterPmStatus !== 'all' ||
    filterCondition !== 'all' ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setFilterSeksi('all');
    setFilterJenis('all');
    setFilterUkuran('all');
    setFilterPmStatus('all');
    setFilterCondition('all');
    setSearchQuery('');
  };

  // Unit yang disaring dengan multi-filter
  const filteredUnits = useMemo(() => {
    return filterFleetUnits(units, {
      filterSeksi,
      filterJenis,
      filterUkuran,
      filterPmStatus,
      filterCondition,
      searchQuery,
    });
  }, [
    units,
    filterSeksi,
    filterJenis,
    filterUkuran,
    filterPmStatus,
    filterCondition,
    searchQuery,
  ]);

  // 1. Agregasi Berdasarkan Jenis Daisha & Ukuran
  const {
    jenisList,
    totalPopulasi,
    totalMaintained,
    totalUnmaintained,
  } = useMemo(() => {
    return aggregateJenisList(
      filteredUnits,
      breakdown,
      splitBySize,
      remainingWorkDays
    );
  }, [filteredUnits, breakdown, splitBySize, remainingWorkDays]);

  // 2. Agregasi Berdasarkan Seksi Operasional Pabrik
  const seksiList = useMemo(() => {
    return aggregateSeksiList(filteredUnits, remainingWorkDays);
  }, [filteredUnits, remainingWorkDays]);

  // List data aktif terurut sesuai mode grouping
  const activeMatrixList = useMemo(() => {
    const sourceList = groupingMode === 'JENIS' ? jenisList : seksiList;
    const filteredByQuery = sourceList.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.nama.toLowerCase().includes(q) ||
        (item.subLabel || '').toLowerCase().includes(q)
      );
    });
    return sortMatrixList(filteredByQuery, sortBy);
  }, [groupingMode, jenisList, seksiList, searchQuery, sortBy]);

  // Status OK vs Rusak
  const okUnitsCount = useMemo(() => {
    if (conditionStats && conditionStats.totalCondition > 0 && !hasActiveFilters) {
      return conditionStats.okCount;
    }
    return filteredUnits.filter((u) => (u.last_condition || 'OK') !== 'RUSAK')
      .length;
  }, [conditionStats, filteredUnits, hasActiveFilters]);

  const rusakUnitsCount = useMemo(() => {
    if (conditionStats && conditionStats.totalCondition > 0 && !hasActiveFilters) {
      return conditionStats.rusakCount;
    }
    return filteredUnits.filter((u) => (u.last_condition || 'OK') === 'RUSAK')
      .length;
  }, [conditionStats, filteredUnits, hasActiveFilters]);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Ringkasan Meeting & Mini Cards */}
      <PmMeetingHeader
        currentYear={currentYear}
        onYearChange={onYearChange}
        units={units}
        totalPopulasi={totalPopulasi}
        okUnitsCount={okUnitsCount}
        rusakUnitsCount={rusakUnitsCount}
        totalMaintained={totalMaintained}
        remainingWorkDays={remainingWorkDays}
        repairTicketsCount={repairTicketsCount}
        jenisCount={jenisList.length}
        chartView={chartView}
        setChartView={setChartView}
        onExportRepair={onExportRepair}
      />

      {/* 2. Visual Charts Meeting */}
      <PmMeetingCharts
        chartView={chartView}
        jenisList={jenisList}
        dailyTrend={dailyTrend}
        totalPopulasi={totalPopulasi}
        totalMaintained={totalMaintained}
        totalUnmaintained={totalUnmaintained}
        okUnitsCount={okUnitsCount}
        rusakUnitsCount={rusakUnitsCount}
        currentYear={currentYear}
      />

      {/* 3. Tabel Mapping Lengkap Status PM per Jenis/Seksi */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <PmMeetingFilterBar
          currentYear={currentYear}
          groupingMode={groupingMode}
          setGroupingMode={setGroupingMode}
          splitBySize={splitBySize}
          setSplitBySize={setSplitBySize}
          filterSeksi={filterSeksi}
          setFilterSeksi={setFilterSeksi}
          filterJenis={filterJenis}
          setFilterJenis={setFilterJenis}
          filterUkuran={filterUkuran}
          setFilterUkuran={setFilterUkuran}
          filterPmStatus={filterPmStatus}
          setFilterPmStatus={setFilterPmStatus}
          filterCondition={filterCondition}
          setFilterCondition={setFilterCondition}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          seksiOptions={seksiOptions}
          jenisOptions={jenisOptions}
          hasActiveFilters={hasActiveFilters}
          handleResetFilters={handleResetFilters}
          onClearExpanded={() => setExpandedKey(null)}
        />
        <PmMatrixTable
          activeMatrixList={activeMatrixList}
          groupingMode={groupingMode}
          currentYear={currentYear}
          expandedKey={expandedKey}
          setExpandedKey={setExpandedKey}
          unitStatusFilter={unitStatusFilter}
          setUnitStatusFilter={setUnitStatusFilter}
          unitSearch={unitSearch}
          setUnitSearch={setUnitSearch}
        />
      </div>
    </div>
  );
}
