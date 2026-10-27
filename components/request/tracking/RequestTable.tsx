'use client';

import React from 'react';
import {
  ClipboardList,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Share2,
  Printer,
  Wrench,
  Trash2,
  Building2,
  User,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import FlowchartTracker from '@/components/request/FlowchartTracker';
import { SectionRequestFull } from '@/components/request/BridgestoneRequestPrintModal';
import { UrgensiBadge } from './types';

interface RequestTableProps {
  requests: SectionRequestFull[];
  filtered: SectionRequestFull[];
  loading: boolean;
  isAdmin: boolean;
  onResetFilter: () => void;
  onOpenPrint: (req: SectionRequestFull) => void;
  onOpenEval: (req: SectionRequestFull) => void;
  onOpenShareApproval: (req: SectionRequestFull) => void;
  onRequestDelete: (req: SectionRequestFull) => void;
}

export default function RequestTable({
  requests,
  filtered,
  loading,
  isAdmin,
  onResetFilter,
  onOpenPrint,
  onOpenEval,
  onOpenShareApproval,
  onRequestDelete,
}: RequestTableProps) {
  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <>
      {/* Mobile View: Cards */}
      <div className="divide-y divide-slate-100 md:hidden">
        {loading && !requests.length ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-2">
            <ClipboardList className="w-8 h-8 text-slate-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-800">
              Tidak Ada Request yang Cocok
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Silakan ubah filter tab atau buat permohonan request baru.
            </p>
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="p-4 space-y-3 bg-white hover:bg-slate-50/60 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                    {r.nomorRequest}
                  </span>
                  <span className="text-xs text-slate-500 font-medium ml-1.5 tabular-nums">
                    • {formatDate(r.waktuDibuat)}
                  </span>
                </div>
                <FlowchartTracker currentStep={r.flowStep} isCompact />
              </div>

              <div>
                <div className="text-sm font-bold text-slate-900">
                  {r.perihal || r.namaBarang}
                </div>
                {r.namaMachine && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    Mesin:{' '}
                    <span className="font-medium text-slate-700">
                      {r.namaMachine}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{r.seksiPemohon}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{r.picPemohon}</span>
                </span>
                <span className="text-slate-300">•</span>
                <UrgensiBadge urgensi={r.urgensi} />
              </div>

              {/* Status Approval Atasan Seksi */}
              <div className="pt-1">
                {r.statusApprovalAtasanSeksi === 'APPROVED' ? (
                  <div className="text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Disetujui Foreman:{' '}
                      <strong>{r.foreman || r.namaAtasanSeksi}</strong>
                    </span>
                  </div>
                ) : r.statusApprovalAtasanSeksi === 'REJECTED' ? (
                  <div className="text-xs text-rose-800 bg-rose-50 px-2 py-1 rounded border border-rose-200 flex items-center gap-1.5 font-medium">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>
                      Ditolak Atasan: <strong>{r.alasanTolak || '-'}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        Menunggu persetujuan atasan (
                        {r.emailAtasanSeksi || 'Atasan Seksi'})
                      </span>
                    </span>
                    {r.approvalToken && (
                      <button
                        type="button"
                        onClick={() => onOpenShareApproval(r)}
                        className="text-xs text-red-600 underline font-bold cursor-pointer"
                      >
                        Link Assign
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 flex-wrap">
                <button
                  type="button"
                  onClick={() => onOpenPrint(r)}
                  className="flex-1 h-11 sm:h-10 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cetak Form</span>
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onOpenEval(r)}
                    className="h-11 sm:h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Evaluasi</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/70 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200/80 select-none">
              <th scope="col" className="p-3.5">No. Request</th>
              <th scope="col" className="p-3.5">Tanggal</th>
              <th scope="col" className="p-3.5">Seksi / PIC</th>
              <th scope="col" className="p-3.5">Perihal / Mesin</th>
              <th scope="col" className="p-3.5">Status Flowchart</th>
              <th scope="col" className="p-3.5">Assign Atasan Seksi</th>
              <th scope="col" className="p-3.5 text-center">Formulir Cetak</th>
              {isAdmin && (
                <th scope="col" className="p-3.5 text-center">Kelola Alur</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && !requests.length ? (
              <tr>
                <td
                  colSpan={isAdmin ? 8 : 7}
                  className="p-8 text-center text-slate-500 font-medium"
                >
                  Memuat data request seksi...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="p-12 text-center">
                  <ClipboardList className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <div className="text-slate-800 font-semibold text-sm mb-1">
                    Tidak Ada Request yang Cocok
                  </div>
                  <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">
                    Tidak ditemukan permohonan request pada kriteria filter terpilih.
                  </p>
                  <button
                    type="button"
                    onClick={onResetFilter}
                    className="inline-flex items-center gap-1.5 h-10 px-4 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filter</span>
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-mono font-bold text-slate-800 tabular-nums">
                    {r.nomorRequest}
                  </td>
                  <td className="p-3.5 text-slate-500 tabular-nums">
                    {formatDate(r.waktuDibuat)}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900">
                      {r.seksiPemohon}
                    </div>
                    <div className="text-xs text-slate-500">
                      PIC: {r.drafter || r.picPemohon}
                    </div>
                  </td>
                  <td className="p-3.5 max-w-[200px]">
                    <div
                      className="font-semibold text-slate-900 truncate"
                      title={r.perihal || r.namaBarang}
                    >
                      {r.perihal || r.namaBarang}
                    </div>
                    {r.namaMachine && (
                      <div
                        className="text-xs text-slate-500 truncate"
                        title={r.namaMachine}
                      >
                        {r.namaMachine}
                      </div>
                    )}
                  </td>
                  <td className="p-3.5">
                    <FlowchartTracker currentStep={r.flowStep} isCompact />
                    {r.status?.toLowerCase().includes('material habis') && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          <span>Pending Material</span>
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-3.5">
                    {r.statusApprovalAtasanSeksi === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Foreman: {r.foreman || r.namaAtasanSeksi}</span>
                      </span>
                    ) : r.statusApprovalAtasanSeksi === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-800 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Ditolak Atasan</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Menunggu Assign</span>
                        </span>
                        {r.approvalToken && (
                          <button
                            type="button"
                            onClick={() => onOpenShareApproval(r)}
                            className="p-1 rounded hover:bg-slate-200 text-red-600 transition cursor-pointer"
                            title="Salin / Buka Link Approval Atasan"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => onOpenPrint(r)}
                      className="inline-flex items-center gap-1.5 h-10 min-h-[40px] px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 transition cursor-pointer"
                      title="Pratinjau & Cetak Dokumen ENG-KP-011"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Cetak Form</span>
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenEval(r)}
                          className="h-10 min-h-[40px] px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                          title="Evaluasi Pekerjaan & Follow-up Flowchart"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Evaluasi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDelete(r)}
                          className="h-9 w-9 sm:h-10 sm:w-10 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition cursor-pointer flex items-center justify-center"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
