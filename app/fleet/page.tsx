'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTickets } from '@/hooks/useTickets';
import { useDaishaCatalog } from '@/hooks/useDaishaCatalog';
import { useFleetAnalytics, FleetUnitItem } from '@/hooks/useFleetAnalytics';
import { exportFleetUnitsToExcel } from '@/lib/excelExport';
import {
  Download,
  PlusCircle,
  Loader2,
} from 'lucide-react';

import FleetMetricCards from '@/components/fleet/FleetMetricCards';
import SectionFleetCharts from '@/components/fleet/SectionFleetCharts';
import MaintenanceWatchlist from '@/components/fleet/MaintenanceWatchlist';
import FleetMaintenanceTable from '@/components/fleet/FleetMaintenanceTable';
import UnitHistoryModal from '@/components/fleet/UnitHistoryModal';

export default function FleetMaintenancePage() {
  const {
    tickets,
    loading: ticketsLoading,
  } = useTickets({ autoRefreshIntervalMs: 60000 });

  const {
    tree: daishaTree,
    loading: catalogLoading,
  } = useDaishaCatalog();

  const {
    allUnits,
    totalFleetUnits,
    healthyUnits,
    dueSoonUnits,
    overdueUnits,
    dormantUnits,
    inWorkshopUnits,
    sectionSummaries,
    urgentReminderUnits,
  } = useFleetAnalytics(tickets, daishaTree);

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSeksi, setSelectedSeksi] = useState<string>('');
  const [inspectedUnit, setInspectedUnit] = useState<FleetUnitItem | null>(null);

  const handleExportExcel = () => {
    exportFleetUnitsToExcel(allUnits, 'Kontrol_Armada_Daisha');
  };

  const isLoading = ticketsLoading || catalogLoading;

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-8 space-y-4 max-w-7xl mx-auto">
      {/* 1. Clean Compact Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kontrol Pemeliharaan Unit
          </h1>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {totalFleetUnits.toLocaleString('id-ID')} Unit
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor Excel</span>
          </button>

          <Link
            href="/input"
            className="h-8 px-3.5 bg-[#E60012] hover:bg-[#CC0010] text-white rounded text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Lapor Servis</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards (Clean 4 KPIs) */}
      <FleetMetricCards
        totalFleetUnits={totalFleetUnits}
        healthyUnits={healthyUnits}
        dueSoonUnits={dueSoonUnits}
        overdueUnits={overdueUnits}
        dormantUnits={dormantUnits}
        inWorkshopUnits={inWorkshopUnits}
        activeFilter={activeFilter}
        onSelectFilter={(filter) => setActiveFilter(filter)}
      />

      {/* 3. Visual Charts (Bar Chart Populasi & Donut Status) */}
      <SectionFleetCharts
        sectionSummaries={sectionSummaries}
        selectedSeksi={selectedSeksi}
        onSelectSeksi={(seksi) => setSelectedSeksi(seksi)}
        totalFleetUnits={totalFleetUnits}
        healthyUnits={healthyUnits}
        dueSoonUnits={dueSoonUnits}
        overdueUnits={overdueUnits}
        dormantUnits={dormantUnits}
        inWorkshopUnits={inWorkshopUnits}
        activeFilter={activeFilter}
        onSelectFilter={(filter) => setActiveFilter(filter)}
      />

      {/* 4. Fitur Pemantauan: Antrean Prioritas Servis */}
      <MaintenanceWatchlist
        urgentUnits={urgentReminderUnits}
        onViewAllNeedService={() => setActiveFilter('NEED_SERVICE')}
        onSelectUnit={(unit) => setInspectedUnit(unit)}
      />

      {/* 5. Unit Table */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-lg border border-slate-200">
          <Loader2 className="w-7 h-7 text-[#E60012] animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Memuat data armada...</p>
        </div>
      ) : (
        <FleetMaintenanceTable
          units={allUnits}
          onSelectUnit={(unit) => setInspectedUnit(unit)}
          selectedFilter={activeFilter}
          onFilterChange={(f) => setActiveFilter(f)}
          selectedType={selectedType}
          onTypeChange={(t) => setSelectedType(t)}
          selectedSeksi={selectedSeksi}
          onSelectSeksi={(s) => setSelectedSeksi(s)}
        />
      )}

      {/* 5. Detail Modal */}
      <UnitHistoryModal
        unit={inspectedUnit}
        onClose={() => setInspectedUnit(null)}
      />
    </div>
  );
}
