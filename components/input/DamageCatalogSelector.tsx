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
  Package,
} from 'lucide-react';
import { useSparepartsStock } from '@/hooks/useSparepartsStock';

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
  const { getStockInfo } = useSparepartsStock();

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
            <span>2. Katalog Titik Kerusakan</span>
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
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>{komponen}</span>
                    </span>
                    {(() => {
                      const spInfo = getStockInfo(komponen, 1);
                      if (!spInfo.found) return null;
                      return (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold border tabular-nums ${spInfo.statusBadge.bgClass} ${spInfo.statusBadge.textClass} ${spInfo.statusBadge.borderClass}`}
                          title={`Stok di gudang: ${spInfo.stokGudang} ${spInfo.satuan}`}
                        >
                          Stok: {spInfo.stokGudang} {spInfo.satuan}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                          className={`min-h-[38px] sm:min-h-[32px] px-3.5 py-2 sm:px-3 sm:py-1.5 text-xs rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer text-left active:scale-[0.98] ${
                            isSelected
                              ? tindakan === 'Ganti'
                                ? 'bg-blue-600 text-white font-bold shadow-xs ring-2 ring-blue-600/30'
                                : 'bg-amber-600 text-white font-bold shadow-xs ring-2 ring-amber-600/30'
                              : 'bg-white text-slate-700 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span>{gejala}</span>
                          {isSelected && (
                            <span className="text-[11px] px-2 py-0.5 bg-black/25 rounded font-bold flex items-center gap-1 tabular-nums ml-1">
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
                className="flex-1 px-3 h-11 sm:h-10 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => handleAddManualSubmit()}
                className="px-4 h-11 sm:h-10 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* ACTIVE WORKBENCH: Daftar Kerusakan Aktif (Ditempatkan Setelah User Menginput / Memilih Part) */}
          {totalDipilih > 0 && (
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-600" />
                  <span>Daftar Kerusakan Aktif ({totalDipilih})</span>
                </span>
                <span className="text-slate-500 font-normal">Tentukan jumlah &amp; tindakan:</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedKerusakan.map((key) => {
                  const [komponen, detail] = key.split(':::');
                  const currentTindakan = tindakanMap[key] || 'Repair';
                  const currentQty = qtyMap[key] || 1;
                  const stockInfo = getStockInfo(komponen, currentQty);

                  return (
                    <div
                      key={key}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 leading-snug">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {komponen}
                          </span>
                          <span className="text-xs text-slate-600 font-medium block">
                            {detail}
                          </span>
                        </div>

                        {/* Hapus button dengan touch target yang aman */}
                        <button
                          type="button"
                          onClick={() => onToggleKerusakan(komponen, detail)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 active:text-red-700 hover:bg-red-50 active:bg-red-100 rounded-lg transition cursor-pointer shrink-0"
                          title="Hapus kerusakan ini"
                          aria-label="Hapus kerusakan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Baris Action: Stepper Qty & Toggle Tindakan */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        {/* Qty Stepper */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-500">Qty:</span>
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => onSetQty?.(key, Math.max(1, currentQty - 1))}
                              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-white active:bg-slate-200 rounded-md font-bold text-sm cursor-pointer transition"
                              title="Kurang"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-xs text-slate-900 tabular-nums">
                              {currentQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onSetQty?.(key, currentQty + 1)}
                              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-white active:bg-slate-200 rounded-md font-bold text-sm cursor-pointer transition"
                              title="Tambah"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Tindakan Toggle Pills */}
                        <div className="flex-1 sm:flex-initial inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 min-h-[38px] sm:min-h-[34px]">
                          <button
                            type="button"
                            onClick={() => onSetTindakan(key, 'Repair')}
                            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              currentTindakan === 'Repair'
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Wrench className="w-3.5 h-3.5 shrink-0" />
                            <span>Repair</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetTindakan(key, 'Ganti')}
                            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              currentTindakan === 'Ganti'
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                            <span>Ganti</span>
                          </button>
                        </div>
                      </div>

                      {/* Tampilan Sisa Stok Gudang pada saat Tindakan Ganti */}
                      {currentTindakan === 'Ganti' && (
                        <div
                          className={`p-2 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 animate-fade-in ${
                            stockInfo.isZero
                              ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                              : !stockInfo.isCukup
                              ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Package className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span className="font-bold text-slate-900">
                              {stockInfo.found ? stockInfo.namaKomponen : komponen}:
                            </span>
                            <span>
                              Sisa Stok: <strong className="font-mono">{stockInfo.stokGudang} {stockInfo.satuan}</strong>
                            </span>
                            {stockInfo.lokasi && stockInfo.lokasi !== '-' && (
                              <span className="text-slate-500 font-normal">
                                • Lokasi: {stockInfo.lokasi}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap sm:self-auto self-end">
                            <span className="font-medium text-slate-700">
                              Sisa setelah ganti:
                              <strong className={`ml-1 font-mono ${stockInfo.sisaSetelahPakai < 0 ? 'text-rose-700 font-bold' : 'text-slate-900'}`}>
                                {stockInfo.sisaSetelahPakai} {stockInfo.satuan}
                              </strong>
                            </span>
                            {stockInfo.isZero ? (
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-600 text-white shrink-0">
                                Stok Habis (0)
                              </span>
                            ) : !stockInfo.isCukup ? (
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-600 text-white shrink-0">
                                Stok Kurang ({currentQty - stockInfo.stokGudang} lagi)
                              </span>
                            ) : stockInfo.isLow ? (
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                                Stok Menipis
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-600 text-white shrink-0">
                                ✓ Stok Cukup
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {customKerusakanList.map((text) => {
                  const currentTindakan = customTindakanMap[text] || 'Repair';
                  const currentQty = customQtyMap[text] || 1;
                  const customStockInfo = getStockInfo(text, currentQty);

                  return (
                    <div
                      key={text}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition space-y-2"
                    >
                      {/* Baris 1: Header Kerusakan Manual & Tombol Hapus */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mb-0.5">
                            Kerusakan Manual
                          </span>
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 break-words leading-snug">
                            {text}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveCustom(text)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition cursor-pointer shrink-0"
                          title="Hapus kerusakan manual"
                          aria-label={`Hapus ${text}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Baris 2: Kontrol Qty Stepper & Tindakan (Repair / Ganti) */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-1 border-t border-slate-100">
                        {/* Qty Stepper */}
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onSetCustomQty?.(text, Math.max(1, currentQty - 1))}
                            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-white active:bg-slate-200 rounded font-bold text-sm cursor-pointer transition"
                            aria-label="Kurangi jumlah"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-xs sm:text-sm text-slate-900 tabular-nums">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onSetCustomQty?.(text, currentQty + 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-white active:bg-slate-200 rounded font-bold text-sm cursor-pointer transition"
                            aria-label="Tambah jumlah"
                          >
                            +
                          </button>
                        </div>

                        {/* Tindakan Toggle: Repair vs Ganti */}
                        <div className="flex-1 min-w-[170px] grid grid-cols-2 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => onSetCustomTindakan(text, 'Repair')}
                            className={`min-h-[38px] sm:min-h-[32px] px-2 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                              currentTindakan === 'Repair'
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Wrench className="w-3.5 h-3.5 shrink-0" />
                            <span>Repair</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetCustomTindakan(text, 'Ganti')}
                            className={`min-h-[38px] sm:min-h-[32px] px-2 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                              currentTindakan === 'Ganti'
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                            <span>Ganti</span>
                          </button>
                        </div>
                      </div>

                      {/* Tampilan Sisa Stok Gudang untuk Kerusakan Manual */}
                      {currentTindakan === 'Ganti' && (
                        <div
                          className={`p-2 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 animate-fade-in ${
                            customStockInfo.isZero
                              ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                              : !customStockInfo.isCukup
                              ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Package className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span className="font-bold text-slate-900">
                              {customStockInfo.found ? customStockInfo.namaKomponen : text}:
                            </span>
                            <span>
                              Sisa Stok: <strong className="font-mono">{customStockInfo.stokGudang} {customStockInfo.satuan}</strong>
                            </span>
                            {customStockInfo.lokasi && customStockInfo.lokasi !== '-' && (
                              <span className="text-slate-500 font-normal">
                                • Lokasi: {customStockInfo.lokasi}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap sm:self-auto self-end">
                            <span className="font-medium text-slate-700">
                              Sisa setelah ganti:
                              <strong className={`ml-1 font-mono ${customStockInfo.sisaSetelahPakai < 0 ? 'text-rose-700 font-bold' : 'text-slate-900'}`}>
                                {customStockInfo.sisaSetelahPakai} {customStockInfo.satuan}
                              </strong>
                            </span>
                            {customStockInfo.isZero ? (
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-600 text-white shrink-0">
                                Stok Habis (0)
                              </span>
                            ) : !customStockInfo.isCukup ? (
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-600 text-white shrink-0">
                                Stok Kurang ({currentQty - customStockInfo.stokGudang} lagi)
                              </span>
                            ) : customStockInfo.isLow ? (
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                                Stok Menipis
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-600 text-white shrink-0">
                                ✓ Stok Cukup
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
