'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Layers,
  Search,
  Check,
  Plus,
  Wrench,
  RefreshCw,
  PenTool,
  X,
  RotateCcw,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export type TindakanType = 'Repair' | 'Ganti';

interface DamageCatalogSelectorProps {
  jenisDaisha: string;
  katalogKerusakan: Record<string, string[]>;
  selectedKerusakan: string[];
  tindakanMap: Record<string, TindakanType>;
  qtyMap?: Record<string, number>;
  customKerusakanList: string[];
  customTindakanMap: Record<string, TindakanType>;
  customQtyMap?: Record<string, number>;
  onToggleKerusakan: (komponen: string, detail: string) => void;
  onSetTindakan: (key: string, tindakan: TindakanType) => void;
  onSetQty?: (key: string, qty: number) => void;
  onAddCustom: (text: string) => void;
  onRemoveCustom: (text: string) => void;
  onSetCustomTindakan: (text: string, tindakan: TindakanType) => void;
  onSetCustomQty?: (text: string, qty: number) => void;
  catatanTambahan: string;
  onCatatanChange: (val: string) => void;
}

export default function DamageCatalogSelector({
  jenisDaisha,
  katalogKerusakan,
  selectedKerusakan,
  tindakanMap,
  qtyMap = {},
  customKerusakanList,
  customTindakanMap,
  customQtyMap = {},
  onToggleKerusakan,
  onSetTindakan,
  onSetQty,
  onAddCustom,
  onRemoveCustom,
  onSetCustomTindakan,
  onSetCustomQty,
  catatanTambahan,
  onCatatanChange,
}: DamageCatalogSelectorProps) {
  const [searchGejala, setSearchGejala] = useState('');
  const [inputManualText, setInputManualText] = useState('');

  const totalDipilih = selectedKerusakan.length + customKerusakanList.length;

  const handleAddManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const t = inputManualText.trim();
    if (!t) return;
    onAddCustom(t);
    setInputManualText('');
  };

  return (
    <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
      {/* Header Section dengan Counter */}
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>3. Katalog Titik Kerusakan</span>
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Pilih komponen rusak dan tentukan tindakan perbaikan (Repair atau Ganti).
          </p>
        </div>

        {totalDipilih > 0 && (
          <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-full tabular-nums flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{totalDipilih} Kerusakan Dipilih</span>
          </span>
        )}
      </div>

      {/* Jika belum memilih jenis daisha */}
      {!jenisDaisha ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Layers className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            Pilih Seksi & Tipe Daisha Terlebih Dahulu
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Katalog komponen resmi (seperti Roda, Braket Bearing, Body Frame) akan otomatis menyesuaikan dengan tipe Daisha yang dipilih.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Filter / Search Gejala */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama komponen atau gejala (cth: roda aus, bearing pecah, kait)..."
                value={searchGejala}
                onChange={(e) => setSearchGejala(e.target.value)}
                className="w-full pl-9 pr-3 h-10 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none placeholder-slate-400 font-medium"
              />
            </div>
            {searchGejala && (
              <button
                type="button"
                onClick={() => setSearchGejala('')}
                className="px-3 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* ACTIVE WORKBENCH: Ringkasan & Konfigurasi Tindakan Kerusakan Terpilih */}
          {totalDipilih > 0 && (
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-600" />
                  <span>Daftar Kerusakan Aktif ({totalDipilih})</span>
                </span>
                <span className="text-slate-500 font-normal">Tentukan jumlah &amp; tindakan:</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedKerusakan.map((key) => {
                  const [komponen, detail] = key.split(':::');
                  const currentTindakan = tindakanMap[key] || 'Repair';
                  const currentQty = qtyMap[key] || 1;

                  return (
                    <div
                      key={key}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="min-w-0 flex-1 leading-snug">
                        <span className="text-xs font-semibold text-slate-900 block truncate">
                          {komponen}
                        </span>
                        <span className="text-xs text-slate-600 font-medium block truncate">
                          {detail}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {/* Qty Stepper */}
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => onSetQty?.(key, Math.max(1, currentQty - 1))}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded font-bold text-xs cursor-pointer transition"
                            title="Kurang"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-slate-900 tabular-nums">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onSetQty?.(key, currentQty + 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded font-bold text-xs cursor-pointer transition"
                            title="Tambah"
                          >
                            +
                          </button>
                        </div>

                        {/* Tindakan Toggle Pills */}
                        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => onSetTindakan(key, 'Repair')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1 ${
                              currentTindakan === 'Repair'
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Repair</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetTindakan(key, 'Ganti')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1 ${
                              currentTindakan === 'Ganti'
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Ganti</span>
                          </button>
                        </div>

                        {/* Hapus button */}
                        <button
                          type="button"
                          onClick={() => onToggleKerusakan(komponen, detail)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                          title="Hapus kerusakan ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {customKerusakanList.map((text) => {
                  const currentTindakan = customTindakanMap[text] || 'Repair';
                  const currentQty = customQtyMap[text] || 1;

                  return (
                    <div
                      key={text}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="min-w-0 flex-1 leading-snug">
                        <span className="text-xs font-semibold text-slate-900 block truncate">
                          Kerusakan Manual
                        </span>
                        <span className="text-xs text-slate-600 font-medium block truncate">
                          {text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => onSetCustomQty?.(text, Math.max(1, currentQty - 1))}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded font-bold text-xs cursor-pointer transition"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-slate-900 tabular-nums">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onSetCustomQty?.(text, currentQty + 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded font-bold text-xs cursor-pointer transition"
                          >
                            +
                          </button>
                        </div>

                        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => onSetCustomTindakan(text, 'Repair')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1 ${
                              currentTindakan === 'Repair'
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Repair</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetCustomTindakan(text, 'Ganti')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1 ${
                              currentTindakan === 'Ganti'
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Ganti</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveCustom(text)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                          title="Hapus kerusakan manual"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid Katalog Komponen Master Data */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {Object.entries(katalogKerusakan).map(([komponen, listGejala]) => {
              const filteredGejala = searchGejala.trim()
                ? listGejala.filter(
                    (g) =>
                      g.toLowerCase().includes(searchGejala.toLowerCase()) ||
                      komponen.toLowerCase().includes(searchGejala.toLowerCase())
                  )
                : listGejala;

              if (filteredGejala.length === 0) return null;

              return (
                <div
                  key={komponen}
                  className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2"
                >
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>{komponen}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {filteredGejala.map((gejala) => {
                      const key = `${komponen}:::${gejala}`;
                      const isSelected = selectedKerusakan.includes(key);
                      const tindakan = tindakanMap[key] || 'Repair';
                      const currentQty = qtyMap[key] || 1;

                      return (
                        <button
                          key={gejala}
                          type="button"
                          onClick={() => onToggleKerusakan(komponen, gejala)}
                          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer text-left ${
                            isSelected
                              ? tindakan === 'Ganti'
                                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                                : 'bg-amber-600 text-white font-bold shadow-2xs'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span>{gejala}</span>
                          {isSelected && (
                            <span className="text-xs px-1.5 py-0.5 bg-black/20 rounded font-semibold flex items-center gap-1 tabular-nums">
                              {currentQty > 1 && <span>({currentQty}x)</span>}
                              <span>{tindakan}</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Empty state bila pencarian tidak cocok */}
            {searchGejala.trim() &&
              !Object.entries(katalogKerusakan).some(
                ([komponen, listGejala]) =>
                  komponen.toLowerCase().includes(searchGejala.toLowerCase()) ||
                  listGejala.some((g) => g.toLowerCase().includes(searchGejala.toLowerCase()))
              ) && (
                <div className="py-8 px-4 text-center bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <Search className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-800">
                    Tidak Ditemukan Gejala Kerusakan
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Tidak ada komponen atau gejala yang cocok dengan &quot;{searchGejala}&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchGejala('')}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Pencarian</span>
                  </button>
                </div>
              )}
          </div>

          {/* Input Manual Tambahan Jika Kerusakan Tidak Ada di Daftar */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-slate-500" />
              <span>Kerusakan Lainnya / Manual (Jika tidak ada pada pilihan di atas):</span>
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputManualText}
                onChange={(e) => setInputManualText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddManualSubmit();
                  }
                }}
                placeholder="Ketik rincian kerusakan lain, lalu tekan Enter atau klik Tambah..."
                className="flex-1 px-3 h-10 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => handleAddManualSubmit()}
                className="px-4 h-10 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catatan Tambahan Posisi / Detail Tambahan */}
      <div className="pt-2 border-t border-slate-100">
        <label htmlFor="catatan-tambahan" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Catatan Lokasi / Gejala Spesifik (Opsional)
        </label>
        <textarea
          id="catatan-tambahan"
          name="catatanTambahan"
          value={catatanTambahan}
          onChange={(e) => onCatatanChange(e.target.value)}
          rows={2}
          placeholder="Contoh: Roda depan kiri aus parah, unit tertahan di line Building 3..."
          className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-800 font-normal bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none placeholder-slate-400"
        />
      </div>
    </div>
  );
}
