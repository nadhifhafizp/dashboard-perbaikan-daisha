'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Wrench } from 'lucide-react';

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
  sparepartKebutuhan = [],
  sparepartKebutuhanSemua = [],
}: DamageChartsProps) {
  // Mode Tampilan: 'kasus' (Frekuensi kejadian tiket) vs 'pcs' (Berdasarkan jumlah kuantitas unit komponen)
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
  ];

  // Siapkan data grafik sesuai metricMode
  const dataKategori = chartKategori.map((item) => ({
    ...item,
    displayVal: metricMode === 'pcs' ? (item.totalPcs || item.total) : item.total,
  }));

  const dataGejala = chartDetailGejala.map((item) => ({
    ...item,
    displayVal: metricMode === 'pcs' ? (item.totalPcs || item.total) : item.total,
  }));

  return (
    <div className="space-y-6">
      {/* 1. Header Ringkas & Metric Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>ANALISIS TEKNIS KERUSAKAN & GEJALA</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi komponen kritis, gejala kerusakan fisik, dan efektivitas perbaikan bengkel
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


      {/* 3. Bar Charts: Pareto Komponen & Top Gejala */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pareto Komponen */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>🔧</span> Pareto Komponen Rusak Terbanyak
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {metricMode === 'pcs' ? 'Total kuantitas part (pcs) yang rusak' : 'Frekuensi kemunculan kasus di tiket'}
              </p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
              {metricMode === 'pcs' ? 'Volume Pcs' : 'Frekuensi Kasus'}
            </span>
          </div>

          <div style={{ height: Math.min(360, Math.max(120, dataKategori.length * 38 + 40)) }} className="w-full">
            {dataKategori.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataKategori} layout="vertical" margin={{ top: 5, right: 40, left: 70, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} axisLine={false} />
                  <YAxis dataKey="kategori" type="category" tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} width={95} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: unknown, _, props) => {
                      const item = props?.payload as { total?: number; totalPcs?: number };
                      return [
                        metricMode === 'pcs'
                          ? `${val} pcs (${item.total || 1} kejadian)`
                          : `${val} kali (${item.totalPcs || item.total || 1} pcs part)`,
                        metricMode === 'pcs' ? 'Total Pcs' : 'Frekuensi',
                      ];
                    }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="displayVal" radius={[0, 4, 4, 0]} barSize={15}>
                    {dataKategori.map((_, index) => (
                      <Cell key={`cell-kat-${index}`} fill={blueShades[index % blueShades.length]} />
                    ))}
                    <LabelList dataKey="displayVal" position="right" fill="#0f172a" fontSize={10.5} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data komponen rusak
              </div>
            )}
          </div>
        </div>

        {/* Top Detail Gejala */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>⚠️</span> Top 10 Detail Gejala Masalah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {metricMode === 'pcs' ? 'Kuantitas part fisik yang terdampak gejala' : 'Keluhan spesifik yang paling sering dilaporkan'}
              </p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-red-100 text-red-800 rounded-lg">
              {metricMode === 'pcs' ? 'Volume Pcs' : 'Frekuensi Kasus'}
            </span>
          </div>

          <div style={{ height: Math.min(360, Math.max(120, dataGejala.length * 38 + 40)) }} className="w-full">
            {dataGejala.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataGejala} layout="vertical" margin={{ top: 5, right: 40, left: 95, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} axisLine={false} />
                  <YAxis dataKey="gejala" type="category" tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 600 }} width={120} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: unknown, _, props) => {
                      const item = props?.payload as { total?: number; totalPcs?: number };
                      return [
                        metricMode === 'pcs'
                          ? `${val} pcs (${item.total || 1} kejadian)`
                          : `${val} kali (${item.totalPcs || item.total || 1} pcs part)`,
                        metricMode === 'pcs' ? 'Total Pcs' : 'Frekuensi',
                      ];
                    }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="displayVal" radius={[0, 4, 4, 0]} barSize={15}>
                    {dataGejala.map((_, index) => (
                      <Cell key={`cell-gej-${index}`} fill={blueShades[index % blueShades.length]} />
                    ))}
                    <LabelList dataKey="displayVal" position="right" fill="#0f172a" fontSize={10.5} fontWeight={700} />
                  </Bar>
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
