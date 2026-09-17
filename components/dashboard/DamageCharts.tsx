'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Wrench, PieChart as PieIcon } from 'lucide-react';

interface DamageChartsProps {
  chartKategori: { kategori: string; total: number; totalPcs?: number }[];
  chartDetailGejala: { gejala: string; total: number; totalPcs?: number; komponen?: string }[];
  tindakanStats?: {
    repairCount: number;
    gantiCount: number;
    total: number;
    repairPcs?: number;
    gantiPcs?: number;
    totalPcs?: number;
  };
  sparepartKebutuhan?: {
    nama: string;
    gejala: string;
    gantiPcs: number;
    repairPcs: number;
    totalPcs: number;
  }[];
  sparepartKebutuhanSemua?: {
    nama: string;
    gejala: string;
    gantiPcs: number;
    repairPcs: number;
    totalPcs: number;
  }[];
}

export default function DamageCharts({
  chartKategori,
  chartDetailGejala,
  tindakanStats,
}: DamageChartsProps) {
  const [metricMode, setMetricMode] = useState<'kasus' | 'pcs'>('kasus');

  const blueShades = [
    '#1d4ed8',
    '#2563eb',
    '#3b82f6',
    '#60a5fa',
    '#60a5fa',
    '#93c5fd',
    '#93c5fd',
    '#bfdbfe',
    '#bfdbfe',
    '#cbd5e1',
    '#cbd5e1',
    '#e2e8f0',
  ];

  const dataKategori = chartKategori.map((item) => ({
    ...item,
    displayVal: metricMode === 'pcs' ? (item.totalPcs || item.total) : item.total,
  }));

  const dataGejala = chartDetailGejala.slice(0, 10).map((item) => ({
    ...item,
    displayVal: metricMode === 'pcs' ? (item.totalPcs || item.total) : item.total,
  }));

  const repairVal = metricMode === 'pcs' ? (tindakanStats?.repairPcs || tindakanStats?.repairCount || 0) : (tindakanStats?.repairCount || 0);
  const gantiVal = metricMode === 'pcs' ? (tindakanStats?.gantiPcs || tindakanStats?.gantiCount || 0) : (tindakanStats?.gantiCount || 0);
  const totalTindakan = repairVal + gantiVal;

  const tindakanDonutData = [
    { name: 'Repair / Servis Fisik', value: repairVal, color: '#2563eb', sub: 'Perbaikan tanpa ganti part' },
    { name: 'Ganti Sparepart Baru', value: gantiVal, color: '#f59e0b', sub: 'Penggantian suku cadang' },
  ].filter((d) => d.value > 0);

  const TindakanTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string; sub: string } }[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = totalTindakan > 0 ? Math.round((item.value / totalTindakan) * 100) : 0;
      return (
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-md">
          <p className="font-extrabold" style={{ color: item.payload.color }}>{item.name}</p>
          <p className="text-slate-500 text-[11px]">{item.payload.sub}</p>
          <p className="text-slate-800 font-bold mt-1">
            {item.value} {metricMode === 'pcs' ? 'pcs' : 'tindakan'} ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Hitung tinggi eksplisit agar setiap baris memiliki ruang vertikal yang cukup (38-42px per bar)
  const heightKategori = Math.max(380, dataKategori.length * 38 + 40);
  const heightGejala = Math.max(380, dataGejala.length * 40 + 40);

  // Formatter sumbu Y agar teks panjang tidak menabrak teks baris lain
  const formatGejala = (val: string) => {
    if (!val) return '';
    return val.length > 25 ? `${val.slice(0, 24)}…` : val;
  };

  const formatKategori = (val: string) => {
    if (!val) return '';
    return val.length > 22 ? `${val.slice(0, 21)}…` : val;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Ringkas & Metric Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>ANALISIS KERUSAKAN KOMPONEN & TINDAKAN BENGKEL</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Komponen paling sering rusak, detail gejala dominan, serta proporsi tindakan perbaikan vs penggantian part
          </p>
        </div>

        {/* Toggle Kasus vs Pcs */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setMetricMode('kasus')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              metricMode === 'kasus'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Frekuensi Kejadian</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('pcs')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              metricMode === 'pcs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Kuantitas Part (Pcs)</span>
          </button>
        </div>
      </div>

      {/* 2. Grid Visual: 2 Batang Horizontal (Atas) Memberikan Ruang Lega bagi Label Teks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= A. BATANG HORIZONTAL: KOMPONEN PALING SERING RUSAK ================= */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔧</span> Komponen Paling Sering Rusak
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg">
                {metricMode === 'pcs' ? 'Pcs' : 'Kasus'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Peringkat komponen troli yang paling banyak membutuhkan perbaikan
            </p>
          </div>

          <div style={{ height: heightKategori }} className="w-full">
            {dataKategori.length > 0 ? (
              <ResponsiveContainer width="100%" height={heightKategori}>
                <BarChart data={dataKategori} layout="vertical" margin={{ top: 10, right: 45, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="kategori"
                    type="category"
                    interval={0}
                    width={150}
                    tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }}
                    tickFormatter={formatKategori}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                    formatter={(val: unknown) => [
                      `${val} ${metricMode === 'pcs' ? 'pcs' : 'kali'}`,
                      'Volume',
                    ]}
                    labelFormatter={(label) => `Komponen: ${label}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="displayVal" radius={[0, 4, 4, 0]} barSize={16}>
                    {dataKategori.map((_, index) => (
                      <Cell key={`cell-kat-${index}`} fill={blueShades[index % blueShades.length]} />
                    ))}
                    <LabelList dataKey="displayVal" position="right" fill="#0f172a" fontSize={11} fontWeight={800} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data komponen
              </div>
            )}
          </div>
        </div>

        {/* ================= B. BATANG HORIZONTAL: TOP GEJALA MASALAH ================= */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚠️</span> Top Gejala Kerusakan
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg">
                Top 10
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Gejala kerusakan fisik daisha yang paling sering ditemukan di lapangan
            </p>
          </div>

          <div style={{ height: heightGejala }} className="w-full">
            {dataGejala.length > 0 ? (
              <ResponsiveContainer width="100%" height={heightGejala}>
                <BarChart data={dataGejala} layout="vertical" margin={{ top: 10, right: 45, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="gejala"
                    type="category"
                    interval={0}
                    width={180}
                    tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }}
                    tickFormatter={formatGejala}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                    formatter={(val: unknown) => [
                      `${val} ${metricMode === 'pcs' ? 'pcs' : 'kejadian'}`,
                      'Frekuensi',
                    ]}
                    labelFormatter={(label) => `Gejala: ${label}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="displayVal" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16}>
                    <LabelList dataKey="displayVal" position="right" fill="#0f172a" fontSize={11} fontWeight={800} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data gejala
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= C. DIAGRAM DONAT: PROPORSI TINDAKAN BENGKEL (Bawah) ================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-600" />
              <span>PROPORSI TINDAKAN BENGKEL: SERVIS FISIK VS GANTI SPAREPART</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan unit yang ditangani via perbaikan fisik tanpa ganti part vs unit yang membutuhkan penggantian suku cadang baru
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
            {metricMode === 'pcs' ? 'Kuantitas Part (Pcs)' : 'Frekuensi Kasus'}
          </span>
        </div>

        {totalTindakan > 0 ? (
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
            {/* Diagram Donat */}
            <div className="relative h-48 w-48 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tindakanDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {tindakanDonutData.map((entry, index) => (
                      <Cell key={`cell-tindakan-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<TindakanTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 leading-none">{totalTindakan}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  {metricMode === 'pcs' ? 'Total Pcs' : 'Tindakan'}
                </span>
              </div>
            </div>

            {/* Rincian Kartu Tindakan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full max-w-xl">
              {tindakanDonutData.map((item) => {
                const pct = totalTindakan > 0 ? Math.round((item.value / totalTindakan) * 100) : 0;
                return (
                  <div key={item.name} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-extrabold text-slate-800 text-xs">{item.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">{item.sub}</p>
                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-xl font-black text-slate-900">
                        {item.value} <span className="text-xs font-semibold text-slate-500">{metricMode === 'pcs' ? 'pcs' : 'tindakan'}</span>
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-xs text-slate-400">
            Belum ada data tindakan
          </div>
        )}
      </div>
    </div>
  );
}
