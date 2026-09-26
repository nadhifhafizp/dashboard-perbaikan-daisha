'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { SectionFleetSummary } from '@/hooks/useFleetAnalytics';
import { BarChart3, PieChart as PieIcon, X } from 'lucide-react';

interface SectionFleetChartsProps {
  sectionSummaries: SectionFleetSummary[];
  selectedSeksi: string;
  onSelectSeksi: (seksi: string) => void;
  totalFleetUnits: number;
  healthyUnits: number;
  dueSoonUnits: number;
  overdueUnits: number;
  dormantUnits: number;
  inWorkshopUnits: number;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

const SECTION_COLORS: Record<string, string> = {
  'Building': '#dc2626',
  'Cutt/Cal': '#0891b2',
  'Banbury': '#059669',
  'Extruding': '#78716c',
  'Bead': '#d97706',
  'Poly Film': '#94a3b8',
  'All seksi': '#6366f1',
};

export default function SectionFleetCharts({
  sectionSummaries,
  selectedSeksi,
  onSelectSeksi,
  totalFleetUnits,
  healthyUnits,
  dueSoonUnits,
  overdueUnits,
  dormantUnits,
  inWorkshopUnits,
  activeFilter,
  onSelectFilter,
}: SectionFleetChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const barData = useMemo(() => {
    return sectionSummaries
      .filter((s) => s.totalUnits > 0)
      .sort((a, b) => b.totalUnits - a.totalUnits)
      .map((s) => {
        const color = SECTION_COLORS[s.seksi] || '#64748b';
        const persen = totalFleetUnits > 0 ? ((s.totalUnits / totalFleetUnits) * 100).toFixed(1) : '0';
        return {
          seksi: s.seksi,
          totalUnits: s.totalUnits,
          color,
          persen,
        };
      });
  }, [sectionSummaries, totalFleetUnits]);

  const statusDonutData = useMemo(() => {
    return [
      {
        id: 'HEALTHY',
        label: 'Terawat',
        count: healthyUnits,
        color: '#10b981',
      },
      {
        id: 'DUE_SOON',
        label: 'Mendekati',
        count: dueSoonUnits,
        color: '#f59e0b',
      },
      {
        id: 'OVERDUE',
        label: 'Overdue',
        count: overdueUnits,
        color: '#ef4444',
      },
      {
        id: 'IN_WORKSHOP',
        label: 'Di Bengkel',
        count: inWorkshopUnits,
        color: '#3b82f6',
      },
      {
        id: 'DORMANT',
        label: 'Belum Servis',
        count: dormantUnits,
        color: '#94a3b8',
      },
    ].filter((item) => item.count > 0);
  }, [healthyUnits, dueSoonUnits, overdueUnits, inWorkshopUnits, dormantUnits]);

  // Tooltip Bar
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs rounded px-2.5 py-1.5 shadow-lg border border-slate-700">
          <p className="font-semibold">Seksi {data.seksi}</p>
          <p className="font-mono text-amber-300">
            {data.totalUnits.toLocaleString('id-ID')} Unit ({data.persen}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Tooltip Donut
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalFleetUnits > 0 ? ((data.count / totalFleetUnits) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900 text-white text-xs rounded px-2.5 py-1.5 shadow-lg border border-slate-700">
          <p className="font-semibold">{data.label}</p>
          <p className="font-mono text-amber-300">
            {data.count.toLocaleString('id-ID')} Unit ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const hasActiveFilters = Boolean(selectedSeksi || (activeFilter && activeFilter !== 'ALL'));

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-3">
      {/* Top bar with active filter reset */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Grafik Sebaran & Status
        </h2>

        {hasActiveFilters && (
          <div className="flex items-center gap-1.5">
            {selectedSeksi && (
              <button
                type="button"
                onClick={() => onSelectSeksi('')}
                className="h-6 px-2 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition flex items-center gap-1 cursor-pointer"
              >
                <span>{selectedSeksi}</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {activeFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => onSelectFilter('ALL')}
                className="h-6 px-2 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition flex items-center gap-1 cursor-pointer"
              >
                <span>Status: {activeFilter}</span>
                <X className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onSelectSeksi('');
                onSelectFilter('ALL');
              }}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline ml-1 cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Two Columns: Bar Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50/60 p-3.5 rounded-lg border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Populasi per Seksi</span>
            </span>
            <span className="text-[11px] text-slate-400">Klik bar untuk menyaring</span>
          </div>

          <div className="h-56 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="seksi"
                    type="category"
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
                  <Bar
                    dataKey="totalUnits"
                    radius={[0, 3, 3, 0]}
                    cursor="pointer"
                    onClick={(entry: any) => {
                      const s = entry?.seksi || entry?.payload?.seksi;
                      if (s) onSelectSeksi(selectedSeksi === s ? '' : s);
                    }}
                  >
                    {barData.map((entry) => {
                      const isSelected = selectedSeksi.toLowerCase() === entry.seksi.toLowerCase();
                      const isAnySelected = Boolean(selectedSeksi);
                      return (
                        <Cell
                          key={`cell-${entry.seksi}`}
                          fill={entry.color}
                          opacity={isAnySelected ? (isSelected ? 1 : 0.3) : 0.88}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Right: Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/60 p-3.5 rounded-lg border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Status Pemeliharaan</span>
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="relative w-36 h-36 shrink-0">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDonutData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      cursor="pointer"
                      onClick={(entry: any) => {
                        const targetId = entry?.id || entry?.payload?.id;
                        if (targetId) {
                          const next = activeFilter === targetId ? 'ALL' : targetId;
                          onSelectFilter(next);
                        }
                      }}
                    >
                      {statusDonutData.map((entry) => {
                        const isSelected = activeFilter === entry.id;
                        const isAnySelected = activeFilter !== 'ALL';
                        return (
                          <Cell
                            key={`donut-${entry.id}`}
                            fill={entry.color}
                            opacity={isAnySelected ? (isSelected ? 1 : 0.35) : 1}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black font-mono text-slate-900 leading-tight">
                  {totalFleetUnits.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase">Unit</span>
              </div>
            </div>

            {/* Compact Legend */}
            <div className="space-y-1 text-xs flex-1 min-w-0">
              {statusDonutData.map((item) => {
                const isSelected = activeFilter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectFilter(isSelected ? 'ALL' : item.id)}
                    className={`w-full flex items-center justify-between gap-2 px-2 py-1 rounded transition text-left cursor-pointer ${
                      isSelected ? 'bg-white shadow-2xs ring-1 ring-slate-300 font-bold' : 'hover:bg-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-slate-700 text-xs">{item.label}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-xs shrink-0">
                      {item.count.toLocaleString('id-ID')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
