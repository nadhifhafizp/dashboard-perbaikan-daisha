'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/hooks/useTickets';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { exportTicketsToExcel } from '@/lib/excelExport';
import { ArrowLeft, RefreshCw, PlusCircle, ClipboardList, Settings, Loader2 } from 'lucide-react';

import FilterPanel from '@/components/dashboard/FilterPanel';
import DaishaCharts from '@/components/dashboard/DaishaCharts';
import DamageCharts from '@/components/dashboard/DamageCharts';
import ThroughputCharts from '@/components/dashboard/ThroughputCharts';
import SectionCharts from '@/components/dashboard/SectionCharts';
import TicketTable from '@/components/dashboard/TicketTable';

export default function DaishaDashboardPage() {
  const { isAdmin } = useAuth();
  const {
    tickets: dataRaw,
    loading,
    isRefreshing,
    refresh,
  } = useTickets({
    autoRefreshIntervalMs: 45000,
  });

  // Filter States
  const [search, setSearch] = useState('');
  const [filterSeksi, setFilterSeksi] = useState('');
  const [filterDaisha, setFilterDaisha] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHanyaBerulang, setFilterHanyaBerulang] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Centralized Analytics Engine
  const { filteredData, filterOptions, kpi, charts } = useDashboardAnalytics(dataRaw, {
    search,
    filterSeksi,
    filterDaisha,
    filterNoDaisha: '',
    filterKerusakan: '',
    filterDetail: '',
    filterPelapor: '',
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
    setFilterStatus('');
    setFilterHanyaBerulang(false);
    setStartDate('');
    setEndDate('');
  };

  // Ekspor Excel (.xlsx)
  const exportToExcel = () => {
    exportTicketsToExcel(filteredData, 'Dashboard_Rekap_Daisha');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-5 max-w-7xl mx-auto">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal Utama</span>
            </Link>
            <span className="text-slate-300 text-xs">/</span>
            <span className="text-[11px] font-medium text-slate-700">
              Sistem Perbaikan Daisha
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Dashboard Analitik & Rekapitulasi Daisha
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-normal max-w-2xl">
            Monitoring reliabilitas unit, analisis seksi, tren kerusakan komponen, dan lead time perbaikan
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/input"
            className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Input Daisha</span>
          </Link>
          <Link
            href="/riwayat"
            className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
            <span>Status Antrean</span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Buka Panel Tindakan Admin"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Panel Tindakan</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Panel Filter & Pencarian Lengkap */}
      <FilterPanel
        search={search}
        setSearch={setSearch}
        filterSeksi={filterSeksi}
        setFilterSeksi={setFilterSeksi}
        filterDaisha={filterDaisha}
        setFilterDaisha={setFilterDaisha}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        filterHanyaBerulang={filterHanyaBerulang}
        setFilterHanyaBerulang={setFilterHanyaBerulang}
        pilihanDaishaFiltered={filterOptions.pilihanDaisha}
        handleQuickPreset={handleQuickPreset}
        handleResetFilter={handleResetFilter}
        filteredCount={filteredData.length}
        totalCount={dataRaw.length}
      />

      {/* 3. Area Visualisasi Grafik Lengkap */}
      <div className="space-y-5">
        {/* Row 1: Section Charts + Daisha Ranked Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7">
            <SectionCharts
              chartSeksiStacked={charts.seksiStacked}
              seksiJenisMonthly={charts.seksiJenisMonthly}
              seksiJenisAll={charts.seksiJenisAll}
              availableMonths={charts.availableMonths}
              chartPelapor={charts.pelapor}
              selectedSeksi={filterSeksi}
              onSelectSeksi={(s) => setFilterSeksi(filterSeksi === s ? '' : s)}
            />
          </div>
          <div className="lg:col-span-5">
            <DaishaCharts
              chartUnitFreq={charts.unitFreq}
              chartSemuaDaisha={charts.semuaDaisha}
            />
          </div>
        </div>

        {/* Row 2: Throughput, Timeline & Lead Time */}
        <ThroughputCharts
          chartTrenHarian={charts.trenHarian}
          chartTrenBulanan={charts.trenBulanan}
          chartLeadTime={charts.leadTime}
          avgLeadTimeHours={kpi.avgLeadTimeHours}
          statusData={charts.statusData}
          chartSeksiStacked={charts.seksiStacked}
        />

        {/* Row 3: Analisis Komponen & Sparepart Demand */}
        <DamageCharts
          chartKategori={charts.kategori}
          chartDetailGejala={charts.detailGejala}
          tindakanStats={charts.tindakanStats}
          sparepartKebutuhan={charts.sparepartKebutuhan}
          sparepartKebutuhanSemua={charts.sparepartKebutuhanSemua}
        />
      </div>

      {/* 4. Panel Raw Data Table */}
      <TicketTable
        filteredData={filteredData}
        loading={loading}
        exportToExcel={exportToExcel}
      />
    </div>
  );
}
