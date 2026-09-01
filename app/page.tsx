'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, RawTicketData } from '@/types/ticket';
import { processRawTicketData } from '@/lib/ticketParser';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';

// Modular Dashboard Components
import KpiCards from '@/components/dashboard/KpiCards';
import VisualFilterTabs, { TabType } from '@/components/dashboard/VisualFilterTabs';
import FilterPanel from '@/components/dashboard/FilterPanel';
import DaishaCharts from '@/components/dashboard/DaishaCharts';
import DamageCharts from '@/components/dashboard/DamageCharts';
import ThroughputCharts from '@/components/dashboard/ThroughputCharts';
import SectionCharts from '@/components/dashboard/SectionCharts';
import TicketTable from '@/components/dashboard/TicketTable';

const API_URL = "/api/repair";

// Global cache in-memory untuk navigasi cepat antar halaman
let cachedTickets: Ticket[] | null = null;

export default function DashboardPage() {
  const [dataRaw, setDataRaw] = useState<Ticket[]>(() => cachedTickets || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedTickets);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Fetch data dari API internal
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error("Gagal mengambil data dari API");

      const jsonResult = await response.json();
      let arrayData: RawTicketData[] = [];

      if (Array.isArray(jsonResult)) {
        arrayData = jsonResult;
      } else if (jsonResult && typeof jsonResult === 'object') {
        const potentialKeys = ['data', 'value', 'd', 'items', 'records', 'result'];
        for (const key of potentialKeys) {
          if (Array.isArray(jsonResult[key])) {
            arrayData = jsonResult[key];
            break;
          }
        }
      }

      const hasilParsing = processRawTicketData(arrayData);
      cachedTickets = hasilParsing;
      setDataRaw(hasilParsing);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function initLoad() {
      try {
        const response = await fetch(API_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error("Gagal mengambil data");
        const jsonResult = await response.json();
        let arrayData: RawTicketData[] = [];

        if (Array.isArray(jsonResult)) {
          arrayData = jsonResult;
        } else if (jsonResult && typeof jsonResult === 'object') {
          const potentialKeys = ['data', 'value', 'd', 'items', 'records', 'result'];
          for (const key of potentialKeys) {
            if (Array.isArray(jsonResult[key])) {
              arrayData = jsonResult[key];
              break;
            }
          }
        }

        const hasilParsing = processRawTicketData(arrayData);
        cachedTickets = hasilParsing;
        if (!ignore) {
          setDataRaw(hasilParsing);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Init load error:", err);
          setLoading(false);
        }
      }
    }

    initLoad();

    const interval = setInterval(() => {
      fetchData(true);
    }, 45000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [fetchData]);

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

  // Ekspor Excel (.csv)
  const exportToExcel = () => {
    if (!filteredData.length) return;

    const headers = ["ID Tiket", "No Daisha", "Nama Daisha", "Seksi", "Komponen Kerusakan", "Detail Gejala", "Pelapor", "Tgl Masuk", "Tgl Keluar", "Status", "Catatan"];
    const rows = filteredData.map(d => [
      `"${d.idTiketAsli || d.id}"`,
      `"${d.noDaisha}"`,
      `"${d.namaDaisha}"`,
      `"${d.seksi}"`,
      `"${d.jenisKerusakan.replace(/"/g, '""')}"`,
      `"${d.detail.replace(/"/g, '""')}"`,
      `"${d.pelapor}"`,
      `"${d.tglMasuk}"`,
      `"${d.tglKeluar}"`,
      `"${d.status}"`,
      `"${(d.reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Perbaikan_Daisha_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
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
            onClick={() => fetchData(false)}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
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