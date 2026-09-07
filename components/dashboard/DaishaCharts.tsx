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
import { Info, Truck, Layers } from 'lucide-react';

interface DaishaChartsProps {
  chartUnitFreq: { unit: string; total: number; jenis: string; displayName?: string }[];
  chartSemuaDaisha: { jenis: string; total: number }[];
}

export default function DaishaCharts({
  chartUnitFreq,
  chartSemuaDaisha,
}: DaishaChartsProps) {
  // Mode toggle: 'unit' (Pilihan 1: Per nomor unit dengan nama daishanya) vs 'jenis' (Pilihan 2: Model/jenis daisha tanpa nomor secara keseluruhan)
  const [activeMode, setActiveMode] = useState<'unit' | 'jenis'>('unit');

  // Gradien warna biru bertingkat persis seperti referensi foto (Top bar biru tua -> menurun ke biru muda)
  const blueShades = [
    '#1d4ed8', // 1: Deep Royal Blue
    '#2563eb', // 2: Royal Blue
    '#3b82f6', // 3: Bright Blue
    '#60a5fa', // 4: Sky Blue
    '#60a5fa', // 5: Sky Blue
    '#93c5fd', // 6: Light Blue
    '#93c5fd', // 7: Light Blue
    '#bfdbfe', // 8: Soft Blue
    '#bfdbfe', // 9: Soft Blue
    '#cbd5e1', // 10: Slate
  ];

  const currentData = activeMode === 'unit'
    ? chartUnitFreq.slice(0, 10).map((d) => ({
        name: d.displayName || `${d.unit} • ${d.jenis}`,
        total: d.total,
        sub: d.jenis,
        unit: d.unit,
      }))
    : chartSemuaDaisha.slice(0, 10).map((d) => ({
        name: d.jenis,
        total: d.total,
        sub: 'Model Keseluruhan Tanpa Nomor Unit',
        unit: '',
      }));

  const maxVal = currentData.length > 0 ? Math.max(...currentData.map((d) => d.total)) : 20;
  // Domain X-Axis agar label angka di kanan bar tidak terpotong
  const xDomainMax = Math.ceil(maxVal * 1.25);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-full">
      {/* 1. Header Card Sesuai Poin 2 Permintaan Mentor */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span>
              {activeMode === 'unit'
                ? 'TOP UNIT DAISHA SERING MASUK (NO. UNIT + NAMA)'
                : 'TOP MODEL DAISHA (KESELURUHAN TANPA NOMOR)'}
            </span>
            <span title="Peringkat daisha yang paling sering masuk bengkel perbaikan">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeMode === 'unit'
              ? 'Peringkat nomor fisik unit beserta modelnya yang paling sering mengalami kerusakan'
              : 'Akumulasi seluruh volume kerusakan berdasarkan kategori jenis daisha di bengkel'}
          </p>
        </div>

        {/* 2 Opsi Toggle Persis Poin 2 User */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMode('unit')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'unit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Nomor & Nama Unit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('jenis')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'jenis'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Model Keseluruhan</span>
          </button>
        </div>
      </div>

      {/* Sub-Header Kolom */}
      <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
        <span>{activeMode === 'unit' ? 'Nomor Unit Fisik • Nama Daisha' : 'Kategori Model / Jenis Daisha'}</span>
        <span>Frekuensi Masuk (Kali)</span>
      </div>

      {/* 2. Horizontal Ranked Bar Chart */}
      <div style={{ height: Math.min(380, Math.max(120, currentData.length * 38 + 40)) }} className="w-full">
        {currentData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentData}
              layout="vertical"
              margin={{ top: 5, right: 55, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                domain={[0, xDomainMax]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }}
                width={175}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: unknown) => [`${val} Kali Masuk`, 'Frekuensi Masuk']}
                labelFormatter={(label, payload) => {
                  const item = payload && payload[0] ? (payload[0].payload as { sub?: string; unit?: string }) : null;
                  return item?.unit
                    ? `Nomor Unit: ${item.unit} | Model: ${item.sub}`
                    : `Model Daisha: ${label}`;
                }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={15}>
                {currentData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={blueShades[index % blueShades.length]}
                  />
                ))}
                <LabelList
                  dataKey="total"
                  position="right"
                  fill="#0f172a"
                  fontSize={11}
                  fontWeight={700}
                  formatter={(val: unknown) => `${Number(val).toLocaleString()}x`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Belum ada data unit daisha
          </div>
        )}
      </div>
    </div>
  );
}
