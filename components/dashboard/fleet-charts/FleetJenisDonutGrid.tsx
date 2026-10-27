'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Truck, Search, ArrowUpDown } from 'lucide-react';
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
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="t-section text-slate-900 tracking-tight">
                Kondisi per Jenis Daisha
              </h3>
              <p className="t-caption text-slate-500">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
          {filteredJenisData.map((item) => {
            const donutData = [
              { name: 'Siap Operasi', value: item.ready, color: '#059669' },
              { name: 'Dalam Perbaikan', value: item.broken, color: '#dc2626' },
            ];

            return (
              <div
                key={item.nama}
                className={`bg-white rounded-xl border p-4 transition flex flex-col justify-between ${
                  item.broken > 0 ? 'border-red-200' : 'border-slate-200'
                }`}
              >
                {/* Header Kartu Donat Jenis */}
                <div>
                  <div className="flex items-start justify-between gap-1 pb-2 border-b border-slate-100">
                    <div className="min-w-0 pr-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate" title={item.nama}>
                        {item.nama}
                      </h4>
                      <span className="text-xs text-slate-400 block truncate">
                        {item.seksiList.join(', ') || 'Semua Seksi'}
                      </span>
                    </div>

                    {item.broken > 0 ? (
                      <span className="h-6 px-2.5 rounded-full text-xs font-bold bg-red-100 text-red-700 shrink-0 inline-flex items-center">
                        {item.broken} Rusak
                      </span>
                    ) : (
                      <span className="h-6 px-2.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shrink-0 inline-flex items-center">
                        100% Siap
                      </span>
                    )}
                  </div>

                  {/* Donut Chart Khusus untuk Jenis Daisha Ini */}
                  <div className="h-[150px] w-full relative flex items-center justify-center mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={60}
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
                          contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Angka & Persentase di Tengah Donat */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-base font-bold text-slate-900 tabular-nums">
                        {item.pctReady.toFixed(0)}%
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {item.total.toLocaleString('id-ID')} Unit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Rincian Siap Operasi vs Dalam Perbaikan */}
                <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-100 text-xs mt-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100/80 text-center">
                    <span className="text-xs text-emerald-700 block font-medium">Siap Operasi</span>
                    <span className="font-bold text-emerald-800 tabular-nums">
                      {item.ready.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div
                    className={`p-1.5 rounded-lg text-center border ${
                      item.broken > 0
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}
                  >
                    <span className="text-xs block font-medium">Perbaikan</span>
                    <span
                      className={`font-bold tabular-nums ${
                        item.broken > 0 ? 'text-red-700' : 'text-slate-600'
                      }`}
                    >
                      {item.broken.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
