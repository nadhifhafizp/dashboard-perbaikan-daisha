'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import * as XLSX from 'xlsx';

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

const STATUS_COLORS: Record<string, string> = {
  'Done': '#16a34a', 'Progress': '#2563eb', 'Open': '#dc2626', 'Scrap': '#475569'
};

const dataRaw = [
  { id: 1, pelapor: "Budi - 1001", tglMasuk: "2026-08-01 08:15", tglKeluar: "2026-08-02 14:00", status: "Done", namaDaisha: "Battery car", seksi: "All seksi", noDaisha: "DAI-01", jenisKerusakan: "Body cover", detail: "Patah" },
  { id: 2, pelapor: "Agus - 1002", tglMasuk: "2026-08-02 09:30", tglKeluar: "2026-08-03 10:00", status: "Done", namaDaisha: "Bead Preset", seksi: "Bead", noDaisha: "BP-14", jenisKerusakan: "Body frame", detail: "Retak" },
  { id: 3, pelapor: "Siti - 1023", tglMasuk: "2026-08-05 07:45", tglKeluar: "-", status: "Open", namaDaisha: "Ply", seksi: "Cutt/Cal", noDaisha: "PLY-01", jenisKerusakan: "Roda Putar", detail: "Hancur" },
  { id: 4, pelapor: "Joko - 1044", tglMasuk: "2026-08-05 10:00", tglKeluar: "2026-08-05 15:30", status: "Scrap", namaDaisha: "Vertical", seksi: "Building", noDaisha: "VRT-12", jenisKerusakan: "Chassis", detail: "Bengkok" },
  { id: 5, pelapor: "Budi - 1001", tglMasuk: "2026-08-10 13:15", tglKeluar: "-", status: "Progress", namaDaisha: "Battery car", seksi: "All seksi", noDaisha: "DAI-01", jenisKerusakan: "Gandengan", detail: "Kait aus" },
  { id: 6, pelapor: "Hendro - 1055", tglMasuk: "2026-08-12 08:00", tglKeluar: "-", status: "Open", namaDaisha: "Inner Liner", seksi: "Cutt/Cal", noDaisha: "IL-08", jenisKerusakan: "Roda Tetap", detail: "Karet habis" },
  { id: 7, pelapor: "Arif - 1088", tglMasuk: "2026-08-15 14:20", tglKeluar: "2026-08-16 09:00", status: "Done", namaDaisha: "Palet B/B", seksi: "Bunbury", noDaisha: "OMK-05", jenisKerusakan: "Brake Unit", detail: "Rem blong" },
  { id: 8, pelapor: "Siti - 1023", tglMasuk: "2026-08-15 16:00", tglKeluar: "-", status: "Progress", namaDaisha: "Ply", seksi: "Cutt/Cal", noDaisha: "PLY-01", jenisKerusakan: "Gandengan", detail: "Lepas" },
  { id: 9, pelapor: "Joko - 1044", tglMasuk: "2026-08-18 10:10", tglKeluar: "2026-08-19 11:00", status: "Done", namaDaisha: "Vertical", seksi: "Building", noDaisha: "VRT-15", jenisKerusakan: "Tag case", detail: "Penyok" },
  { id: 10, pelapor: "Wahyu - 1011", tglMasuk: "2026-08-20 07:30", tglKeluar: "-", status: "Open", namaDaisha: "Battery car", seksi: "All seksi", noDaisha: "DAI-01", jenisKerusakan: "Roda Putar", detail: "Macet total" },
];

export default function DashboardPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterSeksi, setFilterSeksi] = useState('');
  const [filterNamaDaisha, setFilterNamaDaisha] = useState('');
  const [filterJenisKerusakan, setFilterJenisKerusakan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchNoDaisha, setSearchNoDaisha] = useState('');
  
  const [pilihanDaishaTersedia, setPilihanDaishaTersedia] = useState<string[]>(daftarSemuaDaisha);
  const [showAllDaisha, setShowAllDaisha] = useState(false);

  const handleSeksiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilterSeksi(value);
    setFilterNamaDaisha(''); 
    if (value === '') setPilihanDaishaTersedia(daftarSemuaDaisha);
    else if (!showAllDaisha) setPilihanDaishaTersedia(relasiSeksiDaisha[value] || []);
  };

  const handleShowAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setShowAllDaisha(isChecked);
    if (isChecked || filterSeksi === '') setPilihanDaishaTersedia(daftarSemuaDaisha);
    else setPilihanDaishaTersedia(relasiSeksiDaisha[filterSeksi] || []);
  };

  const listJenisKerusakan = Array.from(new Set(dataRaw.map(d => d.jenisKerusakan)));

  const filteredData = useMemo(() => {
    return dataRaw.filter(item => {
      const itemDate = item.tglMasuk.split(' ')[0];
      const matchStart = startDate ? itemDate >= startDate : true;
      const matchEnd = endDate ? itemDate <= endDate : true;
      const matchSeksi = filterSeksi ? item.seksi === filterSeksi : true;
      const matchNama = filterNamaDaisha ? item.namaDaisha === filterNamaDaisha : true;
      const matchJenis = filterJenisKerusakan ? item.jenisKerusakan === filterJenisKerusakan : true;
      const matchStatus = filterStatus ? item.status === filterStatus : true;
      const matchUnit = searchNoDaisha ? item.noDaisha.toLowerCase().includes(searchNoDaisha.toLowerCase()) : true;
      return matchStart && matchEnd && matchSeksi && matchNama && matchJenis && matchStatus && matchUnit;
    });
  }, [startDate, endDate, filterSeksi, filterNamaDaisha, filterJenisKerusakan, filterStatus, searchNoDaisha]);

  const aggregateData = (data: any[], key: string) => {
    const counts = data.reduce<Record<string, number>>((acc, curr) => {
      const groupKey = String(curr[key]);
      acc[groupKey] = (acc[groupKey] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a: any, b: any) => b.value - a.value);
  };

  const chartDaishaSeksi = useMemo(() => {
    const counts = filteredData.reduce<Record<string, number>>((acc, curr) => {
      const label = `${curr.namaDaisha} (${curr.seksi})`;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a: any, b: any) => b.value - a.value).slice(0, 5); 
  }, [filteredData]);

  const dataTrenTanggal = useMemo(() => {
    const counts = filteredData.reduce<Record<string, number>>((acc, curr) => {
      const date = curr.tglMasuk.split(' ')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([tanggal, jumlah]) => ({ tanggal, jumlah })).sort((a: any, b: any) => a.tanggal.localeCompare(b.tanggal));
  }, [filteredData]);

  const chartSeksi = aggregateData(filteredData, 'seksi');
  const chartNamaDaishaOnly = aggregateData(filteredData, 'namaDaisha').slice(0, 5);
  const chartStatus = aggregateData(filteredData, 'status');

  const handleExport = () => {
    const dataUntukExcel = filteredData.map((row, index) => ({
      'No': index + 1, 'Waktu Masuk': row.tglMasuk, 'Nama Pelapor': row.pelapor, 'Waktu Keluar': row.tglKeluar, 'Nama Daisha': row.namaDaisha,
      'Seksi': row.seksi, 'No Unit': row.noDaisha, 'Jenis Kerusakan': row.jenisKerusakan, 'Status': row.status, 'Detail Kerusakan': row.detail
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataUntukExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Perbaikan");
    XLSX.writeFile(workbook, "Laporan_Daisha_BS.xlsx");
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-100">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Advanced Analytics Dashboard</h1>
          <p className="text-gray-700 font-medium mt-1">Pantau seluruh data perbaikan secara dinamis.</p>
        </div>
        <button onClick={handleExport} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-colors">
          Export Excel Data
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300 mb-8">
        <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b pb-2">Filter Data Komprehensif</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5 mb-4">
          <div className="flex flex-col"><label className="text-xs font-semibold text-gray-800 mb-1">Mulai Tgl</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 outline-none" /></div>
          <div className="flex flex-col"><label className="text-xs font-semibold text-gray-800 mb-1">Sampai Tgl</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 outline-none" /></div>
          <div className="flex flex-col"><label className="text-xs font-semibold text-gray-800 mb-1">Seksi</label><select value={filterSeksi} onChange={handleSeksiChange} className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 outline-none"><option value="">Semua Seksi</option>{daftarSeksi.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="flex flex-col"><label className="text-xs font-semibold text-gray-800 mb-1">Nama Daisha</label><select value={filterNamaDaisha} onChange={(e) => setFilterNamaDaisha(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 outline-none"><option value="">Semua Daisha</option>{pilihanDaishaTersedia.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
          <div className="flex flex-col"><label className="text-xs font-semibold text-gray-800 mb-1">Kategori Kerusakan</label><select value={filterJenisKerusakan} onChange={(e) => setFilterJenisKerusakan(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 outline-none"><option value="">Semua Jenis</option>{listJenisKerusakan.map(j => <option key={j as string} value={j as string}>{j as string}</option>)}</select></div>
          <div className="flex flex-col"><label className="text-xs font-semibold text-gray-800 mb-1">Status</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 outline-none"><option value="">Semua Status</option><option value="Open">Open</option><option value="Progress">Progress</option><option value="Done">Done</option><option value="Scrap">Scrap</option></select></div>
          <div className="flex flex-col"><label className="text-xs font-semibold text-gray-800 mb-1">Cari No Unit</label><input type="text" placeholder="Cth: DAI-01" value={searchNoDaisha} onChange={(e) => setSearchNoDaisha(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-500" /></div>
        </div>
        <div className="flex items-center"><input type="checkbox" id="showAllDashboard" checked={showAllDaisha} onChange={handleShowAllChange} className="mr-2 cursor-pointer" /><label htmlFor="showAllDashboard" className="text-xs text-gray-600 font-bold cursor-pointer">Tampilkan semua pilihan Nama Daisha di dropdown (Abaikan filter Seksi)</label></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white p-5 rounded-xl shadow border border-gray-200"><h2 className="text-base font-extrabold text-gray-900 mb-4">Tren Waktu Masuk Kerusakan Harian</h2><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={dataTrenTanggal}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" /><XAxis dataKey="tanggal" tick={{fontSize: 12, fill: '#374151'}} /><YAxis allowDecimals={false} tick={{fill: '#374151'}} /><RechartsTooltip contentStyle={{backgroundColor: '#fff', color: '#111827', borderColor: '#d1d5db'}} /><Line type="monotone" dataKey="jumlah" stroke="#dc2626" strokeWidth={3} dot={{ r: 5, fill: '#dc2626' }} name="Jumlah Tiket" /></LineChart></ResponsiveContainer></div></div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-200"><h2 className="text-base font-extrabold text-gray-900 mb-4">Proporsi Status Perbaikan</h2><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={{fill: '#111827', fontSize: 12, fontWeight: 'bold'}}>{chartStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />)}</Pie><RechartsTooltip /><Legend wrapperStyle={{ color: '#111827', paddingTop: '10px' }} /></PieChart></ResponsiveContainer></div></div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-200"><h2 className="text-base font-extrabold text-gray-900 mb-4">Top 5 Daisha & Seksi (Sering Rusak)</h2><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartDaishaSeksi} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" /><XAxis type="number" allowDecimals={false} tick={{fill: '#374151'}} /><YAxis dataKey="name" type="category" width={160} tick={{fontSize: 10, fontWeight: 'bold', fill: '#111827'}} /><RechartsTooltip /><Bar dataKey="value" fill="#b91c1c" radius={[0, 4, 4, 0]} name="Total Rusak" /></BarChart></ResponsiveContainer></div></div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-200"><h2 className="text-base font-extrabold text-gray-900 mb-4">Kerusakan Berdasarkan Seksi</h2><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartSeksi}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" /><XAxis dataKey="name" tick={{fontSize: 12, fill: '#374151'}} /><YAxis allowDecimals={false} tick={{fill: '#374151'}} /><RechartsTooltip /><Bar dataKey="value" fill="#ea580c" radius={[4, 4, 0, 0]} name="Total Rusak" /></BarChart></ResponsiveContainer></div></div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-200"><h2 className="text-base font-extrabold text-gray-900 mb-4">Top 5 Kategori Daisha Rusak</h2><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartNamaDaishaOnly} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" /><XAxis type="number" allowDecimals={false} tick={{fill: '#374151'}} /><YAxis dataKey="name" type="category" width={110} tick={{fontSize: 11, fill: '#111827', fontWeight: '500'}} /><RechartsTooltip /><Bar dataKey="value" fill="#ca8a04" radius={[0, 4, 4, 0]} name="Total" /></BarChart></ResponsiveContainer></div></div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-300">
        <h2 className="text-xl font-extrabold text-gray-900 mb-4 border-b pb-3">Raw Data Transaksi ({filteredData.length} Data)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-900 border-y-2 border-gray-400">
                <th className="p-3 text-sm font-bold uppercase tracking-wide">Waktu & Pelapor</th><th className="p-3 text-sm font-bold uppercase tracking-wide">Unit / Seksi</th><th className="p-3 text-sm font-bold uppercase tracking-wide">Jenis / Detail</th><th className="p-3 text-sm font-bold uppercase tracking-wide">Status / Tgl Keluar</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-100 transition duration-150">
                  <td className="p-3 text-sm"><span className="font-semibold text-gray-900">{row.tglMasuk}</span> <br/><span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mt-1">Pelapor: {row.pelapor}</span></td>
                  <td className="p-3 text-sm"><span className="font-extrabold text-red-700">{row.noDaisha}</span> <br/><span className="text-xs font-medium text-gray-700">{row.namaDaisha} ({row.seksi})</span></td>
                  <td className="p-3 text-sm"><span className="font-bold text-gray-900">{row.jenisKerusakan}</span> <br/><span className="text-xs font-medium text-gray-700">{row.detail}</span></td>
                  <td className="p-3 text-sm">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold border inline-block ${row.status === 'Done' ? 'bg-green-100 text-green-800 border-green-300' : row.status === 'Progress' ? 'bg-blue-100 text-blue-800 border-blue-300' : row.status === 'Scrap' ? 'bg-gray-800 text-white border-gray-900' : 'bg-red-100 text-red-800 border-red-300'}`}>{row.status}</span>
                    <div className="text-xs font-semibold text-gray-700 mt-2"><span className="text-gray-900">Keluar:</span> {row.tglKeluar}</div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (<tr><td colSpan={4} className="p-8 text-center text-gray-700 font-bold text-base bg-gray-50">Tidak ada data yang sesuai dengan filter.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}