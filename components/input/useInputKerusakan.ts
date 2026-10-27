'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CreateTicketPayload, Ticket, TicketStatus } from '@/types/ticket';
import { getInitialDateTime, cleanInputDateTime } from '@/lib/date';
import { FeedbackType } from '@/components/FeedbackModal';
import { TindakanType } from '@/components/input/DamageCatalogSelector';
import { PrintableTicketData } from '@/components/common/PrintTicketTagModal';
import { detectDaishaSize } from '@/lib/daishaSize';
import { useDaishaCatalog } from '@/hooks/useDaishaCatalog';
import { useTickets, broadcastTicketChange } from '@/hooks/useTickets';
import {
  validateTicketInput,
  buildTicketDamagePayload,
  isInvalidOperatorName,
} from '@/lib/ticketUtils';

const API_URL = '/api/repair';

export interface FormDataState {
  waktuMasuk: string;
  namaPelapor: string;
  seksi: string;
  jenisDaisha: string;
  noDaisha: string;
  catatanTambahan: string;
}

export function useInputKerusakan() {
  const { isAdmin, isOperator, currentUser } = useAuth();
  const [formData, setFormData] = useState<FormDataState>({
    waktuMasuk: getInitialDateTime(),
    namaPelapor: '',
    seksi: '',
    jenisDaisha: '',
    noDaisha: '',
    catatanTambahan: '',
  });

  // Auto-populate nama pelapor & seksi dari user login (hanya jika user personil riil, bukan admin/placeholder)
  const [hasInitializedUser, setHasInitializedUser] = useState(false);
  if (!hasInitializedUser && currentUser) {
    setHasInitializedUser(true);
    const isGenericOrAdmin =
      currentUser.role === 'ADMIN' ||
      isInvalidOperatorName(currentUser.name) ||
      isInvalidOperatorName(currentUser.username);

    setFormData((prev) => ({
      ...prev,
      namaPelapor: prev.namaPelapor || (isGenericOrAdmin ? '' : (currentUser.name || currentUser.username || '')),
      seksi: prev.seksi || (currentUser.role === 'ADMIN' ? '' : (currentUser.seksi || '')),
    }));
  }

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
          (t.status === 'Open' || t.status === 'Progress' || t.status === 'Pending')
      ) || null
    );
  }, [tickets, normalizedNoDaisha, dismissedDuplicateUnit]);

  // Deteksi otomatis ukuran Daisha (S = Small, M = Medium, L = Large)
  const detectedSize = useMemo(
    () => detectDaishaSize(formData.noDaisha),
    [formData.noDaisha]
  );

  // Auto-detect unit dari histori tiket atau katalog master
  const matchedUnitInfo = useMemo(() => {
    if (!normalizedNoDaisha || normalizedNoDaisha.length < 2) return null;

    // 1. Cek dari tiket sebelumnya
    const histMatch = tickets.find(
      (t: Ticket) => t.noDaisha.trim().toUpperCase() === normalizedNoDaisha
    );
    if (histMatch && (histMatch.seksi || histMatch.namaDaisha)) {
      return {
        source: 'history' as const,
        seksi: histMatch.seksi,
        jenisDaisha: histMatch.namaDaisha || '',
      };
    }

    // 2. Cek dari prefix varian katalog jika belum ada match histori
    for (const [jenis, data] of Object.entries(catalog)) {
      if (data.codePrefix && normalizedNoDaisha.startsWith(data.codePrefix.toUpperCase())) {
        return {
          source: 'catalog' as const,
          seksi: data.seksi !== 'All seksi' ? data.seksi : '',
          jenisDaisha: jenis,
        };
      }
      if (data.variants && data.variants.length > 0) {
        for (const v of data.variants) {
          if (v.codePrefix && normalizedNoDaisha.startsWith(v.codePrefix.toUpperCase())) {
            return {
              source: 'catalog' as const,
              seksi: data.seksi !== 'All seksi' ? data.seksi : '',
              jenisDaisha: jenis,
            };
          }
        }
      }
    }

    return null;
  }, [normalizedNoDaisha, tickets, catalog]);

  // Otomatis terapkan Seksi dan Jenis Daisha begitu nomor unit dikenali (tanpa perlu klik manual)
  useEffect(() => {
    if (matchedUnitInfo?.jenisDaisha) {
      setFormData((prev) => {
        if (
          prev.jenisDaisha === matchedUnitInfo.jenisDaisha &&
          prev.seksi === (matchedUnitInfo.seksi || prev.seksi)
        ) {
          return prev;
        }
        return {
          ...prev,
          seksi: matchedUnitInfo.seksi || prev.seksi,
          jenisDaisha: matchedUnitInfo.jenisDaisha,
        };
      });
    }
  }, [matchedUnitInfo]);

  const applyMatchedUnit = useCallback(() => {
    if (!matchedUnitInfo) return;
    setFormData((prev) => ({
      ...prev,
      seksi: matchedUnitInfo.seksi || prev.seksi,
      jenisDaisha: matchedUnitInfo.jenisDaisha || prev.jenisDaisha,
    }));
  }, [matchedUnitInfo]);

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
      }));
      setDismissedDuplicateUnit(null);
    } else if (name === 'showAll') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setShowAllDaisha(isChecked);
    } else if (name === 'jenisDaisha') {
      const daishaSeksi = catalog[value]?.seksi;
      setFormData((prev) => ({
        ...prev,
        jenisDaisha: value,
        seksi: prev.seksi || (daishaSeksi && daishaSeksi !== 'All seksi' ? daishaSeksi : '') || prev.seksi,
      }));
      setDismissedDuplicateUnit(null);
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

  const handleSubmit = (e?: React.FormEvent, targetStatus?: TicketStatus) => {
    if (e && e.preventDefault) e.preventDefault();

    const validation = validateTicketInput({
      namaPelapor: formData.namaPelapor,
      seksi: formData.seksi,
      jenisDaisha: formData.jenisDaisha,
      noDaisha: formData.noDaisha,
      isDiagnosaBengkel,
      totalDamageCount: totalDipilih,
    });

    if (!validation.valid) {
      showFeedback('error', 'Validasi Form', validation.error || 'Harap periksa kelengkapan form.');
      return;
    }

    const assembled = buildTicketDamagePayload({
      isDiagnosaBengkel,
      catatanGejala,
      selectedKerusakan,
      tindakanMap,
      qtyMap,
      customKerusakanList,
      customTindakanMap,
      customQtyMap,
      catatanTambahan: formData.catatanTambahan,
    });

    const finalKategori = assembled.kategoriKerusakan;
    const finalDetail = assembled.detail;

    let finalStatus: TicketStatus = 'Open';
    if (isDiagnosaBengkel) {
      finalStatus = 'Open';
    } else if (isAdmin || isOperator) {
      finalStatus = targetStatus || 'Progress';
    } else {
      finalStatus = 'Open';
    }

    const payloadExcel: CreateTicketPayload = {
      action: 'CREATE',
      idTiket: 'TCK-' + Date.now(),
      waktuMasuk: cleanInputDateTime(formData.waktuMasuk),
      waktuKeluar: '-',
      status: finalStatus,
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

        // Optimistic Update
        const optimisticTicket: Ticket = {
          id: pendingPayload.idTiket,
          idTiketAsli: pendingPayload.idTiket,
          noTiket: pendingPayload.idTiket,
          pelapor: pendingPayload.namaPelapor,
          namaPelapor: pendingPayload.namaPelapor,
          tglMasuk: pendingPayload.waktuMasuk,
          tglKeluar: '-',
          status: pendingPayload.status,
          namaDaisha: pendingPayload.namaDaisha,
          seksi: pendingPayload.seksi,
          noDaisha: pendingPayload.noDaisha,
          jenisKerusakan: pendingPayload.kategori,
          kategori: pendingPayload.kategori,
          detail: pendingPayload.detail,
          reason: '-',
        };
        setTickets((prev: Ticket[]) => [
          optimisticTicket,
          ...prev.filter((t: Ticket) => t.idTiketAsli !== optimisticTicket.idTiketAsli),
        ]);

        void refresh(true, true);
        broadcastTicketChange();
        setDismissedDuplicateUnit(null);

        const statusLabelDesc =
          pendingPayload.status === 'Pending'
            ? 'dengan status PENDING (Menunggu Part)'
            : pendingPayload.status === 'Progress'
            ? 'dan LANGSUNG DIPROSES (Status Progress)'
            : 'dengan status OPEN (Menunggu Diagnosa Bengkel)';

        showFeedback(
          'success',
          'Laporan Berhasil Disimpan',
          `Laporan unit ${pendingPayload.noDaisha} (${pendingPayload.namaDaisha}) berhasil disimpan ${statusLabelDesc}. Anda dapat mencetak Tag Fisik Unit sekarang untuk digantungkan pada Daisha.`,
          `Seksi: ${pendingPayload.seksi} | Status: ${pendingPayload.status} | Komponen: ${pendingPayload.kategori}`,
          'Tutup',
          'Cetak Tag Fisik Unit',
          () => {
            setFeedback((prev) => ({ ...prev, isOpen: false }));
            setIsPrintTagOpen(true);
          }
        );

        setFormData({
          waktuMasuk: getInitialDateTime(),
          namaPelapor: '',
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
        setIsReviewModalOpen(false);
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

  return {
    isAdmin,
    isOperator,
    formData,
    setFormData,
    handleChange,
    seksiList,
    pilihanDaishaTersedia,
    showAllDaisha,
    detectedSize,
    duplicateActiveTicket,
    normalizedNoDaisha,
    matchedUnitInfo,
    applyMatchedUnit,
    setDismissedDuplicateUnit,
    isScanning,
    setIsScanning,
    isDiagnosaBengkel,
    setIsDiagnosaBengkel,
    catatanGejala,
    setCatatanGejala,
    katalogKerusakan,
    selectedKerusakan,
    tindakanMap,
    qtyMap,
    customKerusakanList,
    customTindakanMap,
    customQtyMap,
    toggleKerusakan,
    setItemTindakan,
    setItemQty,
    handleAddCustom,
    handleRemoveCustom,
    setCustomTindakan,
    setCustomItemQty,
    loading,
    handleSubmit,
    executeSubmit,
    isReviewModalOpen,
    setIsReviewModalOpen,
    pendingPayload,
    feedback,
    setFeedback,
    showFeedback,
    isPrintTagOpen,
    setIsPrintTagOpen,
    createdTicketForTag,
    setCreatedTicketForTag,
  };
}
