'use client';

import React from 'react';
import {
  Target,
  TrendingUp,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

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
  isSeksiUser,
  seksi,
}: MaintenanceKPICardsProps) {
  const isTargetAchieved = summary.todayActual >= summary.dailyTarget && summary.dailyTarget > 0;
  const remainingToday = Math.max(0, summary.dailyTarget - summary.todayActual);
  const okPercent = conditionStats?.okPercentage ?? 100;
  const rusakCount = conditionStats?.rusakCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Target Harian */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Target harian
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isTargetAchieved
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {isTargetAchieved ? 'Tercapai' : `${remainingToday} tersisa`}
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {summary.todayActual}
            </span>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              / {summary.dailyTarget} unit
            </span>
          </div>

          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-[width] duration-500 ${
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

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>Hari ini:</span>
            <span className="tabular-nums font-semibold text-slate-800">
              {summary.todayRutin} Rutin · {summary.todayRepair} Repair
            </span>
          </div>
        </div>
      </div>

      {/* KPI 2: Target 1 Tahun 1x PM (Tahunan) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Kepatuhan tahun {currentYear} (Target 100%)
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {summary.percentage}%
            </span>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              ({summary.maintainedUnits.toLocaleString('id-ID')} unit)
            </span>
          </div>

          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-[width] duration-500"
              style={{ width: `${Math.min(100, summary.percentage)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>Total armada:</span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {summary.totalUnits.toLocaleString('id-ID')} unit
            </span>
          </div>
        </div>
      </div>

      {/* KPI 3: Sisa Armada Belum PM */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Belum PM
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {summary.totalUnits > 0 ? Math.round((summary.unmaintainedUnits / summary.totalUnits) * 100) : 0}% sisa
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {summary.unmaintainedUnits.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              unit
            </span>
          </div>

          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-[width] duration-500"
              style={{
                width: `${
                  summary.totalUnits > 0
                    ? Math.round((summary.unmaintainedUnits / summary.totalUnits) * 100)
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>Kondisi armada:</span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {okPercent}% OK · {rusakCount} Rusak
            </span>
          </div>
        </div>
      </div>

      {/* KPI 4: Sisa Hari Kerja Pabrik */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Sisa hari kerja
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Kalender kerja
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {summary.remainingWorkDays}
            </span>
            <span className="text-xs font-medium text-slate-500">
              hari
            </span>
          </div>

          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-slate-400 h-1.5 rounded-full"
              style={{
                width: `${Math.min(100, Math.round((summary.remainingWorkDays / 260) * 100))}%`,
              }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>Target:</span>
            <span className="font-semibold text-emerald-700 tabular-nums">
              {summary.dailyTarget} Unit/Hari
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
