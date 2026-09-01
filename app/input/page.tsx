'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';

// Ganti URL panjang Power Automate dengan jalur internal Next.js ini:
const API_URL = "/api/repair";

const relasiSeksiDaisha: Record<string, string[]> = {
  'Bead': ['Bead Preset', 'Covering'],
  'Building': ['Transfer reproses', 'Vertical'],
  'Bunbury': ['Can Auto Pigmen', 'Can Chemical Omny', 'Daisha auto pigmen', 'Palet B/B'],
  'Cutt/Cal': ['Inner Liner', 'Omakitan (A-truck)', 'Omakitan (B-truck)', 'Ply', 'Reel Belt'],
  'Extruding': ['Box roll side', 'Box roll top', "Daisha Comp' Kiriage", 'Nagara Filler', 'Reel Filler', 'Reel Side', 'Reel Top', 'Transfer box roll'],
  'Polyfilm': ['Daisha chip polyfilm'],
  'All seksi': ['Battery car']
};

const daftarSeksi = Object.keys(relasiSeksiDaisha);
const daftarSemuaDaisha = Object.values(relasiSeksiDaisha).flat().sort();
const kategoriKerusakan = ['Roda Tetap', 'Roda Putar', 'Gandengan Depan', 'Gandengan Belakang', 'Tag Case', 'Brake Unit', 'Body frame', 'Lainnya'];

export default function InputKerusakanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    waktuMasuk: '', namaPelapor: '', seksi: '', jenisDaisha: '', noDaisha: '', jenisKerusakan: '', detailKerusakan: ''
  });

  const [pilihanDaishaTersedia, setPilihanDaishaTersedia] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State untuk kontrol Kamera Scanner
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormData(prev => ({ ...prev, waktuMasuk: now.toISOString().slice(0, 16) }));
  }, []);

  // Fungsi untuk Menyalakan Kamera Scanner
  const startScanner = async () => {
    setIsScanning(true);
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("reader-camera");
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: "environment" }, // Menggunakan kamera belakang HP
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            // Berhasil membaca barcode/QR
            setFormData(prev => ({ ...prev, noDaisha: decodedText }));
            stopScanner(); // Matikan kamera otomatis setelah berhasil scan
            alert(`✅ Barcode terbaca: ${decodedText}`);
          },
          () => {
            // Error abaikan (biar tidak spam console saat mencari fokus)
          }
        );
      } catch (err) {
        console.error("Gagal membuka kamera:", err);
        alert("Gagal membuka kamera. Pastikan izin kamera di browser sudah diaktifkan.");
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
      setPilihanDaishaTersedia(relasiSeksiDaisha[value] || []);
      setFormData(prev => ({ ...prev, seksi: value, jenisDaisha: '' }));
      const checkbox = document.getElementById('showAll') as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
    } 
    else if (name === 'showAll') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setPilihanDaishaTersedia(isChecked ? daftarSemuaDaisha : (relasiSeksiDaisha[formData.seksi] || []));
    } 
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payloadExcel = {
      action: "CREATE",
      idTiket: "TCK-" + Date.now(),
      waktuMasuk: formData.waktuMasuk,
      waktuKeluar: "-",
      status: "Open",
      namaPelapor: formData.namaPelapor,
      seksi: formData.seksi,
      namaDaisha: formData.jenisDaisha,
      noDaisha: formData.noDaisha,
      kategori: formData.jenisKerusakan,
      detail: formData.detailKerusakan
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadExcel),
      });

      if (response.ok) {
        alert("Laporan Kerusakan Berhasil Dikirim ke Excel Online!");
        router.push("/admin");
      } else {
        alert("Gagal mengirim laporan ke server.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center items-start">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl border border-gray-300">
        <div className="border-b border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Form Laporan Kerusakan Daisha</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-red-50 p-4 rounded-lg border border-red-100">
            <div><label className="block text-sm font-bold text-gray-900 mb-1">Waktu Kejadian *</label><input type="datetime-local" name="waktuMasuk" value={formData.waktuMasuk} onChange={handleChange} required className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-medium bg-white outline-none" /></div>
            <div><label className="block text-sm font-bold text-gray-900 mb-1">Nama Pelapor / NIK *</label><input type="text" name="namaPelapor" value={formData.namaPelapor} onChange={handleChange} placeholder="Contoh: Budi - 12345" required className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-medium bg-white outline-none" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-gray-900 mb-1">Seksi Pelapor *</label><select name="seksi" value={formData.seksi} onChange={handleChange} required className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-medium bg-white outline-none"><option value="">-- Pilih Seksi --</option>{daftarSeksi.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Jenis Daisha *</label>
              <select name="jenisDaisha" value={formData.jenisDaisha} onChange={handleChange} required disabled={!formData.seksi} className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-medium bg-white outline-none disabled:bg-gray-200">
                <option value="">{formData.seksi ? "-- Pilih Jenis Daisha --" : "Pilih Seksi Terlebih Dahulu"}</option>
                {pilihanDaishaTersedia.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="mt-2 flex items-center"><input type="checkbox" name="showAll" id="showAll" onChange={handleChange} className="mr-2" /><label htmlFor="showAll" className="text-xs text-gray-600 font-bold">Tampilkan semua jenis Daisha</label></div>
            </div>
          </div>

          {/* BAGIAN NOMOR UNIT & KAMERA SCANNER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Nomor Unit Daisha *</label>
              <input type="text" name="noDaisha" value={formData.noDaisha} onChange={handleChange} placeholder="Ketik Nomor (Bisa tembak scanner / scan kamera)" required className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-bold bg-white outline-none uppercase" />
            </div>
            <div>
              {!isScanning ? (
                <button type="button" onClick={startScanner} className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow transition flex items-center justify-center gap-2">
                  📷 Scan Barcode / QR Kamera
                </button>
              ) : (
                <button type="button" onClick={stopScanner} className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow transition">
                  ❌ Tutup Kamera
                </button>
              )}
            </div>
          </div>

          {/* Area Kotak Kamera (Hanya muncul saat tombol scan ditekan) */}
          {isScanning && (
            <div className="p-4 bg-gray-900 rounded-xl flex flex-col items-center">
              <div id="reader-camera" className="w-full max-w-sm rounded-lg overflow-hidden"></div>
              <p className="text-white text-xs mt-2 font-medium">Arahkan kamera ke barcode/QR unit Daisha...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-gray-900 mb-1">Kategori Kerusakan Utama *</label><select name="jenisKerusakan" value={formData.jenisKerusakan} onChange={handleChange} required className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-medium bg-white outline-none"><option value="">-- Pilih Kerusakan --</option>{kategoriKerusakan.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Detail Kerusakan *</label>
              <textarea name="detailKerusakan" value={formData.detailKerusakan} onChange={handleChange} required rows={2} placeholder="Jelaskan secara spesifik..." className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-medium bg-white outline-none"></textarea>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 text-white font-extrabold rounded-lg shadow-md hover:bg-red-700 transition duration-200 disabled:opacity-50">
            {loading ? "Mengirim Laporan..." : "Kirim Laporan Kerusakan"}
          </button>
        </form>
      </div>
    </div>
  );
}