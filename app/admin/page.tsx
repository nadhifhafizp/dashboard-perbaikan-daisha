'use client';

import React, { useState } from 'react';

const dataAwalAdmin = [
  { id: 1, tglMasuk: "2026-08-20 08:15", tglKeluar: "-", namaDaisha: "Battery car", noDaisha: "DAI-01", keluhan: "Body cover patah penyok", status: "Open", reason: "" },
  { id: 2, tglMasuk: "2026-08-21 07:45", tglKeluar: "-", namaDaisha: "Ply", noDaisha: "PLY-01", keluhan: "Bearing Roda Hancur", status: "Progress", reason: "Sedang dikerjakan teknisi" },
  { id: 3, tglMasuk: "2026-08-19 14:20", tglKeluar: "2026-08-20 10:00", namaDaisha: "Vertical", noDaisha: "VRT-12", keluhan: "Tag case bengkok", status: "Done", reason: "Sudah diluruskan dan dilas ulang" },
];

export default function AdminPage() {
  const [tickets, setTickets] = useState(dataAwalAdmin);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [formStatus, setFormStatus] = useState('');
  const [formReason, setFormReason] = useState('');

  const handleEdit = (ticket: any) => {
    setSelectedTicket(ticket); setFormStatus(ticket.status); setFormReason(ticket.reason || '');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    let updateTglKeluar = selectedTicket.tglKeluar;
    if (formStatus === 'Done' || formStatus === 'Scrap') {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      updateTglKeluar = now.toISOString().slice(0,16).replace('T', ' '); 
    } else if (formStatus === 'Open' || formStatus === 'Progress') {
      updateTglKeluar = '-'; 
    }
    const updatedTickets = tickets.map(t => t.id === selectedTicket.id ? { ...t, status: formStatus, reason: formReason, tglKeluar: updateTglKeluar } : t);
    setTickets(updatedTickets); setSelectedTicket(null);
    alert(`✅ Status berhasil diupdate!\nWaktu Keluar: ${updateTglKeluar}`);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-red-100 text-red-800 border-red-300';
      case 'Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Done': return 'bg-green-100 text-green-800 border-green-300';
      case 'Scrap': return 'bg-gray-800 text-white border-gray-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="mb-8 border-b border-gray-300 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">⚙️ Admin Panel - Tiket Perbaikan</h1>
        <p className="text-gray-700 font-medium mt-1">Kelola antrean perbaikan, ubah status, dan berikan catatan teknis.</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-300 flex flex-col h-full">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">📋 Daftar Request Perbaikan Aktif</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-900 border-y-2 border-gray-400">
                  <th className="p-3 text-sm font-bold uppercase tracking-wide">Waktu Masuk</th><th className="p-3 text-sm font-bold uppercase tracking-wide">Waktu Keluar</th><th className="p-3 text-sm font-bold uppercase tracking-wide">Unit Daisha</th><th className="p-3 text-sm font-bold uppercase tracking-wide">Status</th><th className="p-3 text-sm font-bold uppercase tracking-wide text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                    <td className="p-3 text-sm font-semibold text-gray-900">{t.tglMasuk}</td>
                    <td className="p-3 text-sm font-bold text-gray-600">{t.tglKeluar === '-' ? <span className="text-orange-600 italic font-medium">Belum Selesai</span> : t.tglKeluar}</td>
                    <td className="p-3 text-sm"><span className="font-extrabold text-gray-900">{t.namaDaisha}</span> <br/><span className="font-mono text-red-600 font-bold">{t.noDaisha}</span></td>
                    <td className="p-3 text-sm"><span className={`px-3 py-1 rounded-md text-xs font-bold border ${getStatusBadge(t.status)}`}>{t.status}</span></td>
                    <td className="p-3 text-sm text-center">
                      {t.status === 'Done' || t.status === 'Scrap' ? (
                        <div className="flex justify-center"><span className="px-3 py-1.5 bg-gray-100 text-gray-500 border border-gray-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-not-allowed">🔒 Final</span></div>
                      ) : (
                        <button onClick={() => handleEdit(t)} className="px-4 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold rounded-lg shadow transition-colors">Proses 🛠️</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300 h-fit sticky top-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">✏️ Form Update Pekerjaan</h2>
          {!selectedTicket ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <span className="text-4xl mb-3">👆</span><p className="text-sm text-gray-700 font-bold text-center">Pilih tombol "Proses" pada tabel di samping untuk memperbarui status tiket.</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-blue-800 uppercase tracking-wide">ID Tiket: #{selectedTicket.id}</span><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(selectedTicket.status)}`}>Current: {selectedTicket.status}</span></div>
                <p className="text-sm font-extrabold text-gray-900">{selectedTicket.namaDaisha} (<span className="text-red-600">{selectedTicket.noDaisha}</span>)</p>
                <p className="text-sm font-medium text-gray-800 mt-1"><span className="font-bold">Keluhan:</span> {selectedTicket.keluhan}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Ubah Status Menjadi *</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-red-500 outline-none bg-white">
                  <option value="Open" disabled={selectedTicket.status !== 'Open'}>🔴 Open (Belum Dikerjakan)</option><option value="Progress">🔵 Progress (Sedang Dikerjakan)</option><option value="Done">🟢 Done (Selesai Diperbaiki)</option><option value="Scrap">⚫ Scrap (Tidak Bisa Diperbaiki)</option>
                </select>
                <p className="text-[10px] text-gray-500 font-medium mt-1">*Catatan: Status Done/Scrap akan otomatis mengunci tiket ini.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Catatan / Tindakan Teknisi</label>
                <textarea value={formReason} onChange={(e) => setFormReason(e.target.value)} rows={4} className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-red-500 outline-none bg-white placeholder-gray-500" required={formStatus === 'Scrap'} placeholder="Contoh: Telah dilakukan pengelasan..."></textarea>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-lg shadow-md transition-colors">💾 Simpan & Perbarui Status</button>
                <button type="button" onClick={() => setSelectedTicket(null)} className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-lg transition-colors">Batal</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}