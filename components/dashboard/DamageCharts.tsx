'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
  sparepartKebutuhan = [],
  sparepartKebutuhanSemua = [],
}: DamageChartsProps) {
  // Mode Tampilan: 'pcs' (Berdasarkan jumlah kuantitas unit komponen) vs 'kasus' (Frekuensi kejadian tiket)
  const [metricMode, setMetricMode] = useState<'pcs' | 'kasus'>('pcs');
  // Tab Prioritas Sparepart: 'aktif' (Hanya tiket Open & Progress) vs 'semua' (Termasuk tiket Done)
  const [sparepartTab, setSparepartTab] = useState<'aktif' | 'semua'>('aktif');

  const totalTitik = tindakanStats?.total || 0;
  const totalPcs = tindakanStats?.totalPcs || totalTitik;
  const gantiPcs = tindakanStats?.gantiPcs || tindakanStats?.gantiCount || 0;
  const repairPcs = tindakanStats?.repairPcs || tindakanStats?.repairCount || 0;

  const gantiPercent = totalPcs > 0 ? Math.round((gantiPcs / totalPcs) * 100) : 0;
  const repairPercent = totalPcs > 0 ? Math.round((repairPcs / totalPcs) * 100) : 0;

  // Siapkan data grafik sesuai metricMode
  const dataKategori = chartKategori.map((item) => ({
    ...item,
    displayVal: metricMode === 'pcs' ? (item.totalPcs || item.total) : item.total,
  }));

  const dataGejala = chartDetailGejala.map((item) => ({
    ...item,
    displayVal: metricMode === 'pcs' ? (item.totalPcs || item.total) : item.total,
  }));

  return (
    <div className="space-y-6">
      {/* 1. Header & Metric Switcher Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span>🛠️</span> Analisis Kerusakan Komponen & Suku Cadang
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi volume penggantian part (Ganti Baru) vs pengerjaan bengkel (Repair)
          </p>
        </div>

        {/* Toggle Pcs vs Kasus */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setMetricMode('pcs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              metricMode === 'pcs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📦</span>
            <span>Total Kuantitas (Pcs)</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('kasus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              metricMode === 'kasus'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🔢</span>
            <span>Frekuensi Kejadian</span>
          </button>
        </div>
      </div>

      {/* 2. Ringkasan Proporsi Tindakan & Kebutuhan Fisik Part */}
      {tindakanStats && totalPcs > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card Total Pcs */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Total Komponen Rusak
              </span>
              <span className="text-base">⚙️</span>
            </div>
            <div>
              <div className="text-3xl font-black">{totalPcs} <span className="text-sm font-semibold text-slate-300">pcs</span></div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Tersebar di {totalTitik} titik kerusakan unit Daisha
              </p>
            </div>
          </div>

          {/* Card Kebutuhan Ganti Baru */}
          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                <span>🔄</span> Perlu Ganti Baru
              </span>
              <span className="text-xs font-black px-2 py-0.5 bg-blue-200 text-blue-900 rounded-lg">
                {gantiPercent}%
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-900">
                {gantiPcs} <span className="text-sm font-semibold text-blue-700">pcs part</span>
              </div>
              <p className="text-[11px] text-blue-700 mt-1 font-medium">
                Permintaan sparepart baru ke warehouse ({tindakanStats.gantiCount} titik)
              </p>
            </div>
          </div>

          {/* Card Pengerjaan Repair */}
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <span>🔨</span> Servis Bengkel (Repair)
              </span>
              <span className="text-xs font-black px-2 py-0.5 bg-amber-200 text-amber-900 rounded-lg">
                {repairPercent}%
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-amber-900">
                {repairPcs} <span className="text-sm font-semibold text-amber-700">pcs part</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1 font-medium">
                Dapat diperbaiki / diservis mekanik ({tindakanStats.repairCount} titik)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bar Charts: Pareto Komponen & Top Gejala */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pareto Komponen */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>🔧</span> Pareto Komponen Rusak Terbanyak
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {metricMode === 'pcs' ? 'Total kuantitas part (pcs) yang rusak' : 'Frekuensi kemunculan kasus di tiket'}
              </p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
              {metricMode === 'pcs' ? 'Volume Pcs' : 'Frekuensi Kasus'}
            </span>
          </div>

          <div className="h-72 w-full">
            {dataKategori.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataKategori} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis dataKey="kategori" type="category" tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} width={95} />
                  <Tooltip
                    formatter={(val: unknown, name, props) => {
                      const item = props?.payload as { total?: number; totalPcs?: number };
                      return [
                        metricMode === 'pcs'
                          ? `${val} pcs (${item.total || 1} kejadian)`
                          : `${val} kali (${item.totalPcs || item.total || 1} pcs part)`,
                        metricMode === 'pcs' ? 'Total Pcs' : 'Frekuensi',
                      ];
                    }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="displayVal" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data komponen rusak
              </div>
            )}
          </div>
        </div>

        {/* Top Detail Gejala */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>⚠️</span> Top 10 Detail Gejala Masalah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {metricMode === 'pcs' ? 'Kuantitas part fisik yang terdampak gejala' : 'Keluhan spesifik yang paling sering dilaporkan'}
              </p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-red-100 text-red-800 rounded-lg">
              {metricMode === 'pcs' ? 'Volume Pcs' : 'Frekuensi Kasus'}
            </span>
          </div>

          <div className="h-72 w-full">
            {dataGejala.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataGejala} layout="vertical" margin={{ top: 5, right: 30, left: 95, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis dataKey="gejala" type="category" tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 600 }} width={120} />
                  <Tooltip
                    formatter={(val: unknown, name, props) => {
                      const item = props?.payload as { total?: number; totalPcs?: number };
                      return [
                        metricMode === 'pcs'
                          ? `${val} pcs (${item.total || 1} kejadian)`
                          : `${val} kali (${item.totalPcs || item.total || 1} pcs part)`,
                        metricMode === 'pcs' ? 'Total Pcs' : 'Frekuensi',
                      ];
                    }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="displayVal" fill="#e11d48" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data detail gejala
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Leaderboard Prioritas Kebutuhan Suku Cadang (Material Demand) */}
      {(() => {
        const displayedList = sparepartTab === 'aktif' ? sparepartKebutuhan : sparepartKebutuhanSemua;

        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span>📦</span> Prioritas Permintaan Sparepart Baru ke Gudang
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sparepartTab === 'aktif'
                    ? 'Kebutuhan part baru untuk unit yang masih antre / dalam pengerjaan (otomatis berkurang saat tiket selesai)'
                    : 'Akumulasi seluruh suku cadang baru yang dibutuhkan/dipasang (termasuk unit yang sudah selesai)'}
                </p>
              </div>

              {/* Toggle Antrean Aktif vs Semua Riwayat */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setSparepartTab('aktif')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    sparepartTab === 'aktif'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>⚡</span>
                  <span>Antrean Aktif (Open & Progress)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSparepartTab('semua')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    sparepartTab === 'semua'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>📋</span>
                  <span>Semua Riwayat</span>
                </button>
              </div>
            </div>

            {displayedList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {displayedList.map((part, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase px-1.5 py-0.5 bg-slate-200 rounded">
                          #{idx + 1} {part.nama}
                        </span>
                        {part.gantiPcs > 0 && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
                            🔄 {part.gantiPcs} pcs baru
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {part.gejala}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex justify-between items-center text-[10px] font-semibold text-slate-500">
                      <span>Repair: {part.repairPcs} pcs</span>
                      <span className="font-extrabold text-slate-800">Total: {part.totalPcs} pcs</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <span className="text-3xl mb-2 block">🎉</span>
                <p className="text-xs sm:text-sm font-black text-slate-800">
                  {sparepartTab === 'aktif'
                    ? 'Tidak ada antrean permintaan sparepart baru!'
                    : 'Tidak ada data kebutuhan suku cadang untuk filter ini.'}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto font-medium">
                  {sparepartTab === 'aktif'
                    ? 'Seluruh unit antrean workshop sudah terpenuhi suku cadangnya atau semua tiket sudah berstatus Selesai (Done).'
                    : 'Silakan sesuaikan rentang tanggal atau kriteria filter Anda.'}
                </p>
                {sparepartTab === 'aktif' && sparepartKebutuhanSemua.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSparepartTab('semua')}
                    className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 shadow-2xs transition cursor-pointer"
                  >
                    <span>📋</span>
                    <span>Lihat Riwayat Part Keseluruhan ({sparepartKebutuhanSemua.length} jenis)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
