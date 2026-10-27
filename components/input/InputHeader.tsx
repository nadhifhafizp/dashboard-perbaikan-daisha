'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard, ClipboardList, Settings } from 'lucide-react';

interface InputHeaderProps {
  isAdmin: boolean;
  isOperator: boolean;
}

export default function InputHeader({ isAdmin, isOperator }: InputHeaderProps) {
  return (
    <div className="border-b border-slate-100 pb-4 mb-5">
      <div className="flex items-center gap-2 mb-2.5 flex-wrap text-xs">
        {!isOperator ? (
          <>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/kpi"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-red-600" />
              <span>KPI Daisha</span>
            </Link>
            <span className="text-slate-300">/</span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-slate-600 bg-slate-100 border border-slate-200">
              <span>Workshop Daisha</span>
            </span>
            <span className="text-slate-300">/</span>
          </>
        )}
        <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
          Input Rusak
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
        <div>
          <h1 className="t-title text-slate-900 tracking-tight">Input Kerusakan</h1>
          <p className="t-caption text-slate-500 mt-0.5">
            Pencatatan laporan perbaikan unit bengkel
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isOperator && (
            <Link
              href="/kpi"
              className="h-11 sm:h-10 px-4 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition inline-flex items-center gap-1.5 border border-slate-200"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span>KPI Daisha</span>
            </Link>
          )}
          {!isAdmin && (
            <Link
              href="/riwayat"
              className={`h-11 sm:h-10 px-4 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 border ${
                isOperator
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <ClipboardList className={`w-4 h-4 ${isOperator ? 'text-white' : 'text-slate-500'}`} />
              <span>Antrean</span>
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="h-11 sm:h-10 px-4 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition inline-flex items-center gap-1.5 border border-slate-200"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Panel Admin</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
