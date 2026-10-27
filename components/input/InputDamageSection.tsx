'use client';

import React from 'react';
import { Wrench, Search, Lightbulb } from 'lucide-react';
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
    <>
      {/* Mode Selector & Diagnosa Bengkel Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-red-600" />
              <span>3. Kerusakan</span>
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Pilih apakah kerusakan sudah diketahui atau perlu diinspeksi teknisi saat tiba di bengkel.
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto border border-slate-200">
            <button
              type="button"
              onClick={() => setIsDiagnosaBengkel(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                !isDiagnosaBengkel
                  ? 'bg-white text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sudah Tahu Kerusakan
            </button>
            <button
              type="button"
              onClick={() => setIsDiagnosaBengkel(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                isDiagnosaBengkel
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cek di Bengkel</span>
            </button>
          </div>
        </div>

        {/* Mode Cek di Bengkel Info Box & Symptom Note */}
        {isDiagnosaBengkel && (
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-semibold text-amber-950 text-xs">
                  Mode Fleksibel: Kerusakan Belum Diketahui Lapangan
                </p>
                <p className="text-slate-600 mt-0.5 text-xs">
                  Unit akan didaftarkan ke antrean bengkel dengan status{' '}
                  <strong className="text-amber-900">Menunggu Diagnosa Bengkel</strong>. Daisha dapat segera diangkut ke
                  bengkel, dan teknisi bengkel akan melengkapi rincian komponen rusak saat memeriksa unit fisik.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/60">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Catatan Gejala / Indikasi Awal (Opsional)
              </label>
              <input
                type="text"
                value={catatanGejala}
                onChange={(e) => setCatatanGejala(e.target.value)}
                placeholder="Contoh: Roda seret saat didorong, rangka miring, bunyi kasar di bearing..."
                className="w-full h-10 px-3 border border-amber-300/80 bg-white rounded-lg text-xs text-slate-900 font-normal focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder-slate-400"
              />
              <p className="text-xs text-slate-500 mt-1">
                Bantu teknisi bengkel dengan menuliskan apa yang Anda rasakan atau lihat saat menggunakan unit ini.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Titik Kerusakan Unit Daisha (Hanya jika mode "Sudah Tahu Kerusakan") */}
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
    </>
  );
}
