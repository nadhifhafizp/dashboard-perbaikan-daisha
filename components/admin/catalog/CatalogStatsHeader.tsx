'use client';

import React from 'react';
import { Layers, RefreshCw, Plus, Building2, Boxes } from 'lucide-react';

interface CatalogStatsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onOpenAddDaisha: () => void;
  totalSeksi: number;
  totalModel: number;
  totalAllUnits: number;
}

export default function CatalogStatsHeader({
  loading,
  onRefresh,
  onOpenAddDaisha,
  totalSeksi,
  totalModel,
  totalAllUnits,
}: CatalogStatsHeaderProps) {
  return (
    <div className="space-y-3">
      {/* 1. Header Toolbar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#E60012]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Katalog Master Unit & Kerusakan Daisha
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Master registri unit daisha, komponen perbaikan, dan gejala kerusakan
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onRefresh}
            className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
            title="Muat ulang data katalog"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                loading ? 'animate-spin text-red-600' : 'text-slate-500'
              }`}
            />
            <span>Segarkan</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddDaisha}
            className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jenis Daisha</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Industrial KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Seksi Pabrik Terdaftar
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">
              {totalSeksi}{' '}
              <span className="text-xs font-normal text-slate-500">Seksi</span>
            </p>
          </div>
          <Building2 className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Model & Varian Daisha
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">
              {totalModel}{' '}
              <span className="text-xs font-normal text-slate-500">Model</span>
            </p>
          </div>
          <Layers className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Total Populasi Armada Fisik
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">
              {totalAllUnits.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-normal text-slate-500">
                Unit Troli
              </span>
            </p>
          </div>
          <Boxes className="w-6 h-6 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
