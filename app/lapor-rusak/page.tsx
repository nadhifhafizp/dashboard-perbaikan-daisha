'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getInitialDateTime, cleanInputDateTime } from '@/lib/date';
import { detectDaishaSize } from '@/lib/daishaSize';
import { useDaishaCatalog } from '@/hooks/useDaishaCatalog';
import { useTickets, broadcastTicketChange } from '@/hooks/useTickets';
import { useSectionDaishaUnits } from '@/hooks/useSectionDaishaUnits';
import QrScannerModal from '@/components/input/QrScannerModal';
import PrintTicketTagModal, { PrintableTicketData } from '@/components/common/PrintTicketTagModal';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Send,
  ShieldAlert,
  Tag,
  User,
  Wrench,
  X,
  Building2,
  Check,
} from 'lucide-react';

export default function LaporRusakSeksiPage() {
  const router = useRouter();
  const { currentUser, isSeksi, isLoading: authLoading } = useAuth();
  const { seksiList } = useDaishaCatalog();
  const { tickets, refresh } = useTickets({ autoRefreshIntervalMs: 0 });

  // Seksi Terkunci untuk USER_SEKSI
  const [selectedSeksi, setSelectedSeksi] = useState<string>('');
  const activeSeksi = useMemo(() => {
    if (isSeksi && currentUser?.seksi) {
      return currentUser.seksi;
    }
    return selectedSeksi || currentUser?.seksi || 'Building';
  }, [isSeksi, currentUser?.seksi, selectedSeksi]);

  // Hook unit seksi
  const {
    units: sectionUnits,
    types: sectionTypes,
    loading: unitsLoading,
    findUnit,
  } = useSectionDaishaUnits(activeSeksi);

  // State Form
  const [namaPelapor, setNamaPelapor] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [inputMode, setInputMode] = useState<'SELECT' | 'MANUAL'>('SELECT');
  const [noDaisha, setNoDaisha] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');
  const [catatanLokasi, setCatatanLokasi] = useState<string>('');
  const [waktuLapor] = useState<string>(getInitialDateTime());

  // Scanner & Modal State
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPrintTagOpen, setIsPrintTagOpen] = useState(false);
  const [createdTicketData, setCreatedTicketData] = useState<PrintableTicketData | null>(null);

  // Feedback Modal
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  // Guard login
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login?from=/lapor-rusak');
    }
  }, [authLoading, currentUser, router]);

  // Inisialisasi data user
  useEffect(() => {
    if (currentUser) {
      if (!namaPelapor) {
        setNamaPelapor(currentUser.name || currentUser.username || '');
      }
      if (currentUser.seksi && !selectedSeksi) {
        setSelectedSeksi(currentUser.seksi);
      }
    }
  }, [currentUser, namaPelapor, selectedSeksi]);

  // Filter unit berdasarkan tipe yang dipilih
  const filteredUnits = useMemo(() => {
    if (selectedType === 'ALL') return sectionUnits;
    return sectionUnits.filter(
      (u) => u.namaDaisha.toLowerCase() === selectedType.toLowerCase()
    );
  }, [sectionUnits, selectedType]);

  // Unit yang sedang aktif (bisa dari select atau manual input)
  const currentUnitNumber = inputMode === 'SELECT' ? noDaisha : manualInput.trim().toUpperCase();

  // Pencocokan unit dengan master data seksi
  const matchedUnit = useMemo(() => {
    return findUnit(currentUnitNumber);
  }, [findUnit, currentUnitNumber]);

  // Deteksi ukuran
  const detectedSize = useMemo(() => {
    if (matchedUnit?.ukuran && matchedUnit.ukuran !== 'STANDARD') {
      return { code: matchedUnit.ukuran, label: matchedUnit.ukuran };
    }
    if (!currentUnitNumber) return null;
    return detectDaishaSize(currentUnitNumber);
  }, [matchedUnit, currentUnitNumber]);

  // Deteksi duplikasi tiket aktif (status 'Open' atau 'Progress')
  const cleanNoDaisha = currentUnitNumber.trim().toUpperCase();
  const duplicateActiveTicket = useMemo(() => {
    if (!cleanNoDaisha || cleanNoDaisha.length < 2) return null;
    return (
      tickets.find(
        (t) =>
          t.noDaisha?.trim().toUpperCase() === cleanNoDaisha &&
          (t.status === 'Open' || t.status === 'Progress')
      ) || null
    );
  }, [tickets, cleanNoDaisha]);

  // Handler Scan QR
  const handleScanSuccess = useCallback((scannedText: string) => {
    const cleaned = scannedText.trim().toUpperCase();
    setInputMode('MANUAL');
    setManualInput(cleaned);
    setIsScanning(false);
  }, []);

  // Submit Laporan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cleanNoDaisha) {
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Nomor Daisha Wajib Dipilih',
        message: `Pilih unit Daisha milik seksi ${activeSeksi} dari daftar atau gunakan scan QR.`,
      });
      return;
    }

    if (!namaPelapor.trim()) {
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Nama Pelapor Diperlukan',
        message: 'Harap cantumkan nama personil seksi yang melaporkan.',
      });
      return;
    }

    const finalNamaDaisha = matchedUnit?.namaDaisha || `Daisha ${activeSeksi}`;
    const cleanIdTiket = `TCK-${Date.now()}`;
    const cleanWaktu = cleanInputDateTime(waktuLapor);

    const payload = {
      action: 'CREATE',
      idTiket: cleanIdTiket,
      noDaisha: cleanNoDaisha,
      namaDaisha: finalNamaDaisha,
      seksi: activeSeksi,
      namaPelapor: namaPelapor.trim(),
      waktuMasuk: cleanWaktu,
      lokasi: catatanLokasi.trim(),
      catatan: catatanLokasi.trim() || `Laporan perbaikan dari seksi ${activeSeksi}`,
      isSeksiReport: true,
      detail: `• [Laporan Seksi ${activeSeksi}] Unit dilaporkan rusak.${
        catatanLokasi.trim()
          ? ` Catatan Posisi/Kondisi: ${catatanLokasi.trim()}`
          : ' Menunggu pemeriksaan & diagnosa teknisi bengkel.'
      }`,
    };

    setLoading(true);

    try {
      const res = await fetch('/api/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        broadcastTicketChange();
        void refresh(true, true);

        const printable: PrintableTicketData = {
          idTiket: cleanIdTiket,
          noDaisha: cleanNoDaisha,
          namaDaisha: finalNamaDaisha,
          seksi: activeSeksi,
          namaPelapor: namaPelapor.trim(),
          waktuMasuk: cleanWaktu,
          status: 'Open',
          detail: payload.detail,
        };
        setCreatedTicketData(printable);

        setFeedback({
          isOpen: true,
          type: 'success',
          title: 'Laporan Kerusakan Terkirim!',
          message: `Daisha ${cleanNoDaisha} (${finalNamaDaisha}) dari Seksi ${activeSeksi} telah masuk ke antrean bengkel maintenance dengan ID Tiket ${cleanIdTiket}.`,
          actionLabel: 'Lihat Antrean Bengkel',
          onAction: () => router.push('/riwayat'),
        });

        // Reset nomor unit
        setNoDaisha('');
        setManualInput('');
        setCatatanLokasi('');
      } else {
        setFeedback({
          isOpen: true,
          type: 'error',
          title: 'Gagal Mengirim Laporan',
          message: data.error || 'Terjadi gangguan saat menyimpan laporan.',
        });
      }
    } catch (err) {
      console.error('Submit report error:', err);
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gangguan Jaringan',
        message: 'Tidak dapat terhubung ke server. Periksa jaringan Anda.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-5 pb-24 md:pb-10 font-sans">
      {/* 1. Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal {isSeksi ? `Seksi ${activeSeksi}` : 'Workshop'}</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">Lapor Daisha Rusak</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Lapor Daisha Rusak : Seksi {activeSeksi}</span>
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Pelaporan unit rusak khusus seksi {activeSeksi} (tanpa perlu diagnosa kerusakan teknis)
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/riwayat"
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 h-8.5 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Status Antrean</span>
          </Link>
        </div>
      </div>

      {/* 2. Banner Otomatisasi Seksi */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-slate-50 border border-red-200/70 flex items-start gap-3 shadow-2xs">
        <div className="p-2 rounded-lg bg-red-600 text-white shrink-0 mt-0.5 shadow-2xs">
          <Wrench className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-semibold text-slate-900">
            Armada Dipetakan untuk Seksi {activeSeksi}
          </p>
          <p className="leading-relaxed text-slate-600">
            Daftar pilihan Daisha di bawah <strong>hanya memuat unit milik Seksi {activeSeksi}</strong>. Pilih nomor Daisha dan posisi saat ini. Teknisi workshop maintenance yang akan memeriksa fisik dan mengeksekusi perbaikan.
          </p>
        </div>
      </div>

      {/* 3. Form Utama */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Identitas Seksi & Pelapor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-red-600" />
            <span>1. Asal Seksi & Pelapor</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seksi Pelapor (Terkunci Otomatis untuk User Seksi) */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Seksi Pelapor
              </label>

              {isSeksi ? (
                <div className="h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span className="font-bold text-xs text-slate-900">Seksi {activeSeksi}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Terkunci Otomatis
                  </span>
                </div>
              ) : (
                <select
                  value={selectedSeksi}
                  onChange={(e) => {
                    setSelectedSeksi(e.target.value);
                    setNoDaisha('');
                    setManualInput('');
                  }}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition cursor-pointer"
                >
                  {seksiList.map((s) => (
                    <option key={s} value={s}>
                      Seksi {s}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                Seksi pemilik armada Daisha yang dilaporkan rusak.
              </p>
            </div>

            {/* Nama Pelapor */}
            <div>
              <label htmlFor="input-nama-pelapor" className="block text-xs font-semibold text-slate-800 mb-1">
                Nama Personil Pelapor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="input-nama-pelapor"
                  type="text"
                  value={namaPelapor}
                  onChange={(e) => setNamaPelapor(e.target.value)}
                  placeholder="Nama pelapor..."
                  className="w-full h-10 pl-9 pr-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Nama personil seksi untuk konfirmasi perbaikan.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Pemilihan Unit Daisha Seksi Terkait */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-600" />
              <span>2. Daisha Milik Seksi {activeSeksi}</span>
            </h2>

            {/* Toggle Mode Input: Pilih dari Daftar vs Ketik Nomor / Scan QR */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setInputMode('SELECT')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  inputMode === 'SELECT'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Pilih dari Daftar ({sectionUnits.length})
              </button>
              <button
                type="button"
                onClick={() => setInputMode('MANUAL')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  inputMode === 'MANUAL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Ketik Nomor / Scan QR
              </button>
            </div>
          </div>

          {/* Opsi 1: Dropdown Tipe & Nomor Daisha (Paling praktis & rapi) */}
          {inputMode === 'SELECT' ? (
            <div className="space-y-3">
              {/* Filter Tipe Daisha jika seksi memiliki lebih dari 1 tipe */}
              {sectionTypes.length > 1 && (
                <div>
                  <label htmlFor="select-tipe-daisha" className="block text-xs font-semibold text-slate-800 mb-1">
                    Tipe Daisha di Seksi {activeSeksi}
                  </label>
                  <select
                    id="select-tipe-daisha"
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setNoDaisha('');
                    }}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition cursor-pointer"
                  >
                    <option value="ALL">-- Tampilkan Semua Tipe ({sectionUnits.length} unit) --</option>
                    {sectionTypes.map((t) => {
                      const count = sectionUnits.filter(
                        (u) => u.namaDaisha.toLowerCase() === t.toLowerCase()
                      ).length;
                      return (
                        <option key={t} value={t}>
                          {t} ({count} unit)
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Dropdown Nomor Daisha Milik Seksi */}
              <div>
                <label htmlFor="select-no-daisha" className="block text-xs font-semibold text-slate-800 mb-1">
                  Nomor Fisik Daisha <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    id="select-no-daisha"
                    value={noDaisha}
                    onChange={(e) => setNoDaisha(e.target.value)}
                    disabled={unitsLoading || filteredUnits.length === 0}
                    className="flex-1 h-10 px-3 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition cursor-pointer disabled:bg-slate-100"
                    required
                  >
                    <option value="">
                      {unitsLoading
                        ? 'Memuat armada Daisha seksi...'
                        : `-- Pilih Nomor Unit Daisha (${filteredUnits.length} unit tersedia) --`}
                    </option>
                    {filteredUnits.map((u) => (
                      <option key={u.noDaisha} value={u.noDaisha}>
                        {u.noDaisha} - {u.namaDaisha} {u.ukuran && u.ukuran !== 'STANDARD' ? `(${u.ukuran})` : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setIsScanning(true)}
                    className="min-h-[44px] h-10 px-3.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs"
                    title="Scan barcode atau QR code pada fisik Daisha"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="hidden sm:inline">Scan QR</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pilih nomor unit fisik yang rusak. Hanya unit yang terdaftar di Seksi {activeSeksi} yang muncul.
                </p>
              </div>
            </div>
          ) : (
            // Opsi 2: Input Manual / Scan QR
            <div>
              <label htmlFor="input-manual-no-daisha" className="block text-xs font-semibold text-slate-800 mb-1">
                Ketik Nomor Fisik Daisha <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="input-manual-no-daisha"
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                    placeholder="Contoh: S4 214 atau S00010..."
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none uppercase tracking-wide transition"
                    required
                  />
                  {manualInput && (
                    <button
                      type="button"
                      onClick={() => setManualInput('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsScanning(true)}
                  className="min-h-[44px] h-10 px-3.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs"
                  title="Scan barcode atau QR code pada fisik Daisha"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Scan QR</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ketik nomor Daisha atau gunakan kamera untuk memindai kode QR pada unit.
              </p>
            </div>
          )}

          {/* Kartu Konfirmasi Identitas Unit Terpilih */}
          {cleanNoDaisha && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  DS
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>{cleanNoDaisha}</span>
                    {detectedSize && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300">
                        {detectedSize.code} {detectedSize.label !== detectedSize.code ? `(${detectedSize.label})` : ''}
                      </span>
                    )}
                    {matchedUnit ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Terverifikasi Seksi {activeSeksi}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Unit Manual
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Tipe: <span className="font-semibold text-slate-800">{matchedUnit?.namaDaisha || `Daisha ${activeSeksi}`}</span> • Seksi: <span className="font-semibold text-slate-800">{activeSeksi}</span>
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500 font-medium">
                Antrean Bengkel: <span className="text-red-600 font-bold">Open (Menunggu Evakuasi & Diagnosa)</span>
              </div>
            </div>
          )}

          {/* Warning Tiket Aktif / Duplikat */}
          {duplicateActiveTicket && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-amber-900">
                  Peringatan: Unit {duplicateActiveTicket.noDaisha} saat ini sedang dalam penanganan bengkel!
                </p>
                <p className="text-amber-700">
                  Unit sudah memiliki tiket aktif dengan status <strong>{duplicateActiveTicket.status}</strong> (Tiket #{duplicateActiveTicket.idTiketAsli}) sejak {duplicateActiveTicket.tglMasuk}. Anda tetap dapat mengirim jika ini laporan mendesak tambahan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Posisi Penempatan di Area Seksi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span>3. Posisi Fisik Unit di Seksi {activeSeksi}</span>
          </h2>

          <div>
            <label htmlFor="input-catatan-lokasi" className="block text-xs font-semibold text-slate-800 mb-1">
              Titik Penempatan / Posisi Penjemputan <span className="text-slate-500 font-normal">(Opsional)</span>
            </label>
            <textarea
              id="input-catatan-lokasi"
              value={catatanLokasi}
              onChange={(e) => setCatatanLokasi(e.target.value)}
              rows={3}
              placeholder={`Contoh: Unit diletakkan di dekat Line 2 ${activeSeksi}, roda macet / bearing rontok tidak bisa ditarik...`}
              className="w-full p-3 border border-slate-300 rounded-lg text-xs font-normal text-slate-800 bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition resize-none placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Cantumkan titik lokasi unit di seksi Anda agar tim Workshop Maintenance dapat segera menemukan dan mengevakuasi unit.
            </p>
          </div>
        </div>

        {/* Section 4: Tombol Kirim */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Laporan akan langsung diteruskan ke Workshop Maintenance atas nama Seksi <strong>{activeSeksi}</strong>.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="submit"
              disabled={loading || !cleanNoDaisha}
              className="min-h-[44px] h-10 px-5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg transition inline-flex items-center justify-center gap-2 shadow-2xs cursor-pointer w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengirim Laporan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Laporan Daisha Rusak</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Modal QR Scanner */}
      {isScanning && (
        <QrScannerModal
          isOpen={isScanning}
          onClose={() => setIsScanning(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Modal Cetak Tag Daisha jika ingin langsung ditempel di unit fisik */}
      {createdTicketData && (
        <PrintTicketTagModal
          isOpen={isPrintTagOpen}
          ticket={createdTicketData}
          onClose={() => setIsPrintTagOpen(false)}
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        buttonText="Tutup"
        secondaryButtonText={feedback.actionLabel}
        onSecondaryClick={feedback.onAction}
        onClose={() => {
          setFeedback((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}
