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
} from 'lucide-react';

export default function WorkshopPortalPage() {
  const router = useRouter();
  const { currentUser, isOperator, isSeksi, isLoading: authLoading } = useAuth();

  // Role Redirect: Operator → /input, User Seksi → /request
  useEffect(() => {
    if (!authLoading && currentUser) {
      if (isOperator) {
        router.replace('/input');
      } else if (isSeksi) {
        router.replace('/request');
      }
    }
  }, [authLoading, currentUser, isOperator, isSeksi, router]);

  // Jika bukan admin (atau sedang cek auth), tampilkan loading
  if (authLoading || isOperator || isSeksi) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Mengarahkan ke halaman kerja Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* 1. Header Minimalis */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Workshop Management Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Selamat datang, <span className="font-bold text-slate-800">{currentUser?.name || 'Administrator'}</span>. Silakan pilih sistem kerja:
        </p>
      </div>

      {/* 2. Kartu Sistem Kerja Utama (Murni Navigasi Card, Tanpa Angka Total) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ================= KARTU 1: PERBAIKAN DAISHA ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-red-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
          <div className="h-1.5 bg-red-600" />
          
          <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center font-black group-hover:bg-red-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-red-700 transition">
                Perbaikan Daisha
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Monitoring, rekap perbaikan troli & analitik unit
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-50/70 border-t border-slate-100 space-y-2">
            <Link
              href="/daisha"
              className="w-full py-3 px-4 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Buka Dashboard Daisha</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/input"
                className="flex-1 py-1.5 px-2 text-center text-[11px] font-bold text-slate-600 hover:text-red-700 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200"
              >
                + Input Daisha
              </Link>
              <Link
                href="/riwayat"
                className="flex-1 py-1.5 px-2 text-center text-[11px] font-bold text-slate-600 hover:text-red-700 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200"
              >
                Riwayat Tiket
              </Link>
            </div>
          </div>
        </div>

        {/* ================= KARTU 2: FOLLOW UP REQUEST SEKSI ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
          <div className="h-1.5 bg-blue-600" />

          <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <SendHorizonal className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition">
                Request Seksi
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Tindak lanjut pesanan pembuatan alat & modifikasi
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-50/70 border-t border-slate-100 space-y-2">
            <Link
              href="/request"
              className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Buka Dashboard Request</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <div className="pt-1">
              <Link
                href="/request"
                className="block w-full py-1.5 px-2 text-center text-[11px] font-bold text-slate-600 hover:text-blue-700 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200"
              >
                + Buat Request Baru
              </Link>
            </div>
          </div>
        </div>

        {/* ================= KARTU 3: STOK SPAREPART ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
          <div className="h-1.5 bg-emerald-600" />

          <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition">
                Stok Sparepart
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Inventaris persediaan suku cadang & logistik bengkel
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-50/70 border-t border-slate-100 space-y-2">
            <Link
              href="/spareparts"
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Buka Monitoring Sparepart</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <div className="pt-1">
              <Link
                href="/spareparts"
                className="block w-full py-1.5 px-2 text-center text-[11px] font-bold text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200"
              >
                Daftar Stok & Mutasi
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bar Pintas Admin (Manajemen Pengguna) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Manajemen Pengguna & Hak Akses</h4>
            <p className="text-xs text-slate-400 mt-0.5">Kelola akun login seksi, operator, dan admin sistem</p>
          </div>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Kelola Pengguna</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}