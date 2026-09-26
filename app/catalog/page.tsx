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
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-slate-900 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portal Utama</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700">Workshop Daisha</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">Katalog Master</span>
        </nav>

        <Link
          href="/fleet"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition inline-flex items-center gap-1"
        >
          <span>Ke Kontrol Armada →</span>
        </Link>
      </div>

      {/* Konten Utama Catalog Manager */}
      <CatalogManager />
    </div>
  );
}
