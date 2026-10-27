'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard, ClipboardList, Wrench } from 'lucide-react';

interface InputHeaderProps {
  isAdmin: boolean;
  isOperator: boolean;
}

export default function InputHeader({ isAdmin, isOperator }: InputHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Breadcrumb Path */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Portal</span>
        </Link>
        <span className="text-slate-300">/</span>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
        >
          <Wrench className="w-3.5 h-3.5 text-red-600" />
          <span>Perbaikan Daisha</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
          Input Kerusakan
        </span>
      </div>

      {/* Main Page Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Input Kerusakan Unit</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Pencatatan cepat laporan kerusakan daisha dan pendaftaran ke antrean servis workshop.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isOperator && (
            <Link
              href="/kpi"
              className="h-10 px-3.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition inline-flex items-center gap-1.5 border border-slate-200"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span>KPI Daisha</span>
            </Link>
          )}

          {isAdmin ? (
            <Link
              href="/admin"
              className="h-10 px-4 text-xs font-bold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-50 rounded-lg transition inline-flex items-center gap-1.5 border border-slate-200 shadow-2xs"
            >
              <Wrench className="w-4 h-4 text-red-600" />
              <span>Kembali ke Tindakan Workshop</span>
            </Link>
          ) : (
            <Link
              href="/riwayat"
              className="h-10 px-4 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition inline-flex items-center gap-1.5 border border-slate-200"
            >
              <ClipboardList className="w-4 h-4 text-slate-500" />
              <span>Lihat Antrean Tiket</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
