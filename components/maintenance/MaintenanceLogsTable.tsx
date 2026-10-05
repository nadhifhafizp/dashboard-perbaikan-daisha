'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Download,
  Calendar,
  Wrench,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface MaintenanceLogRow {
  id: string;
  daisha_id: string;
  nomor_daisha: string;
  jenis_pekerjaan: 'RUTIN' | 'REPAIR';
  tanggal_pengerjaan: string;
  admin_id: string;
  catatan?: string | null;
  jenis?: string;
  ukuran?: string;
}

interface MaintenanceLogsTableProps {
  logs: MaintenanceLogRow[];
}

export default function MaintenanceLogsTable({ logs }: MaintenanceLogsTableProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'RUTIN' | 'REPAIR'>('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterType !== 'ALL' && log.jenis_pekerjaan !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesNo = log.nomor_daisha.toLowerCase().includes(q);
        const matchesAdmin = (log.admin_id || '').toLowerCase().includes(q);
        const matchesCatatan = (log.catatan || '').toLowerCase().includes(q);
        return matchesNo || matchesAdmin || matchesCatatan;
      }
      return true;
    });
  }, [logs, filterType, searchQuery]);

  const handleExportExcel = () => {
    if (filteredLogs.length === 0) return;

    const exportRows = filteredLogs.map((log, index) => ({
      No: index + 1,
      'Nomor Daisha': log.nomor_daisha,
      'Jenis Daisha': log.jenis || '-',
      Ukuran: log.ukuran || '-',
      'Kategori Pengerjaan': log.jenis_pekerjaan === 'REPAIR' ? 'Repair (Perbaikan Selesai)' : 'Maintenance Rutin',
      'Tanggal Pengerjaan': new Date(log.tanggal_pengerjaan).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      'Admin / Teknisi': log.admin_id || '-',
      Catatan: log.catatan || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Log Maintenance');
    XLSX.writeFile(workbook, `Log_Maintenance_Daisha_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Transaksi Pemeliharaan & Perbaikan
            </h3>
            <p className="text-xs text-slate-500">
              Rekapitulasi log pengerjaan aktual workshop terintegrasi
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          disabled={filteredLogs.length === 0}
          className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Ekspor Excel ({filteredLogs.length})</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('RUTIN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterType === 'RUTIN'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Rutin</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('REPAIR')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterType === 'REPAIR'
                ? 'bg-sky-600 text-white'
                : 'bg-white text-sky-700 hover:bg-sky-50 border border-sky-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Repair Rusak</span>
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor daisha / teknisi / catatan..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
            <tr>
              <th className="py-2.5 px-3">Tanggal</th>
              <th className="py-2.5 px-3">Nomor Daisha</th>
              <th className="py-2.5 px-3">Armada</th>
              <th className="py-2.5 px-3">Kategori</th>
              <th className="py-2.5 px-3">Admin / Teknisi</th>
              <th className="py-2.5 px-3">Catatan / Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  Tidak ada riwayat pengerjaan yang cocok.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isRepair = log.jenis_pekerjaan === 'REPAIR';
                const formattedDate = new Date(log.tanggal_pengerjaan).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-3 whitespace-nowrap text-slate-600">
                      {formattedDate}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                      {log.nomor_daisha}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-600">
                      {log.jenis || 'Vertical'} {log.ukuran && log.ukuran !== 'NONE' ? `(${log.ukuran})` : ''}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isRepair
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isRepair ? 'Repair Rusak' : 'Maintenance Rutin'}
                      </span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-700 font-medium">
                      {log.admin_id || '-'}
                    </td>
                    <td className="py-2 px-3 text-slate-600 max-w-xs truncate">
                      {log.catatan || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
