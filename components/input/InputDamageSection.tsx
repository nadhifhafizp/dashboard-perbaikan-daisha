'use client';

import React from 'react';
import { Clock, CheckCircle2, Search } from 'lucide-react';
import DamageCatalogSelector, { TindakanType } from '@/components/input/DamageCatalogSelector';
import { FormDataState } from './useInputKerusakan';

interface InputDamageSectionProps {
  formData: FormDataState;
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  isAdmin?: boolean;
  isOperator?: boolean;
  isDiagnosaBengkel?: boolean;
  setIsDiagnosaBengkel?: (val: boolean) => void;
  catatanGejala?: string;
  setCatatanGejala?: (val: string) => void;
  katalogKerusakan: Record<string, string[]>;
  selectedKerusakan: string[];
  tindakanMap: Record<string, TindakanType>;
  qtyMap: Record<string, number>;
  customKerusakanList: string[];
  customTindakanMap: Record<string, TindakanType>;
  customQtyMap: Record<string, number>;
  toggleKerusakan: (komponen: string, detail: string) => void;
  setItemTindakan: (key: string, tindakan: TindakanType) => void;
  setItemQty: (key: string, qty: number) => void;
  handleAddCustom: (text: string) => void;
  handleRemoveCustom: (text: string) => void;
  setCustomTindakan: (text: string, tindakan: TindakanType) => void;
  setCustomItemQty: (text: string, qty: number) => void;
}

export default function InputDamageSection({
  formData,
  setFormData,
  isAdmin = false,
  isOperator = false,
  isDiagnosaBengkel = false,
  setIsDiagnosaBengkel,
  catatanGejala = '',
  setCatatanGejala,
  katalogKerusakan,
  selectedKerusakan,
  tindakanMap,
  qtyMap,
  customKerusakanList,
  customTindakanMap,
  customQtyMap,
  toggleKerusakan,
  setItemTindakan,
  setItemQty,
  handleAddCustom,
  handleRemoveCustom,
  setCustomTindakan,
  setCustomItemQty,
}: InputDamageSectionProps) {
  const canDeferDiagnosis = isAdmin || isOperator;

  return (
    <div className="space-y-4">
      {/* Pilihan Khusus Role Operator & Admin: Opsi Jangan Input Kerusakan Dulu */}
      {canDeferDiagnosis && (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-slate-800">
                Pilihan Input Kerusakan (Role: {isAdmin ? 'Admin' : 'Operator'})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pilih apakah titik kerusakan ingin dirinci sekarang atau didaftarkan dulu untuk dicek di bengkel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row bg-white p-1 rounded-xl border border-slate-200 text-xs shrink-0 shadow-2xs w-full sm:w-auto gap-1 sm:gap-0">
            <button
              type="button"
              onClick={() => setIsDiagnosaBengkel?.(false)}
              className={`px-3.5 py-2.5 sm:py-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-2 min-h-[42px] sm:min-h-[36px] ${
                !isDiagnosaBengkel
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Input Kerusakan Sekarang</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDiagnosaBengkel?.(true)}
              className={`px-3.5 py-2.5 sm:py-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-2 min-h-[42px] sm:min-h-[36px] ${
                isDiagnosaBengkel
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Cek di Bengkel (Ditunda)</span>
            </button>
          </div>
        </div>
      )}

      {/* Jika Mode Jangan Input Dulu Aktif */}
      {isDiagnosaBengkel ? (
        <div className="p-4 sm:p-5 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-3.5 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Mode Cek di Bengkel Aktif (Input Kerusakan Ditunda)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unit <strong>{formData.noDaisha ? formData.noDaisha.toUpperCase() : 'Daisha'}</strong> akan didaftarkan ke antrean bengkel dengan status <strong className="text-amber-800">Open</strong>. Titik kerusakan, tindakan (Repair/Ganti), dan suku cadang dapat ditentukan nanti oleh mekanik setelah unit tiba di bengkel.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Catatan Gejala / Keluhan Awal (Opsional)
            </label>
            <input
              type="text"
              placeholder="Misal: Roda depan berisik saat belok, stopper agak macet, atau unit terasa goyang..."
              value={catatanGejala}
              onChange={(e) => setCatatanGejala?.(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:bg-white focus:border-amber-600 text-slate-800"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Catatan ini akan tersimpan sebagai keterangan awal untuk teknisi bengkel.
            </span>
          </div>
        </div>
      ) : (
        /* Katalog Titik Kerusakan Unit Daisha - Tampil jika mode input aktif */
        <DamageCatalogSelector
          jenisDaisha={formData.jenisDaisha}
          katalogKerusakan={katalogKerusakan}
          selectedKerusakan={selectedKerusakan}
          tindakanMap={tindakanMap}
          qtyMap={qtyMap}
          customKerusakanList={customKerusakanList}
          customTindakanMap={customTindakanMap}
          customQtyMap={customQtyMap}
          onToggleKerusakan={toggleKerusakan}
          onSetTindakan={setItemTindakan}
          onSetQty={setItemQty}
          onAddCustom={handleAddCustom}
          onRemoveCustom={handleRemoveCustom}
          onSetCustomTindakan={setCustomTindakan}
          onSetCustomQty={setCustomItemQty}
          catatanTambahan={formData.catatanTambahan}
          onCatatanChange={(val) => setFormData((prev) => ({ ...prev, catatanTambahan: val }))}
        />
      )}
    </div>
  );
}
