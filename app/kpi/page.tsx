'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/hooks/useTickets';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { exportTicketsToExcel } from '@/lib/excelExport';

// Chart & Dashboard Components
import FilterPanel from '@/components/dashboard/FilterPanel';
import DaishaCharts from '@/components/dashboard/DaishaCharts';
import DamageCharts from '@/components/dashboard/DamageCharts';
import ThroughputCharts from '@/components/dashboard/ThroughputCharts';
import SectionCharts from '@/components/dashboard/SectionCharts';
import TicketTable from '@/components/dashboard/TicketTable';
import FleetHealthCharts from '@/components/dashboard/FleetHealthCharts';

import { BreakdownItem } from '@/components/maintenance/MaintenanceKPICards';
import PmMeetingDashboard from '@/components/maintenance/PmMeetingDashboard';
import { DailyTrendItem } from '@/components/maintenance/TargetVsActualChart';
import { FleetUnit } from '@/components/maintenance/FleetExplorer';

import RequestAnalyticsDashboard from '@/components/request/RequestAnalyticsDashboard';
import { SectionRequestFull } from '@/components/request/BridgestoneRequestPrintModal';

import SparepartsAnalyticsDashboard, { SparepartItem } from '@/components/spareparts/SparepartsAnalyticsDashboard';

import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Wrench,
  Layers,
  SendHorizonal,
  Package,
  BarChart3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  PieChart,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';

export type KpiTab = 'daisha' | 'request' | 'spareparts';
export type DaishaSubTab = 'jumlah_daisha' | 'perbaikan_daisha' | 'pm_daisha' | 'data_mentah';

function KpiDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, currentUser } = useAuth();

  // Tab State: default 'daisha' (KPI Manajemen Daisha) or read from query param
  const tabParam = searchParams.get('tab') as string | null;
  const subtabParam = searchParams.get('subtab') as string | null;

  const [activeTab, setActiveTab] = useState<KpiTab>(() => {
    if (tabParam === 'pm' || tabParam === 'daisha') {
      return 'daisha';
    }
    if (tabParam && ['request', 'spareparts'].includes(tabParam)) {
      return tabParam as KpiTab;
    }
    return 'daisha';
  });

  // Sub-tab di dalam KPI Daisha:
  // 1. 'jumlah_daisha' (KPI Jumlah Seluruh Daisha: OKE vs NG & per Seksi)
  // 2. 'perbaikan_daisha' (KPI Perbaikan Daisha: Diagnostik, Throughput, Sparepart, Filter detail)
  // 3. 'pm_daisha' (KPI PM Daisha: Filter tahun, populasi, kesehatan, kepatuhan, mapping)
  // 4. 'data_mentah' (Data Tiket Raw)
  const [daishaSubTab, setDaishaSubTab] = useState<DaishaSubTab>(() => {
    if (tabParam === 'pm') return 'pm_daisha';
    if (subtabParam && ['jumlah_daisha', 'perbaikan_daisha', 'pm_daisha', 'data_mentah'].includes(subtabParam)) {
      return subtabParam as DaishaSubTab;
    }
    return 'jumlah_daisha';
  });

  useEffect(() => {
    if (tabParam === 'pm') {
      setActiveTab('daisha');
      setDaishaSubTab('pm_daisha');
    } else if (tabParam === 'daisha') {
      setActiveTab('daisha');
    } else if (tabParam && ['request', 'spareparts'].includes(tabParam)) {
      setActiveTab(tabParam as KpiTab);
    }
    if (subtabParam && ['jumlah_daisha', 'perbaikan_daisha', 'pm_daisha', 'data_mentah'].includes(subtabParam)) {
      setDaishaSubTab(subtabParam as DaishaSubTab);
    }
  }, [tabParam, subtabParam]);

  const handleTabChange = (newTab: KpiTab) => {
    setActiveTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    window.history.replaceState(null, '', url.pathname + url.search);
  };

  // --------------------------------------------------------------------------
  // 1. DATA: PERBAIKAN DAISHA
  // --------------------------------------------------------------------------
  const {
    tickets: dataRaw,
    loading: loadingTickets,
    isRefreshing: isRefreshingTickets,
    refresh: refreshTickets,
  } = useTickets({ autoRefreshIntervalMs: 60000 });

  const [search, setSearch] = useState('');
  const [filterSeksi, setFilterSeksi] = useState('');
  const [filterDaisha, setFilterDaisha] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHanyaBerulang, setFilterHanyaBerulang] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const exportToExcel = () => {
    exportTicketsToExcel(filteredData, 'KPI_Perbaikan_Daisha');
  };

  // --------------------------------------------------------------------------
  // 2. DATA: PREVENTIVE MAINTENANCE (PM)
  // --------------------------------------------------------------------------
  const [pmYear, setPmYear] = useState<number>(new Date().getFullYear());
  const [loadingPm, setLoadingPm] = useState(false);
  const [pmSummary, setPmSummary] = useState({
    totalUnits: 0,
    maintainedUnits: 0,
    unmaintainedUnits: 0,
    percentage: 0,
    remainingWorkDays: 0,
    dailyTarget: 0,
    todayActual: 0,
    todayRutin: 0,
    todayRepair: 0,
  });
  const [pmCondition, setPmCondition] = useState({
    okCount: 0,
    rusakCount: 0,
    totalCondition: 0,
    okPercentage: 0,
    rusakPercentage: 0,
  });
  const [pmBreakdown, setPmBreakdown] = useState<Record<string, BreakdownItem>>({});
  const [pmDailyTrend, setPmDailyTrend] = useState<DailyTrendItem[]>([]);
  const [pmUnits, setPmUnits] = useState<FleetUnit[]>([]);

  const fetchPmData = useCallback(async () => {
    try {
      setLoadingPm(true);
      const res = await fetch(`/api/maintenance?seksi=all&year=${pmYear}`);
      const json = await res.json();
      if (json.success) {
        setPmSummary(json.summary || pmSummary);
        setPmCondition(json.conditionStats || pmCondition);
        setPmBreakdown(json.breakdown || {});
        setPmDailyTrend(json.dailyTrend || []);
        setPmUnits(json.units || []);
      }
    } catch (err) {
      console.error('Fetch PM KPI error:', err);
    } finally {
      setLoadingPm(false);
    }
  }, [pmYear]);

  // --------------------------------------------------------------------------
  // 3. DATA: REQUEST SEKSI
  // --------------------------------------------------------------------------
  const [requests, setRequests] = useState<SectionRequestFull[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch('/api/section-requests');
      const json = await res.json();
      if (json.success) {
        setRequests(json.requests || []);
      }
    } catch (err) {
      console.error('Fetch Requests KPI error:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // 4. DATA: STOK SPAREPART
  // --------------------------------------------------------------------------
  const [spareparts, setSpareparts] = useState<SparepartItem[]>([]);
  const [loadingSpareparts, setLoadingSpareparts] = useState(false);

  const fetchSpareparts = useCallback(async () => {
    try {
      setLoadingSpareparts(true);
      const res = await fetch('/api/spareparts');
      const json = await res.json();
      if (json.success) {
        setSpareparts(json.spareparts || []);
      }
    } catch (err) {
      console.error('Fetch Spareparts KPI error:', err);
    } finally {
      setLoadingSpareparts(false);
    }
  }, []);

  // Fetch data on active tab selection
  useEffect(() => {
    if (activeTab === 'daisha') {
      void fetchPmData();
    } else if (activeTab === 'request') {
      void fetchRequests();
    } else if (activeTab === 'spareparts') {
      void fetchSpareparts();
    }
  }, [activeTab, fetchPmData, fetchRequests, fetchSpareparts]);

  const handleGlobalRefresh = () => {
    if (activeTab === 'daisha') {
      refreshTickets();
      void fetchPmData();
    }
    if (activeTab === 'request') void fetchRequests();
    if (activeTab === 'spareparts') void fetchSpareparts();
  };

  const isCurrentTabLoading =
    (activeTab === 'daisha' && (loadingTickets || isRefreshingTickets || loadingPm)) ||
    (activeTab === 'request' && loadingRequests) ||
    (activeTab === 'spareparts' && loadingSpareparts);

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Pusat Dashboard */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-medium hover:text-slate-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">KPI Daisha</span>
          </nav>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="t-title text-slate-900 tracking-tight">
                KPI Daisha
              </h1>
              <p className="t-caption text-slate-500">
                Performa armada, PM, dan perbaikan bengkel
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
          <button
            type="button"
            onClick={handleGlobalRefresh}
            disabled={isCurrentTabLoading}
            className="h-10 min-h-[40px] px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isCurrentTabLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <RefreshCw className="w-4 h-4 text-slate-500" />
            )}
            <span>{isCurrentTabLoading ? 'Memperbarui' : 'Segarkan'}</span>
          </button>
        </div>
      </header>

      {/* 2. Tab Navigation Switcher (3 Pilar KPI Terpadu) */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => handleTabChange('daisha')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'daisha'
              ? 'border-red-600 text-red-600 bg-red-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Armada & PM</span>
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
            {pmSummary.totalUnits > 0 ? `${pmSummary.totalUnits.toLocaleString('id-ID')} Unit` : '8.773 Unit'}
          </span>
          {pmSummary.percentage > 0 && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold">
              PM {pmSummary.percentage.toFixed(0)}%
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('request')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'request'
              ? 'border-red-600 text-red-600 bg-red-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <SendHorizonal className="w-4 h-4" />
          <span>Request Seksi</span>
          {requests.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-mono">
              {requests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('spareparts')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'spareparts'
              ? 'border-red-600 text-red-600 bg-red-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stok Sparepart</span>
          {spareparts.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-mono">
              {spareparts.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. Tab Body Container */}
      <div>
        {/* TAB 1: ARMADA & PM (GABUNGAN POPULASI, PM, DAN REPAIR) */}
        {activeTab === 'daisha' && (
          <div className="space-y-6">
            {/* Quick Action & Context Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-xs text-slate-600">
                  {daishaSubTab === 'jumlah_daisha' && 'Monitoring populasi seluruh armada daisha Bridgestone dan status kesiapan 2 poin (OKE vs NG) antar seksi.'}
                  {daishaSubTab === 'perbaikan_daisha' && 'Diagnostik kerusakan, throughput pengerjaan bengkel, komponen kritis, dan frekuensi servis seksi.'}
                  {daishaSubTab === 'pm_daisha' && 'Monitoring populasi armada, kesehatan unit, kepatuhan PM tahunan, serta mapping per jenis/ukuran/seksi.'}
                  {daishaSubTab === 'data_mentah' && 'Database seluruh riwayat tiket perbaikan daisha bengkel dengan filter komprehensif dan ekspor Excel.'}
                </p>
                {daishaSubTab === 'pm_daisha' && (
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300">
                    <span className="text-xs font-semibold text-slate-600">Tahun PM:</span>
                    <select
                      value={pmYear}
                      onChange={(e) => setPmYear(Number(e.target.value))}
                      className="text-xs font-bold bg-transparent text-slate-800 cursor-pointer focus:outline-none"
                    >
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/input"
                  className="h-10 min-h-[40px] px-3.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition"
                >
                  <span>Input Kerusakan</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/maintenance?tab=staging"
                  className="h-10 min-h-[40px] px-3.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition"
                >
                  <span>Penjemputan PM</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="h-10 min-h-[40px] px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition"
                  >
                    <span>Panel Tindakan</span>
                  </Link>
                ) : (
                  <Link
                    href="/riwayat"
                    className="h-10 min-h-[40px] px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition"
                  >
                    <span>Antrean Unit</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Sub-Tab Switcher: 3 Pilar KPI Utama Sesuai Spesifikasi */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-0 gap-2 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setDaishaSubTab('jumlah_daisha')}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    daishaSubTab === 'jumlah_daisha'
                      ? 'border-red-600 text-red-600 bg-red-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>1. Jumlah Seluruh Daisha</span>
                  <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                    {pmSummary.totalUnits > 0 ? `${pmSummary.totalUnits.toLocaleString('id-ID')} Unit` : '8.773 Unit'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDaishaSubTab('perbaikan_daisha')}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    daishaSubTab === 'perbaikan_daisha'
                      ? 'border-red-600 text-red-600 bg-red-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>2. Perbaikan Daisha</span>
                  <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                    {filteredData.length} Tiket
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDaishaSubTab('pm_daisha')}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    daishaSubTab === 'pm_daisha'
                      ? 'border-red-600 text-red-600 bg-red-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>3. PM Daisha</span>
                  {pmSummary.percentage > 0 && (
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      PM {pmSummary.percentage.toFixed(0)}%
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDaishaSubTab('data_mentah')}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    daishaSubTab === 'data_mentah'
                      ? 'border-red-600 text-red-600 bg-red-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Data Tiket</span>
                </button>
              </div>

              {(daishaSubTab === 'data_mentah' || daishaSubTab === 'perbaikan_daisha') && (
                <button
                  type="button"
                  onClick={exportToExcel}
                  className="hidden sm:inline-flex items-center gap-1.5 h-10 min-h-[40px] px-3.5 mb-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0"
                  title="Unduh seluruh data tiket ke file Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor Excel</span>
                </button>
              )}
            </div>

            {/* 1. KONTEN SUB-TAB: KPI JUMLAH SELURUH DAISHA (OKE VS NG, MASTER DONAT, & BREAKDOWN SETIAP SEKSI) */}
            {daishaSubTab === 'jumlah_daisha' && (
              <div>
                <FleetHealthCharts
                  units={pmUnits}
                  tickets={dataRaw}
                  selectedSeksi={filterSeksi}
                  onSelectSeksi={(s) => setFilterSeksi(s)}
                />
              </div>
            )}

            {/* 2. KONTEN SUB-TAB: KPI PERBAIKAN DAISHA (DIAGNOSTIK, THROUGHPUT, SPARTPART, FILTER DETAIL) */}
            {daishaSubTab === 'perbaikan_daisha' && (
              <div className="space-y-6">
                {/* Filter Detail Riwayat Perbaikan */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                  <div>
                    <h3 className="t-section text-slate-900 tracking-tight">
                      Diagnostik Kerusakan, Throughput Bengkel & Sparepart
                    </h3>
                    <p className="t-caption text-slate-500">
                      Filter detail riwayat perbaikan untuk melihat tren lead time, komponen kritis, dan frekuensi servis seksi
                    </p>
                  </div>

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
                </div>

                {/* Grafik Diagnostik Kerusakan & Servis */}
                <div className="space-y-5">
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

                  <ThroughputCharts
                    chartTrenHarian={charts.trenHarian}
                    chartTrenBulanan={charts.trenBulanan}
                    chartLeadTime={charts.leadTime}
                    avgLeadTimeHours={kpi.avgLeadTimeHours}
                    statusData={charts.statusData}
                    chartSeksiStacked={charts.seksiStacked}
                  />

                  <DamageCharts
                    chartKategori={charts.kategori}
                    chartDetailGejala={charts.detailGejala}
                    tindakanStats={charts.tindakanStats}
                    sparepartKebutuhan={charts.sparepartKebutuhan}
                    sparepartKebutuhanSemua={charts.sparepartKebutuhanSemua}
                  />
                </div>
              </div>
            )}

            {/* 3. KONTEN SUB-TAB: KPI PM DAISHA (FILTER PER TAHUN, POPULASI, KESEHATAN, KEPATUHAN, MAPPING) */}
            {daishaSubTab === 'pm_daisha' && (
              <div>
                {loadingPm ? (
                  <div className="flex items-center justify-center min-h-[250px] bg-white rounded-xl border border-slate-200">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                      <p className="text-xs text-slate-500">Memuat visual analitik Manajemen Daisha & PM...</p>
                    </div>
                  </div>
                ) : (
                  <PmMeetingDashboard
                    breakdown={pmBreakdown}
                    dailyTrend={pmDailyTrend}
                    units={pmUnits}
                    remainingWorkDays={pmSummary.remainingWorkDays}
                    dailyTarget={pmSummary.dailyTarget}
                    todayActual={pmSummary.todayActual}
                    currentYear={pmYear}
                    onYearChange={(y) => setPmYear(y)}
                    conditionStats={pmCondition}
                    onExportRepair={exportToExcel}
                    repairTicketsCount={dataRaw.filter((t) => t.status === 'Open' || t.status === 'Progress').length}
                  />
                )}
              </div>
            )}

            {/* 4. KONTEN SUB-TAB: DATA MENTAH TIKET (TABEL DATABASE RAW & EKSPOR EXCEL) */}
            {daishaSubTab === 'data_mentah' && (
              <div className="space-y-6">
                {/* Filter Panel Data Mentah */}
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

                {/* Tabel Raw Data Tiket Tanpa Grafik */}
                <TicketTable
                  filteredData={filteredData}
                  loading={loadingTickets}
                  exportToExcel={exportToExcel}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: KPI REQUEST SEKSI */}
        {activeTab === 'request' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600">
                Analitik progress permohonan troli baru & modifikasi seksi. Untuk persetujuan dan tracking, buka antrean request.
              </p>
              <Link
                href="/request/tracking"
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md inline-flex items-center gap-1 transition"
              >
                <span>Antrean & Pelacakan Request</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {loadingRequests ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                  <p className="text-xs text-slate-500">Memuat metrik KPI Request Seksi...</p>
                </div>
              </div>
            ) : (
              <RequestAnalyticsDashboard
                requests={requests}
                onFilterByStatus={(statusKey) => {
                  router.push(`/request/tracking?status=${encodeURIComponent(statusKey)}`);
                }}
              />
            )}
          </div>
        )}

        {/* TAB 4: KPI STOK SPAREPART */}
        {activeTab === 'spareparts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600">
                Analitik perputaran stok, restock alert, dan kebutuhan suku cadang. Untuk kelola mutasi fisik, buka inventaris.
              </p>
              <Link
                href="/spareparts"
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md inline-flex items-center gap-1 transition"
              >
                <span>Kelola Inventaris & Mutasi</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {loadingSpareparts ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                  <p className="text-xs text-slate-500">Memuat metrik KPI Stok Sparepart...</p>
                </div>
              </div>
            ) : (
              <SparepartsAnalyticsDashboard
                spareparts={spareparts}
                onOpenRestock={() => {
                  router.push('/spareparts');
                }}
                onFilterByCategory={() => {
                  router.push('/spareparts');
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KpiDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-slate-500">Memuat Pusat Dashboard KPI...</p>
          </div>
        </div>
      }
    >
      <KpiDashboardContent />
    </Suspense>
  );
}
