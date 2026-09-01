'use client';

import React, { useState } from 'react';
import { Ticket } from '@/types/ticket';

interface TicketTableProps {
  filteredData: Ticket[];
  loading: boolean;
  exportToExcel: () => void;
}

export default function TicketTable({
  filteredData,
  loading,
  exportToExcel,
}: TicketTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Done':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">Done</span>;
      case 'Progress':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">Progress</span>;
      case 'Scrap':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">Scrap</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">Open</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header Tabel */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span>📋</span> Rincian Tiket Perbaikan ({filteredData.length} Tiket)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap laporan yang sesuai dengan filter yang sedang aktif
          </p>
        </div>

        <button
          type="button"
          onClick={exportToExcel}
          disabled={filteredData.length === 0}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>📥</span>
          <span>Ekspor ke Excel (CSV)</span>
        </button>
      </div>

      {/* Kontainer Tabel Responsif */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/75 text-[11px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-4">No</th>
              <th className="py-3 px-4">ID Tiket</th>
              <th className="py-3 px-4">No Daisha</th>
              <th className="py-3 px-4">Nama Daisha</th>
              <th className="py-3 px-4">Seksi</th>
              <th className="py-3 px-4">Komponen & Detail Gejala</th>
              <th className="py-3 px-4">Pelapor</th>
              <th className="py-3 px-4">Tgl Masuk</th>
              <th className="py-3 px-4">Tgl Keluar</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                    <span>Memuat data tiket perbaikan...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  Tidak ada tiket perbaikan yang cocok dengan kriteria filter saat ini.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-slate-400 font-medium">{startIndex + idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 text-[11px]">{item.idTiketAsli}</td>
                  <td className="py-3 px-4 font-black text-red-700">{item.noDaisha}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{item.namaDaisha}</td>
                  <td className="py-3 px-4 text-slate-600">{item.seksi}</td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-bold text-slate-800">{item.jenisKerusakan}</div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5 flex-wrap mt-0.5" title={item.detail}>
                      <span className="truncate max-w-[200px]">{item.detail}</span>
                      {item.detail.includes('Tindakan: Ganti') && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                          🔄 Ganti
                        </span>
                      )}
                      {item.detail.includes('Tindakan: Repair') && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                          🔨 Repair
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{item.pelapor}</td>
                  <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">{item.tglMasuk}</td>
                  <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">{item.tglKeluar}</td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(item.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 text-xs">
          <span className="text-slate-500 font-medium">
            Halaman <b>{currentPage}</b> dari <b>{totalPages}</b>
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Sebelumnya
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
