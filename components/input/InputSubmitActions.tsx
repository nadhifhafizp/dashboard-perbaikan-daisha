'use client';

import React from 'react';
import { Truck, Clock, Save } from 'lucide-react';
import { TicketStatus } from '@/types/ticket';

interface InputSubmitActionsProps {
  isDiagnosaBengkel: boolean;
  isAdmin: boolean;
  isOperator: boolean;
  loading: boolean;
  onSubmit: (e?: React.FormEvent, targetStatus?: TicketStatus) => void;
}

export default function InputSubmitActions({
  isDiagnosaBengkel,
  isAdmin,
  isOperator,
  loading,
  onSubmit,
}: InputSubmitActionsProps) {
  if (isDiagnosaBengkel) {
    return (
      <button
        type="button"
        onClick={(e) => onSubmit(e, 'Open')}
        disabled={loading}
        className="w-full h-11 text-white font-medium text-xs sm:text-sm rounded-lg transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer bg-amber-600 hover:bg-amber-700 shadow-xs"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Menyimpan ke Sistem Workshop...</span>
          </>
        ) : (
          <>
            <Truck className="w-4 h-4" />
            <span>Daftarkan Unit (Status Open)</span>
          </>
        )}
      </button>
    );
  }

  if (isAdmin || isOperator) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={(e) => onSubmit(e, 'Pending')}
          disabled={loading}
          className="w-full h-11 sm:h-12 text-white font-medium text-xs sm:text-sm rounded-lg transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer bg-amber-600 hover:bg-amber-700 shadow-xs"
          title="Simpan tiket dengan status Pending jika sparepart pengganti belum tersedia"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Menyimpan Pending...</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              <span>Pending (Tunggu Part)</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={(e) => onSubmit(e, 'Progress')}
          disabled={loading}
          className="w-full h-11 sm:h-12 text-white font-medium text-xs sm:text-sm rounded-lg transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 shadow-xs"
          title="Simpan tiket dan otomatis mulai pengerjaan dengan status Progress"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Menyimpan & Proses...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan & Proses</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => onSubmit(e, 'Open')}
      disabled={loading}
      className="w-full h-11 text-white font-medium text-xs sm:text-sm rounded-lg transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 shadow-xs"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Menyimpan ke Sistem Workshop...</span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          <span>Simpan Laporan</span>
        </>
      )}
    </button>
  );
}
