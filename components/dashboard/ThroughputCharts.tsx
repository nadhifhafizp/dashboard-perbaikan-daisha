'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ThroughputChartsProps {
  chartTrenHarian: { tanggal: string; Masuk: number; Selesai: number }[];
  chartStatusData: { name: string; value: number; color: string }[];
  chartLeadTime: { rentang: string; total: number; persen: number }[];
  avgLeadTimeHours: number;
}

export default function ThroughputCharts({
  chartTrenHarian,
  chartStatusData,
  chartLeadTime,
  avgLeadTimeHours,
}: ThroughputChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Throughput Perbaikan (Masuk vs Selesai) AreaChart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>📈</span> Throughput Servis Harian (Masuk vs Selesai)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Keseimbangan laju unit masuk bengkel berbanding unit yang berhasil diselesaikan per hari
              </p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              Throughput
            </span>
          </div>

          <div className="h-72 w-full">
            {chartTrenHarian.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartTrenHarian} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Masuk" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorMasuk)" />
                  <Area type="monotone" dataKey="Selesai" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSelesai)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data riwayat tanggal
              </div>
            )}
          </div>
        </div>

        {/* 2. Proporsi Status Tiket (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>🍩</span> Komposisi Status Perbaikan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Persentase tiket berdasarkan progres</p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              Status Share
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {chartStatusData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: unknown) => [`${val} Tiket`, 'Jumlah']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Belum ada data status</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Distribusi Kecepatan Servis (Lead Time Duration) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <span>⏱️</span> Distribusi Waktu Penyelesaian Servis (Lead Time Service)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Berapa lama waktu yang dibutuhkan tim maintenance dari tiket masuk hingga selesai diperbaiki
            </p>
          </div>
          {avgLeadTimeHours > 0 && (
            <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-800 rounded-xl">
              Rata-rata: <b>{avgLeadTimeHours} Jam</b>
            </span>
          )}
        </div>

        <div className="h-56 w-full">
          {chartLeadTime.some(d => d.total > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartLeadTime} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="rentang" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  formatter={(val: unknown, name: unknown, item) => [
                    `${val} Unit (${item.payload.persen}%)`,
                    'Jumlah Unit'
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada tiket yang berstatus Selesai (Done) dengan tanggal keluar terisi
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
