import React from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { EvaluationFormData } from './types';

interface PenyelesaianTabProps {
  formData: EvaluationFormData;
  loading: boolean;
  setFormData: React.Dispatch<React.SetStateAction<EvaluationFormData>>;
  onFinalFinish: () => void;
}

export default function PenyelesaianTab({
  formData,
  loading,
  setFormData,
  onFinalFinish,
}: PenyelesaianTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
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
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
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
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onFinalFinish}
            disabled={loading}
            className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Selesaikan Request</span>
          </button>
        </div>
      </div>
    </div>
  );
}
