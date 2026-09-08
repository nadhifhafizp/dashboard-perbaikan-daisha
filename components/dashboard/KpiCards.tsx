'use client';

import React from 'react';
import type { KpiSummary } from '@/hooks/useDashboardAnalytics';
import {
  ClipboardList,
  Package,
  Building2,
  Truck,
  Timer,
  Info,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface KpiCardsProps {
  kpi: KpiSummary;
  filterHanyaBerulang: boolean;
  setFilterHanyaBerulang: (val: boolean) => void;
  setFilterStatus: (val: string) => void;
  currentFilterStatus?: string;
}

export default function KpiCards({
  kpi,
  filterHanyaBerulang,
  setFilterHanyaBerulang,
  setFilterStatus,
  currentFilterStatus = '',
}: KpiCardsProps) {
  return (
    <div className="space-y-3">
      {/* 1. Baris Utama: 5 Kartu Eksekutif (Sesuai Layout & Estetika Foto) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Orders / Tiket */}
        <div 
          onClick={() => setFilterStatus('')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-4 group relative overflow-hidden"
        >
          <div className="w-13 h-13 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOTAL ORDERS</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {kpi.total.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <span>▲</span>
              <span>100% Seluruh Tiket</span>
            </div>
          </div>
        </div>

        {/* Card 2: Unit Berhasil Diselesaikan (Done / Completed) */}
        <div 
          onClick={() => setFilterStatus('Done')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-4 group relative overflow-hidden"
        >
          <div className="w-13 h-13 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">UNIT SELESAI (DONE)</span>
              <span title="Total unit Daisha yang berhasil diselesaikan dan siap dioperasikan kembali">
                <Info className="w-3 h-3 text-slate-400 cursor-help" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 flex items-baseline gap-1.5">
              <span>{kpi.done.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-500">Unit</span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <span>▲</span>
              <span>{kpi.doneRate}% Tingkat Selesai</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Seksi / Destinasi Plant */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-4 group relative overflow-hidden">
          <div className="w-13 h-13 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SEKSI TERLAYANI</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 flex items-baseline gap-1.5">
              <span>{kpi.seksiCount || 8}</span>
              <span className="text-xs font-bold text-slate-500">Seksi Plant</span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <span>▲</span>
              <span>Semua Area Aktif</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Unit Fisik Daisha */}
        <div 
          onClick={() => setFilterHanyaBerulang(!filterHanyaBerulang)}
          className={`bg-white p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-4 group relative overflow-hidden ${
            filterHanyaBerulang ? 'ring-2 ring-red-500 border-red-400 bg-red-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="w-13 h-13 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-105 transition-transform">
            <Truck className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOTAL UNIT DAISHA</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 flex items-baseline gap-1.5">
              <span>{kpi.unitUnikCount}</span>
              <span className="text-xs font-bold text-slate-500">Unit</span>
            </div>
            <div className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-1">
              <span>▲</span>
              <span>{kpi.repeatUnitCount}x Unit Berulang</span>
            </div>
          </div>
        </div>

        {/* Card 5: Avg Transit / Lead Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-4 group relative overflow-hidden">
          <div className="w-13 h-13 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
            <Timer className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AVG LEAD TIME</span>
              <span title="Rata-rata durasi pengerjaan dari tiket masuk hingga selesai">
                <Info className="w-3 h-3 text-slate-400 cursor-help" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 flex items-baseline gap-1.5">
              <span>{kpi.avgLeadTimeHours > 0 ? kpi.avgLeadTimeHours : '< 1'}</span>
              <span className="text-xs font-bold text-slate-500">Jam</span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <span>▲</span>
              <span>Kecepatan Standar</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Pipeline Status Pill Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-100/80 rounded-2xl border border-slate-200/80 text-xs">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2">Filter Status Cepat:</span>
        <button
          type="button"
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
            currentFilterStatus === '' && !filterHanyaBerulang
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Semua ({kpi.total})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('Open')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
            currentFilterStatus === 'Open'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-amber-700 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Open / Sedang Dikerjakan ({kpi.open})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('Done')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
            currentFilterStatus === 'Done'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Selesai ({kpi.done})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('Scrap')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
            currentFilterStatus === 'Scrap'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-rose-700 hover:bg-rose-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Rusak / Scrap ({kpi.scrap})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterHanyaBerulang(!filterHanyaBerulang)}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto ${
            filterHanyaBerulang
              ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-400'
              : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
          }`}
        >
          <span>🔁</span>
          <span>{filterHanyaBerulang ? 'Unit Berulang (Aktif)' : `Unit Berulang (${kpi.repeatUnitCount}x)`}</span>
        </button>
      </div>
    </div>
  );
}
