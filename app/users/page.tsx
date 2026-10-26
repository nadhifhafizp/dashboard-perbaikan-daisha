'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserManager from '@/components/admin/UserManager';

export default function UsersPage() {
  const { currentUser, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Memuat data pengguna...</p>
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
          Khusus untuk Administrator Workshop.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 h-10 px-4 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header Halaman (Flat Layout) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Link href="/" className="inline-flex items-center gap-1 font-medium hover:text-slate-900 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">Pengguna</span>
          </nav>
          <h1 className="t-title text-slate-900 tracking-tight">
            Akun Pengguna
          </h1>
          <p className="t-caption text-slate-500">
            Kredensial dan hak akses akun workshop
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="h-11 sm:h-10 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      {/* Konten Utama User Manager */}
      <UserManager />
    </div>
  );
}
