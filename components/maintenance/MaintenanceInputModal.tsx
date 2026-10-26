'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Loader2,
  AlertCircle,
  Check,
  RotateCcw,
  Sparkles,
  ClipboardCheck,
  Settings,
  HelpCircle,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { FleetUnit } from './FleetExplorer';
import { DAFTAR_SEKSI, getSectionDaishaList } from '@/lib/masterData';

export type PartCondition = 'OK' | 'SERVIS' | 'GANTI';

export interface PartCheckItem {
  id: string;
  name: string;
  alias: string;
  standardCheck: string;
  condition: PartCondition;
  action: string;
  actionOptions: string[];
  note: string;
}

const DEFAULT_PARTS: Omit<PartCheckItem, 'condition' | 'action' | 'note'>[] = [
  {
    id: 'roda_putar',
    name: 'Roda Putar / Caster Swivel (Depan)',
    alias: 'Kemampuan belok 360°, tapak roda PU/Karet, as roda',
    standardCheck: 'Putaran lancar tanpa macet, tapak tidak sobek/pecah, bracket kuat',
    actionOptions: ['Pelumasan Gemuk / Greasing', 'Kencangkan Baut As', 'Ganti Roda Caster Baru'],
  },
  {
    id: 'roda_mati',
    name: 'Roda Mati / Fixed Wheel (Belakang)',
    alias: 'Kelurusan arah roda, bracket dudukan, tapak ban',
    standardCheck: 'Tapak tidak terkelupas, bracket tidak bengkok, baut kencang',
    actionOptions: ['Kencangkan Bracket', 'Luruskan As Roda', 'Ganti Roda Mati Baru'],
  },
  {
    id: 'bearing_poros',
    name: 'Bearing & Poros As Roda',
    alias: 'Bantalan pelor, poros as, kelancaran putaran',
    standardCheck: 'Putaran mulus tanpa bunyi kasar/kering, tidak oblak goyang',
    actionOptions: ['Greasing / Pelumasan Gemuk', 'Setel Kerapatan As', 'Ganti Bearing Baru'],
  },
  {
    id: 'stopper_rem',
    name: 'Stopper / Rem Kaki (Foot Brake)',
    alias: 'Pedal rem, per spring, tapak karet penahan lantai',
    standardCheck: 'Rem mengunci kuat ke lantai saat ditekan, per kembali normal',
    actionOptions: ['Setel Ketinggian Pedal Rem', 'Ganti Per / Spring', 'Ganti Karet Stopper Baru'],
  },
  {
    id: 'body_frame',
    name: 'Rangka Sasis & Pengelasan (Frame)',
    alias: 'Besi sasis utama, sambungan las, kelurusan frame',
    standardCheck: 'Tidak ada las retak/patah, frame tidak melengkung, cat utuh',
    actionOptions: ['Las Ulang Titik Retak', 'Luruskan Sasis / Press', 'Cat Ulang Anti Karat'],
  },
  {
    id: 'towing_hook',
    name: 'Towing Hook / Gandengan (Depan & Belakang)',
    alias: 'Pin penarik, mata kaitan (eyelet), engsel towing',
    standardCheck: 'Pin kaitan pas, pengunci kaitan tidak aus/patah, engsel aman',
    actionOptions: ['Las Penguat Kaitan', 'Luruskan Pin Gandengan', 'Ganti Towing Bar Baru'],
  },
  {
    id: 'partisi_rak',
    name: 'Partisi / Rak Susun / Stopper Produk',
    alias: 'Sekat ambalan, pipa penyangga, karet pelindung',
    standardCheck: 'Partisi kokoh tidak goyang, ambalan tidak kendor, karet utuh',
    actionOptions: ['Kencangkan Baut Rak', 'Las Ulang Sambungan Pipa', 'Ganti Karet Proteksi'],
  },
  {
    id: 'handlebar',
    name: 'Handlebar / Gagang Dorong',
    alias: 'Pipa pegangan tangan operator, baut dudukan',
    standardCheck: 'Pipa kokoh, tidak bengkok, ergonomis, baut kencang',
    actionOptions: ['Kencangkan Baut Handle', 'Luruskan Pipa Gagang', 'Las Dudukan Handle'],
  },
  {
    id: 'base_plate',
    name: 'Pelat Dasar & Bumper Karet (Bawah)',
    alias: 'Alas lantai daisha, karet sudut pelindung benturan',
    standardCheck: 'Pelat alas rata, tidak melengkung, karet bumper sudut lengkap',
    actionOptions: ['Ketok Rata Pelat Alas', 'Kencangkan Baut Lantai', 'Pasang Bumper Karet Baru'],
  },
];

interface MaintenanceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUnit?: FleetUnit | null;
  onSuccess: () => void;
  currentUser?: { name?: string; username?: string; role?: string; seksi?: string | null } | null;
  seksi?: string;
}

export default function MaintenanceInputModal({
  isOpen,
  onClose,
  preselectedUnit,
  onSuccess,
  currentUser,
  seksi,
}: MaintenanceInputModalProps) {
  // Form State
  const [nomorDaisha, setNomorDaisha] = useState<string>('');
  const [seksiAsal, setSeksiAsal] = useState<string>('Building');
  const [jenis, setJenis] = useState<string>('Vertical');
  const [ukuran, setUkuran] = useState<string>('SMALL');
  const [waktuMasuk, setWaktuMasuk] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [tanggalPengerjaan, setTanggalPengerjaan] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [adminPic, setAdminPic] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');

  const availableJenisList = useMemo(() => {
    return getSectionDaishaList(seksiAsal);
  }, [seksiAsal]);

  // 9-Part Checklist State
  const [parts, setParts] = useState<PartCheckItem[]>(() =>
    DEFAULT_PARTS.map((p) => ({
      ...p,
      condition: 'OK',
      action: 'Normal / Pelumasan Rutin',
      note: '',
    }))
  );

  const [filterPartView, setFilterPartView] = useState<'ALL' | 'ISSUES'>('ALL');

  // Smart Validation States
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [smartWarning, setSmartWarning] = useState<{
    show: boolean;
    message: string;
    lastDate?: string;
    daysAgo?: number;
    lastJobType?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form when opened
  useEffect(() => {
    if (!isOpen) return;

    const t = setTimeout(() => {
      const initialSeksi = preselectedUnit?.seksi || seksi || currentUser?.seksi || 'Building';
      setSeksiAsal(initialSeksi);

      if (preselectedUnit) {
        setNomorDaisha(preselectedUnit.nomor_daisha);
        setJenis(preselectedUnit.nama_daisha || preselectedUnit.jenis || 'Vertical');
        setUkuran(preselectedUnit.ukuran || 'NONE');
      } else {
        setNomorDaisha('');
        const types = getSectionDaishaList(initialSeksi);
        setJenis(types[0] || 'Vertical');
        setUkuran('NONE');
      }
      setAdminPic(currentUser?.name || currentUser?.username || 'Admin Workshop');
      setSubmitError(null);
      setSmartWarning(null);
      setFilterPartView('ALL');
      // Reset checklist to all OK
      setParts(
        DEFAULT_PARTS.map((p) => ({
          ...p,
          condition: 'OK',
          action: 'Normal / Pelumasan Rutin',
          note: '',
        }))
      );
    }, 0);

    return () => clearTimeout(t);
  }, [preselectedUnit, currentUser, isOpen, seksi]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Handle Seksi Change
  const handleSeksiChange = (newSeksi: string) => {
    setSeksiAsal(newSeksi);
    const list = getSectionDaishaList(newSeksi);
    if (!list.includes(jenis)) {
      setJenis(list[0] || 'Vertical');
    }
  };

  // Adjust ukuran when jenis changes
  const handleJenisChange = (newJenis: string) => {
    setJenis(newJenis);
    const lower = newJenis.toLowerCase();
    if (lower.includes('vertical')) {
      if (ukuran === 'NONE') setUkuran('SMALL');
    } else if (!lower.includes('ring')) {
      setUkuran('NONE');
    }
  };

  // Real-time check while typing nomor Daisha
  useEffect(() => {
    if (!isOpen || !nomorDaisha.trim()) {
      const resetTimer = setTimeout(() => {
        setSmartWarning(null);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const timer = setTimeout(async () => {
      try {
        setIsChecking(true);
        const res = await fetch(`/api/maintenance/check?nomor=${encodeURIComponent(nomorDaisha.trim())}`);
        const data = await res.json();

        if (data.exists) {
          if (data.daisha?.seksi) {
            setSeksiAsal(data.daisha.seksi);
          }
          if (data.daisha?.nama_daisha) {
            setJenis(data.daisha.nama_daisha);
          } else if (data.daisha?.jenis) {
            setJenis(data.daisha.jenis);
          }
          if (data.daisha?.ukuran) {
            setUkuran(data.daisha.ukuran);
          }

          if (data.isRecent) {
            setSmartWarning({
              show: true,
              message: data.warningMessage,
              lastDate: data.lastDate,
              daysAgo: data.daysAgo,
              lastJobType: data.lastJobType,
            });
          } else {
            setSmartWarning(null);
          }
        } else {
          setSmartWarning(null);
        }
      } catch (err) {
        console.error('Check error:', err);
      } finally {
        setIsChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [nomorDaisha, isOpen]);

  // Checklist Actions
  const handlePartConditionChange = (id: string, newCondition: PartCondition) => {
    setParts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let defaultAction = 'Normal / Pelumasan Rutin';
        if (newCondition === 'SERVIS') {
          defaultAction = item.actionOptions[0] || 'Servis / Setel';
        } else if (newCondition === 'GANTI') {
          defaultAction = item.actionOptions[item.actionOptions.length - 1] || 'Ganti Sparepart Baru';
        }
        return {
          ...item,
          condition: newCondition,
          action: defaultAction,
        };
      })
    );
  };

  const handlePartActionChange = (id: string, newAction: string) => {
    setParts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, action: newAction } : item))
    );
  };

  const handlePartNoteChange = (id: string, newNote: string) => {
    setParts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note: newNote } : item))
    );
  };

  const handleSetAllOk = () => {
    setParts((prev) =>
      prev.map((item) => ({
        ...item,
        condition: 'OK',
        action: 'Normal / Pelumasan Rutin',
        note: '',
      }))
    );
  };

  // Metrics
  const damagedParts = useMemo(() => {
    return parts.filter((p) => p.condition !== 'OK');
  }, [parts]);

  const okParts = useMemo(() => {
    return parts.filter((p) => p.condition === 'OK');
  }, [parts]);

  const isUnitDamaged = damagedParts.length > 0;

  // Filtered Parts for display
  const displayedParts = useMemo(() => {
    if (filterPartView === 'ISSUES') {
      return damagedParts;
    }
    return parts;
  }, [parts, filterPartView, damagedParts]);

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent, bypass = false) => {
    if (e) e.preventDefault();
    setSubmitError(null);

    if (!nomorDaisha.trim()) {
      setSubmitError('Nomor Daisha tidak boleh kosong.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Compile detailed report from the 9-part checklist
      let detailKerusakanStr: string | null = null;
      let tindakanStr: string = 'Inspeksi 9 Komponen & Pelumasan Rutin';

      if (isUnitDamaged) {
        detailKerusakanStr = damagedParts
          .map((p) => {
            const statusLabel = p.condition === 'GANTI' ? 'Rusak / Perlu Ganti' : 'Perlu Servis / Setel';
            const noteText = p.note.trim() ? ` - "${p.note.trim()}"` : '';
            return `[${p.name}]: ${statusLabel} → Tindakan: ${p.action}${noteText}`;
          })
          .join(' | ');

        tindakanStr = damagedParts.map((p) => p.action).join(', ');
      }

      const payload = {
        nomor_daisha: nomorDaisha.trim(),
        jenis,
        ukuran,
        seksi: seksiAsal,
        kategori: 'RUTIN', // Locked to Maintenance Berkala (PM)
        kondisi: isUnitDamaged ? 'RUSAK' : 'OK',
        detail_kerusakan: detailKerusakanStr,
        tindakan: tindakanStr,
        waktu_masuk: waktuMasuk,
        waktu_keluar: tanggalPengerjaan,
        tanggal_pengerjaan: tanggalPengerjaan,
        admin_id: adminPic.trim() || 'Admin Workshop',
        catatan: catatan.trim() || (isUnitDamaged ? `Terdapat ${damagedParts.length} temuan part pada PM rutin` : 'Seluruh 9 komponen standar dinyatakan normal'),
        bypass_warning: bypass,
      };

      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.warning) {
          setSmartWarning({
            show: true,
            message: data.message,
            lastDate: data.lastDate,
            daysAgo: data.daysAgo,
            lastJobType: data.lastJobType,
          });
          return;
        }

        throw new Error(data.error || 'Gagal menyimpan input pengerjaan maintenance.');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-input-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="pm-input-modal-title" className="text-sm font-bold text-white tracking-tight">
                  Input Preventive Maintenance (PM) Daisha
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PM Berkala
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Lembar ceklis inspeksi 9 komponen standar & pelumasan tahunan Daisha
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            aria-label="Tutup modal inspeksi PM"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* SMART VALIDATION WARNING BANNER */}
          {smartWarning?.show && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-950 block">
                    Peringatan Smart Validation:
                  </span>
                  <p className="leading-relaxed text-amber-900">
                    {smartWarning.message}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSmartWarning(null)}
                  className="px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 rounded-lg transition cursor-pointer"
                >
                  Batal / Ganti Nomor
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(undefined, true)}
                  disabled={isSubmitting}
                  className="px-3 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Tetap Lanjutkan (Bypass)</span>
                </button>
              </div>
            </div>
          )}

          {/* 1. Kategori Pengerjaan: Terkunci pada Maintenance Berkala (PM) */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  Kategori Pengerjaan: Preventive Maintenance (PM Rutin)
                </span>
                <span className="text-xs text-emerald-800">
                  Inspeksi fisik 9 komponen, pengujian fungsi rem/roda, dan pelumasan berkala
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
              Siklus PM
            </span>
          </div>

          {/* 2. Nomor Daisha Input with Checking Indicator */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Nomor Daisha <span className="text-red-500">*</span>
              </label>
              {isChecking && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                  Mengecek database...
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={nomorDaisha}
              onChange={(e) => setNomorDaisha(e.target.value)}
              placeholder="Contoh: S-045, M-110, L-012, NF-05, BD-01..."
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 tabular-nums uppercase"
            />
          </div>

          {/* 3. Seksi Asal, Jenis Daisha & Ukuran */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800">
                Seksi Asal Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={seksiAsal}
                onChange={(e) => handleSeksiChange(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer"
              >
                {DAFTAR_SEKSI.filter((s) => s.toLowerCase() !== 'all seksi').map((s) => (
                  <option key={s} value={s}>
                    Seksi {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800">
                Jenis Daisha <span className="text-red-500">*</span>
              </label>
              <select
                value={jenis}
                onChange={(e) => handleJenisChange(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer"
              >
                {availableJenisList.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800">
                Ukuran
              </label>
              <select
                value={ukuran}
                onChange={(e) => setUkuran(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer"
              >
                <option value="NONE">NONE (Standar / Tanpa Ukuran)</option>
                <option value="SMALL">SMALL (Small)</option>
                <option value="MEDIUM">MEDIUM (Medium)</option>
                <option value="LARGE">LARGE (Large)</option>
              </select>
            </div>
          </div>

          {/* 4. LEMBAR CEKLIS INSPEKSI 9 KOMPONEN DAISHA */}
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-slate-50/50 space-y-3 p-4">
            {/* Header Checklist & Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                    <span>Lembar Ceklis Pemeriksaan Komponen</span>
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    9 Komponen
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Periksa kondisi fisik dan fungsi masing-masing komponen Daisha saat servis PM
                </p>
              </div>

              {/* Tombol One-Click Setel Semua OK */}
              <button
                type="button"
                onClick={handleSetAllOk}
                className="h-7 px-3 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
                title="Tandai semua komponen dalam kondisi baik"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Setel Semua Normal (9 OK)</span>
              </button>
            </div>

            {/* Status Keseluruhan Unit Berdasarkan Ceklis */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
              isUnitDamaged
                ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
            }`}>
              <div className="flex items-center gap-2">
                {isUnitDamaged ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>
                  {isUnitDamaged
                    ? `Ada Temuan Kerusakan (${damagedParts.length} Part Perlu Tindakan Bengkel)`
                    : 'Kondisi Unit: Prima / Normal (9 dari 9 Part Lulus Pemeriksaan)'}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterPartView('ALL')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    filterPartView === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  Semua (9)
                </button>
                {damagedParts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterPartView('ISSUES')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      filterPartView === 'ISSUES'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white text-rose-700 border border-rose-200'
                    }`}
                  >
                    Bermasalah ({damagedParts.length})
                  </button>
                )}
              </div>
            </div>

            {/* Daftar Komponen Checklist */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {displayedParts.map((part, idx) => {
                const isOk = part.condition === 'OK';
                const isServis = part.condition === 'SERVIS';
                const isGanti = part.condition === 'GANTI';

                return (
                  <div
                    key={part.id}
                    className={`p-3 rounded-xl border transition space-y-2 ${
                      isGanti
                        ? 'bg-rose-50/70 border-rose-300'
                        : isServis
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-white border-slate-200/90'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {part.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 ml-7">
                          {part.standardCheck}
                        </p>
                      </div>

                      {/* 3 Toggle Status Buttons: OK vs SERVIS vs GANTI */}
                      <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handlePartConditionChange(part.id, 'OK')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                            isOk
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>OK</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePartConditionChange(part.id, 'SERVIS')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                            isServis
                              ? 'bg-amber-500 border-amber-500 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Perlu Servis</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePartConditionChange(part.id, 'GANTI')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                            isGanti
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Ganti Part</span>
                        </button>
                      </div>
                    </div>

                    {/* Sub-form Tindakan & Catatan (Muncul jika ada masalah) */}
                    {!isOk && (
                      <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Tindakan Teknisi:
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {part.actionOptions.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handlePartActionChange(part.id, opt)}
                                className={`text-xs px-2 py-0.5 rounded-md border font-medium transition cursor-pointer ${
                                  part.action === opt
                                    ? isGanti
                                      ? 'bg-rose-600 text-white border-rose-600 font-bold'
                                      : 'bg-amber-600 text-white border-amber-600 font-bold'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Keterangan Masalah / Part:
                          </label>
                          <input
                            type="text"
                            value={part.note}
                            onChange={(e) => handlePartNoteChange(part.id, e.target.value)}
                            placeholder="Misal: Roda aus tapak sobek, bearing kering..."
                            className="w-full h-7 px-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 outline-none focus:ring-1 focus:ring-slate-800"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Jadwal Masuk & Selesai Keluar Bengkel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800">
                Tanggal Masuk Servis <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={waktuMasuk}
                onChange={(e) => setWaktuMasuk(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800">
                Tanggal Selesai PM <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalPengerjaan}
                onChange={(e) => setTanggalPengerjaan(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* 6. Teknisi / Admin PIC & Catatan Tambahan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800">
                Teknisi / Admin PIC
              </label>
              <input
                type="text"
                value={adminPic}
                onChange={(e) => setAdminPic(e.target.value)}
                placeholder="Nama teknisi bengkel"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800">
                Catatan Umum Tambahan
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan tambahan hasil pemeliharaan..."
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2.5">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              {isUnitDamaged ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{damagedParts.length} komponen akan dicatat dalam histori perbaikan unit</span>
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unit siap beroperasi kembali dengan status PM Normal</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Simpan Hasil PM & Perbarui Unit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
