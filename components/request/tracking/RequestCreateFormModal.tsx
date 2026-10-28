'use client';

import React, { useRef, useState } from 'react';
import { X, Send, Upload, Trash2, User, Mail, Camera } from 'lucide-react';
import { compressImageFile } from '@/lib/imageCompressor';
import { RequestFormData, DAFTAR_SEKSI_REQUEST, DAFTAR_TUJUAN } from './types';
import { SessionPayload } from '@/lib/auth';
import QrScannerModal from '@/components/input/QrScannerModal';

interface RequestCreateFormModalProps {
  formData: RequestFormData;
  setFormData: React.Dispatch<React.SetStateAction<RequestFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  currentUser: SessionPayload | null;
  onClose: () => void;
  onError: (title: string, message: string) => void;
}

export default function RequestCreateFormModal({
  formData,
  setFormData,
  onSubmit,
  submitting,
  currentUser,
  onClose,
  onError,
}: RequestCreateFormModalProps) {
  const fileInputSebelumRef = useRef<HTMLInputElement>(null);
  const fileInputSesudahRef = useRef<HTMLInputElement>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'fotoSebelum' | 'fotoSesudah'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 900, 900, 0.75);
      setFormData((p) => ({ ...p, [field]: compressed }));
    } catch (err) {
      console.error('Error compressing image:', err);
      onError('Gagal Memproses Foto', 'Terjadi kesalahan saat memproses gambar.');
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4 animate-scale-up"
    >
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <span>Formulir Permohonan Pekerjaan Antar Seksi (ENG-KP-011)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Format resmi Special Project & Maintenance Bengkel PT Bridgestone Tire Indonesia
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span className="text-xs font-semibold text-slate-700">
            Langkah 1 Flowchart: Pengisian data permohonan oleh PIC Pemohon
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Seksi Pemohon *
            </label>
            {currentUser?.role === 'USER_SEKSI' ? (
              <div className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{formData.seksiPemohon || currentUser.seksi}</span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                  Terkunci Otomatis
                </span>
              </div>
            ) : (
              <select
                value={formData.seksiPemohon}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, seksiPemohon: e.target.value }))
                }
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
                required
              >
                <option value="">Pilih Seksi...</option>
                {DAFTAR_SEKSI_REQUEST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kode Seksi / Dept
            </label>
            <input
              type="text"
              value={formData.kodeSeksi}
              onChange={(e) =>
                setFormData((p) => ({ ...p, kodeSeksi: e.target.value }))
              }
              className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
              placeholder="Mis: 3122"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama PIC Pemohon (Drafter) *
            </label>
            <input
              type="text"
              value={formData.drafter}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  drafter: e.target.value,
                  picPemohon: e.target.value,
                }))
              }
              className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
              placeholder="Nama pembuat request (Osep M)"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Telp. (Extension)
            </label>
            <input
              type="text"
              value={formData.kontakPemohon}
              onChange={(e) =>
                setFormData((p) => ({ ...p, kontakPemohon: e.target.value }))
              }
              className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
              placeholder="Mis: 178"
            />
          </div>
        </div>

        {/* Email Atasan Seksi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-red-600" />
              <span>Nama Atasan Seksi (Foreman / K.Sie)</span>
            </label>
            <input
              type="text"
              value={formData.namaAtasanSeksi}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  namaAtasanSeksi: e.target.value,
                  foreman: e.target.value,
                }))
              }
              className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
              placeholder="Mis: Bpk. Budi Santoso"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-red-600" />
              <span>Email Atasan Seksi (Untuk Kirim Tautan Persetujuan) *</span>
            </label>
            <input
              type="email"
              value={formData.emailAtasanSeksi}
              onChange={(e) =>
                setFormData((p) => ({ ...p, emailAtasanSeksi: e.target.value }))
              }
              className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
              placeholder="atasan.seksi@bridgestone.com"
              required
            />
          </div>
        </div>

        {/* Detail Pekerjaan */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-200">
          <div className="sm:col-span-8">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Perihal Permohonan / Uraian Singkat *
            </label>
            <input
              type="text"
              value={formData.perihal}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  perihal: e.target.value,
                  namaBarang: e.target.value,
                }))
              }
              className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none font-medium"
              placeholder="Contoh: Pembuatan Stopper Material Calender"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              No. Daisha / Nama Machine
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={formData.namaMachine}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, namaMachine: e.target.value }))
                }
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none uppercase font-bold"
                placeholder="Mis: S-045, CALENDER-02..."
              />
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="h-9 px-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                title="Scan barcode atau QR fisik Daisha menggunakan kamera"
              >
                <Camera className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Urgensi & Tujuan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tingkat Urgensi
            </label>
            <select
              value={formData.urgensi}
              onChange={(e) =>
                setFormData((p) => ({ ...p, urgensi: e.target.value }))
              }
              className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
            >
              <option value="Normal">Normal (Reguler)</option>
              <option value="Urgent">Urgent (Segera)</option>
              <option value="Critical">Critical (Stop Produksi/Safety)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tujuan Pekerjaan
            </label>
            <select
              value={formData.tujuan}
              onChange={(e) =>
                setFormData((p) => ({ ...p, tujuan: e.target.value }))
              }
              className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
            >
              {DAFTAR_TUJUAN.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jumlah
              </label>
              <input
                type="number"
                min="1"
                value={formData.jumlah}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    jumlah: parseInt(e.target.value, 10) || 1,
                  }))
                }
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Satuan
              </label>
              <input
                type="text"
                value={formData.satuan}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, satuan: e.target.value }))
                }
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none"
                placeholder="pcs / unit / set"
              />
            </div>
          </div>
        </div>

        {/* Foto Sebelum & Sesudah */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-slate-900">
                Keadaan Sekarang (Problem / Kondisi Aktual)
              </span>
              <span className="text-xs text-slate-500 font-medium">Foto Before</span>
            </div>
            <textarea
              value={formData.keadaanSekarang}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  keadaanSekarang: e.target.value,
                  alasan: e.target.value,
                }))
              }
              rows={3}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none resize-none leading-relaxed"
              placeholder="Jelaskan kendala posisi saat ini, potensi bahaya, atau bottleneck..."
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputSebelumRef}
              onChange={(e) => handlePhotoUpload(e, 'fotoSebelum')}
              className="hidden"
            />
            {formData.fotoSebelum ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.fotoSebelum}
                  alt="Before"
                  className="w-full h-40 object-contain p-1"
                />
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, fotoSebelum: '' }))}
                  className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-md text-xs hover:bg-rose-700 transition shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputSebelumRef.current?.click()}
                className="w-full h-20 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-red-600 transition cursor-pointer bg-white"
              >
                <Upload className="w-4 h-4 mb-0.5 text-slate-400" />
                <span className="text-xs font-medium">
                  Upload Foto Keadaan Sekarang
                </span>
              </button>
            )}
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-slate-900">
                Rencana Tindakan (Yang Diminta)
              </span>
              <span className="text-xs text-slate-500 font-medium">Foto After / Plan</span>
            </div>
            <textarea
              value={formData.rencanaTindakan}
              onChange={(e) =>
                setFormData((p) => ({ ...p, rencanaTindakan: e.target.value }))
              }
              rows={3}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 outline-none resize-none leading-relaxed"
              placeholder="Jelaskan rencana pemindahan posisi atau modifikasi..."
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputSesudahRef}
              onChange={(e) => handlePhotoUpload(e, 'fotoSesudah')}
              className="hidden"
            />
            {formData.fotoSesudah ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.fotoSesudah}
                  alt="After"
                  className="w-full h-40 object-contain p-1"
                />
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, fotoSesudah: '' }))}
                  className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-md text-xs hover:bg-rose-700 transition shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputSesudahRef.current?.click()}
                className="w-full h-20 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-red-600 transition cursor-pointer bg-white"
              >
                <Upload className="w-4 h-4 mb-0.5 text-slate-400" />
                <span className="text-xs font-medium">
                  Upload Foto Rencana Tindakan
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="h-10 min-h-[40px] px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="h-10 min-h-[40px] px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            {submitting ? 'Mengirim Formulir...' : 'Kirim Formulir ke Atasan Seksi'}
          </span>
        </button>
      </div>

      {/* Modal Scanner Barcode / QR Daisha Fisik */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(decodedText) => {
          const clean = decodedText.trim();
          if (clean) {
            setFormData((p) => ({
              ...p,
              namaMachine: clean.toUpperCase(),
              perihal: p.perihal || `Perbaikan Daisha ${clean.toUpperCase()}`,
            }));
          }
          setIsScannerOpen(false);
        }}
        onError={(err) => {
          console.warn('[Request Daisha Scanner Error]:', err);
        }}
      />
    </form>
  );
}
