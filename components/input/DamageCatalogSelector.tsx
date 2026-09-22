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
    <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Titik Kerusakan Unit Daisha</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih kerusakan di bawah (bisa pilih banyak sekaligus, atur jumlah unit & tindakan)
          </p>
        </div>

        {jenisDaisha && totalDipilih > 0 && (
          <span className="px-3 py-1 bg-red-600 text-white font-medium text-xs rounded-full shadow-xs tabular-nums">
            {totalDipilih} Titik Kerusakan Dipilih
          </span>
        )}
      </div>

      {/* Jika belum memilih jenis daisha */}
      {!jenisDaisha ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-600">
            Pilih Jenis Daisha di atas terlebih dahulu
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Katalog komponen dan daftar kerusakan akan otomatis muncul di sini
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Filter / Search Gejala */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama komponen atau gejala kerusakan (misal: roda, kait, tiang)..."
                value={searchGejala}
                onChange={(e) => setSearchGejala(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-red-600 outline-none placeholder-slate-400"
              />
            </div>
            {searchGejala && (
              <button
                type="button"
                onClick={() => setSearchGejala('')}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Grid Katalog Komponen Master Data */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
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
                  className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2"
                >
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
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
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span>{gejala}</span>
                          {isSelected && (
                            <span className="text-xs px-1.5 py-0.2 bg-black/20 rounded font-medium flex items-center gap-1 tabular-nums">
                              {currentQty > 1 && <span>({currentQty}x)</span>}
                              {tindakan === 'Ganti' ? (
                                <RefreshCw className="w-3 h-3 inline" />
                              ) : (
                                <Wrench className="w-3 h-3 inline" />
                              )}
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
          </div>

          {/* Panel Tindakan & Jumlah (Qty) */}
          {totalDipilih > 0 && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 animate-fade-in">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-slate-600" />
                    <span>Tentukan Jumlah & Tindakan (Repair / Ganti)</span>
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tentukan jumlah unit/komponen yang rusak serta pilihan servis atau ganti baru
                  </p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md tabular-nums">
                  {totalDipilih} Titik Kerusakan
                </span>
              </div>

              <div className="space-y-2">
                {selectedKerusakan.map((key, idx) => {
                  const [komponen, detail] = key.split(':::');
                  const currentTindakan = tindakanMap[key] || 'Repair';
                  const currentQty = qtyMap[key] || 1;

                  return (
                    <div
                      key={key}
                      className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 text-xs flex items-center justify-center font-medium shrink-0 tabular-nums">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1 leading-snug">
                          <span className="text-xs font-medium text-slate-600">
                            {komponen}
                          </span>
                          <span className="text-slate-400 mx-1.5">•</span>
                          <span className="text-xs text-slate-900 font-semibold break-words">
                            {detail}
                          </span>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
                        {/* Qty Stepper */}
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-xs text-slate-500 mr-0.5">Jumlah:</span>
                          <button
                            type="button"
                            onClick={() =>
                              onSetQty && onSetQty(key, Math.max(1, currentQty - 1))
                            }
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center cursor-pointer transition"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={currentQty}
                            onChange={(e) =>
                              onSetQty &&
                              onSetQty(key, Math.max(1, parseInt(e.target.value, 10) || 1))
                            }
                            className="w-7 text-center font-semibold text-xs text-slate-900 focus:outline-none tabular-nums"
                          />
                          <button
                            type="button"
                            onClick={() => onSetQty && onSetQty(key, currentQty + 1)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center cursor-pointer transition"
                          >
                            +
                          </button>
                          <span className="text-xs text-slate-400">pcs</span>
                        </div>

                        {/* Tindakan Buttons */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onSetTindakan(key, 'Repair')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                              currentTindakan === 'Repair'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Repair</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetTindakan(key, 'Ganti')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                              currentTindakan === 'Ganti'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Ganti</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {customKerusakanList.map((text, idx) => {
                  const currentTindakan = customTindakanMap[text] || 'Repair';
                  const currentQty = customQtyMap[text] || 1;

                  return (
                    <div
                      key={text}
                      className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 text-xs flex items-center justify-center font-medium shrink-0 tabular-nums">
                          {selectedKerusakan.length + idx + 1}
                        </span>
                        <div className="min-w-0 flex-1 leading-snug">
                          <span className="text-xs font-medium text-slate-600">
                            Lainnya (Manual)
                          </span>
                          <span className="text-slate-400 mx-1.5">•</span>
                          <span className="text-xs text-slate-900 font-semibold break-words">
                            {text}
                          </span>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
                        {/* Custom Qty Stepper */}
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-xs text-slate-500 mr-0.5">Jumlah:</span>
                          <button
                            type="button"
                            onClick={() =>
                              onSetCustomQty &&
                              onSetCustomQty(text, Math.max(1, currentQty - 1))
                            }
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center cursor-pointer transition"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={currentQty}
                            onChange={(e) =>
                              onSetCustomQty &&
                              onSetCustomQty(text, Math.max(1, parseInt(e.target.value, 10) || 1))
                            }
                            className="w-7 text-center font-semibold text-xs text-slate-900 focus:outline-none tabular-nums"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onSetCustomQty && onSetCustomQty(text, currentQty + 1)
                            }
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center cursor-pointer transition"
                          >
                            +
                          </button>
                          <span className="text-xs text-slate-400">pcs</span>
                        </div>

                        {/* Custom Tindakan Buttons */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onSetCustomTindakan(text, 'Repair')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                              currentTindakan === 'Repair'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Repair</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetCustomTindakan(text, 'Ganti')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                              currentTindakan === 'Ganti'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Ganti</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Manual Tambahan Jika Kerusakan Tidak Ada di Daftar */}
          <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-2">
            <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
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
                placeholder="Ketik kerusakan lainnya, lalu klik Tambah..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddManualSubmit()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {customKerusakanList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {customKerusakanList.map((text) => (
                  <span
                    key={text}
                    className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 text-xs font-medium rounded-lg flex items-center gap-1.5"
                  >
                    <span>{text}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveCustom(text)}
                      className="text-red-600 hover:text-red-900 cursor-pointer ml-1"
                      aria-label={`Hapus ${text}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Catatan Tambahan Posisi / Detail Tambahan */}
      <div className="pt-2">
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Catatan Tambahan Lokasi / Keterangan Posisi (Opsional)
        </label>
        <textarea
          name="catatanTambahan"
          value={catatanTambahan}
          onChange={(e) => onCatatanChange(e.target.value)}
          rows={2}
          placeholder="Contoh: Roda depan kiri aus parah, kait gandengan aus, unit tertahan di line..."
          className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-800 font-normal bg-white focus:ring-2 focus:ring-red-600 outline-none"
        ></textarea>
      </div>
    </div>
  );
}
