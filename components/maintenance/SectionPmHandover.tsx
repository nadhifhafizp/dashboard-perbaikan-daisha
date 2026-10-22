'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Check,
  RefreshCw,
  Truck,
  X,
  BellRing,
  Boxes,
  Zap,
  Target,
  Plus,
  Search,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { FleetUnit } from './FleetExplorer';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';

export const formatUkuran = (ukuran?: string | null): string => {
  if (!ukuran) return 'Standar';
  const clean = ukuran.trim().toUpperCase();
  if (clean === 'NONE' || clean === 'STD' || clean === 'STANDARD' || clean === 'STANDAR') {
    return 'Standar';
  }
  return ukuran.trim();
};

export interface PmStagingRecord {
  id: number;
  seksi: string;
  units: string[];
  lokasi: string;
  catatan: string | null;
  pelapor: string;
  status: 'WAITING_PICKUP' | 'PICKED_UP' | 'COMPLETED';
  createdAt: string;
  pickedUpAt: string | null;
  completedAt: string | null;
}

export interface ColorCodedVariantGroup {
  key: string;
  name: string;
  ukuran: string;
  prefix: string;
  totalUnits: number;
  dueUnits: FleetUnit[];
  stagedUnits: { unit: FleetUnit; lokasi: string }[];
  doneUnits: FleetUnit[];
  pctDone: number;
  pctStaged: number;
  pctDue: number;
  dailyTarget: number;
  stagedTodayCount: number;
  isTargetFulfilled: boolean;
  remainingTarget: number;
}

export interface StagedLocationGroup {
  lokasi: string;
  units: string[];
  records: PmStagingRecord[];
  status: 'WAITING_PICKUP' | 'PICKED_UP';
  waktuTerbaru: string;
  pelaporTerbaru: string;
  catatan?: string | null;
}

interface SectionPmHandoverProps {
  seksi: string;
  units: FleetUnit[];
  isSeksiUser: boolean;
  remainingWorkDays?: number;
  queuedUnitNo?: string | null;
  onClearQueuedUnit?: () => void;
  onRefreshData?: () => void;
}

export default function SectionPmHandover({
  seksi,
  units,
  isSeksiUser,
  remainingWorkDays = 50,
  queuedUnitNo,
  onClearQueuedUnit,
  onRefreshData,
}: SectionPmHandoverProps) {
  // Staging Data
  const [stagingRecords, setStagingRecords] = useState<PmStagingRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Form State
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [manualInputText, setManualInputText] = useState<string>('');
  const [inputAlert, setInputAlert] = useState<{ message: string; type: 'info' | 'error' } | null>(null);
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

  // Fetch riwayat penjemputan dari server
  const fetchStagingRecords = useCallback(async () => {
    try {
      setLoadingRecords(true);
      const res = await fetch(`/api/maintenance/staging?seksi=${encodeURIComponent(seksi)}`);
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
    const map = new Map<string, { lokasi: string; status: 'WAITING_PICKUP' | 'PICKED_UP'; waktu: string; catatan?: string | null; pelapor: string }>();
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
    return units.filter((u) => (u.seksi || '').toLowerCase() === seksi.toLowerCase());
  }, [units, seksi]);

  // 3. Counts
  const dueUnits = useMemo(() => {
    return seksiUnits.filter((u) => !u.is_maintained && !unitStagingMap.has(u.nomor_daisha.toUpperCase()));
  }, [seksiUnits, unitStagingMap]);

  const doneUnits = useMemo(() => {
    return seksiUnits.filter((u) => u.is_maintained);
  }, [seksiUnits]);

  // 4. Color-Coded Variant Groups
  const variantGroups = useMemo<ColorCodedVariantGroup[]>(() => {
    const map = new Map<string, ColorCodedVariantGroup>();

    seksiUnits.forEach((u) => {
      const displayName = u.nama_daisha || (u.jenis === 'VERTICAL' ? 'Vertical' : u.jenis === 'GT_RING' ? 'GT Ring' : u.jenis?.replace(/_/g, ' ')) || 'Daisha';
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

    const workDays = remainingWorkDays && remainingWorkDays > 0 ? remainingWorkDays : 50;

    return Array.from(map.values()).map((g) => {
      const total = g.totalUnits || 1;
      const totalUnmaintained = g.dueUnits.length + g.stagedUnits.length;
      const dailyTarget = totalUnmaintained > 0 ? Math.max(1, Math.ceil(totalUnmaintained / workDays)) : 0;
      const stagedTodayCount = g.stagedUnits.length;
      const isTargetFulfilled = stagedTodayCount >= dailyTarget && dailyTarget > 0;
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
    }).sort((a, b) => b.dueUnits.length - a.dueUnits.length);
  }, [units, unitStagingMap, remainingWorkDays]);

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
      .filter((u) => u.nomor_daisha.toUpperCase().includes(q) && !selectedUnits.includes(u.nomor_daisha.toUpperCase()))
      .slice(0, 8);
  }, [manualInputText, dueUnits, selectedUnits]);

  // Handler input nomor Daisha fleksibel (bisa ketik tunggal, koma, spasi, atau paste banyak unit sekaligus)
  const handleAddManualUnits = useCallback((rawText?: string) => {
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
      
      let msg = `${newUnits.length} Daisha (${newUnits.slice(0, 4).join(', ')}${newUnits.length > 4 ? '…' : ''}) berhasil ditambahkan ke daftar siap dijemput.`;
      if (alreadyMaintained.length > 0) {
        msg += ` Catatan: ${alreadyMaintained.join(', ')} sudah pernah PM tahun ini.`;
      }
      if (notFoundInSeksi.length > 0) {
        msg += ` Catatan: ${notFoundInSeksi.join(', ')} tidak terdaftar di katalog Seksi ${seksi}.`;
      }
      setInputAlert({ message: msg, type: 'info' });
    } else {
      setInputAlert({ message: 'Semua nomor Daisha yang dimasukkan sudah ada di dalam daftar pilihan.', type: 'info' });
    }
  }, [manualInputText, seksiUnits, selectedUnits, seksi]);

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

  // Quick select varian (count opsional: jika diisi memilih kuota harian, jika kosong memilih semua yang belum PM)
  const handleSelectVariant = (group: ColorCodedVariantGroup, count?: number) => {
    const targetUnits = count !== undefined ? group.dueUnits.slice(0, count) : group.dueUnits;
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

  // Quick locations
  const quickLocations = [
    `Staging Area Line 1 ${seksi}`,
    `Staging Area Line 2 ${seksi}`,
    `Area Finishing Bay ${seksi}`,
    `Pintu Masuk Seksi ${seksi}`,
    `Parkir Daisha Depan Pos QC ${seksi}`,
  ];

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
          message: `${selectedUnits.length} Daisha (${selectedUnits.join(', ')}) telah dicatat siap dijemput di: "${lokasiPenjemputan.trim()}". Notifikasi telah diteruskan ke bengkel.`,
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
          message: data.error || 'Terjadi kesalahan saat menyimpan data penjemputan.',
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

  return (
    <div className="space-y-5 font-sans">
      {/* 1. Header Banner Ringkas */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Pusat Kesiapan PM Daisha: Seksi {seksi}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Siapkan unit armada di area penjemputan produksi secara fleksibel, catat nomor daisha yang siap dijemput, lalu kirimkan pemberitahuan ke bengkel Workshop.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
            <span className="p-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              Populasi: <span className="font-bold text-slate-900">{units.length} Unit</span>
            </span>
            <span className="p-1.5 px-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
              Belum PM: <span className="font-bold text-rose-900">{dueUnits.length} Unit</span>
            </span>
            <span className="p-1.5 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
              Di Staging: <span className="font-bold text-amber-900">{totalSectionStagedToday} Unit</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. FORMULIR PENYIAPAN & PENGINGAT WORKSHOP (BATCH DISPATCH FLEKSIBEL - POSISI DI ATAS) */}
      <div
        id="section-batch-form"
        className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Formulir Penyiapan & Penjemputan PM ke Bengkel (Fleksibel)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unit yang disiapkan bisa acak/random. Anda bisa menarik unit ke staging dulu, lalu ketik/paste nomornya di bawah ini.
            </p>
          </div>

          {selectedUnits.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedUnits([]);
                setInputAlert(null);
              }}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer"
            >
              Kosongkan Pilihan ({selectedUnits.length})
            </button>
          )}
        </div>

        {/* Input Bebas Nomor Daisha (Ketik / Scan / Paste) */}
        <div className="space-y-2">
          <label htmlFor="pm-manual-input" className="block text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Input Nomor Daisha yang Disiapkan</span>
            </span>
            <span className="text-[11px] font-normal text-slate-500">
              Bisa ketik banyak sekaligus (pisahkan koma atau spasi)
            </span>
          </label>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                id="pm-manual-input"
                type="text"
                value={manualInputText}
                onChange={(e) => setManualInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddManualUnits();
                  }
                }}
                placeholder="Ketik atau paste nomor Daisha (contoh: M021, M055, M104) lalu tekan Enter…"
                className="w-full h-10 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 font-medium text-slate-900 bg-slate-50/50 hover:bg-white"
              />
              {manualInputText && (
                <button
                  type="button"
                  onClick={() => setManualInputText('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleAddManualUnits()}
              disabled={!manualInputText.trim()}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah ke Daftar</span>
            </button>
          </div>

          {/* Autocomplete Suggestions Pills saat mengetik */}
          {filteredSuggestions.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="text-[11px] text-slate-500 font-medium">Saran unit belum PM:</span>
              {filteredSuggestions.map((u) => (
                <button
                  key={u.nomor_daisha}
                  type="button"
                  onClick={() => handleAddManualUnits(u.nomor_daisha)}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>{u.nomor_daisha}</span>
                </button>
              ))}
            </div>
          )}

          {/* Feedback Info Box */}
          {inputAlert && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{inputAlert.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setInputAlert(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Selected Units Chip Bar */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Daisha yang Siap Dijemput</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                {selectedUnits.length} Unit
              </span>
            </span>

            {selectedUnits.length > 0 && (
              <span className="text-[11px] text-slate-500">
                Klik ikon silang pada unit jika ingin membatalkan
              </span>
            )}
          </div>

          {selectedUnits.length === 0 ? (
            <div className="py-2 text-center text-slate-500 text-xs italic">
              Belum ada Daisha di dalam daftar. Anda bisa mengetik/paste nomor unit pada kolom di atas, atau klik tombol bantuan kuota pada tabel di bawah.
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pt-1">
              {selectedUnits.map((no) => (
                <span
                  key={no}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs shadow-2xs"
                >
                  <span>{no}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleUnit(no)}
                    className="hover:bg-emerald-700 rounded p-0.5 cursor-pointer"
                    title={`Hapus ${no}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Form Titik Lokasi & Catatan */}
        <form onSubmit={handleSubmitStaging} className="space-y-3.5 pt-1">
          <div>
            <label htmlFor="pm-lokasi-penjemputan" className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
              <span>Titik Lokasi Penjemputan di Seksi {seksi} *</span>
            </label>

            {/* Quick Location Pills */}
            <div className="flex flex-wrap gap-1 mb-1.5">
              {quickLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLokasiPenjemputan(loc)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    lokasiPenjemputan === loc
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            <input
              id="pm-lokasi-penjemputan"
              name="lokasiPenjemputan"
              type="text"
              autoComplete="off"
              value={lokasiPenjemputan}
              onChange={(e) => setLokasiPenjemputan(e.target.value)}
              placeholder="Contoh: Staging Area Line 2 Building depan Bay 4…"
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 font-medium text-slate-900"
              required
            />
          </div>

          <div>
            <label htmlFor="pm-catatan-kesiapan" className="block text-xs font-bold text-slate-800 mb-1">
              Catatan Kesiapan <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              id="pm-catatan-kesiapan"
              name="catatanKesiapan"
              type="text"
              autoComplete="off"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Unit sudah bersih dari muatan, rem roda terkunci, siap ditarik shift 1…"
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 text-slate-800"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {selectedUnits.length > 0
                ? `${selectedUnits.length} Daisha siap dikirimkan lokasinya ke tim Workshop maintenance.`
                : 'Pilih atau ketik nomor Daisha di atas untuk mengaktifkan tombol kirim.'}
            </span>

            <button
              type="submit"
              disabled={submitting || selectedUnits.length === 0}
              className="w-full sm:w-auto h-10 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Mengirim Notifikasi…</span>
                </>
              ) : (
                <>
                  <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Kirim Pengingat Penjemputan ({selectedUnits.length} Unit)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. TABEL ALOKASI TARGET HARIAN PM PER VARIAN ARMADA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">
                  Target Penyiapan PM Harian per Varian: Seksi {seksi}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-mono">
                  <Target className="w-3 h-3 text-red-700" />
                  <span>Target: 1 Thn 1x PM (100%)</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                  Kuota Hari Ini: {totalSectionDailyTarget} Unit / Hari
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Komitmen pabrik: 1 tahun seluruh armada wajib ter-PM 100%. Target harian dihitung dari sisa armada belum PM dibagi {remainingWorkDays} hari kerja di tahun {new Date().getFullYear()}. Klik tombol &quot;Siapkan Kuota&quot; untuk langsung memilih unit target hari ini.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
            <span className="p-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              Populasi: <span className="font-bold text-slate-900">{units.length} Unit</span>
            </span>
            <span className="p-1.5 px-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
              Belum PM: <span className="font-bold text-rose-900">{dueUnits.length} Unit</span>
            </span>
            <span className="p-1.5 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
              Di Staging: <span className="font-bold text-amber-900">{totalSectionStagedToday} Unit</span>
            </span>
          </div>
        </div>

        {/* Tabel Rincian Target per Varian */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5">Jenis / Varian Daisha</th>
                <th className="py-2.5 px-3 text-center">Populasi Seksi</th>
                <th className="py-2.5 px-3 text-center">Belum PM</th>
                <th className="py-2.5 px-3.5 text-center bg-amber-50/70 border-x border-amber-200/60 text-amber-900">
                  Target Harian
                </th>
                <th className="py-2.5 px-3 text-center">Di Staging (Siap)</th>
                <th className="py-2.5 px-3.5 text-center">Status Kuota Hari Ini</th>
                <th className="py-2.5 px-3.5 text-center">Aksi Cepat Penyiapan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {variantGroups.map((g) => {
                const isSelectedInBatch =
                  g.dailyTarget > 0 &&
                  g.dueUnits.length > 0 &&
                  g.dueUnits.slice(0, g.dailyTarget).every((u) => selectedUnits.includes(u.nomor_daisha.toUpperCase()));

                return (
                  <tr key={g.key} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. Nama Varian */}
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <div>
                          <p className="text-slate-900 font-bold">{g.name}</p>
                          <p className="text-[11px] text-slate-500 font-normal">
                            {g.ukuran !== 'Standar' ? `Ukuran: ${g.ukuran}` : 'Standar'}
                            {g.prefix && ` • Prefix: ${g.prefix}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Total Populasi */}
                    <td className="py-3 px-3 text-center text-slate-700 font-semibold tabular-nums font-mono">
                      {g.totalUnits} unit
                    </td>

                    {/* 3. Belum PM */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{g.dueUnits.length} unit</span>
                      </span>
                    </td>

                    {/* 4. Target Harian */}
                    <td className="py-3 px-3.5 text-center bg-amber-50/40 border-x border-amber-200/50">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                        <Target className="w-3 h-3 text-amber-700" />
                        <span>{g.dailyTarget} Unit / Hari</span>
                      </span>
                    </td>

                    {/* 5. Di Staging */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono ${
                        g.stagedUnits.length > 0
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : 'text-slate-400 bg-slate-50 border border-slate-200'
                      }`}>
                        {g.stagedUnits.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        <span>{g.stagedUnits.length} unit</span>
                      </span>
                    </td>

                    {/* 6. Status Kuota Hari Ini */}
                    <td className="py-3 px-3.5 text-center">
                      {g.dueUnits.length === 0 && g.stagedUnits.length === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>100% Selesai PM</span>
                        </span>
                      ) : g.isTargetFulfilled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Kuota Terpenuhi ({g.stagedTodayCount}/{g.dailyTarget})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <Clock className="w-3 h-3 text-rose-500" />
                          <span>Kurang {g.remainingTarget} Unit</span>
                        </span>
                      )}
                    </td>

                    {/* 7. Tombol Aksi Cepat */}
                    <td className="py-3 px-3.5 text-center">
                      {g.dueUnits.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">Tidak ada antrean</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectVariant(g, g.dailyTarget)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer border ${
                            isSelectedInBatch
                              ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                          }`}
                          title={`Pilih ${g.dailyTarget} unit belum PM untuk disiapkan`}
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>
                            {isSelectedInBatch
                              ? `Batal (${g.dailyTarget})`
                              : `Siapkan Kuota (${g.dailyTarget} Unit)`}
                          </span>
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

      {/* 3. Peta Titik Penjemputan Staging yang Sedang Aktif */}
      {stagedByLocation.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Titik Penjemputan Aktif ({stagedByLocation.length} Lokasi Staging):</span>
            </span>
            <span className="text-[11px] font-semibold text-amber-800">
              {unitStagingMap.size} Unit Menunggu Diambil Workshop
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {stagedByLocation.map((st, i) => (
              <div
                key={i}
                className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1.5 text-xs"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{st.lokasi}</span>
                  </p>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                    {st.units.length} Unit
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {st.units.map((u) => (
                    <span
                      key={u}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300"
                    >
                      {u}
                    </span>
                  ))}
                </div>
                {st.catatan && (
                  <p className="text-[10px] text-slate-500 italic truncate">
                    &quot;{st.catatan}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. KARTU VISUAL SIMPEL DENGAN KODE PEWARNAAN PER VARIAN */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Pemetaan Visual Armada per Varian (Opsional / Drill-down)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Warna chip: <span className="text-rose-600 font-bold">Merah</span> = Belum PM • <span className="text-amber-600 font-bold">Kuning</span> = Di Staging • <span className="text-emerald-600 font-bold">Hijau</span> = Selesai PM.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {selectedUnits.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-2xs">
                {selectedUnits.length} Daisha Dipilih
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowVisualGrid(!showVisualGrid)}
              className="h-8 px-3 rounded-lg text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Boxes className="w-3.5 h-3.5 text-slate-500" />
              <span>{showVisualGrid ? 'Sembunyikan Grid Kotak' : 'Tampilkan Grid Kotak Unit'}</span>
            </button>
          </div>
        </div>

        {/* Grid Kartu Varian Bersih (Bisa Ditutup agar Mata Tidak Lelah) */}
        {showVisualGrid ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {variantGroups.map((g) => {
            const allDueSelected =
              g.dueUnits.length > 0 &&
              g.dueUnits.every((u) => selectedUnits.includes(u.nomor_daisha.toUpperCase()));
            const isExpanded = Boolean(expandedCards[g.key]);
            const visibleDueUnits = isExpanded ? g.dueUnits : g.dueUnits.slice(0, 12);
            const remainingCount = g.dueUnits.length - 12;

            return (
              <div
                key={g.key}
                className="p-4 rounded-xl border border-slate-200/60 bg-white hover:border-slate-300/80 transition shadow-2xs flex flex-col justify-between gap-3"
              >
                {/* Header Varian & Counter */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {g.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {g.ukuran !== 'Standar' ? `Ukuran: ${g.ukuran}` : 'Standar'}
                        {g.prefix && ` • Prefix: ${g.prefix}`}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {g.totalUnits} Unit
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-mono">
                        <Target className="w-2.5 h-2.5 text-amber-600" />
                        <span>{g.dailyTarget} / Hari</span>
                      </span>
                    </div>
                  </div>

                  {/* Stacked 3-Color Indicator Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 transition-[width] duration-300"
                        style={{ width: `${g.pctDone}%` }}
                        title={`Sudah PM: ${g.doneUnits.length} unit (${g.pctDone}%)`}
                      />
                      <div
                        className="bg-amber-400 transition-[width] duration-300"
                        style={{ width: `${g.pctStaged}%` }}
                        title={`Di Staging: ${g.stagedUnits.length} unit (${g.pctStaged}%)`}
                      />
                      <div
                        className="bg-rose-500 transition-[width] duration-300"
                        style={{ width: `${g.pctDue}%` }}
                        title={`Belum PM: ${g.dueUnits.length} unit (${g.pctDue}%)`}
                      />
                    </div>

                    {/* Ringkasan Angka 3 Warna */}
                    <div className="flex items-center justify-between text-[10px] pt-0.5">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                        <span>{g.doneUnits.length} Selesai</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{g.stagedUnits.length} Staging</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{g.dueUnits.length} Belum PM</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid Nomor Unit Berwarna (Tampilan Bersih & Tenang) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Daftar Armada:</span>
                    <div className="flex items-center gap-2">
                      {g.dueUnits.length > 0 && g.dailyTarget > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSelectVariant(g, g.dailyTarget)}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer transition hover:underline"
                          title="Pilih sejumlah target harian otomatis"
                        >
                          <Zap className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                          <span>Kuota ({g.dailyTarget})</span>
                        </button>
                      )}
                      {g.dueUnits.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSelectVariant(g)}
                          className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer transition hover:underline"
                        >
                          {allDueSelected ? 'Batal' : `Semua (${g.dueUnits.length})`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chip Box Lembut Tanpa Border Berlebih */}
                  <div className="p-2 bg-slate-50/60 rounded-xl flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                    {/* 1. Unit Sedang di Staging (Kuning) */}
                    {g.stagedUnits.map(({ unit, lokasi }) => (
                      <span
                        key={unit.nomor_daisha}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-amber-50 text-amber-900"
                        title={`Di Staging: ${lokasi}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{unit.nomor_daisha}</span>
                      </span>
                    ))}

                    {/* 2. Unit Belum PM (Merah - Clickable dengan Dot Lembut) */}
                    {visibleDueUnits.map((u) => {
                      const isSelected = selectedUnits.includes(u.nomor_daisha.toUpperCase());
                      return (
                        <button
                          key={u.nomor_daisha}
                          type="button"
                          onClick={() => handleToggleUnit(u.nomor_daisha)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium'
                          }`}
                          title={isSelected ? 'Klik untuk batal pilih' : 'Belum PM (Klik untuk siapkan)'}
                        >
                          {isSelected ? (
                            <Check className="w-2.5 h-2.5" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          )}
                          <span>{u.nomor_daisha}</span>
                        </button>
                      );
                    })}

                    {/* 3. Unit Sudah Selesai PM (Hijau, jika kartu di-expand atau unit belum PM sudah habis) */}
                    {(isExpanded || g.dueUnits.length === 0) &&
                      g.doneUnits.map((u) => (
                        <span
                          key={u.nomor_daisha}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800"
                          title="Sudah Selesai PM 2026"
                        >
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{u.nomor_daisha}</span>
                        </span>
                      ))}
                  </div>

                  {/* Tombol Expand / Collapse jika daftar panjang */}
                  {remainingCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCards((prev) => ({
                          ...prev,
                          [g.key]: !prev[g.key],
                        }))
                      }
                      className="w-full text-center py-1 text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-md transition cursor-pointer"
                    >
                      {isExpanded ? 'Tampilkan Lebih Sedikit' : `+ Tampilkan ${remainingCount} armada lainnya`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-slate-400" />
              <span>Grid kotak nomor disembunyikan agar tampilan ringkas. Anda dapat langsung memilih kuota pada tabel di atas.</span>
            </span>
            <button
              type="button"
              onClick={() => setShowVisualGrid(true)}
              className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline"
            >
              Buka Grid Nomor Unit
            </button>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        buttonText="Tutup"
        onClose={() => setFeedback((p) => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
