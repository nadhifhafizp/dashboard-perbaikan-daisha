'use client';

import React, { useState, useEffect } from 'react';

// MASUKKAN URL POWER AUTOMATE KAMU DI SINI
const API_URL = "/api/repair";

export default function AdminPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [formStatus, setFormStatus] = useState('');
  const [formReason, setFormReason] = useState('');

  const getValue = (obj: any, possibleKeys: string[]) => {
    for (const key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null) return obj[key];
      const cleanKey = key.toLowerCase().replace(/[\s_]/g, "");
      const found = Object.keys(obj).find((k) => k.toLowerCase().replace(/[\s_]/g, "") === cleanKey);
      if (found && obj[found] !== undefined && obj[found] !== null) return obj[found];
    }
    return null;
  };

  const fetchTiket = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Gagal mengambil data server");

      const data = await response.json();
      const hasilData = data.value || data;

      if (Array.isArray(hasilData)) {
        const formattedData = hasilData
          .map((item, index) => {
            const idTiket = getValue(item, ["idTiket", "ID Tiket", "ticketId"]);
            const extractedNoDaisha = getValue(item, ["noDaisha", "No Daisha", "nomorDaisha", "noUnit"]) || "-";
            const extractedNamaDaisha = getValue(item, ["namaDaisha", "Nama Daisha", "daisha"]) || "-";

            return {
              id: idTiket || `temp-${index}`,
              noTiket: idTiket || "-",
              noDaisha: extractedNoDaisha,
              tglMasuk: getValue(item, ["waktuMasuk", "Waktu Masuk", "tanggalMasuk"]) || "-",
              tglKeluar: getValue(item, ["waktuKeluar", "Waktu Keluar", "tanggalKeluar"]) || "-",
              namaDaisha: extractedNamaDaisha,
              namaPelapor: getValue(item, ["namaPelapor", "Nama Pelapor", "pelapor"]) || "-",
              seksi: getValue(item, ["seksi", "Seksi", "section"]) || "-",
              kategori: getValue(item, ["kategori", "Kategori Kerusakan", "KategoriKerusakan", "jenisKerusakan", "jenis"]) || "-",
              detail: getValue(item, ["detail", "Detail Kerusakan", "DetailKerusakan", "keluhan", "deskripsi"]) || "-",
              reason: getValue(item, ["catatan", "Catatan Teknisi", "CatatanTeknisi", "keterangan"]) || "",
              status: getValue(item, ["status", "Status"]) || "Open"
            };
          })
          .filter(t => {
            const isInvalid = ["-", "", "id tiket", "idtiket"].includes(String(t.noTiket).toLowerCase().trim());
            return !isInvalid;
          });

        setTickets(formattedData);
      }
    } catch (error) {
      console.error("Error saat fetch tiket:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiket();
  }, []);

  const handleEdit = (ticket: any) => {
    setSelectedTicket(ticket); 
    setFormStatus(ticket.status); 
    setFormReason(ticket.reason || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    let updateTglKeluar = selectedTicket.tglKeluar;
    if (formStatus === 'Done' || formStatus === 'Scrap') {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      updateTglKeluar = now.toISOString().slice(0,16).replace('T', ' '); 
    } else if (formStatus === 'Open' || formStatus === 'Progress') {
      updateTglKeluar = '-'; 
    }

    // Menggunakan noTiket sebagai acuan Key Column ke Excel
    const payloadExcel = {
      action: "UPDATE",
      idTiket: selectedTicket.noTiket, 
      status: formStatus,
      waktuKeluar: updateTglKeluar,
      catatan: formReason
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadExcel),
      });

      if (response.ok) {
        alert("✅ Status & Catatan berhasil diupdate ke Excel!");
        setSelectedTicket(null);
        fetchTiket();
      } else {
        alert("❌ Gagal update ke server.");
      }
    } catch (error) {
      console.error("Error update:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (noTiket: string) => {
    if (!window.confirm(`Yakin ingin menghapus tiket ${noTiket} secara permanen?`)) return;
    
    setIsProcessing(true);
    const payloadExcel = {
      action: "DELETE",
      idTiket: noTiket // Acuan hapus baris di Excel tetap menggunakan nomor tiket
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadExcel),
      });

      if (response.ok) {
        alert("🗑️ Tiket berhasil dihapus dari Excel!");
        if (selectedTicket?.noTiket === noTiket) setSelectedTicket(null);
        fetchTiket();
      } else {
        alert("❌ Gagal menghapus tiket.");
      }
    } catch (error) {
      console.error("Error delete:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsProcessing(false);
    }
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
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        <div className="xl:col-span-3 bg-white p-6 rounded-xl shadow-md border border-gray-300 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-gray-900">📋 Daftar Request Perbaikan Aktif</h2>
            <button onClick={fetchTiket} disabled={loading || isProcessing} className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-700 transition">
              {loading ? "Memuat..." : "🔄 Refresh Data"}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-200 text-gray-900 border-y-2 border-gray-400">
                  <th className="p-3 text-sm font-bold uppercase tracking-wide">ID & Waktu</th>
                  <th className="p-3 text-sm font-bold uppercase tracking-wide">Pelapor & Seksi</th>
                  <th className="p-3 text-sm font-bold uppercase tracking-wide">Unit Daisha</th>
                  <th className="p-3 text-sm font-bold uppercase tracking-wide">Kategori & Detail</th>
                  <th className="p-3 text-sm font-bold uppercase tracking-wide">Status & Catatan</th>
                  <th className="p-3 text-sm font-bold uppercase tracking-wide text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10 font-bold text-gray-500">Menarik data dari server...</td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 font-bold text-gray-500">Belum ada data tiket.</td></tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                      <td className="p-3 text-sm">
                        <span className="font-mono text-xs font-bold text-gray-900 block">{t.noTiket}</span>
                        <span className="text-xs text-green-700 block mt-1">Masuk: {t.tglMasuk}</span>
                        <span className="text-xs text-red-600 block">Keluar: {t.tglKeluar === '-' ? 'Belum Selesai' : t.tglKeluar}</span>
                      </td>
                      <td className="p-3 text-sm text-gray-800"><span className="font-bold">{t.namaPelapor}</span><br /><span className="text-xs">{t.seksi}</span></td>
                      
                      {/* UNIT DAISHA: Nama di atas, No Unit di bawah */}
                      <td className="p-3 text-sm">
                        <span className="font-extrabold text-gray-900 block">{t.namaDaisha}</span>
                        <span className="font-mono text-xs text-blue-700 font-bold block mt-0.5">No: {t.noDaisha}</span>
                      </td>

                      <td className="p-3 text-sm max-w-50"><span className="font-bold text-gray-900 block">{t.kategori}</span><span className="text-xs text-gray-600 truncate block" title={t.detail}>{t.detail}</span></td>
                      <td className="p-3 text-sm max-w-50">
                        <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold border mb-1 ${getStatusBadge(t.status)}`}>{t.status}</span>
                        <span className="text-xs text-gray-600 truncate block" title={t.reason || "Belum ada catatan"}>{t.reason || <span className="italic text-gray-400">-</span>}</span>
                      </td>
                      <td className="p-3 text-sm text-center flex flex-col gap-1 items-center justify-center">
                        {t.status === 'Done' || t.status === 'Scrap' ? (
                          <div className="flex justify-center"><span className="px-3 py-1.5 bg-gray-100 text-gray-500 border border-gray-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-not-allowed">🔒 Final</span></div>
                        ) : (
                          <button onClick={() => handleEdit(t)} disabled={isProcessing} className="px-4 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold rounded-lg shadow transition-colors disabled:opacity-50">Proses 🛠️</button>
                        )}
                        <button onClick={() => handleDelete(t.noTiket)} disabled={isProcessing} className="px-4 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded shadow w-full transition-colors border border-red-300 disabled:opacity-50">
                          Hapus 🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-300 h-fit sticky top-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">✏️ Form Update Pekerjaan</h2>
          {!selectedTicket ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <span className="text-4xl mb-3">👆</span><p className="text-sm text-gray-700 font-bold text-center">Pilih tombol "Proses" pada tabel di samping untuk memperbarui status tiket.</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">ID: {selectedTicket.noTiket}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(selectedTicket.status)}`}>Current: {selectedTicket.status}</span>
                </div>
                <p className="text-sm font-extrabold text-gray-900">{selectedTicket.namaDaisha} <span className="font-mono text-xs text-blue-700">({selectedTicket.noDaisha})</span></p>
                <div className="mt-2 text-xs">
                  <p className="text-gray-800 font-medium"><span className="font-bold">Pelapor:</span> {selectedTicket.namaPelapor} ({selectedTicket.seksi})</p>
                  <p className="text-gray-800 font-medium mt-1"><span className="font-bold">Kategori:</span> {selectedTicket.kategori}</p>
                  <p className="text-gray-800 font-medium mt-1"><span className="font-bold">Detail:</span> {selectedTicket.detail}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Ubah Status Menjadi *</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-red-500 outline-none bg-white">
                  <option value="Open" disabled={selectedTicket.status !== 'Open'}>🔴 Open (Belum Dikerjakan)</option>
                  <option value="Progress" disabled={selectedTicket.status === 'Done' || selectedTicket.status === 'Scrap'}>🔵 Progress (Sedang Dikerjakan)</option>
                  <option value="Done" disabled={selectedTicket.status === 'Open'}>🟢 Done (Selesai Diperbaiki)</option>
                  <option value="Scrap" disabled={selectedTicket.status === 'Open'}>⚫ Scrap (Tidak Bisa Diperbaiki)</option>
                </select>
                <p className="text-[10px] text-gray-500 font-medium mt-1">*Catatan: Status yang sudah berjalan tidak bisa diturunkan kembali.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Catatan / Tindakan Teknisi</label>
                <textarea value={formReason} onChange={(e) => setFormReason(e.target.value)} rows={4} className="w-full p-2.5 border border-gray-400 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-red-500 outline-none bg-white placeholder-gray-500" required={formStatus === 'Scrap' || formStatus === 'Done'} placeholder="Contoh: Telah dilakukan pengelasan..."></textarea>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <button type="submit" disabled={isProcessing} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-lg shadow-md transition-colors disabled:opacity-50">
                  {isProcessing ? "Menyimpan Data..." : "💾 Simpan & Perbarui Status"}
                </button>
                <button type="button" onClick={() => setSelectedTicket(null)} disabled={isProcessing} className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-lg transition-colors">Batal</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}