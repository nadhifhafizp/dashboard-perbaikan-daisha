'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CatalogManager from '@/components/admin/CatalogManager';

export default function CatalogPage() {
  const { currentUser, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Memuat Katalog Master Daisha...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">Akses Terbatas</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Halaman Katalog Master Daisha hanya dapat diakses oleh Administrator Workshop.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Portal</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="inline-flex items-center gap-1 font-medium hover:text-slate-900 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">Katalog Master Daisha</span>
          </nav>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Katalog Master Daisha</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5">
              Kelola standarisasi hierarki data: Seksi Asal → Unit Daisha → Komponen → Gejala Kerusakan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Portal Utama</span>
          </Link>
        </div>
      </div>

      {/* Konten Utama Catalog Manager */}
      <CatalogManager />
    </div>
  );
}
