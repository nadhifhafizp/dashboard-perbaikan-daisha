'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CreateTicketPayload, Ticket } from '@/types/ticket';
import { getInitialDateTime, cleanInputDateTime } from '@/lib/date';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import QrScannerModal from '@/components/input/QrScannerModal';
import ReviewTicketModal from '@/components/input/ReviewTicketModal';
import DamageCatalogSelector, { TindakanType } from '@/components/input/DamageCatalogSelector';
import PrintTicketTagModal, { PrintableTicketData } from '@/components/common/PrintTicketTagModal';
import IndoDateTimeInput from '@/components/common/IndoDateTimeInput';
import DaishaVariantSelector from '@/components/input/DaishaVariantSelector';
import { DaishaVariantInfo } from '@/lib/daishaVariants';
import { detectDaishaSize } from '@/lib/daishaSize';
import { useDaishaCatalog } from '@/hooks/useDaishaCatalog';
import { useTickets, broadcastTicketChange } from '@/hooks/useTickets';
import { ArrowLeft, LayoutDashboard, ClipboardList, Settings, User, Layers, Ruler, Camera, AlertTriangle, Search, Wrench, Lightbulb, Truck, Save, Tag, X } from 'lucide-react';

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
  const { isAdmin } = useAuth();
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

  // Mode Fleksibel: Kerusakan Belum Diketahui / Cek di Bengkel
  const [isDiagnosaBengkel, setIsDiagnosaBengkel] = useState(false);
  const [catatanGejala, setCatatanGejala] = useState('');

  // Modal States
  const [isScanning, setIsScanning] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateTicketPayload | null>(null);

  const { tickets, refresh, setTickets } = useTickets({ autoRefreshIntervalMs: 0 });
  const { catalog, seksiList, daishaList, getDaishaBySeksi } = useDaishaCatalog();

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
        (t: Ticket) =>
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
    if (showAllDaisha) return daishaList;
    return getDaishaBySeksi(formData.seksi);
  }, [showAllDaisha, formData.seksi, daishaList, getDaishaBySeksi]);

  // Katalog kerusakan untuk jenis Daisha yang sedang dipilih
  const katalogKerusakan = useMemo(() => {
    if (!formData.jenisDaisha || !catalog[formData.jenisDaisha]) return {};
    return catalog[formData.jenisDaisha].jenisKerusakan || {};
  }, [formData.jenisDaisha, catalog]);

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
      const daishaSeksi = catalog[value]?.seksi;
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
    if (!isDiagnosaBengkel && totalDipilih === 0) {
      showFeedback(
        'error',
        'Pilih Kerusakan',
        'Harap klik/pilih minimal 1 kerusakan pada katalog di bawah atau pilih mode "Cek di Bengkel" jika kerusakan belum diketahui.'
      );
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
    const finalKategori = isDiagnosaBengkel
      ? 'Menunggu Diagnosa Bengkel'
      : listKomponenUnik.join(', ') || 'Umum';

    const detailList: string[] = isDiagnosaBengkel
      ? [
          `• [Pemeriksaan Bengkel] Kerusakan belum diidentifikasi di lapangan.${
            catatanGejala.trim() ? ` Catatan Gejala: ${catatanGejala.trim()}` : ''
          }`,
        ]
      : [
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
    if (!isDiagnosaBengkel && formData.catatanTambahan.trim()) {
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

        // 1. Optimistic Update: Langsung masukkan tiket baru ke state antrean aktif
        const optimisticTicket: Ticket = {
          id: pendingPayload.idTiket,
          idTiketAsli: pendingPayload.idTiket,
          noTiket: pendingPayload.idTiket,
          pelapor: pendingPayload.namaPelapor,
          namaPelapor: pendingPayload.namaPelapor,
          tglMasuk: pendingPayload.waktuMasuk,
          tglKeluar: '-',
          status: 'Open',
          namaDaisha: pendingPayload.namaDaisha,
          seksi: pendingPayload.seksi,
          noDaisha: pendingPayload.noDaisha,
          jenisKerusakan: pendingPayload.kategori,
          kategori: pendingPayload.kategori,
          detail: pendingPayload.detail,
          reason: '-',
        };
        setTickets((prev: Ticket[]) => [optimisticTicket, ...prev.filter((t: Ticket) => t.idTiketAsli !== optimisticTicket.idTiketAsli)]);

        // 2. Fetch fresh data dari server di background dan siarkan ke seluruh jendela/tab
        void refresh(true, true);
        broadcastTicketChange();

        // 3. Reset dismissed duplicate unit agar peringatan langsung aktif jika unit yang sama dicek kembali
        setDismissedDuplicateUnit(null);

        showFeedback(
          'success',
          'Laporan Berhasil Disimpan',
          `Laporan unit ${pendingPayload.noDaisha} (${pendingPayload.namaDaisha}) berhasil dikirim ke antrean workshop. Anda dapat mencetak Tag Fisik Unit sekarang untuk digantungkan pada Daisha.`,
          `Seksi: ${pendingPayload.seksi} | Komponen: ${pendingPayload.kategori} | Gejala: ${pendingPayload.detail}`,
          'Tutup',
          'Cetak Tag Fisik Unit',
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
        setIsDiagnosaBengkel(false);
        setCatatanGejala('');
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
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 md:p-8 flex justify-center items-start pb-24 md:pb-10">
      <div className="bg-white p-5 sm:p-7 rounded-xl shadow-2xs border border-slate-200/80 w-full max-w-3xl">
        {/* Header Form dengan Breadcrumb & Quick Nav */}
        <div className="border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2 mb-2.5 flex-wrap text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/daisha"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-red-600" />
              <span>Dashboard Daisha</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
              Input Rusak
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Input Daisha Rusak
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5">
                Catat laporan perbaikan unit sesuai katalog workshop maintenance
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/daisha"
                className="h-8 px-3 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition inline-flex items-center gap-1.5 border border-slate-200 shadow-2xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/riwayat"
                className="h-8 px-3 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition inline-flex items-center gap-1.5 border border-slate-200 shadow-2xs"
              >
                <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                <span>Status Antrean</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="h-8 px-3 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition inline-flex items-center gap-1.5 border border-slate-200 shadow-2xs"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Panel Admin</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Informasi Pelapor & Waktu */}
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <h2 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-red-600" />
              <span>1. Informasi Pelapor & Waktu</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Waktu Temuan / Masuk *
                </label>
                <IndoDateTimeInput
                  value={formData.waktuMasuk}
                  onChange={(val) => setFormData((prev) => ({ ...prev, waktuMasuk: val }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="input-nama-pelapor" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Nama Pelapor / Teknisi *
                </label>
                <input
                  id="input-nama-pelapor"
                  type="text"
                  name="namaPelapor"
                  value={formData.namaPelapor}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                  placeholder="Ketik nama Anda..."
                  required
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none placeholder:font-normal placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Identifikasi Unit Daisha */}
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <h2 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-600" />
              <span>2. Identifikasi Unit Daisha</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="input-seksi" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Seksi Asal Unit *
                </label>
                <select
                  id="input-seksi"
                  name="seksi"
                  value={formData.seksi}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
                >
                  <option value="">-- Pilih Seksi --</option>
                  {seksiList.filter((s) => s.toLowerCase() !== 'all seksi').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="input-jenis-daisha" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tipe / Jenis Daisha *
                </label>
                <select
                  id="input-jenis-daisha"
                  name="jenisDaisha"
                  value={formData.jenisDaisha}
                  onChange={handleChange}
                  required
                  disabled={!formData.seksi && !showAllDaisha}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
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
                className="mr-2 h-4 w-4 text-red-600 rounded border-slate-300 accent-red-600 cursor-pointer"
              />
              <label
                htmlFor="showAll"
                className="text-xs text-slate-600 font-medium cursor-pointer select-none"
              >
                Tampilkan seluruh jenis Daisha di dropdown tanpa terikat filter Seksi
              </label>
            </div>

            {/* Filter & Pemilihan Varian / Susunan Daisha (misal: GT Ring Small/Medium/Large Susun 3/4) */}
            {formData.jenisDaisha && (
              <div className="mb-4">
                <DaishaVariantSelector
                  jenisDaisha={formData.jenisDaisha}
                  currentNoDaisha={formData.noDaisha}
                  onSelectVariant={(variant) => {
                    setFormData((prev) => {
                      const cleanExisting = prev.noDaisha.trim().toUpperCase().replace(/[\s\-_]/g, '');
                      const numMatch = cleanExisting.match(/\d+$/);
                      let newNo = variant.codePrefix;
                      if (numMatch) {
                        newNo = `${variant.codePrefix}${numMatch[0]}`;
                      }
                      return { ...prev, noDaisha: newNo };
                    });
                  }}
                />
              </div>
            )}

            {/* Nomor Unit & Barcode Scanner Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-3 border-t border-slate-100">
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <label htmlFor="input-no-daisha" className="block text-xs font-medium text-slate-700">
                    Nomor Unit Daisha *
                  </label>
                  {detectedSize && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${detectedSize.badgeBg} ${detectedSize.textColor} ${detectedSize.borderColor}`}
                    >
                      <Ruler className="w-3 h-3" />
                      <span>Ukuran: {detectedSize.label}</span>
                    </span>
                  )}
                </div>
                <input
                  id="input-no-daisha"
                  type="text"
                  name="noDaisha"
                  value={formData.noDaisha}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                  placeholder="Ketik atau scan barcode (Cth: M00287, S00064)"
                  required
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none uppercase placeholder-slate-400"
                />
                {detectedSize ? (
                  <span className={`text-[11px] font-normal mt-1 block ${detectedSize.textColor}`}>
                    Otomatis terdeteksi: <strong>{detectedSize.description}</strong> dari awalan &apos;{detectedSize.code}&apos;
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Awalan kode: <strong>S</strong> = Small, <strong>M</strong> = Medium, <strong>L</strong> = Large
                  </span>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsScanning(true)}
                  className="w-full h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan Barcode / QR Kamera</span>
                </button>
              </div>
            </div>

            {/* Warning Card Duplikasi Unit Aktif */}
            {duplicateActiveTicket && (
              <div className="mt-4 p-4 bg-amber-50/80 border border-amber-300/80 rounded-xl text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-amber-950 text-xs">
                          Unit {duplicateActiveTicket.noDaisha} Sedang Dalam Antrean Bengkel
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-900">
                          Status: {duplicateActiveTicket.status}
                        </span>
                      </div>

                      <p className="text-slate-600 mt-1 font-normal text-[11px]">
                        Tiket ID: <strong className="font-mono text-slate-900 tabular-nums">{duplicateActiveTicket.idTiketAsli}</strong> • Seksi:{' '}
                        <strong>{duplicateActiveTicket.seksi}</strong> • Dilaporkan oleh:{' '}
                        <strong>{duplicateActiveTicket.pelapor}</strong> ({duplicateActiveTicket.tglMasuk})
                      </p>

                      {duplicateActiveTicket.detail && duplicateActiveTicket.detail !== '-' && (
                        <div className="mt-2 p-2.5 bg-white rounded-lg border border-amber-200 text-xs text-slate-700 leading-relaxed">
                          <span className="font-medium text-amber-900 block mb-0.5">
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
                    className="text-amber-700 hover:text-amber-950 p-1 rounded-lg hover:bg-amber-100 transition cursor-pointer shrink-0"
                    title="Abaikan peringatan ini"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-amber-200/70 flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href="/riwayat"
                    className="h-8 px-3 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Buka Tiket di Riwayat Laporan</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDismissedDuplicateUnit(normalizedNoDaisha)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    Abaikan & Tetap Buat Laporan Baru
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Status / Mode Kerusakan Unit */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-red-600" />
                  <span>3. Identifikasi Kerusakan Unit</span>
                </h2>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Pilih apakah kerusakan sudah diketahui atau perlu diinspeksi teknisi saat tiba di bengkel.
                </p>
              </div>

              {/* Segmented Mode Toggle */}
              <div className="inline-flex p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDiagnosaBengkel(false)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                    !isDiagnosaBengkel
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sudah Tahu Kerusakan
                </button>
                <button
                  type="button"
                  onClick={() => setIsDiagnosaBengkel(true)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                    isDiagnosaBengkel
                      ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Cek di Bengkel</span>
                </button>
              </div>
            </div>

            {/* Mode Cek di Bengkel Info Box & Symptom Note */}
            {isDiagnosaBengkel && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-semibold text-amber-950 text-xs">
                      Mode Fleksibel: Kerusakan Belum Diketahui Lapangan
                    </p>
                    <p className="text-slate-600 mt-0.5 text-xs">
                      Unit akan didaftarkan ke antrean bengkel dengan status <strong className="text-amber-900">Menunggu Diagnosa Bengkel</strong>. Daisha dapat segera diangkut ke bengkel, dan teknisi bengkel akan melengkapi rincian komponen rusak saat memeriksa unit fisik.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Catatan Gejala / Indikasi Awal (Opsional)
                  </label>
                  <input
                    type="text"
                    value={catatanGejala}
                    onChange={(e) => setCatatanGejala(e.target.value)}
                    placeholder="Contoh: Roda seret saat didorong, rangka miring, bunyi kasar di bearing..."
                    className="w-full h-10 px-3 border border-amber-300/80 bg-white rounded-lg text-xs text-slate-900 font-normal focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder-slate-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Bantu teknisi bengkel dengan menuliskan apa yang Anda rasakan atau lihat saat menggunakan unit ini.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3B: Titik Kerusakan Unit Daisha (Hanya jika mode "Sudah Tahu Kerusakan") */}
          {!isDiagnosaBengkel && (
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
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 text-white font-medium text-xs sm:text-sm rounded-lg transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
              isDiagnosaBengkel
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Menyimpan ke Sistem Workshop...</span>
              </>
            ) : isDiagnosaBengkel ? (
              <>
                <Truck className="w-4 h-4" />
                <span>Daftarkan Unit ke Antrean Bengkel</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Laporan Kerusakan Daisha</span>
              </>
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