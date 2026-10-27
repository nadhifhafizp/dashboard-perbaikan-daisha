'use client';

import React from 'react';
import {
  Send,
  Search,
  Plus,
  X,
  Info,
  MapPin,
  RefreshCw,
  BellRing,
} from 'lucide-react';
import { FleetUnit } from '../FleetExplorer';

interface HandoverBatchFormProps {
  seksi: string;
  selectedUnits: string[];
  setSelectedUnits: React.Dispatch<React.SetStateAction<string[]>>;
  manualInputText: string;
  setManualInputText: (text: string) => void;
  filteredSuggestions: FleetUnit[];
  inputAlert: { message: string; type: 'info' | 'error' } | null;
  setInputAlert: (alert: { message: string; type: 'info' | 'error' } | null) => void;
  lokasiPenjemputan: string;
  setLokasiPenjemputan: (loc: string) => void;
  catatan: string;
  setCatatan: (catatan: string) => void;
  submitting: boolean;
  onAddManualUnits: (rawText?: string) => void;
  onToggleUnit: (noDaisha: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function HandoverBatchForm({
  seksi,
  selectedUnits,
  setSelectedUnits,
  manualInputText,
  setManualInputText,
  filteredSuggestions,
  inputAlert,
  setInputAlert,
  lokasiPenjemputan,
  setLokasiPenjemputan,
  catatan,
  setCatatan,
  submitting,
  onAddManualUnits,
  onToggleUnit,
  onSubmit,
}: HandoverBatchFormProps) {
  const quickLocations = [
    `Staging Area Line 1 ${seksi}`,
    `Staging Area Line 2 ${seksi}`,
    `Area Finishing Bay ${seksi}`,
    `Pintu Masuk Seksi ${seksi}`,
    `Parkir Daisha Depan Pos QC ${seksi}`,
  ];

  return (
    <div
      id="section-batch-form"
      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 space-y-4"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Send className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Formulir Penyiapan & Penjemputan PM ke Bengkel (Fleksibel)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Unit yang disiapkan bisa acak/random. Anda bisa menarik unit ke staging
            dulu, lalu ketik/paste nomornya di bawah ini.
          </p>
        </div>

        {selectedUnits.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedUnits([]);
              setInputAlert(null);
            }}
            className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer"
          >
            Kosongkan Pilihan ({selectedUnits.length})
          </button>
        )}
      </div>

      {/* Input Bebas Nomor Daisha (Ketik / Scan / Paste) */}
      <div className="space-y-2">
        <label
          htmlFor="pm-manual-input"
          className="block text-xs font-bold text-slate-800 flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Input Nomor Daisha yang Disiapkan</span>
          </span>
          <span className="text-xs font-normal text-slate-500">
            Bisa ketik banyak sekaligus (pisahkan koma atau spasi)
          </span>
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              id="pm-manual-input"
              type="text"
              value={manualInputText}
              onChange={(e) => setManualInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddManualUnits();
                }
              }}
              placeholder="Ketik atau paste nomor Daisha (contoh: M021, M055, M104) lalu tekan Enter…"
              className="w-full h-10 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 font-medium text-slate-900 bg-slate-50/50 hover:bg-white"
            />
            {manualInputText && (
              <button
                type="button"
                onClick={() => setManualInputText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onAddManualUnits()}
            disabled={!manualInputText.trim()}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah ke Daftar</span>
          </button>
        </div>

        {/* Autocomplete Suggestions Pills saat mengetik */}
        {filteredSuggestions.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
            <span className="text-xs text-slate-500 font-medium">
              Saran unit belum PM:
            </span>
            {filteredSuggestions.map((u) => (
              <button
                key={u.nomor_daisha}
                type="button"
                onClick={() => onAddManualUnits(u.nomor_daisha)}
                className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200 transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-slate-400" />
                <span>{u.nomor_daisha}</span>
              </button>
            ))}
          </div>
        )}

        {/* Feedback Info Box */}
        {inputAlert && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{inputAlert.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setInputAlert(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Selected Units Chip Bar */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <span>Daisha yang Siap Dijemput</span>
            <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
              {selectedUnits.length} Unit
            </span>
          </span>

          {selectedUnits.length > 0 && (
            <span className="text-xs text-slate-500">
              Klik ikon silang pada unit jika ingin membatalkan
            </span>
          )}
        </div>

        {selectedUnits.length === 0 ? (
          <div className="py-2 text-center text-slate-500 text-xs italic">
            Belum ada Daisha di dalam daftar. Anda bisa mengetik/paste nomor unit
            pada kolom di atas, atau klik tombol bantuan kuota pada tabel di bawah.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pt-1">
            {selectedUnits.map((no) => (
              <span
                key={no}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs"
              >
                <span>{no}</span>
                <button
                  type="button"
                  onClick={() => onToggleUnit(no)}
                  className="hover:bg-emerald-700 rounded p-0.5 cursor-pointer"
                  title={`Hapus ${no}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Form Titik Lokasi & Catatan */}
      <form onSubmit={onSubmit} className="space-y-3.5 pt-1">
        <div>
          <label
            htmlFor="pm-lokasi-penjemputan"
            className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
            <span>Titik Lokasi Penjemputan di Seksi {seksi} *</span>
          </label>

          {/* Quick Location Pills */}
          <div className="flex flex-wrap gap-1 mb-1.5">
            {quickLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLokasiPenjemputan(loc)}
                className={`text-xs px-2.5 py-1 rounded-md border transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                  lokasiPenjemputan === loc
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          <input
            id="pm-lokasi-penjemputan"
            name="lokasiPenjemputan"
            type="text"
            autoComplete="off"
            value={lokasiPenjemputan}
            onChange={(e) => setLokasiPenjemputan(e.target.value)}
            placeholder="Contoh: Staging Area Line 2 Building depan Bay 4…"
            className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 font-medium text-slate-900"
            required
          />
        </div>

        <div>
          <label
            htmlFor="pm-catatan-kesiapan"
            className="block text-xs font-bold text-slate-800 mb-1"
          >
            Catatan Kesiapan{' '}
            <span className="text-slate-400 font-normal">(Opsional)</span>
          </label>
          <input
            id="pm-catatan-kesiapan"
            name="catatanKesiapan"
            type="text"
            autoComplete="off"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Contoh: Unit sudah bersih dari muatan, rem roda terkunci, siap ditarik shift 1…"
            className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 text-slate-800"
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            {selectedUnits.length > 0
              ? `${selectedUnits.length} Daisha siap dikirimkan lokasinya ke tim Workshop maintenance.`
              : 'Pilih atau ketik nomor Daisha di atas untuk mengaktifkan tombol kirim.'}
          </span>

          <button
            type="submit"
            disabled={submitting || selectedUnits.length === 0}
            className="w-full sm:w-auto h-10 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            {submitting ? (
              <>
                <RefreshCw
                  className="w-3.5 h-3.5 animate-spin"
                  aria-hidden="true"
                />
                <span>Mengirim Notifikasi…</span>
              </>
            ) : (
              <>
                <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  Kirim Pengingat Penjemputan ({selectedUnits.length} Unit)
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
