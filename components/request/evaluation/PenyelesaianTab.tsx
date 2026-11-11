import React from 'react';
import { CheckCircle2, Send, Clock, Users, DollarSign, CalendarCheck, Lock, Wrench, Package } from 'lucide-react';
import { EvaluationFormData } from './types';
import { SectionRequestFull } from '../BridgestoneRequestPrintModal';

interface PenyelesaianTabProps {
  requestData?: SectionRequestFull | null;
  formData: EvaluationFormData;
  loading: boolean;
  isApprovedBySpecialProject?: boolean;
  setFormData: React.Dispatch<React.SetStateAction<EvaluationFormData>>;
  onFinalFinish: () => void;
}

export default function PenyelesaianTab({
  requestData,
  formData,
  loading,
  isApprovedBySpecialProject = false,
  setFormData,
  onFinalFinish,
}: PenyelesaianTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Alert jika belum disetujui Atasan Special Project */}
      {!isApprovedBySpecialProject && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 flex items-center gap-2.5 text-amber-900 text-xs">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Tahap Penyelesaian Terkunci:</strong> Permohonan belum disetujui / di-assign oleh Atasan Special Project (8236). Admin bengkel belum dapat menyelesaikan request ini.
          </span>
        </div>
      )}

      {/* 1. Input Realisasi Pengerjaan Fisik (Actual di Akhir Pengerjaan) */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-xs text-slate-900">
            Realisasi Pengerjaan Akhir (Target VS Actual)
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            • Diisi setelah pekerjaan selesai
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/40 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Waktu Pengerjaan</span>
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded">
                Est: {formData.waktuEstimate || '-'}
              </span>
            </div>
            <label className="text-[11px] text-slate-600 block">Realisasi Waktu (Actual)</label>
            <input
              type="text"
              placeholder="Mis: 2.5 Hari Kerja"
              value={formData.waktuActual}
              onChange={(e) => setFormData((p) => ({ ...p, waktuActual: e.target.value }))}
              className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-red-600 outline-none"
            />
          </div>

          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>Men Power (Orang/Jam)</span>
              </span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded">
                Est: {formData.orangJamEstimate || '-'}
              </span>
            </div>
            <label className="text-[11px] text-slate-600 block">Realisasi Man-hours (Actual)</label>
            <input
              type="text"
              placeholder="Mis: 2 Orang / 3.5 Jam"
              value={formData.orangJamActual}
              onChange={(e) => setFormData((p) => ({ ...p, orangJamActual: e.target.value }))}
              className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-red-600 outline-none"
            />
          </div>

          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Biaya Akhir</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded truncate max-w-[120px]">
                Est: {formData.biayaEstimate ? `Rp ${Number(formData.biayaEstimate).toLocaleString('id-ID')}` : '-'}
              </span>
            </div>
            <label className="text-[11px] text-slate-600 block">Realisasi Biaya Aktual (Rp)</label>
            <input
              type="text"
              placeholder="Mis: Rp 210.000"
              value={formData.biayaActual}
              onChange={(e) => setFormData((p) => ({ ...p, biayaActual: e.target.value }))}
              className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-red-600 outline-none"
            />
          </div>
        </div>

        {/* 1.2 Kebutuhan Sparepart & Material (Target VS Actual) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Sparepart Actual */}
          <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/40 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-purple-900">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-purple-600" />
                <span>Kebutuhan Sparepart</span>
              </span>
              <span
                title={formData.kebutuhanSparepart || requestData?.kebutuhanSparepart || '-'}
                className="text-[10px] font-semibold text-purple-700 bg-purple-100/70 px-1.5 py-0.2 rounded truncate max-w-[140px]"
              >
                Est: {formData.kebutuhanSparepart || requestData?.kebutuhanSparepart || '-'}
              </span>
            </div>
            <label className="text-[11px] text-slate-600 block">Realisasi Sparepart (Actual)</label>
            <input
              type="text"
              placeholder="Mis: Roda PU 6 inch (4 Pcs), Bearing 6204 (4 Pcs)"
              value={formData.sparepartActual || ''}
              onChange={(e) => setFormData((p) => ({ ...p, sparepartActual: e.target.value }))}
              className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-red-600 outline-none"
            />
          </div>

          {/* Material Actual */}
          <div className="p-3 rounded-lg border border-teal-200 bg-teal-50/40 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-teal-900">
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-teal-600" />
                <span>Kebutuhan Material</span>
              </span>
              <span
                title={formData.kebutuhanMaterial || requestData?.kebutuhanMaterial || '-'}
                className="text-[10px] font-semibold text-teal-700 bg-teal-100/70 px-1.5 py-0.2 rounded truncate max-w-[140px]"
              >
                Est: {formData.kebutuhanMaterial || requestData?.kebutuhanMaterial || '-'}
              </span>
            </div>
            <label className="text-[11px] text-slate-600 block">Realisasi Material (Actual)</label>
            <input
              type="text"
              placeholder="Mis: Plat Besi SPHC 3mm [100x50 cm], Besi Hollow 40x40"
              value={formData.materialActual || ''}
              onChange={(e) => setFormData((p) => ({ ...p, materialActual: e.target.value }))}
              className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-red-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Pengecekan Akhir Pemohon & Serah Terima */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengecekan Akhir (Target VS Actual) & Serah Terima ke Seksi</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Hasil Check Pemohon (Target VS Actual)
            </label>
            <textarea
              value={formData.hasilCheck}
              onChange={(e) => setFormData((p) => ({ ...p, hasilCheck: e.target.value }))}
              rows={3}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-red-600 resize-none leading-relaxed"
              placeholder="Komentar hasil pengecekan akhir oleh pemohon setelah barang selesai diperbaiki..."
            />
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama Checker Pemohon (Serah Terima)
              </label>
              <input
                type="text"
                placeholder="Nama staf seksi yang mengecek barang"
                value={formData.hasilCheckPemohon}
                onChange={(e) => setFormData((p) => ({ ...p, hasilCheckPemohon: e.target.value }))}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs focus:border-red-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Schedule Planning & Actual
              </label>
              <input
                type="text"
                placeholder="Realisasi tanggal (mis: 02 Sep - 05 Sep 2026)"
                value={formData.scheduleActual}
                onChange={(e) => setFormData((p) => ({ ...p, scheduleActual: e.target.value }))}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs focus:border-red-600 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onFinalFinish}
            disabled={loading || !isApprovedBySpecialProject}
            className={`h-10 px-5 font-bold text-xs rounded-lg transition flex items-center gap-1.5 ${
              !isApprovedBySpecialProject
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
            } disabled:opacity-50`}
            title={
              !isApprovedBySpecialProject
                ? 'Terkunci: Menunggu persetujuan Atasan Special Project sebelum dapat menyelesaikan request'
                : undefined
            }
          >
            {!isApprovedBySpecialProject ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Selesaikan Request</span>
          </button>
        </div>
      </div>
    </div>
  );
}
