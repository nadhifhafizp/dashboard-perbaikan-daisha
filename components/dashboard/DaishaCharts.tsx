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
import { CHART } from '@/lib/chart-colors';

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
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/60 flex flex-col h-full">
      {/* 1. Header Card */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {activeMode === 'unit' ? <Truck className="w-4 h-4 text-slate-500" /> : <Layers className="w-4 h-4 text-slate-500" />}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              {activeMode === 'unit'
                ? 'Unit Sering Masuk'
                : 'Model Sering Masuk'}
            </h3>
            <span className="text-xs text-slate-400 font-normal">
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
                ? 'bg-white text-slate-900 font-semibold'
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
                ? 'bg-white text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3 text-red-600" />
            <span>Per Model</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal Ranked Bar Chart - DIPERBESAR & DIPADATKAN */}
      <div style={{ height: Math.min(440, Math.max(160, currentData.length * 40 + 45)) }} className="w-full">
        {currentData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentData}
              layout="vertical"
              margin={{ top: 5, right: isMobile ? 40 : 60, left: isMobile ? 0 : 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                domain={[0, xDomainMax]}
                tick={{ fontSize: 13, fill: '#475569', fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 13, fill: '#0f172a', fontWeight: 700 }}
                tickFormatter={(val: string) => isMobile && val.length > 13 ? `${val.slice(0, 12)}…` : val}
                width={isMobile ? 120 : 185}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0]?.payload as { total: number; sub?: string; unit?: string };
                  const count = item?.total || 0;

                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-md">
                      <p className="font-bold text-slate-900 text-sm">
                        {item?.unit ? `${item.unit} (${item.sub})` : label}: <span className="text-red-600 font-black">{count} kasus</span>
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="total" radius={[0, 5, 5, 0]} barSize={20}>
                {currentData.map((entry, idx) => (
                  <Cell
                    key={`cell-daisha-${idx}`}
                    fill={idx === 0 ? CHART.main : CHART.muted}
                  />
                ))}
                <LabelList
                  dataKey="total"
                  position="right"
                  fill="#0f172a"
                  fontSize={13}
                  fontWeight={800}
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
