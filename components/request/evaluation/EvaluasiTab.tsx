import React from 'react';
import {
  Clock,
  Users,
  DollarSign,
  Wrench,
  Package,
  Shield,
  ArrowRight,
  Ban,
  FileText,
} from 'lucide-react';
import { SectionRequestFull } from '../BridgestoneRequestPrintModal';
import { EvaluationFormData } from './types';
import { getSeksiCode } from '@/lib/nomorSurat';

interface EvaluasiTabProps {
  requestData: SectionRequestFull;
  formData: EvaluationFormData;
  loading: boolean;
  setFormData: React.Dispatch<React.SetStateAction<EvaluationFormData>>;
  onDecisionLanjut: () => void;
  onDecisionTolak: () => void;
}

export default function EvaluasiTab({
  requestData,
  formData,
  loading,
  setFormData,
  onDecisionLanjut,
  onDecisionTolak,
}: EvaluasiTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Ringkasan Permohonan Pemohon */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-slate-500 font-medium block">Perihal / Mesin:</span>
          <span className="font-semibold text-slate-800">
            {requestData.perihal || requestData.namaBarang} ({requestData.namaMachine || '-'})
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block">Alasan Permohonan:</span>
          <span className="text-slate-800">{requestData.alasan || '-'}</span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block">Tujuan & Qty:</span>
          <span className="font-semibold text-slate-800">
            {requestData.tujuan || 'Safety'} • {requestData.jumlah || 1} {requestData.satuan || 'Set'}
          </span>
        </div>
      </div>

      {/* Pengaturan Nomor Surat Resmi Workshop (Format: NO/Seksi/Romawi/Tahun) */}
      <div className="p-3.5 bg-white rounded-xl border border-red-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-slate-900">
              Nomor Surat / Tiket Resmi (Format: NO/Seksi/Romawi/Tahun)
            </span>
          </div>
          {formData.nomorSurat ? (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ Nomor Surat Aktif
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
              Otomatis terbit saat disetujui
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={formData.nomorSurat}
            onChange={(e) => setFormData((p) => ({ ...p, nomorSurat: e.target.value }))}
            placeholder={`Contoh: 001/${getSeksiCode(requestData.seksiPemohon)}/X/2026 (Diterbitkan otomatis saat approve)`}
            className="flex-1 h-10 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder:font-normal placeholder-slate-400 focus:bg-white focus:border-red-600 outline-none uppercase tracking-wide"
          />
        </div>
        <p className="text-xs text-slate-500">
          Penomoran terpusat 1 urutan global dari Workshop/Special Project. Diterbitkan otomatis begitu Anda menyetujui request ini, atau dapat disesuaikan manual.
        </p>
      </div>

      {/* Form Input Evaluasi (Waktu, Man Power, Biaya) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>1. Estimasi Waktu</span>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Planning (Hari / Tanggal)</label>
            <input
              type="text"
              placeholder="Mis: 3 Hari Kerja"
              value={formData.waktuEstimate}
              onChange={(e) => setFormData((p) => ({ ...p, waktuEstimate: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Realisasi (Actual)</label>
            <input
              type="text"
              placeholder="Mis: 2.5 Hari Kerja"
              value={formData.waktuActual}
              onChange={(e) => setFormData((p) => ({ ...p, waktuActual: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs mt-1"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
            <Users className="w-4 h-4 text-amber-600" />
            <span>2. Men Power (Orang/Jam)</span>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Estimasi Man-hours</label>
            <input
              type="text"
              placeholder="Mis: 2 Orang / 4 Jam"
              value={formData.orangJamEstimate}
              onChange={(e) => setFormData((p) => ({ ...p, orangJamEstimate: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Realisasi Man-hours</label>
            <input
              type="text"
              placeholder="Mis: 2 Orang / 3.5 Jam"
              value={formData.orangJamActual}
              onChange={(e) => setFormData((p) => ({ ...p, orangJamActual: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs mt-1"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Estimasi Biaya (Rp)</span>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Estimasi Biaya</label>
            <input
              type="text"
              placeholder="Mis: Rp 250.000"
              value={formData.biayaEstimate}
              onChange={(e) => setFormData((p) => ({ ...p, biayaEstimate: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Realisasi Biaya</label>
            <input
              type="text"
              placeholder="Mis: Rp 210.000"
              value={formData.biayaActual}
              onChange={(e) => setFormData((p) => ({ ...p, biayaActual: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs mt-1"
            />
          </div>
        </div>
      </div>

      {/* Rencana Evaluasi 4 Aspek: Sparepart & Material */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
            <Wrench className="w-4 h-4 text-indigo-600" />
            <span>3. Rencana Kebutuhan Sparepart</span>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Estimasi Sparepart Pengganti</label>
            <input
              type="text"
              placeholder="Mis: Bearing 6204 Nachi (2 pcs), Roda 6 Inch (2 pcs)"
              value={formData.kebutuhanSparepart}
              onChange={(e) => setFormData((p) => ({ ...p, kebutuhanSparepart: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs mt-1"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
            <Package className="w-4 h-4 text-amber-600" />
            <span>4. Rencana Kebutuhan Material & Plat</span>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Estimasi Bahan Fabrikasi / Plat / Las</label>
            <input
              type="text"
              placeholder="Mis: Plat besi 3mm luas ±1500 cm², Kawat las LB-52 1 kg"
              value={formData.kebutuhanMaterial}
              onChange={(e) => setFormData((p) => ({ ...p, kebutuhanMaterial: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs mt-1"
            />
          </div>
        </div>
      </div>

      {/* Action Box: Keputusan Pekerjaan (Lanjut atau Tolak) */}
      <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/70 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-red-600" />
            <span>Keputusan Evaluasi PIC Workshop</span>
          </span>
          <span className="text-xs text-slate-500">
            Kirim notifikasi otomatis ke Atasan Special Project
          </span>
        </div>

        {/* Input Alasan Tolak */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Alasan Penolakan (Hanya diisi jika menetapkan TOLAK):
          </label>
          <input
            type="text"
            value={formData.alasanTolak}
            onChange={(e) => setFormData((p) => ({ ...p, alasanTolak: e.target.value }))}
            placeholder="Contoh: Keterbatasan mesin bubut workshop / spesifikasi di luar wewenang bengkel"
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <button
            type="button"
            onClick={onDecisionLanjut}
            disabled={loading}
            className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Setujui Request</span>
          </button>

          <button
            type="button"
            onClick={onDecisionTolak}
            disabled={loading}
            className="h-10 px-4 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-lg border border-rose-300 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
            <span>Tolak Permohonan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
