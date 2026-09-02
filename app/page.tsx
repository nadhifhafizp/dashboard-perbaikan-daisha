'use client';

import React, { useState } from 'react';
import { useTickets } from '@/hooks/useTickets';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { exportTicketsToExcel } from '@/lib/excelExport';

// Modular Dashboard Components
import KpiCards from '@/components/dashboard/KpiCards';
import VisualFilterTabs, { TabType } from '@/components/dashboard/VisualFilterTabs';
import FilterPanel from '@/components/dashboard/FilterPanel';
import DaishaCharts from '@/components/dashboard/DaishaCharts';
import DamageCharts from '@/components/dashboard/DamageCharts';
import ThroughputCharts from '@/components/dashboard/ThroughputCharts';
import SectionCharts from '@/components/dashboard/SectionCharts';
import TicketTable from '@/components/dashboard/TicketTable';

export default function DashboardPage() {
  const {
    tickets: dataRaw,
    loading,
    isRefreshing,
    refresh,
  } = useTickets({
    autoRefreshIntervalMs: 45000,
  });

  // Tab Visual Switcher State
  const [activeVisualTab, setActiveVisualTab] = useState<TabType>('all');

  // Filter States
  const [search, setSearch] = useState('');
  const [filterSeksi, setFilterSeksi] = useState('');
  const [filterDaisha, setFilterDaisha] = useState('');
  const [filterNoDaisha, setFilterNoDaisha] = useState('');
  const [filterKerusakan, setFilterKerusakan] = useState('');
  const [filterDetail, setFilterDetail] = useState('');
  const [filterPelapor, setFilterPelapor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHanyaBerulang, setFilterHanyaBerulang] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Hook Analitik Terpusat (Simulasi SQL Engine: WHERE, GROUP BY, COUNT, AVG)
  const { filteredData, filterOptions, kpi, charts } = useDashboardAnalytics(dataRaw, {
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
  });

  // Shortcut Preset Filter Tanggal Cepat
  const handleQuickPreset = (days: number) => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);
    const todayStr = formatDate(today);

    if (days === 0) {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else {
      const past = new Date();
      past.setDate(today.getDate() - days);
      setStartDate(formatDate(past));
      setEndDate(todayStr);
    }
  };

  const handleResetFilter = () => {
    setSearch('');
    setFilterSeksi('');
    setFilterDaisha('');
    setFilterNoDaisha('');
    setFilterKerusakan('');
    setFilterDetail('');
    setFilterPelapor('');
    setFilterStatus('');
    setFilterHanyaBerulang(false);
    setStartDate('');
    setEndDate('');
  };

  // Ekspor Excel (.xlsx) dengan pemecahan multi-kerusakan per baris
  const exportToExcel = () => {
    exportTicketsToExcel(filteredData, 'Dashboard_Rekap_Daisha');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <span>📊</span> Dashboard Analitik & Rekapitulasi Daisha
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitoring komprehensif seluruh data perbaikan, reliabilitas unit, pareto kerusakan, dan lead time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
            <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
          </button>
        </div>
      </div>

      {/* 1. 7 Kartu Metrik Ringkasan Eksekutif */}
      <KpiCards
        kpi={kpi}
        filterHanyaBerulang={filterHanyaBerulang}
        setFilterHanyaBerulang={setFilterHanyaBerulang}
        setFilterStatus={setFilterStatus}
      />

      {/* 2. Tab Switcher Visualisasi Interaktif */}
      <VisualFilterTabs
        activeTab={activeVisualTab}
        setActiveTab={setActiveVisualTab}
      />

      {/* 3. Panel Filter & Pencarian Lengkap */}
      <FilterPanel
        search={search}
        setSearch={setSearch}
        filterSeksi={filterSeksi}
        setFilterSeksi={setFilterSeksi}
        filterDaisha={filterDaisha}
        setFilterDaisha={setFilterDaisha}
        filterNoDaisha={filterNoDaisha}
        setFilterNoDaisha={setFilterNoDaisha}
        filterKerusakan={filterKerusakan}
        setFilterKerusakan={setFilterKerusakan}
        filterDetail={filterDetail}
        setFilterDetail={setFilterDetail}
        filterPelapor={filterPelapor}
        setFilterPelapor={setFilterPelapor}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        filterHanyaBerulang={filterHanyaBerulang}
        setFilterHanyaBerulang={setFilterHanyaBerulang}
        pilihanDaishaFiltered={filterOptions.pilihanDaisha}
        pilihanKomponenFiltered={filterOptions.pilihanKomponen}
        pilihanDetailFiltered={filterOptions.pilihanDetail}
        pilihanNoDaisha={filterOptions.pilihanNoDaisha}
        pilihanPelapor={filterOptions.pilihanPelapor}
        handleQuickPreset={handleQuickPreset}
        handleResetFilter={handleResetFilter}
        filteredCount={filteredData.length}
        totalCount={dataRaw.length}
      />

      {/* 4. Area Visualisasi Grafik Dinamis Sesuai Tab */}
      {(activeVisualTab === 'all' || activeVisualTab === 'daisha') && (
        <DaishaCharts
          chartUnitFreq={charts.unitFreq}
          chartSemuaDaisha={charts.semuaDaisha}
        />
      )}

      {(activeVisualTab === 'all' || activeVisualTab === 'damage') && (
        <DamageCharts
          chartKategori={charts.kategori}
          chartDetailGejala={charts.detailGejala}
          tindakanStats={charts.tindakanStats}
          sparepartKebutuhan={charts.sparepartKebutuhan}
        />
      )}

      {(activeVisualTab === 'all' || activeVisualTab === 'throughput') && (
        <ThroughputCharts
          chartTrenHarian={charts.trenHarian}
          chartStatusData={charts.statusData}
          chartLeadTime={charts.leadTime}
          avgLeadTimeHours={kpi.avgLeadTimeHours}
        />
      )}

      {(activeVisualTab === 'all' || activeVisualTab === 'seksi') && (
        <SectionCharts
          chartSeksiStacked={charts.seksiStacked}
          chartPelapor={charts.pelapor}
        />
      )}

      {(activeVisualTab === 'all' || activeVisualTab === 'table') && (
        <TicketTable
          filteredData={filteredData}
          loading={loading}
          exportToExcel={exportToExcel}
        />
      )}
    </div>
  );
}