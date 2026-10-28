'use client';

import React from 'react';
import { FleetUnit } from '@/components/maintenance/FleetExplorer';
import { Ticket } from '@/types/ticket';
import { useFleetHealthData } from './fleet-charts/useFleetHealthData';
import FleetSeksiFilterBar from './fleet-charts/FleetSeksiFilterBar';
import FleetMasterOverview from './fleet-charts/FleetMasterOverview';
import FleetSeksiBreakdown from './fleet-charts/FleetSeksiBreakdown';
import FleetJenisDonutGrid from './fleet-charts/FleetJenisDonutGrid';
import FleetRecurringUnits from './fleet-charts/FleetRecurringUnits';

interface FleetHealthChartsProps {
  units: FleetUnit[];
  tickets: Ticket[];
  selectedSeksi?: string;
  onSelectSeksi?: (seksi: string) => void;
  isSeksiLocked?: boolean;
}

export default function FleetHealthCharts({
  units,
  tickets,
  selectedSeksi = '',
  onSelectSeksi,
  isSeksiLocked = false,
}: FleetHealthChartsProps) {
  const {
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
  } = useFleetHealthData({
    units,
    tickets,
    selectedSeksi,
    onSelectSeksi,
  });

  return (
    <div className="space-y-4">
      {/* 0. Filter Bar Seksi (Hanya tampil jika tidak dikunci untuk seksi tertentu) */}
      {!isSeksiLocked && (
        <FleetSeksiFilterBar
          currentSeksi={currentSeksi}
          totalUnitsCount={units.length}
          availableSeksiList={availableSeksiList}
          onSelectSeksi={handleSeksiChange}
        />
      )}

      {/* 1. Master Donut & 2 Poin Utama (OKE vs NG) */}
      <FleetMasterOverview
        currentSeksi={currentSeksi}
        onClearSeksi={() => !isSeksiLocked && handleSeksiChange('')}
        globalDonutData={globalDonutData}
        globalStats={globalStats}
        isSeksiLocked={isSeksiLocked}
      />

      {/* 2. Breakdown KPI Daisha dari Setiap Seksi (Stacked Bar & Tabel) */}
      <FleetSeksiBreakdown
        seksiBreakdownList={seksiBreakdownList}
        activeBreakdownList={activeBreakdownList}
        isSeksiFiltered={isSeksiFiltered}
        currentSeksi={currentSeksi}
        targetUnitsCount={targetUnits.length}
        onSelectSeksi={handleSeksiChange}
      />

      {/* 3. Koleksi Diagram Donat per Jenis Daisha */}
      <FleetJenisDonutGrid
        currentSeksi={currentSeksi}
        perJenisData={perJenisData}
        filteredJenisData={filteredJenisData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        countHasBroken={countHasBroken}
        countAllReady={countAllReady}
      />

      {/* 4. Rincian Unit yang Paling Sering Servis */}
      <FleetRecurringUnits
        recurringUnitsCount={globalStats.recurringUnitsCount}
        topRecurringUnits={topRecurringUnits}
      />
    </div>
  );
}
