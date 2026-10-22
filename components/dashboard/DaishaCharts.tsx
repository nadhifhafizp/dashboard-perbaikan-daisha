'use client';

import React, { useState, useEffect } from 'react';
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
  const [activeMode, setActiveMode] = useState<'unit' | 'jenis'>('unit');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/60 shadow-2xs flex flex-col h-full">
      {/* 1. Header Card */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {activeMode === 'unit' ? <Truck className="w-4 h-4 text-slate-500" /> : <Layers className="w-4 h-4 text-slate-500" />}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              {activeMode === 'unit'
                ? 'Unit Paling Sering Masuk'
                : 'Model Paling Sering Masuk'}
            </h3>
            <span className="text-[10px] text-slate-400 font-normal">
              {activeMode === 'unit' ? 'Top 10 Nomor Unit Fisik' : 'Top 10 Kategori Model'}
            </span>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center p-0.5 bg-slate-100/90 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveMode('unit')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'unit'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3 h-3 text-red-600" />
            <span>Per Unit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('jenis')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'jenis'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3 text-red-600" />
            <span>Per Model</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal Ranked Bar Chart */}
      <div style={{ height: Math.min(380, Math.max(120, currentData.length * 38 + 40)) }} className="w-full">
        {currentData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentData}
              layout="vertical"
              margin={{ top: 5, right: isMobile ? 36 : 55, left: isMobile ? 0 : 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                domain={[0, xDomainMax]}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: isMobile ? 11 : 12, fill: '#1e293b', fontWeight: 600 }}
                tickFormatter={(val: string) => isMobile && val.length > 13 ? `${val.slice(0, 12)}…` : val}
                width={isMobile ? 115 : 175}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0]?.payload as { total: number; sub?: string; unit?: string };
                  const count = item?.total || 0;
                  const ratio = maxVal > 0 ? count / maxVal : 1;
                  const statusTag =
                    ratio >= 0.75
                      ? { label: 'Kritis (Prioritas Penanganan Bengkel)', cls: 'text-red-700 bg-red-50 border-red-200' }
                      : ratio >= 0.4
                      ? { label: 'Perlu Pemantauan Rutin', cls: 'text-amber-700 bg-amber-50 border-amber-200' }
                      : { label: 'Frekuensi Wajar / Normal', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' };

                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-lg space-y-1.5 min-w-[200px]">
                      <p className="font-bold text-slate-800 border-b border-slate-100 pb-1">
                        {item?.unit ? `Unit: ${item.unit} (${item.sub})` : `Model: ${label}`}
                      </p>
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-500">Frekuensi Masuk:</span>
                        <span className="text-red-700 font-extrabold text-sm">{count}x Masuk</span>
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusTag.cls}`}>
                        {statusTag.label}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={16}>
                {currentData.map((entry, idx) => {
                  const ratio = maxVal > 0 ? entry.total / maxVal : 1;
                  // Gradien intensitas data-driven: nilai tertinggi = opacity 1.0 (merah pekat), nilai terendah = opacity 0.35 (merah muda)
                  const opacity = Math.max(0.35, 0.35 + 0.65 * ratio);
                  return (
                    <Cell
                      key={`cell-daisha-${idx}`}
                      fill="#E60012"
                      fillOpacity={opacity}
                    />
                  );
                })}
                <LabelList
                  dataKey="total"
                  position="right"
                  fill="#0f172a"
                  fontSize={12}
                  fontWeight={700}
                  formatter={(val: unknown) => `${Number(val).toLocaleString()}x`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            Belum ada data unit daisha
          </div>
        )}
      </div>
    </div>
  );
}
