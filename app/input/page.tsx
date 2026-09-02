'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { CreateTicketPayload } from '@/types/ticket';
import { getInitialDateTime, cleanInputDateTime } from '@/lib/date';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import QrScannerModal from '@/components/input/QrScannerModal';
import ReviewTicketModal from '@/components/input/ReviewTicketModal';
import DamageCatalogSelector, { TindakanType } from '@/components/input/DamageCatalogSelector';
import PrintTicketTagModal, { PrintableTicketData } from '@/components/common/PrintTicketTagModal';
import IndoDateTimeInput from '@/components/common/IndoDateTimeInput';
import { useTickets } from '@/hooks/useTickets';
import { detectDaishaSize } from '@/lib/daishaSize';
import {
  masterDataDaisha,
  DAFTAR_SEKSI,
  DAFTAR_SEMUA_DAISHA,
  getDaishaBySeksi,
} from '@/lib/masterData';

const INVALID_OPERATOR_NAMES = [
  'Staff Input / Teknisi Lapangan',
  'Admin Maintenance & Rekap',
  'staff input',
  'operator',
  'admin',
  'null',
  'undefined',
];

export function isInvalidOperatorName(name: string | null | undefined): boolean {
  if (!name) return true;
  const trimmed = name.trim().toLowerCase();
  return !trimmed || INVALID_OPERATOR_NAMES.some((inv) => inv.toLowerCase() === trimmed);
}

const API_URL = '/api/repair';

export default function InputKerusakanPage() {
  const [formData, setFormData] = useState({
    waktuMasuk: getInitialDateTime(),
    namaPelapor: '',
    seksi: '',
    jenisDaisha: '',
    noDaisha: '',
    catatanTambahan: '',
  });

  // Hapus data sisa nama dari localStorage jika ada agar form selalu bersih dan tidak mengingat nama lama
  useEffect(() => {
    try {
      localStorage.removeItem('daisha_operator_name');
    } catch {
      // Abaikan jika localStorage dibatasi browser
    }
  }, []);

  // State Pilihan Kerusakan Multi-Select Cepat
  const [selectedKerusakan, setSelectedKerusakan] = useState<string[]>([]);
  const [customKerusakanList, setCustomKerusakanList] = useState<string[]>([]);
  const [tindakanMap, setTindakanMap] = useState<Record<string, TindakanType>>({});
  const [customTindakanMap, setCustomTindakanMap] = useState<Record<string, TindakanType>>({});
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [customQtyMap, setCustomQtyMap] = useState<Record<string, number>>({});

  const [showAllDaisha, setShowAllDaisha] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isScanning, setIsScanning] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateTicketPayload | null>(null);

  const { tickets } = useTickets({ autoRefreshIntervalMs: 0 });

  // State untuk Cetak Tag Fisik Daisha setelah submit
  const [createdTicketForTag, setCreatedTicketForTag] = useState<PrintableTicketData | null>(null);
  const [isPrintTagOpen, setIsPrintTagOpen] = useState(false);

  // State untuk dismiss peringatan duplikat
  const [dismissedDuplicateUnit, setDismissedDuplicateUnit] = useState<string | null>(null);

  // Deteksi tiket aktif (Open / Progress) untuk unit daisha yang sedang diinput
  const normalizedNoDaisha = formData.noDaisha.trim().toUpperCase();
  const duplicateActiveTicket = useMemo(() => {
    if (!normalizedNoDaisha || normalizedNoDaisha.length < 2) return null;
    if (dismissedDuplicateUnit === normalizedNoDaisha) return null;
    return (
      tickets.find(
        (t) =>
          t.noDaisha.trim().toUpperCase() === normalizedNoDaisha &&
          (t.status === 'Open' || t.status === 'Progress')
      ) || null
    );
  }, [tickets, normalizedNoDaisha, dismissedDuplicateUnit]);

  // Deteksi otomatis ukuran Daisha (S = Small, M = Medium, L = Large)
  const detectedSize = useMemo(
    () => detectDaishaSize(formData.noDaisha),
    [formData.noDaisha]
  );

  // Pop-up Feedback
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    title: string;
    message: string;
    detail?: string;
    buttonText?: string;
    secondaryButtonText?: string;
    onSecondaryClick?: () => void;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showFeedback = (
    type: FeedbackType,
    title: string,
    message: string,
    detail?: string,
    buttonText?: string,
    secondaryButtonText?: string,
    onSecondaryClick?: () => void
  ) => {
    setFeedback({
      isOpen: true,
      type,
      title,
      message,
      detail,
      buttonText,
      secondaryButtonText,
      onSecondaryClick,
    });
  };

  // Pilihan dinamis berdasarkan Master Data
  const pilihanDaishaTersedia = useMemo(() => {
    if (showAllDaisha) return DAFTAR_SEMUA_DAISHA;
    return getDaishaBySeksi(formData.seksi);
  }, [showAllDaisha, formData.seksi]);

  // Katalog kerusakan untuk jenis Daisha yang sedang dipilih
  const katalogKerusakan = useMemo(() => {
    if (!formData.jenisDaisha || !masterDataDaisha[formData.jenisDaisha]) return {};
    return masterDataDaisha[formData.jenisDaisha].jenisKerusakan || {};
  }, [formData.jenisDaisha]);

  const totalDipilih = selectedKerusakan.length + customKerusakanList.length;

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

  const setItemTindakan = (key: string, tindakan: TindakanType) => {
    setTindakanMap((prev) => ({ ...prev, [key]: tindakan }));
  };

  const setItemQty = (key: string, qty: number) => {
    setQtyMap((prev) => ({ ...prev, [key]: Math.max(1, qty) }));
  };

  const setCustomTindakan = (text: string, tindakan: TindakanType) => {
    setCustomTindakanMap((prev) => ({ ...prev, [text]: tindakan }));
  };

  const setCustomItemQty = (text: string, qty: number) => {
    setCustomQtyMap((prev) => ({ ...prev, [text]: Math.max(1, qty) }));
  };

  const handleAddCustom = (text: string) => {
    if (!customKerusakanList.includes(text)) {
      setCustomKerusakanList((prev) => [...prev, text]);
      setCustomTindakanMap((prev) => ({ ...prev, [text]: 'Repair' }));
      setCustomQtyMap((prev) => ({ ...prev, [text]: 1 }));
    }
  };

  const handleRemoveCustom = (text: string) => {
    setCustomKerusakanList((prev) => prev.filter((item) => item !== text));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'namaPelapor') {
      setFormData((prev) => ({ ...prev, namaPelapor: value }));
    } else if (name === 'seksi') {
      setFormData((prev) => ({
        ...prev,
        seksi: value,
        jenisDaisha: '',
      }));
      setSelectedKerusakan([]);
      setCustomKerusakanList([]);
      setTindakanMap({});
      setCustomTindakanMap({});
      setQtyMap({});
      setCustomQtyMap({});
    } else if (name === 'showAll') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setShowAllDaisha(isChecked);
    } else if (name === 'jenisDaisha') {
      const daishaSeksi = masterDataDaisha[value]?.seksi;
      setFormData((prev) => ({
        ...prev,
        jenisDaisha: value,
        // Jangan timpa seksi jika user sudah memilih seksi asal unit
        seksi: prev.seksi || (daishaSeksi !== 'All seksi' ? daishaSeksi : '') || prev.seksi,
      }));
      setSelectedKerusakan([]);
      setCustomKerusakanList([]);
      setTindakanMap({});
      setCustomTindakanMap({});
      setQtyMap({});
      setCustomQtyMap({});
    } else if (name === 'noDaisha') {
      const upperVal = value.toUpperCase();
      setFormData((prev) => ({ ...prev, noDaisha: upperVal }));
      if (dismissedDuplicateUnit && upperVal.trim() !== dismissedDuplicateUnit) {
        setDismissedDuplicateUnit(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.namaPelapor.trim() || isInvalidOperatorName(formData.namaPelapor)) {
      showFeedback(
        'error',
        'Nama Pelapor Diperlukan',
        'Harap isi nama Anda sebagai teknisi / operator pelapor.'
      );
      return;
    }
    if (!formData.seksi) {
      showFeedback('error', 'Seksi Diperlukan', 'Harap pilih seksi asal unit Daisha.');
      return;
    }
    if (!formData.jenisDaisha) {
      showFeedback('error', 'Jenis Daisha Diperlukan', 'Harap pilih jenis atau tipe Daisha.');
      return;
    }
    if (!formData.noDaisha.trim()) {
      showFeedback('error', 'Nomor Unit Diperlukan', 'Harap isi atau scan nomor fisik unit Daisha.');
      return;
    }
    if (totalDipilih === 0) {
      showFeedback('error', 'Pilih Kerusakan', 'Harap klik/pilih minimal 1 kerusakan pada kartu di bawah.');
      return;
    }

    const parsedItems = selectedKerusakan.map((key) => {
      const [komponen, detail] = key.split(':::');
      const tindakan = tindakanMap[key] || 'Repair';
      const qty = qtyMap[key] || 1;
      return { komponen, detail, tindakan, qty };
    });

    const listKomponenUnik = Array.from(new Set(parsedItems.map((p) => p.komponen)));
    if (customKerusakanList.length > 0 && !listKomponenUnik.includes('Others')) {
      listKomponenUnik.push('Others');
    }
    const finalKategori = listKomponenUnik.join(', ');

    const detailList: string[] = [
      ...parsedItems.map((p, idx) => {
        const num = parsedItems.length + customKerusakanList.length > 1 ? `${idx + 1}. ` : '';
        const qtyStr = `(Qty: ${p.qty}, Tindakan: ${p.tindakan})`;
        return `${num}[${p.komponen}] ${p.detail} ${qtyStr}`;
      }),
      ...customKerusakanList.map((c, idx) => {
        const tindakan = customTindakanMap[c] || 'Repair';
        const qty = customQtyMap[c] || 1;
        const num =
          parsedItems.length + customKerusakanList.length > 1
            ? `${parsedItems.length + idx + 1}. `
            : '';
        const qtyStr = `(Qty: ${qty}, Tindakan: ${tindakan})`;
        return `${num}[Others] ${c} ${qtyStr}`;
      }),
    ];

    let finalDetail = detailList.join(' | ');
    if (formData.catatanTambahan.trim()) {
      finalDetail = `${finalDetail} (Catatan: ${formData.catatanTambahan.trim()})`;
    }

    const payloadExcel: CreateTicketPayload = {
      action: 'CREATE',
      idTiket: 'TCK-' + Date.now(),
      waktuMasuk: cleanInputDateTime(formData.waktuMasuk),
      waktuKeluar: '-',
      status: 'Open',
      namaPelapor: formData.namaPelapor.trim(),
      seksi: formData.seksi,
      namaDaisha: formData.jenisDaisha,
      noDaisha: formData.noDaisha.trim().toUpperCase(),
      kategori: finalKategori,
      detail: finalDetail,
    };

    setPendingPayload(payloadExcel);
    setIsReviewModalOpen(true);
  };

  const executeSubmit = async () => {
    if (!pendingPayload) return;
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingPayload),
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        setIsReviewModalOpen(false);

        const printable: PrintableTicketData = {
          idTiket: pendingPayload.idTiket,
          noDaisha: pendingPayload.noDaisha,
          namaDaisha: pendingPayload.namaDaisha,
          seksi: pendingPayload.seksi,
          namaPelapor: pendingPayload.namaPelapor,
          waktuMasuk: pendingPayload.waktuMasuk,
          status: pendingPayload.status,
          detail: pendingPayload.detail,
        };
        setCreatedTicketForTag(printable);

        showFeedback(
          'success',
          'Laporan Berhasil Disimpan',
          `Laporan unit ${pendingPayload.noDaisha} (${pendingPayload.namaDaisha}) berhasil dikirim ke antrean workshop. Anda dapat mencetak Tag Fisik Unit sekarang untuk digantungkan pada Daisha.`,
          `Seksi: ${pendingPayload.seksi} | Komponen: ${pendingPayload.kategori} | Gejala: ${pendingPayload.detail}`,
          'Tutup',
          '🏷️ Cetak Tag Fisik Unit',
          () => {
            setFeedback((prev) => ({ ...prev, isOpen: false }));
            setIsPrintTagOpen(true);
          }
        );

        setFormData({
          waktuMasuk: getInitialDateTime(),
          namaPelapor: '', // Selalu kosongkan, tidak diingat
          seksi: '',
          jenisDaisha: '',
          noDaisha: '',
          catatanTambahan: '',
        });
        setSelectedKerusakan([]);
        setCustomKerusakanList([]);
        setTindakanMap({});
        setCustomTindakanMap({});
        setQtyMap({});
        setCustomQtyMap({});
        setShowAllDaisha(false);
        setPendingPayload(null);
      } else {
        setIsReviewModalOpen(false); // Tutup review modal agar tidak tumpang tindih dengan popup error
        showFeedback(
          'error',
          'Gagal Mengirim Laporan',
          resData.error || 'Terjadi kesalahan saat menyimpan laporan.'
        );
      }
    } catch (error) {
      setIsReviewModalOpen(false);
      console.error('Error submit:', error);
      showFeedback(
        'error',
        'Gangguan Jaringan',
        'Gagal menghubungi server. Periksa koneksi internet Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5 md:p-8 flex justify-center items-start pb-24 md:pb-10">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200 w-full max-w-3xl">
        {/* Header Form */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-2">
          <div>
            <h1 className="text-base sm:text-2xl font-black text-slate-900 leading-tight">
              Input Daisha Rusak
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Catat laporan perbaikan unit sesuai katalog workshop
            </p>
          </div>
          <Link
            href="/riwayat"
            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0"
          >
            <span>📋</span>
            <span className="hidden sm:inline">Cek Riwayat Laporan</span>
            <span className="sm:hidden">Riwayat</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informasi Pelapor & Waktu */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>👤</span> 1. Informasi Pelapor & Waktu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Waktu Temuan / Masuk *
                </label>
                <IndoDateTimeInput
                  value={formData.waktuMasuk}
                  onChange={(val) => setFormData((prev) => ({ ...prev, waktuMasuk: val }))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Pelapor / Teknisi *
                </label>
                <input
                  type="text"
                  name="namaPelapor"
                  value={formData.namaPelapor}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                  placeholder="Ketik nama Anda..."
                  required
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 font-bold bg-white focus:ring-2 focus:ring-red-600 outline-none placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Identifikasi Unit Daisha */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🛒</span> 2. Identifikasi Unit Daisha
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Seksi Asal Unit *
                </label>
                <select
                  name="seksi"
                  value={formData.seksi}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 font-bold bg-white focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
                >
                  <option value="">-- Pilih Seksi --</option>
                  {DAFTAR_SEKSI.filter((s) => s !== 'All seksi').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipe / Jenis Daisha *
                </label>
                <select
                  name="jenisDaisha"
                  value={formData.jenisDaisha}
                  onChange={handleChange}
                  required
                  disabled={!formData.seksi && !showAllDaisha}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium bg-white focus:ring-2 focus:ring-red-600 outline-none disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                >
                  <option value="">
                    {formData.seksi || showAllDaisha
                      ? '-- Pilih Jenis Daisha --'
                      : 'Pilih Seksi Terlebih Dahulu'}
                  </option>
                  {pilihanDaishaTersedia.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="showAll"
                id="showAll"
                checked={showAllDaisha}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-red-600 rounded accent-red-600 cursor-pointer"
              />
              <label
                htmlFor="showAll"
                className="text-xs text-slate-600 font-semibold cursor-pointer select-none"
              >
                Tampilkan seluruh jenis Daisha di dropdown tanpa terikat filter Seksi
              </label>
            </div>

            {/* Nomor Unit & Barcode Scanner Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-3 border-t border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Nomor Unit Daisha *
                  </label>
                  {detectedSize && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black border ${detectedSize.badgeBg} ${detectedSize.textColor} ${detectedSize.borderColor} animate-fade-in shadow-2xs`}
                    >
                      <span>📐</span>
                      <span>Ukuran: {detectedSize.label}</span>
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  name="noDaisha"
                  value={formData.noDaisha}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                  placeholder="Ketik atau scan barcode (Cth: M00287, S00064)"
                  required
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-900 font-black bg-white focus:ring-2 focus:ring-red-600 outline-none uppercase placeholder-slate-400"
                />
                {detectedSize ? (
                  <span className={`text-[10px] font-bold mt-1 block ${detectedSize.textColor}`}>
                    Otomatis terdeteksi: <strong>{detectedSize.description}</strong> dari awalan &apos;{detectedSize.code}&apos;
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Awalan kode: <strong>S</strong> = Small, <strong>M</strong> = Medium, <strong>L</strong> = Large
                  </span>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsScanning(true)}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📷</span>
                  <span>Scan Barcode / QR Kamera</span>
                </button>
              </div>
            </div>

            {/* Warning Card Duplikasi Unit Aktif */}
            {duplicateActiveTicket && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-2xl shadow-xs animate-fade-in text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl mt-0.5">⚠️</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-amber-950 text-xs tracking-tight">
                          PERINGATAN: Unit {duplicateActiveTicket.noDaisha} Sedang Dalam Antrean Bengkel!
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                          Status: {duplicateActiveTicket.status}
                        </span>
                      </div>

                      <p className="text-slate-600 mt-1 font-medium">
                        Tiket ID: <strong className="font-mono text-slate-900">{duplicateActiveTicket.idTiketAsli}</strong> • Seksi:{' '}
                        <strong>{duplicateActiveTicket.seksi}</strong> • Dilaporkan oleh:{' '}
                        <strong>{duplicateActiveTicket.pelapor}</strong> ({duplicateActiveTicket.tglMasuk})
                      </p>

                      {duplicateActiveTicket.detail && duplicateActiveTicket.detail !== '-' && (
                        <div className="mt-2 p-2.5 bg-white rounded-xl border border-amber-200/80 text-[11px] text-slate-700 font-medium leading-relaxed">
                          <span className="font-bold text-amber-900 block mb-0.5">
                            Rincian Kerusakan yang Sedang Berjalan:
                          </span>
                          {duplicateActiveTicket.detail}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDismissedDuplicateUnit(normalizedNoDaisha)}
                    className="text-slate-400 hover:text-slate-700 font-black text-xs p-1 rounded-lg hover:bg-amber-100 transition cursor-pointer shrink-0"
                    title="Abaikan peringatan ini"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href="/riwayat"
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🔍</span>
                    <span>Buka Tiket di Riwayat Laporan</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDismissedDuplicateUnit(normalizedNoDaisha)}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    Abaikan & Tetap Buat Laporan Baru
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Titik Kerusakan Unit Daisha */}
          <DamageCatalogSelector
            jenisDaisha={formData.jenisDaisha}
            katalogKerusakan={katalogKerusakan}
            selectedKerusakan={selectedKerusakan}
            tindakanMap={tindakanMap}
            qtyMap={qtyMap}
            customKerusakanList={customKerusakanList}
            customTindakanMap={customTindakanMap}
            customQtyMap={customQtyMap}
            onToggleKerusakan={toggleKerusakan}
            onSetTindakan={setItemTindakan}
            onSetQty={setItemQty}
            onAddCustom={handleAddCustom}
            onRemoveCustom={handleRemoveCustom}
            onSetCustomTindakan={setCustomTindakan}
            onSetCustomQty={setCustomItemQty}
            catatanTambahan={formData.catatanTambahan}
            onCatatanChange={(val) => setFormData((prev) => ({ ...prev, catatanTambahan: val }))}
          />

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-700 hover:bg-red-800 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-red-900/20 transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span>Menyimpan ke Sistem Workshop...</span>
              </>
            ) : (
              '💾 Simpan Laporan Kerusakan Daisha'
            )}
          </button>
        </form>
      </div>

      {/* Camera QR/Barcode Scanner Modal */}
      <QrScannerModal
        isOpen={isScanning}
        onScanSuccess={(decoded) => {
          const upper = decoded.trim().toUpperCase();
          setFormData((prev) => ({ ...prev, noDaisha: upper }));
          setIsScanning(false);
          setDismissedDuplicateUnit(null);
          showFeedback(
            'success',
            'Barcode Terbaca',
            `Nomor Unit Daisha ${upper} berhasil terdeteksi otomatis.`,
            decoded
          );
        }}
        onClose={() => setIsScanning(false)}
        onError={(err) => {
          showFeedback('error', 'Izin Kamera Diperlukan', err);
          setIsScanning(false);
        }}
      />

      {/* Review Ringkasan Sebelum Kirim */}
      <ReviewTicketModal
        isOpen={isReviewModalOpen}
        payload={pendingPayload}
        isLoading={loading}
        onConfirm={executeSubmit}
        onCancel={() => setIsReviewModalOpen(false)}
      />

      {/* Interactive Feedback Modal */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        detail={feedback.detail}
        buttonText={feedback.buttonText}
        secondaryButtonText={feedback.secondaryButtonText}
        onSecondaryClick={feedback.onSecondaryClick}
        onClose={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Modal Cetak Tag Fisik Unit Daisha */}
      <PrintTicketTagModal
        isOpen={isPrintTagOpen}
        ticket={createdTicketForTag}
        onClose={() => setIsPrintTagOpen(false)}
      />
    </div>
  );
}