'use client';

import React, { useState, useMemo } from 'react';
import { DaishaVariantInfo } from '@/lib/daishaVariants';
import { useDaishaCatalog } from '@/hooks/useDaishaCatalog';
import { SlidersHorizontal, CheckCircle2, Info, Layers, Sparkles } from 'lucide-react';

interface DaishaVariantSelectorProps {
  jenisDaisha: string;
  currentNoDaisha: string;
  onSelectVariant: (variant: DaishaVariantInfo) => void;
}

export default function DaishaVariantSelector({
  jenisDaisha,
  currentNoDaisha,
  onSelectVariant,
}: DaishaVariantSelectorProps) {
  const [filterUkuran, setFilterUkuran] = useState<string>('ALL');
  const [filterSusunan, setFilterSusunan] = useState<string>('ALL');
  const { getVariantsForDaisha } = useDaishaCatalog();

  const dynamicVariants = useMemo(() => getVariantsForDaisha(jenisDaisha), [getVariantsForDaisha, jenisDaisha]);

  const variants = useMemo<DaishaVariantInfo[]>(() => {
    if (dynamicVariants && dynamicVariants.length > 0) {
      return dynamicVariants.map((v) => ({
        id: String(v.id),
        name: v.name,
        ukuran: (v.ukuran as 'Small' | 'Medium' | 'Large') || undefined,
        susunan: (v.susunan as 'Susun 3' | 'Susun 4') || undefined,
        tipe: v.tipe || undefined,
        codePrefix: v.codePrefix || '',
        padLength: v.padLength ?? 0,
        minNumber: v.minNumber ?? 1,
        maxNumber: v.maxNumber ?? 1,
        totalUnits: v.totalUnits ?? 0,
        rangeFormat: v.rangeFormat || '',
        badgeColor: v.badgeColor || undefined,
      }));
    }
    return [];
  }, [dynamicVariants]);

  // Deteksi varian aktif berdasarkan nomor unit yang sudah terketik di input
  const activeVariantId = useMemo(() => {
    if (!currentNoDaisha || variants.length === 0) return null;
    const cleanNo = currentNoDaisha.trim().toUpperCase().replace(/[\s\-_]/g, '');

    for (const v of variants) {
      const cleanPrefix = v.codePrefix.replace(/[\s\-_]/g, '').toUpperCase();
      if (cleanNo.startsWith(cleanPrefix)) {
        return v.id;
      }
    }
    return null;
  }, [currentNoDaisha, variants]);

  // Khusus Seksi Building: KB drum / Jikogu, Transfer reel belt, Transfer reproses
  const isNoBarcodeDaisha = useMemo(() => {
    const lower = (jenisDaisha || '').toLowerCase();
    return (
      lower.includes('kb drum') ||
      lower.includes('jikogu') ||
      lower.includes('transfer reel belt') ||
      lower.includes('transfer reproses')
    );
  }, [jenisDaisha]);

  if (isNoBarcodeDaisha) {
    return (
      <div className="mt-3 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <p className="font-bold text-blue-950">Identifikasi Nomor Fisik Fleksibel</p>
          <p className="mt-0.5 text-blue-800">
            Unit <b>{jenisDaisha}</b> dapat diisi nomor fisiknya secara bebas pada kolom nomor Daisha di bawah. Seluruh komponen dan gejala kerusakan tetap tersedia lengkap.
          </p>
        </div>
      </div>
    );
  }

  if (variants.length === 0) {
    return null;
  }

  const isGTRing = jenisDaisha.toLowerCase().includes('gt ring');

  // Filter khusus GT Ring (Ukuran S/M/L dan Susun 3/4)
  const filteredVariants = variants.filter((v) => {
    if (filterUkuran !== 'ALL' && v.ukuran !== filterUkuran) return false;
    if (filterSusunan !== 'ALL' && v.susunan !== filterSusunan) return false;
    return true;
  });

  return (
    <div className="mt-3 p-3.5 sm:p-4 bg-slate-50/90 border border-slate-200/90 rounded-xl shadow-2xs">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-red-100 border border-red-200 flex items-center justify-center text-red-700">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Pilih Varian {jenisDaisha}
            </h3>
            <p className="text-[11px] text-slate-500">
              Klik salah satu varian di bawah untuk mengisi awalan kode & menyaring nomor yang sah secara otomatis.
            </p>
          </div>
        </div>

        {activeVariantId && (
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Varian Terpilih: {variants.find((v) => v.id === activeVariantId)?.name}</span>
          </span>
        )}
      </div>

      {/* Filter Toolbar khusus GT Ring (Ukuran & Susunan) */}
      {isGTRing && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-500 px-1.5">Ukuran:</span>
            {['ALL', 'Small', 'Medium', 'Large'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilterUkuran(opt)}
                className={`px-2 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  filterUkuran === opt
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt === 'ALL' ? 'Semua Ukuran' : opt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-500 px-1.5">Susunan:</span>
            {['ALL', 'Susun 3', 'Susun 4'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilterSusunan(opt)}
                className={`px-2 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  filterSusunan === opt
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt === 'ALL' ? 'Semua Susunan' : opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid Kartu Pilihan Varian */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {filteredVariants.map((v) => {
          const isSelected = activeVariantId === v.id;

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVariant(v)}
              className={`
                p-3 rounded-xl border text-left transition relative cursor-pointer flex flex-col justify-between
                ${
                  isSelected
                    ? 'bg-red-50/80 border-red-500 ring-2 ring-red-500/30 shadow-xs'
                    : 'bg-white hover:bg-slate-100/80 border-slate-200 hover:border-slate-300'
                }
              `}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-black font-mono bg-slate-100 text-slate-800 border border-slate-200">
                    {v.codePrefix}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {v.totalUnits} Unit
                  </span>
                </div>

                <div className="font-bold text-xs sm:text-sm text-slate-900 mt-1 leading-snug">
                  {v.name}
                </div>

                <div className="text-[11px] font-mono text-slate-600 font-medium mt-1">
                  {v.rangeFormat}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className={`font-semibold ${isSelected ? 'text-red-700' : 'text-slate-500'}`}>
                  {isSelected ? '✓ Sedang Dipilih' : 'Klik untuk isi awalan'}
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
