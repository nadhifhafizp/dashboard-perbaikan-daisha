'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PmStagingRecord } from './SectionPmHandover';

interface WorkshopStagingAlertProps {
  onRefreshData?: () => void;
}

export default function WorkshopStagingAlert({ onRefreshData }: WorkshopStagingAlertProps) {
  const [records, setRecords] = useState<PmStagingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/maintenance/staging');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load workshop staging alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRecords();
    // Poll every 30 seconds for new pickup requests from sections
    const interval = setInterval(() => {
      void fetchRecords();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchRecords]);

  const activeStagings = records.filter(
    (r) => r.status === 'WAITING_PICKUP' || r.status === 'PICKED_UP'
  );

  const handleUpdateStatus = async (
    recordId: number,
    newStatus: 'PICKED_UP' | 'COMPLETED'
  ) => {
    try {
      setUpdatingId(recordId);
      const res = await fetch('/api/maintenance/staging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          id: recordId,
          status: newStatus,
        }),
      });
      if (res.ok) {
        await fetchRecords();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to update staging status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (activeStagings.length === 0) {
    return null;
  }

  const waitingCount = activeStagings.filter((r) => r.status === 'WAITING_PICKUP').length;
  const inProgressCount = activeStagings.filter((r) => r.status === 'PICKED_UP').length;

  return (
    <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 sm:p-5 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Penjemputan PM dari Seksi Siap Diambil Bengkel
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                {activeStagings.length} Antrean
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Seksi telah menyiapkan unit Daisha di titik kumpul produksi untuk ditarik ke workshop maintenance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => fetchRecords()}
            disabled={loading}
            className="h-10 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Segarkan antrean penjemputan"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="h-10 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center gap-1 cursor-pointer"
          >
            <span>{expanded ? 'Tutup' : 'Lihat'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-amber-200/70">
          <div className="overflow-x-auto rounded-lg border border-amber-200/80 bg-white">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-amber-50/50 text-slate-700 font-semibold border-b border-amber-200/80">
                <tr>
                  <th scope="col" className="py-2.5 px-3.5">Seksi</th>
                  <th scope="col" className="py-2.5 px-3">Unit Daisha ({activeStagings.reduce((acc, r) => acc + r.units.length, 0)})</th>
                  <th scope="col" className="py-2.5 px-3">Titik Kumpul & Pelapor</th>
                  <th scope="col" className="py-2.5 px-3">Catatan</th>
                  <th scope="col" className="py-2.5 px-3">Waktu Siap</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Status</th>
                  <th scope="col" className="py-2.5 px-3.5 text-right">Aksi Bengkel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeStagings.map((item) => {
                  const isWaiting = item.status === 'WAITING_PICKUP';
                  const isUpdating = updatingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                          <Building2 className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
                          <span>Seksi {item.seksi}</span>
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {item.units.map((unitNo) => (
                            <span
                              key={unitNo}
                              className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200"
                            >
                              {unitNo}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-semibold text-slate-900">
                            <MapPin className="w-3 h-3 text-red-600 shrink-0" aria-hidden="true" />
                            <span className="truncate max-w-[200px]" title={item.lokasi}>
                              {item.lokasi}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-normal">
                            Oleh {item.pelapor}
                          </p>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        {item.catatan ? (
                          <span className="text-slate-600 italic text-xs max-w-[180px] truncate block" title={item.catatan}>
                            &quot;{item.catatan}&quot;
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 text-xs tabular-nums">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                          <span>
                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                            isWaiting
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isWaiting ? 'bg-amber-500' : 'bg-blue-500'}`} aria-hidden="true" />
                          <span>{isWaiting ? 'Menunggu Jemput' : 'Di Bengkel'}</span>
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 text-right">
                        {isWaiting ? (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(item.id, 'PICKED_UP')}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                              <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                            <span>Tandai Dijemput</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                            <span>Selesai & Kembali</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
