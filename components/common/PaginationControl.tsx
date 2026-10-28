'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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
      : 'p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs';

  return (
    <div className={containerClasses}>
      {/* Left: Items Summary & Per-page Select */}
      <div className="flex flex-wrap items-center gap-2.5 text-slate-600 font-normal">
        <span>
          Menampilkan{' '}
          <strong className="text-slate-900 font-medium">{totalItems === 0 ? 0 : startIndex + 1}</strong>
          {' '}-{' '}
          <strong className="text-slate-900 font-medium">{endIndex}</strong>
          {' '}dari{' '}
          <strong className="text-slate-900 font-medium">{totalItems}</strong> {itemLabel}
        </span>

        {showItemsPerPage && (
          <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-slate-200">
            <span className="text-xs text-slate-500 font-normal">Baris:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              aria-label="Jumlah baris data per halaman"
              className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 h-8 sm:h-9 text-xs font-medium text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>Semua ({totalItems})</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      {itemsPerPage !== -1 && totalPages > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            aria-label="Ke halaman pertama"
            title="Halaman Pertama"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-red-500 shadow-2xs"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            aria-label="Ke halaman sebelumnya"
            title="Halaman Sebelumnya"
            className="h-8 px-2.5 sm:h-9 sm:px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition text-xs font-medium flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          <span aria-current="page" className="h-8 sm:h-9 flex items-center justify-center px-3 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-800 text-xs tabular-nums">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            aria-label="Ke halaman selanjutnya"
            title="Halaman Selanjutnya"
            className="h-8 px-2.5 sm:h-9 sm:px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition text-xs font-medium flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 shadow-2xs"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            aria-label="Ke halaman terakhir"
            title="Halaman Terakhir"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-red-500 shadow-2xs"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
