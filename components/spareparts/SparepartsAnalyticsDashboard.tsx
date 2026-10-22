'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingDown,
  Layers,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export interface SparepartLog {
  id: number;
  namaKomponen: string;
  tipe: string;
  qty: number;
  referensi?: string;
  keterangan?: string;
  tanggal: string;
}

export interface SparepartItem {
  namaKomponen: string;
  kategori: string;
  stokGudang: number;
  satuan: string;
  minStok: number;
  lokasi?: string;
  logs?: SparepartLog[];
}

interface SparepartsAnalyticsDashboardProps {
  spareparts: SparepartItem[];
  onOpenRestock?: (part: SparepartItem) => void;
  onFilterByCategory?: (kategori: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload?: { color?: string; name?: string };
  }>;
  label?: string;
  unit?: string;
}

function CustomTooltip({ active, payload, label, unit = 'Item' }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
        <div className="font-semibold text-slate-200">{label || data.name}</div>
        <div className="text-emerald-400 font-bold tabular-nums">
          {data.value} {unit}
        </div>
      </div>
    );
  }
  return null;
}

const CATEGORY_COLORS = ['#dc2626', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

export default function SparepartsAnalyticsDashboard({
  spareparts,
  onOpenRestock,
  onFilterByCategory,
}: SparepartsAnalyticsDashboardProps) {
  const metrics = useMemo(() => {
    const totalItems = spareparts.length;
    let totalQty = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let safeStockCount = 0;

    const categoryMap: Record<string, { totalItems: number; totalQty: number }> = {};
    const consumptionMap: Record<string, { qty: number; satuan: string }> = {};

    let totalInflowQty = 0;
    let totalOutflowQty = 0;

    spareparts.forEach((p) => {
      totalQty += p.stokGudang;

      // Status Kesehatan Stok
      if (p.stokGudang <= 0) {
        outOfStockCount++;
      } else if (p.minStok > 0 && p.stokGudang <= p.minStok) {
        lowStockCount++;
      } else {
        safeStockCount++;
      }

      // Kategori
      const kat = p.kategori || 'Umum';
      if (!categoryMap[kat]) {
        categoryMap[kat] = { totalItems: 0, totalQty: 0 };
      }
      categoryMap[kat].totalItems++;
      categoryMap[kat].totalQty += p.stokGudang;

      // Hitung pergerakan dari log mutasi
      if (p.logs && Array.isArray(p.logs)) {
        p.logs.forEach((log) => {
          const tipeUpper = (log.tipe || '').toUpperCase();
          const q = Number(log.qty) || 0;
          if (tipeUpper === 'USE' || tipeUpper === 'OUT') {
            totalOutflowQty += q;
            if (!consumptionMap[p.namaKomponen]) {
              consumptionMap[p.namaKomponen] = { qty: 0, satuan: p.satuan || 'pcs' };
            }
            consumptionMap[p.namaKomponen].qty += q;
          } else if (tipeUpper === 'RESTOCK' || tipeUpper === 'IN') {
            totalInflowQty += q;
          }
        });
      }
    });

    // Top 5 Fast-Moving Consumed Parts
    const fastMoving = Object.entries(consumptionMap)
      .map(([name, data]) => ({ name, count: data.qty, satuan: data.satuan }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Kategori Donut Data
    const categoryChartData = Object.entries(categoryMap).map(([name, val], idx) => ({
      name,
      value: val.totalQty,
      itemCount: val.totalItems,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));

    // Health Donut Data
    const healthChartData = [
      { name: 'Stok Aman', value: safeStockCount, color: '#10b981' },
      { name: 'Stok Menipis', value: lowStockCount, color: '#f59e0b' },
      { name: 'Stok Kosong (0)', value: outOfStockCount, color: '#ef4444' },
    ].filter((d) => d.value > 0);

    // Critical Alert Items
    const criticalItems = spareparts
      .filter((p) => p.stokGudang <= 0 || (p.minStok > 0 && p.stokGudang <= p.minStok))
      .sort((a, b) => a.stokGudang - b.stokGudang);

    return {
      totalItems,
      totalQty,
      outOfStockCount,
      lowStockCount,
      safeStockCount,
      totalInflowQty,
      totalOutflowQty,
      fastMoving,
      categoryChartData,
      healthChartData,
      criticalItems,
    };
  }, [spareparts]);

  return (
    <div className="space-y-6">
      {/* 1. Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Sku / Item */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Komponen & Material</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
              {metrics.totalItems}
            </div>
            <span className="text-xs text-slate-600 font-medium">SKU Terdaftar</span>
          </div>
          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Total fisik di gudang</span>
            <span className="font-bold text-slate-900 tabular-nums">{metrics.totalQty} unit</span>
          </div>
        </div>

        {/* Card 2: Stok Habis / Kritis */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Stok Kosong / Habis</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight tabular-nums">
              {metrics.outOfStockCount}
            </div>
            {metrics.outOfStockCount > 0 ? (
              <span className="text-xs text-red-800 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Kritis
              </span>
            ) : (
              <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Nol Kosong
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Status</span>
            <span className="font-bold text-red-600 tabular-nums">{metrics.outOfStockCount > 0 ? 'Perlu Restock' : 'Aman'}</span>
          </div>
        </div>

        {/* Card 3: Stok Menipis (Warning) */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Stok Menipis</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight tabular-nums">
              {metrics.lowStockCount}
            </div>
            <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Perlu Order
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Di Bawah Minimum</span>
            <span className="font-bold text-amber-700 tabular-nums">{metrics.lowStockCount} SKU</span>
          </div>
        </div>

        {/* Card 4: Total Konsumsi / Pemakaian */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Pengeluaran</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowUpFromLine className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight tabular-nums">
              {metrics.totalOutflowQty}
            </div>
            <span className="text-xs text-blue-800 font-semibold">Terkonsumsi</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Total Masuk</span>
            <span className="font-bold text-slate-900 tabular-nums">{metrics.totalInflowQty} unit</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Charts: Kategori Komposisi & Fast-Moving Parts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Fast-Moving Parts (Bar Chart) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-4.5 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span>Top 5 Komponen Terpakai (Fast-Moving)</span>
            </h3>
          </div>

          <div className="h-64">
            {metrics.fastMoving.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Belum ada data riwayat pemakaian sparepart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.fastMoving}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomTooltip unit="Unit" />} />
                  <Bar dataKey="count" fill="#dc2626" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Komposisi Volume Stok per Kategori (Donut Chart) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-4.5 sm:p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Volume Stok per Kategori</span>
          </h3>

          <div className="h-48 relative flex items-center justify-center">
            {metrics.categoryChartData.length === 0 ? (
              <div className="text-center text-xs text-slate-600">Belum ada data kategori</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {metrics.categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip unit="Unit Fisik" />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 tracking-tight tabular-nums">
                    {metrics.totalQty}
                  </span>
                  <span className="text-[10px] text-slate-600 font-semibold uppercase">Total Fisik</span>
                </div>
              </>
            )}
          </div>

          {/* Legend Items (Tanpa Nested Box) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-3 border-t border-slate-100 text-xs">
            {metrics.categoryChartData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-100/70">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium truncate text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 ml-1.5 tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Peringatan Stok Kritis (Actionable Alert Table) */}
      {metrics.criticalItems.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 bg-red-50/60 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-950">
                  Perhatian: {metrics.criticalItems.length} Item Membutuhkan Restock
                </h4>
                <p className="text-xs text-red-800">
                  Daftar komponen dengan persediaan habis atau menyentuh batas minimum pemesanan
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Nama Komponen / Material</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-right">Stok Gudang</th>
                  <th className="py-2.5 px-3 text-right">Batas Min.</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {metrics.criticalItems.slice(0, 5).map((part) => {
                  const isZero = part.stokGudang <= 0;
                  return (
                    <tr key={part.namaKomponen} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {part.namaKomponen}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                          {part.kategori}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                        <span className={isZero ? 'text-red-600' : 'text-amber-600'}>
                          {part.stokGudang} {part.satuan}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 tabular-nums">
                        {part.minStok} {part.satuan}
                      </td>
                      <td className="py-2.5 px-3">
                        {isZero ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            <span>Habis</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Menipis</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {onOpenRestock && (
                          <button
                            type="button"
                            onClick={() => onOpenRestock(part)}
                            className="h-7 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowDownToLine className="w-3 h-3 text-emerald-600" />
                            <span>Restock</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
