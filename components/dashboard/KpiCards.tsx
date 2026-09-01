'use client';

import React from 'react';

interface KpiData {
  total: number;
  open: number;
  progress: number;
  done: number;
  scrap: number;
  doneRate: number;
  scrapRate: number;
  avgLeadTimeHours: number;
  unitUnikCount: number;
  repeatUnitCount: number;
}

interface KpiCardsProps {
  kpi: KpiData;
  filterHanyaBerulang: boolean;
  setFilterHanyaBerulang: (val: boolean) => void;
  setFilterStatus: (val: string) => void;
}

export default function KpiCards({
  kpi,
  filterHanyaBerulang,
  setFilterHanyaBerulang,
  setFilterStatus,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {/* 1. Total Tiket */}
      <div 
        onClick={() => setFilterStatus('')}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Total Laporan</span>
          <span className="text-sm">📋</span>
        </div>
        <div className="text-2xl font-black text-slate-800 group-hover:text-red-600 transition">{kpi.total}</div>
        <div className="text-[10px] font-bold text-slate-600 mt-1">Semua Tiket Masuk</div>
      </div>

      {/* 2. Menunggu (Open) */}
      <div 
        onClick={() => setFilterStatus('Open')}
        className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm hover:shadow-md transition cursor-pointer group"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">Antre (Open)</span>
          <span className="text-sm">⏳</span>
        </div>
        <div className="text-2xl font-black text-amber-600 group-hover:scale-105 transition">{kpi.open}</div>
        <div className="text-[10px] font-bold text-amber-600/80 mt-1">Belum Dikerjakan</div>
      </div>

      {/* 3. Dalam Pengerjaan (Progress) */}
      <div 
        onClick={() => setFilterStatus('Progress')}
        className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm hover:shadow-md transition cursor-pointer group"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">Dikerjakan</span>
          <span className="text-sm">⚙️</span>
        </div>
        <div className="text-2xl font-black text-blue-600 group-hover:scale-105 transition">{kpi.progress}</div>
        <div className="text-[10px] font-bold text-blue-600/80 mt-1">Sedang Diperbaiki</div>
      </div>

      {/* 4. Selesai (Done) */}
      <div 
        onClick={() => setFilterStatus('Done')}
        className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm hover:shadow-md transition cursor-pointer group"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Selesai</span>
          <span className="text-sm">✅</span>
        </div>
        <div className="text-2xl font-black text-emerald-600 group-hover:scale-105 transition">{kpi.done}</div>
        <div className="text-[10px] font-bold text-emerald-600/80 mt-1">Rate: {kpi.doneRate}%</div>
      </div>

      {/* 5. Afkir (Scrap) */}
      <div 
        onClick={() => setFilterStatus('Scrap')}
        className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm hover:shadow-md transition cursor-pointer group"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider">Afkir (Scrap)</span>
          <span className="text-sm">🚫</span>
        </div>
        <div className="text-2xl font-black text-rose-600 group-hover:scale-105 transition">{kpi.scrap}</div>
        <div className="text-[10px] font-bold text-rose-600/80 mt-1">Rate: {kpi.scrapRate}%</div>
      </div>

      {/* 6. Rata-rata Durasi Perbaikan */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Avg Lead Time</span>
          <span className="text-sm">⏱️</span>
        </div>
        <div className="text-2xl font-black text-purple-600">
          {kpi.avgLeadTimeHours > 0 ? `${kpi.avgLeadTimeHours}h` : '-'}
        </div>
        <div className="text-[10px] font-bold text-slate-600 mt-1">Kecepatan Servis</div>
      </div>

      {/* 7. Total Unit Fisik & Unit Berulang */}
      <div 
        onClick={() => setFilterHanyaBerulang(!filterHanyaBerulang)}
        className={`p-4 rounded-2xl border transition cursor-pointer group ${
          filterHanyaBerulang 
            ? 'bg-red-50 border-red-500 shadow-md ring-2 ring-red-400' 
            : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
        }`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Unit Fisik</span>
          <span className="text-sm">🛒</span>
        </div>
        <div className="text-2xl font-black text-slate-800">
          {kpi.unitUnikCount} <span className="text-xs font-bold text-red-600">({kpi.repeatUnitCount}x repeat)</span>
        </div>
        <div className="text-[10px] font-bold text-slate-600 mt-1 flex items-center gap-1">
          <span>{filterHanyaBerulang ? '🔴 Filter Berulang Aktif' : 'Klik Filter >1x Masuk'}</span>
        </div>
      </div>
    </div>
  );
}
