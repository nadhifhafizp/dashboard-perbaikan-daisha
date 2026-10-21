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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* KPI 1: Target Harian Teknisi */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Target Harian Teknisi
          </span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isTargetAchieved
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
              {summary.todayActual}
            </span>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              / {summary.dailyTarget} Unit Hari Ini
            </span>
          </div>

          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isTargetAchieved ? 'bg-emerald-500' : 'bg-amber-500'
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

          <div className="mt-2.5 flex items-center justify-between text-xs">
            {isTargetAchieved ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Target Tercapai
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                <Clock className="w-3 h-3 text-amber-600" />
                Sisa {remainingToday} unit
              </span>
            )}
            <span className="text-slate-500 tabular-nums text-xs font-medium">
              {summary.todayRutin} Rutin • {summary.todayRepair} Repair
            </span>
          </div>
        </div>
      </div>

      {/* KPI 2: Capaian PM Tahunan */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Progres Armada {currentYear}
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
              {summary.percentage}%
            </span>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              ({summary.maintainedUnits.toLocaleString('id-ID')} Unit)
            </span>
          </div>

          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary.percentage)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600">
            <span>Dari total armada:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {summary.totalUnits.toLocaleString('id-ID')} Unit
            </span>
          </div>
        </div>
      </div>

      {/* KPI 3: Estimasi Waktu Pabrik */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sisa Hari Kerja Pabrik
          </span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <CalendarDays className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
              {summary.remainingWorkDays}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Hari Kerja
            </span>
          </div>

          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-slate-400 h-1.5 rounded-full"
              style={{
                width: `${Math.min(100, Math.round((summary.remainingWorkDays / 260) * 100))}%`,
              }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600">
            <span>Sisa belum PM:</span>
            <span className="font-bold text-red-600 tabular-nums">
              {summary.unmaintainedUnits.toLocaleString('id-ID')} Unit
            </span>
          </div>
        </div>
      </div>

      {/* KPI 4: Kelayakan Fisik Armada */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Kelayakan Fisik Armada
          </span>
          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
              {okPercent}%
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              Kondisi Normal
            </span>
          </div>

          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-1.5 transition-all duration-500"
              style={{ width: `${okPercent}%` }}
            />
            {rusakCount > 0 && (
              <div
                className="bg-red-500 h-1.5"
                style={{ width: `${100 - okPercent}%` }}
              />
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            {rusakCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                {rusakCount} Unit Rusak
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Semua Unit Normal
              </span>
            )}
            <span className="text-slate-500 tabular-nums">
              Inspeksi {currentYear}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
