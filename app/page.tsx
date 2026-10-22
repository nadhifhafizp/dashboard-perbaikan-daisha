'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
} from 'lucide-react';

export default function WorkshopPortalPage() {
  const router = useRouter();
  const { currentUser, isOperator, isSeksi, isAdmin, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && currentUser) {
      if (isOperator) {
        router.replace('/input');
      }
    }
  }, [authLoading, currentUser, isOperator, router]);

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

  const userSeksi = currentUser?.seksi || 'Plant';

  // Portal 3 Panel Khusus Seksi
  if (isSeksi) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Header Seksi */}
        <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                <Building2 className="w-3.5 h-3.5" />
                <span>Seksi {userSeksi}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {currentUser?.name || currentUser?.username}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Portal Layanan Daisha - Seksi {userSeksi}
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Pusat kendali dan pemeliharaan armada Daisha untuk seksi Anda • Pilih panel kerja yang ingin dituju:
            </p>
          </div>
        </div>

        {/* 3 Panel Cards untuk User Seksi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Lapor Daisha Rusak */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-red-200 transition flex flex-col justify-between overflow-hidden group">
            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shadow-2xs group-hover:bg-red-600 group-hover:text-white transition">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200/60">
                  Lapor Cepat
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition">
                  Lapor Daisha Rusak
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Laporkan unit Daisha yang rusak di area Seksi {userSeksi} tanpa perlu memilih seksi lain atau mendiagnosa komponen teknis.
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Otomatis memetakan armada Daisha Seksi {userSeksi}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dukungan Scan QR langsung pada unit fisik</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-2">
              <Link
                href="/lapor-rusak"
                className="w-full h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buka Form Lapor Rusak</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/riwayat"
                className="w-full h-8 px-3 text-center text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Lihat Status Antrean Bengkel</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Preventive Maintenance (PM) & Analitik Seksi */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-200 transition flex flex-col justify-between overflow-hidden group">
            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Kesiapan & Servis
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition">
                  Preventive Maintenance (PM)
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Ketahui unit Daisha yang jatuh tempo servis berkala, siapkan fisik unit di area Seksi {userSeksi}, dan beri tahu lokasi penjemputan ke tim Workshop.
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Daftar unit jatuh tempo PM tahun ini</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Siapkan unit & notifikasi titik jemput ke bengkel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Monitoring status pengerjaan & histori servis</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-2">
              <Link
                href={`/maintenance?seksi=${encodeURIComponent(userSeksi)}`}
                className="w-full h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buka Panel PM Seksi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Permohonan / Request Pembuatan Unit */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-200 transition flex flex-col justify-between overflow-hidden group">
            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition">
                  <SendHorizonal className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                  Special Project
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                  Request Pembuatan & Modifikasi
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Ajukan pesanan pembuatan troli baru, jig, stopper, rak, atau modifikasi alat bantu kerja untuk seksi Anda ke tim bengkel.
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tracking persetujuan atasan & status bengkel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Seksi pemohon otomatis terkunci</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-2">
              <Link
                href="/request"
                className="w-full h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buka Dashboard Request</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/request/tracking?new=true"
                  className="h-8 px-2 text-center text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200/80 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Baru</span>
                </Link>
                <Link
                  href="/request/tracking"
                  className="h-8 px-2 text-center text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
                >
                  Lacak Status
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Workshop Management Hub untuk Admin & Superuser
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* 1. Page Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Workshop Management Portal
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Selamat datang, <span className="font-semibold text-slate-800">{currentUser?.name || 'Administrator'}</span> • Pilih modul kerja di bawah:
          </p>
        </div>
      </div>

      {/* 2. Operational Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Module 1: Perbaikan Daisha */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between overflow-hidden">
          <div className="p-5 space-y-3.5 flex-1">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                Unit Maintenance
              </span>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Perbaikan Daisha
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pencatatan perbaikan troli daisha, reliabilitas komponen, dan antrean servis.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-2">
            <Link
              href="/daisha"
              className="w-full h-9 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Dashboard Daisha</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <Link
                href="/input"
                className="h-8 px-1.5 text-center text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                Input Teknisi
              </Link>
              <Link
                href="/lapor-rusak"
                className="h-8 px-1.5 text-center text-[11px] font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200/80 flex items-center justify-center"
              >
                Lapor Seksi
              </Link>
              <Link
                href={isAdmin ? '/admin' : '/riwayat'}
                className="h-8 px-1.5 text-center text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                {isAdmin ? 'Tindakan' : 'Antrean'}
              </Link>
            </div>
          </div>
        </div>

        {/* Module 2: Modul Maintenance Daisha (Tahunan & Target) */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between overflow-hidden">
          <div className="p-5 space-y-3.5 flex-1">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200/60">
                Annual PM & Grid
              </span>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Modul Maintenance Daisha
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pemeliharaan berkala tahunan, target harian teknisi, dan pemetaan grid unit.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-2">
            <Link
              href="/maintenance"
              className="w-full h-9 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Modul Maintenance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-2 pt-0.5">
              <Link
                href="/fleet"
                className="flex-1 h-8 px-2.5 text-center text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                Kontrol Siklus
              </Link>
              <Link
                href="/catalog"
                className="flex-1 h-8 px-2.5 text-center text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                Registri Unit
              </Link>
            </div>
          </div>
        </div>

        {/* Module 3: Follow Up Request Seksi */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between overflow-hidden">
          <div className="p-5 space-y-3.5 flex-1">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <SendHorizonal className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                Special Project
              </span>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Request Seksi
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Permohonan modifikasi, pembuatan alat bantu baru, dan tracking persetujuan.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-2">
            <Link
              href="/request"
              className="w-full h-9 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Dashboard Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-2 pt-0.5">
              <Link
                href="/request/tracking"
                className="flex-1 h-8 px-2.5 text-center text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                Daftar Pelacakan
              </Link>
              <Link
                href="/request/tracking?new=true"
                className="flex-1 h-8 px-2.5 text-center text-xs font-medium text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200/80 flex items-center justify-center"
              >
                Buat Request
              </Link>
            </div>
          </div>
        </div>

        {/* Module 4: Manajemen Spareparts */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between overflow-hidden">
          <div className="p-5 space-y-3.5 flex-1">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                Logistik Bengkel
              </span>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Stok Sparepart
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ketersediaan suku cadang, alert stok minimum, dan log mutasi keluar-masuk.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-2">
            <Link
              href="/spareparts"
              className="w-full h-9 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Monitoring Sparepart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="pt-0.5">
              <Link
                href="/spareparts"
                className="w-full h-8 px-2.5 text-center text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                Daftar Stok & Mutasi
              </Link>
            </div>
          </div>
        </div>

        {/* Module 5: Manajemen Pengguna */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between overflow-hidden">
          <div className="p-5 space-y-3.5 flex-1">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                Sistem & Akses
              </span>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Manajemen Pengguna
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Kelola kredensial akun operator workshop, user seksi, dan perizinan akses.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-2">
            <Link
              href="/users"
              className="w-full h-9 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Manajemen Pengguna</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="pt-0.5">
              <Link
                href="/users"
                className="w-full h-8 px-2.5 text-center text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                Daftar Akun Pengguna
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}