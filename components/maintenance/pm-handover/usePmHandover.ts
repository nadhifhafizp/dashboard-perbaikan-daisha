'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FleetUnit } from '../FleetExplorer';
import { FeedbackType } from '@/components/FeedbackModal';
import {
  PmStagingRecord,
  StagedLocationGroup,
  ColorCodedVariantGroup,
  formatUkuran,
} from './types';

interface UsePmHandoverProps {
  seksi: string;
  units: FleetUnit[];
  remainingWorkDays?: number;
  queuedUnitNo?: string | null;
  onClearQueuedUnit?: () => void;
  onRefreshData?: () => void;
}

export function usePmHandover({
  seksi,
  units,
  remainingWorkDays = 50,
  queuedUnitNo,
  onClearQueuedUnit,
  onRefreshData,
}: UsePmHandoverProps) {
  // Staging Data
  const [stagingRecords, setStagingRecords] = useState<PmStagingRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Form State
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [manualInputText, setManualInputText] = useState<string>('');
  const [inputAlert, setInputAlert] = useState<{
    message: string;
    type: 'info' | 'error';
  } | null>(null);
  const [lokasiPenjemputan, setLokasiPenjemputan] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [showVisualGrid, setShowVisualGrid] = useState<boolean>(false);

  // Feedback Modal
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const closeFeedback = () => setFeedback((p) => ({ ...p, isOpen: false }));

  // Fetch riwayat penjemputan dari server
  const fetchStagingRecords = useCallback(async () => {
    try {
      setLoadingRecords(true);
      const res = await fetch(
        `/api/maintenance/staging?seksi=${encodeURIComponent(seksi)}`
      );
      const data = await res.json();
      if (data.success) {
        setStagingRecords(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch staging records:', err);
    } finally {
      setLoadingRecords(false);
    }
  }, [seksi]);

  useEffect(() => {
    if (seksi) {
      void fetchStagingRecords();
    }
  }, [seksi, fetchStagingRecords]);

  // Handle external queued unit
  useEffect(() => {
    if (queuedUnitNo) {
      const clean = queuedUnitNo.trim().toUpperCase();
      setSelectedUnits((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
      if (onClearQueuedUnit) onClearQueuedUnit();
      setTimeout(() => {
        const el = document.getElementById('section-batch-form');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [queuedUnitNo, onClearQueuedUnit]);

  // 1. Map Staging per Unit
  const unitStagingMap = useMemo(() => {
    const map = new Map<
      string,
      {
        lokasi: string;
        status: 'WAITING_PICKUP' | 'PICKED_UP';
        waktu: string;
        catatan?: string | null;
        pelapor: string;
      }
    >();
    stagingRecords
      .filter((r) => r.status === 'WAITING_PICKUP' || r.status === 'PICKED_UP')
      .forEach((r) => {
        r.units.forEach((u) => {
          map.set(u.toUpperCase(), {
            lokasi: r.lokasi,
            status: r.status as 'WAITING_PICKUP' | 'PICKED_UP',
            waktu: r.createdAt,
            catatan: r.catatan,
            pelapor: r.pelapor,
          });
        });
      });
    return map;
  }, [stagingRecords]);

  // 2. Rekap Titik Lokasi Staging Aktif
  const stagedByLocation = useMemo<StagedLocationGroup[]>(() => {
    const map = new Map<string, StagedLocationGroup>();
    stagingRecords
      .filter((r) => r.status === 'WAITING_PICKUP' || r.status === 'PICKED_UP')
      .forEach((r) => {
        const loc = r.lokasi.trim();
        if (!map.has(loc)) {
          map.set(loc, {
            lokasi: loc,
            units: [],
            records: [],
            status: r.status as 'WAITING_PICKUP' | 'PICKED_UP',
            waktuTerbaru: r.createdAt,
            pelaporTerbaru: r.pelapor,
            catatan: r.catatan,
          });
        }
        const entry = map.get(loc)!;
        entry.records.push(r);
        r.units.forEach((u) => {
          const upper = u.toUpperCase();
          if (!entry.units.includes(upper)) {
            entry.units.push(upper);
          }
        });
        if (new Date(r.createdAt) > new Date(entry.waktuTerbaru)) {
          entry.waktuTerbaru = r.createdAt;
          entry.pelaporTerbaru = r.pelapor;
          entry.catatan = r.catatan;
        }
      });
    return Array.from(map.values());
  }, [stagingRecords]);

  // Filter ketat agar HANYA armada seksi terpilih yang diproses
  const seksiUnits = useMemo(() => {
    if (!seksi || seksi === 'ALL') return units;
    return units.filter(
      (u) => (u.seksi || '').toLowerCase() === seksi.toLowerCase()
    );
  }, [units, seksi]);

  // 3. Counts
  const dueUnits = useMemo(() => {
    return seksiUnits.filter(
      (u) =>
        !u.is_maintained && !unitStagingMap.has(u.nomor_daisha.toUpperCase())
    );
  }, [seksiUnits, unitStagingMap]);

  const doneUnits = useMemo(() => {
    return seksiUnits.filter((u) => u.is_maintained);
  }, [seksiUnits]);

  // 4. Color-Coded Variant Groups
  const variantGroups = useMemo<ColorCodedVariantGroup[]>(() => {
    const map = new Map<string, ColorCodedVariantGroup>();

    seksiUnits.forEach((u) => {
      const displayName =
        u.nama_daisha ||
        (u.jenis === 'VERTICAL'
          ? 'Vertical'
          : u.jenis === 'GT_RING'
          ? 'GT Ring'
          : u.jenis?.replace(/_/g, ' ')) ||
        'Daisha';
      const displayUkuran = formatUkuran(u.ukuran);
      const key = `${displayName}__${displayUkuran}`;
      if (!map.has(key)) {
        const prefixMatch = u.nomor_daisha.match(/^([A-Za-z]+)/);
        const prefix = prefixMatch ? prefixMatch[1] : '';
        map.set(key, {
          key,
          name: displayName,
          ukuran: displayUkuran,
          prefix,
          totalUnits: 0,
          dueUnits: [],
          stagedUnits: [],
          doneUnits: [],
          pctDone: 0,
          pctStaged: 0,
          pctDue: 0,
          dailyTarget: 0,
          stagedTodayCount: 0,
          isTargetFulfilled: false,
          remainingTarget: 0,
        });
      }

      const group = map.get(key)!;
      group.totalUnits += 1;

      const upper = u.nomor_daisha.toUpperCase();
      const stagingInfo = unitStagingMap.get(upper);

      if (u.is_maintained) {
        group.doneUnits.push(u);
      } else if (stagingInfo) {
        group.stagedUnits.push({ unit: u, lokasi: stagingInfo.lokasi });
      } else {
        group.dueUnits.push(u);
      }
    });

    const workDays =
      remainingWorkDays && remainingWorkDays > 0 ? remainingWorkDays : 50;

    return Array.from(map.values())
      .map((g) => {
        const total = g.totalUnits || 1;
        const totalUnmaintained = g.dueUnits.length + g.stagedUnits.length;
        const dailyTarget =
          totalUnmaintained > 0
            ? Math.max(1, Math.ceil(totalUnmaintained / workDays))
            : 0;
        const stagedTodayCount = g.stagedUnits.length;
        const isTargetFulfilled =
          stagedTodayCount >= dailyTarget && dailyTarget > 0;
        const remainingTarget = Math.max(0, dailyTarget - stagedTodayCount);

        return {
          ...g,
          pctDone: Math.round((g.doneUnits.length / total) * 100),
          pctStaged: Math.round((g.stagedUnits.length / total) * 100),
          pctDue: Math.round((g.dueUnits.length / total) * 100),
          dailyTarget,
          stagedTodayCount,
          isTargetFulfilled,
          remainingTarget,
        };
      })
      .sort((a, b) => b.dueUnits.length - a.dueUnits.length);
  }, [seksiUnits, unitStagingMap, remainingWorkDays]);

  // Total target harian akumulasi seksi
  const { totalSectionDailyTarget, totalSectionStagedToday } = useMemo(() => {
    return variantGroups.reduce(
      (acc, g) => ({
        totalSectionDailyTarget: acc.totalSectionDailyTarget + g.dailyTarget,
        totalSectionStagedToday: acc.totalSectionStagedToday + g.stagedTodayCount,
      }),
      { totalSectionDailyTarget: 0, totalSectionStagedToday: 0 }
    );
  }, [variantGroups]);

  // Live suggestions saat mengetik nomor daisha
  const filteredSuggestions = useMemo(() => {
    const q = manualInputText.trim().toUpperCase();
    if (!q || q.length < 1) return [];
    return dueUnits
      .filter(
        (u) =>
          u.nomor_daisha.toUpperCase().includes(q) &&
          !selectedUnits.includes(u.nomor_daisha.toUpperCase())
      )
      .slice(0, 8);
  }, [manualInputText, dueUnits, selectedUnits]);

  // Handler input nomor Daisha fleksibel
  const handleAddManualUnits = useCallback(
    (rawText?: string) => {
      const textToProcess = rawText !== undefined ? rawText : manualInputText;
      if (!textToProcess.trim()) return;

      const parsedTokens = textToProcess
        .split(/[,;\s\n\r]+/)
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);

      if (parsedTokens.length === 0) return;

      const availableUnitMap = new Map<string, FleetUnit>();
      seksiUnits.forEach((u) => {
        availableUnitMap.set(u.nomor_daisha.toUpperCase(), u);
      });

      const newUnits: string[] = [];
      const alreadyMaintained: string[] = [];
      const notFoundInSeksi: string[] = [];

      parsedTokens.forEach((token) => {
        const unitObj = availableUnitMap.get(token);
        if (unitObj) {
          if (unitObj.is_maintained) {
            alreadyMaintained.push(token);
          }
        } else {
          notFoundInSeksi.push(token);
        }
        if (!selectedUnits.includes(token)) {
          newUnits.push(token);
        }
      });

      if (newUnits.length > 0) {
        setSelectedUnits((prev) => Array.from(new Set([...prev, ...newUnits])));
        setManualInputText('');

        let msg = `${newUnits.length} Daisha (${newUnits
          .slice(0, 4)
          .join(', ')}${
          newUnits.length > 4 ? '…' : ''
        }) berhasil ditambahkan ke daftar siap dijemput.`;
        if (alreadyMaintained.length > 0) {
          msg += ` Catatan: ${alreadyMaintained.join(', ')} sudah pernah PM tahun ini.`;
        }
        if (notFoundInSeksi.length > 0) {
          msg += ` Catatan: ${notFoundInSeksi.join(
            ', '
          )} tidak terdaftar di katalog Seksi ${seksi}.`;
        }
        setInputAlert({ message: msg, type: 'info' });
      } else {
        setInputAlert({
          message:
            'Semua nomor Daisha yang dimasukkan sudah ada di dalam daftar pilihan.',
          type: 'info',
        });
      }
    },
    [manualInputText, seksiUnits, selectedUnits, seksi]
  );

  // Toggle selection
  const handleToggleUnit = (noDaisha: string) => {
    const upper = noDaisha.toUpperCase();
    setSelectedUnits((prev) => {
      if (prev.includes(upper)) {
        return prev.filter((u) => u !== upper);
      }
      return [...prev, upper];
    });
  };

  // Quick select varian
  const handleSelectVariant = (
    group: ColorCodedVariantGroup,
    count?: number
  ) => {
    const targetUnits =
      count !== undefined ? group.dueUnits.slice(0, count) : group.dueUnits;
    if (targetUnits.length === 0) return;

    const targetNos = targetUnits.map((u) => u.nomor_daisha.toUpperCase());
    const allSelected = targetNos.every((no) => selectedUnits.includes(no));

    if (allSelected) {
      setSelectedUnits((prev) => prev.filter((no) => !targetNos.includes(no)));
    } else {
      setSelectedUnits((prev) => Array.from(new Set([...prev, ...targetNos])));
      setTimeout(() => {
        const el = document.getElementById('section-batch-form');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Submit batch
  const handleSubmitStaging = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUnits.length === 0) {
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Belum Ada Unit yang Dipilih',
        message: 'Pilih minimal satu Daisha merah di bawah untuk disiapkan.',
      });
      return;
    }

    if (!lokasiPenjemputan.trim()) {
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Lokasi Wajib Diisi',
        message: 'Cantumkan titik lokasi penjemputan unit di area produksi.',
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/maintenance/staging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          seksi,
          units: selectedUnits,
          lokasi: lokasiPenjemputan.trim(),
          catatan: catatan.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          isOpen: true,
          type: 'success',
          title: 'Pengingat Berhasil Dikirim ke Workshop!',
          message: `${selectedUnits.length} Daisha (${selectedUnits.join(
            ', '
          )}) telah dicatat siap dijemput di: "${lokasiPenjemputan.trim()}". Notifikasi telah diteruskan ke bengkel.`,
        });

        setSelectedUnits([]);
        setLokasiPenjemputan('');
        setCatatan('');
        void fetchStagingRecords();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedback({
          isOpen: true,
          type: 'error',
          title: 'Gagal Mengirim Pengingat',
          message:
            data.error || 'Terjadi kesalahan saat menyimpan data penjemputan.',
        });
      }
    } catch (err) {
      console.error('Error submitting staging:', err);
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gangguan Jaringan',
        message: 'Tidak dapat terhubung ke server. Periksa jaringan Anda.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    stagingRecords,
    loadingRecords,
    selectedUnits,
    setSelectedUnits,
    manualInputText,
    setManualInputText,
    inputAlert,
    setInputAlert,
    lokasiPenjemputan,
    setLokasiPenjemputan,
    catatan,
    setCatatan,
    submitting,
    expandedCards,
    setExpandedCards,
    showVisualGrid,
    setShowVisualGrid,
    feedback,
    closeFeedback,
    dueUnits,
    doneUnits,
    unitStagingMap,
    stagedByLocation,
    variantGroups,
    totalSectionDailyTarget,
    totalSectionStagedToday,
    filteredSuggestions,
    handleAddManualUnits,
    handleToggleUnit,
    handleSelectVariant,
    handleSubmitStaging,
    fetchStagingRecords,
  };
}
