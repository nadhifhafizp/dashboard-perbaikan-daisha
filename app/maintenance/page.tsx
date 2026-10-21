'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarClock,
  PlusCircle,
  RefreshCw,
  Grid,
  Layers,
  FileText,
  Loader2,
  CalendarDays,
  Target,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import MaintenanceKPICards, { BreakdownItem } from '@/components/maintenance/MaintenanceKPICards';
import TargetVsActualChart from '@/components/maintenance/TargetVsActualChart';
import SectionPopulationChart, { SeksiSummaryItem } from '@/components/maintenance/SectionPopulationChart';
import FleetExplorer, { FleetUnit } from '@/components/maintenance/FleetExplorer';
import MaintenanceLogsTable, { MaintenanceLogRow } from '@/components/maintenance/MaintenanceLogsTable';
import MaintenanceInputModal from '@/components/maintenance/MaintenanceInputModal';
import UnitDetailModal from '@/components/maintenance/UnitDetailModal';

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

export default function MaintenanceModulePage() {
  const { currentUser } = useAuth();

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
  const [seksiList, setSeksiList] = useState<string[]>([]);
  const [seksiSummaries, setSeksiSummaries] = useState<SeksiSummaryItem[]>([]);
  const [units, setUnits] = useState<FleetUnit[]>([]);
  const [recentLogs, setRecentLogs] = useState<MaintenanceLogRow[]>([]);

  // Navigation Tab: FLEET (Pemantauan visual armada) vs LOGS (Riwayat pengerjaan)
  const [activeTab, setActiveTab] = useState<'FLEET' | 'LOGS'>('FLEET');

  // Modals
  const [isInputModalOpen, setIsInputModalOpen] = useState<boolean>(false);
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<FleetUnit | null>(null);
  const [unitForQuickInput, setUnitForQuickInput] = useState<FleetUnit | null>(null);

  // Fetch Data Function
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/maintenance?year=${currentYear}`);
      if (!res.ok) {
        throw new Error('Gagal memuat data modul maintenance');
      }

      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        if (data.conditionStats) {
          setConditionStats(data.conditionStats);
        }
        setBreakdown(data.breakdown);
        setDailyTrend(data.dailyTrend);
        if (data.jenisList) {
          setJenisList(data.jenisList);
        }
        if (data.seksiList) {
          setSeksiList(data.seksiList);
        }
        if (data.seksiSummaries) {
          setSeksiSummaries(data.seksiSummaries);
        }
        setUnits(data.units);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (err: unknown) {
      console.error('Fetch maintenance error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenInput = (unit?: FleetUnit) => {
    setUnitForQuickInput(unit || null);
    setIsInputModalOpen(true);
  };

  const handleSelectUnit = (unit: FleetUnit) => {
    setSelectedUnitForDetail(unit);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Modul Maintenance Daisha</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  Tahun {currentYear}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Monitoring pemeliharaan tahunan armada daisha dan target teknisi
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={loading || refreshing}
            className="min-h-[44px] sm:min-h-0 sm:h-9 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenInput()}
            className="min-h-[44px] sm:min-h-0 sm:h-9 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Catat Maintenance / Repair</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchData(true)}
            className="font-bold underline cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Memuat data dan menghitung estimasi target harian...</p>
        </div>
      ) : (
        <>
          {/* 2. Top KPI Cards & Real Operational Stats */}
          <MaintenanceKPICards
            summary={summary}
            breakdown={breakdown}
            conditionStats={conditionStats}
            currentYear={currentYear}
            onOpenInputModal={() => handleOpenInput()}
          />

          {/* 3. Visual Charts (Tren Realisasi vs Target Harian & Populasi Daisha per Seksi) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TargetVsActualChart
              data={dailyTrend}
              dailyTarget={summary.dailyTarget}
            />
            <SectionPopulationChart
              data={seksiSummaries}
              totalUnits={summary.totalUnits}
            />
          </div>

          {/* 4. Tab Navigation Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('FLEET')}
              className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'FLEET'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Visual Armada Seluruh Pabrik ({units.length} Unit)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('LOGS')}
              className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'LOGS'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Riwayat Log Pengerjaan ({recentLogs.length})</span>
            </button>
          </div>

          {/* 5. Main Content According to Active Tab */}
          {activeTab === 'FLEET' ? (
            <FleetExplorer
              units={units}
              jenisList={jenisList}
              seksiList={seksiList}
              currentYear={currentYear}
              onSelectUnit={handleSelectUnit}
              onQuickInput={handleOpenInput}
            />
          ) : (
            <MaintenanceLogsTable logs={recentLogs} />
          )}
        </>
      )}

      {/* 6. Modals */}
      <MaintenanceInputModal
        isOpen={isInputModalOpen}
        onClose={() => {
          setIsInputModalOpen(false);
          setUnitForQuickInput(null);
        }}
        preselectedUnit={unitForQuickInput}
        currentUser={currentUser}
        onSuccess={() => {
          fetchData(true);
        }}
      />

      <UnitDetailModal
        unit={selectedUnitForDetail}
        currentYear={currentYear}
        onClose={() => setSelectedUnitForDetail(null)}
        onOpenMaintenanceModal={(unit) => handleOpenInput(unit)}
      />
    </div>
  );
}
