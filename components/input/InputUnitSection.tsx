'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Ruler, Camera, AlertTriangle, Search, X } from 'lucide-react';
import DaishaVariantSelector from '@/components/input/DaishaVariantSelector';
import { FormDataState } from './useInputKerusakan';
import { Ticket } from '@/types/ticket';
import { DaishaSizeInfo } from '@/lib/daishaSize';

interface InputUnitSectionProps {
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
  setDismissedDuplicateUnit: (val: string | null) => void;
  setIsScanning: (val: boolean) => void;
  isAdmin: boolean;
}

export default function InputUnitSection({
  formData,
  setFormData,
  handleChange,
  seksiList,
  pilihanDaishaTersedia,
  showAllDaisha,
  detectedSize,
  duplicateActiveTicket,
  normalizedNoDaisha,
  setDismissedDuplicateUnit,
  setIsScanning,
  isAdmin,
}: InputUnitSectionProps) {
  return (
    <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80">
      <h2 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Layers className="w-4 h-4 text-red-600" />
        <span>2. Unit</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="input-seksi" className="block text-xs font-medium text-slate-700 mb-1.5">
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
          <label htmlFor="input-jenis-daisha" className="block text-xs font-medium text-slate-700 mb-1.5">
            Tipe / Jenis Daisha *
          </label>
          <select
            id="input-jenis-daisha"
            name="jenisDaisha"
            value={formData.jenisDaisha}
            onChange={handleChange}
            required
            disabled={!formData.seksi && !showAllDaisha}
            className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
          >
            <option value="">
              {formData.seksi || showAllDaisha
                ? '-- Pilih Jenis Daisha --'
                : 'Pilih Seksi Terlebih Dahulu'}
            </option>
            {pilihanDaishaTersedia.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          name="showAll"
          id="showAll"
          checked={showAllDaisha}
          onChange={handleChange}
          className="mr-2 h-4 w-4 text-red-600 rounded border-slate-300 accent-red-600 cursor-pointer"
        />
        <label
          htmlFor="showAll"
          className="text-xs text-slate-600 font-medium cursor-pointer select-none"
        >
          Tampilkan seluruh jenis Daisha di dropdown tanpa terikat filter Seksi
        </label>
      </div>

      {/* Filter & Pemilihan Varian / Susunan Daisha */}
      {formData.jenisDaisha && (
        <div className="mb-4">
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

      {/* Nomor Unit & Barcode Scanner Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-3 border-t border-slate-100">
        <div>
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <label htmlFor="input-no-daisha" className="block text-xs font-medium text-slate-700">
              Nomor Unit Daisha *
            </label>
            {detectedSize && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${detectedSize.badgeBg} ${detectedSize.textColor} ${detectedSize.borderColor}`}
              >
                <Ruler className="w-3 h-3" />
                <span>Ukuran: {detectedSize.label}</span>
              </span>
            )}
          </div>
          <input
            id="input-no-daisha"
            type="text"
            name="noDaisha"
            value={formData.noDaisha}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            placeholder="Ketik atau scan barcode (Cth: M00287, S00064)"
            required
            className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none uppercase placeholder-slate-400"
          />
          {detectedSize ? (
            <span className={`text-xs font-normal mt-1 block ${detectedSize.textColor}`}>
              Otomatis terdeteksi: <strong>{detectedSize.description}</strong> dari awalan &apos;{detectedSize.code}&apos;
            </span>
          ) : (
            <span className="text-xs text-slate-500 mt-1 block">
              Awalan kode: <strong>S</strong> = Small, <strong>M</strong> = Medium, <strong>L</strong> = Large
            </span>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsScanning(true)}
            className="w-full h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Barcode / QR Kamera</span>
          </button>
        </div>
      </div>

      {/* Warning Card Duplikasi Unit Aktif */}
      {duplicateActiveTicket && (
        <div className="mt-4 p-4 bg-amber-50/80 border border-amber-300/80 rounded-xl text-xs">
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
              Abaikan & Tetap Buat Laporan Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
