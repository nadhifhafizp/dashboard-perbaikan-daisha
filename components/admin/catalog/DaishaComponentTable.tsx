'use client';

import React from 'react';
import { Wrench, Plus, Pencil, Trash2 } from 'lucide-react';
import { DaishaTreeItem } from '@/hooks/useDaishaCatalog';
import { EditCatalogItemState } from '../CatalogModals';

interface DaishaComponentTableProps {
  daisha: DaishaTreeItem;
  onOpenAddSymptom: (target: {
    componentId: number;
    componentName: string;
    daishaName: string;
  }) => void;
  onEditItem: (state: EditCatalogItemState) => void;
  onDeleteItem: (item: {
    type: 'component' | 'symptom';
    id: number;
    title: string;
    description: string;
  }) => void;
}

export default function DaishaComponentTable({
  daisha,
  onOpenAddSymptom,
  onEditItem,
  onDeleteItem,
}: DaishaComponentTableProps) {
  const components = daisha.components || [];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-900 text-xs">
            Komponen & Gejala Kerusakan
          </span>
          <span className="text-slate-400 font-normal text-xs">
            ({components.length} komponen)
          </span>
        </div>
      </div>

      {components.length === 0 ? (
        <div className="text-slate-400 text-xs italic py-2 text-center">
          Belum ada komponen yang terdaftar untuk jenis Daisha ini.
        </div>
      ) : (
        <div className="space-y-2.5">
          {components.map((comp) => (
            <div
              key={comp.id}
              className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-900 text-xs">
                    {comp.name}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({comp.symptoms.length} gejala)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenAddSymptom({
                        componentId: comp.id,
                        componentName: comp.name,
                        daishaName: daisha.name,
                      })
                    }
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer transition flex items-center gap-1"
                    title="Tambah gejala kerusakan pada komponen ini"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Gejala</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onEditItem({
                        type: 'component',
                        id: comp.id,
                        name: comp.name,
                      })
                    }
                    className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                    title="Edit nama komponen"
                    aria-label="Edit nama komponen"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onDeleteItem({
                        type: 'component',
                        id: comp.id,
                        title: `Hapus Komponen: ${comp.name}`,
                        description: `Apakah Anda yakin ingin menghapus komponen "${comp.name}"? Semua ${comp.symptoms.length} gejala di dalamnya akan ikut terhapus.`,
                      })
                    }
                    className="p-1 text-red-400 hover:text-red-700 rounded cursor-pointer"
                    title="Hapus komponen"
                    aria-label="Hapus komponen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Symptoms List */}
              {comp.symptoms.length === 0 ? (
                <p className="text-xs text-slate-400 italic pl-4">
                  Belum ada gejala kerusakan yang dicatat.
                </p>
              ) : (
                <div className="pl-4 space-y-1">
                  {comp.symptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-white border border-slate-200/60 hover:border-slate-300 transition"
                    >
                      <span className="text-slate-700">
                        {symptom.description}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onEditItem({
                              type: 'symptom',
                              id: symptom.id,
                              name: symptom.description,
                            })
                          }
                          className="p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                          title="Edit teks gejala"
                          aria-label="Edit teks gejala"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onDeleteItem({
                              type: 'symptom',
                              id: symptom.id,
                              title: `Hapus Gejala: ${symptom.description}`,
                              description: `Apakah Anda yakin ingin menghapus gejala "${symptom.description}"?`,
                            })
                          }
                          className="p-0.5 text-red-400 hover:text-red-600 rounded cursor-pointer"
                          title="Hapus gejala"
                          aria-label="Hapus gejala"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
