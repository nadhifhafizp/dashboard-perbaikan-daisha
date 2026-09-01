'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DamageChartsProps {
  chartKategori: { kategori: string; total: number }[];
  chartDetailGejala: { gejala: string; total: number }[];
  tindakanStats?: { repairCount: number; gantiCount: number; total: number };
}

export default function DamageCharts({
  chartKategori,
  chartDetailGejala,
  tindakanStats,
}: DamageChartsProps) {
  const totalTindakan = tindakanStats?.total || 0;
  const repairPercent = totalTindakan > 0 ? Math.round(((tindakanStats?.repairCount || 0) / totalTindakan) * 100) : 0;
  const gantiPercent = totalTindakan > 0 ? Math.round(((tindakanStats?.gantiCount || 0) / totalTindakan) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Mini Stat: Rasio Tindakan Repair vs Ganti */}
      {tindakanStats && totalTindakan > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛠️</span>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Proporsi Tindakan Kerusakan (Repair vs Ganti)
              </h4>
              <p className="text-[11px] text-slate-500">
                Total {totalTindakan} tindakan komponen yang tercatat pada tiket terfilter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-base">🔨</span>
              <div>
                <span className="text-xs font-black text-amber-900 block leading-tight">
                  {tindakanStats.repairCount} Repair ({repairPercent}%)
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">Diservis / Diperbaiki</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-base">🔄</span>
              <div>
                <span className="text-xs font-black text-blue-900 block leading-tight">
                  {tindakanStats.gantiCount} Ganti ({gantiPercent}%)
                </span>
                <span className="text-[10px] text-blue-700 font-semibold">Sparepart Diganti Baru</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Pareto Komponen Rusak Terbanyak */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>🔧</span> Pareto Komponen Rusak Terbanyak
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bagian atau sparepart Daisha dengan frekuensi kerusakan tertinggi
              </p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
              Pareto Chart
            </span>
          </div>

          <div className="h-72 w-full">
            {chartKategori.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartKategori} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis dataKey="kategori" type="category" tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} width={90} />
                  <Tooltip 
                    formatter={(val: unknown) => [`${val} Kejadian`, 'Frekuensi']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="total" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data komponen rusak
              </div>
            )}
          </div>
        </div>

        {/* 2. Top 10 Detail Gejala Spesifik Kerusakan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>⚠️</span> Top 10 Detail Gejala Masalah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Keluhan fisik spesifik yang paling sering dialami komponen Daisha
              </p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-red-100 text-red-800 rounded-lg">
              Top Gejala
            </span>
          </div>

          <div className="h-72 w-full">
            {chartDetailGejala.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDetailGejala} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis dataKey="gejala" type="category" tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 600 }} width={130} />
                  <Tooltip 
                    formatter={(val: unknown) => [`${val} Kasus`, 'Jumlah Kasus']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="total" fill="#e11d48" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data detail gejala
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
