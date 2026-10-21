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
  ChevronRight,
  ShieldCheck,
  Layers,
  CalendarClock,
  Activity,
  Target,
} from 'lucide-react';

export default function WorkshopPortalPage() {
  const router = useRouter();
  const { currentUser, isOperator, isSeksi, isAdmin, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && currentUser) {
      if (isOperator) {
        router.replace('/input');
      } else if (isSeksi) {
        router.replace('/request');
      }
    }
  }, [authLoading, currentUser, isOperator, isSeksi, router]);

  if (authLoading || isOperator || isSeksi) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Mengarahkan ke halaman kerja Anda...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-2 pt-0.5">
              <Link
                href="/input"
                className="flex-1 h-8 px-2.5 text-center text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                Input Daisha
              </Link>
              <Link
                href={isAdmin ? '/admin' : '/riwayat'}
                className="flex-1 h-8 px-2.5 text-center text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                {isAdmin ? 'Panel Tindakan' : 'Riwayat Tiket'}
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