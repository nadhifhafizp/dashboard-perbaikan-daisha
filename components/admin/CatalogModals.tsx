'use client';

import React from 'react';
import { Layers, Wrench, Plus, Pencil, X, Sparkles, Tag } from 'lucide-react';
import { DaishaTreeItem } from '@/hooks/useDaishaCatalog';

interface AddDaishaModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: { name: string; seksi: string; codePrefix: string; totalUnits: number };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; seksi: string; codePrefix: string; totalUnits: number }>>;
  onSubmit: (e: React.FormEvent) => void;
  seksiList: string[];
}

export function AddDaishaModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  seksiList,
}: AddDaishaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-600" />
            <span>Tambah Jenis Daisha Baru</span>
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
            <label className="font-medium text-slate-700 block mb-1">Nama / Jenis Daisha</label>
            <input
              type="text"
              required
              placeholder="Contoh: Palet B/B, GT Ring, Vertical"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Seksi Plant Penempatan</label>
            <input
              type="text"
              required
              list="seksi-options-add"
              placeholder="Pilih atau ketik seksi..."
              value={form.seksi}
              onChange={(e) => setForm({ ...form, seksi: e.target.value })}
              className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden text-slate-900"
            />
            <datalist id="seksi-options-add">
              {seksiList.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Prefix Kode Unit</label>
              <input
                type="text"
                placeholder="Contoh: BAN-A-, M00, S40"
                value={form.codePrefix}
                onChange={(e) => setForm({ ...form, codePrefix: e.target.value })}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden font-mono uppercase text-slate-900"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700 block mb-1">Total Unit Armada</label>
              <input
                type="number"
                min="0"
                placeholder="Contoh: 370"
                value={form.totalUnits || ''}
                onChange={(e) => setForm({ ...form, totalUnits: Number(e.target.value) || 0 })}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden font-semibold text-slate-900"
              />
            </div>
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
              className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg cursor-pointer shadow-2xs transition"
            >
              Simpan Daisha
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
  if (!isOpen || !daishaTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
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

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Nama Varian Spesifik</label>
            <input
              type="text"
              required
              placeholder="Contoh: Small Susun 3, Type A, dll."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Ukuran Fisik</label>
              <select
                value={form.ukuran}
                onChange={(e) => setForm({ ...form, ukuran: e.target.value })}
                className="w-full h-9 px-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden text-slate-900 bg-white"
              >
                <option value="">- Tanpa Ukuran -</option>
                <option value="Small">Small (S)</option>
                <option value="Medium">Medium (M)</option>
                <option value="Large">Large (L)</option>
              </select>
            </div>
            <div>
              <label className="font-medium text-slate-700 block mb-1">Susunan Tingkat</label>
              <select
                value={form.susunan}
                onChange={(e) => setForm({ ...form, susunan: e.target.value })}
                className="w-full h-9 px-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden text-slate-900 bg-white"
              >
                <option value="">- Tanpa Susunan -</option>
                <option value="Susun 3">Susun 3</option>
                <option value="Susun 4">Susun 4</option>
              </select>
            </div>
            <div>
              <label className="font-medium text-slate-700 block mb-1">Sub-Tipe</label>
              <input
                type="text"
                placeholder="Contoh: Type A"
                value={form.tipe}
                onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                className="w-full h-9 px-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden text-slate-900"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Prefix Nomor</label>
              <input
                type="text"
                placeholder="Contoh: S30, BB-A"
                value={form.codePrefix}
                onChange={(e) => setForm({ ...form, codePrefix: e.target.value })}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden font-mono uppercase text-slate-900"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700 block mb-1">No Min Seri</label>
              <input
                type="number"
                min="1"
                value={form.minNumber || ''}
                onChange={(e) => setForm({ ...form, minNumber: Number(e.target.value) || 1 })}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden text-slate-900"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700 block mb-1">No Max Seri</label>
              <input
                type="number"
                min="1"
                value={form.maxNumber || ''}
                onChange={(e) => {
                  const max = Number(e.target.value) || 1;
                  setForm({ ...form, maxNumber: max, totalUnits: Math.max(1, max - (form.minNumber || 1) + 1) });
                }}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Total Unit Fisik</label>
              <input
                type="number"
                min="0"
                value={form.totalUnits || ''}
                onChange={(e) => setForm({ ...form, totalUnits: Number(e.target.value) || 0 })}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700 block mb-1">Format Rentang Seri</label>
              <input
                type="text"
                placeholder="Contoh: S30001 s/d S30035"
                value={form.rangeFormat}
                onChange={(e) => setForm({ ...form, rangeFormat: e.target.value })}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden text-slate-900"
              />
            </div>
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
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg cursor-pointer shadow-2xs transition"
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
  if ((isOpen !== undefined && !isOpen) || !currentDaisha) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
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
              className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden font-medium text-slate-900"
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
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg cursor-pointer shadow-2xs transition"
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
              className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg cursor-pointer shadow-2xs transition"
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
  seksi?: string;
  codePrefix?: string;
  totalUnits?: number;
  ukuran?: string;
  susunan?: string;
  tipe?: string;
  minNumber?: number;
  maxNumber?: number;
  rangeFormat?: string;
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
              {item.type === 'symptom' ? 'Deskripsi Gejala' : 'Nama Item'}
            </label>
            <input
              type="text"
              required
              value={item.name}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Prefix Kode Unit</label>
                  <input
                    type="text"
                    placeholder="Contoh: BAN-A-, M00, S40"
                    value={item.codePrefix || ''}
                    onChange={(e) => setItem({ ...item, codePrefix: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden font-mono uppercase text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Total Unit Armada</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 370"
                    value={item.totalUnits ?? ''}
                    onChange={(e) => setItem({ ...item, totalUnits: Number(e.target.value) || 0 })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden font-semibold text-slate-900"
                  />
                </div>
              </div>
            </>
          )}

          {item.type === 'variant' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Ukuran</label>
                  <select
                    value={item.ukuran || ''}
                    onChange={(e) => setItem({ ...item, ukuran: e.target.value })}
                    className="w-full h-9 px-2 border border-slate-300 rounded-lg outline-hidden text-slate-900 bg-white"
                  >
                    <option value="">-</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Susunan</label>
                  <select
                    value={item.susunan || ''}
                    onChange={(e) => setItem({ ...item, susunan: e.target.value })}
                    className="w-full h-9 px-2 border border-slate-300 rounded-lg outline-hidden text-slate-900 bg-white"
                  >
                    <option value="">-</option>
                    <option value="Susun 3">Susun 3</option>
                    <option value="Susun 4">Susun 4</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Sub-Tipe</label>
                  <input
                    type="text"
                    value={item.tipe || ''}
                    onChange={(e) => setItem({ ...item, tipe: e.target.value })}
                    className="w-full h-9 px-2 border border-slate-300 rounded-lg outline-hidden text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Prefix Kode</label>
                  <input
                    type="text"
                    value={item.codePrefix || ''}
                    onChange={(e) => setItem({ ...item, codePrefix: e.target.value })}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg font-mono uppercase text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">No Min</label>
                  <input
                    type="number"
                    value={item.minNumber ?? 1}
                    onChange={(e) => setItem({ ...item, minNumber: Number(e.target.value) || 1 })}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">No Max</label>
                  <input
                    type="number"
                    value={item.maxNumber ?? 1}
                    onChange={(e) => {
                      const max = Number(e.target.value) || 1;
                      setItem({ ...item, maxNumber: max, totalUnits: Math.max(1, max - (item.minNumber || 1) + 1) });
                    }}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Total Unit Fisik</label>
                  <input
                    type="number"
                    value={item.totalUnits ?? 0}
                    onChange={(e) => setItem({ ...item, totalUnits: Number(e.target.value) || 0 })}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Format Rentang Seri</label>
                  <input
                    type="text"
                    value={item.rangeFormat || ''}
                    onChange={(e) => setItem({ ...item, rangeFormat: e.target.value })}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </>
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
              className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg cursor-pointer shadow-2xs transition"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
