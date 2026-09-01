'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CreateTicketPayload } from '@/types/ticket';
import { getInitialDateTime, cleanInputDateTime } from '@/lib/date';
import FeedbackModal, { FeedbackType } from '@/components/FeedbackModal';
import { 
  masterDataDaisha, 
  DAFTAR_SEKSI, 
  DAFTAR_SEMUA_DAISHA, 
  getDaishaBySeksi
} from '@/lib/masterData';

const API_URL = "/api/repair";

export type TindakanType = 'Repair' | 'Ganti';

export default function InputKerusakanPage() {
  const [formData, setFormData] = useState({
    waktuMasuk: getInitialDateTime(),
    namaPelapor: '',
    seksi: '',
    jenisDaisha: '',
    noDaisha: '',
    catatanTambahan: ''
  });

  // State Pilihan Kerusakan Multi-Select Cepat (koleksi "komponen:::detail")
  const [selectedKerusakan, setSelectedKerusakan] = useState<string[]>([]);
  const [customKerusakanList, setCustomKerusakanList] = useState<string[]>([]);
  
  // Pilihan Tindakan: Repair (Perbaiki) atau Ganti (Baru) untuk setiap item kerusakan
  const [tindakanMap, setTindakanMap] = useState<Record<string, TindakanType>>({});
  const [customTindakanMap, setCustomTindakanMap] = useState<Record<string, TindakanType>>({});

  const [inputManualText, setInputManualText] = useState('');
  const [searchGejala, setSearchGejala] = useState('');

  const [showAllDaisha, setShowAllDaisha] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State untuk kontrol Kamera Scanner
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // State untuk Pop-up Feedback Interaktif
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    title: string;
    message: string;
    detail?: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showFeedback = (type: FeedbackType, title: string, message: string, detail?: string) => {
    setFeedback({ isOpen: true, type, title, message, detail });
  };

  // Pilihan dinamis berdasarkan Master Data
  const pilihanDaishaTersedia = useMemo(() => {
    if (showAllDaisha) return DAFTAR_SEMUA_DAISHA;
    return getDaishaBySeksi(formData.seksi);
  }, [showAllDaisha, formData.seksi]);

  // Katalog kerusakan untuk jenis Daisha yang sedang dipilih
  const katalogKerusakan = useMemo(() => {
    if (!formData.jenisDaisha || !masterDataDaisha[formData.jenisDaisha]) return {};
    return masterDataDaisha[formData.jenisDaisha].jenisKerusakan || {};
  }, [formData.jenisDaisha]);

  const totalDipilih = selectedKerusakan.length + customKerusakanList.length;

  // Toggle pilihan kerusakan dalam 1 klik
  const toggleKerusakan = (komponen: string, detail: string) => {
    const key = `${komponen}:::${detail}`;
    if (selectedKerusakan.includes(key)) {
      setSelectedKerusakan(prev => prev.filter(k => k !== key));
    } else {
      setSelectedKerusakan(prev => [...prev, key]);
      // Default tindakan: Repair
      setTindakanMap(prev => ({
        ...prev,
        [key]: prev[key] || 'Repair'
      }));
    }
  };

  const setItemTindakan = (key: string, tindakan: TindakanType) => {
    setTindakanMap(prev => ({
      ...prev,
      [key]: tindakan
    }));
  };

  const setCustomTindakan = (text: string, tindakan: TindakanType) => {
    setCustomTindakanMap(prev => ({
      ...prev,
      [text]: tindakan
    }));
  };

  const handleAddManual = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const t = inputManualText.trim();
    if (!t) return;
    if (!customKerusakanList.includes(t)) {
      setCustomKerusakanList(prev => [...prev, t]);
      setCustomTindakanMap(prev => ({
        ...prev,
        [t]: 'Repair'
      }));
    }
    setInputManualText('');
  };

  const handleRemoveManual = (t: string) => {
    setCustomKerusakanList(prev => prev.filter(item => item !== t));
  };

  // Fungsi untuk Menyalakan Kamera Scanner
  const startScanner = async () => {
    setIsScanning(true);
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("reader-camera");
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            setFormData(prev => ({ ...prev, noDaisha: decodedText }));
            stopScanner();
            showFeedback('success', 'Barcode Terbaca', 'Nomor Unit Daisha berhasil terdeteksi otomatis.', decodedText);
          },
          () => {
            // Frame error - abaikan
          }
        );
      } catch (err) {
        console.error("Gagal membuka kamera:", err);
        showFeedback('error', 'Izin Kamera Diperlukan', 'Gagal membuka kamera. Pastikan izin kamera browser sudah diaktifkan.');
        setIsScanning(false);
      }
    }, 100);
  };

  // Fungsi untuk Mematikan Kamera Scanner
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.error("Gagal menghentikan scanner:", e);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'seksi') {
      setFormData(prev => ({
        ...prev,
        seksi: value,
        jenisDaisha: '',
      }));
      setSelectedKerusakan([]);
      setCustomKerusakanList([]);
      setTindakanMap({});
      setCustomTindakanMap({});
      setInputManualText('');
      setShowAllDaisha(false);
    } 
    else if (name === 'showAll') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setShowAllDaisha(isChecked);
    } 
    else if (name === 'jenisDaisha') {
      const autoSeksi = masterDataDaisha[value]?.seksi;
      setFormData(prev => ({
        ...prev,
        jenisDaisha: value,
        seksi: autoSeksi || prev.seksi || '',
      }));
      setSelectedKerusakan([]);
      setCustomKerusakanList([]);
      setTindakanMap({});
      setCustomTindakanMap({});
      setInputManualText('');
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.namaPelapor.trim()) {
      showFeedback('error', 'Nama Pelapor Diperlukan', 'Harap isi nama teknisi / operator pelapor.');
      setLoading(false);
      return;
    }
    if (!formData.seksi) {
      showFeedback('error', 'Seksi Diperlukan', 'Harap pilih seksi asal unit Daisha.');
      setLoading(false);
      return;
    }
    if (!formData.jenisDaisha) {
      showFeedback('error', 'Jenis Daisha Diperlukan', 'Harap pilih jenis atau tipe Daisha.');
      setLoading(false);
      return;
    }
    if (!formData.noDaisha.trim()) {
      showFeedback('error', 'Nomor Unit Diperlukan', 'Harap isi atau scan nomor fisik unit Daisha.');
      setLoading(false);
      return;
    }

    if (totalDipilih === 0) {
      showFeedback('error', 'Pilih Kerusakan', 'Harap klik/pilih minimal 1 kerusakan pada kartu di bawah.');
      setLoading(false);
      return;
    }

    // Susun string gabungan kategori & detail dengan tindakan (Repair vs Ganti)
    const parsedItems = selectedKerusakan.map(key => {
      const [komponen, detail] = key.split(':::');
      const tindakan = tindakanMap[key] || 'Repair';
      return { komponen, detail, tindakan };
    });

    const listKomponenUnik = Array.from(new Set(parsedItems.map(p => p.komponen)));
    if (customKerusakanList.length > 0) {
      listKomponenUnik.push('Others');
    }
    const finalKategori = listKomponenUnik.join(', ');

    const detailList: string[] = [
      ...parsedItems.map((p, idx) => {
        const num = (parsedItems.length + customKerusakanList.length > 1) ? `${idx + 1}. ` : '';
        return `${num}[${p.komponen}] ${p.detail} (Tindakan: ${p.tindakan})`;
      }),
      ...customKerusakanList.map((c, idx) => {
        const tindakan = customTindakanMap[c] || 'Repair';
        const num = (parsedItems.length + customKerusakanList.length > 1) ? `${parsedItems.length + idx + 1}. ` : '';
        return `${num}[Others] ${c} (Tindakan: ${tindakan})`;
      })
    ];

    let finalDetail = detailList.join(' | ');
    if (formData.catatanTambahan.trim()) {
      finalDetail = `${finalDetail} (Catatan: ${formData.catatanTambahan.trim()})`;
    }

    const cleanWaktuMasuk = cleanInputDateTime(formData.waktuMasuk);

    const payloadExcel: CreateTicketPayload = {
      action: "CREATE",
      idTiket: "TCK-" + Date.now(),
      waktuMasuk: cleanWaktuMasuk,
      waktuKeluar: "-",
      status: "Open",
      namaPelapor: formData.namaPelapor,
      seksi: formData.seksi,
      namaDaisha: formData.jenisDaisha,
      noDaisha: formData.noDaisha.trim().toUpperCase(),
      kategori: finalKategori,
      detail: finalDetail
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadExcel),
      });

      const resData = await response.json();

      if (response.ok) {
        showFeedback(
          'success',
          'Laporan Berhasil Disimpan',
          `Laporan unit ${formData.noDaisha} (${formData.jenisDaisha}) dengan ${totalDipilih} titik kerusakan berhasil dikirim ke antrean workshop.`,
          `Seksi: ${formData.seksi} | Komponen: ${finalKategori} | Gejala: ${finalDetail}`
        );
        setFormData({
          waktuMasuk: getInitialDateTime(),
          namaPelapor: formData.namaPelapor, // Pertahankan nama pelapor agar praktis untuk input berikutnya
          seksi: '',
          jenisDaisha: '',
          noDaisha: '',
          catatanTambahan: ''
        });
        setSelectedKerusakan([]);
        setCustomKerusakanList([]);
        setTindakanMap({});
        setCustomTindakanMap({});
        setInputManualText('');
        setShowAllDaisha(false);
      } else {
        showFeedback('error', 'Gagal Mengirim Laporan', resData.error || 'Terjadi kesalahan saat menyimpan laporan.');
      }
    } catch (error) {
      console.error("Error:", error);
      showFeedback('error', 'Gangguan Jaringan', 'Gagal menghubungi server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-start">
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 w-full max-w-3xl">
        
        {/* Header Form */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 bg-red-100 text-red-700 text-[11px] font-black rounded-full uppercase tracking-wider">
                Workshop Intake Form
              </span>
              <span className="text-xs text-slate-400 font-medium">Input Lapangan & Bengkel</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">Form Laporan Daisha Rusak</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              Catat data unit Daisha yang bermasalah sesuai katalog kerusakan master workshop.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Data Pelapor & Waktu */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>👤</span> 1. Data Pelapor & Waktu Kejadian
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Waktu Temuan / Masuk *
                </label>
                <input 
                  type="datetime-local" 
                  name="waktuMasuk" 
                  value={formData.waktuMasuk} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 font-bold bg-white focus:ring-2 focus:ring-red-600 outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Pelapor & NIK *
                </label>
                <input 
                  type="text" 
                  name="namaPelapor" 
                  value={formData.namaPelapor} 
                  onChange={handleChange} 
                  placeholder="Contoh: Budi Santoso - 10421" 
                  required 
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium bg-white focus:ring-2 focus:ring-red-600 outline-none" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Identifikasi Unit Daisha */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🛒</span> 2. Identifikasi Unit Daisha
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Seksi Asal Unit *
                </label>
                <select 
                  name="seksi" 
                  value={formData.seksi} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 font-bold bg-white focus:ring-2 focus:ring-red-600 outline-none"
                >
                  <option value="">-- Pilih Seksi --</option>
                  {DAFTAR_SEKSI.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipe / Jenis Daisha *
                </label>
                <select 
                  name="jenisDaisha" 
                  value={formData.jenisDaisha} 
                  onChange={handleChange} 
                  required 
                  disabled={!formData.seksi && !showAllDaisha} 
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium bg-white focus:ring-2 focus:ring-red-600 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {formData.seksi || showAllDaisha ? "-- Pilih Jenis Daisha --" : "Pilih Seksi Terlebih Dahulu"}
                  </option>
                  {pilihanDaishaTersedia.map((d) => <option key={d} value={d}>{d}</option>)}
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
                className="mr-2 h-4 w-4 text-red-600 rounded accent-red-600 cursor-pointer" 
              />
              <label htmlFor="showAll" className="text-xs text-slate-600 font-semibold cursor-pointer">
                Tampilkan seluruh jenis Daisha di dropdown tanpa terikat filter Seksi
              </label>
            </div>

            {/* Nomor Unit & Barcode Scanner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-3 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Unit Daisha *
                </label>
                <input 
                  type="text" 
                  name="noDaisha" 
                  value={formData.noDaisha} 
                  onChange={handleChange} 
                  placeholder="Ketik atau scan barcode (Cth: DAI-01)" 
                  required 
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-900 font-black bg-white focus:ring-2 focus:ring-red-600 outline-none uppercase placeholder-slate-400" 
                />
              </div>

              <div>
                {!isScanning ? (
                  <button 
                    type="button" 
                    onClick={startScanner} 
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                  >
                    <span>📷</span>
                    <span>Scan Barcode / QR Kamera</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={stopScanner} 
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                  >
                    <span>✕</span>
                    <span>Tutup Kamera Scanner</span>
                  </button>
                )}
              </div>
            </div>

            {/* Area Kamera Scanner */}
            {isScanning && (
              <div className="mt-4 p-4 bg-slate-900 rounded-2xl flex flex-col items-center border border-slate-700">
                <div id="reader-camera" className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg"></div>
                <p className="text-slate-300 text-xs mt-3 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Arahkan kamera tepat ke barcode atau QR unit Daisha...
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Analisis Kerusakan Cepat & Praktis (One-Click Chips) */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span>⚠️</span> 3. Titik Kerusakan Unit Daisha
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cukup klik / tap kerusakan di bawah (bisa pilih banyak sekaligus tanpa tambah baris)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {formData.jenisDaisha && (
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-lg">
                    {formData.jenisDaisha}
                  </span>
                )}
                <span className={`text-xs font-black px-2.5 py-1 rounded-full transition ${
                  totalDipilih > 0 
                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-300' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {totalDipilih} Dipilih
                </span>
              </div>
            </div>

            {/* Jika belum memilih jenis daisha */}
            {!formData.jenisDaisha ? (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                <span className="text-2xl block mb-1">🛒</span>
                <p className="text-xs font-bold text-slate-600">Pilih Jenis Daisha di atas terlebih dahulu</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Katalog komponen dan daftar kerusakan akan otomatis muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Search box mini untuk filter cepat chips gejala */}
                {Object.keys(katalogKerusakan).length > 1 && (
                  <input
                    type="text"
                    placeholder="🔍 Filter cepat gejala kerusakan (misal: aus, retak, lepas, baud)..."
                    value={searchGejala}
                    onChange={(e) => setSearchGejala(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white focus:ring-2 focus:ring-red-600 outline-none font-medium"
                  />
                )}

                {/* Grid Komponen dan Gejala Chips */}
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {Object.entries(katalogKerusakan).map(([komponen, listGejala]) => {
                    const filteredGejala = searchGejala.trim()
                      ? listGejala.filter(g => 
                          g.toLowerCase().includes(searchGejala.toLowerCase()) || 
                          komponen.toLowerCase().includes(searchGejala.toLowerCase())
                        )
                      : listGejala;

                    if (filteredGejala.length === 0) return null;

                    return (
                      <div key={komponen} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block mb-2">
                          ⚙️ {komponen}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {filteredGejala.map(gejala => {
                            const isSelected = selectedKerusakan.includes(`${komponen}:::${gejala}`);
                            const key = `${komponen}:::${gejala}`;
                            const tindakan = tindakanMap[key] || 'Repair';

                            return (
                              <button
                                key={gejala}
                                type="button"
                                onClick={() => toggleKerusakan(komponen, gejala)}
                                className={`px-3 py-1.5 text-xs rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer text-left ${
                                  isSelected 
                                    ? tindakan === 'Ganti'
                                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400 scale-[1.02]'
                                      : 'bg-red-600 text-white shadow-sm ring-2 ring-red-400 scale-[1.02]' 
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 hover:border-slate-300'
                                }`}
                              >
                                <span>{isSelected ? '✓' : '+'}</span>
                                <span>{gejala}</span>
                                {isSelected && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-black/25 rounded-md font-black">
                                    {tindakan === 'Ganti' ? '🔄 Ganti' : '🔨 Repair'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Panel Tindakan: Pilih Repair atau Ganti untuk setiap item yang dicentang */}
                {totalDipilih > 0 && (
                  <div className="p-4 bg-white rounded-2xl border-2 border-red-200 shadow-sm space-y-3 animate-fade-in">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <span>🛠️</span> Tentukan Tindakan (Repair atau Ganti)
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tentukan apakah komponen diservis (Repair) atau diganti baru (Ganti)
                        </p>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 bg-red-100 text-red-800 rounded-lg">
                        {totalDipilih} Item Dipilih
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedKerusakan.map((key, idx) => {
                        const [komponen, detail] = key.split(':::');
                        const currentTindakan = tindakanMap[key] || 'Repair';
                        return (
                          <div 
                            key={key} 
                            className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-3 transition"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="text-xs font-bold text-slate-800">
                                  {komponen}
                                </span>
                                <span className="text-slate-400 mx-1.5">•</span>
                                <span className="text-xs text-red-700 font-extrabold">
                                  {detail}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => setItemTindakan(key, 'Repair')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                                  currentTindakan === 'Repair'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>🔨</span>
                                <span>Repair</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setItemTindakan(key, 'Ganti')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                                  currentTindakan === 'Ganti'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>🔄</span>
                                <span>Ganti</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {customKerusakanList.map((text, idx) => {
                        const currentTindakan = customTindakanMap[text] || 'Repair';
                        return (
                          <div 
                            key={text} 
                            className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-3 transition"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                                {selectedKerusakan.length + idx + 1}
                              </span>
                              <div>
                                <span className="text-xs font-bold text-slate-800">
                                  Others / Manual
                                </span>
                                <span className="text-slate-400 mx-1.5">•</span>
                                <span className="text-xs text-red-700 font-extrabold">
                                  {text}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => setCustomTindakan(text, 'Repair')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                                  currentTindakan === 'Repair'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>🔨</span>
                                <span>Repair</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setCustomTindakan(text, 'Ganti')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                                  currentTindakan === 'Ganti'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>🔄</span>
                                <span>Ganti</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Input Manual Tambahan Jika Kerusakan Tidak Ada di Daftar */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    ✍️ Kerusakan Lainnya / Manual (Jika tidak ada pada pilihan di atas):
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputManualText}
                      onChange={(e) => setInputManualText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddManual();
                        }
                      }}
                      placeholder="Ketik kerusakan lainnya, lalu klik Tambah..."
                      className="flex-1 p-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddManual}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                    >
                      + Tambah
                    </button>
                  </div>

                  {customKerusakanList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {customKerusakanList.map(text => (
                        <span
                          key={text}
                          className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
                        >
                          <span>{text}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveManual(text)}
                            className="text-red-600 hover:text-red-900 font-black text-xs cursor-pointer ml-1"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Catatan Tambahan Posisi / Detail Tambahan */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Catatan Tambahan Lokasi / Keterangan Posisi (Opsional)
              </label>
              <textarea 
                name="catatanTambahan" 
                value={formData.catatanTambahan} 
                onChange={handleChange} 
                rows={2} 
                placeholder="Contoh: Roda depan kiri aus parah, kait gandengan aus, unit tertahan di line..." 
                className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium bg-white focus:ring-2 focus:ring-red-600 outline-none"
              ></textarea>
            </div>
          </div>

          {/* Submit Action Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-red-700 hover:bg-red-800 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-red-900/20 transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Menyimpan ke Sistem Workshop...</span>
              </>
            ) : (
              '💾 Simpan Laporan Kerusakan Daisha'
            )}
          </button>
        </form>
      </div>

      {/* Interactive Feedback Modal */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        detail={feedback.detail}
        onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}