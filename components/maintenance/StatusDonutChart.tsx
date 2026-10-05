'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieIcon, Filter } from 'lucide-react';

interface BreakdownItem {
  total: number;
  maintained: number;
  unmaintained: number;
  percentage: number;
  dailyTarget: number;
  todayActual: number;
}

interface StatusDonutChartProps {
  summary: {
    totalUnits: number;
    maintainedUnits: number;
    unmaintainedUnits: number;
    percentage: number;
  };
  breakdown: Record<string, BreakdownItem>;
  currentYear: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { color: string };
  }>;
  total?: number;
}

function CustomTooltip({ active, payload, total = 0 }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percent = total > 0 ? Math.round((data.value / total) * 100) : 0;
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="font-semibold">{data.name}</span>
        </div>
        <div className="font-mono text-slate-300">
          {data.value} Unit ({percent}%)
        </div>
      </div>
    );
  }
  return null;
}

export default function StatusDonutChart({
  summary,
  breakdown,
  currentYear,
}: StatusDonutChartProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  let currentTotal = summary.totalUnits;
  let currentMaintained = summary.maintainedUnits;
  let currentUnmaintained = summary.unmaintainedUnits;
  let currentPercentage = summary.percentage;

  if (selectedFilter !== 'ALL' && breakdown[selectedFilter]) {
    const item = breakdown[selectedFilter];
    currentTotal = item.total;
    currentMaintained = item.maintained;
    currentUnmaintained = item.unmaintained;
    currentPercentage = item.percentage;
  }

  const chartData = [
    { name: 'Sudah Maintenance', value: currentMaintained, color: '#10b981' },
    { name: 'Belum Maintenance', value: currentUnmaintained, color: '#ef4444' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-2xs space-y-4 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Persentase Status Keseluruhan ({currentYear})
            </h3>
            <p className="text-xs text-slate-500">
              Perbandingan armada Sudah vs Belum dimaintenance
            </p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
          >
            <option value="ALL">Semua Armada ({summary.totalUnits})</option>
            <option value="VERTICAL_SMALL">Vertical Small (200)</option>
            <option value="VERTICAL_MEDIUM">Vertical Medium (200)</option>
            <option value="VERTICAL_LARGE">Vertical Large (200)</option>
            <option value="NAGARA_FILTER">Nagara Filter (50)</option>
          </select>
        </div>
      </div>

      {/* Donut Chart with Centered KPI */}
      <div className="relative h-56 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip total={currentTotal} />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {currentPercentage}%
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            Selesai
          </span>
        </div>
      </div>

      {/* Legend & Stat Details */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-lg p-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Sudah Maintenance</span>
          </div>
          <p className="mt-1 text-base font-black text-emerald-700 font-mono">
            {currentMaintained} <span className="text-xs font-normal text-emerald-600">Unit</span>
          </p>
        </div>

        <div className="bg-red-50/70 border border-red-200/60 rounded-lg p-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-red-800">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Belum Disentuh</span>
          </div>
          <p className="mt-1 text-base font-black text-red-700 font-mono">
            {currentUnmaintained} <span className="text-xs font-normal text-red-600">Unit</span>
          </p>
        </div>
      </div>
    </div>
  );
}
