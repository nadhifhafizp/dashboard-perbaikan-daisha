'use client';

import React from 'react';
import {
  ShieldCheck,
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
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="t-card text-slate-900 tracking-tight">
                  KPI PM Daisha Tahun {currentYear}
                </h2>
                {onYearChange && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-600">
                      Pilih Tahun:
                    </span>
                    <select
                      value={currentYear}
                      onChange={(e) => onYearChange(Number(e.target.value))}
                      className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
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
              <p className="t-caption text-slate-500">
                Monitoring populasi armada, kesehatan unit (OK vs RUSAK), dan target
                kepatuhan PM tahunan
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tombol Ekspor Terpisah Sesuai Kebutuhan User */}
          {onExportRepair && (
            <button
              type="button"
              onClick={onExportRepair}
              className="h-10 min-h-[40px] px-3.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition inline-flex items-center gap-1.5 cursor-pointer"
              title="Unduh file Excel riwayat tiket servis dan perbaikan"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Repair</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => exportFleetToExcel(units, currentYear)}
            className="h-10 min-h-[40px] px-4 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition inline-flex items-center gap-1.5 cursor-pointer"
            title="Unduh file Excel master seluruh armada fisik dan status PM tahun berjalan"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor PM & Master</span>
          </button>

          {/* Switcher Tampilan Grafik */}
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium h-10 min-h-[40px]">
            <button
              type="button"
              onClick={() => setChartView('ALL')}
              className={`h-full px-3 rounded-md transition cursor-pointer ${
                chartView === 'ALL'
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Grafik
            </button>
            <button
              type="button"
              onClick={() => setChartView('JENIS')}
              className={`h-full px-3 rounded-md transition cursor-pointer ${
                chartView === 'JENIS'
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grafik Jenis
            </button>
            <button
              type="button"
              onClick={() => setChartView('TREND')}
              className={`h-full px-3 rounded-md transition cursor-pointer ${
                chartView === 'TREND'
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tren 14 Hari
            </button>
            <button
              type="button"
              onClick={() => setChartView('DONUT')}
              className={`h-full px-3 rounded-md transition cursor-pointer ${
                chartView === 'DONUT'
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Donat Proporsi
            </button>
          </div>
        </div>
      </div>

      {/* 4 Mini Cards Status Rapat Eksekutif */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">
            Total Populasi Pabrik
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {totalPopulasi.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-500">Unit</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {jenisCount} kategori di 6 seksi pabrik
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
          <span className="text-xs font-medium text-emerald-800 block">
            Kondisi Siap Operasi
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-emerald-700 tabular-nums">
              {okUnitsCount.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-emerald-800 font-medium">
              / {totalPopulasi} Unit
            </span>
          </div>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">
            {totalPopulasi > 0
              ? ((okUnitsCount / totalPopulasi) * 100).toFixed(1)
              : 100}
            % Armada Sehat (OK)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200">
          <span className="text-xs font-medium text-red-800 block">
            Perlu Repair / Rusak
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-red-700 tabular-nums">
              {rusakUnitsCount}
            </span>
            <span className="text-xs text-red-800 font-medium">
              Unit Armada
            </span>
          </div>
          <span className="text-xs text-red-700 mt-1 block">
            {repairTicketsCount > 0
              ? `${repairTicketsCount} tiket servis aktif`
              : 'Berdasarkan data repair'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block">
            Kepatuhan PM Tahunan
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {totalMaintained}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {totalPopulasi} Unit
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-700 mt-1 block">
            {totalPopulasi > 0
              ? Math.round((totalMaintained / totalPopulasi) * 100)
              : 0}
            % (Sisa {remainingWorkDays} hari kerja)
          </span>
        </div>
      </div>
    </div>
  );
}
