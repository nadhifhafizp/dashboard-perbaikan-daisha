'use client';

import React from 'react';

export interface MaintenanceSummary {
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

export interface BreakdownItem {
  total: number;
  maintained: number;
  unmaintained: number;
  percentage: number;
  dailyTarget: number;
  todayActual: number;
}

export interface ConditionStats {
  okCount: number;
  rusakCount: number;
  totalCondition: number;
  okPercentage: number;
  rusakPercentage: number;
}

interface MaintenanceKPICardsProps {
  summary: MaintenanceSummary;
  breakdown?: Record<string, BreakdownItem>;
  conditionStats?: ConditionStats;
  currentYear: number;
  isSeksiUser?: boolean;
  seksi?: string;
  onOpenInputModal?: () => void;
}

export default function MaintenanceKPICards({
  summary,
  conditionStats,
  currentYear,
}: MaintenanceKPICardsProps) {
  const isTargetAchieved = summary.todayActual >= summary.dailyTarget && summary.dailyTarget > 0;
  const remainingToday = Math.max(0, summary.dailyTarget - summary.todayActual);
  const okPercent = conditionStats?.okPercentage ?? 100;
  const rusakCount = conditionStats?.rusakCount ?? 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-4 sm:p-5">
        {/* KPI 1: Target Harian */}
        <div className="px-2 sm:px-4 py-2 sm:py-0 first:pl-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Target Harian PM
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                isTargetAchieved
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isTargetAchieved ? 'Tercapai' : `${remainingToday} tersisa`}
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {summary.todayActual}
            </span>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              / {summary.dailyTarget} unit
            </span>
          </div>

          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isTargetAchieved ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
              style={{
                width: `${
                  summary.dailyTarget > 0
                    ? Math.min(100, Math.round((summary.todayActual / summary.dailyTarget) * 100))
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Hari ini:</span>
            <span className="tabular-nums font-medium text-slate-800">
              {summary.todayRutin} Rutin · {summary.todayRepair} Repair
            </span>
          </div>
        </div>

        {/* KPI 2: Kepatuhan Tahunan */}
        <div className="px-2 sm:px-4 py-2 sm:py-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Kepatuhan Tahun {currentYear}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Target 100%
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {summary.percentage}%
            </span>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              ({summary.maintainedUnits.toLocaleString('id-ID')} unit)
            </span>
          </div>

          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary.percentage)}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Total armada:</span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {summary.totalUnits.toLocaleString('id-ID')} unit
            </span>
          </div>
        </div>

        {/* KPI 3: Sisa Belum PM */}
        <div className="px-2 sm:px-4 py-2 sm:py-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Sisa Backlog Belum PM
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {summary.totalUnits > 0 ? Math.round((summary.unmaintainedUnits / summary.totalUnits) * 100) : 0}% sisa
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {summary.unmaintainedUnits.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              unit
            </span>
          </div>

          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${
                  summary.totalUnits > 0
                    ? Math.round((summary.unmaintainedUnits / summary.totalUnits) * 100)
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Kondisi armada:</span>
            <span className="font-medium text-slate-700 tabular-nums">
              {okPercent}% OK {rusakCount > 0 ? `· ${rusakCount} Rusak` : ''}
            </span>
          </div>
        </div>

        {/* KPI 4: Sisa Hari Kerja */}
        <div className="px-2 sm:px-4 py-2 sm:py-0 last:pr-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Sisa Hari Kerja Pabrik
            </span>
            <span className="text-xs font-medium text-slate-500">
              Tahun {currentYear}
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {summary.remainingWorkDays}
            </span>
            <span className="text-xs font-medium text-slate-500">
              hari
            </span>
          </div>

          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-slate-300 h-1.5 rounded-full"
              style={{
                width: `${Math.min(100, Math.round((summary.remainingWorkDays / 260) * 100))}%`,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata beban:</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              {summary.dailyTarget} unit/hari
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
