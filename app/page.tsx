'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/hooks/useTickets';
import {
  Wrench,
  SendHorizonal,
  Package,
  ArrowRight,
  Users,
  Target,
  AlertTriangle,
  Clock,
  Plus,
  Layers,
  Activity,
  Building2,
  CheckCircle2,
  CalendarDays,
  BarChart3,
  Truck,
  ClipboardList,
} from 'lucide-react';

export default function WorkshopPortalPage() {
  const router = useRouter();
  const { currentUser, isOperator, isSeksi, isAdmin, isLoading: authLoading } = useAuth();
  const { tickets } = useTickets({ autoRefreshIntervalMs: 60000 });

  useEffect(() => {
    if (!authLoading && currentUser) {
      if (isOperator) {
        router.replace('/input');
      }
    }
  }, [authLoading, currentUser, isOperator, router]);

  const userSeksi = currentUser?.seksi || 'Plant';

  const seksiTickets = useMemo(() => {
    const userSeksiClean = currentUser?.seksi?.toLowerCase();
    if (!userSeksiClean) return [];
    return tickets.filter(
      (t) => t.seksi?.toLowerCase() === userSeksiClean
    );
  }, [tickets, currentUser?.seksi]);

  const activeRepairCount = seksiTickets.filter((t) => t.status !== 'SELESAI').length;
  const completedRepairCount = seksiTickets.filter((t) => t.status === 'SELESAI').length;

  if (authLoading || isOperator) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Mengarahkan ke halaman kerja Anda...</p>
        </div>
      </div>
    );
  }

  // Portal 3 Panel Khusus Seksi
  if (isSeksi) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-sans">
        {/* Header Seksi (Clean Layout) */}
        <header className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-red-600" />
                <span>Plant Floor</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Akun: <strong className="text-slate-800 font-semibold">{currentUser?.username}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Portal Seksi {userSeksi}
            </h1>
            <p className="text-xs text-slate-500">
              Pusat layanan perbaikan kerusakan, pemeliharaan berkala (PM), dan permohonan pekerjaan Daisha.
            </p>
          </div>

          <Link
            href={`/kpi?seksi=${encodeURIComponent(userSeksi)}`}
            className="h-10 min-h-[40px] px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition self-start sm:self-center shadow-2xs"
          >
            <BarChart3 className="w-4 h-4 text-red-600" />
            <span>KPI Seksi</span>
          </Link>
        </header>

        {/* 3 Panel Cards untuk User Seksi (Konsisten, Berimbang, Simetris) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Lapor Daisha Rusak */}
          <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                {activeRepairCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {activeRepairCount} Aktif di Bengkel
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Lapor Rusak
                </h2>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Laporkan unit rusak &amp; keluhan komponen Daisha di Seksi {userSeksi}.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2.5">
              <Link
                href="/lapor-rusak"
                className="w-full h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Lapor Rusak</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-center">
                <Link
                  href="/riwayat"
                  className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center justify-center gap-1.5 transition"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lihat antrean bengkel</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Preventive Maintenance (PM) */}
          <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  PM Terjadwal
                </span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  PM Daisha
                </h2>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Jadwal servis berkala, checklist part, dan penyiapan staging armada.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2.5">
              <Link
                href={`/maintenance?seksi=${encodeURIComponent(userSeksi)}`}
                className="w-full h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Buka PM Daisha</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-center">
                <Link
                  href={`/maintenance?tab=staging&seksi=${encodeURIComponent(userSeksi)}`}
                  className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center justify-center gap-1.5 transition"
                >
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Penjemputan Staging</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Request Pembuatan Unit (ENG-KP-011) */}
          <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <SendHorizonal className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ENG-KP-011
                </span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Request Seksi
                </h2>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Permohonan modifikasi unit atau pembuatan troli baru antar seksi.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2.5">
              <Link
                href="/request/tracking?new=true"
                className="w-full h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Buat Request Baru</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-center">
                <Link
                  href="/request/tracking"
                  className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center justify-center gap-1.5 transition"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lihat antrean request</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Cepat & Navigasi Operasional Seksi */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Ringkasan Operasional Seksi {userSeksi}
              </h3>
            </div>
            <Link
              href={`/kpi?seksi=${encodeURIComponent(userSeksi)}`}
              className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 transition"
            >
              <span>Detail KPI Seksi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Unit Sedang Diservis</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {activeRepairCount} <span className="text-xs font-normal text-slate-500">unit</span>
                </p>
              </div>
              <Link
                href="/riwayat"
                className="text-xs font-semibold px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition"
              >
                Antrean &rarr;
              </Link>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Selesai Diperbaiki</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {completedRepairCount} <span className="text-xs font-normal text-slate-500">unit</span>
                </p>
              </div>
              <Link
                href="/riwayat"
                className="text-xs font-semibold px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition"
              >
                Riwayat &rarr;
              </Link>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Katalog Armada Seksi</p>
                <p className="text-xs font-semibold text-slate-800 mt-1.5 truncate max-w-[150px]">
                  Seksi {userSeksi}
                </p>
              </div>
              <Link
                href={`/maintenance?tab=fleet&seksi=${encodeURIComponent(userSeksi)}`}
                className="text-xs font-semibold px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-200 rounded-lg transition"
              >
                Katalog &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Workshop Management Hub untuk Admin & Superuser
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-sans">
      {/* 1. Page Header (Flat layout) */}
      <header className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-1">
          <h1 className="t-title text-slate-900 tracking-tight">
            Workshop Daisha
          </h1>
          <p className="t-caption text-slate-500">
            Status operasional bengkel dan armada pabrik
          </p>
        </div>
      </header>

      {/* 2. Operational Module Cards (Sesuai DS v2.0 Section 7) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Module 1: KPI Daisha */}
        <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5 relative">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="t-section text-slate-900">
                KPI Daisha
              </h2>
              <p className="t-body text-slate-600 mt-1 line-clamp-2">
                Monitoring analitik armada, kepatuhan PM, request, dan stok sparepart.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/kpi"
              className="w-full h-11 sm:h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Lihat KPI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center justify-center gap-3 pt-0.5 text-xs text-slate-500">
              <Link href="/kpi?tab=daisha" className="hover:text-red-600 transition">Armada & PM</Link>
              <span className="text-slate-300">/</span>
              <Link href="/kpi?tab=request" className="hover:text-red-600 transition">Request</Link>
              <span className="text-slate-300">/</span>
              <Link href="/kpi?tab=spareparts" className="hover:text-red-600 transition">Stok</Link>
            </div>
          </div>
        </div>

        {/* Module 2: Perbaikan Daisha (Operasional Servis) */}
        <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="t-section text-slate-900">
                Perbaikan Daisha
              </h2>
              <p className="t-body text-slate-600 mt-1 line-clamp-2">
                Penanganan kerusakan unit, eksekusi servis, dan riwayat perbaikan.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/admin"
              className="w-full h-11 sm:h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/input"
                className="t-caption text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition"
              >
                <span>Input Kerusakan</span>
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href="/riwayat"
                className="t-caption text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition"
              >
                <span>Antrean Unit</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Module 3: Modul Maintenance Daisha (Operasional PM) */}
        <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="t-section text-slate-900">
                PM Daisha
              </h2>
              <p className="t-body text-slate-600 mt-1 line-clamp-2">
                Antrean penjemputan berkala, penyiapan seksi, dan registri armada.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/maintenance?tab=staging"
              className="w-full h-11 sm:h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka PM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/maintenance?tab=fleet"
                className="t-caption text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition"
              >
                <span>Katalog Armada</span>
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href="/catalog"
                className="t-caption text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition"
              >
                <span>Registri Daisha</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Module 4: Request Seksi */}
        <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <SendHorizonal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="t-section text-slate-900">
                Request Seksi
              </h2>
              <p className="t-body text-slate-600 mt-1 line-clamp-2">
                Daftar permohonan modifikasi, evaluasi teknis, dan unit baru.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/request/tracking"
              className="w-full h-11 sm:h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Lihat Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="text-center">
              <Link
                href="/request/tracking"
                className="t-caption text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition"
              >
                <span>Buat Request</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Module 5: Stok Sparepart */}
        <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="t-section text-slate-900">
                Stok Sparepart
              </h2>
              <p className="t-body text-slate-600 mt-1 line-clamp-2">
                Inventaris suku cadang, stok gudang, dan riwayat mutasi masuk keluar.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/spareparts"
              className="w-full h-11 sm:h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Sparepart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 6: Akun Pengguna */}
        <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="t-section text-slate-900">
                Akun Pengguna
              </h2>
              <p className="t-body text-slate-600 mt-1 line-clamp-2">
                Daftar akun bengkel, operator, dan hak akses seksi pabrik.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/users"
              className="w-full h-11 sm:h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Kelola Akun</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}