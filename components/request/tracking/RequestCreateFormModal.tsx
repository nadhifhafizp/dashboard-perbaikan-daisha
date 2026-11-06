'use client';

import React, { useRef, useState } from 'react';
import {
  X,
  Send,
  Upload,
  Trash2,
  User,
  Mail,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Check,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  Phone,
  Layers,
  Target,
} from 'lucide-react';
import { compressImageFile } from '@/lib/imageCompressor';
import { RequestFormData, DAFTAR_SEKSI_REQUEST, DAFTAR_FAKTOR } from './types';
import { getSeksiCode } from '@/lib/nomorSurat';
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

  React.useEffect(() => {
    if (currentUser?.seksi) {
      setFormData((p) => ({
        ...p,
        seksiPemohon: p.seksiPemohon || currentUser.seksi || '',
        kodeSeksi: p.kodeSeksi || getSeksiCode(currentUser.seksi),
      }));
    }
  }, [currentUser, setFormData]);

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

  const handleSeksiChange = (seksi: string) => {
    const autoCode = getSeksiCode(seksi);
    setFormData((p) => ({
      ...p,
      seksiPemohon: seksi,
      kodeSeksi: autoCode !== 'SEKSI' && autoCode !== 'GEN' ? autoCode : p.kodeSeksi,
    }));
  };

  const toggleFaktor = (faktor: string) => {
    const currentList = (formData.faktor || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    let updated: string[];
    if (currentList.some((f) => f.toLowerCase() === faktor.toLowerCase())) {
      updated = currentList.filter((f) => f.toLowerCase() !== faktor.toLowerCase());
    } else {
      updated = [...currentList, faktor];
    }
    // Pertahankan urutan standard SEQCD: Safety, Environment, Quality, Cost, Delivery
    const standard = DAFTAR_FAKTOR.filter((f) =>
      updated.some((u) => u.toLowerCase() === f.toLowerCase())
    );
    const custom = updated.filter(
      (u) => !DAFTAR_FAKTOR.some((f) => f.toLowerCase() === u.toLowerCase())
    );
    const result = [...standard, ...custom].join(', ');
    setFormData((p) => ({
      ...p,
      faktor: result || 'Safety',
    }));
  };

  const presetSatuan = ['set', 'pcs', 'unit', 'roll', 'batang'];

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-scale-up space-y-0"
    >
      {/* Alur Proses Singkat (Breadcrumb Flow) */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Alur Permohonan Permintaan Kerja:</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 font-bold shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shrink-0">1</span>
              <span className="truncate">Isi Form (Anda)</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 font-bold">2</span>
              <span className="truncate">Approval Atasan</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 font-bold">3</span>
              <span className="truncate">Evaluasi Bengkel</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 font-bold">4</span>
              <span className="truncate">Pengerjaan Selesai</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer shrink-0 self-start sm:self-center"
          title="Tutup formulir"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* BAGIAN 1: Identitas Pemohon */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Identitas Pemohon (Seksi &amp; PIC)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            {/* Seksi Pemohon */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seksi Pemohon <span className="text-red-500">*</span>
              </label>
              {currentUser?.role === 'USER_SEKSI' ? (
                <div className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>{formData.seksiPemohon || currentUser.seksi}</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <select
                    value={formData.seksiPemohon}
                    onChange={(e) => handleSeksiChange(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none cursor-pointer"
                    required
                  >
                    <option value="">Pilih Seksi Pemohon...</option>
                    {DAFTAR_SEKSI_REQUEST.map((s) => (
                      <option key={s} value={s}>
                        {s} ({getSeksiCode(s)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Unit seksi pembuat request</p>
            </div>

            {/* 3. Manajer (Kode Diinput Manual oleh Seksi Pemohon) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Manajer Pemohon <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.kodeSeksi}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, kodeSeksi: e.target.value.toUpperCase() }))
                }
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase text-slate-900 bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none"
                placeholder="Contoh: 8230 / B-B"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Kode Manajer (input manual oleh pemohon)
              </p>
            </div>

            {/* 1. Staff (Nama PIC Pemohon) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1. Staff (PIC Pemohon) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
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
                  className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none font-medium"
                  placeholder="Nama Staff pembuat request"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Staff penanggung jawab pengajuan
              </p>
            </div>

            {/* No. Kontak / Ext */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Telepon / Extension <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.kontakPemohon}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, kontakPemohon: e.target.value }))
                  }
                  className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none"
                  placeholder="Mis: Ext. 178 atau 0812xxxx"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Untuk koordinasi teknis oleh tim bengkel
              </p>
            </div>
          </div>
        </section>

        {/* BAGIAN 2: Persetujuan Atasan Seksi */}
        <section className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>2. Persetujuan Spv Seksi (Approval Digital)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tautan persetujuan tanda tangan digital akan dibuat otomatis untuk Spv (Supervisor) Seksi Anda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Spv (Supervisor Seksi) <span className="text-red-500">*</span>
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
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none"
                placeholder="Contoh: Bpk. Budi Santoso (Spv)"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Atasan Seksi <span className="text-slate-400 font-normal">(Untuk Notifikasi Approval)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.emailAtasanSeksi}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, emailAtasanSeksi: e.target.value }))
                  }
                  className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none"
                  placeholder="atasan.seksi@bridgestone.com"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Tautan persetujuan juga dapat disalin atau dibagikan via WhatsApp setelah form disimpan.
              </p>
            </div>
          </div>
        </section>

        {/* BAGIAN 3: Detail Permohonan Pekerjaan */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Detail Permohonan &amp; Kebutuhan Pekerjaan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            {/* Perihal */}
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perihal Permohonan / Uraian Singkat <span className="text-red-500">*</span>
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
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none font-semibold"
                placeholder="Contoh: Pembuatan Stopper Material Calender / Modifikasi Roda Troli"
                required
              />
              <p className="text-xs text-slate-600 mt-1">
                Tuliskan nama barang atau pekerjaan yang diminta dengan jelas
              </p>
            </div>

            {/* No Daisha / Machine */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Daisha / Nama Mesin <span className="text-slate-400 font-normal">(Jika ada)</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={formData.namaMachine}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, namaMachine: e.target.value }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none uppercase font-bold"
                  placeholder="Mis: S-045, CAL-02"
                />
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="h-10 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  title="Scan barcode atau QR fisik menggunakan kamera"
                >
                  <Camera className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Scan</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Scan barcode atau ketik manual unit terkait
              </p>
            </div>
          </div>

          {/* Urgensi Pekerjaan: Pilihan Visual Interaktif */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Tingkat Urgensi Pekerjaan <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, urgensi: 'Normal' }))}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  formData.urgensi === 'Normal'
                    ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                  formData.urgensi === 'Normal' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`}>
                  {formData.urgensi === 'Normal' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Normal (Reguler)</div>
                  <div className="text-xs text-slate-600">Pekerjaan rutin atau perbaikan terjadwal bengkel</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, urgensi: 'Urgent' }))}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  formData.urgensi === 'Urgent'
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                  formData.urgensi === 'Urgent' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                }`}>
                  {formData.urgensi === 'Urgent' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900">Urgent (Segera)</div>
                  <div className="text-xs text-slate-600">Mempengaruhi efisiensi, butuh selesai dalam 1-3 hari</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, urgensi: 'Critical' }))}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  formData.urgensi === 'Critical'
                    ? 'border-red-500 bg-red-50/70 ring-1 ring-red-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                  formData.urgensi === 'Critical' ? 'border-red-600 bg-red-600' : 'border-slate-300'
                }`}>
                  {formData.urgensi === 'Critical' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-red-900">Critical (Darurat)</div>
                  <div className="text-xs text-slate-600">Line stop, bahaya safety, atau pencegahan kecelakaan kerja</div>
                </div>
              </button>
            </div>
          </div>

          {/* Pilihan Faktor Utama (SEQCD) - Multiple Choice & Manual Input */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="block text-xs font-semibold text-slate-700">
                Faktor Utama (SEQCD) <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-500">
                Bisa pilih lebih dari satu (Multiple Choice) atau ketik faktor khusus
              </span>
            </div>

            {/* Pilihan Multiple Choice Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DAFTAR_FAKTOR.map((faktor) => {
                const currentFaktorList = (formData.faktor || '')
                  .split(',')
                  .map((s) => s.trim().toLowerCase())
                  .filter(Boolean);
                const isSelected = currentFaktorList.includes(faktor.toLowerCase());
                return (
                  <button
                    key={faktor}
                    type="button"
                    onClick={() => toggleFaktor(faktor)}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                    <span>{faktor}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Input Nilai Faktor Gabungan */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 shrink-0">Input Faktor:</span>
              <input
                type="text"
                value={formData.faktor || ''}
                onChange={(e) => setFormData((p) => ({ ...p, faktor: e.target.value }))}
                className="w-full h-8 px-2.5 border border-slate-300 rounded text-xs bg-white text-slate-900 focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none font-semibold"
                placeholder="Misal: Safety, Quality, Cost"
              />
            </div>
          </div>

          {/* Tujuan Pekerjaan (Input Teks Manual) & Kuantitas */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tujuan Pekerjaan <span className="text-slate-400 font-normal">(Input Manual)</span>
              </label>
              <input
                type="text"
                value={formData.tujuan}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, tujuan: e.target.value }))
                }
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none"
                placeholder="Contoh: Untuk mencegah lantai rusak"
              />
              <p className="text-xs text-slate-500 mt-1">
                Tuliskan kalimat tujuan / alasan permohonan (misal: Untuk mencegah lantai rusak)
              </p>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none font-bold"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Satuan
              </label>
              <input
                type="text"
                value={formData.satuan}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, satuan: e.target.value }))
                }
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none font-medium"
                placeholder="set / pcs / unit"
              />
              <div className="flex gap-1 mt-1">
                {presetSatuan.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, satuan: s }))}
                    className={`text-xs px-1.5 py-0.5 rounded cursor-pointer ${
                      formData.satuan === s
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN 4: Dokumentasi Kondisi & Usulan Rencana (DIPERJELAS) */}
        <section className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Dokumentasi &amp; Penjelasan Masalah
              </h3>
              <p className="text-xs text-slate-500">
                Bantu teknisi bengkel memahami masalah aktual dan usulan yang Anda inginkan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kartu 1: Kondisi Aktual Saat Ini (Problem) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                      <span>Keadaan Sekarang (Problem)</span>
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Kendala, posisi aus/patah, atau potensi bahaya
                    </p>
                  </div>
                  <span className="text-xs text-red-700 bg-red-50 border border-red-200 font-bold px-1.5 py-0.5 rounded shrink-0">
                    Foto Before
                  </span>
                </div>

                <textarea
                  value={formData.keadaanSekarang}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      keadaanSekarang: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none resize-none leading-relaxed"
                  placeholder="Contoh: Pengait troli aus dan sering macet saat ditarik, berisiko jatuh saat membawa material..."
                />
              </div>

              <div>
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
                      alt="Kondisi Aktual (Before)"
                      className="w-full h-44 object-contain p-1.5 bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, fotoSebelum: '' }))}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-lg text-xs hover:bg-rose-700 transition shadow-sm cursor-pointer"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputSebelumRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl flex flex-col items-center justify-center text-slate-600 hover:text-red-600 transition cursor-pointer bg-white group p-3 text-center"
                  >
                    <Upload className="w-5 h-5 mb-1 text-slate-400 group-hover:text-red-500 transition" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-red-600">
                      Upload Foto Keadaan Sekarang
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5">
                      Kamera ponsel atau galeri
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Kartu 2: Rencana Tindakan / Usulan Solusi */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      <span>Rencana Tindakan (Usulan)</span>
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Bentuk perbaikan, dimensi, atau modifikasi
                    </p>
                  </div>
                  <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 font-semibold px-1.5 py-0.5 rounded shrink-0">
                    Sketsa / Desain
                  </span>
                </div>

                <textarea
                  value={formData.rencanaTindakan}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, rencanaTindakan: e.target.value }))
                  }
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none resize-none leading-relaxed"
                  placeholder="Contoh: Dibuatkan stopper ganda dari plat baja tebal 5mm dan dicat kuning keselamatan..."
                />
              </div>

              <div>
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
                      alt="Sketsa / Referensi Rencana"
                      className="w-full h-44 object-contain p-1.5 bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, fotoSesudah: '' }))}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-lg text-xs hover:bg-rose-700 transition shadow-sm cursor-pointer"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputSesudahRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center text-slate-600 hover:text-emerald-700 transition cursor-pointer bg-white group p-3 text-center"
                  >
                    <Upload className="w-5 h-5 mb-1 text-slate-400 group-hover:text-emerald-600 transition" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      Upload Sketsa / Referensi Rencana
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5">
                      Coretan tangan, foto acuan, atau CAD
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Kartu 3: Target Hasil : (Pcs/Day, Rp./Month, etc) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span>Target Hasil : (Target/KPI)</span>
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Pcs/Day, Rp./Month, efisiensi waktu, dll
                    </p>
                  </div>
                  <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 font-bold px-1.5 py-0.5 rounded shrink-0">
                    Teks Target
                  </span>
                </div>

                <textarea
                  value={formData.targetHasil}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, targetHasil: e.target.value }))
                  }
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none resize-none leading-relaxed"
                  placeholder="Contoh: Pengurangan downtime 30 menit/hari, efisiensi Rp. 5jt/bulan, atau peningkatan output 50 pcs/day..."
                />
              </div>

              <div>
                <div className="w-full h-24 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center bg-blue-50/50 p-3 text-center">
                  <Target className="w-5 h-5 mb-1 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Hanya Input Teks Target
                  </span>
                  <span className="text-xs text-slate-600 mt-0.5">
                    Tidak memerlukan upload gambar/foto
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Footer Action Buttons */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
          Setelah formulir dikirim, link tanda tangan akan diteruskan ke Atasan Seksi. Nomor surat resmi terbit setelah di-assign Atasan Special Project.
        </p>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial h-11 min-h-[44px] px-5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 sm:flex-initial h-11 min-h-[44px] px-6 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-xs rounded-xl transition inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-red-600/20"
          >
            <Send className="w-4 h-4" />
            <span>
              {submitting ? 'Mengirim Formulir...' : 'Kirim Permohonan Request'}
            </span>
          </button>
        </div>
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
