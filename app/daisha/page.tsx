'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/hooks/useTickets';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { exportTicketsToExcel } from '@/lib/excelExport';
import { ArrowLeft, RefreshCw, PlusCircle, ClipboardList, Settings } from 'lucide-react';

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

  // Hook Analitik Terpusat (Simulasi SQL Engine: WHERE, GROUP BY, COUNT, AVG)
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

  // Ekspor Excel (.xlsx) dengan pemecahan multi-kerusakan per baris
  const exportToExcel = () => {
    exportTicketsToExcel(filteredData, 'Dashboard_Rekap_Daisha');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 transition border border-slate-200 hover:border-red-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal Utama</span>
            </Link>
            <span className="text-slate-300 text-xs">/</span>
            <span className="text-xs font-extrabold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">
              Sistem Perbaikan Daisha
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <span>📊</span> Dashboard Analitik & Rekapitulasi Daisha
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitoring komprehensif seluruh data perbaikan, reliabilitas unit, analisis kerusakan komponen, dan lead time
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/input"
            className="px-3.5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input Daisha</span>
          </Link>
          <Link
            href="/riwayat"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Status Antrean</span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Buka Panel Tindakan Admin & Manajemen Status Tiket"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Panel Tindakan</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>


      {/* 3. Panel Filter & Pencarian Lengkap */}
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
      <div className="space-y-6">
          {/* Baris Tengah: Sisi Kiri (Peta & Tabel Seksi) + Sisi Kanan (Top Unit Daisha Ranked Bar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
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

          {/* Baris Bawah: Tren Bulanan/Harian Dual-Axis + Timeline Servis + Lead Time Bar */}
          <ThroughputCharts
            chartTrenHarian={charts.trenHarian}
            chartTrenBulanan={charts.trenBulanan}
            chartLeadTime={charts.leadTime}
            avgLeadTimeHours={kpi.avgLeadTimeHours}
            statusData={charts.statusData}
            chartSeksiStacked={charts.seksiStacked}
          />

          {/* Analisis Komponen & Sparepart Demand */}
          <DamageCharts
            chartKategori={charts.kategori}
            chartDetailGejala={charts.detailGejala}
            tindakanStats={charts.tindakanStats}
            sparepartKebutuhan={charts.sparepartKebutuhan}
            sparepartKebutuhanSemua={charts.sparepartKebutuhanSemua}
          />
        </div>

      {/* Panel Raw Data */}
      <TicketTable
        filteredData={filteredData}
        loading={loading}
        exportToExcel={exportToExcel}
      />
    </div>
  );
}
