'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Layers } from 'lucide-react';

export interface SeksiSummaryItem {
  seksi: string;
  total: number;
  maintained: number;
  unmaintained: number;
  rusak: number;
}

interface SectionPopulationChartProps {
  data: SeksiSummaryItem[];
  totalUnits: number;
  selectedSeksi?: string;
  onSelectSeksi?: (seksi: string) => void;
}

export default function SectionPopulationChart({
  data,
  totalUnits,
  selectedSeksi = 'ALL',
  onSelectSeksi,
}: SectionPopulationChartProps) {
  const chartData = (data || [])
    .filter((d) => d.total > 0 && d.seksi !== 'Unknown')
    .sort((a, b) => b.total - a.total);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4.5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Populasi Armada per Seksi</h2>
            <p className="text-xs text-slate-500">
              Distribusi total unit daisha yang tersebar di area operasional pabrik
            </p>
          </div>
        </div>

        {selectedSeksi !== 'ALL' && onSelectSeksi && (
          <button
            type="button"
            onClick={() => onSelectSeksi('ALL')}
            className="text-xs font-semibold text-red-600 hover:text-red-700 underline cursor-pointer"
          >
            Tampilkan Semua
          </button>
        )}
      </div>

      <div className="h-60 sm:h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="seksi"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
              width={75}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as SeksiSummaryItem;
                  const pct = totalUnits > 0 ? Math.round((d.total / totalUnits) * 100) : 0;
                  const pmPct = d.total > 0 ? Math.round((d.maintained / d.total) * 100) : 0;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                      <div className="font-bold text-slate-100">{d.seksi}</div>
                      <div className="text-slate-300 tabular-nums">
                        Total Armada: {d.total.toLocaleString('id-ID')} unit ({pct}%)
                      </div>
                      <div className="text-emerald-400 tabular-nums text-xs">
                        Sudah PM: {d.maintained.toLocaleString('id-ID')} unit ({pmPct}%)
                      </div>
                      {d.rusak > 0 && (
                        <div className="text-red-400 tabular-nums text-xs">
                          Kondisi Rusak: {d.rusak} unit
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="total"
              radius={[0, 4, 4, 0]}
              maxBarSize={20}
              cursor="pointer"
              onClick={(entry: any) => onSelectSeksi && onSelectSeksi(entry?.seksi || '')}
            >
              {chartData.map((entry, index) => {
                const isPrimary = index === 0;
                const isSelected = selectedSeksi === entry.seksi;
                const fill = isSelected || (selectedSeksi === 'ALL' && isPrimary) ? '#dc2626' : '#64748b';
                return (
                  <Cell
                    key={entry.seksi}
                    fill={fill}
                    opacity={selectedSeksi === 'ALL' || selectedSeksi === entry.seksi ? 1 : 0.4}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
        <span className="text-slate-500">Klik bar untuk memfilter armada berdasarkan seksi.</span>
        <span className="font-semibold text-slate-700">
          Total Terdaftar: {totalUnits.toLocaleString('id-ID')} Unit
        </span>
      </div>
    </div>
  );
}
