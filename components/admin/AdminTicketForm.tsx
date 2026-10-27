'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  X,
  CheckCircle2,
  Trash2,
  Save,
  Info,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Ticket } from '@/types/ticket';
import { normalizeStatus } from '@/lib/ticketParser';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { cleanInputDateTime, toDateTimeLocalValue } from '@/lib/date';
import IndoDateTimeInput from '@/components/common/IndoDateTimeInput';
import { detectDaishaSize } from '@/lib/daishaSize';
import DamageCrosscheckSection from './DamageCrosscheckSection';

interface AdminTicketFormProps {
  isOpen: boolean;
  selectedTicket: Ticket | null;
  isProcessing: boolean;
  onCancel: () => void;
  onSubmit: (data: {
    status: string;
    waktuKeluar: string;
    catatan: string;
    detail?: string;
  }) => void;
}

export default function AdminTicketForm({
  isOpen,
  selectedTicket,
  isProcessing,
  onCancel,
  onSubmit,
}: AdminTicketFormProps) {
  if (!isOpen || !selectedTicket) return null;

  return (
    <AdminTicketFormDialog
      key={selectedTicket.idTiketAsli || selectedTicket.noTiket || selectedTicket.id}
      ticket={selectedTicket}
      isProcessing={isProcessing}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

function AdminTicketFormDialog({
  ticket,
  isProcessing,
  onCancel,
  onSubmit,
}: {
  ticket: Ticket;
  isProcessing: boolean;
  onCancel: () => void;
  onSubmit: (data: {
    status: string;
    waktuKeluar: string;
    catatan: string;
    detail?: string;
  }) => void;
}) {
  const currentStatus = normalizeStatus(ticket.status);

  // Status target pengerjaan (default: Done jika tiket sudah diselesaikan teknisi)
  const [formStatus, setFormStatus] = useState<string>(() => {
    if (currentStatus === 'Open' || currentStatus === 'Progress') return 'Done';
    return currentStatus;
  });

  const [waktuKeluar, setWaktuKeluar] = useState<string>(() => {
    return toDateTimeLocalValue(ticket.tglKeluar);
  });

  const [catatan, setCatatan] = useState<string>(() => {
    return ticket.reason && ticket.reason !== '-' ? ticket.reason : '';
  });

  // Escape key listener untuk menutup modal eksekusi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, onCancel]);

  // 1. Ekstrak part/kerusakan yang fleksibel bisa diubah Repair vs Ganti
  const [items, setItems] = useState<
    Array<{ komponen: string; gejala: string; tindakan: 'Repair' | 'Ganti'; qty: number }>
  >(() => {
    const parsed = parseTicketDamageDetail(ticket.detail);
    if (parsed.items.length > 0) {
      return parsed.items.map((it) => ({
        komponen: it.komponen || 'Umum',
        gejala: it.gejala || 'Perbaikan unit',
        tindakan: (it.tindakan?.toLowerCase() === 'ganti' ? 'Ganti' : 'Repair') as 'Repair' | 'Ganti',
        qty: it.qty || 1,
      }));
    }
    const list = ticket.jenisKerusakan
      ? ticket.jenisKerusakan.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    if (list.length > 0) {
      return list.map((k) => ({
        komponen: k,
        gejala: k,
        tindakan: 'Repair' as const,
        qty: 1,
      }));
    }
    return [{ komponen: 'Umum', gejala: 'Pemeriksaan / Servis Fisik', tindakan: 'Repair' as const, qty: 1 }];
  });

  const handleSetItemTindakan = (index: number, tindakan: 'Repair' | 'Ganti') => {
    setItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, tindakan } : it))
    );
  };

  const handleSetItemQty = (index: number, delta: number) => {
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === index ? { ...it, qty: Math.max(1, it.qty + delta) } : it
      )
    );
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleCatalogItem = (
    komponen: string,
    gejala: string,
    tindakan: 'Repair' | 'Ganti'
  ) => {
    const targetComp = komponen.trim().toLowerCase();
    const targetGejala = gejala.trim().toLowerCase();
    const existingIdx = items.findIndex(
      (it) =>
        it.komponen.trim().toLowerCase() === targetComp &&
        it.gejala.trim().toLowerCase() === targetGejala
    );

    if (existingIdx >= 0) {
      const existing = items[existingIdx];
      if (existing.tindakan === tindakan) {
        setItems((prev) => prev.filter((_, idx) => idx !== existingIdx));
      } else {
        setItems((prev) =>
          prev.map((it, idx) => (idx === existingIdx ? { ...it, tindakan } : it))
        );
      }
    } else {
      setItems((prev) => [
        ...prev,
        {
          komponen: komponen.trim(),
          gejala: gejala.trim(),
          tindakan,
          qty: 1,
        },
      ]);
    }
  };

  const handleAddCustomItem = (
    komponen: string,
    gejala: string,
    tindakan: 'Repair' | 'Ganti',
    qty: number
  ) => {
    setItems((prev) => [
      ...prev,
      {
        komponen: komponen.trim(),
        gejala: gejala.trim() || komponen.trim(),
        tindakan,
        qty: Math.max(1, qty),
      },
    ]);
  };

  const hasGantiItem = items.some((it) => it.tindakan === 'Ganti');
  const sizeInfo = detectDaishaSize(ticket.noDaisha);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedDetailStr =
      items.length > 0
        ? items
            .map(
              (it, idx) =>
                `${idx + 1}. [${it.komponen}] ${it.gejala} (Qty: ${it.qty}, Tindakan: ${it.tindakan})`
            )
            .join(' | ')
        : ticket.detail;

    onSubmit({
      status: formStatus,
      waktuKeluar: formStatus === 'Done' ? cleanInputDateTime(waktuKeluar) : '',
      catatan,
      detail: updatedDetailStr,
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-dialog-title"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-2xl lg:max-w-3xl overflow-hidden my-auto animate-scale-up">
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 id="admin-dialog-title" className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <span>Tindakan & Eksekusi Perbaikan</span>
                <span className="font-mono text-xs text-slate-500 font-normal">
                  #{ticket.idTiketAsli || ticket.noTiket}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Atur tindakan per part (Repair vs Ganti) dan tentukan status pengerjaan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          {/* 1. Ringkasan Info Unit */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                {ticket.noDaisha}
              </span>
              {sizeInfo && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}>
                  {sizeInfo.code}
                </span>
              )}
              <span className="font-semibold text-slate-900">{ticket.namaDaisha}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Seksi: {ticket.seksi}</span>
            </div>
            <div className="text-xs text-slate-500">
              Pelapor: <strong className="text-slate-700 font-medium">{ticket.pelapor}</strong>
            </div>
          </div>

          {/* 2. Daftar Part Kerusakan & Pilihan Fleksibel Tindakan (Repair vs Ganti) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>Rincian Part Kerusakan & Tindakan</span>
                <span className="text-xs font-normal text-slate-500 font-mono">
                  ({items.length} part terdaftar)
                </span>
              </label>
            </div>

            {/* List Item Part yang Sudah Ada di Tiket */}
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-500">
                  Belum ada part terpilih. Pilih dari katalog crosscheck di bawah.
                </div>
              ) : (
                items.map((it, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      it.tindakan === 'Ganti'
                        ? 'bg-blue-50/40 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span className="text-red-600">[{it.komponen}]</span>
                        <span className="truncate">{it.gejala}</span>
                      </div>
                    </div>

                    {/* Toggle Tindakan (Repair vs Ganti) & Qty */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* Qty Counter */}
                      <div className="flex items-center border border-slate-300 rounded-md bg-white">
                        <button
                          type="button"
                          onClick={() => handleSetItemQty(idx, -1)}
                          className="px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 rounded-l transition cursor-pointer font-bold"
                          title="Kurangi jumlah"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-slate-800 tabular-nums">
                          {it.qty} pcs
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSetItemQty(idx, 1)}
                          className="px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 rounded-r transition cursor-pointer font-bold"
                          title="Tambah jumlah"
                        >
                          +
                        </button>
                      </div>

                      {/* Toggle Button Repair vs Ganti */}
                      <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleSetItemTindakan(idx, 'Repair')}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                            it.tindakan === 'Repair'
                              ? 'bg-amber-500 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Repair
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetItemTindakan(idx, 'Ganti')}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                            it.tindakan === 'Ganti'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Ganti Baru
                        </button>
                      </div>

                      {/* Tombol Hapus Part */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Hapus part ini dari tiket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Komponen Crosscheck Kerusakan Daisha */}
            <div className="pt-2">
              <DamageCrosscheckSection
                namaDaisha={ticket.namaDaisha}
                items={items}
                onToggleItem={handleToggleCatalogItem}
                onAddCustomItem={handleAddCustomItem}
              />
            </div>
          </div>

          {/* 3. Catatan Teknisi / Alasan Penggantian Part */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1 flex items-center justify-between">
              <span>Catatan Pengerjaan / Alasan Penggantian Part</span>
              {hasGantiItem && (
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Wajib ada alasan ganti
                </span>
              )}
            </label>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tuliskan catatan pengerjaan atau alasan kenapa part diganti baru (contoh: Bearing aus parah dan pecah, tidak bisa distel ulang sehingga diganti baru)..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none resize-none placeholder:text-slate-400"
            />
          </div>

          {/* 4. Status Pengerjaan Workshop */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Status Akhir Tiket *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormStatus('Done')}
                className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex items-center justify-between ${
                  formStatus === 'Done'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-400'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Selesai (Done)</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Siap diambil seksi</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormStatus('Progress')}
                className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex items-center justify-between ${
                  formStatus === 'Progress'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 ring-1 ring-blue-400'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dikerjakan (Progress)</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Masih dalam servis</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormStatus('Scrap')}
                className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex items-center justify-between ${
                  formStatus === 'Scrap'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Rusak Total (Scrap)</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Afkir / tidak layak</div>
                </div>
              </button>
            </div>
          </div>

          {/* 5. Waktu Selesai (Jika status = Done) */}
          {formStatus === 'Done' && (
            <div className="pt-1">
              <label className="block font-semibold text-slate-800 mb-1">
                Waktu Selesai Pengerjaan
              </label>
              <IndoDateTimeInput
                name="waktuKeluar"
                value={waktuKeluar}
                onChange={setWaktuKeluar}
                disabled={isProcessing}
              />
              <p className="text-xs text-slate-400 mt-1">
                Waktu saat unit Daisha dinyatakan siap digunakan kembali
              </p>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
