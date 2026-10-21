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
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
  AlertTriangle,
  Building2,
  Target,
  TrendingUp,
} from 'lucide-react';
import { SectionRequestFull } from '@/components/request/BridgestoneRequestPrintModal';

interface RequestAnalyticsDashboardProps {
  requests: SectionRequestFull[];
  onFilterByStatus?: (statusKey: string) => void;
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

function CustomTooltip({ active, payload, label, unit = 'Request' }: CustomTooltipProps) {
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

const URGENSI_COLORS: Record<string, string> = {
  Critical: '#dc2626',
  Urgent: '#f59e0b',
  Normal: '#2563eb',
};

const TUJUAN_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export default function RequestAnalyticsDashboard({
  requests,
  onFilterByStatus,
}: RequestAnalyticsDashboardProps) {
  // 1. Agregasi Metrik Utama
  const metrics = useMemo(() => {
    const total = requests.length;
    let waitingApproval = 0;
    let inProgress = 0;
    let pendingMaterial = 0;
    let completed = 0;
    let rejected = 0;

    const seksiCount: Record<string, number> = {};
    const urgensiCount: Record<string, number> = { Critical: 0, Urgent: 0, Normal: 0 };
    const tujuanCount: Record<string, number> = {};

    let totalLeadTimeDays = 0;
    let completedWithDates = 0;

    requests.forEach((r) => {
      // Pipeline status
      const statusLower = (r.status || '').toLowerCase();
      const flow = r.flowStep || '';

      if (flow === 'STEP_8_SELESAI' || statusLower === 'selesai') {
        completed++;
        if (r.waktuDibuat && r.waktuSelesai) {
          const diffMs = new Date(r.waktuSelesai).getTime() - new Date(r.waktuDibuat).getTime();
          const diffDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
          totalLeadTimeDays += diffDays;
          completedWithDates++;
        }
      } else if (flow === 'STEP_5_DITOLAK' || statusLower.includes('tolak')) {
        rejected++;
      } else if (statusLower.includes('material habis') || statusLower.includes('pending')) {
        pendingMaterial++;
      } else if (flow === 'STEP_6_PENGERJAAN' || statusLower.includes('pengerjaan')) {
        inProgress++;
      } else {
        waitingApproval++;
      }

      // Seksi Pemohon count
      const seksi = r.seksiPemohon || 'Lainnya';
      seksiCount[seksi] = (seksiCount[seksi] || 0) + 1;

      // Urgensi count
      const urg = r.urgensi === 'Critical' ? 'Critical' : r.urgensi === 'Urgent' ? 'Urgent' : 'Normal';
      urgensiCount[urg] = (urgensiCount[urg] || 0) + 1;

      // Tujuan count
      const tujuan = r.tujuan || 'Lain-lain';
      tujuanCount[tujuan] = (tujuanCount[tujuan] || 0) + 1;
    });

    // Urutkan Seksi terbanyak (Top 6)
    const seksiChartData = Object.entries(seksiCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Chart Data Urgensi
    const urgensiChartData = Object.entries(urgensiCount).map(([name, value]) => ({
      name,
      value,
      color: URGENSI_COLORS[name] || '#64748b',
    }));

    // Chart Data Tujuan
    const tujuanChartData = Object.entries(tujuanCount)
      .map(([name, value], i) => ({
        name,
        value,
        color: TUJUAN_COLORS[i % TUJUAN_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgLeadTime = completedWithDates > 0 ? Math.round(totalLeadTimeDays / completedWithDates) : 0;

    return {
      total,
      waitingApproval,
      inProgress,
      pendingMaterial,
      completed,
      rejected,
      completionRate,
      avgLeadTime,
      seksiChartData,
      urgensiChartData,
      tujuanChartData,
    };
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* 1. Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Request */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Permohonan</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
              {metrics.total}
            </div>
            <span className="text-xs text-slate-500 font-medium">Semua Seksi</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Tingkat Selesai</span>
            <span className="font-bold text-slate-800 tabular-nums">{metrics.completionRate}%</span>
          </div>
        </div>

        {/* Card 2: Menunggu Approval / Pipeline */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Menunggu Approval</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight tabular-nums">
              {metrics.waitingApproval}
            </div>
            <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Antrean
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Rasio Antrean</span>
            <span className="font-bold text-slate-800 tabular-nums">
              {metrics.total > 0 ? Math.round((metrics.waitingApproval / metrics.total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Card 3: Sedang Dikerjakan (WIP) */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Sedang Pengerjaan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight tabular-nums">
              {metrics.inProgress}
            </div>
            {metrics.pendingMaterial > 0 ? (
              <span className="text-[11px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>{metrics.pendingMaterial} Material</span>
              </span>
            ) : (
              <span className="text-xs text-blue-800 font-semibold">Aktif</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Dalam Pengerjaan</span>
            <span className="font-bold text-slate-800 tabular-nums">
              {metrics.total > 0 ? Math.round((metrics.inProgress / metrics.total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Card 4: Selesai & Lead Time */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Selesai Dikerjakan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight tabular-nums">
              {metrics.completed}
            </div>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 tabular-nums">
              {metrics.completionRate}%
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Rata-rata Lead Time</span>
            <span className="font-bold text-slate-900 tabular-nums">{metrics.avgLeadTime} hari</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Charts: Volume per Seksi & Distribusi Tujuan / Urgensi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Volume Request per Seksi (Horizontal / Bar Chart) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-4.5 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-600" />
              <span>Volume Permohonan per Seksi</span>
            </h3>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 tabular-nums">
              Top {metrics.seksiChartData.length} Seksi
            </span>
          </div>

          <div className="h-64">
            {metrics.seksiChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Belum ada data permohonan yang tercatat.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.seksiChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomTooltip unit="Request" />} />
                  <Bar dataKey="count" fill="#dc2626" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Distribusi Tujuan Permohonan (Donut Chart) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-4.5 sm:p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Kategori Tujuan Permohonan</span>
          </h3>

          <div className="h-48 relative flex items-center justify-center">
            {metrics.tujuanChartData.length === 0 ? (
              <div className="text-center text-xs text-slate-500">Belum ada data tujuan</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.tujuanChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {metrics.tujuanChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip unit="Request" />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 tracking-tight tabular-nums">
                    {metrics.total}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Total</span>
                </div>
              </>
            )}
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {metrics.tujuanChartData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium truncate text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 ml-1.5 tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Pipeline Flow Breakdown & Urgensi Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pipeline Bottleneck / Alur Tahapan */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-4.5 sm:p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Tahapan Alur Pengerjaan (Pipeline)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">1. Approval Atasan Seksi</span>
              <div className="text-xl font-black text-slate-900 tracking-tight tabular-nums">
                {requests.filter(r => r.flowStep === 'STEP_2_ATASAN_SEKSI' || r.statusApprovalAtasanSeksi === 'WAITING').length}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">2. Evaluasi Workshop</span>
              <div className="text-xl font-black text-slate-900 tracking-tight tabular-nums">
                {requests.filter(r => r.flowStep === 'STEP_3_WORKSHOP').length}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">3. Approval S.Project</span>
              <div className="text-xl font-black text-slate-900 tracking-tight tabular-nums">
                {requests.filter(r => r.flowStep === 'STEP_4_ATASAN_SP').length}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">4. Pengerjaan Fisik</span>
              <div className="text-xl font-black text-blue-600 tracking-tight tabular-nums">
                {requests.filter(r => r.flowStep === 'STEP_6_PENGERJAAN').length}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">5. Tertahan Material</span>
              <div className="text-xl font-black text-rose-600 tracking-tight tabular-nums">
                {metrics.pendingMaterial}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">6. Selesai Serah Terima</span>
              <div className="text-xl font-black text-emerald-600 tracking-tight tabular-nums">
                {metrics.completed}
              </div>
            </div>
          </div>
        </div>

        {/* Tingkat Urgensi Request */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-4.5 sm:p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Prioritas Urgensi</span>
          </h3>

          <div className="space-y-3 pt-1">
            {metrics.urgensiChartData.map((u) => {
              const pct = metrics.total > 0 ? Math.round((u.value / metrics.total) * 100) : 0;
              return (
                <div key={u.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: u.color }} />
                      <span>{u.name}</span>
                    </span>
                    <span className="text-slate-600 tabular-nums">
                      <strong>{u.value}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: u.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {metrics.rejected > 0 && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-700 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200/70">
              <div className="flex items-center gap-1.5 font-semibold">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Permohonan Ditolak</span>
              </div>
              <span className="font-bold tabular-nums">{metrics.rejected} Tiket</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
