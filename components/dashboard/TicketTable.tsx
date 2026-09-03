'use client';

import React, { useState } from 'react';
import { Ticket } from '@/types/ticket';
import StatusBadge from '@/components/common/StatusBadge';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';

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
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Reset ke halaman 1 jika jumlah data berubah karena filter
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredData.length]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
  const paginatedData = itemsPerPage === -1 ? filteredData : filteredData.slice(startIndex, startIndex + itemsPerPage);

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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector Jumlah Baris per Halaman */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-400">📄 Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent font-black text-slate-800 focus:outline-none cursor-pointer border-none py-0.5"
            >
              <option value={10}>10 baris</option>
              <option value={20}>20 baris</option>
              <option value={30}>30 baris</option>
              <option value={50}>50 baris</option>
              <option value={100}>100 baris</option>
              <option value={-1}>Semua ({filteredData.length})</option>
            </select>
          </div>

          <button
            type="button"
            onClick={exportToExcel}
            disabled={filteredData.length === 0}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>📥</span>
            <span>Ekspor ke Excel (.xlsx)</span>
          </button>
        </div>
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
              <th className="py-3 px-4">Komponen & Rincian Titik Kerusakan</th>
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
              paginatedData.map((item, idx) => {
                const parsed = parseTicketDamageDetail(item.detail);
                const sizeInfo = detectDaishaSize(item.noDaisha);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-400 font-medium">{startIndex + idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 text-[11px]">{item.idTiketAsli}</td>
                    <td className="py-3 px-4 font-black text-red-700">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{item.noDaisha}</span>
                        {sizeInfo && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-black border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                            title={sizeInfo.description}
                          >
                            {sizeInfo.code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.namaDaisha}</td>
                    <td className="py-3 px-4 text-slate-600">{item.seksi}</td>
                    <td className="py-3 px-4 min-w-[260px] max-w-sm">
                      {parsed.items.length > 0 ? (
                        <div className="space-y-1.5 py-0.5">
                          {parsed.items.map((it, i) => (
                            <div
                              key={i}
                              className="flex items-start justify-between gap-1.5 p-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px]"
                            >
                              <div className="flex items-start gap-1 leading-snug">
                                <span className="text-slate-400 font-bold">•</span>
                                <div>
                                  {it.komponen && it.komponen !== 'Umum' && (
                                    <span className="font-extrabold text-slate-800 mr-1">
                                      [{it.komponen}]
                                    </span>
                                  )}
                                  <span className="text-slate-700 font-medium">{it.gejala}</span>
                                  {it.qty > 1 && (
                                    <span className="ml-1 text-[10px] font-black text-slate-800 bg-slate-200/80 px-1.5 py-0.2 rounded">
                                      {it.qty} pcs
                                    </span>
                                  )}
                                </div>
                              </div>
                              {it.tindakan && (
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-black shrink-0 ${
                                    it.tindakan === 'Ganti'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {it.tindakan === 'Ganti' ? '🔄 Ganti' : '🔨 Repair'}
                                </span>
                              )}
                            </div>
                          ))}
                          {parsed.catatan && (
                            <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              📌 Posisi: {parsed.catatan}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-slate-800">{item.jenisKerusakan}</div>
                          <div className="text-[11px] text-slate-500">{item.detail}</div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.pelapor}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">{item.tglMasuk}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">{item.tglKeluar}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls & Info Footer */}
      <div className="p-3.5 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50 text-xs">
        <div className="text-slate-500 font-medium flex items-center gap-2">
          <span>
            Menampilkan{' '}
            <b>{filteredData.length === 0 ? 0 : startIndex + 1}</b> -{' '}
            <b>{Math.min(startIndex + (itemsPerPage === -1 ? filteredData.length : itemsPerPage), filteredData.length)}</b>{' '}
            dari <b>{filteredData.length}</b> tiket
          </span>
          {itemsPerPage !== -1 && totalPages > 1 && (
            <span className="text-slate-400 hidden sm:inline">• Halaman {currentPage} dari {totalPages}</span>
          )}
        </div>

        {itemsPerPage !== -1 && totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              title="Halaman Pertama"
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              ⇤
            </button>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              ← Sebelumnya
            </button>

            <span className="px-3 py-1.5 bg-slate-200/80 rounded-lg font-black text-slate-800 text-[11px]">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              Selanjutnya →
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              title="Halaman Terakhir"
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              ⇥
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
