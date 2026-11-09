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

  const activeRepairCount = seksiTickets.filter((t) => t.status !== 'Done' && t.status !== 'Scrap').length;
  const completedRepairCount = seksiTickets.filter((t) => t.status === 'Done').length;

  const allActiveRepairs = useMemo(() => {
    return tickets.filter((t) => t.status !== 'Done' && t.status !== 'Scrap').length;
  }, [tickets]);

  const allCompletedRepairs = useMemo(() => {
    return tickets.filter((t) => t.status === 'Done').length;
  }, [tickets]);

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

          {/* Card 3: Request Pembuatan Unit */}
          <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <SendHorizonal className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Antar Seksi
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto font-sans">
      {/* 1. Header Admin Portal */}
      <header className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
              <Building2 className="w-3.5 h-3.5 text-red-400" />
              <span>Workshop Control Center</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Administrator: <strong className="text-slate-800 font-semibold">{currentUser?.username}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Portal Administrasi Workshop
          </h1>
          <p className="text-xs text-slate-500">
            Pusat kendali operasional perbaikan, jadwal pemeliharaan berkala (PM), logistik sparepart, dan manajemen hak akses.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/admin"
            className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition shadow-xs"
          >
            <Wrench className="w-4 h-4" />
            <span>Panel Tindakan</span>
          </Link>
          <Link
            href="/kpi"
            className="h-10 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition shadow-2xs"
          >
            <BarChart3 className="w-4 h-4 text-red-600" />
            <span>Pusat KPI</span>
          </Link>
        </div>
      </header>

      {/* 2. Quick Pulse Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs text-slate-500 font-medium">Unit Sedang Diservis</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">
              {allActiveRepairs} <span className="text-xs font-normal text-slate-500">unit</span>
            </p>
          </div>
          <Link
            href="/admin"
            className="text-xs font-semibold px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition"
          >
            Tangani &rarr;
          </Link>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs text-slate-500 font-medium">Selesai Diperbaiki</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">
              {allCompletedRepairs} <span className="text-xs font-normal text-slate-500">unit</span>
            </p>
          </div>
          <Link
            href="/riwayat"
            className="text-xs font-semibold px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition"
          >
            Riwayat &rarr;
          </Link>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs text-slate-500 font-medium">Siklus PM Aktif</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              Periode Oktober - Maret
            </p>
          </div>
          <Link
            href="/maintenance"
            className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition"
          >
            Buka PM &rarr;
          </Link>
        </div>
      </div>

      {/* 3. Tiga Zona Jelas Sesuai Struktur Navigasi Sidebar */}

      {/* ZONA 1: OPERASIONAL WORKSHOP */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Operasional Workshop
            </h2>
          </div>
          <span className="text-xs text-slate-400">Servis harian, pemeliharaan rutin &amp; order seksi</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Module 1: Perbaikan Daisha */}
          <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  Utama
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Perbaikan Daisha
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Penanganan kerusakan unit, eksekusi servis di bengkel, dan log riwayat perbaikan.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
              <Link
                href="/admin"
                className="w-full h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Panel Tindakan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center justify-center gap-3 pt-0.5 text-xs text-slate-500">
                <Link href="/input" className="hover:text-red-600 transition">Input Kerusakan</Link>
                <span className="text-slate-300">/</span>
                <Link href="/riwayat" className="hover:text-red-600 transition">Antrean Bengkel</Link>
              </div>
            </div>
          </div>

          {/* Module 2: PM Daisha */}
          <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Rutin 6 Bulan
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  PM Daisha
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Jadwal pemeliharaan berkala, staging penjemputan seksi, dan checklist perawatan unit.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
              <Link
                href="/maintenance"
                className="w-full h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Buka PM Daisha</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center justify-center gap-3 pt-0.5 text-xs text-slate-500">
                <Link href="/maintenance?tab=staging" className="hover:text-emerald-700 transition">Staging Penjemputan</Link>
                <span className="text-slate-300">/</span>
                <Link href="/maintenance?tab=fleet" className="hover:text-emerald-700 transition">Armada PM</Link>
              </div>
            </div>
          </div>

          {/* Module 3: Request Seksi */}
          <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <SendHorizonal className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Order Kerja
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Request Seksi
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Permohonan modifikasi unit, pembuatan troli baru, estimasi part, dan persetujuan SP Project.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
              <Link
                href="/request/tracking"
                className="w-full h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Antrean Request</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center justify-center gap-3 pt-0.5 text-xs text-slate-500">
                <Link href="/request/tracking?new=true" className="hover:text-blue-700 transition">Buat Form Baru</Link>
                <span className="text-slate-300">/</span>
                <Link href="/request/tracking" className="hover:text-blue-700 transition">Tracking Progres</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ZONA 2: LOGISTIK & MASTER ASET */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Logistik &amp; Master Aset
            </h2>
          </div>
          <span className="text-xs text-slate-400">Inventaris suku cadang &amp; registri seluruh armada pabrik</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Module 4: Stok Sparepart */}
          <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Gudang
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Stok Sparepart
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Saldo persediaan suku cadang, mutasi barang masuk/keluar, dan monitoring minimum stok bengkel.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
              <Link
                href="/spareparts"
                className="w-full h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Kelola Stok Sparepart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 5: Registri Master Daisha */}
          <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Master Data
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registri Master Daisha
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Database seluruh unit Daisha lintas seksi pabrik, label barcode/QR unit, dan spesifikasi tipe.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
              <Link
                href="/catalog"
                className="w-full h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Buka Registri Daisha</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ZONA 3: MANAJEMEN & KONTROL */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-800" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Manajemen &amp; Kontrol
            </h2>
          </div>
          <span className="text-xs text-slate-400">Pusat analitik eksekutif &amp; konfigurasi hak akses</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Module 6: Dashboard KPI */}
          <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  Analitik
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Dashboard KPI Daisha
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Laporan performa armada, grafik throughput servis, kepatuhan PM per seksi, dan tren lead time.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
              <Link
                href="/kpi"
                className="w-full h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Buka Dashboard KPI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center justify-center gap-3 pt-0.5 text-xs text-slate-500">
                <Link href="/kpi?tab=jumlah_daisha" className="hover:text-red-600 transition">Populasi</Link>
                <span className="text-slate-300">/</span>
                <Link href="/kpi?tab=perbaikan_daisha" className="hover:text-red-600 transition">Perbaikan</Link>
                <span className="text-slate-300">/</span>
                <Link href="/kpi?tab=pm_daisha" className="hover:text-red-600 transition">PM Rutin</Link>
              </div>
            </div>
          </div>

          {/* Module 7: Pengelola Akun */}
          <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Akses
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pengelola Akun
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Manajemen akun pengguna, konfigurasi role (Admin, Operator, Seksi), dan reset kredensial password.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
              <Link
                href="/users"
                className="w-full h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Kelola Akun Pengguna</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}