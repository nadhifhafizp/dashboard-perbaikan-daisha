'use client';

import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, Building2, Filter, X } from 'lucide-react';
import type { SeksiJenisBreakdown } from '@/hooks/useDashboardAnalytics';

interface SectionChartsProps {
  chartSeksiStacked: {
    seksi: string;
    Open: number;
    Progress: number;
    Done: number;
    Scrap: number;
    Total: number;
    totalPcs?: number;
  }[];
  seksiJenisMonthly?: Record<string, SeksiJenisBreakdown[]>;
  seksiJenisAll?: SeksiJenisBreakdown[];
  availableMonths?: { key: string; label: string }[];
  chartPelapor?: { pelapor: string; seksi: string; total: number }[];
  onSelectSeksi?: (seksi: string) => void;
  selectedSeksi?: string;
}

const SEKSI_COLORS = [
  '#2563eb', // Royal Blue
  '#0d9488', // Teal
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#E60012', // Bridgestone Red
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#f97316', // Orange
  '#64748b', // Slate
];

export default function SectionCharts({
  chartSeksiStacked,
  seksiJenisMonthly = {},
  seksiJenisAll = [],
  availableMonths = [],
  onSelectSeksi,
  selectedSeksi = '',
}: SectionChartsProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const activeSeksiList = useMemo(() => {
    let list: { seksi: string; total: number; totalPcs: number; jenisList?: { jenis: string; count: number }[] }[] = [];
    
    if (selectedMonth === 'all') {
      if (seksiJenisAll.length > 0) {
        list = seksiJenisAll.map((s) => ({
          seksi: s.seksi,
          total: s.total,
          totalPcs: s.totalPcs || s.total,
          jenisList: s.jenisList,
        }));
      } else {
        list = chartSeksiStacked.map((s) => ({
          seksi: s.seksi,
          total: s.Total,
          totalPcs: s.totalPcs || s.Total,
          jenisList: [],
        }));
      }
    } else {
      const monthly = seksiJenisMonthly[selectedMonth] || [];
      list = monthly.map((s) => ({
        seksi: s.seksi,
        total: s.total,
        totalPcs: s.totalPcs || s.total,
        jenisList: s.jenisList,
      }));
    }

    return [...list].sort((a, b) => b.total - a.total);
  }, [selectedMonth, seksiJenisAll, seksiJenisMonthly, chartSeksiStacked]);

  const totalSeksiAll = useMemo(() => {
    return activeSeksiList.reduce((acc, curr) => acc + curr.total, 0);
  }, [activeSeksiList]);

  const seksiDonutData = useMemo(() => {
    return activeSeksiList.map((s, idx) => ({
      ...s,
      color: SEKSI_COLORS[idx % SEKSI_COLORS.length],
      persen: totalSeksiAll > 0 ? Math.round((s.total / totalSeksiAll) * 100) : 0,
    }));
  }, [activeSeksiList, totalSeksiAll]);

  const SectionDonutTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { name: string; value: number; payload: { seksi: string; total: number; persen: number; color: string; jenisList?: { jenis: string; count: number }[] } }[];
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const data = item.payload;
      return (
        <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs shadow-md space-y-1.5 max-w-xs">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1">
            <p className="font-extrabold text-sm" style={{ color: data.color }}>
              Seksi: {data.seksi}
            </p>
            <span className="font-bold text-slate-800 tabular-nums">
              {data.total} Unit ({data.persen}%)
            </span>
          </div>
          {data.jenisList && data.jenisList.length > 0 && (
            <div className="pt-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Model Daisha Sering Masuk:
              </span>
              <div className="space-y-0.5">
                {data.jenisList.slice(0, 3).map((j) => (
                  <div key={j.jenis} className="flex justify-between items-center text-[11px] text-slate-700">
                    <span className="truncate pr-2">• {j.jenis}</span>
                    <span className="font-bold tabular-nums">{j.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col h-full justify-between">
      {/* 1. Header Minimalis */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            <span>Distribusi Asal Daisha per Seksi Pabrik</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Komposisi unit masuk menurut departemen pemakai daisha di plant produksi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedSeksi && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-lg text-xs font-medium text-red-700 border border-red-200">
              <Filter className="w-3 h-3" />
              <span>{selectedSeksi}</span>
              {onSelectSeksi && (
                <button
                  type="button"
                  onClick={() => onSelectSeksi('')}
                  className="hover:bg-red-200/60 p-0.5 rounded transition cursor-pointer focus:outline-none"
                  aria-label={`Hapus filter seksi ${selectedSeksi}`}
                  title="Hapus filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Dropdown Filter Periode */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Pilih Periode Bulan Rekapitulasi"
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Periode</option>
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Diagram Donat Simpel & Bersih */}
      <div className="my-auto py-2">
        {seksiDonutData.length > 0 ? (
          <div className="flex flex-col items-center justify-center">
            {/* Donut Chart Berukuran Besar & Jelas */}
            <div className="relative h-64 w-64 sm:h-72 sm:w-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={seksiDonutData}
                    dataKey="total"
                    nameKey="seksi"
                    cx="50%"
                    cy="50%"
                    innerRadius={74}
                    outerRadius={114}
                    paddingAngle={seksiDonutData.length > 1 ? 3 : 0}
                    startAngle={90}
                    endAngle={-270}
                    cursor="pointer"
                    onClick={(entry: any) => {
                      const seksiName = entry?.seksi || entry?.payload?.seksi;
                      if (onSelectSeksi && seksiName) {
                        onSelectSeksi(selectedSeksi === seksiName ? '' : seksiName);
                      }
                    }}
                  >
                    {seksiDonutData.map((entry) => {
                      const isSelected = selectedSeksi === entry.seksi;
                      const hasSelection = Boolean(selectedSeksi);
                      return (
                        <Cell
                          key={`cell-seksi-${entry.seksi}`}
                          fill={entry.color}
                          opacity={hasSelection && !isSelected ? 0.35 : 1}
                          stroke={isSelected ? '#1e293b' : 'transparent'}
                          strokeWidth={isSelected ? 2.5 : 0}
                          className="hover:opacity-85 transition cursor-pointer"
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<SectionDonutTooltip />} />
                  <text
                    x="50%"
                    y="47%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-900 font-extrabold text-3xl sm:text-4xl"
                  >
                    {totalSeksiAll}
                  </text>
                  <text
                    x="50%"
                    y="61%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-500 font-medium text-xs"
                  >
                    Total Unit
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda Simpel Bersih (Inline) */}
            <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-1.5 mt-5 max-w-full">
              {seksiDonutData.map((entry, idx) => {
                const isSelected = selectedSeksi === entry.seksi;
                const isTop1 = idx === 0 && entry.total > 0;
                return (
                  <button
                    key={entry.seksi}
                    type="button"
                    onClick={() => {
                      if (onSelectSeksi) {
                        onSelectSeksi(selectedSeksi === entry.seksi ? '' : entry.seksi);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-semibold ring-1 ring-blue-300'
                        : 'hover:bg-slate-100 text-slate-600 font-normal'
                    }`}
                    title={`Klik untuk filter seksi ${entry.seksi}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-800 font-medium">{entry.seksi}</span>
                    {isTop1 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-200 rounded">
                        Top
                      </span>
                    )}
                    <span className="text-slate-900 font-semibold tabular-nums">{entry.total} unit</span>
                    <span className="text-slate-400 tabular-nums">({entry.persen}%)</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-slate-500">
            Belum ada data daisha per seksi
          </div>
        )}
      </div>
    </div>
  );
}
