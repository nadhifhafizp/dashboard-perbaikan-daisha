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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { DAFTAR_SEKSI } from '@/lib/masterData';
import FleetExplorer, { FleetUnit } from '@/components/maintenance/FleetExplorer';
import MaintenanceLogsTable, { MaintenanceLogRow } from '@/components/maintenance/MaintenanceLogsTable';
import MaintenanceInputModal from '@/components/maintenance/MaintenanceInputModal';
import UnitDetailModal from '@/components/maintenance/UnitDetailModal';
import SectionPmHandover, { PmStagingRecord } from '@/components/maintenance/SectionPmHandover';
import WorkshopStagingAlert from '@/components/maintenance/WorkshopStagingAlert';
import QuickStageModal from '@/components/maintenance/QuickStageModal';

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

interface BreakdownItem {
  total: number;
  maintained: number;
  unmaintained: number;
  percentage: number;
  dailyTarget: number;
  todayActual: number;
}

interface SeksiSummaryItem {
  seksi: string;
  total: number;
  maintained: number;
  unmaintained: number;
  percentage: number;
  targetHarian?: number;
  realisasiHariIni?: number;
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

  // Navigation Panel: STAGING vs FLEET vs LOGS (Pusat Operasional PM)
  const queryTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'STAGING' | 'FLEET' | 'LOGS'>('STAGING');

  useEffect(() => {
    if (queryTab) {
      const lower = queryTab.toLowerCase();
      if (lower === 'fleet' || lower === 'armada' || lower === 'katalog') {
        setActiveTab('FLEET');
      } else if (lower === 'logs' || lower === 'riwayat') {
        setActiveTab('LOGS');
      } else {
        setActiveTab('STAGING');
      }
    }
  }, [queryTab]);

  const handleTabChange = useCallback((newTab: 'STAGING' | 'FLEET' | 'LOGS') => {
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

  interface CachedMaintenanceData {
    summary: MaintenanceSummaryState;
    conditionStats?: ConditionStatsState;
    breakdown: Record<string, BreakdownItem>;
    dailyTrend: DailyTrendItem[];
    units: FleetUnit[];
    recentLogs?: MaintenanceLogRow[];
  }

  // Ref untuk membatalkan fetch sebelumnya jika terjadi race condition
  const abortControllerRef = useRef<AbortController | null>(null);
  // Client-Side Stale-While-Revalidate Cache: simpan data per seksi agar saat ganti filter grafik langsung update dalam 0ms
  const clientDataCacheRef = useRef<Map<string, CachedMaintenanceData>>(new Map());

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
          setJenisList(data.jenisList);
        }
        if (data.seksiList && data.seksiList.length > 0) {
          setSeksiList(data.seksiList);
        }
        if (data.seksiSummaries && data.seksiSummaries.length > 0) {
          setSeksiSummaries(data.seksiSummaries);
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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-200">
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
              {activeSeksi ? `PM Seksi ${activeSeksi}` : 'PM Daisha'}
            </span>
          </nav>

          <h1 className="t-title text-slate-900 tracking-tight">
            {activeSeksi ? `PM Seksi ${activeSeksi}` : 'PM Daisha'}
          </h1>
          <p className="t-caption text-slate-500">
            Pusat operasional penjemputan unit, armada PM, dan pencatatan pemeliharaan bengkel
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Dropdown Filter Seksi khusus Admin / Operator */}
          {!isSeksi && (
            <select
              value={selectedSeksiFilter}
              onChange={(e) => handleSeksiFilterChange(e.target.value)}
              aria-label="Filter armada berdasarkan Seksi Operasional"
              className="h-9 px-3 bg-white text-slate-800 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-red-600 cursor-pointer"
            >
              <option value="">Semua Seksi</option>
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
            className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 focus:outline-hidden"
            title="Muat Ulang Data"
            aria-label="Segarkan data pemeliharaan"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Segarkan</span>
          </button>

          {/* Tombol Aksi Sesuai Role */}
          {isSeksi ? (
            <Link
              href="/lapor-rusak"
              className="h-9 px-3.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer focus:outline-hidden"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              <span>Lapor Rusak</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenInput()}
              className="h-9 px-3.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-white" />
              <span>Catat PM</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Primary Module Panel Navigation (Segmented Switcher) */}
      <nav aria-label="Navigasi Panel Maintenance" className="flex items-center gap-2 border-b border-slate-200 pb-2.5 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => handleTabChange('STAGING')}
          className={`h-9 px-3.5 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'STAGING'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Truck className="w-4 h-4 text-emerald-500" />
          <span>{activeSeksi ? `Penjemputan Seksi ${activeSeksi}` : 'Penjemputan PM'}</span>
          {waitingStagingCount > 0 ? (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
              activeTab === 'STAGING' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {waitingStagingCount}
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium tabular-nums ${
              activeTab === 'STAGING' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              0
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('FLEET')}
          className={`h-9 px-3.5 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'FLEET'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Grid className="w-4 h-4 text-sky-500" />
          <span>Armada PM ({units.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('LOGS')}
          className={`h-9 px-3.5 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'LOGS'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Riwayat PM ({recentLogs.length})</span>
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
          <p className="text-xs text-slate-500 font-medium">Memuat data operasional PM {activeSeksi ? `Seksi ${activeSeksi}` : ''}...</p>
        </div>
      ) : (
        <>
          {/* PANEL 1: PENSIAPAN & PENJEMPUTAN PM KE BENGKEL */}
          {activeTab === 'STAGING' && (
            <div className="space-y-6">
              {/* Jika Admin / Bengkel membuka seksi tertentu, tetap tampilkan antrean penjemputan unit seksi tersebut di atas form */}
              {!isSeksi && activeSeksi && (
                <WorkshopStagingAlert
                  onRefreshData={() => fetchData(true)}
                  units={units}
                  recentLogs={recentLogs}
                  seksiFilter={activeSeksi}
                  onInputPm={(unitNo, seksiName) => {
                    const found = units.find(
                      (u) =>
                        u.nomor_daisha.toLowerCase() === unitNo.toLowerCase() ||
                        u.nomor_daisha.replace(/\D/g, '') === unitNo.replace(/\D/g, '')
                    );
                    if (found) {
                      handleOpenInput(found);
                    } else {
                      const stubUnit: FleetUnit = {
                        id: `staged-${unitNo}`,
                        nomor_daisha: unitNo,
                        jenis: 'Daisha',
                        seksi: seksiName,
                        is_maintained: false,
                        last_maintenance_date: null,
                        days_since_last: null,
                      };
                      handleOpenInput(stubUnit);
                    }
                  }}
                />
              )}

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
                        <Truck className="w-4.5 h-4.5 text-red-600" />
                        <span>Antrean Penjemputan PM dari Seluruh Seksi Pabrik</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Daftar armada Daisha yang telah disiapkan seksi-seksi di titik kumpul produksi untuk ditarik ke workshop bengkel.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
                      <span className="p-1.5 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                        Total Permintaan: <strong className="text-slate-900">{stagingRecords.length}</strong>
                      </span>
                      {waitingStagingCount > 0 && (
                        <span className="p-1.5 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                          Menunggu Ditarik: <strong className="text-amber-900">{waitingStagingCount}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <WorkshopStagingAlert
                    onRefreshData={() => fetchData(true)}
                    units={units}
                    recentLogs={recentLogs}
                    onInputPm={(unitNo, seksiName) => {
                      const found = units.find(
                        (u) =>
                          u.nomor_daisha.toLowerCase() === unitNo.toLowerCase() ||
                          u.nomor_daisha.replace(/\D/g, '') === unitNo.replace(/\D/g, '')
                      );
                      if (found) {
                        handleOpenInput(found);
                      } else {
                        const stubUnit: FleetUnit = {
                          id: `staged-${unitNo}`,
                          nomor_daisha: unitNo,
                          jenis: 'Daisha',
                          seksi: seksiName,
                          is_maintained: false,
                          last_maintenance_date: null,
                          days_since_last: null,
                        };
                        handleOpenInput(stubUnit);
                      }
                    }}
                  />
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
