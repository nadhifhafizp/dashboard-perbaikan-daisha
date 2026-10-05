'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { GridDaishaUnit } from './VerticalGridMapping';

interface MaintenanceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUnit?: GridDaishaUnit | null;
  onSuccess: () => void;
  currentUser?: { name?: string; username?: string; role?: string } | null;
}

export default function MaintenanceInputModal({
  isOpen,
  onClose,
  preselectedUnit,
  onSuccess,
  currentUser,
}: MaintenanceInputModalProps) {
  const [nomorDaisha, setNomorDaisha] = useState<string>('');
  const [jenis, setJenis] = useState<'VERTICAL' | 'NAGARA_FILTER'>('VERTICAL');
  const [ukuran, setUkuran] = useState<'SMALL' | 'MEDIUM' | 'LARGE' | 'NONE'>('SMALL');
  const [kategori, setKategori] = useState<'RUTIN' | 'REPAIR'>('RUTIN');
  const [tanggalPengerjaan, setTanggalPengerjaan] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [adminPic, setAdminPic] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');

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

  // Prefill when unit is passed
  useEffect(() => {
    if (!isOpen) return;

    const t = setTimeout(() => {
      if (preselectedUnit) {
        setNomorDaisha(preselectedUnit.nomor_daisha);
        setJenis(preselectedUnit.jenis === 'NAGARA_FILTER' ? 'NAGARA_FILTER' : 'VERTICAL');
        const uk = preselectedUnit.ukuran;
        if (uk === 'SMALL' || uk === 'MEDIUM' || uk === 'LARGE' || uk === 'NONE') {
          setUkuran(uk);
        } else {
          setUkuran(preselectedUnit.jenis === 'NAGARA_FILTER' ? 'NONE' : 'SMALL');
        }
      } else {
        setNomorDaisha('');
      }
      setAdminPic(currentUser?.name || currentUser?.username || 'Admin Workshop');
      setSubmitError(null);
      setSmartWarning(null);
    }, 0);

    return () => clearTimeout(t);
  }, [preselectedUnit, currentUser, isOpen]);

  // Adjust ukuran when jenis changes
  const handleJenisChange = (newJenis: 'VERTICAL' | 'NAGARA_FILTER') => {
    setJenis(newJenis);
    if (newJenis === 'NAGARA_FILTER') {
      setUkuran('NONE');
    } else if (ukuran === 'NONE') {
      setUkuran('SMALL');
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
          // Auto-fill jenis & ukuran from master if found
          if (data.daisha?.jenis) {
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

      const payload = {
        nomor_daisha: nomorDaisha.trim(),
        jenis,
        ukuran,
        kategori,
        tanggal_pengerjaan: tanggalPengerjaan,
        admin_id: adminPic.trim() || 'Admin Workshop',
        catatan: catatan.trim(),
        bypass_warning: bypass,
      };

      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Jika server mengembalikan status 409 (Smart Warning Confirmation Required)
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

        throw new Error(data.error || 'Gagal menyimpan input pengerjaan');
      }

      // Berhasil
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Catat Pemeliharaan / Perbaikan Daisha
              </h3>
              <p className="text-[11px] text-slate-300">
                Form input teknisi & admin workshop
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-5 space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* SMART VALIDATION WARNING BANNER */}
          {smartWarning?.show && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl shadow-xs space-y-2">
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
                  className="px-3 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Tetap Lanjutkan (Bypass)</span>
                </button>
              </div>
            </div>
          )}

          {/* 1. Nomor Daisha Input with Checking Indicator */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Nomor Daisha <span className="text-red-500">*</span>
              </label>
              {isChecking && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                  Mengecek riwayat...
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={nomorDaisha}
              onChange={(e) => setNomorDaisha(e.target.value)}
              placeholder="Contoh: S-045, M-110, L-012, NF-05"
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Format Vertical: S-xxx (Small), M-xxx (Medium), L-xxx (Large) | Nagara Filter: NF-xx
            </span>
          </div>

          {/* 2. Jenis Daisha & Ukuran (Conditional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800">
                Jenis Daisha <span className="text-red-500">*</span>
              </label>
              <select
                value={jenis}
                onChange={(e) => handleJenisChange(e.target.value as 'VERTICAL' | 'NAGARA_FILTER')}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
              >
                <option value="VERTICAL">Daisha Vertical</option>
                <option value="NAGARA_FILTER">Daisha Nagara Filter</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800">
                Ukuran {jenis === 'VERTICAL' ? <span className="text-red-500">*</span> : '(Non-aktif)'}
              </label>
              <select
                disabled={jenis === 'NAGARA_FILTER'}
                value={ukuran}
                onChange={(e) => setUkuran(e.target.value as 'SMALL' | 'MEDIUM' | 'LARGE' | 'NONE')}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 disabled:opacity-50 disabled:bg-slate-100"
              >
                {jenis === 'NAGARA_FILTER' ? (
                  <option value="NONE">Hanya 1 Varian (None)</option>
                ) : (
                  <>
                    <option value="SMALL">Small (1 - 200)</option>
                    <option value="MEDIUM">Medium (1 - 200)</option>
                    <option value="LARGE">Large (1 - 200)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 3. Kategori Pengerjaan (Radio Card Buttons) */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Kategori Pengerjaan <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                  kategori === 'RUTIN'
                    ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="kategori"
                  value="RUTIN"
                  checked={kategori === 'RUTIN'}
                  onChange={() => setKategori('RUTIN')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  kategori === 'RUTIN' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                }`}>
                  {kategori === 'RUTIN' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="text-xs block">Maintenance Rutin</span>
                  <span className="text-[10px] font-normal text-slate-500">Pemeliharaan berkala tahunan</span>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                  kategori === 'REPAIR'
                    ? 'bg-sky-50/70 border-sky-500 text-sky-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="kategori"
                  value="REPAIR"
                  checked={kategori === 'REPAIR'}
                  onChange={() => setKategori('REPAIR')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  kategori === 'REPAIR' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                }`}>
                  {kategori === 'REPAIR' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="text-xs block">Repair Rusak</span>
                  <span className="text-[10px] font-normal text-slate-500">Selesai diperbaiki di bengkel</span>
                </div>
              </label>
            </div>
          </div>

          {/* 4. Tanggal & Admin PIC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800">
                Tanggal Pengerjaan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalPengerjaan}
                onChange={(e) => setTanggalPengerjaan(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800">
                Teknisi / Admin PIC
              </label>
              <input
                type="text"
                value={adminPic}
                onChange={(e) => setAdminPic(e.target.value)}
                placeholder="Nama teknisi / admin"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          {/* 5. Catatan Tambahan */}
          <div>
            <label className="text-xs font-bold text-slate-800">
              Catatan / Tindakan
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Penggantian roda caster, pelumasan bearing, pengetokan stopper..."
              className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan & Perbarui Status</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
