'use client';

import React from 'react';
import { Truck, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { TicketStatus } from '@/types/ticket';

interface InputSubmitActionsProps {
  isDiagnosaBengkel: boolean;
  isAdmin: boolean;
  isOperator: boolean;
  loading: boolean;
  totalDamageCount?: number;
  noDaisha?: string;
  onSubmit: (e?: React.FormEvent, targetStatus?: TicketStatus) => void;
}

export default function InputSubmitActions({
  isDiagnosaBengkel,
  isAdmin,
  isOperator,
  loading,
  totalDamageCount = 0,
  noDaisha = '',
  onSubmit,
}: InputSubmitActionsProps) {
  const displayNo = noDaisha.trim() ? noDaisha.trim().toUpperCase() : 'Unit';

  if (isDiagnosaBengkel) {
    return (
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Target Pendaftaran:</span>
          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Diagnosa Fisik Bengkel
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => onSubmit(e, 'Open')}
          disabled={loading}
          className="w-full h-12 text-white font-bold text-xs sm:text-sm rounded-xl transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer bg-amber-600 hover:bg-amber-700 shadow-xs"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Mendaftarkan {displayNo}...</span>
            </>
          ) : (
            <>
              <Truck className="w-4 h-4" />
              <span>Daftarkan {displayNo} ke Antrean Bengkel (Status Open)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>
    );
  }

  if (isAdmin || isOperator) {
    return (
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Ringkasan Input:</span>
          <span className="font-semibold text-slate-800">
            {displayNo} • <strong className="text-red-600">{totalDamageCount} Kerusakan</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={(e) => onSubmit(e, 'Pending')}
            disabled={loading}
            className="w-full h-12 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-200/80"
            title="Simpan tiket dengan status Pending jika sparepart pengganti belum tersedia"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pending (Tunggu Part)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => onSubmit(e, 'Progress')}
            disabled={loading}
            className="w-full h-12 text-white font-bold text-xs sm:text-sm rounded-xl transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 shadow-sm"
            title="Simpan tiket dan otomatis mulai pengerjaan dengan status Progress"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan &amp; Memproses...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan &amp; Mulai Proses</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Unit Pelaporan:</span>
        <span className="font-semibold text-slate-800">
          {displayNo} • <strong className="text-red-600">{totalDamageCount} Kerusakan</strong>
        </span>
      </div>
      <button
        type="button"
        onClick={(e) => onSubmit(e, 'Open')}
        disabled={loading}
        className="w-full h-12 text-white font-bold text-xs sm:text-sm rounded-xl transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 shadow-xs"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Mengirim Laporan...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Kirim Laporan Kerusakan</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </>
        )}
      </button>
    </div>
  );
}
