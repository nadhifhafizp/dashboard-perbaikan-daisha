'use client';

import React from 'react';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  TrendingUp,
  Layers,
  Wrench,
  Clock,
} from 'lucide-react';

interface MaintenanceSummary {
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

interface BreakdownItem {
  total: number;
  maintained: number;
  unmaintained: number;
  percentage: number;
  dailyTarget: number;
  todayActual: number;
}

interface MaintenanceKPICardsProps {
  summary: MaintenanceSummary;
  breakdown: Record<string, BreakdownItem>;
  currentYear: number;
  onOpenInputModal: () => void;
}

export default function MaintenanceKPICards({
  summary,
  breakdown,
  currentYear,
  onOpenInputModal,
}: MaintenanceKPICardsProps) {
  const isTargetAchieved = summary.todayActual >= summary.dailyTarget;
  const remainingToday = Math.max(0, summary.dailyTarget - summary.todayActual);

  return (
    <div className="space-y-4">
      {/* Top 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Target Harian vs Aktual Hari Ini */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-2xs hover:shadow-xs transition relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Target Harian Hari Ini
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isTargetAchieved ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                {summary.todayActual}
              </span>
              <span className="text-sm font-semibold text-slate-400 font-mono">
                / {summary.dailyTarget} Unit
              </span>
            </div>

            <div className="mt-2.5">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isTargetAchieved ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${summary.dailyTarget > 0 ? Math.min(100, Math.round((summary.todayActual / summary.dailyTarget) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs">
              {isTargetAchieved ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Target Tercapai!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Kurang {remainingToday} unit lagi
                </span>
              )}
              <span className="text-slate-500 text-[11px]">
                {summary.todayRutin} Rutin | {summary.todayRepair} Repair
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Status Keseluruhan Tahun Berjalan */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-2xs hover:shadow-xs transition relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status Pemeliharaan {currentYear}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 tracking-tight font-mono">
                {summary.percentage}%
              </span>
              <span className="text-xs font-medium text-slate-500">
                ({summary.maintainedUnits} / {summary.totalUnits} Unit)
              </span>
            </div>

            <div className="mt-2.5">
              <div className="w-full bg-red-100 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-2 transition-all duration-500"
                  style={{ width: `${summary.percentage}%` }}
                />
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Sudah: {summary.maintainedUnits}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Belum: {summary.unmaintainedUnits}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Sisa Hari Kerja Dalam Setahun */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-2xs hover:shadow-xs transition relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sisa Hari Kerja {currentYear}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                {summary.remainingWorkDays}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                Hari Kerja
              </span>
            </div>

            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Mengecualikan Sabtu, Minggu, dan Libur Nasional.
            </p>

            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Rumus Target Harian:</span>
              <span className="font-mono font-bold text-slate-700">
                {summary.unmaintainedUnits} ÷ {summary.remainingWorkDays} = {summary.dailyTarget}/hari
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Aksi Cepat Teknisi & Admin */}
        <div className="bg-gradient-to-br from-[#4A0005] to-[#7A0008] text-white rounded-xl p-4.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-200 uppercase tracking-wider">
                Input Pengerjaan
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-white">
                Admin Panel
              </span>
            </div>
            <h3 className="mt-2 text-sm font-bold text-white">
              Catat Hasil Maintenance / Repair
            </h3>
            <p className="mt-1 text-xs text-red-100/80 leading-relaxed">
              Unit yang selesai perbaikan otomatis terhitung & terkonversi menjadi Sudah Maintenance.
            </p>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={onOpenInputModal}
              className="w-full h-8.5 px-3 bg-white hover:bg-red-50 text-[#7A0008] font-bold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>+ Catat Maintenance / Repair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target Harian Per Kategori Breakdown Cards */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Target Harian Per Jenis & Ukuran Daisha ({currentYear})
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Dihitung otomatis: Sisa Unit Belum Dimaintenance ÷ Sisa Hari Kerja
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Vertical Small */}
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                Vertical Small
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                Target: {breakdown['VERTICAL_SMALL']?.dailyTarget || 0}/hari
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg font-black text-slate-900 font-mono">
                {breakdown['VERTICAL_SMALL']?.maintained || 0} / {breakdown['VERTICAL_SMALL']?.total || 0}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {breakdown['VERTICAL_SMALL']?.percentage || 0}%
              </span>
            </div>
            <div className="mt-1.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${breakdown['VERTICAL_SMALL']?.percentage || 0}%` }}
              />
            </div>
            <div className="mt-1.5 text-[10px] text-slate-500 flex justify-between">
              <span>Belum: {breakdown['VERTICAL_SMALL']?.unmaintained || 0}</span>
              <span className="font-semibold text-slate-700">Hari ini: {breakdown['VERTICAL_SMALL']?.todayActual || 0} unit</span>
            </div>
          </div>

          {/* Vertical Medium */}
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                Vertical Medium
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                Target: {breakdown['VERTICAL_MEDIUM']?.dailyTarget || 0}/hari
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg font-black text-slate-900 font-mono">
                {breakdown['VERTICAL_MEDIUM']?.maintained || 0} / {breakdown['VERTICAL_MEDIUM']?.total || 0}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {breakdown['VERTICAL_MEDIUM']?.percentage || 0}%
              </span>
            </div>
            <div className="mt-1.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${breakdown['VERTICAL_MEDIUM']?.percentage || 0}%` }}
              />
            </div>
            <div className="mt-1.5 text-[10px] text-slate-500 flex justify-between">
              <span>Belum: {breakdown['VERTICAL_MEDIUM']?.unmaintained || 0}</span>
              <span className="font-semibold text-slate-700">Hari ini: {breakdown['VERTICAL_MEDIUM']?.todayActual || 0} unit</span>
            </div>
          </div>

          {/* Vertical Large */}
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
                Vertical Large
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                Target: {breakdown['VERTICAL_LARGE']?.dailyTarget || 0}/hari
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg font-black text-slate-900 font-mono">
                {breakdown['VERTICAL_LARGE']?.maintained || 0} / {breakdown['VERTICAL_LARGE']?.total || 0}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {breakdown['VERTICAL_LARGE']?.percentage || 0}%
              </span>
            </div>
            <div className="mt-1.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${breakdown['VERTICAL_LARGE']?.percentage || 0}%` }}
              />
            </div>
            <div className="mt-1.5 text-[10px] text-slate-500 flex justify-between">
              <span>Belum: {breakdown['VERTICAL_LARGE']?.unmaintained || 0}</span>
              <span className="font-semibold text-slate-700">Hari ini: {breakdown['VERTICAL_LARGE']?.todayActual || 0} unit</span>
            </div>
          </div>

          {/* Nagara Filter */}
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                Nagara Filter
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                Target: {breakdown['NAGARA_FILTER']?.dailyTarget || 0}/hari
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg font-black text-slate-900 font-mono">
                {breakdown['NAGARA_FILTER']?.maintained || 0} / {breakdown['NAGARA_FILTER']?.total || 0}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {breakdown['NAGARA_FILTER']?.percentage || 0}%
              </span>
            </div>
            <div className="mt-1.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${breakdown['NAGARA_FILTER']?.percentage || 0}%` }}
              />
            </div>
            <div className="mt-1.5 text-[10px] text-slate-500 flex justify-between">
              <span>Belum: {breakdown['NAGARA_FILTER']?.unmaintained || 0}</span>
              <span className="font-semibold text-slate-700">Hari ini: {breakdown['NAGARA_FILTER']?.todayActual || 0} unit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
