'use client';

import React from 'react';
import {
  Calendar,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { FleetUnit } from '@/components/maintenance/FleetExplorer';
import { exportFleetToExcel } from '@/lib/excelExport';

export type ChartViewType = 'ALL' | 'JENIS' | 'TREND' | 'DONUT';

interface PmMeetingHeaderProps {
  currentYear: number;
  onYearChange?: (year: number) => void;
  units: FleetUnit[];
  totalPopulasi: number;
  okUnitsCount: number;
  rusakUnitsCount: number;
  totalMaintained: number;
  remainingWorkDays: number;
  repairTicketsCount: number;
  jenisCount: number;
  chartView: ChartViewType;
  setChartView: (view: ChartViewType) => void;
  onExportRepair?: () => void;
}

export default function PmMeetingHeader({
  currentYear,
  onYearChange,
  units,
  totalPopulasi,
  okUnitsCount,
  rusakUnitsCount,
  totalMaintained,
  remainingWorkDays,
  repairTicketsCount,
  jenisCount,
  chartView,
  setChartView,
  onExportRepair,
}: PmMeetingHeaderProps) {
  const percentOk = totalPopulasi > 0 ? ((okUnitsCount / totalPopulasi) * 100).toFixed(1) : '100';
  const percentPm = totalPopulasi > 0 ? Math.round((totalMaintained / totalPopulasi) * 100) : 0;
  const unmaintainedCount = Math.max(0, totalPopulasi - totalMaintained);

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {/* 1. Header Toolbar */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              KPI & Evaluasi PM Daisha
            </h2>
            {onYearChange && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-md px-2 py-0.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium text-slate-600">Tahun:</span>
                <select
                  value={currentYear}
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  className="bg-transparent font-bold text-slate-800 cursor-pointer focus:outline-hidden"
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
          <p className="text-xs text-slate-500">
            Monitoring kepatuhan tahunan, kesiapan fisik unit armada, dan backlog pemeliharaan rutin.
          </p>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented Chart View Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => setChartView('ALL')}
              className={`h-8 px-2.5 rounded-md transition cursor-pointer font-medium ${
                chartView === 'ALL'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Grafik
            </button>
            <button
              type="button"
              onClick={() => setChartView('JENIS')}
              className={`h-8 px-2.5 rounded-md transition cursor-pointer font-medium ${
                chartView === 'JENIS'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Jenis
            </button>
            <button
              type="button"
              onClick={() => setChartView('TREND')}
              className={`h-8 px-2.5 rounded-md transition cursor-pointer font-medium ${
                chartView === 'TREND'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tren 14 Hari
            </button>
            <button
              type="button"
              onClick={() => setChartView('DONUT')}
              className={`h-8 px-2.5 rounded-md transition cursor-pointer font-medium ${
                chartView === 'DONUT'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Proporsi
            </button>
          </div>

          {/* Export Actions */}
          {onExportRepair && (
            <button
              type="button"
              onClick={onExportRepair}
              className="h-8 px-3 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition inline-flex items-center gap-1.5 cursor-pointer"
              title="Unduh file Excel riwayat servis dan perbaikan"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Repair</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => exportFleetToExcel(units, currentYear)}
            className="h-8 px-3 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition inline-flex items-center gap-1.5 cursor-pointer"
            title="Unduh master katalog armada dan status PM"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Master</span>
          </button>
        </div>
      </div>

      {/* 2. Precision Executive Metric Row (KPIs as Type, Not Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-4 sm:p-5">
        {/* Metric 1: Total Populasi */}
        <div className="px-2 sm:px-4 py-2 sm:py-0 first:pl-0">
          <span className="text-xs text-slate-500 font-medium block">
            Populasi Wajib PM
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {totalPopulasi.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-500 font-normal">unit</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Tersebar di {jenisCount} jenis armada
          </span>
        </div>

        {/* Metric 2: Kepatuhan PM Tahunan */}
        <div className="px-2 sm:px-4 py-2 sm:py-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium block">
              Realisasi PM {currentYear}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {percentPm}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {totalMaintained.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-500 font-normal">/ {totalPopulasi} unit</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Sisa {unmaintainedCount.toLocaleString('id-ID')} unit ({remainingWorkDays} hari kerja)
          </span>
        </div>

        {/* Metric 3: Kondisi Fisik Armada */}
        <div className="px-2 sm:px-4 py-2 sm:py-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium block">
              Armada Siap Pakai
            </span>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
              {percentOk}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {okUnitsCount.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-500 font-normal">unit OK</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {rusakUnitsCount > 0 ? `${rusakUnitsCount} unit kondisi rusak` : 'Semua unit sehat'}
          </span>
        </div>

        {/* Metric 4: Antrean Servis & Repair */}
        <div className="px-2 sm:px-4 py-2 sm:py-0 last:pr-0">
          <span className="text-xs text-slate-500 font-medium block">
            Tiket Repair Aktif
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-bold tracking-tight tabular-nums ${
              repairTicketsCount > 0 ? 'text-amber-700' : 'text-slate-900'
            }`}>
              {repairTicketsCount}
            </span>
            <span className="text-xs text-slate-500 font-normal">tiket servis</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {rusakUnitsCount} unit butuh perbaikan
          </span>
        </div>
      </div>
    </div>
  );
}
