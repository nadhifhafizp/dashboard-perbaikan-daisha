'use client';

import React, { useState } from 'react';
import { Ticket } from '@/types/ticket';
import StatusBadge from '@/components/common/StatusBadge';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';

import { SortOption, SORT_OPTIONS, sortTickets } from '@/lib/sortTickets';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, MapPin, Search, ClipboardList } from 'lucide-react';
import PaginationControl from '@/components/common/PaginationControl';

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
  const [sortBy, setSortBy] = useState<SortOption>('input_desc');

  // Reset ke halaman 1 jika jumlah data berubah karena filter
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredData.length]);

  const sortedData = React.useMemo(() => {
    return sortTickets(filteredData, sortBy);
  }, [filteredData, sortBy]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(sortedData.length / itemsPerPage) || 1;
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
  const paginatedData = itemsPerPage === -1 ? sortedData : sortedData.slice(startIndex, startIndex + itemsPerPage);

  const toggleSort = (ascOption: SortOption, descOption: SortOption) => {
    setSortBy((prev) => (prev === ascOption ? descOption : ascOption));
    setCurrentPage(1);
  };

  const getAriaSort = (ascOption: SortOption, descOption: SortOption): 'ascending' | 'descending' | 'none' => {
    if (sortBy === ascOption) return 'ascending';
    if (sortBy === descOption) return 'descending';
    return 'none';
  };

  const getSortIcon = (ascOption: SortOption, descOption: SortOption) => {
    if (sortBy === ascOption) return <ArrowUp className="w-3.5 h-3.5 text-red-600 inline ml-1" />;
    if (sortBy === descOption) return <ArrowDown className="w-3.5 h-3.5 text-red-600 inline ml-1" />;
    return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 inline ml-1" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
      {/* Header Tabel */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-700" />
            <span>Rincian Tiket Perbaikan (Raw Data)</span>
            <span className="text-[11px] font-normal text-slate-500">({filteredData.length} Tiket)</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Data mentah seluruh riwayat dan antrean perbaikan Daisha workshop
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Selector Urutan Data */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-500 font-normal text-[11px]">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setCurrentPage(1);
              }}
              aria-label="Pilih opsi pengurutan data tiket"
              className="h-8 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none cursor-pointer shadow-2xs"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selector Jumlah Baris per Halaman */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-500 font-normal text-[11px]">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Pilih jumlah baris tiket per halaman"
              className="h-8 px-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none cursor-pointer shadow-2xs"
            >
              <option value={10}>10 baris</option>
              <option value={20}>20 baris</option>
              <option value={30}>30 baris</option>
              <option value={50}>50 baris</option>
              <option value={100}>100 baris</option>
              <option value={-1}>Semua ({filteredData.length})</option>
            </select>
          </div>

          {/* Tombol Export Excel */}
          <button
            type="button"
            onClick={exportToExcel}
            className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* Kontainer Tabel Desktop (Khusus Layar md ke atas) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200/80 select-none">
              <th scope="col" className="py-3 px-3 text-center w-12">No</th>
              <th scope="col" className="py-3 px-3.5">ID Tiket</th>
              <th scope="col" aria-sort={getAriaSort('unit_asc', 'unit_desc')} className="py-3 px-3.5">
                <button
                  type="button"
                  onClick={() => toggleSort('unit_asc', 'unit_desc')}
                  className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-600 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 rounded px-1 py-0.5 transition cursor-pointer"
                  aria-label="Urutkan nomor unit Daisha"
                >
                  <span>No Daisha</span>
                  {getSortIcon('unit_asc', 'unit_desc')}
                </button>
              </th>
              <th scope="col" aria-sort={getAriaSort('daisha_asc', 'daisha_desc')} className="py-3 px-3.5">
                <button
                  type="button"
                  onClick={() => toggleSort('daisha_asc', 'daisha_desc')}
                  className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-600 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 rounded px-1 py-0.5 transition cursor-pointer"
                  aria-label="Urutkan jenis Daisha"
                >
                  <span>Nama Daisha</span>
                  {getSortIcon('daisha_asc', 'daisha_desc')}
                </button>
              </th>
              <th scope="col" aria-sort={getAriaSort('seksi_asc', 'seksi_desc')} className="py-3 px-3.5">
                <button
                  type="button"
                  onClick={() => toggleSort('seksi_asc', 'seksi_desc')}
                  className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-600 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 rounded px-1 py-0.5 transition cursor-pointer"
                  aria-label="Urutkan seksi asal"
                >
                  <span>Seksi</span>
                  {getSortIcon('seksi_asc', 'seksi_desc')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3.5">Kerusakan & Tindakan</th>
              <th scope="col" aria-sort={getAriaSort('pelapor_asc', 'pelapor_desc')} className="py-3 px-3.5">
                <button
                  type="button"
                  onClick={() => toggleSort('pelapor_asc', 'pelapor_desc')}
                  className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-600 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 rounded px-1 py-0.5 transition cursor-pointer"
                  aria-label="Urutkan nama pelapor"
                >
                  <span>Pelapor</span>
                  {getSortIcon('pelapor_asc', 'pelapor_desc')}
                </button>
              </th>
              <th scope="col" aria-sort={getAriaSort('input_asc', 'input_desc')} className="py-3 px-3.5 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => toggleSort('input_desc', 'input_asc')}
                  className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-600 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 rounded px-1 py-0.5 transition cursor-pointer"
                  aria-label="Urutkan tanggal masuk"
                >
                  <span>Tgl Masuk</span>
                  {getSortIcon('input_asc', 'input_desc')}
                </button>
              </th>
              <th scope="col" aria-sort={getAriaSort('done_asc', 'done_desc')} className="py-3 px-3.5 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => toggleSort('done_desc', 'done_asc')}
                  className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-600 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 rounded px-1 py-0.5 transition cursor-pointer"
                  aria-label="Urutkan tanggal selesai perbaikan"
                >
                  <span>Tgl Keluar</span>
                  {getSortIcon('done_asc', 'done_desc')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                    <span>Memuat data tiket perbaikan...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500 font-medium">
                  Tidak ada tiket perbaikan yang cocok dengan kriteria filter saat ini.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const parsed = parseTicketDamageDetail(item.detail);
                const sizeInfo = detectDaishaSize(item.noDaisha);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px] tabular-nums">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-3.5 font-mono font-medium text-slate-600 text-xs tabular-nums">
                      {item.idTiketAsli}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 text-xs">{item.noDaisha}</span>
                        {sizeInfo && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                            title={sizeInfo.description}
                          >
                            {sizeInfo.code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-800 text-xs">{item.namaDaisha}</td>
                    <td className="py-3 px-3.5 text-slate-600 text-xs font-normal">{item.seksi}</td>
                    <td className="py-3 px-3.5 min-w-[260px] max-w-sm whitespace-normal">
                      {(() => {
                        if (parsed.items.length > 0) {
                          return (
                            <div className="space-y-1.5 py-0.5">
                              {parsed.items.map((it, i) => (
                                <div
                                  key={i}
                                  className="flex items-start justify-between gap-2 text-xs leading-relaxed"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                    {it.komponen && it.komponen !== 'Umum' && (
                                      <span className="font-semibold text-slate-900">
                                        {it.komponen}:
                                      </span>
                                    )}
                                    <span className="text-slate-700">{it.gejala.replace(/^[•\s-]+/, '')}</span>
                                    {it.qty > 1 && (
                                      <span className="text-slate-500 font-medium tabular-nums text-[11px]">
                                        ({it.qty}x)
                                      </span>
                                    )}
                                  </div>
                                  {it.tindakan && (
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 ${
                                        it.tindakan === 'Ganti'
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                          : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                                      }`}
                                    >
                                      {it.tindakan}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {parsed.catatan && (
                                <div className="text-[11px] text-amber-800 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>Posisi: {parsed.catatan}</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        if (parsed.isWaitingDiagnosis) {
                          return (
                            <div className="space-y-1 py-0.5">
                              <span className="text-[11px] font-medium text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                <Search className="w-3 h-3 text-amber-800" />
                                <span>Menunggu Diagnosa</span>
                              </span>
                              <p className="text-[11px] text-slate-600 font-normal">
                                {parsed.catatan ? `Gejala: ${parsed.catatan}` : 'Kerusakan belum diidentifikasi di lapangan'}
                              </p>
                            </div>
                          );
                        }
                        return (
                          <div>
                            <span className="font-semibold text-slate-900 block text-xs">{item.jenisKerusakan}</span>
                            <span className="text-[11px] text-slate-600">{item.detail && item.detail !== '-' ? item.detail : 'Kerusakan umum'}</span>
                          </div>
                        );
                      })()}
                      {item.reason && item.reason !== '-' && item.reason.trim() !== '' && (
                        <p className="text-[11px] text-emerald-800 mt-1 font-normal">
                          Catatan: {item.reason}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 text-xs font-normal">{item.pelapor}</td>
                    <td className="py-3 px-3.5 text-xs text-slate-500 whitespace-nowrap tabular-nums">{item.tglMasuk}</td>
                    <td className="py-3 px-3.5 text-xs text-slate-500 whitespace-nowrap tabular-nums">{item.tglKeluar || '-'}</td>
                    <td className="py-3 px-3.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Kontainer Kartu Mobile (Khusus Smartphone < md) */}
      <div className="md:hidden divide-y divide-slate-100">
        {loading ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <span className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-xs">Memuat data tiket perbaikan...</span>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs px-4">
            Tidak ada tiket perbaikan yang cocok dengan kriteria filter saat ini.
          </div>
        ) : (
          paginatedData.map((item) => {
            const parsed = parseTicketDamageDetail(item.detail);
            const sizeInfo = detectDaishaSize(item.noDaisha);

            return (
              <div key={item.id} className="p-4 space-y-2.5 bg-white hover:bg-slate-50/60 transition">
                {/* Baris 1: ID Tiket, No Daisha & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      #{item.idTiketAsli}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm text-slate-900">{item.noDaisha}</span>
                      {sizeInfo && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                          title={sizeInfo.description}
                        >
                          {sizeInfo.code}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                {/* Baris 2: Nama Daisha & Seksi */}
                <div className="text-xs font-medium text-slate-700 flex items-center gap-2 flex-wrap">
                  <span className="text-slate-900 font-semibold">{item.namaDaisha}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-normal">
                    {item.seksi}
                  </span>
                </div>

                {/* Baris 3: Titik Kerusakan */}
                <div className="border-l-2 border-slate-200 pl-3 py-1 space-y-1">
                  <div className="text-[11px] font-medium text-slate-500 mb-0.5 uppercase tracking-wider">
                    Rincian Kerusakan:
                  </div>
                  {parsed.isWaitingDiagnosis ? (
                    <div className="space-y-1 py-0.5">
                      <span className="text-[11px] font-medium text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Search className="w-3 h-3 text-amber-800" />
                        <span>Menunggu Diagnosa</span>
                      </span>
                      <p className="text-[11px] text-slate-600 font-normal">
                        {parsed.catatan ? `Gejala: ${parsed.catatan}` : 'Kerusakan belum diidentifikasi di lapangan'}
                      </p>
                    </div>
                  ) : parsed.items.length > 0 ? (
                    parsed.items.map((it, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-1.5 text-xs py-0.5"
                      >
                        <div className="flex items-center gap-1.5 leading-relaxed text-slate-700 flex-wrap">
                          {it.komponen && it.komponen !== 'Umum' && (
                            <span className="font-semibold text-slate-900">
                              {it.komponen}:
                            </span>
                          )}
                          <span className="text-slate-700">{it.gejala.replace(/^[•\s-]+/, '')}</span>
                          {it.qty > 1 && (
                            <span className="text-slate-500 font-medium tabular-nums text-[11px]">
                              ({it.qty}x)
                            </span>
                          )}
                        </div>
                        {it.tindakan && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 ${
                              it.tindakan === 'Ganti'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                            }`}
                          >
                            {it.tindakan}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div>
                      <div className="font-medium text-slate-800 text-xs">{item.jenisKerusakan}</div>
                      <div className="text-xs text-slate-500">{item.detail}</div>
                    </div>
                  )}
                  {parsed.catatan && !parsed.isWaitingDiagnosis && (
                    <div className="text-[11px] text-amber-800 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>Posisi: {parsed.catatan}</span>
                    </div>
                  )}
                  {item.reason && item.reason !== '-' && item.reason.trim() !== '' && (
                    <p className="text-[11px] text-emerald-800 mt-1 font-normal">
                      Catatan: {item.reason}
                    </p>
                  )}
                </div>

                {/* Baris 4: Info Pelapor & Waktu */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 flex-wrap gap-1">
                  <div>
                    <span>Pelapor: </span>
                    <strong className="text-slate-700 font-semibold">{item.pelapor}</strong>
                  </div>
                  <div className="text-xs">
                    <span>Masuk: {item.tglMasuk}</span>
                    {item.tglKeluar && <span> • Selesai: {item.tglKeluar}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls & Info Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
        <PaginationControl
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="tiket"
          variant="plain"
          showItemsPerPage={false}
        />
      </div>
    </div>
  );
}
