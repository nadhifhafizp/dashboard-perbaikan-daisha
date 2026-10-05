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
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import MaintenanceKPICards from '@/components/maintenance/MaintenanceKPICards';
import TargetVsActualChart from '@/components/maintenance/TargetVsActualChart';
import StatusDonutChart from '@/components/maintenance/StatusDonutChart';
import VerticalGridMapping, { GridDaishaUnit } from '@/components/maintenance/VerticalGridMapping';
import NagaraFilterList from '@/components/maintenance/NagaraFilterList';
import MaintenanceLogsTable, { MaintenanceLogRow } from '@/components/maintenance/MaintenanceLogsTable';
import MaintenanceInputModal from '@/components/maintenance/MaintenanceInputModal';
import UnitDetailModal from '@/components/maintenance/UnitDetailModal';

export default function MaintenanceModulePage() {
  const { currentUser } = useAuth();

  // State Data
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [summary, setSummary] = useState<any>({
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
  const [breakdown, setBreakdown] = useState<any>({});
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);
  const [units, setUnits] = useState<GridDaishaUnit[]>([]);
  const [recentLogs, setRecentLogs] = useState<MaintenanceLogRow[]>([]);

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<'VERTICAL_GRID' | 'NAGARA_FILTER' | 'LOGS'>('VERTICAL_GRID');

  // Modals
  const [isInputModalOpen, setIsInputModalOpen] = useState<boolean>(false);
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<GridDaishaUnit | null>(null);
  const [unitForQuickInput, setUnitForQuickInput] = useState<GridDaishaUnit | null>(null);

  // Fetch Data Function
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await fetch(`/api/maintenance?year=${currentYear}`);
      if (!res.ok) {
        throw new Error('Gagal memuat data modul maintenance');
      }

      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setBreakdown(data.breakdown);
        setDailyTrend(data.dailyTrend);
        setUnits(data.units);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (err: any) {
      console.error('Fetch maintenance error:', err);
      setError(err?.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenInput = (unit?: GridDaishaUnit) => {
    setUnitForQuickInput(unit || null);
    setIsInputModalOpen(true);
  };

  const handleSelectUnit = (unit: GridDaishaUnit) => {
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
              <p className="text-xs text-slate-500 font-medium">
                Digitalisasi pemeliharaan tahunan, estimasi target harian teknisi, dan pemantauan visual unit
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
            className="h-8.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenInput()}
            className="h-8.5 px-4 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>+ Catat Maintenance / Repair</span>
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
          {/* 2. Top KPI Cards & Target Formula */}
          <MaintenanceKPICards
            summary={summary}
            breakdown={breakdown}
            currentYear={currentYear}
            onOpenInputModal={() => handleOpenInput()}
          />

          {/* 3. Visual Charts (Target vs Actual Bar Chart + Annual Status Donut) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <TargetVsActualChart
                data={dailyTrend}
                dailyTarget={summary.dailyTarget}
              />
            </div>
            <div className="lg:col-span-5">
              <StatusDonutChart
                summary={summary}
                breakdown={breakdown}
                currentYear={currentYear}
              />
            </div>
          </div>

          {/* 4. Tab Navigation Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('VERTICAL_GRID')}
              className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'VERTICAL_GRID'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Mapping Grid Vertical (1 - 200)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('NAGARA_FILTER')}
              className={`pb-2.5 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'NAGARA_FILTER'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Daisha Nagara Filter ({breakdown['NAGARA_FILTER']?.total || 50})</span>
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
              <span>Riwayat Transaksi Pengerjaan ({recentLogs.length})</span>
            </button>
          </div>

          {/* 5. Main Content According to Active Tab */}
          {activeTab === 'VERTICAL_GRID' && (
            <VerticalGridMapping
              units={units}
              currentYear={currentYear}
              onSelectUnit={handleSelectUnit}
              onQuickMaintenance={handleOpenInput}
            />
          )}

          {activeTab === 'NAGARA_FILTER' && (
            <NagaraFilterList
              units={units}
              currentYear={currentYear}
              onSelectUnit={handleSelectUnit}
              onQuickMaintenance={handleOpenInput}
            />
          )}

          {activeTab === 'LOGS' && (
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
