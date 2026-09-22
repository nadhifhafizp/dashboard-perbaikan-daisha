'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Wrench, PieChart as PieIcon, RefreshCw, Hammer } from 'lucide-react';

interface DamageChartsProps {
  chartKategori: { kategori: string; total: number; totalPcs?: number }[];
  chartDetailGejala: { gejala: string; total: number; totalPcs?: number; komponen?: string }[];
  tindakanStats?: {
    repairCount: number;
    gantiCount: number;
    total: number;
    repairPcs?: number;
    gantiPcs?: number;
    totalPcs?: number;
  };
  sparepartKebutuhan?: {
    nama: string;
    gejala: string;
    gantiPcs: number;
    repairPcs: number;
    totalPcs: number;
  }[];
  sparepartKebutuhanSemua?: {
    nama: string;
    gejala: string;
    gantiPcs: number;
    repairPcs: number;
    totalPcs: number;
  }[];
}

export default function DamageCharts({
  chartKategori,
  chartDetailGejala,
  tindakanStats,
}: DamageChartsProps) {
  const [metricMode, setMetricMode] = useState<'kasus' | 'pcs'>('kasus');


  const dataKategori = chartKategori.map((item) => ({
    ...item,
    displayVal: metricMode === 'pcs' ? (item.totalPcs || item.total) : item.total,
  }));

  const dataGejala = chartDetailGejala.slice(0, 10).map((item) => ({
    ...item,
    displayVal: metricMode === 'pcs' ? (item.totalPcs || item.total) : item.total,
  }));

  const repairVal = metricMode === 'pcs' ? (tindakanStats?.repairPcs || tindakanStats?.repairCount || 0) : (tindakanStats?.repairCount || 0);
  const gantiVal = metricMode === 'pcs' ? (tindakanStats?.gantiPcs || tindakanStats?.gantiCount || 0) : (tindakanStats?.gantiCount || 0);
  const totalTindakan = repairVal + gantiVal;

  // Selaras dengan badge RiwayatTicketCard: Ganti Baru = Blue (#2563eb), Repair Fisik = Amber (#f59e0b)
  const tindakanDonutData = [
    { name: 'Ganti Sparepart Baru', value: gantiVal, color: '#2563eb', sub: 'Penggantian suku cadang baru' },
    { name: 'Repair / Servis Fisik', value: repairVal, color: '#f59e0b', sub: 'Perbaikan tanpa ganti part' },
  ].filter((d) => d.value > 0);

  const TindakanTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string; sub: string } }[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = totalTindakan > 0 ? Math.round((item.value / totalTindakan) * 100) : 0;
      return (
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-md">
          <p className="font-extrabold" style={{ color: item.payload.color }}>{item.name}</p>
          <p className="text-slate-500 text-xs">{item.payload.sub}</p>
          <p className="text-slate-800 font-bold mt-1">
            {item.value} {metricMode === 'pcs' ? 'pcs' : 'tindakan'} ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Hitung tinggi eksplisit agar setiap baris memiliki ruang vertikal yang cukup (38-42px per bar)
  const heightKategori = Math.max(380, dataKategori.length * 38 + 40);
  const heightGejala = Math.max(380, dataGejala.length * 40 + 40);

  const maxKategori = dataKategori.length > 0 ? Math.max(...dataKategori.map((d) => d.displayVal)) : 1;
  const maxGejala = dataGejala.length > 0 ? Math.max(...dataGejala.map((d) => d.displayVal)) : 1;

  // Formatter sumbu Y agar teks panjang tidak menabrak teks baris lain
  const formatGejala = (val: string) => {
    if (!val) return '';
    return val.length > 25 ? `${val.slice(0, 24)}…` : val;
  };

  const formatKategori = (val: string) => {
    if (!val) return '';
    return val.length > 22 ? `${val.slice(0, 21)}…` : val;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Ringkas & Metric Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-700" />
            <span>Analisis Kerusakan Komponen & Tindakan Bengkel</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Komponen paling sering rusak, detail gejala dominan, serta proporsi tindakan perbaikan vs penggantian part
          </p>
        </div>

        {/* Toggle Kasus vs Pcs */}
        <div className="flex items-center p-0.5 bg-slate-100/90 rounded-lg text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setMetricMode('kasus')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              metricMode === 'kasus'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Frekuensi Kejadian</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('pcs')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              metricMode === 'pcs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Kuantitas Part (Pcs)</span>
          </button>
        </div>
      </div>

      {/* 2. Grid Visual: 2 Batang Horizontal (Atas) Memberikan Ruang Lega bagi Label Teks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= A. BATANG HORIZONTAL: KOMPONEN PALING SERING RUSAK ================= */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1.5">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span>Komponen Paling Sering Rusak</span>
              </h4>
              <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                {metricMode === 'pcs' ? 'Kuantitas (Pcs)' : 'Frekuensi (Kasus)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Peringkat komponen troli yang paling banyak membutuhkan perbaikan
            </p>

            {/* Legenda Makna Warna & Simbol */}
            <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 mb-2">
              <span className="font-semibold text-slate-900">Makna Warna:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0F172A] opacity-35 inline-block" />
                <span className="text-slate-500">Jarang Aus</span>
                <span className="text-slate-300 font-bold">──▶</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0F172A] inline-block shadow-2xs" />
                <span className="font-bold text-slate-900">Kritis Aus ({maxKategori} {metricMode === 'pcs' ? 'pcs' : 'x'})</span>
              </div>
            </div>
          </div>

          <div style={{ height: heightKategori }} className="w-full">
            {dataKategori.length > 0 ? (
              <ResponsiveContainer width="100%" height={heightKategori}>
                <BarChart data={dataKategori} layout="vertical" margin={{ top: 10, right: 45, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="kategori"
                    type="category"
                    interval={0}
                    width={150}
                    tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }}
                    tickFormatter={formatKategori}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0]?.payload as { displayVal: number; totalPcs?: number; total?: number };
                      const val = item?.displayVal || 0;
                      const ratio = maxKategori > 0 ? val / maxKategori : 1;
                      const statusTag =
                        ratio >= 0.75
                          ? { label: '🔴 Kritis (Prioritas Stok & Penggantian)', cls: 'text-slate-900 bg-slate-100 border-slate-300' }
                          : ratio >= 0.4
                          ? { label: '🟡 Keausan Menengah', cls: 'text-amber-800 bg-amber-50 border-amber-200' }
                          : { label: '🟢 Keausan Rendah / Sporadis', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' };

                      return (
                        <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-lg space-y-1.5 min-w-[200px]">
                          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                            Komponen: {label}
                          </p>
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-slate-500">Total Volume:</span>
                            <span className="text-slate-950 font-extrabold text-sm">
                              {val} {metricMode === 'pcs' ? 'pcs part' : 'kali kejadian'}
                            </span>
                          </div>
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusTag.cls}`}>
                            {statusTag.label}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="displayVal" radius={[0, 4, 4, 0]} barSize={16}>
                    {dataKategori.map((entry, idx) => {
                      const ratio = maxKategori > 0 ? entry.displayVal / maxKategori : 1;
                      // Gradien intensitas data-driven charcoal
                      const opacity = Math.max(0.32, 0.32 + 0.68 * ratio);
                      return (
                        <Cell
                          key={`cell-kat-${idx}`}
                          fill="#0F172A"
                          fillOpacity={opacity}
                        />
                      );
                    })}
                    <LabelList dataKey="displayVal" position="right" fill="#0f172a" fontSize={12} fontWeight={800} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Belum ada data komponen
              </div>
            )}
          </div>
        </div>

        {/* ================= B. BATANG HORIZONTAL: TOP GEJALA MASALAH ================= */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1.5">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span>Top Gejala Kerusakan</span>
              </h4>
              <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                Top 10 Gejala
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Gejala kerusakan fisik daisha yang paling sering ditemukan di lapangan
            </p>

            {/* Legenda Makna Warna & Simbol */}
            <div className="flex items-center gap-2 text-[11px] text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 mb-2">
              <span className="font-semibold text-amber-950">Makna Warna:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#D97706] opacity-35 inline-block" />
                <span className="text-amber-800">Sporadis</span>
                <span className="text-amber-400 font-bold">──▶</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-[#D97706] inline-block shadow-2xs" />
                <span className="font-bold text-amber-950">Gejala Dominan ({maxGejala} {metricMode === 'pcs' ? 'pcs' : 'x'})</span>
              </div>
            </div>
          </div>

          <div style={{ height: heightGejala }} className="w-full">
            {dataGejala.length > 0 ? (
              <ResponsiveContainer width="100%" height={heightGejala}>
                <BarChart data={dataGejala} layout="vertical" margin={{ top: 10, right: 45, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="gejala"
                    type="category"
                    interval={0}
                    width={180}
                    tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }}
                    tickFormatter={formatGejala}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0]?.payload as { displayVal: number; gejala?: string };
                      const val = item?.displayVal || 0;
                      const ratio = maxGejala > 0 ? val / maxGejala : 1;
                      const statusTag =
                        ratio >= 0.75
                          ? { label: '⚠️ Gejala Dominan (Fokus Utama Bengkel)', cls: 'text-amber-950 bg-amber-100 border-amber-300' }
                          : ratio >= 0.4
                          ? { label: '🟡 Kejadian Menengah', cls: 'text-amber-800 bg-amber-50 border-amber-200' }
                          : { label: '🟢 Kejadian Sporadis', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' };

                      return (
                        <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-lg space-y-1.5 min-w-[200px]">
                          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                            Gejala: {label}
                          </p>
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-slate-500">Frekuensi:</span>
                            <span className="text-amber-700 font-extrabold text-sm">
                              {val} {metricMode === 'pcs' ? 'pcs part' : 'kejadian'}
                            </span>
                          </div>
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusTag.cls}`}>
                            {statusTag.label}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="displayVal" radius={[0, 4, 4, 0]} barSize={16}>
                    {dataGejala.map((entry, idx) => {
                      const ratio = maxGejala > 0 ? entry.displayVal / maxGejala : 1;
                      // Gradien intensitas data-driven amber
                      const opacity = Math.max(0.35, 0.35 + 0.65 * ratio);
                      return (
                        <Cell
                          key={`cell-gejala-${idx}`}
                          fill="#D97706"
                          fillOpacity={opacity}
                        />
                      );
                    })}
                    <LabelList dataKey="displayVal" position="right" fill="#0f172a" fontSize={12} fontWeight={800} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Belum ada data gejala
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= C. DIAGRAM DONAT: PROPORSI TINDAKAN BENGKEL ================= */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-slate-600" />
              <span>Proporsi Tindakan Bengkel: Servis Fisik vs Ganti Sparepart</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Perbandingan unit yang ditangani via perbaikan fisik tanpa ganti part vs unit yang membutuhkan penggantian suku cadang baru
            </p>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
            {metricMode === 'pcs' ? 'Kuantitas Part (Pcs)' : 'Frekuensi Kasus'}
          </span>
        </div>

        {totalTindakan > 0 ? (
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
            {/* Diagram Donat */}
            <div className="relative h-48 w-48 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tindakanDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {tindakanDonutData.map((entry, index) => (
                      <Cell key={`cell-tindakan-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<TindakanTooltip />} />
                  <text
                    x="50%"
                    y="47%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-900 font-extrabold text-2xl"
                  >
                    {totalTindakan}
                  </text>
                  <text
                    x="50%"
                    y="61%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-500 font-medium text-xs"
                  >
                    {metricMode === 'pcs' ? 'Total Pcs' : 'Tindakan'}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Rincian Kartu Tindakan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full max-w-xl">
              {tindakanDonutData.map((item) => {
                const pct = totalTindakan > 0 ? Math.round((item.value / totalTindakan) * 100) : 0;
                const isGanti = item.name.includes('Ganti');
                return (
                  <div
                    key={item.name}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                      isGanti
                        ? 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/60'
                        : 'bg-amber-50/40 border-amber-100 hover:bg-amber-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isGanti ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isGanti ? (
                              <RefreshCw className="w-4 h-4" />
                            ) : (
                              <Hammer className="w-4 h-4" />
                            )}
                          </div>
                          <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isGanti
                              ? 'bg-blue-100/80 text-blue-800 border-blue-200'
                              : 'bg-amber-100/80 text-amber-800 border-amber-200'
                          }`}
                        >
                          {isGanti ? 'Logistik Part' : 'Mekanik Servis'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{item.sub}</p>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-xl font-black text-slate-900">
                        {item.value}{' '}
                        <span className="text-xs font-semibold text-slate-500">
                          {metricMode === 'pcs' ? 'pcs part' : 'tindakan'}
                        </span>
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-md border shadow-2xs ${
                          isGanti
                            ? 'bg-white text-blue-700 border-blue-200'
                            : 'bg-white text-amber-700 border-amber-200'
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-xs text-slate-500">
            Belum ada data tindakan
          </div>
        )}
      </div>
    </div>
  );
}
