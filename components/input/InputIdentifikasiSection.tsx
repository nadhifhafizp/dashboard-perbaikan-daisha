'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Ruler, Camera, AlertTriangle, Search, X } from 'lucide-react';
import IndoDateTimeInput from '@/components/common/IndoDateTimeInput';
import DaishaVariantSelector from '@/components/input/DaishaVariantSelector';
import { FormDataState } from './useInputKerusakan';
import { Ticket } from '@/types/ticket';
import { DaishaSizeInfo } from '@/lib/daishaSize';

interface InputIdentifikasiSectionProps {
  formData: FormDataState;
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  seksiList: string[];
  pilihanDaishaTersedia: string[];
  showAllDaisha: boolean;
  detectedSize: DaishaSizeInfo | null;
  duplicateActiveTicket: Ticket | null;
  normalizedNoDaisha: string;
  matchedUnitInfo?: { source: 'history' | 'catalog'; seksi?: string; jenisDaisha: string } | null;
  applyMatchedUnit?: () => void;
  setDismissedDuplicateUnit: (val: string | null) => void;
  setIsScanning: (val: boolean) => void;
  isAdmin: boolean;
}

export default function InputIdentifikasiSection({
  formData,
  setFormData,
  handleChange,
  seksiList,
  pilihanDaishaTersedia,
  showAllDaisha,
  detectedSize,
  duplicateActiveTicket,
  normalizedNoDaisha,
  matchedUnitInfo,
  applyMatchedUnit,
  setDismissedDuplicateUnit,
  setIsScanning,
  isAdmin,
}: InputIdentifikasiSectionProps) {
  return (
    <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-red-600" />
          <span>1. Identifikasi Laporan &amp; Unit Daisha</span>
        </h2>
        {detectedSize && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${detectedSize.badgeBg} ${detectedSize.textColor} ${detectedSize.borderColor}`}
          >
            <Ruler className="w-3 h-3" />
            <span>Ukuran: {detectedSize.label} ({detectedSize.code})</span>
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* BARIS 1: NAMA PELAPOR | TANGGAL & WAKTU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="input-nama-pelapor" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Pelapor / Teknisi *
            </label>
            <input
              id="input-nama-pelapor"
              type="text"
              name="namaPelapor"
              autoComplete="name"
              value={formData.namaPelapor}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              placeholder="Ketik nama pelapor / teknisi..."
              required
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 placeholder:font-normal placeholder-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor="input-waktu-masuk"
              className="block text-xs font-semibold text-slate-700 mb-1.5 cursor-pointer"
            >
              Tanggal &amp; Waktu Masuk *
            </label>
            <IndoDateTimeInput
              id="input-waktu-masuk"
              value={formData.waktuMasuk}
              onChange={(val) => setFormData((prev) => ({ ...prev, waktuMasuk: val }))}
              required
            />
          </div>
        </div>

        {/* BARIS 2: SEKSI ASAL UNIT | TIPE / JENIS DAISHA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="input-seksi" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Seksi Asal Unit *
            </label>
            <select
              id="input-seksi"
              name="seksi"
              value={formData.seksi}
              onChange={handleChange}
              required
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
            >
              <option value="">-- Pilih Seksi --</option>
              {seksiList
                .filter((s) => s.toLowerCase() !== 'all seksi')
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-jenis-daisha" className="block text-xs font-semibold text-slate-700">
                Tipe / Jenis Daisha *
              </label>
              {formData.seksi && (
                <span className="text-xs text-slate-500">
                  Filter: <strong className="text-slate-800">{formData.seksi}</strong>
                </span>
              )}
            </div>
            <select
              id="input-jenis-daisha"
              name="jenisDaisha"
              value={formData.jenisDaisha}
              onChange={handleChange}
              required
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
            >
              <option value="">-- Pilih Jenis Daisha --</option>
              {pilihanDaishaTersedia.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="flex items-center mt-1.5">
              <input
                type="checkbox"
                name="showAll"
                id="showAll"
                checked={showAllDaisha}
                onChange={handleChange}
                className="mr-2 h-3.5 w-3.5 text-red-600 rounded border-slate-300 accent-red-600 cursor-pointer"
              />
              <label
                htmlFor="showAll"
                className="text-xs text-slate-500 cursor-pointer select-none"
              >
                Tampilkan seluruh tipe (tanpa dibatasi Seksi)
              </label>
            </div>
          </div>
        </div>

        {/* Filter & Pemilihan Varian / Susunan Daisha (PILIH VARIAN DULU BARU SCAN) */}
        {formData.jenisDaisha && (
          <div className="pt-2 border-t border-slate-100">
            <DaishaVariantSelector
              key={formData.jenisDaisha}
              jenisDaisha={formData.jenisDaisha}
              currentNoDaisha={formData.noDaisha}
              onSelectVariant={(variant) => {
                setFormData((prev) => {
                  const cleanExisting = prev.noDaisha.trim().toUpperCase().replace(/[\s\-_]/g, '');
                  const numMatch = cleanExisting.match(/\d+$/);
                  let newNo = variant.codePrefix;
                  if (numMatch) {
                    newNo = `${variant.codePrefix}${numMatch[0]}`;
                  }
                  return { ...prev, noDaisha: newNo };
                });
              }}
            />
          </div>
        )}

        {/* BARIS 3: NOMOR SERI / ID DAISHA & SCAN KAMERA */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label htmlFor="input-no-daisha" className="block text-xs font-semibold text-slate-800">
            Nomor Seri / ID Daisha *
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="input-no-daisha"
                type="text"
                name="noDaisha"
                value={formData.noDaisha}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                placeholder="Ketik atau scan barcode (Cth: M00287, I/L-0071, S00064, FIL-A-0001)"
                required
                className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none uppercase placeholder:font-normal placeholder-slate-400 tracking-wide"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsScanning(true)}
              className="h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
              title="Scan barcode fisik menggunakan kamera perangkat"
            >
              <Camera className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">Scan Kamera</span>
            </button>
          </div>

          {/* Indikator auto-match unit */}
          {matchedUnitInfo && formData.jenisDaisha === matchedUnitInfo.jenisDaisha && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-2 text-xs">
              <span className="text-emerald-900 font-medium">
                ✓ Unit otomatis terdeteksi: <strong>{matchedUnitInfo.jenisDaisha}</strong>
                {matchedUnitInfo.seksi ? ` · Seksi: ${matchedUnitInfo.seksi}` : ''}
              </span>
            </div>
          )}
          {matchedUnitInfo && formData.jenisDaisha !== matchedUnitInfo.jenisDaisha && (
            <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg flex items-center justify-between gap-2 text-xs">
              <span className="text-blue-900">
                Unit terdeteksi: <strong>{matchedUnitInfo.jenisDaisha}</strong>
                {matchedUnitInfo.seksi ? ` (${matchedUnitInfo.seksi})` : ''}
              </span>
              <button
                type="button"
                onClick={applyMatchedUnit}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition cursor-pointer shrink-0"
              >
                Terapkan
              </button>
            </div>
          )}
        </div>

        {/* Warning Card Duplikasi Unit Aktif */}
        {duplicateActiveTicket && (
          <div className="mt-3 p-4 bg-amber-50/80 border border-amber-300/80 rounded-xl text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-amber-950 text-xs">
                      Unit {duplicateActiveTicket.noDaisha} Sedang Dalam Antrean Bengkel
                    </h4>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-900">
                      Status: {duplicateActiveTicket.status}
                    </span>
                  </div>

                  <p className="text-slate-600 mt-1 font-normal text-xs">
                    Tiket ID: <strong className="font-mono text-slate-900 tabular-nums">{duplicateActiveTicket.idTiketAsli}</strong> • Seksi:{' '}
                    <strong>{duplicateActiveTicket.seksi}</strong> • Dilaporkan oleh:{' '}
                    <strong>{duplicateActiveTicket.pelapor}</strong> ({duplicateActiveTicket.tglMasuk})
                  </p>

                  {duplicateActiveTicket.detail && duplicateActiveTicket.detail !== '-' && (
                    <div className="mt-2 p-2.5 bg-white rounded-lg border border-amber-200 text-xs text-slate-700 leading-relaxed">
                      <span className="font-medium text-amber-900 block mb-0.5">
                        Rincian Kerusakan yang Sedang Berjalan:
                      </span>
                      {duplicateActiveTicket.detail}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDismissedDuplicateUnit(normalizedNoDaisha)}
                className="text-amber-700 hover:text-amber-950 p-1 rounded-lg hover:bg-amber-100 transition cursor-pointer shrink-0"
                title="Abaikan peringatan ini"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-200/70 flex flex-wrap items-center justify-between gap-2">
              <Link
                href={isAdmin ? '/admin' : '/riwayat'}
                className="h-10 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Buka Tindakan' : 'Buka Riwayat'}</span>
              </Link>

              <button
                type="button"
                onClick={() => setDismissedDuplicateUnit(normalizedNoDaisha)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                Abaikan &amp; Tetap Buat Laporan Baru
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
