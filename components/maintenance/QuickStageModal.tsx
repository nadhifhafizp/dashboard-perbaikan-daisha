'use client';

import React, { useState, useEffect } from 'react';
import { X, Truck, MapPin, Send, RefreshCw, CheckCircle2 } from 'lucide-react';
import { FleetUnit } from './FleetExplorer';

interface QuickStageModalProps {
  isOpen: boolean;
  unit: FleetUnit | null;
  seksi: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickStageModal({
  isOpen,
  unit,
  seksi,
  onClose,
  onSuccess,
}: QuickStageModalProps) {
  const [lokasi, setLokasi] = useState('');
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick suggestions
  const quickLocations = [
    `Staging Area Line 1 ${seksi}`,
    `Staging Area Line 2 ${seksi}`,
    `Area Finishing Bay ${seksi}`,
    `Pintu Masuk Seksi ${seksi}`,
    `Parkir Daisha Depan Pos QC ${seksi}`,
  ];

  useEffect(() => {
    if (isOpen) {
      setLokasi(`Staging Area Line 1 ${seksi}`);
      setCatatan('');
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen, seksi]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen || !unit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lokasi.trim()) {
      setError('Lokasi penjemputan unit wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/maintenance/staging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          seksi,
          units: [unit.nomor_daisha.toUpperCase()],
          lokasi: lokasi.trim(),
          catatan: catatan.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Gagal mengirim data penjemputan.');
      }
    } catch (err) {
      console.error('Error submitting quick stage:', err);
      setError('Gangguan jaringan. Periksa koneksi Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-stage-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-emerald-700 border-b border-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Truck className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 id="quick-stage-title" className="font-semibold text-sm">Siapkan Daisha untuk PM</h3>
              <p className="text-xs text-emerald-100">Kirim pemberitahuan penjemputan ke bengkel Workshop</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Tutup modal penyiapan PM"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Card Info Unit */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-slate-900">
                  {unit.nomor_daisha}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Belum PM 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {unit.nama_daisha || unit.jenis} {unit.ukuran && unit.ukuran !== 'STANDARD' ? `(${unit.ukuran})` : ''} • Seksi {seksi}
              </p>
            </div>

            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              1 Unit Siap
            </span>
          </div>

          {/* Titik Lokasi Penjemputan */}
          <div className="space-y-1.5">
            <label htmlFor="quick-stage-lokasi" className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
              <span>Titik Lokasi Penjemputan di Seksi {seksi} *</span>
            </label>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap gap-1 mb-1.5">
              {quickLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLokasi(loc)}
                  className={`text-xs px-2 py-0.5 rounded-md border transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    lokasi === loc
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            <input
              id="quick-stage-lokasi"
              name="lokasiPenjemputan"
              type="text"
              autoComplete="off"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Staging Area Line 2 depan Bay 4…"
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 font-medium text-slate-900"
              required
            />
            <p className="text-xs text-slate-500">
              Cantumkan titik penempatan unit agar mekanik bengkel langsung mengambilnya.
            </p>
          </div>

          {/* Catatan Kesiapan */}
          <div className="space-y-1">
            <label htmlFor="quick-stage-catatan" className="block text-xs font-bold text-slate-800">
              Catatan Kesiapan <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              id="quick-stage-catatan"
              name="catatanKesiapan"
              type="text"
              autoComplete="off"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Unit sudah kosong, rem roda terkunci…"
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 text-slate-800"
            />
          </div>

          {/* Error Alert */}
          {error && (
            <div role="alert" aria-live="assertive" className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 h-9 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition border border-slate-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !lokasi.trim()}
              className="flex-2 h-9 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Mengirim…</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Kirim ke Workshop</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
