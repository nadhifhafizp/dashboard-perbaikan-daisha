'use client';

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const initialInventory = [
  { id: 1, nama: "Roda Putar 6 inch", kategori: "Sparepart", stok: 24, satuan: "Pcs", tglUpdate: "2026-08-15" },
  { id: 2, nama: "Bearing 6204", kategori: "Sparepart", stok: 4, satuan: "Pcs", tglUpdate: "2026-08-18" },
  { id: 3, nama: "Besi Siku 4x4", kategori: "Material", stok: 15, satuan: "Batang", tglUpdate: "2026-08-10" },
  { id: 4, nama: "Kawat Las RB 2.6", kategori: "Material", stok: 2, satuan: "Kg", tglUpdate: "2026-08-20" },
  { id: 5, nama: "Cat Kuning", kategori: "Material", stok: 8, satuan: "Kaleng", tglUpdate: "2026-08-05" },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState(initialInventory);
  const [formData, setFormData] = useState({ nama: '', kategori: 'Sparepart', stok: '', satuan: 'Pcs' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddBarang = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: Date.now(), nama: formData.nama, kategori: formData.kategori, stok: parseInt(formData.stok) || 0,
      satuan: formData.satuan, tglUpdate: new Date().toISOString().split('T')[0]
    };
    setInventory([...inventory, newItem]);
    setFormData({ nama: '', kategori: 'Sparepart', stok: '', satuan: 'Pcs' });
    alert("✅ Barang berhasil ditambahkan ke Master Data!");
  };

  const updateStok = (id: number, perubahan: number) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        return { ...item, stok: Math.max(0, item.stok + perubahan), tglUpdate: new Date().toISOString().split('T')[0] };
      }
      return item;
    }));
  };

  const chartData = useMemo(() => {
    return [...inventory].sort((a, b) => a.stok - b.stok).slice(0, 7); 
  }, [inventory]);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="mb-8 border-b border-gray-300 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">📦 Master Data & Inventory</h1>
        <p className="text-gray-700 font-medium mt-1">Kelola stok sparepart dan material perbaikan Daisha secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">➕ Tambah Item Baru</h2>
          <form onSubmit={handleAddBarang} className="space-y-4">
            <div><label className="block text-sm font-bold text-gray-900 mb-1">Nama Barang *</label><input type="text" name="nama" value={formData.nama} onChange={handleChange} required placeholder="Cth: Roda Karet 4 inch" className="w-full p-2 border border-gray-400 rounded-lg text-sm text-gray-900 bg-white outline-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-gray-900 mb-1">Kategori *</label><select name="kategori" value={formData.kategori} onChange={handleChange} className="w-full p-2 border border-gray-400 rounded-lg text-sm text-gray-900 bg-white outline-none"><option value="Sparepart">Sparepart</option><option value="Material">Material</option></select></div>
              <div><label className="block text-sm font-bold text-gray-900 mb-1">Satuan *</label><select name="satuan" value={formData.satuan} onChange={handleChange} className="w-full p-2 border border-gray-400 rounded-lg text-sm text-gray-900 bg-white outline-none"><option value="Pcs">Pcs</option><option value="Set">Set</option><option value="Kg">Kg</option><option value="Batang">Batang</option><option value="Lembar">Lembar</option><option value="Kaleng">Kaleng</option></select></div>
            </div>
            <div><label className="block text-sm font-bold text-gray-900 mb-1">Stok Awal *</label><input type="number" name="stok" min="0" value={formData.stok} onChange={handleChange} required placeholder="0" className="w-full p-2 border border-gray-400 rounded-lg text-sm text-gray-900 bg-white outline-none" /></div>
            <button type="submit" className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-md transition-colors mt-2">💾 Simpan Barang</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-300">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">🚨 Visualisasi Stok Kritis (Terendah)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fill: '#374151' }} />
                <YAxis dataKey="nama" type="category" width={120} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#111827' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', color: '#111827' }} />
                <Bar dataKey="stok" radius={[0, 4, 4, 0]} name="Sisa Stok">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.stok <= 5 ? '#dc2626' : '#ea580c'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs font-bold text-red-600 mt-2 text-center">*Bar (Grafik) berwarna merah menandakan stok barang sudah menipis (≤ 5).</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">📋 Tabel Daftar Inventaris</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-900 border-y-2 border-gray-400">
                <th className="p-3 text-sm font-bold uppercase tracking-wide">Nama Barang</th><th className="p-3 text-sm font-bold uppercase tracking-wide">Kategori</th><th className="p-3 text-sm font-bold uppercase tracking-wide text-center">Sisa Stok</th><th className="p-3 text-sm font-bold uppercase tracking-wide text-center">Update Manual</th><th className="p-3 text-sm font-bold uppercase tracking-wide">Terakhir Update</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                  <td className="p-3 text-sm font-extrabold text-gray-900">{item.nama}</td>
                  <td className="p-3 text-sm"><span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${item.kategori === 'Sparepart' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-purple-100 text-purple-800 border-purple-300'}`}>{item.kategori}</span></td>
                  <td className="p-3 text-sm text-center"><span className={`text-lg font-black ${item.stok <= 5 ? 'text-red-600' : 'text-gray-900'}`}>{item.stok}</span> <span className="text-xs font-bold text-gray-600 ml-1">{item.satuan}</span></td>
                  <td className="p-3 text-sm text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button onClick={() => updateStok(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg border border-red-300">-</button>
                      <button onClick={() => updateStok(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 font-bold rounded-lg border border-green-300">+</button>
                    </div>
                  </td>
                  <td className="p-3 text-sm font-medium text-gray-600">{item.tglUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}