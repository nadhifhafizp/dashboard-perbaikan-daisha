'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Truck, Search, ArrowUpDown, Wrench, Layers, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { JenisHealthItem } from './types';

interface FleetJenisDonutGridProps {
  currentSeksi: string;
  perJenisData: JenisHealthItem[];
  filteredJenisData: JenisHealthItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'ALL' | 'HAS_BROKEN' | 'ALL_READY';
  setStatusFilter: (filter: 'ALL' | 'HAS_BROKEN' | 'ALL_READY') => void;
  sortOrder: 'TOTAL' | 'BROKEN';
  setSortOrder: (order: 'TOTAL' | 'BROKEN') => void;
  countHasBroken: number;
  countAllReady: number;
}

export default function FleetJenisDonutGrid({
  currentSeksi,
  perJenisData,
  filteredJenisData,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder,
  countHasBroken,
  countAllReady,
}: FleetJenisDonutGridProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
      {/* Header Section Kontrol & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-red-600 shrink-0" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Kondisi per Jenis Daisha
              </h3>
              <p className="text-sm sm:text-base text-slate-500 font-medium">
                {currentSeksi && currentSeksi !== 'all'
                  ? `Proporsi siap operasi vs dalam perbaikan jenis armada Seksi ${currentSeksi}`
                  : 'Proporsi siap operasi vs dalam perbaikan per kategori armada'}
              </p>
            </div>
          </div>
        </div>

        {/* Baris Pencarian, Filter Status & Sorting */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Input Pencarian Jenis */}
          <div className="relative min-w-[190px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari jenis armada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 min-h-[40px] pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 transition"
            />
          </div>

          {/* Filter Tab Status */}
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold h-10 min-h-[40px]">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`h-full px-3 rounded-md transition cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 font-bold' : 'text-slate-600'
              }`}
            >
              Semua ({perJenisData.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('HAS_BROKEN')}
              className={`h-full px-3 rounded-md transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'HAS_BROKEN' ? 'bg-white text-red-700 font-bold' : 'text-slate-600'
              }`}
            >
              <span>Perlu Servis</span>
              {countHasBroken > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
              )}
              <span>({countHasBroken})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL_READY')}
              className={`h-full px-3 rounded-md transition cursor-pointer ${
                statusFilter === 'ALL_READY' ? 'bg-white text-emerald-800 font-bold' : 'text-slate-600'
              }`}
            >
              Semua Siap ({countAllReady})
            </button>
          </div>

          {/* Sorting Toggle */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'TOTAL' ? 'BROKEN' : 'TOTAL')}
            className="h-10 min-h-[40px] px-3.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition inline-flex items-center gap-1 cursor-pointer"
            title="Urutkan berdasarkan jumlah populasi atau jumlah unit yang sedang diservis"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortOrder === 'TOTAL' ? 'Populasi Terbesar' : 'Perbaikan Terbanyak'}</span>
          </button>
        </div>
      </div>

      {/* Grid Kartu Diagram Donat untuk SETIAP JENIS DAISHA */}
      {filteredJenisData.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          Tidak ditemukan jenis daisha yang sesuai dengan filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pt-1">
          {filteredJenisData.map((item) => {
            const donutData = [
              { name: 'Siap Operasi', value: item.ready, color: '#059669' },
              { name: 'Dalam Perbaikan', value: item.broken, color: '#dc2626' },
            ];

            return (
              <div
                key={item.nama}
                className={`bg-white rounded-xl border-2 p-4 sm:p-5 transition flex flex-col justify-between shadow-2xs ${
                  item.broken > 0 ? 'border-red-300' : 'border-slate-200'
                }`}
              >
                {/* Header Kartu Donat Jenis */}
                <div>
                  <div className="flex items-start justify-between gap-1 pb-2.5 border-b border-slate-100">
                    <div className="min-w-0 pr-1">
                      <h4 className="text-sm font-black text-slate-900 truncate" title={item.nama}>
                        {item.nama}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {item.seksi || (item.seksiList && item.seksiList[0]) || 'Building'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium truncate">
                          {item.total.toLocaleString('id-ID')} Total Unit
                        </span>
                      </div>
                    </div>

                    {item.broken > 0 ? (
                      <span className="h-7 px-2.5 rounded-md text-xs font-black bg-red-100 text-red-700 shrink-0 inline-flex items-center border border-red-300">
                        {item.broken} Rusak
                      </span>
                    ) : (
                      <span className="h-7 px-2.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0 inline-flex items-center border border-emerald-300">
                        100% Siap
                      </span>
                    )}
                  </div>

                  {/* Rentang Nomor Seri & Varian Resmi dari Katalog */}
                  {item.variants && item.variants.length > 0 ? (
                    <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-700 font-bold">
                        <span className="inline-flex items-center gap-1 text-[10px]">
                          <Hash className="w-3 h-3 text-slate-500" />
                          <span>Varian & Nomor ({item.variants.length})</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-medium">
                          {item.variants.reduce((a, b) => a + (Number(b.totalUnits) || 0), 0)} unit
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto scrollbar-none">
                        {item.variants.map((v) => (
                          <span
                            key={v.id || v.name}
                            className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-mono font-semibold"
                            title={`${v.name}: ${v.rangeFormat || (v.codePrefix ? `${v.codePrefix}...` : '')} (${v.totalUnits} unit)`}
                          >
                            {v.ukuran && v.ukuran !== 'NONE' ? `[${v.ukuran}] ` : ''}
                            {v.rangeFormat || (v.codePrefix ? `${v.codePrefix} (${v.totalUnits}u)` : `${v.name} (${v.totalUnits}u)`)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : item.codePrefix ? (
                    <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 text-[11px] flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-700 font-bold">
                        <Hash className="w-3 h-3 text-slate-500" />
                        <span>Prefix Nomor:</span>
                        <span className="font-mono text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200 font-bold">
                          {item.codePrefix}
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {item.total.toLocaleString('id-ID')} unit
                      </span>
                    </div>
                  ) : null}

                  {/* Donut Chart Khusus untuk Jenis Daisha Ini */}
                  <div className="h-[160px] w-full relative flex items-center justify-center mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={item.broken > 0 ? 3 : 0}
                          dataKey="value"
                          isAnimationActive={false}
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${item.nama}-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: unknown, name: unknown) => [
                            `${Number(val || 0).toLocaleString('id-ID')} Unit (${(
                              (Number(val || 0) / (item.total || 1)) *
                              100
                            ).toFixed(1)}%)`,
                            String(name || ''),
                          ]}
                          contentStyle={{ borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Angka & Persentase di Tengah Donat */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                        {item.pctReady.toFixed(0)}%
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 mt-0.5">
                        {item.total.toLocaleString('id-ID')} Unit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Rincian Siap Operasi vs Dalam Perbaikan */}
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs sm:text-sm">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[11px] text-emerald-800 block font-bold">Siap Operasi</span>
                      <span className="font-black text-emerald-900 text-sm sm:text-base tabular-nums">
                        {item.ready.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-lg text-center border ${
                        item.broken > 0
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] block font-bold">Perbaikan</span>
                      <span className="font-black text-sm sm:text-base tabular-nums">
                        {item.broken.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Part Titik Kerusakan Terdaftar di DaishaCatalog */}
                  {item.components && item.components.length > 0 ? (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-red-500" />
                          <span>Part Kerusakan ({item.components.length})</span>
                        </span>
                        <span className="text-[9px] text-slate-400 font-normal">Katalog</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.components.slice(0, 3).map((c) => (
                          <span
                            key={c.id || c.name}
                            className="px-1.5 py-0.5 rounded bg-red-50 text-red-800 border border-red-200/70 text-[9px] font-semibold truncate max-w-[120px]"
                            title={`${c.name}${c.symptoms && c.symptoms.length > 0 ? ` (${c.symptoms.length} gejala)` : ''}`}
                          >
                            {c.name}
                          </span>
                        ))}
                        {item.components.length > 3 && (
                          <span
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-semibold"
                            title={item.components.slice(3).map((c) => c.name).join(', ')}
                          >
                            +{item.components.length - 3} part
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400">
                      <Wrench className="w-3 h-3 text-slate-300" />
                      <span>Part standar</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
