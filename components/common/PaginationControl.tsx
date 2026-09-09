'use client';

import React from 'react';

interface PaginationControlProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  itemLabel?: string;
  variant?: 'card' | 'plain';
  showItemsPerPage?: boolean;
}

export default function PaginationControl({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = 'tiket',
  variant = 'card',
  showItemsPerPage = true,
}: PaginationControlProps) {
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === -1 ? totalItems : Math.min(startIndex + itemsPerPage, totalItems);

  const containerClasses =
    variant === 'plain'
      ? 'w-full flex flex-col sm:flex-row justify-between items-center gap-3 text-xs'
      : 'p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-3 text-xs';

  return (
    <div className={containerClasses}>
      {/* Kiri: Info Tampilan Data & Selector Items Per Page */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-slate-600 font-medium">
        <span>
          Menampilkan{' '}
          <strong className="text-slate-900 font-black">{totalItems === 0 ? 0 : startIndex + 1}</strong>
          {' '}-{' '}
          <strong className="text-slate-900 font-black">{endIndex}</strong>
          {' '}dari{' '}
          <strong className="text-slate-900 font-black">{totalItems}</strong> {itemLabel}
        </span>

        {showItemsPerPage && (
          <div className="flex items-center gap-1.5 pl-1 sm:border-l sm:border-slate-200">
            <span className="text-[11px] text-slate-400 font-bold">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value={10}>10 data</option>
              <option value={20}>20 data</option>
              <option value={30}>30 data</option>
              <option value={50}>50 data</option>
              <option value={100}>100 data</option>
              <option value={-1}>Semua ({totalItems})</option>
            </select>
          </div>
        )}
      </div>

      {/* Kanan: Tombol Navigasi Halaman */}
      {itemsPerPage !== -1 && totalPages > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            title="Halaman Pertama"
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs text-xs"
          >
            ⇤
          </button>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs text-xs flex items-center gap-1"
          >
            ← <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl font-black text-slate-800 text-xs">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs text-xs flex items-center gap-1"
          >
            <span className="hidden sm:inline">Selanjutnya</span> →
          </button>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            title="Halaman Terakhir"
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs text-xs"
          >
            ⇥
          </button>
        </div>
      )}
    </div>
  );
}
