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
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { Building2, RotateCcw, AlertTriangle, Check } from 'lucide-react';
import { BreakdownItem } from './types';
import { CHART } from '@/lib/chart-colors';

interface FleetSeksiBreakdownProps {
  seksiBreakdownList: BreakdownItem[];
  activeBreakdownList: BreakdownItem[];
  isSeksiFiltered: boolean;
  currentSeksi: string;
  targetUnitsCount: number;
  onSelectSeksi: (seksi: string) => void;
}

export default function FleetSeksiBreakdown({
  seksiBreakdownList,
  activeBreakdownList,
  isSeksiFiltered,
  currentSeksi,
  targetUnitsCount,
  onSelectSeksi,
}: FleetSeksiBreakdownProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="t-section text-slate-900 tracking-tight">
                KPI Jumlah Daisha dari Setiap Seksi
              </h3>
              <p className="t-caption text-slate-500">
                Perbandingan total populasi armada, rasio unit OKE (siap pakai) dan NG (dalam perbaikan) per seksi
              </p>
            </div>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
          {seksiBreakdownList.length} Seksi Terdaftar
        </span>
      </div>

      {/* Sub-header info grafik saat filter seksi aktif */}
      {isSeksiFiltered && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-700">
            Menampilkan grafik daisha untuk <strong>Seksi {currentSeksi}</strong> ({targetUnitsCount.toLocaleString('id-ID')} Unit):
          </span>
          <button
            type="button"
            onClick={() => onSelectSeksi('')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            title="Tampilkan grafik semua seksi"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Grafik Semua Seksi</span>
          </button>
        </div>
      )}

      {/* Grafik Komparasi Stacked Bar */}
      <div className="w-full pt-1 pb-2">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeBreakdownList}
              margin={{ top: 25, right: 15, left: -10, bottom: 25 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.grid} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                allowDecimals={false}
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.12)]}
              />
              <Tooltip
                formatter={(val: unknown, name: unknown) => [
                  `${Number(val || 0).toLocaleString('id-ID')} Unit`,
                  String(name || ''),
                ]}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
              />
              <Bar
                dataKey="oke"
                name="OKE (Siap Pakai)"
                stackId="a"
                fill="#059669"
                radius={[3, 3, 0, 0]}
                maxBarSize={30}
                minPointSize={8}
              >
                <LabelList
                  content={(props: { x?: number | string; y?: number | string; width?: number | string; height?: number | string; index?: number }) => {
                    const xNum = Number(props.x || 0);
                    const yNum = Number(props.y || 0);
                    const widthNum = Number(props.width || 0);
                    const heightNum = Number(props.height || 0);
                    const index = props.index ?? 0;
                    const item = activeBreakdownList[index];
                    if (!item || !item.total) return null;
                    const ngHeight = item.oke > 0 && item.ng > 0 ? (heightNum / item.oke) * item.ng : 0;
                    const labelY = yNum - ngHeight - 6;
                    return (
                      <text
                        x={xNum + widthNum / 2}
                        y={labelY}
                        fill="#0f172a"
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={700}
                      >
                        {item.total.toLocaleString('id-ID')}
                      </text>
                    );
                  }}
                />
              </Bar>
              <Bar
                dataKey="ng"
                name="NG (Dalam Perbaikan)"
                stackId="a"
                fill="#dc2626"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
                minPointSize={4}
              >
                <LabelList
                  content={(props: { x?: number | string; y?: number | string; width?: number | string; index?: number }) => {
                    const xNum = Number(props.x || 0);
                    const yNum = Number(props.y || 0);
                    const widthNum = Number(props.width || 0);
                    const index = props.index ?? 0;
                    const item = activeBreakdownList[index];
                    if (!item || !item.total || item.oke > 0) return null;
                    return (
                      <text
                        x={xNum + widthNum / 2}
                        y={yNum - 6}
                        fill="#0f172a"
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={700}
                      >
                        {item.total.toLocaleString('id-ID')}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel Rincian Seksi */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="px-3.5 py-3">Nama Seksi</th>
              <th className="px-3.5 py-3 text-right">Total Daisha</th>
              <th className="px-3.5 py-3 text-right">Jumlah OKE</th>
              <th className="px-3.5 py-3 text-left w-36">Kesiapan OKE (%)</th>
              <th className="px-3.5 py-3 text-right">Jumlah NG</th>
              <th className="px-3.5 py-3 text-center">Status</th>
              <th className="px-3.5 py-3 text-center">Aksi Filter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {seksiBreakdownList.map((row) => {
              const isSelected = currentSeksi.toLowerCase() === (row.seksi || '').toLowerCase();
              return (
                <tr
                  key={row.label}
                  className={`hover:bg-slate-50 transition ${
                    isSelected ? 'bg-red-50/50 font-semibold' : ''
                  }`}
                >
                  <td className="px-3.5 py-2.5 font-bold text-slate-900">
                    Seksi {row.seksi}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-slate-800 tabular-nums">
                    {row.total.toLocaleString('id-ID')} unit
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-semibold text-emerald-700 tabular-nums">
                    {row.oke.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, row.pctOke))}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 font-medium w-9 text-right tabular-nums">
                        {row.pctOke.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-right tabular-nums">
                    {row.ng > 0 ? (
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {row.ng} unit
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-center">
                    {row.ng > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>{row.ng} Di Bengkel</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>100% Siap</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectSeksi(isSelected ? '' : row.seksi || '')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition ${
                        isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected ? 'Batal Filter' : 'Filter Seksi'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
