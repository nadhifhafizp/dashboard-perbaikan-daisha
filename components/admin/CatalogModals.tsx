'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Layers,
  Wrench,
  Plus,
  Pencil,
  X,
  Tag,
  Building2,
  CheckCircle2,
  Loader2,
  Trash2,
  Info,
  Sparkles,
} from 'lucide-react';
import { DaishaTreeItem } from '@/hooks/useDaishaCatalog';
import { DAFTAR_SEKSI } from '@/lib/masterData';

function useEscapeKey(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}

export interface VariantDraftItem {
  id: string;
  name: string;
  codePrefix: string;
  totalUnits: number | '';
}

export interface AddDaishaFormState {
  name: string;
  seksi: string;
  hasVariants: boolean;
  codePrefix: string;
  totalUnits: number | '';
  variants: VariantDraftItem[];
}

interface AddDaishaModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: AddDaishaFormState;
  setForm: React.Dispatch<React.SetStateAction<AddDaishaFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  seksiList: string[];
  isSubmitting?: boolean;
}

export function AddDaishaModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  seksiList,
  isSubmitting = false,
}: AddDaishaModalProps) {
  useEscapeKey(isOpen, onClose);

  // Gabungkan opsi seksi standar plant dengan list yang ada di database
  const availableSeksiOptions = useMemo(() => {
    const set = new Set<string>([...DAFTAR_SEKSI, ...seksiList]);
    return Array.from(set).filter(Boolean);
  }, [seksiList]);

  // Preview unit yang akan terbentuk untuk model standar (non-varian)
  const singlePreviewText = useMemo(() => {
    const total = Number(form.totalUnits) || 0;
    if (total <= 0) return null;

    const prefix = form.codePrefix ? form.codePrefix.trim().toUpperCase() : '';
    const cleanPrefix = form.name.trim()
      ? `${form.name.trim().replace(/[^A-Za-z0-9]/g, '').substring(0, 6).toUpperCase()}-`
      : 'DAISHA-';

    const activePrefix = prefix || cleanPrefix;
    const startNum = `${activePrefix}0001`;
    const endNum = `${activePrefix}${String(total).padStart(4, '0')}`;

    return {
      prefix: activePrefix,
      range: `${startNum} s/d ${endNum}`,
      count: total,
      isAutoPrefix: !prefix,
    };
  }, [form.codePrefix, form.totalUnits, form.name]);

  // Hitung total unit dan varian terisi untuk mode varian
  const variantSummary = useMemo(() => {
    const filledVariants = form.variants.filter((v) => v.name.trim().length > 0);
    const totalUnits = form.variants.reduce((acc, v) => acc + (Number(v.totalUnits) || 0), 0);
    return {
      count: filledVariants.length,
      totalUnits,
    };
  }, [form.variants]);

  const handleAddVariantRow = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: String(Date.now()),
          name: '',
          codePrefix: '',
          totalUnits: '',
        },
      ],
    }));
  };

  const handleRemoveVariantRow = (id: string) => {
    if (form.variants.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== id),
    }));
  };

  const handleUpdateVariantRow = (
    id: string,
    field: keyof VariantDraftItem,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v.id !== id) return v;
        if (field === 'totalUnits') {
          return { ...v, totalUnits: value === '' ? '' : Math.max(0, Number(value)) };
        }
        if (field === 'codePrefix') {
          return { ...v, codePrefix: String(value).toUpperCase() };
        }
        return { ...v, [field]: value };
      }),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Registrasi Daisha Baru
              </h3>
              <p className="text-xs text-slate-500">
                Pendaftaran jenis model armada troli untuk Seksi{' '}
                <span className="font-bold text-slate-800">{form.seksi || 'Pabrik'}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {/* Seksi & Nama Daisha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Seksi Penempatan</span>
              </label>
              <select
                value={form.seksi}
                onChange={(e) => setForm({ ...form, seksi: e.target.value })}
                className="w-full h-9.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-hidden font-bold text-slate-900 bg-white cursor-pointer"
              >
                {availableSeksiOptions.map((s) => (
                  <option key={s} value={s}>
                    Seksi {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Nama / Jenis Model Daisha <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Troli Moulding, Palet Banbury"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-9.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-hidden font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Pemilihan Sistem Varian Armada */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Apakah Jenis Daisha ini memiliki Varian Ukuran / Tipe?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, hasVariants: false }))}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  !form.hasVariants
                    ? 'border-red-600 bg-red-50/60 ring-2 ring-red-600/20'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                    !form.hasVariants ? 'border-red-600 bg-red-600' : 'border-slate-300 bg-white'
                  }`}
                >
                  {!form.hasVariants && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="font-bold text-slate-900 leading-tight">
                    Model Standar (Tanpa Varian)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Satu jenis fisik seragam tanpa perbedaan ukuran atau susun.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, hasVariants: true }))}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  form.hasVariants
                    ? 'border-red-600 bg-red-50/60 ring-2 ring-red-600/20'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                    form.hasVariants ? 'border-red-600 bg-red-600' : 'border-slate-300 bg-white'
                  }`}
                >
                  {form.hasVariants && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                    <span>Memiliki Ragam Varian</span>
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                      Multi
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Memiliki varian ukuran (Small, Medium, Large) atau susun.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* KONTEN KONDISIONAL: 1. JIKA MODEL STANDAR (TANPA VARIAN) */}
          {!form.hasVariants && (
            <div className="space-y-3 p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Prefix / Awalan Kode Unit
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: TRL-, EXT-A-, PALET-"
                    value={form.codePrefix}
                    onChange={(e) => setForm({ ...form, codePrefix: e.target.value.toUpperCase() })}
                    className="w-full h-9.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-hidden font-mono font-bold uppercase text-slate-900 bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Awalan barcode atau kode stensil troli
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Jumlah Populasi Unit Fisik
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 10, 50, 100"
                    value={form.totalUnits}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        totalUnits: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full h-9.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-hidden font-bold text-slate-900 bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Bisa diisi 0 jika unit fisik belum tiba
                  </span>
                </div>
              </div>

              {/* Live Preview Box Nomor Daisha & Panduan Non-Barcode */}
              {singlePreviewText ? (
                <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Rentang Kode Unit yang Akan Terdaftar:</span>
                    </div>
                    <span className="font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 font-bold text-[11px]">
                      {singlePreviewText.count} Unit Fisik
                    </span>
                  </div>

                  <p className="text-emerald-900 font-mono font-extrabold text-xs tracking-tight bg-white/70 p-2 rounded border border-emerald-200/80">
                    {singlePreviewText.range}
                  </p>

                  <div className="p-2 bg-emerald-100/60 rounded-lg text-[11px] text-emerald-900 space-y-0.5">
                    <p className="font-semibold flex items-center gap-1">
                      <Info className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span>Panduan Daisha Tanpa Barcode (Stensil Fisik):</span>
                    </p>
                    <p className="text-[10.5px] text-emerald-800 leading-relaxed">
                      Jika troli ini belum memiliki label barcode, gunakan format penomoran di atas{' '}
                      (<strong>{singlePreviewText.prefix}0001</strong> s/d{' '}
                      <strong>{singlePreviewText.prefix}{String(singlePreviewText.count).padStart(4, '0')}</strong>)
                      sebagai stensil cat pada bodi fisik daisha agar petugas dapat menginput laporan kerusakan dengan mudah.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1 text-slate-600">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Pendaftaran Fleksibel (0 Unit Awal)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Daisha didaftarkan ke katalog master tanpa unit fisik awal. Anda dapat langsung menginput Komponen & Gejala Kerusakan sekarang, lalu mendaftarkan nomor unit nanti.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* KONTEN KONDISIONAL: 2. JIKA MEMILIKI VARIAN (MULTI-VARIAN REPEATER) */}
          {form.hasVariants && (
            <div className="space-y-3 p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-red-600" />
                    <span>Daftar Varian untuk {form.name.trim() || 'Daisha Baru'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Masukkan setiap varian ukuran/tipe beserta awalan kode dan jumlah unitnya.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariantRow}
                  className="h-8 px-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer transition text-[11px] flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris</span>
                </button>
              </div>

              {/* Tabel / Baris Varian */}
              <div className="space-y-2">
                {form.variants.map((v, idx) => {
                  const vTotal = Number(v.totalUnits) || 0;
                  const vPrefix = v.codePrefix.trim().toUpperCase();
                  const fallbackPrefix = form.name.trim()
                    ? `${form.name.trim().replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase()}${idx + 1}-`
                    : `VAR${idx + 1}-`;
                  const activeVPrefix = vPrefix || fallbackPrefix;
                  const rangeStr =
                    vTotal > 0
                      ? `${activeVPrefix}0001 s/d ${activeVPrefix}${String(vTotal).padStart(4, '0')}`
                      : null;

                  return (
                    <div
                      key={v.id}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-[11px] text-slate-700">
                          Varian #{idx + 1}
                        </span>
                        {rangeStr && (
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">
                            {rangeStr} ({vTotal} unit)
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(v.id)}
                          disabled={form.variants.length <= 1}
                          className="w-6 h-6 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Hapus baris varian ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">
                            Nama Varian <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            required={form.hasVariants}
                            placeholder="Cth: Tipe A, Small, Susun 3"
                            value={v.name}
                            onChange={(e) => handleUpdateVariantRow(v.id, 'name', e.target.value)}
                            className="w-full h-8.5 px-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-hidden font-medium text-slate-900 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">
                            Prefix Kode
                          </label>
                          <input
                            type="text"
                            placeholder="Cth: PLT-A-, S3"
                            value={v.codePrefix}
                            onChange={(e) =>
                              handleUpdateVariantRow(v.id, 'codePrefix', e.target.value.toUpperCase())
                            }
                            className="w-full h-8.5 px-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-hidden font-mono font-bold uppercase text-slate-900 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">
                            Jumlah Unit
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Cth: 50, 100"
                            value={v.totalUnits}
                            onChange={(e) =>
                              handleUpdateVariantRow(v.id, 'totalUnits', e.target.value)
                            }
                            className="w-full h-8.5 px-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-hidden font-bold text-slate-900 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ringkasan Total Varian */}
              <div className="flex items-center justify-between p-2.5 bg-red-50/60 border border-red-200/80 rounded-xl text-xs">
                <span className="font-bold text-red-950">
                  Total Terdaftar: <strong>{variantSummary.count} Varian</strong>
                </span>
                <span className="font-mono font-bold bg-white text-red-700 px-2.5 py-1 rounded-lg border border-red-300 shadow-2xs">
                  {variantSummary.totalUnits} Unit Armada Fisik
                </span>
              </div>

              {/* Penjelasan Komponen & Gejala Seragam */}
              <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-0.5 text-amber-900 text-[11px]">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Satu Master Komponen &amp; Gejala Kerusakan:</span>
                </p>
                <p className="text-[10.5px] text-amber-800 leading-relaxed">
                  Seluruh varian yang didaftarkan di atas otomatis berbagi daftar <strong>Komponen &amp; Gejala Kerusakan</strong> yang sama di level Jenis Daisha. Anda tidak perlu menginput komponen terpisah untuk masing-masing varian.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer transition text-xs disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`h-9 px-4 text-white font-bold rounded-lg transition text-xs shadow-xs flex items-center gap-1.5 ${
                isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mendaftarkan Daisha...</span>
                </>
              ) : (
                <span>Simpan &amp; Registrasikan Daisha</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  daishaTarget: DaishaTreeItem | null;
  form: {
    name: string;
    ukuran: string;
    susunan: string;
    tipe: string;
    codePrefix: string;
    minNumber: number;
    maxNumber: number;
    totalUnits: number;
    rangeFormat: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      ukuran: string;
      susunan: string;
      tipe: string;
      codePrefix: string;
      minNumber: number;
      maxNumber: number;
      totalUnits: number;
      rangeFormat: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddVariantModal({
  isOpen,
  onClose,
  daishaTarget,
  form,
  setForm,
  onSubmit,
}: AddVariantModalProps) {
  useEscapeKey(isOpen, onClose);
  if (!isOpen || !daishaTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-red-600" />
            <span>Tambah Varian Baru: {daishaTarget.name}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Nama Varian / Ukuran <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Small, Medium, Large, Susun 3"
              value={form.name}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({ ...prev, name: val, ukuran: val }));
              }}
              className="w-full h-9.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-hidden font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Prefix Kode Unit</label>
              <input
                type="text"
                placeholder="Opsional (misal: S3, M3)"
                value={form.codePrefix}
                onChange={(e) => setForm((prev) => ({ ...prev, codePrefix: e.target.value.toUpperCase() }))}
                className="w-full h-9.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-hidden font-mono font-bold uppercase text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Awalan barcode varian</span>
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Jumlah Populasi Unit
              </label>
              <input
                type="number"
                min="0"
                placeholder="Contoh: 3, 20, 50"
                value={form.totalUnits || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({ ...prev, totalUnits: val === '' ? 0 : Number(val) }));
                }}
                className="w-full h-9.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-hidden font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Total unit armada untuk varian ini</span>
            </div>
          </div>

          {/* Live Preview Box */}
          {form.totalUnits > 0 && (
            <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Preview Format Kode Unit Varian:</span>
                </span>
                <span className="font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 font-bold text-[11px]">
                  {form.totalUnits} Unit Fisik
                </span>
              </div>
              <p className="text-emerald-900 font-mono font-extrabold text-xs tracking-tight bg-white/70 p-2 rounded border border-emerald-200/80">
                {(form.codePrefix ? form.codePrefix.trim().toUpperCase() : `${daishaTarget.name.substring(0, 4).toUpperCase()}-`)}0001 s/d{' '}
                {(form.codePrefix ? form.codePrefix.trim().toUpperCase() : `${daishaTarget.name.substring(0, 4).toUpperCase()}-`)}
                {String(form.totalUnits).padStart(4, '0')}
              </p>
              <p className="text-[10.5px] text-emerald-800">
                Format nomor di atas otomatis terdaftar ke database armada dan dapat digunakan langsung atau distensil pada bodi unit.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer transition text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer transition text-xs shadow-xs"
            >
              Simpan Varian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddComponentModalProps {
  isOpen?: boolean;
  onClose: () => void;
  daisha?: DaishaTreeItem | null;
  target?: DaishaTreeItem | null;
  componentName: string;
  setComponentName: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddComponentModal({
  isOpen,
  onClose,
  daisha,
  target,
  componentName,
  setComponentName,
  onSubmit,
}: AddComponentModalProps) {
  const currentDaisha = daisha || target;
  useEscapeKey(Boolean(isOpen && currentDaisha), onClose);
  if ((isOpen !== undefined && !isOpen) || !currentDaisha) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-red-600" />
            <span>Tambah Komponen: {currentDaisha.name}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Nama Bagian / Komponen</label>
            <input
              type="text"
              required
              placeholder="Contoh: Roda Putar, Body Frame, Gandengan"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden font-medium text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg cursor-pointer transition"
            >
              Simpan Komponen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddSymptomModalProps {
  isOpen?: boolean;
  onClose: () => void;
  target: { componentId: number; componentName: string; daishaName: string } | null;
  symptomText: string;
  setSymptomText: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddSymptomModal({
  isOpen,
  onClose,
  target,
  symptomText,
  setSymptomText,
  onSubmit,
}: AddSymptomModalProps) {
  useEscapeKey(Boolean(isOpen !== false && target), onClose);
  if ((isOpen !== undefined && !isOpen) || !target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>Tambah Gejala Kerusakan</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Komponen: <span className="font-semibold text-slate-700">{target.componentName}</span>{' '}
              ({target.daishaName})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">
              Deskripsi Masalah / Kerusakan Fisik
            </label>
            <textarea
              required
              rows={3}
              placeholder="Contoh: Roda aus dan pecah, Baud pengikat lepas / kendor"
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg cursor-pointer transition"
            >
              Simpan Gejala
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export interface EditCatalogItemState {
  type: 'daisha' | 'component' | 'symptom' | 'variant';
  id: number;
  name: string;
  oldName?: string;
  daishaName?: string;
  componentName?: string;
  oldDescription?: string;
  oldUkuran?: string;
  seksi?: string;
  codePrefix?: string;
  oldCodePrefix?: string;
  totalUnits?: number;
  ukuran?: string;
  susunan?: string;
  tipe?: string;
  minNumber?: number;
  maxNumber?: number;
  rangeFormat?: string;
  hasVariants?: boolean;
  variantsCount?: number;
}

interface EditCatalogItemModalProps {
  item: EditCatalogItemState | null;
  onClose: () => void;
  setItem: React.Dispatch<React.SetStateAction<EditCatalogItemState | null>>;
  onSubmit: (e: React.FormEvent) => void;
  seksiList: string[];
}

export function EditCatalogItemModal({
  item,
  onClose,
  setItem,
  onSubmit,
  seksiList,
}: EditCatalogItemModalProps) {
  useEscapeKey(Boolean(item), onClose);
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Pencil className="w-5 h-5 text-slate-700" />
            <span>
              Edit{' '}
              {item.type === 'daisha'
                ? 'Jenis Daisha'
                : item.type === 'variant'
                ? 'Varian Unit'
                : item.type === 'component'
                ? 'Komponen'
                : 'Gejala'}
            </span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">
              {item.type === 'symptom'
                ? 'Deskripsi Gejala'
                : item.type === 'variant'
                ? 'Nama Varian / Ukuran'
                : item.type === 'component'
                ? 'Nama Bagian / Komponen'
                : 'Nama / Model Daisha'}
            </label>
            <input
              type="text"
              required
              value={item.name}
              onChange={(e) =>
                setItem({
                  ...item,
                  name: e.target.value,
                  ...(item.type === 'variant' ? { ukuran: e.target.value } : {}),
                })
              }
              className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden font-medium text-slate-900"
            />
          </div>

          {item.type === 'daisha' && (
            <>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Seksi Penempatan</label>
                <input
                  type="text"
                  required
                  list="seksi-options-edit"
                  value={item.seksi || ''}
                  onChange={(e) => setItem({ ...item, seksi: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden text-slate-900"
                />
                <datalist id="seksi-options-edit">
                  {seksiList.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {item.hasVariants ? (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                    <span>Total Populasi Unit:</span>
                    <span className="font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                      {item.totalUnits || 0} Unit
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Daisha ini menggunakan pembagian varian armada. Jumlah unit dan kode prefix dikelola otomatis dari masing-masing varian di tabel varian.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">Prefix Kode Unit</label>
                      <input
                        type="text"
                        placeholder="Opsional (misal: TRL-)"
                        value={item.codePrefix || ''}
                        onChange={(e) => setItem({ ...item, codePrefix: e.target.value.toUpperCase() })}
                        className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden font-mono uppercase text-slate-900"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Awalan kode nomor armada
                      </span>
                    </div>
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">Total Unit Armada</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Contoh: 3, 20, 50"
                        value={item.totalUnits ?? 0}
                        onChange={(e) => setItem({ ...item, totalUnits: Number(e.target.value) || 0 })}
                        className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden font-semibold text-slate-900"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Jumlah armada model ini</span>
                    </div>
                  </div>

                  {item.codePrefix && (item.totalUnits ?? 0) > 0 && (
                    <div className="p-2.5 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-emerald-950 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Format Rentang Kode Baru:</span>
                        </span>
                        <span className="font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 font-bold text-[11px]">
                          {item.totalUnits} Unit
                        </span>
                      </div>
                      <p className="font-mono font-bold text-emerald-900 bg-white/80 p-1.5 rounded border border-emerald-200 text-xs">
                        {item.codePrefix.trim()}0001 s/d {item.codePrefix.trim()}{String(item.totalUnits).padStart(4, '0')}
                      </p>
                      <p className="text-[10.5px] text-emerald-800">
                        Menyimpan perubahan akan memperbarui seluruh nomor kode unit armada ke prefix baru secara otomatis.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {item.type === 'variant' && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Prefix Kode Unit</label>
                  <input
                    type="text"
                    placeholder="Contoh: S3, M3, TRL-"
                    value={item.codePrefix || ''}
                    onChange={(e) => setItem({ ...item, codePrefix: e.target.value.toUpperCase() })}
                    className="w-full h-9.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-hidden font-mono font-bold uppercase text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Awalan barcode varian</span>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Total Unit Fisik</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 3, 25"
                    value={item.totalUnits ?? 0}
                    onChange={(e) => setItem({ ...item, totalUnits: Number(e.target.value) || 0 })}
                    className="w-full h-9.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-hidden font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Total unit armada untuk varian ini</span>
                </div>
              </div>

              {item.codePrefix && (item.totalUnits ?? 0) > 0 && (
                <div className="p-2.5 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between text-emerald-950 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Format Rentang Kode Baru Varian:</span>
                    </span>
                    <span className="font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 font-bold text-[11px]">
                      {item.totalUnits} Unit Fisik
                    </span>
                  </div>
                  <p className="font-mono font-bold text-emerald-900 bg-white/80 p-1.5 rounded border border-emerald-200 text-xs">
                    {item.codePrefix.trim()}0001 s/d {item.codePrefix.trim()}{String(item.totalUnits).padStart(4, '0')}
                  </p>
                  <p className="text-[10.5px] text-emerald-800">
                    Menyimpan perubahan akan memperbarui seluruh nomor kode unit pada varian ini ke prefix baru secara otomatis.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg cursor-pointer transition"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
