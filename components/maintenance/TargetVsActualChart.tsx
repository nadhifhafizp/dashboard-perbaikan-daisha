'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Info } from 'lucide-react';

interface DailyTrendItem {
  date: string;
  dateLabel: string;
  isWeekend: boolean;
  target: number;
  actual: number;
  rutin: number;
  repair: number;
}

interface TargetVsActualChartProps {
  data: DailyTrendItem[];
  dailyTarget: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailyTrendItem }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const pData = payload[0].payload;
    const targetVal = pData.target;
    const actualVal = pData.actual;
    const isAchieved = actualVal >= targetVal && targetVal > 0;

    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between pb-1 border-b border-slate-700">
          <span className="font-bold">{pData.dateLabel}</span>
          {pData.isWeekend ? (
            <span className="text-[10px] text-amber-300 font-semibold bg-amber-900/50 px-1.5 py-0.5 rounded">
              Akhir Pekan
            </span>
          ) : isAchieved ? (
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded">
              Tercapai
            </span>
          ) : (
            <span className="text-[10px] text-red-400 font-semibold bg-red-950/60 px-1.5 py-0.5 rounded">
              Belum Tercapai
            </span>
          )}
        </div>

        <div className="space-y-1 pt-1 font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Target Harian:
            </span>
            <span className="font-bold">{targetVal} unit</span>
          </div>

          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Aktual Total:
            </span>
            <span className="font-bold">{actualVal} unit</span>
          </div>

          <div className="pl-3.5 text-[11px] text-slate-400 space-y-0.5 border-t border-slate-800 pt-1">
            <div className="flex justify-between">
              <span>- Maintenance Rutin:</span>
              <span className="text-emerald-300 font-semibold">{pData.rutin} unit</span>
            </div>
            <div className="flex justify-between">
              <span>- Perbaikan (Repair):</span>
              <span className="text-sky-300 font-semibold">{pData.repair} unit</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function TargetVsActualChart({ data, dailyTarget }: TargetVsActualChartProps) {

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pencapaian Target vs Aktual Harian
            </h3>
            <p className="text-xs text-slate-500">
              Tren komparasi pengerjaan Daisha 14 hari terakhir (Target: {dailyTarget} unit/hari kerja)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-300 border border-slate-400" />
            <span className="text-slate-600 font-medium">Target Harian</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-slate-600 font-medium">Rutin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky-500" />
            <span className="text-slate-600 font-medium">Repair (Terkonversi)</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="dateLabel"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Target Harian Bar */}
            <Bar
              dataKey="target"
              name="Target Harian"
              fill="#cbd5e1"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
            {/* Stacked Bars for Actual (Rutin + Repair) */}
            <Bar
              dataKey="rutin"
              name="Maintenance Rutin"
              fill="#10b981"
              stackId="actual"
              radius={[0, 0, 0, 0]}
              maxBarSize={20}
            />
            <Bar
              dataKey="repair"
              name="Repair Selesai"
              fill="#0284c7"
              stackId="actual"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Setiap perbaikan (repair) yang selesai otomatis menambah progress aktual maintenance tahun berjalan.</span>
        </div>
      </div>
    </div>
  );
}
