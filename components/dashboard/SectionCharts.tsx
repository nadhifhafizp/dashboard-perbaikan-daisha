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
  '#ef4444', // Red
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
    payload?: { name: string; value: number; payload: { seksi: string; total: number; persen: number; color: string } }[];
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const data = item.payload;
      return (
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-md">
          <p className="font-extrabold" style={{ color: data.color }}>
            Seksi: {data.seksi}
          </p>
          <p className="text-slate-800 font-semibold mt-0.5">
            <strong>{data.total}</strong> Unit ({data.persen}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-full justify-between">
      {/* 1. Header Minimalis */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>DISTRIBUSI DAISHA PER SEKSI</span>
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {selectedSeksi && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-xl text-xs font-extrabold text-red-700">
              <Filter className="w-3 h-3" />
              <span>{selectedSeksi}</span>
              {onSelectSeksi && (
                <button
                  type="button"
                  onClick={() => onSelectSeksi('')}
                  className="hover:bg-red-200 p-0.5 rounded-full transition cursor-pointer"
                  title="Hapus filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Dropdown Filter Periode */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Pilih Periode Bulan Rekapitulasi"
              className="bg-transparent text-slate-800 font-bold focus:outline-hidden cursor-pointer"
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
                </PieChart>
              </ResponsiveContainer>

              {/* Total Unit di Tengah Donat (Besar & Mantap) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-900 leading-none tracking-tight">
                  {totalSeksiAll}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                  Total Unit
                </span>
              </div>
            </div>

            {/* Legenda Simpel Bersih (Inline) */}
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-5 max-w-full">
              {seksiDonutData.map((entry) => {
                const isSelected = selectedSeksi === entry.seksi;
                return (
                  <button
                    key={entry.seksi}
                    type="button"
                    onClick={() => {
                      if (onSelectSeksi) {
                        onSelectSeksi(selectedSeksi === entry.seksi ? '' : entry.seksi);
                      }
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-100 text-blue-900 font-extrabold ring-1 ring-blue-400'
                        : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 font-medium'
                    }`}
                    title={`Klik untuk filter seksi ${entry.seksi}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-semibold text-slate-800">{entry.seksi}</span>
                    <span className="font-extrabold text-slate-900">{entry.total} unit</span>
                    <span className="text-[11px] text-slate-400">({entry.persen}%)</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400">
            Belum ada data daisha per seksi
          </div>
        )}
      </div>
    </div>
  );
}
