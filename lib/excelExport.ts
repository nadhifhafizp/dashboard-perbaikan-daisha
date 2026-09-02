import * as XLSX from 'xlsx';
import { Ticket } from '@/types/ticket';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';
import { formatDisplayDate } from '@/lib/date';

/**
 * Ekspor data tiket ke file Excel (.xlsx) dengan struktur profesional 3 Sheet:
 * 1. Sheet "Rincian_Per_Titik_Rusak": Multi-kerusakan dipecah menjadi beberapa baris ke bawah (1 baris = 1 titik kerusakan & tindakan lengkap dengan jumlah/Qty pcs)
 * 2. Sheet "Rekap_Per_Tiket_Unit": Rekap per tiket Daisha dengan total pcs part ganti & repair
 * 3. Sheet "Kebutuhan_Suku_Cadang": Ringkasan total kebutuhan sparepart pengganti (Ganti Baru) & beban servis (Repair) per item
 */
export function exportTicketsToExcel(tickets: Ticket[], filePrefix = 'Rekap_Perbaikan_Daisha') {
  if (!tickets || tickets.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const wb = XLSX.utils.book_new();

  // 1. DATA SHEET 1: Rincian Kerusakan Per Titik (Multi-baris ke bawah dengan Qty)
  interface RincianRow {
    'No': number;
    'ID Tiket': string;
    'No Daisha': string;
    'Ukuran Daisha': string;
    'Nama Daisha': string;
    'Seksi': string;
    'Komponen Kerusakan': string;
    'Detail Gejala': string;
    'Jumlah (Qty)': number;
    'Satuan': string;
    'Jenis Tindakan': string;
    'Status Tiket': string;
    'Nama Pelapor': string;
    'Waktu Masuk': string;
    'Waktu Selesai': string;
  }

  const rincianRows: RincianRow[] = [];
  let counter = 1;

  for (const t of tickets) {
    const parsed = parseTicketDamageDetail(t.detail);
    const sizeLabel = detectDaishaSize(t.noDaisha)?.label || '-';

    if (parsed.items.length > 0) {
      // Jika memiliki multi-kerusakan, pecah menjadi baris tersendiri untuk tiap kerusakan
      parsed.items.forEach((item) => {
        rincianRows.push({
          'No': counter++,
          'ID Tiket': String(t.idTiketAsli || t.noTiket || t.id),
          'No Daisha': t.noDaisha,
          'Ukuran Daisha': sizeLabel,
          'Nama Daisha': t.namaDaisha,
          'Seksi': t.seksi,
          'Komponen Kerusakan': item.komponen !== 'Umum' ? item.komponen : (t.jenisKerusakan || 'Umum'),
          'Detail Gejala': item.gejala,
          'Jumlah (Qty)': item.qty || 1,
          'Satuan': 'pcs',
          'Jenis Tindakan': item.tindakan || 'Repair',
          'Status Tiket': t.status,
          'Nama Pelapor': t.pelapor,
          'Waktu Masuk': formatDisplayDate(t.tglMasuk),
          'Waktu Selesai': formatDisplayDate(t.tglKeluar),
        });
      });
    } else {
      // Fallback jika tidak ada rincian spesifik
      rincianRows.push({
        'No': counter++,
        'ID Tiket': String(t.idTiketAsli || t.noTiket || t.id),
        'No Daisha': t.noDaisha,
        'Ukuran Daisha': sizeLabel,
        'Nama Daisha': t.namaDaisha,
        'Seksi': t.seksi,
        'Komponen Kerusakan': t.jenisKerusakan && t.jenisKerusakan !== '-' ? t.jenisKerusakan : 'Umum',
        'Detail Gejala': t.detail && t.detail !== '-' ? t.detail : 'Kerusakan umum',
        'Jumlah (Qty)': 1,
        'Satuan': 'pcs',
        'Jenis Tindakan': 'Repair',
        'Status Tiket': t.status,
        'Nama Pelapor': t.pelapor,
        'Waktu Masuk': formatDisplayDate(t.tglMasuk),
        'Waktu Selesai': formatDisplayDate(t.tglKeluar),
      });
    }
  }

  const wsRincian = XLSX.utils.json_to_sheet(rincianRows);

  // Atur lebar kolom untuk Sheet Rincian (sampai Waktu Selesai)
  wsRincian['!cols'] = [
    { wch: 6 },  // No
    { wch: 22 }, // ID Tiket
    { wch: 12 }, // No Daisha
    { wch: 14 }, // Ukuran Daisha
    { wch: 22 }, // Nama Daisha
    { wch: 14 }, // Seksi
    { wch: 24 }, // Komponen Kerusakan
    { wch: 38 }, // Detail Gejala
    { wch: 13 }, // Jumlah (Qty)
    { wch: 8 },  // Satuan
    { wch: 16 }, // Jenis Tindakan
    { wch: 12 }, // Status Tiket
    { wch: 18 }, // Nama Pelapor
    { wch: 18 }, // Waktu Masuk
    { wch: 18 }, // Waktu Selesai
  ];

  XLSX.utils.book_append_sheet(wb, wsRincian, 'Rincian_Per_Titik_Rusak');

  // 2. DATA SHEET 2: Rekap Per Tiket Unit (sampai Waktu Selesai)
  const rekapRows = tickets.map((t, idx) => {
    const parsed = parseTicketDamageDetail(t.detail);
    return {
      'No': idx + 1,
      'ID Tiket': String(t.idTiketAsli || t.noTiket || t.id),
      'No Daisha': t.noDaisha,
      'Ukuran Daisha': detectDaishaSize(t.noDaisha)?.label || '-',
      'Nama Daisha': t.namaDaisha,
      'Seksi': t.seksi,
      'Total Titik Rusak': parsed.items.length || 1,
      'Total Pcs Komponen': parsed.totalQtyAll || 1,
      'Total Ganti Baru (pcs)': parsed.totalQtyGanti,
      'Total Repair (pcs)': parsed.totalQtyRepair,
      'Komponen Terkait': t.jenisKerusakan && t.jenisKerusakan !== '-' ? t.jenisKerusakan : 'Umum',
      'Rincian Seluruh Gejala': t.detail && t.detail !== '-' ? t.detail : '-',
      'Status Tiket': t.status,
      'Nama Pelapor': t.pelapor,
      'Waktu Masuk': formatDisplayDate(t.tglMasuk),
      'Waktu Selesai': formatDisplayDate(t.tglKeluar),
    };
  });

  const wsRekap = XLSX.utils.json_to_sheet(rekapRows);

  wsRekap['!cols'] = [
    { wch: 6 },  // No
    { wch: 22 }, // ID Tiket
    { wch: 12 }, // No Daisha
    { wch: 14 }, // Ukuran Daisha
    { wch: 22 }, // Nama Daisha
    { wch: 14 }, // Seksi
    { wch: 16 }, // Total Titik
    { wch: 18 }, // Total Pcs
    { wch: 20 }, // Total Ganti Baru (pcs)
    { wch: 18 }, // Total Repair (pcs)
    { wch: 28 }, // Komponen
    { wch: 45 }, // Rincian Seluruh Gejala
    { wch: 12 }, // Status
    { wch: 18 }, // Pelapor
    { wch: 18 }, // Masuk
    { wch: 18 }, // Selesai
  ];

  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap_Per_Tiket_Unit');

  // 3. DATA SHEET 3: Rekap Kebutuhan Sparepart (Material Planning & Gudang)
  interface SparepartAgg {
    komponen: string;
    gejala: string;
    qtyGanti: number;
    qtyRepair: number;
    totalPcs: number;
    ticketIds: Set<string>;
  }

  const partMap: Record<string, SparepartAgg> = {};

  for (const t of tickets) {
    const parsed = parseTicketDamageDetail(t.detail);
    const id = String(t.idTiketAsli || t.noTiket || t.id);

    for (const item of parsed.items) {
      const key = `${item.komponen}:::${item.gejala}`;
      if (!partMap[key]) {
        partMap[key] = {
          komponen: item.komponen !== 'Umum' ? item.komponen : (t.jenisKerusakan || 'Umum'),
          gejala: item.gejala,
          qtyGanti: 0,
          qtyRepair: 0,
          totalPcs: 0,
          ticketIds: new Set<string>(),
        };
      }

      if (item.tindakan === 'Ganti') {
        partMap[key].qtyGanti += item.qty || 1;
      } else {
        partMap[key].qtyRepair += item.qty || 1;
      }
      partMap[key].totalPcs += item.qty || 1;
      partMap[key].ticketIds.add(id);
    }
  }

  const sparepartRows = Object.values(partMap)
    .sort((a, b) => b.qtyGanti - a.qtyGanti || b.totalPcs - a.totalPcs)
    .map((p, idx) => ({
      'No': idx + 1,
      'Komponen': p.komponen,
      'Detail Kerusakan / Gejala': p.gejala,
      'Perlu Ganti Baru (pcs)': p.qtyGanti,
      'Perlu Repair (pcs)': p.qtyRepair,
      'Total Kebutuhan (pcs)': p.totalPcs,
      'Jumlah Tiket Terkena': p.ticketIds.size,
    }));

  const wsSparepart = XLSX.utils.json_to_sheet(sparepartRows);

  wsSparepart['!cols'] = [
    { wch: 6 },  // No
    { wch: 26 }, // Komponen
    { wch: 38 }, // Detail Kerusakan
    { wch: 22 }, // Perlu Ganti Baru (pcs)
    { wch: 18 }, // Perlu Repair (pcs)
    { wch: 22 }, // Total Kebutuhan (pcs)
    { wch: 20 }, // Jumlah Tiket Terkena
  ];

  XLSX.utils.book_append_sheet(wb, wsSparepart, 'Kebutuhan_Suku_Cadang');

  // 4. Simpan dan unduh file .xlsx ke perangkat pengguna
  const nowStr = new Date().toISOString().slice(0, 10);
  const fileName = `${filePrefix}_${nowStr}.xlsx`;

  try {
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Download via Blob failed, fallback to XLSX.writeFile:', err);
    XLSX.writeFile(wb, fileName);
  }
}
