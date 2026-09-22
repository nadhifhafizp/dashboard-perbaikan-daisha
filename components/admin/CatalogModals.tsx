'use client';

import React from 'react';
import { Layers, Wrench, Plus, Pencil, X } from 'lucide-react';
import { DaishaTreeItem } from '@/hooks/useDaishaCatalog';

interface AddDaishaModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: { name: string; seksi: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; seksi: string }>>;
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
            <label className="font-medium text-slate-700 block mb-1">Nama Jenis Daisha</label>
            <input
              type="text"
              required
              placeholder="Contoh: Daisha AGV Otomatis"
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
              placeholder="Pilih atau ketik seksi baru..."
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

interface AddComponentModalProps {
  target: DaishaTreeItem | null;
  onClose: () => void;
  componentName: string;
  setComponentName: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddComponentModal({
  target,
  onClose,
  componentName,
  setComponentName,
  onSubmit,
}: AddComponentModalProps) {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-600" />
            <span>Tambah Komponen: {target.name}</span>
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
            <label className="font-medium text-slate-700 block mb-1">Nama Komponen / Bagian</label>
            <input
              type="text"
              required
              placeholder="Contoh: Roda Putar, Sensor, Hanger, Body frame..."
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
              className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg cursor-pointer shadow-2xs transition"
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
  target: { componentId: number; componentName: string; daishaName: string } | null;
  onClose: () => void;
  symptomText: string;
  setSymptomText: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddSymptomModal({
  target,
  onClose,
  symptomText,
  setSymptomText,
  onSubmit,
}: AddSymptomModalProps) {
  if (!target) return null;

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
              {target.daishaName} &middot; Komponen: <strong>{target.componentName}</strong>
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
            <label className="font-medium text-slate-700 block mb-1">Rincian / Gejala Kerusakan</label>
            <textarea
              rows={3}
              required
              placeholder="Contoh: Baut pengikat kendor/hilang, retak pada sambungan, roda macet..."
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-hidden resize-none text-slate-900"
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

interface EditCatalogItemModalProps {
  item: {
    type: 'daisha' | 'component' | 'symptom';
    id: number;
    name: string;
    seksi?: string;
  } | null;
  onClose: () => void;
  setItem: React.Dispatch<
    React.SetStateAction<{
      type: 'daisha' | 'component' | 'symptom';
      id: number;
      name: string;
      seksi?: string;
    } | null>
  >;
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
              {item.type === 'symptom' ? 'Deskripsi Gejala' : 'Nama'}
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
