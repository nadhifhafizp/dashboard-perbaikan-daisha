'use client';

import React, { useState, useEffect } from 'react';

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
  const [formData, setFormData] = useState({
    waktuMasuk: '', namaPelapor: '', seksi: '', jenisDaisha: '', noDaisha: '', jenisKerusakan: '', detailKerusakan: ''
  });

  const [pilihanDaishaTersedia, setPilihanDaishaTersedia] = useState<string[]>([]);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormData(prev => ({ ...prev, waktuMasuk: now.toISOString().slice(0, 16) }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'seksi') {
      setPilihanDaishaTersedia(relasiSeksiDaisha[value] || []);
      setFormData({ ...formData, seksi: value, jenisDaisha: '' });
      const checkbox = document.getElementById('showAll') as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
    } 
    else if (name === 'showAll') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setPilihanDaishaTersedia(isChecked ? daftarSemuaDaisha : (relasiSeksiDaisha[formData.seksi] || []));
    } 
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Laporan Berhasil Disimpan!\n\nData: ${JSON.stringify(formData, null, 2)}`);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormData({
      waktuMasuk: now.toISOString().slice(0, 16), namaPelapor: '', seksi: '', jenisDaisha: '', noDaisha: '', jenisKerusakan: '', detailKerusakan: ''
    });
    setPilihanDaishaTersedia([]);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-gray-900 mb-1">Nomor Unit Daisha *</label><input type="text" name="noDaisha" value={formData.noDaisha} onChange={handleChange} placeholder="Contoh: DAI-01" required className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-bold bg-white outline-none uppercase" /></div>
            <div><label className="block text-sm font-bold text-gray-900 mb-1">Kategori Kerusakan Utama *</label><select name="jenisKerusakan" value={formData.jenisKerusakan} onChange={handleChange} required className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-medium bg-white outline-none"><option value="">-- Pilih Kerusakan --</option>{kategoriKerusakan.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-900 mb-1">Detail Kerusakan *</label>
            <textarea name="detailKerusakan" value={formData.detailKerusakan} onChange={handleChange} required rows={4} placeholder="Jelaskan secara spesifik..." className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-medium bg-white outline-none"></textarea>
          </div>
          <button type="submit" className="w-full py-3 bg-red-600 text-white font-extrabold rounded-lg shadow-md hover:bg-red-700 transition duration-200">
            Kirim Laporan Kerusakan
          </button>
        </form>
      </div>
    </div>
  );
}