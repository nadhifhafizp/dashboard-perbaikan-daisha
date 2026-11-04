'use client';

import React from 'react';
import { Filter, Calendar, Layers, Building2, Tag, Search, Repeat } from 'lucide-react';

export interface ActiveFiltersInfo {
  seksi?: string;
  daisha?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  hanyaBerulang?: boolean;
  search?: string;
}

interface ActiveFilterBadgeProps {
  filters?: ActiveFiltersInfo;
  className?: string;
}

export default function ActiveFilterBadge({ filters, className = '' }: ActiveFilterBadgeProps) {
  if (!filters) return null;

  const { seksi, daisha, status, startDate, endDate, hanyaBerulang, search } = filters;

  const hasAnyFilter = Boolean(
    (seksi && seksi !== 'all' && seksi !== 'Semua Seksi') ||
    (daisha && daisha !== 'all') ||
    (status && status !== 'all') ||
    startDate ||
    endDate ||
    hanyaBerulang ||
    (search && search.trim() !== '')
  );

  if (!hasAnyFilter) return null;

  const formatDateLabel = (d: string) => {
    if (!d) return '';
    try {
      const parts = d.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch {
      // fallback
    }
    return d;
  };

  const periodLabel =
    startDate && endDate
      ? startDate === endDate
        ? formatDateLabel(startDate)
        : `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`
      : startDate
      ? `Dari ${formatDateLabel(startDate)}`
      : endDate
      ? `Sampai ${formatDateLabel(endDate)}`
      : '';

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 mt-2 py-1 px-2.5 rounded-lg bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 leading-tight animate-in fade-in duration-150 ${className}`}
    >
      <span className="flex items-center gap-1 font-bold text-amber-800 text-[11px] uppercase tracking-wider">
        <Filter className="w-3 h-3 text-amber-600" />
        <span>Filter Aktif:</span>
      </span>

      {seksi && seksi !== 'all' && seksi !== 'Semua Seksi' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-slate-800 font-medium border border-amber-200 shadow-2xs">
          <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
          <span>
            Seksi: <strong className="text-blue-700 font-bold">{seksi}</strong>
          </span>
        </span>
      )}

      {daisha && daisha !== 'all' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-slate-800 font-medium border border-amber-200 shadow-2xs">
          <Layers className="w-3 h-3 text-amber-600 shrink-0" />
          <span>
            Daisha: <strong className="text-amber-800 font-bold">{daisha}</strong>
          </span>
        </span>
      )}

      {periodLabel && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-slate-800 font-medium border border-amber-200 shadow-2xs">
          <Calendar className="w-3 h-3 text-purple-600 shrink-0" />
          <span>
            Waktu: <strong className="text-purple-700 font-bold">{periodLabel}</strong>
          </span>
        </span>
      )}

      {status && status !== 'all' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-slate-800 font-medium border border-amber-200 shadow-2xs">
          <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>
            Status: <strong className="text-emerald-700 font-bold">{status}</strong>
          </span>
        </span>
      )}

      {hanyaBerulang && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-rose-700 font-bold border border-rose-200 shadow-2xs">
          <Repeat className="w-3 h-3 text-rose-600 shrink-0" />
          <span>Unit Berulang</span>
        </span>
      )}

      {search && search.trim() !== '' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-slate-800 font-medium border border-amber-200 shadow-2xs">
          <Search className="w-3 h-3 text-slate-500 shrink-0" />
          <span>
            Cari: &ldquo;<strong className="text-slate-900 font-bold">{search}</strong>&rdquo;
          </span>
        </span>
      )}
    </div>
  );
}
