'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SectionChartsProps {
  chartSeksiStacked: { seksi: string; Open: number; Progress: number; Done: number; Scrap: number; Total: number }[];
  chartPelapor: { pelapor: string; seksi: string; total: number }[];
}

export default function SectionCharts({
  chartSeksiStacked,
  chartPelapor,
}: SectionChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Distribusi Status Tiket per Seksi (Stacked Bar) */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <span>🏢</span> Beban Kerusakan & Status Tiket per Seksi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribusi progres perbaikan unit daisha pada tiap seksi plant
            </p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Stacked Bar
          </span>
        </div>

        <div className="h-72 w-full">
          {chartSeksiStacked.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSeksiStacked} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="seksi" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Open" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Progress" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Done" stackId="a" fill="#10b981" />
                <Bar dataKey="Scrap" stackId="a" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data seksi
            </div>
          )}
        </div>
      </div>

      {/* 2. Leaderboard Kontributor Pelapor Teraktif */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <span>🏆</span> Kontributor Laporan Teraktif
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Teknisi / Operator yang paling proaktif melaporkan kondisi unit
            </p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
            Top Reporter
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-72">
          {chartPelapor.length > 0 ? (
            chartPelapor.map((p, idx) => (
              <div 
                key={p.pelapor}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    idx === 0 ? 'bg-amber-500 text-white shadow-sm' :
                    idx === 1 ? 'bg-slate-400 text-white' :
                    idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">{p.pelapor}</p>
                    <span className="text-[10px] text-slate-500 font-medium">Seksi: {p.seksi}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                    {p.total} Laporan
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data pelapor
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
