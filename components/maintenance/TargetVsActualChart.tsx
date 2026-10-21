'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

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
            <span className="text-xs text-amber-300 font-semibold bg-amber-900/50 px-1.5 py-0.5 rounded">
              Akhir Pekan
            </span>
          ) : isAchieved ? (
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded">
              Tercapai
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-semibold bg-slate-800 px-1.5 py-0.5 rounded">
              {actualVal} / {targetVal} unit
            </span>
          )}
        </div>

        <div className="space-y-1 pt-1 tabular-nums">
          <div className="flex items-center justify-between text-slate-300">
            <span>Target Harian:</span>
            <span className="font-bold font-mono">{targetVal} unit</span>
          </div>

          <div className="flex items-center justify-between text-emerald-400">
            <span>Realisasi Pengerjaan:</span>
            <span className="font-bold font-mono">{actualVal} unit</span>
          </div>

          <div className="pl-3 text-xs text-slate-400 space-y-0.5 border-t border-slate-800 pt-1">
            <div className="flex justify-between">
              <span>- Maintenance Rutin:</span>
              <span className="text-emerald-300 font-semibold font-mono">{pData.rutin} unit</span>
            </div>
            <div className="flex justify-between">
              <span>- Repair / Perbaikan:</span>
              <span className="text-sky-300 font-semibold font-mono">{pData.repair} unit</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function TargetVsActualChart({ data, dailyTarget }: TargetVsActualChartProps) {
  const totalActualInPeriod = (data || []).reduce((acc, curr) => acc + (curr.actual || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-2xs space-y-3.5 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Tren Realisasi vs Target Harian
            </h2>
            <p className="text-xs text-slate-500">
              Perbandingan output pengerjaan harian terhadap kuota harian pabrik
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 tabular-nums font-mono">
            Target: {dailyTarget} unit/hari
          </span>
          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Rutin</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
            <span>Repair</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-60 sm:h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="dateLabel"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Target Reference Line: Standard industrial engineering display */}
            {dailyTarget > 0 && (
              <ReferenceLine
                y={dailyTarget}
                stroke="#dc2626"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Target (${dailyTarget})`,
                  position: 'top',
                  fill: '#dc2626',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Actual Bars */}
            <Bar
              dataKey="rutin"
              name="Maintenance Rutin"
              fill="#10b981"
              stackId="actual"
              radius={[0, 0, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="repair"
              name="Repair Selesai"
              fill="#0284c7"
              stackId="actual"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Garis putus-putus merah menandakan kuota target harian ({dailyTarget} unit).</span>
        <span className="font-semibold text-slate-700 tabular-nums">
          Total Terpelihara Periode: {totalActualInPeriod} Unit
        </span>
      </div>
    </div>
  );
}
