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

interface DaishaChartsProps {
  chartUnitFreq: { unit: string; total: number; jenis: string }[];
  chartSemuaDaisha: { jenis: string; total: number }[];
}

export default function DaishaCharts({
  chartUnitFreq,
  chartSemuaDaisha,
}: DaishaChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Frekuensi Masuk per Nomor Unit (Top 10 Repeat Failure Units) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <span>🔁</span> Unit Sering Masuk Bengkel (Repeat Units)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nomor unit fisik Daisha yang paling sering rusak dan perlu evaluasi mendalam
            </p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 bg-red-100 text-red-800 rounded-lg">
            Top 10 Unit
          </span>
        </div>

        <div className="h-72 w-full">
          {chartUnitFreq.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartUnitFreq} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <YAxis dataKey="unit" type="category" tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} width={70} />
                <Tooltip 
                  formatter={(val: unknown) => [`${val} Kali Masuk`, 'Frekuensi']}
                  labelFormatter={(label, payload) => {
                    const item = payload && payload[0] ? (payload[0].payload as { unit: string; jenis: string }) : null;
                    return `Unit: ${label} (${item?.jenis || 'Daisha'})`;
                  }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#dc2626" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data unit masuk
            </div>
          )}
        </div>
      </div>

      {/* 2. Distribusi Seluruh Jenis Daisha yang Masuk */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <span>🛒</span> Beban Masuk per Jenis Daisha
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Volume kerusakan berdasarkan kategori model Daisha di seluruh seksi
            </p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {chartSemuaDaisha.length} Jenis Aktif
          </span>
        </div>

        <div className="h-72 w-full">
          {chartSemuaDaisha.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSemuaDaisha} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <YAxis dataKey="jenis" type="category" tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 600 }} width={100} />
                <Tooltip 
                  formatter={(val: unknown) => [`${val} Unit Masuk`, 'Total Kerusakan']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#ea580c" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data jenis daisha
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
