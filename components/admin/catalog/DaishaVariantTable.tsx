'use client';

import React from 'react';
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react';
import { DaishaTreeItem } from '@/hooks/useDaishaCatalog';
import { EditCatalogItemState } from '../CatalogModals';

interface DaishaVariantTableProps {
  daisha: DaishaTreeItem;
  onOpenAddVariant: (daisha: DaishaTreeItem) => void;
  onEditVariant: (state: EditCatalogItemState) => void;
  onDeleteVariant: (item: {
    type: 'variant';
    id: number;
    title: string;
    description: string;
  }) => void;
}

export default function DaishaVariantTable({
  daisha,
  onOpenAddVariant,
  onEditVariant,
  onDeleteVariant,
}: DaishaVariantTableProps) {
  const variants = daisha.variants || [];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-red-600" />
          <span className="font-bold text-slate-900 text-xs">
            Varian & Rentang Seri Armada
          </span>
          <span className="text-slate-400 font-normal text-xs">
            ({variants.length} varian terdaftar)
          </span>
        </div>
        <button
          type="button"
          onClick={() => onOpenAddVariant(daisha)}
          className="text-xs font-semibold text-red-700 hover:text-red-900 px-2 py-0.5 bg-red-50 hover:bg-red-100 rounded border border-red-200 cursor-pointer transition flex items-center gap-1"
          title="Tambah varian baru untuk jenis Daisha ini"
        >
          <Plus className="w-3 h-3" />
          <span>+ Varian Unit</span>
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="text-slate-400 text-xs italic py-1">
          Belum ada rincian varian terpisah. Unit ini menggunakan konfigurasi tunggal. Klik &quot;+ Varian Unit&quot; untuk memecah spesifikasi.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {variants.map((v) => (
            <div
              key={v.id}
              className="p-2.5 rounded border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex items-start justify-between gap-2 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-900 truncate">
                    {v.name}
                  </span>
                  {v.ukuran && (
                    <span className="px-1.5 py-0.2 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                      {v.ukuran}
                    </span>
                  )}
                  {v.susunan && (
                    <span className="px-1.5 py-0.2 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {v.susunan}
                    </span>
                  )}
                  {v.tipe && (
                    <span className="px-1.5 py-0.2 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                      {v.tipe}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                  {v.codePrefix && (
                    <span className="text-slate-700 font-semibold">
                      {v.codePrefix}
                    </span>
                  )}
                  <span>
                    {v.rangeFormat || `No. ${v.minNumber} s/d ${v.maxNumber}`}
                  </span>
                  <span className="font-bold text-slate-800">
                    ({v.totalUnits} unit)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onEditVariant({
                      type: 'variant',
                      id: v.id,
                      name: v.name,
                      ukuran: v.ukuran || '',
                      susunan: v.susunan || '',
                      tipe: v.tipe || '',
                      codePrefix: v.codePrefix || '',
                      minNumber: v.minNumber || 1,
                      maxNumber: v.maxNumber || 1,
                      totalUnits: v.totalUnits || 0,
                      rangeFormat: v.rangeFormat || '',
                    })
                  }
                  className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                  title="Edit varian"
                  aria-label="Edit varian"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onDeleteVariant({
                      type: 'variant',
                      id: v.id,
                      title: `Hapus Varian: ${v.name}`,
                      description: `Apakah Anda yakin ingin menghapus varian "${v.name}"?`,
                    })
                  }
                  className="p-1 text-red-400 hover:text-red-700 rounded cursor-pointer"
                  title="Hapus varian"
                  aria-label="Hapus varian"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
