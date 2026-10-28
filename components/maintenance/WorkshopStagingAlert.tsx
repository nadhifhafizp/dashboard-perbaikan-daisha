'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ClipboardCheck,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { PmStagingRecord } from './SectionPmHandover';
import { FleetUnit } from './FleetExplorer';

interface WorkshopStagingAlertProps {
  onRefreshData?: () => void;
  units?: FleetUnit[];
  recentLogs?: Array<{
    nomor_daisha: string;
    tanggal_pengerjaan: string | Date;
    jenis_pekerjaan?: string;
  }>;
  onInputPm?: (unitNo: string, seksi: string) => void;
  seksiFilter?: string;
}

export default function WorkshopStagingAlert({
  onRefreshData,
  units = [],
  recentLogs = [],
  onInputPm,
  seksiFilter,
}: WorkshopStagingAlertProps) {
  const [records, setRecords] = useState<PmStagingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [pendingCompleteItem, setPendingCompleteItem] = useState<{
    record: PmStagingRecord;
    unrecordedUnits: string[];
  } | null>(null);

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

  // Cek apakah unit daisha sudah di-input PM-nya
  const isUnitRecorded = useCallback(
    (unitNo: string, createdAt: string) => {
      const cleanNo = unitNo.trim().toUpperCase();

      // 1. Cek di recentLogs
      if (recentLogs && recentLogs.length > 0) {
        const createdDate = new Date(createdAt);
        const isLogged = recentLogs.some((log) => {
          if ((log.nomor_daisha || '').trim().toUpperCase() !== cleanNo) return false;
          const logDate = new Date(log.tanggal_pengerjaan);
          return (
            logDate.getFullYear() === createdDate.getFullYear() &&
            logDate.getMonth() === createdDate.getMonth() &&
            logDate.getDate() >= createdDate.getDate()
          );
        });
        if (isLogged) return true;
      }

      // 2. Cek di fleet units
      if (units && units.length > 0) {
        const found = units.find(
          (u) => (u.nomor_daisha || '').trim().toUpperCase() === cleanNo
        );
        if (found?.last_maintenance_date) {
          const maintDate = new Date(found.last_maintenance_date);
          const today = new Date();
          if (
            maintDate.getFullYear() === today.getFullYear() &&
            maintDate.getMonth() === today.getMonth() &&
            maintDate.getDate() === today.getDate()
          ) {
            return true;
          }
        }
      }

      return false;
    },
    [recentLogs, units]
  );

  const activeStagings = useMemo(() => {
    let list = records.filter(
      (r) => r.status === 'WAITING_PICKUP' || r.status === 'PICKED_UP'
    );
    if (
      seksiFilter &&
      seksiFilter !== 'all' &&
      seksiFilter.toLowerCase() !== 'all seksi'
    ) {
      list = list.filter(
        (r) => (r.seksi || '').toLowerCase() === seksiFilter.toLowerCase()
      );
    }
    return list;
  }, [records, seksiFilter]);

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

  const handleCompleteClick = (item: PmStagingRecord) => {
    const unrecorded = item.units.filter((u) => !isUnitRecorded(u, item.createdAt));
    if (unrecorded.length > 0) {
      setPendingCompleteItem({ record: item, unrecordedUnits: unrecorded });
    } else {
      void handleUpdateStatus(item.id, 'COMPLETED');
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
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Penjemputan PM dari Seksi Siap Diambil Bengkel
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                {activeStagings.length} Antrean
              </span>
              {waitingCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  {waitingCount} Menunggu Jemput
                </span>
              )}
              {inProgressCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                  {inProgressCount} Sedang Di-PM di Bengkel
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Seksi menyiapkan unit Daisha di titik kumpul produksi. Ambil unit ke bengkel dan catat lembar inspeksi hasil PM sebelum diserahkan kembali.
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
                  <th scope="col" className="py-2.5 px-3">
                    Unit Daisha & Status PM ({activeStagings.reduce((acc, r) => acc + r.units.length, 0)})
                  </th>
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
                  const unrecordedUnits = item.units.filter((u) => !isUnitRecorded(u, item.createdAt));
                  const allRecorded = unrecordedUnits.length === 0;

                  return (
                    <tr key={item.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                          <Building2 className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
                          <span>Seksi {item.seksi}</span>
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-md">
                          {item.units.map((unitNo) => {
                            const isRecorded = isUnitRecorded(unitNo, item.createdAt);
                            return (
                              <div
                                key={unitNo}
                                className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1"
                              >
                                <span
                                  className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                                    isRecorded
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : 'bg-white text-slate-900 border border-slate-200'
                                  }`}
                                >
                                  {unitNo}
                                </span>

                                {!isWaiting && onInputPm && (
                                  <button
                                    type="button"
                                    onClick={() => onInputPm(unitNo, item.seksi)}
                                    title={
                                      isRecorded
                                        ? `PM unit ${unitNo} telah dicatat. Klik untuk tinjau/catat ulang.`
                                        : `Catat lembar hasil inspeksi 9 komponen PM unit ${unitNo}`
                                    }
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                                      isRecorded
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold'
                                    }`}
                                  >
                                    {isRecorded ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span>Hasil OK</span>
                                      </>
                                    ) : (
                                      <>
                                        <ClipboardCheck className="w-3 h-3 text-amber-700" />
                                        <span>Input PM</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            );
                          })}
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                              <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                            <span>Ambil ke Bengkel</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleCompleteClick(item)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition cursor-pointer ${
                              allRecorded
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                            <span>{allRecorded ? 'Selesai & Serah Terima' : 'Selesai PM'}</span>
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

      {/* Confirmation Modal when not all units have recorded PM */}
      {pendingCompleteItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Belum Semua Lembar PM Diisi
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Dari total {pendingCompleteItem.record.units.length} unit yang dijemput, masih terdapat{' '}
                  <span className="font-bold text-amber-700">
                    {pendingCompleteItem.unrecordedUnits.length} unit
                  </span>{' '}
                  ({pendingCompleteItem.unrecordedUnits.join(', ')}) yang belum dicatat hasil ceklis & tindakannya.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Pentingnya Pencatatan PM:</p>
              <p className="text-slate-600">
                Pengisian formulir PM (9 komponen inspeksi & pelumasan/perbaikan) memastikan riwayat servis unit tercatat di sistem dan masuk ke KPI realisasi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingCompleteItem(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              {onInputPm && pendingCompleteItem.unrecordedUnits[0] && (
                <button
                  type="button"
                  onClick={() => {
                    const targetUnit = pendingCompleteItem.unrecordedUnits[0];
                    const seksi = pendingCompleteItem.record.seksi;
                    setPendingCompleteItem(null);
                    onInputPm(targetUnit, seksi);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Input PM ({pendingCompleteItem.unrecordedUnits[0]})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const id = pendingCompleteItem.record.id;
                  setPendingCompleteItem(null);
                  void handleUpdateStatus(id, 'COMPLETED');
                }}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition cursor-pointer"
              >
                Tetap Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
