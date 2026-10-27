'use client';

import React from 'react';
import { Wrench, Search, Lightbulb, CheckSquare, Stethoscope } from 'lucide-react';
import DamageCatalogSelector, { TindakanType } from '@/components/input/DamageCatalogSelector';
import { FormDataState } from './useInputKerusakan';

interface InputDamageSectionProps {
  formData: FormDataState;
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  isDiagnosaBengkel: boolean;
  setIsDiagnosaBengkel: (val: boolean) => void;
  catatanGejala: string;
  setCatatanGejala: (val: string) => void;
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
  isDiagnosaBengkel,
  setIsDiagnosaBengkel,
  catatanGejala,
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
  return (
    <div className="space-y-4">
      {/* Mode Selector Card */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Wrench className="w-4 h-4 text-red-600" />
            <span>Mode Pelaporan Kerusakan</span>
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Pilih metode identifikasi kerusakan yang paling sesuai dengan kondisi lapangan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsDiagnosaBengkel(false)}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
              !isDiagnosaBengkel
                ? 'bg-red-50/70 border-red-500 ring-1 ring-red-500 text-red-950'
                : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              !isDiagnosaBengkel ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">Rinci Kerusakan Sekarang</span>
              <span className="text-xs text-slate-500 font-normal mt-0.5 block">
                Pilih komponen rusak (Roda, Frame, dll) dari katalog.
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsDiagnosaBengkel(true)}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
              isDiagnosaBengkel
                ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-500 text-amber-950'
                : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isDiagnosaBengkel ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">Cek Fisik di Bengkel</span>
              <span className="text-xs text-slate-500 font-normal mt-0.5 block">
                Kirim unit segera, diagnosa dilakukan teknisi bengkel.
              </span>
            </div>
          </button>
        </div>

        {/* Mode Cek di Bengkel: Friendly info box & gejala */}
        {isDiagnosaBengkel && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3 text-xs animate-fade-in mt-3">
            <div className="flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-bold text-amber-950 text-xs">
                  Mode Diagnosa Lapangan: Daisha Segera Masuk Antrean
                </p>
                <p className="text-slate-600 mt-0.5 text-xs">
                  Unit akan didaftarkan ke antrean bengkel dengan status <strong className="text-amber-900">Open (Menunggu Diagnosa)</strong>. Teknisi bengkel akan melengkapi rincian komponen saat pemeriksaan fisik tiba.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/60">
              <label htmlFor="catatan-gejala-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                Catatan Gejala / Indikasi Awal (Opsional)
              </label>
              <input
                id="catatan-gejala-input"
                type="text"
                value={catatanGejala}
                onChange={(e) => setCatatanGejala(e.target.value)}
                placeholder="Contoh: Roda seret saat didorong, rangka miring, bunyi kasar di bearing..."
                className="w-full h-10 px-3 border border-amber-300 bg-white rounded-lg text-xs text-slate-900 font-normal focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none placeholder-slate-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Titik Kerusakan Unit Daisha (Hanya jika mode "Rinci Kerusakan Sekarang") */}
      {!isDiagnosaBengkel && (
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
