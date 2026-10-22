'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CalendarClock,
  PlusCircle,
  RefreshCw,
  Grid,
  FileText,
  CalendarDays,
  Target,
  Wrench,
  ArrowLeft,
  ArrowRight,
  X,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Truck,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { DAFTAR_SEKSI } from '@/lib/masterData';
import MaintenanceKPICards, { BreakdownItem } from '@/components/maintenance/MaintenanceKPICards';
import TargetVsActualChart from '@/components/maintenance/TargetVsActualChart';
import SectionPopulationChart, { SeksiSummaryItem } from '@/components/maintenance/SectionPopulationChart';
import AdminSectionDonutGrid from '@/components/maintenance/AdminSectionDonutGrid';
import SectionComplianceTable from '@/components/maintenance/SectionComplianceTable';
import FleetExplorer, { FleetUnit } from '@/components/maintenance/FleetExplorer';
import MaintenanceLogsTable, { MaintenanceLogRow } from '@/components/maintenance/MaintenanceLogsTable';
import MaintenanceInputModal from '@/components/maintenance/MaintenanceInputModal';
import UnitDetailModal from '@/components/maintenance/UnitDetailModal';
import SectionPmHandover, { PmStagingRecord } from '@/components/maintenance/SectionPmHandover';
import WorkshopStagingAlert from '@/components/maintenance/WorkshopStagingAlert';
import QuickStageModal from '@/components/maintenance/QuickStageModal';
import SectionVariantChart from '@/components/maintenance/SectionVariantChart';
import { getSectionDaishaList } from '@/lib/masterData';

interface MaintenanceSummaryState {
  totalUnits: number;
  maintainedUnits: number;
  unmaintainedUnits: number;
  percentage: number;
  remainingWorkDays: number;
  dailyTarget: number;
  todayActual: number;
  todayRutin: number;
  todayRepair: number;
}

interface ConditionStatsState {
  okCount: number;
  rusakCount: number;
  totalCondition: number;
  okPercentage: number;
  rusakPercentage: number;
}

interface DailyTrendItem {
  date: string;
  dateLabel: string;
  isWeekend: boolean;
  target: number;
  actual: number;
  rutin: number;
  repair: number;
}

function MaintenanceModuleContent() {
  const searchParams = useSearchParams();
  const { currentUser, isSeksi, isAdmin, isOperator, isLoading: isAuthLoading } = useAuth();

  const querySeksi = searchParams.get('seksi');
  const [selectedSeksiFilter, setSelectedSeksiFilter] = useState<string>(querySeksi || '');

  useEffect(() => {
    if (querySeksi !== null) {
      setSelectedSeksiFilter(querySeksi);
    }
  }, [querySeksi]);

  const activeSeksi = (isSeksi && currentUser?.seksi) ? currentUser.seksi : selectedSeksiFilter;

  // State Data
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentYear] = useState<number>(new Date().getFullYear());
  const [summary, setSummary] = useState<MaintenanceSummaryState>({
    totalUnits: 0,
    maintainedUnits: 0,
    unmaintainedUnits: 0,
    percentage: 0,
    remainingWorkDays: 1,
    dailyTarget: 0,
    todayActual: 0,
    todayRutin: 0,
    todayRepair: 0,
  });
  const [conditionStats, setConditionStats] = useState<ConditionStatsState>({
    okCount: 0,
    rusakCount: 0,
    totalCondition: 0,
    okPercentage: 100,
    rusakPercentage: 0,
  });
  const [breakdown, setBreakdown] = useState<Record<string, BreakdownItem>>({});
  const [dailyTrend, setDailyTrend] = useState<DailyTrendItem[]>([]);
  const [jenisList, setJenisList] = useState<string[]>([]);
  const [seksiList, setSeksiList] = useState<string[]>(() => DAFTAR_SEKSI.filter(s => s.toLowerCase() !== 'all seksi'));
  const [seksiSummaries, setSeksiSummaries] = useState<SeksiSummaryItem[]>([]);
  const [units, setUnits] = useState<FleetUnit[]>([]);
  const [recentLogs, setRecentLogs] = useState<MaintenanceLogRow[]>([]);
  const [stagingRecords, setStagingRecords] = useState<PmStagingRecord[]>([]);

  // Navigation Panel: DASHBOARD vs STAGING vs FLEET vs LOGS
  const queryTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'STAGING' | 'FLEET' | 'LOGS'>('DASHBOARD');

  useEffect(() => {
    if (queryTab) {
      const lower = queryTab.toLowerCase();
      if (lower === 'staging' || lower === 'handover' || lower === 'penyiapan') {
        setActiveTab('STAGING');
      } else if (lower === 'fleet' || lower === 'armada' || lower === 'katalog') {
        setActiveTab('FLEET');
      } else if (lower === 'logs' || lower === 'riwayat') {
        setActiveTab('LOGS');
      } else if (lower === 'dashboard' || lower === 'analitik') {
        setActiveTab('DASHBOARD');
      }
    }
  }, [queryTab]);

  const handleTabChange = useCallback((newTab: 'DASHBOARD' | 'STAGING' | 'FLEET' | 'LOGS') => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab.toLowerCase());
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  }, []);

  // Modals
  const [isInputModalOpen, setIsInputModalOpen] = useState<boolean>(false);
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<FleetUnit | null>(null);
  // State Drilldown Seksi Langsung di Bawah Tabel (untuk Admin tanpa pindah halaman)
  const [selectedDrilldownSeksi, setSelectedDrilldownSeksi] = useState<string>('');

  const handleSelectDrilldownSeksi = useCallback((seksi: string) => {
    setSelectedDrilldownSeksi((prev) => {
      const next = prev === seksi ? '' : seksi;
      if (next && typeof window !== 'undefined') {
        setTimeout(() => {
          const el = document.getElementById('section-drilldown-panel');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
      return next;
    });
  }, []);

  const [unitForQuickInput, setUnitForQuickInput] = useState<FleetUnit | null>(null);
  const [queuedUnitForStaging, setQueuedUnitForStaging] = useState<string | null>(null);
  const [unitForQuickStage, setUnitForQuickStage] = useState<FleetUnit | null>(null);

  const handleStageUnit = useCallback((unit: FleetUnit) => {
    setUnitForQuickStage(unit);
  }, []);

  // Map dari nomor daisha ke informasi staging (lokasi & status)
  const stagedUnitMap = useMemo(() => {
    const map = new Map<string, { lokasi: string; status: string; waktu?: string }>();
    stagingRecords
      .filter((r) => r.status === 'WAITING_PICKUP' || r.status === 'PICKED_UP')
      .forEach((r) => {
        r.units.forEach((u) => {
          map.set(u.toUpperCase(), {
            lokasi: r.lokasi,
            status: r.status,
            waktu: r.createdAt,
          });
        });
      });
    return map;
  }, [stagingRecords]);

  // Total antrean penjemputan aktif
  const waitingStagingCount = useMemo(() => {
    return stagingRecords.filter((r) => r.status === 'WAITING_PICKUP').length;
  }, [stagingRecords]);

  // Seksi sasaran inspeksi: prioritas activeSeksi (jika role seksi) atau selectedDrilldownSeksi (jika admin klik rincian)
  const targetInspectSeksi = activeSeksi || selectedDrilldownSeksi;

  // Unit yang strictly milik Seksi Sasaran
  const targetUnits = useMemo(() => {
    if (!targetInspectSeksi) return units;
    return units.filter((u) => (u.seksi || '').toLowerCase() === targetInspectSeksi.toLowerCase());
  }, [units, targetInspectSeksi]);

  // Seksi units untuk kompatibilitas
  const seksiUnits = targetUnits;

  // Data Varian untuk Chart Donut (terpisah per jenis & ukuran: S, M, L)
  const variantChartData = useMemo(() => {
    if (!targetInspectSeksi) return [];
    const map = new Map<string, {
      key: string;
      name: string;
      ukuran?: string;
      displayName: string;
      total: number;
      maintained: number;
      unmaintained: number;
      dailyTarget: number;
    }>();

    targetUnits.forEach((u) => {
      const unitName = (u.nama_daisha || u.jenis || 'Daisha').trim();
      const rawUkuran = (u.ukuran || '').toUpperCase();
      const hasSize = rawUkuran && rawUkuran !== 'NONE';
      const sizeLabel = hasSize
        ? rawUkuran === 'SMALL' || rawUkuran === 'S' ? 'Small'
        : rawUkuran === 'MEDIUM' || rawUkuran === 'M' ? 'Medium'
        : rawUkuran === 'LARGE' || rawUkuran === 'L' ? 'Large'
        : rawUkuran
        : '';

      const key = hasSize ? `${unitName.toLowerCase()}_${rawUkuran.toLowerCase()}` : unitName.toLowerCase();
      const displayName = hasSize ? `${unitName} (${sizeLabel})` : unitName;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: unitName,
          ukuran: hasSize ? sizeLabel : undefined,
          displayName,
          total: 0,
          maintained: 0,
          unmaintained: 0,
          dailyTarget: 0,
        });
      }

      const entry = map.get(key)!;
      entry.total++;
      if (u.is_maintained) entry.maintained++;
      else entry.unmaintained++;
    });

    const workDays = summary.remainingWorkDays > 0 ? summary.remainingWorkDays : 50;
    const sizeOrder: Record<string, number> = { 'Small': 1, 'Medium': 2, 'Large': 3 };

    return Array.from(map.values())
      .map((v) => ({
        ...v,
        dailyTarget: v.unmaintained > 0 ? Math.max(1, Math.ceil(v.unmaintained / workDays)) : 0,
      }))
      .sort((a, b) => {
        if (a.name.toLowerCase() !== b.name.toLowerCase()) {
          return b.total - a.total;
        }
        const orderA = a.ukuran ? (sizeOrder[a.ukuran] || 4) : 0;
        const orderB = b.ukuran ? (sizeOrder[b.ukuran] || 4) : 0;
        return orderA - orderB;
      });
  }, [targetInspectSeksi, targetUnits, summary.remainingWorkDays]);

  const variantChartTotalTarget = useMemo(() => {
    return variantChartData.reduce((acc, v) => acc + v.dailyTarget, 0);
  }, [variantChartData]);

  // Ref untuk membatalkan fetch sebelumnya jika terjadi race condition
  const abortControllerRef = useRef<AbortController | null>(null);
  // Client-Side Stale-While-Revalidate Cache: simpan data per seksi agar saat ganti filter grafik langsung update dalam 0ms
  const clientDataCacheRef = useRef<Map<string, any>>(new Map());

  // Fetch Data Function
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);

    // Batalkan network call sebelumnya yang masih tertunda
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const seksiParam = activeSeksi ? `&seksi=${encodeURIComponent(activeSeksi)}` : '';
      const [res, stagingRes] = await Promise.all([
        fetch(`/api/maintenance?year=${currentYear}${seksiParam}`, { signal: controller.signal }),
        fetch(`/api/maintenance/staging?seksi=${encodeURIComponent(activeSeksi || '')}`, { signal: controller.signal }),
      ]);

      if (!res.ok) {
        throw new Error('Gagal memuat data modul maintenance');
      }

      const data = await res.json();
      if (data.success) {
        clientDataCacheRef.current.set(activeSeksi || 'all', data);
        setSummary(data.summary);
        if (data.conditionStats) {
          setConditionStats(data.conditionStats);
        }
        setBreakdown(data.breakdown);
        setDailyTrend(data.dailyTrend);
        if (data.jenisList && data.jenisList.length > 0) {
          setJenisList((prev) => Array.from(new Set([...prev, ...data.jenisList])).sort((a, b) => a.localeCompare(b)));
        }
        if (data.seksiList && data.seksiList.length > 0) {
          setSeksiList((prev) => Array.from(new Set([...prev, ...data.seksiList])).sort((a, b) => a.localeCompare(b)));
        }
        if (data.seksiSummaries && data.seksiSummaries.length > 0) {
          setSeksiSummaries((prev) => {
            if (prev.length > data.seksiSummaries.length) {
              return prev;
            }
            return data.seksiSummaries;
          });
        }
        setUnits(data.units);
        setRecentLogs(data.recentLogs || []);
      }

      if (stagingRes.ok) {
        const stagingData = await stagingRes.json();
        if (stagingData.success) {
          setStagingRecords(stagingData.data || []);
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Abaikan pembatalan request secara normal
        return;
      }
      console.error('Fetch maintenance error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [currentYear, activeSeksi]);

  const handleSeksiFilterChange = useCallback((newSeksi: string) => {
    setSelectedSeksiFilter(newSeksi);
    // Instant Optimistic Update: jika data seksi ini sudah ada di cache browser, langsung tampilkan dalam 0ms tanpa menunggu network
    const cached = clientDataCacheRef.current.get(newSeksi || 'all');
    if (cached) {
      setSummary(cached.summary);
      if (cached.conditionStats) setConditionStats(cached.conditionStats);
      setBreakdown(cached.breakdown);
      setDailyTrend(cached.dailyTrend);
      setUnits(cached.units);
      setRecentLogs(cached.recentLogs || []);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchData();
    }
  }, [fetchData, isAuthLoading]);

  // Handler Buka Modal Input Maintenance
  const handleOpenInput = (targetUnit?: FleetUnit) => {
    if (targetUnit) {
      setUnitForQuickInput(targetUnit);
    } else {
      setUnitForQuickInput(null);
    }
    setIsInputModalOpen(true);
  };

  // Handler Sukses Submit
  const handleSuccessSubmit = () => {
    fetchData(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 font-sans">
      {/* 1. Page Header (Flat layout - no enclosing card) */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div className="space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-1 text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal {isSeksi ? `Seksi ${activeSeksi}` : 'Workshop'}</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">
              {activeSeksi ? `PM Seksi ${activeSeksi}` : 'Maintenance Daisha'}
            </span>
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight text-balance">
                  {activeSeksi
                    ? `Preventive Maintenance (PM) : Seksi ${activeSeksi}`
                    : 'Modul Maintenance & Kepatuhan Armada Daisha'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  <CalendarDays className="w-3 h-3" aria-hidden="true" />
                  Tahun {currentYear}
                </span>
                {activeSeksi && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Building2 className="w-3 h-3" aria-hidden="true" />
                    Seksi {activeSeksi}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {activeSeksi
                  ? `Pemantauan status kesehatan, kepatuhan PM berkala, dan analitik armada Daisha Seksi ${activeSeksi}`
                  : 'Dashboard operasional kepatuhan tahunan, target harian teknisi, antrean bengkel, dan pemantauan armada'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Dropdown Filter Seksi khusus Admin / Operator */}
          {!isSeksi && (
            <select
              value={selectedSeksiFilter}
              onChange={(e) => handleSeksiFilterChange(e.target.value)}
              aria-label="Filter armada berdasarkan Seksi Operasional"
              className="min-h-[44px] sm:min-h-0 sm:h-9 px-3 bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600/20 focus-visible:border-red-600 cursor-pointer"
            >
              <option value="">Semua Seksi (Pabrik)</option>
              {seksiList.map((s) => (
                <option key={s} value={s}>
                  Seksi {s}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={loading || refreshing}
            className="min-h-[44px] sm:min-h-0 sm:h-9 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            title="Muat Ulang Data"
            aria-label="Segarkan data pemeliharaan"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Segarkan</span>
          </button>

          {/* Tombol Aksi Sesuai Role */}
          {isSeksi ? (
            <Link
              href="/lapor-rusak"
              className="min-h-[44px] sm:min-h-0 sm:h-9 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1"
            >
              <AlertTriangle className="w-4 h-4 text-white" aria-hidden="true" />
              <span>Lapor Daisha Rusak</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenInput()}
              className="min-h-[44px] sm:min-h-0 sm:h-9 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Catat Maintenance / Repair</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Primary Module Panel Navigation (Segmented Switcher) */}
      <nav aria-label="Navigasi Panel Maintenance" className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('DASHBOARD')}
          className={`h-9 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeTab === 'DASHBOARD'
              ? 'bg-red-600 text-white border-red-600 shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard & Analitik PM</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('STAGING')}
          className={`h-9 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeTab === 'STAGING'
              ? 'bg-red-600 text-white border-red-600 shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>{activeSeksi ? 'Penyiapan & Penjemputan PM' : 'Antrean Penjemputan Bengkel'}</span>
          {waitingStagingCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
              activeTab === 'STAGING' ? 'bg-white text-red-700' : 'bg-amber-500 text-white'
            }`}>
              {waitingStagingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('FLEET')}
          className={`h-9 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeTab === 'FLEET'
              ? 'bg-red-600 text-white border-red-600 shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Katalog Armada {activeSeksi ? `Seksi ${activeSeksi}` : 'Pabrik'} ({units.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('LOGS')}
          className={`h-9 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeTab === 'LOGS'
              ? 'bg-red-600 text-white border-red-600 shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Riwayat Log PM & Repair ({recentLogs.length})</span>
        </button>
      </nav>

      {/* Error Alert */}
      {error && (
        <div role="alert" aria-live="assertive" className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchData(true)}
            className="font-bold underline cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600 rounded px-1"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Memuat data analitik PM {activeSeksi ? `Seksi ${activeSeksi}` : ''}…</p>
        </div>
      ) : (
        <>
          {/* PANEL 1: DASHBOARD & ANALITIK KEBIJAKAN PM */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              {/* Kebijakan Mutlak Target 1 Tahun 1x PM */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-2xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight text-balance">
                          Kebijakan Mutlak: 1 Tahun Wajib 1x PM untuk Seluruh Armada Daisha
                        </h2>
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                          Target 100% / Tahun
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                        Seluruh {summary.totalUnits.toLocaleString('id-ID')} unit armada Daisha {activeSeksi ? `Seksi ${activeSeksi}` : 'pabrik'} wajib menjalani Preventive Maintenance minimal 1 kali dalam 1 tahun berjalan ({currentYear}). Target harian diturunkan proporsional dari sisa armada belum PM ({summary.unmaintainedUnits.toLocaleString('id-ID')} unit) dibagi sisa {summary.remainingWorkDays} hari kerja.
                      </p>
                    </div>
                  </div>

                  {/* Quick Metrics Bar */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                    <div className="px-3 py-1 text-center">
                      <span className="text-[11px] font-normal text-slate-400 block">Target siklus</span>
                      <span className="text-xs sm:text-sm font-semibold text-amber-400">1 Thn 1x PM</span>
                    </div>
                    <div className="w-px h-6 bg-slate-800" />
                    <div className="px-3 py-1 text-center">
                      <span className="text-[11px] font-normal text-slate-400 block">Target harian</span>
                      <span className="text-xs sm:text-sm font-semibold text-emerald-400 font-mono tabular-nums">{summary.dailyTarget} Unit/Hari</span>
                    </div>
                    <div className="w-px h-6 bg-slate-800" />
                    <div className="px-3 py-1 text-center">
                      <span className="text-[11px] font-normal text-slate-400 block">Kepatuhan armada</span>
                      <span className="text-xs sm:text-sm font-semibold text-white font-mono tabular-nums">{summary.percentage}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top KPI Cards */}
              <MaintenanceKPICards
                summary={summary}
                breakdown={breakdown}
                conditionStats={conditionStats}
                currentYear={currentYear}
                isSeksiUser={isSeksi}
                seksi={activeSeksi}
                onOpenInputModal={() => handleOpenInput()}
              />

              {/* Visual Charts & Compliance Matrix */}
              {activeSeksi ? (
                <div className="space-y-4">
                  <TargetVsActualChart
                    data={dailyTrend}
                    dailyTarget={summary.dailyTarget}
                    breakdown={breakdown}
                    units={seksiUnits}
                    remainingWorkDays={summary.remainingWorkDays}
                    title={`Grafik Target vs Realisasi PM Seksi ${activeSeksi}`}
                    subtitle={`Monitoring target harian, real actual, dan sisa backlog armada Seksi ${activeSeksi}`}
                  />
                  <SectionVariantChart
                    seksi={activeSeksi}
                    data={variantChartData}
                    totalUnits={seksiUnits.length}
                    totalDailyTarget={variantChartTotalTarget}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Grafik Realisasi vs Target Harian PM Pabrik */}
                  <TargetVsActualChart
                    data={dailyTrend}
                    dailyTarget={summary.dailyTarget}
                    breakdown={breakdown}
                    units={units}
                    remainingWorkDays={summary.remainingWorkDays}
                    title="Grafik Target vs Realisasi PM & Backlog per Jenis Daisha"
                    subtitle="Komparasi visual target harian dan aktual pengerjaan terpisah per jenis daisha beserta sisa antrean backlog belum PM"
                  />

                  {/* Matriks Kepatuhan PM Lintas Seksi Pabrik (Table-first Operational View) */}
                  <SectionComplianceTable
                    seksiSummaries={seksiSummaries}
                    stagingRecords={stagingRecords}
                    remainingWorkDays={summary.remainingWorkDays}
                    selectedSeksi={selectedDrilldownSeksi}
                    onSelectSeksi={handleSelectDrilldownSeksi}
                  />

                  {/* Rincian Kepatuhan Varian per Seksi (Muncul Langsung di Bawah Tabel Tanpa Pindah Halaman) */}
                  {selectedDrilldownSeksi && (
                    <section
                      id="section-drilldown-panel"
                      aria-label={`Rincian Kepatuhan PM Seksi ${selectedDrilldownSeksi}`}
                      className="scroll-mt-6 rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 space-y-4 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                            {selectedDrilldownSeksi.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                                Rincian Kepatuhan PM Seksi {selectedDrilldownSeksi}
                              </h3>
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {targetUnits.length.toLocaleString('id-ID')} Unit
                              </span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Target {variantChartTotalTarget} Unit/Hari
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Distribusi armada per jenis & ukuran daisha beserta status kepatuhan PM tahun {currentYear}.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              handleSeksiFilterChange(selectedDrilldownSeksi);
                              handleTabChange('FLEET');
                            }}
                            className="h-8 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <span>Katalog Armada Seksi</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedDrilldownSeksi('')}
                            className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Tutup rincian seksi"
                          >
                            <X className="w-4 h-4 text-slate-500" />
                            <span>Tutup Rincian</span>
                          </button>
                        </div>
                      </div>

                      <SectionVariantChart
                        seksi={selectedDrilldownSeksi}
                        data={variantChartData}
                        totalUnits={targetUnits.length}
                        totalDailyTarget={variantChartTotalTarget}
                      />
                    </section>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PANEL 2: PENSIAPAN & PENJEMPUTAN PM KE BENGKEL */}
          {activeTab === 'STAGING' && (
            <div className="space-y-6">
              {activeSeksi ? (
                <SectionPmHandover
                  seksi={activeSeksi}
                  units={seksiUnits}
                  isSeksiUser={isSeksi}
                  remainingWorkDays={summary.remainingWorkDays}
                  queuedUnitNo={queuedUnitForStaging}
                  onClearQueuedUnit={() => setQueuedUnitForStaging(null)}
                  onRefreshData={() => fetchData(true)}
                />
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-red-600" />
                        <span>Antrean Penjemputan PM dari Seluruh Seksi Pabrik</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Daftar armada Daisha yang telah disiapkan seksi-seksi di titik kumpul produksi untuk ditarik ke workshop bengkel.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchData(true)}
                      disabled={loading || refreshing}
                      className="h-8 px-3 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-end sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                      <span>Segarkan Antrean</span>
                    </button>
                  </div>

                  <WorkshopStagingAlert onRefreshData={() => fetchData(true)} />
                </div>
              )}
            </div>
          )}

          {/* PANEL 3: KATALOG ARMADA DAISHA */}
          {activeTab === 'FLEET' && (
            <FleetExplorer
              units={units}
              jenisList={jenisList}
              seksiList={seksiList}
              currentYear={currentYear}
              isSeksiUser={isSeksi}
              seksi={activeSeksi}
              stagedUnitMap={stagedUnitMap}
              onSelectUnit={(unit: FleetUnit) => setSelectedUnitForDetail(unit)}
              onQuickInput={(unit: FleetUnit) => handleOpenInput(unit)}
              onStageUnit={handleStageUnit}
            />
          )}

          {/* PANEL 4: RIWAYAT LOG PM & REPAIR */}
          {activeTab === 'LOGS' && (
            <MaintenanceLogsTable logs={recentLogs} />
          )}
        </>
      )}

      {/* Modal Input Catatan Maintenance / Repair (Khusus Tim Bengkel) */}
      <MaintenanceInputModal
        isOpen={isInputModalOpen}
        onClose={() => {
          setIsInputModalOpen(false);
          setUnitForQuickInput(null);
        }}
        onSuccess={handleSuccessSubmit}
        preselectedUnit={unitForQuickInput}
        currentUser={currentUser}
        seksi={activeSeksi}
      />

      {/* Modal Detail & Histori Unit Daisha */}
      <UnitDetailModal
        unit={selectedUnitForDetail}
        currentYear={currentYear}
        isSeksiUser={isSeksi}
        onClose={() => setSelectedUnitForDetail(null)}
        onOpenMaintenanceModal={(unit: FleetUnit) => {
          setSelectedUnitForDetail(null);
          handleOpenInput(unit);
        }}
        onStageUnit={handleStageUnit}
      />

      {/* Modal Cepat Siapkan Unit PM (Khusus Seksi) */}
      <QuickStageModal
        isOpen={!!unitForQuickStage}
        unit={unitForQuickStage}
        seksi={activeSeksi || 'Plant'}
        onClose={() => setUnitForQuickStage(null)}
        onSuccess={() => {
          fetchData(true);
        }}
      />
    </div>
  );
}

export default function MaintenanceModulePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Memuat modul maintenance...</div>}>
      <MaintenanceModuleContent />
    </Suspense>
  );
}
