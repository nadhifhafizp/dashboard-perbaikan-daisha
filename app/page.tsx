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
} from 'lucide-react';

export default function WorkshopPortalPage() {
  const router = useRouter();
  const { currentUser, isOperator, isSeksi, isLoading: authLoading } = useAuth();

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
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Workshop Management Portal
        </h1>
        <p className="text-xs text-slate-600 font-normal mt-0.5">
          Selamat datang, <span className="font-semibold text-slate-800">{currentUser?.name || 'Administrator'}</span>. Pilih modul operasional untuk mulai bekerja:
        </p>
      </div>

      {/* 2. Five Operational Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Module 1: Perbaikan Daisha */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Unit Maintenance
              </span>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Perbaikan Daisha
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Pencatatan kerusakan troli, analitik reliabilitas komponen, status antrean, dan rekapitulasi data bengkel.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/60 border-t border-slate-100 space-y-2">
            <Link
              href="/daisha"
              className="w-full h-9 px-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Dashboard Daisha</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-2 pt-0.5">
              <Link
                href="/input"
                className="flex-1 h-8 px-2.5 text-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                + Input Daisha
              </Link>
              <Link
                href="/riwayat"
                className="flex-1 h-8 px-2.5 text-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                Riwayat Tiket
              </Link>
            </div>
          </div>
        </div>

        {/* Module 2: Follow Up Request Seksi */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
                <SendHorizonal className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Special Project
              </span>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Request Seksi
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Tindak lanjut permintaan modifikasi, pembuatan alat bantu baru, estimasi pengerjaan, dan material kebutuhan seksi.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/60 border-t border-slate-100 space-y-2">
            <Link
              href="/request"
              className="w-full h-9 px-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Dashboard Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="pt-0.5">
              <Link
                href="/request"
                className="w-full h-8 px-2.5 text-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                + Buat Request Baru
              </Link>
            </div>
          </div>
        </div>

        {/* Module 3: Manajemen Spareparts */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Logistik Bengkel
              </span>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Stok Sparepart
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Pemantauan kuantitas suku cadang, alert stok menipis, log mutasi masuk/keluar, dan lokasi penyimpanan barang.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/60 border-t border-slate-100 space-y-2">
            <Link
              href="/spareparts"
              className="w-full h-9 px-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Monitoring Sparepart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="pt-0.5">
              <Link
                href="/spareparts"
                className="w-full h-8 px-2.5 text-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                Daftar Stok & Mutasi
              </Link>
            </div>
          </div>
        </div>

        {/* Module 4: Katalog Master Daisha */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Database Master
              </span>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Katalog Master Daisha
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Standarisasi hierarki master troli per seksi, daftar komponen, dan definisi gejala kerusakan untuk formulir laporan.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/60 border-t border-slate-100 space-y-2">
            <Link
              href="/catalog"
              className="w-full h-9 px-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Katalog Master</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="pt-0.5">
              <Link
                href="/catalog"
                className="w-full h-8 px-2.5 text-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
              >
                Kelola Unit & Komponen
              </Link>
            </div>
          </div>
        </div>

        {/* Module 5: Manajemen Pengguna */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Sistem & Akses
              </span>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Manajemen Pengguna
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Kelola kredensial akun operator workshop, user seksi, hak akses peran (Role), dan pengaturan keamanan sistem.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/60 border-t border-slate-100 space-y-2">
            <Link
              href="/users"
              className="w-full h-9 px-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-medium rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Manajemen Pengguna</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="pt-0.5">
              <Link
                href="/users"
                className="w-full h-8 px-2.5 text-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 flex items-center justify-center"
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