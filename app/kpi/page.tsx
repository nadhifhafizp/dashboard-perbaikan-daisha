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

export type KpiTab =
  | 'jumlah_daisha'
  | 'perbaikan_daisha'
  | 'pm_daisha'
  | 'data_mentah'
  | 'request'
  | 'spareparts';

function KpiDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, isSeksi, isOperator, currentUser } = useAuth();

  const querySeksi = searchParams.get('seksi');
  const userSeksi = isSeksi && currentUser?.seksi ? currentUser.seksi : (querySeksi || '');

  // Tab State: flat single-tier navigation across KPI tabs (User Seksi: strictly 4 tabs)
  const tabParam = searchParams.get('tab') as string | null;
  const subtabParam = searchParams.get('subtab') as string | null;

  const [activeTab, setActiveTab] = useState<KpiTab>(() => {
    if (tabParam === 'pm' || subtabParam === 'pm_daisha') return 'pm_daisha';
    if (subtabParam === 'jumlah_daisha') return 'jumlah_daisha';
    if (tabParam === 'daisha' || subtabParam === 'perbaikan_daisha') return 'perbaikan_daisha';
    if (!isSeksi && subtabParam === 'data_mentah') return 'data_mentah';
    if (tabParam === 'request') return 'request';
    if (!isSeksi && tabParam === 'spareparts') return 'spareparts';
    if (
      tabParam &&
      ['jumlah_daisha', 'perbaikan_daisha', 'pm_daisha', 'data_mentah', 'request', 'spareparts'].includes(tabParam)
    ) {
      if (isSeksi && (tabParam === 'data_mentah' || tabParam === 'spareparts')) {
        return 'jumlah_daisha';
      }
      return tabParam as KpiTab;
    }
    return 'jumlah_daisha';
  });

  useEffect(() => {
    if (isSeksi && (activeTab === 'data_mentah' || activeTab === 'spareparts')) {
      setActiveTab('jumlah_daisha');
      return;
    }

    if (tabParam === 'pm' || subtabParam === 'pm_daisha') {
      setActiveTab('pm_daisha');
    } else if (subtabParam === 'jumlah_daisha') {
      setActiveTab('jumlah_daisha');
    } else if (subtabParam === 'perbaikan_daisha') {
      setActiveTab('perbaikan_daisha');
    } else if (!isSeksi && subtabParam === 'data_mentah') {
      setActiveTab('data_mentah');
    } else if (
      tabParam &&
      ['jumlah_daisha', 'perbaikan_daisha', 'pm_daisha', 'data_mentah', 'request', 'spareparts'].includes(tabParam)
    ) {
      if (isSeksi && (tabParam === 'data_mentah' || tabParam === 'spareparts')) {
        setActiveTab('jumlah_daisha');
      } else {
        setActiveTab(tabParam as KpiTab);
      }
    }
  }, [tabParam, subtabParam, isSeksi, activeTab]);

  const handleTabChange = (newTab: KpiTab) => {
    let targetTab = newTab;
    if (isSeksi && (targetTab === 'data_mentah' || targetTab === 'spareparts')) {
      targetTab = 'jumlah_daisha';
    }
    setActiveTab(targetTab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', targetTab);
    url.searchParams.delete('subtab');
    window.history.replaceState(null, '', url.pathname + url.search);
  };

  // Data perbaikan daisha
  const {
    tickets: dataRaw,
    loading: loadingTickets,
    isRefreshing: isRefreshingTickets,
    refresh: refreshTickets,
  } = useTickets({ autoRefreshIntervalMs: 60000 });

  const [search, setSearch] = useState('');
  const [filterSeksi, setFilterSeksi] = useState<string>(() => userSeksi || '');
  const [filterDaisha, setFilterDaisha] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHanyaBerulang, setFilterHanyaBerulang] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Lock filter seksi saat user login sebagai USER_SEKSI
  useEffect(() => {
    if (userSeksi) {
      setFilterSeksi(userSeksi);
    }
  }, [userSeksi]);

  // Tiket yang relevan untuk seksi aktif (untuk penentuan count total)
  const visibleTickets = useMemo(() => {
    if (userSeksi) {
      return dataRaw.filter((t) => (t.seksi || '').toLowerCase() === userSeksi.toLowerCase());
    }
    return dataRaw;
  }, [dataRaw, userSeksi]);

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
    setFilterSeksi(userSeksi || '');
    setFilterDaisha('');
    setFilterStatus('');
    setFilterHanyaBerulang(false);
    setStartDate('');
    setEndDate('');
  };

  const exportToExcel = () => {
    exportTicketsToExcel(filteredData, 'KPI_Perbaikan_Daisha');
  };

  // Data preventive maintenance (PM)
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
      const seksiParam = userSeksi ? `&seksi=${encodeURIComponent(userSeksi)}` : '&seksi=all';
      const res = await fetch(`/api/maintenance?year=${pmYear}${seksiParam}`);
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
  }, [pmYear, userSeksi]);

  // Data request seksi
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

  // Request seksi terfilter untuk user role seksi
  const visibleRequests = useMemo(() => {
    if (userSeksi) {
      return requests.filter((r) => (r.seksiPemohon || '').toLowerCase() === userSeksi.toLowerCase());
    }
    return requests;
  }, [requests, userSeksi]);

  // Data stok sparepart
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
    if (activeTab === 'jumlah_daisha' || activeTab === 'pm_daisha') {
      void fetchPmData();
    } else if (activeTab === 'request') {
      void fetchRequests();
    } else if (!isSeksi && activeTab === 'spareparts') {
      void fetchSpareparts();
    }
  }, [activeTab, fetchPmData, fetchRequests, fetchSpareparts, isSeksi]);

  const handleGlobalRefresh = () => {
    if (
      activeTab === 'jumlah_daisha' ||
      activeTab === 'perbaikan_daisha' ||
      activeTab === 'pm_daisha' ||
      (!isSeksi && activeTab === 'data_mentah')
    ) {
      refreshTickets();
      void fetchPmData();
    }
    if (activeTab === 'request') void fetchRequests();
    if (!isSeksi && activeTab === 'spareparts') void fetchSpareparts();
  };

  const isCurrentTabLoading =
    ((activeTab === 'jumlah_daisha' ||
      activeTab === 'perbaikan_daisha' ||
      activeTab === 'pm_daisha' ||
      (!isSeksi && activeTab === 'data_mentah')) &&
      (loadingTickets || isRefreshingTickets || loadingPm)) ||
    (activeTab === 'request' && loadingRequests) ||
    (!isSeksi && activeTab === 'spareparts' && loadingSpareparts);

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
                {userSeksi ? `KPI Daisha - Seksi ${userSeksi}` : 'KPI Daisha'}
              </h1>
              <p className="t-caption text-slate-500">
                {userSeksi
                  ? `Performa armada, pemeliharaan (PM), dan request Seksi ${userSeksi}`
                  : 'Performa armada, PM, dan perbaikan bengkel'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
          {isSeksi ? (
            <Link
              href="/lapor-rusak"
              className="h-10 min-h-[40px] px-3.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition"
            >
              <span>Lapor Rusak</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          ) : (
            <Link
              href="/input"
              className="h-10 min-h-[40px] px-3.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition"
            >
              <span>Input Kerusakan</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}
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
              <span>{isOperator ? 'Tindakan Bengkel' : 'Antrean Unit'}</span>
            </Link>
          )}
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

      {/* 2. Primary Tab Navigation (Flat Single-Tier: Terpadu) */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* 1. Jumlah Seluruh Daisha */}
          <button
            type="button"
            onClick={() => handleTabChange('jumlah_daisha')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'jumlah_daisha'
                ? 'border-red-600 text-red-600 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Jumlah Seluruh Daisha</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
              {pmSummary.totalUnits > 0
                ? `${pmSummary.totalUnits.toLocaleString('id-ID')} Unit`
                : userSeksi
                ? 'Memuat...'
                : '8.773 Unit'}
            </span>
          </button>

          {/* 2. Perbaikan Daisha */}
          <button
            type="button"
            onClick={() => handleTabChange('perbaikan_daisha')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'perbaikan_daisha'
                ? 'border-red-600 text-red-600 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>2. Perbaikan Daisha</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
              {filteredData.length} Tiket
            </span>
          </button>

          {/* 3. PM Daisha */}
          <button
            type="button"
            onClick={() => handleTabChange('pm_daisha')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pm_daisha'
                ? 'border-red-600 text-red-600 bg-red-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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

          {/* 4. Request Seksi (Khusus USER_SEKSI menjadi pilar ke-4, tab lainnya dihapus) */}
          {isSeksi ? (
            <button
              type="button"
              onClick={() => handleTabChange('request')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'request'
                  ? 'border-red-600 text-red-600 bg-red-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <SendHorizonal className="w-4 h-4" />
              <span>4. Request Seksi</span>
              {visibleRequests.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-mono">
                  {visibleRequests.length}
                </span>
              )}
            </button>
          ) : (
            <>
              {/* Non-Seksi: Data Tiket */}
              <button
                type="button"
                onClick={() => handleTabChange('data_mentah')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'data_mentah'
                    ? 'border-red-600 text-red-600 bg-red-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Data Tiket</span>
              </button>

              {/* Non-Seksi: Request Seksi */}
              <button
                type="button"
                onClick={() => handleTabChange('request')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
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

              {/* Non-Seksi: Stok Sparepart */}
              <button
                type="button"
                onClick={() => handleTabChange('spareparts')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
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
            </>
          )}
        </div>

        {/* Toolbar Kanan: Ekspor Excel jika di perbaikan / data tiket, atau Tahun PM jika di PM */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 pb-1">
          {activeTab === 'pm_daisha' && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
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

          {(!isSeksi && activeTab === 'data_mentah') || activeTab === 'perbaikan_daisha' ? (
            <button
              type="button"
              onClick={exportToExcel}
              className="inline-flex items-center gap-1.5 h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
              title="Unduh seluruh data tiket ke file Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* 3. Tab Body Container */}
      <div>
        {/* 1. KPI JUMLAH SELURUH DAISHA */}
        {activeTab === 'jumlah_daisha' && (
          <div className="space-y-6">
            <FleetHealthCharts
              units={pmUnits}
              tickets={visibleTickets}
              selectedSeksi={userSeksi || filterSeksi}
              onSelectSeksi={isSeksi ? undefined : (s) => setFilterSeksi(s)}
              isSeksiLocked={isSeksi}
            />
          </div>
        )}

        {/* 2. KPI PERBAIKAN DAISHA */}
        {activeTab === 'perbaikan_daisha' && (
          <div className="space-y-6">
            {/* Filter Detail Riwayat Perbaikan */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div>
                <h3 className="t-section text-slate-900 tracking-tight">
                  {userSeksi ? `Diagnostik Kerusakan & Servis Seksi ${userSeksi}` : 'Diagnostik Kerusakan, Throughput Bengkel & Sparepart'}
                </h3>
                <p className="t-caption text-slate-500">
                  {userSeksi
                    ? `Analitik riwayat perbaikan armada dan tren penanganan kerusakan khusus Seksi ${userSeksi}`
                    : 'Filter detail riwayat perbaikan untuk melihat tren lead time, komponen kritis, dan frekuensi servis seksi'}
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
                totalCount={visibleTickets.length}
                isSeksiLocked={isSeksi}
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
                    selectedSeksi={userSeksi || filterSeksi}
                    onSelectSeksi={isSeksi ? () => {} : (s) => setFilterSeksi(filterSeksi === s ? '' : s)}
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

        {/* 3. KPI PM DAISHA */}
        {activeTab === 'pm_daisha' && (
          <div className="space-y-6">
            {loadingPm ? (
              <div className="flex items-center justify-center min-h-[250px] bg-white rounded-xl border border-slate-200">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                  <p className="text-xs text-slate-500">
                    {userSeksi ? `Memuat visual analitik PM Seksi ${userSeksi}...` : 'Memuat visual analitik Manajemen Daisha & PM...'}
                  </p>
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
                repairTicketsCount={visibleTickets.filter((t) => t.status === 'Open' || t.status === 'Progress').length}
              />
            )}
          </div>
        )}

        {/* 4. DATA MENTAH TIKET (Hanya untuk Non-Seksi) */}
        {!isSeksi && activeTab === 'data_mentah' && (
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

        {/* TAB 4: KPI REQUEST SEKSI */}
        {activeTab === 'request' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600">
                {userSeksi
                  ? `Analitik progres permohonan modifikasi & troli baru khusus Seksi ${userSeksi}.`
                  : 'Analitik progress permohonan troli baru & modifikasi seksi. Untuk persetujuan dan tracking, buka antrean request.'}
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
                requests={visibleRequests}
                onFilterByStatus={(statusKey) => {
                  router.push(`/request/tracking?status=${encodeURIComponent(statusKey)}`);
                }}
              />
            )}
          </div>
        )}

        {/* TAB 5: KPI STOK SPAREPART (Hanya untuk Non-Seksi) */}
        {!isSeksi && activeTab === 'spareparts' && (
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
