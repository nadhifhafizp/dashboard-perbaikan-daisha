'use client';

import React, { useState, useMemo } from 'react';
import {
  Edit3,
  Search,
  X,
  Lightbulb,
  FileText,
  Wrench,
} from 'lucide-react';
import { Ticket } from '@/types/ticket';
import { useDaishaCatalog } from '@/hooks/useDaishaCatalog';
import DamageCatalogSelector, { TindakanType } from '@/components/input/DamageCatalogSelector';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { cleanInputDateTime, toDateTimeLocalValue } from '@/lib/date';
import { detectDaishaSize } from '@/lib/daishaSize';
import IndoDateTimeInput from '@/components/common/IndoDateTimeInput';

interface EditTicketModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  isLoading: boolean;
  onSave: (data: {
    waktuMasuk: string;
    noDaisha: string;
    seksi: string;
    namaDaisha: string;
    jenisKerusakan: string;
    detail: string;
  }) => void;
  onClose: () => void;
}

function parseInitialTicketData(ticket: Ticket) {
  const parsed = parseTicketDamageDetail(ticket.detail);
  const isNeedsDiagnosis =
    parsed.isWaitingDiagnosis ||
    ticket.jenisKerusakan?.toLowerCase().includes('diagnosa') ||
    ticket.detail?.toLowerCase().includes('pemeriksaan bengkel') ||
    ticket.detail?.toLowerCase().includes('belum diidentifikasi');

  const initSelected: string[] = [];
  const initTindakanMap: Record<string, TindakanType> = {};
  const initQtyMap: Record<string, number> = {};
  const initCustom: string[] = [];
  const initCustomTindakan: Record<string, TindakanType> = {};
  const initCustomQty: Record<string, number> = {};

  if (!isNeedsDiagnosis) {
    for (const item of parsed.items) {
      const tindakan = (item.tindakan as TindakanType) || 'Repair';
      const qty = item.qty || 1;

      if (item.komponen.toLowerCase() === 'others' || item.komponen === 'Umum') {
        if (!initCustom.includes(item.gejala)) {
          initCustom.push(item.gejala);
          initCustomTindakan[item.gejala] = tindakan;
          initCustomQty[item.gejala] = qty;
        }
      } else {
        const key = `${item.komponen}:::${item.gejala}`;
        if (!initSelected.includes(key)) {
          initSelected.push(key);
          initTindakanMap[key] = tindakan;
          initQtyMap[key] = qty;
        }
      }
    }
  }

  return {
    isNeedsDiagnosis,
    symptomNote: parsed.catatan || '',
    formData: {
      waktuMasuk: toDateTimeLocalValue(ticket.tglMasuk),
      noDaisha: ticket.noDaisha || '',
      seksi: ticket.seksi && ticket.seksi !== '-' ? ticket.seksi : '',
      namaDaisha: ticket.namaDaisha && ticket.namaDaisha !== '-' ? ticket.namaDaisha : '',
      catatanTambahan: !isNeedsDiagnosis ? (parsed.catatan || '') : '',
    },
    selectedKerusakan: initSelected,
    tindakanMap: initTindakanMap,
    qtyMap: initQtyMap,
    customKerusakanList: initCustom,
    customTindakanMap: initCustomTindakan,
    customQtyMap: initCustomQty,
  };
}

export default function EditTicketModal({
  isOpen,
  ticket,
  isLoading,
  onSave,
  onClose,
}: EditTicketModalProps) {
  if (!isOpen || !ticket) return null;

  return (
    <EditTicketModalDialog
      key={ticket.idTiketAsli || ticket.noTiket || ticket.id}
      ticket={ticket}
      isLoading={isLoading}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

function EditTicketModalDialog({
  ticket,
  isLoading,
  onSave,
  onClose,
}: {
  ticket: Ticket;
  isLoading: boolean;
  onSave: EditTicketModalProps['onSave'];
  onClose: () => void;
}) {
  const initial = useMemo(() => parseInitialTicketData(ticket), [ticket]);

  const [formData, setFormData] = useState(initial.formData);
  const [selectedKerusakan, setSelectedKerusakan] = useState<string[]>(initial.selectedKerusakan);
  const [tindakanMap, setTindakanMap] = useState<Record<string, TindakanType>>(initial.tindakanMap);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>(initial.qtyMap);
  const [customKerusakanList, setCustomKerusakanList] = useState<string[]>(initial.customKerusakanList);
  const [customTindakanMap, setCustomTindakanMap] = useState<Record<string, TindakanType>>(initial.customTindakanMap);
  const [customQtyMap, setCustomQtyMap] = useState<Record<string, number>>(initial.customQtyMap);

  const { catalog, seksiList, daishaList } = useDaishaCatalog();

  // Katalog kerusakan untuk tipe Daisha yang sedang diedit
  const katalogKerusakan = useMemo(() => {
    if (!formData.namaDaisha || !catalog[formData.namaDaisha]) return {};
    return catalog[formData.namaDaisha].jenisKerusakan || {};
  }, [formData.namaDaisha, catalog]);

  const toggleKerusakan = (komponen: string, detail: string) => {
    const key = `${komponen}:::${detail}`;
    if (selectedKerusakan.includes(key)) {
      setSelectedKerusakan((prev) => prev.filter((k) => k !== key));
    } else {
      setSelectedKerusakan((prev) => [...prev, key]);
      setTindakanMap((prev) => ({
        ...prev,
        [key]: prev[key] || 'Repair',
      }));
      setQtyMap((prev) => ({
        ...prev,
        [key]: prev[key] || 1,
      }));
    }
  };

  const handleTindakanChange = (key: string, tindakan: TindakanType) => {
    setTindakanMap((prev) => ({
      ...prev,
      [key]: tindakan,
    }));
  };

  const handleQtyChange = (key: string, qty: number) => {
    setQtyMap((prev) => ({
      ...prev,
      [key]: qty,
    }));
  };

  const addCustomKerusakan = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!customKerusakanList.includes(trimmed)) {
      setCustomKerusakanList((prev) => [...prev, trimmed]);
      setCustomTindakanMap((prev) => ({ ...prev, [trimmed]: 'Repair' }));
      setCustomQtyMap((prev) => ({ ...prev, [trimmed]: 1 }));
    }
  };

  const removeCustomKerusakan = (text: string) => {
    setCustomKerusakanList((prev) => prev.filter((item) => item !== text));
    setCustomTindakanMap((prev) => {
      const next = { ...prev };
      delete next[text];
      return next;
    });
    setCustomQtyMap((prev) => {
      const next = { ...prev };
      delete next[text];
      return next;
    });
  };

  const handleCustomTindakanChange = (text: string, tindakan: TindakanType) => {
    setCustomTindakanMap((prev) => ({
      ...prev,
      [text]: tindakan,
    }));
  };

  const handleCustomQtyChange = (text: string, qty: number) => {
    setCustomQtyMap((prev) => ({
      ...prev,
      [text]: qty,
    }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNoDaishaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      noDaisha: val,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedKerusakanList: string[] = [];
    const kategoriSet = new Set<string>();

    for (const key of selectedKerusakan) {
      const [komponen, detail] = key.split(':::');
      const tindakan = tindakanMap[key] || 'Repair';
      const qty = qtyMap[key] || 1;
      const qtyStr = qty > 1 ? ` (${qty}x)` : '';
      formattedKerusakanList.push(`• [${komponen}] ${detail}${qtyStr} [${tindakan}]`);
      kategoriSet.add(komponen);
    }

    for (const custom of customKerusakanList) {
      const tindakan = customTindakanMap[custom] || 'Repair';
      const qty = customQtyMap[custom] || 1;
      const qtyStr = qty > 1 ? ` (${qty}x)` : '';
      formattedKerusakanList.push(`• [Others] ${custom}${qtyStr} [${tindakan}]`);
      kategoriSet.add('Others');
    }

    let compiledDetail = formattedKerusakanList.join('\n');
    if (formData.catatanTambahan && formData.catatanTambahan.trim()) {
      compiledDetail += `\nCatatan Tambahan: ${formData.catatanTambahan.trim()}`;
    }

    const compiledKategori = Array.from(kategoriSet).join(', ') || 'Umum';

    onSave({
      waktuMasuk: cleanInputDateTime(formData.waktuMasuk),
      noDaisha: formData.noDaisha,
      seksi: formData.seksi,
      namaDaisha: formData.namaDaisha,
      jenisKerusakan: compiledKategori,
      detail: compiledDetail,
    });
  };

  const sizeInfo = detectDaishaSize(formData.noDaisha);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dialog-title"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-2xl overflow-hidden my-auto animate-scale-up">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              {initial.isNeedsDiagnosis ? (
                <Search className="w-4 h-4 text-amber-600" />
              ) : (
                <Edit3 className="w-4 h-4 text-slate-700" />
              )}
            </div>
            <div>
              <h2 id="edit-dialog-title" className="text-sm font-semibold text-slate-900">
                {initial.isNeedsDiagnosis
                  ? 'Diagnosa Kerusakan Unit Daisha'
                  : 'Edit Data Tiket Perbaikan'}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                {ticket.idTiketAsli || ticket.noTiket}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-9 h-9 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Tutup modal edit tiket"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Banner Mode Diagnosa Bengkel */}
          {initial.isNeedsDiagnosis && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-950 animate-fade-in">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Pemeriksaan Fisik Bengkel</span>
              </div>
              <p className="text-slate-600 font-normal leading-relaxed">
                Unit Daisha ini didaftarkan dari lini produksi tanpa detail kerusakan spesifik. Silakan periksa kondisi fisik Daisha, lalu pilih komponen rusak, tindakan (Repair / Ganti), dan jumlahnya pada katalog di bawah.
              </p>
              {initial.symptomNote && (
                <div className="p-2 bg-white rounded-lg border border-amber-300/80 text-xs font-medium text-amber-900 mt-1 flex items-start gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>Indikasi / Gejala dari Operator: {initial.symptomNote}</span>
                </div>
              )}
            </div>
          )}
          {/* Identitas Unit & Pelapor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Waktu Temuan / Masuk *
              </label>
              <IndoDateTimeInput
                value={formData.waktuMasuk}
                onChange={(val) => setFormData((prev) => ({ ...prev, waktuMasuk: val }))}
                required
              />
            </div>

            <div>
              <label htmlFor="edit-nomor-daisha" className="block text-xs font-medium text-slate-700 mb-1">
                Nomor Daisha *
              </label>
              <div className="relative">
                <input
                  id="edit-nomor-daisha"
                  type="text"
                  name="noDaisha"
                  value={formData.noDaisha}
                  onChange={handleNoDaishaChange}
                  placeholder="Contoh: MS 080 / S4 214"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 bg-white focus:ring-2 focus:ring-red-600 outline-none uppercase pr-14"
                  required
                />
                {sizeInfo && (
                  <span
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold px-1.5 py-0.5 rounded border ${sizeInfo.badgeBg} ${sizeInfo.textColor} ${sizeInfo.borderColor}`}
                    title={sizeInfo.description}
                  >
                    {sizeInfo.code} ({sizeInfo.label})
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="edit-seksi" className="block text-xs font-medium text-slate-700 mb-1">
                Seksi Pemilik *
              </label>
              <select
                id="edit-seksi"
                name="seksi"
                value={formData.seksi}
                onChange={handleFormChange}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
                required
              >
                <option value="">-- Pilih Seksi --</option>
                {seksiList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit-nama-daisha" className="block text-xs font-medium text-slate-700 mb-1">
                Nama / Jenis Daisha *
              </label>
              <input
                id="edit-nama-daisha"
                type="text"
                name="namaDaisha"
                value={formData.namaDaisha}
                onChange={handleFormChange}
                list="daftar-jenis-daisha-edit"
                placeholder="Contoh: GT Ring (Building)"
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-red-600 outline-none"
                required
              >
              </input>
              <datalist id="daftar-jenis-daisha-edit">
                {daishaList.map((nama) => (
                  <option key={nama} value={nama} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Katalog Titik Kerusakan */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-700" />
                <span>Titik Kerusakan & Rencana Tindakan</span>
              </label>
              <span className="text-xs text-slate-500 tabular-nums">
                Total Terpilih: {selectedKerusakan.length + customKerusakanList.length} titik
              </span>
            </div>

            <DamageCatalogSelector
              jenisDaisha={formData.namaDaisha}
              katalogKerusakan={katalogKerusakan}
              selectedKerusakan={selectedKerusakan}
              tindakanMap={tindakanMap}
              qtyMap={qtyMap}
              customKerusakanList={customKerusakanList}
              customTindakanMap={customTindakanMap}
              customQtyMap={customQtyMap}
              onToggleKerusakan={toggleKerusakan}
              onSetTindakan={handleTindakanChange}
              onSetQty={handleQtyChange}
              onAddCustom={addCustomKerusakan}
              onRemoveCustom={removeCustomKerusakan}
              onSetCustomTindakan={handleCustomTindakanChange}
              onSetCustomQty={handleCustomQtyChange}
              catatanTambahan={formData.catatanTambahan}
              onCatatanChange={(val) => setFormData((prev) => ({ ...prev, catatanTambahan: val }))}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition cursor-pointer text-xs text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto px-5 py-2 text-white font-medium rounded-lg shadow-xs transition cursor-pointer flex items-center justify-center gap-2 text-xs disabled:opacity-50 ${
                initial.isNeedsDiagnosis
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : initial.isNeedsDiagnosis ? (
                'Simpan Hasil Diagnosa'
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
