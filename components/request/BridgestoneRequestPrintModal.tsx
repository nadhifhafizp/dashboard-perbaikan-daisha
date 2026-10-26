'use client';

import React from 'react';
import Image from 'next/image';
import { X, Printer, Check, ArrowRight, ShieldCheck, FileText, Download } from 'lucide-react';

export interface SectionRequestFull {
  id: number;
  nomorRequest: string;
  seksiPemohon: string;
  picPemohon: string;
  kontakPemohon?: string;
  namaBarang: string;
  spesifikasi?: string;
  jumlah: number;
  satuan: string;
  urgensi: string;
  catatan?: string;
  status: string;
  alasanTolak?: string;
  picBengkel?: string;
  estimasi?: string;
  catatanAdmin?: string;
  dibuatOleh: string;
  waktuDibuat: string;
  waktuUpdate: string;
  waktuSelesai?: string;
  // Official form fields
  perihal?: string;
  namaMachine?: string;
  tujuan?: string;
  alasan?: string;
  kodeSeksi?: string;
  drafter?: string;
  foreman?: string;
  keadaanSekarang?: string;
  fotoSebelum?: string;
  rencanaTindakan?: string;
  fotoSesudah?: string;
  targetHasil?: string;
  penjelasanPelaksanaan?: string;
  biayaEstimate?: string;
  biayaActual?: string;
  orangJamEstimate?: string;
  orangJamActual?: string;
  waktuEstimate?: string;
  waktuActual?: string;
  tglPelaksanaanEstimate?: string;
  tglPelaksanaanActual?: string;
  komentarEstimate?: string;
  komentarActual?: string;
  keputusan?: string;
  keputusan8210?: string;
  keputusan820?: string;
  hasilCheck?: string;
  hasilCheckPemohon?: string;
  schedulePlanning?: string;
  scheduleActual?: string;
  // Flowchart Workflow fields
  emailAtasanSeksi?: string;
  namaAtasanSeksi?: string;
  statusApprovalAtasanSeksi?: string;
  waktuApprovalAtasanSeksi?: string;
  catatanAtasanSeksi?: string;
  approvalToken?: string;
  emailMentorWorkshop?: string;
  statusApprovalAtasanSpecialProject?: string;
  waktuApprovalAtasanSpecialProject?: string;
  kebutuhanSparepart?: string;
  kebutuhanMaterial?: string;
  flowStep?: string;
  alasanPending?: string;
  materials?: Array<{
    id: number;
    namaKomponen: string;
    tipe?: string;
    qty: number;
    satuan?: string;
    dimensi?: string;
    keterangan?: string;
  }>;
}

interface BridgestoneRequestPrintModalProps {
  isOpen: boolean;
  requestData: SectionRequestFull | null;
  onClose: () => void;
}

const TUJUAN_OPTIONS = [
  'Safety',
  'Quality',
  'Peningkatan Produksi',
  'Cost Down',
  'Penambahan Produksi',
  'Lain-lain',
];

export default function BridgestoneRequestPrintModal({
  isOpen,
  requestData,
  onClose,
}: BridgestoneRequestPrintModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !requestData) return null;

  const formatDateIndo = (dStr?: string) => {
    if (!dStr) return '-';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dStr;
    }
  };

  const handlePrint = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoSrc = `${origin}/logo-bs.png`;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Pop-up browser diblokir. Izinkan pop-up untuk mencetak dokumen.');
      return;
    }

    const tujuanHTML = TUJUAN_OPTIONS.map((t) => {
      const isSelected =
        (requestData.tujuan || '').toLowerCase().includes(t.toLowerCase()) ||
        (t === 'Safety' && (requestData.tujuan || '').toLowerCase().includes('safety'));
      return isSelected
        ? `<strong style="text-decoration: underline; background: #e5e7eb; padding: 1px 4px; border-radius: 2px;">${t}</strong>`
        : `<span style="color: #4b5563;">${t}</span>`;
    }).join(', ');

    const fotoSebelumHTML = requestData.fotoSebelum
      ? `<img src="${requestData.fotoSebelum}" alt="Keadaan Sekarang" style="width: 100%; max-height: 190px; object-fit: contain; border: 1px solid #9ca3af; background: #fafafa; display: block; margin: 4px auto;" />`
      : `<div style="height: 120px; border: 1px dashed #9ca3af; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #6b7280; background: #f9fafb;">(Tidak ada foto terlampir)</div>`;

    const fotoSesudahHTML = requestData.fotoSesudah
      ? `<img src="${requestData.fotoSesudah}" alt="Rencana Tindakan" style="width: 100%; max-height: 190px; object-fit: contain; border: 1px solid #9ca3af; background: #fafafa; display: block; margin: 4px auto;" />`
      : `<div style="height: 120px; border: 1px dashed #9ca3af; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #6b7280; background: #f9fafb;">(Tidak ada foto terlampir)</div>`;

    const isGo = (requestData.keputusan || '').toUpperCase() === 'GO';
    const isPending = (requestData.keputusan || '').toUpperCase() === 'PENDING';
    const isReject = (requestData.keputusan || '').toUpperCase() === 'REJECT';

    const fullPrintHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>REQUEST - ${requestData.nomorRequest}</title>
<style>
  @page {
    size: A4 portrait;
    margin: 8mm 10mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;
    color: #000;
    background: #fff;
    font-size: 11px;
    line-height: 1.25;
  }
  .form-container {
    width: 100%;
    max-width: 190mm;
    margin: 0 auto;
    border: 2px solid #000;
    padding: 2px;
  }
  .table-box {
    width: 100%;
    border-collapse: collapse;
  }
  .table-box th, .table-box td {
    border: 1px solid #000;
    padding: 3px 5px;
    vertical-align: top;
  }
  .header-reg {
    font-size: 9px;
    font-weight: normal;
  }
  .main-title {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 2px;
    text-align: center;
    padding: 2px 0;
  }
  .logo-img {
    height: 24px;
    vertical-align: middle;
  }
  .bg-sub {
    background-color: #f3f4f6;
    font-weight: bold;
    text-align: center;
    font-size: 10px;
  }
  .badge-tag {
    display: inline-block;
    border: 1.5px solid #000;
    font-weight: bold;
    padding: 1px 6px;
    font-size: 10px;
    text-align: center;
  }
  .decision-box {
    display: inline-block;
    padding: 2px 6px;
    border: 1.5px solid #000;
    font-weight: bold;
    margin: 1px;
    font-size: 10px;
  }
  .decision-active {
    background: #000;
    color: #fff;
  }
  .asbes-notice {
    font-size: 9px;
    font-weight: bold;
    font-style: italic;
    text-align: center;
    padding: 4px;
    border-top: 1px solid #000;
    margin-top: 2px;
  }
  .signature-space {
    height: 38px;
  }
</style>
</head>
<body>
  <div class="form-container">
    <!-- Top Header -->
    <table class="table-box" style="border: none;">
      <tr style="border-bottom: 1px solid #000;">
        <td style="width: 55%; border: none;" class="header-reg">
          Regist. No. : ENG-KP-011 (2), Issue Date : 25 April 2012
        </td>
        <td style="width: 45%; text-align: right; border: none;">
          <div style="display: inline-flex; align-items: center; gap: 6px;">
            <img src="${logoSrc}" class="logo-img" alt="Bridgestone" onerror="this.style.display='none'" />
            <strong style="font-size: 14px; font-weight: 900; letter-spacing: 1px; color: #000;">BRIDGESTONE</strong>
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="2" class="main-title" style="border: none;">
          R E Q U E S T
        </td>
      </tr>
    </table>

    <!-- Routing / Seksi Box Header -->
    <table class="table-box" style="margin-top: 2px;">
      <tr>
        <!-- Tanggal & Req No -->
        <td style="width: 32%; vertical-align: middle;">
          <div style="font-size: 10.5px; margin-bottom: 4px;">
            <strong>TANGGAL :</strong> ${formatDateIndo(requestData.waktuDibuat)}
          </div>
          <div style="font-size: 10.5px;">
            <strong>REQ. NO. :</strong> <span style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: bold; font-feature-settings: 'tnum';">${requestData.nomorRequest}</span>
          </div>
        </td>

        <!-- Seksi Pemohon -->
        <td style="width: 33%; padding: 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: center;">
            <tr>
              <th colspan="3" class="bg-sub" style="border: none; border-bottom: 1px solid #000; padding: 2px;">Seksi Pemohon</th>
            </tr>
            <tr style="font-size: 9px; font-weight: bold; background: #fafafa;">
              <td style="width: 33%; border-right: 1px solid #000; padding: 2px;">DRAFTER</td>
              <td style="width: 33%; border-right: 1px solid #000; padding: 2px;">FOREMAN</td>
              <td style="width: 34%; padding: 2px;">${requestData.kodeSeksi || 'SEKSI'}</td>
            </tr>
            <tr class="signature-space">
              <td style="border-right: 1px solid #000; vertical-align: bottom; font-size: 8.5px; padding: 2px;">${requestData.drafter || requestData.picPemohon || ''}</td>
              <td style="border-right: 1px solid #000; vertical-align: bottom; font-size: 8.5px; padding: 2px;">${requestData.foreman || ''}</td>
              <td style="vertical-align: bottom; font-size: 8.5px; padding: 2px;">${requestData.seksiPemohon || ''}</td>
            </tr>
          </table>
        </td>

        <!-- Arrow -->
        <td style="width: 4%; text-align: center; vertical-align: middle; font-size: 16px; font-weight: bold;">
          &#10140;
        </td>

        <!-- Bengkel Prod. -->
        <td style="width: 31%; padding: 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: center;">
            <tr>
              <th colspan="3" class="bg-sub" style="border: none; border-bottom: 1px solid #000; padding: 2px;">Bengkel Prod.</th>
            </tr>
            <tr style="font-size: 9px; font-weight: bold; background: #fafafa;">
              <td style="width: 33%; border-right: 1px solid #000; padding: 2px;">PWS</td>
              <td style="width: 33%; border-right: 1px solid #000; padding: 2px;">K.SIE</td>
              <td style="width: 34%; padding: 2px;">MGR</td>
            </tr>
            <tr class="signature-space">
              <td style="border-right: 1px solid #000; vertical-align: bottom; font-size: 8.5px; padding: 2px;">${requestData.picBengkel || ''}</td>
              <td style="border-right: 1px solid #000; vertical-align: bottom; font-size: 8.5px; padding: 2px;">${requestData.keputusan8210 || ''}</td>
              <td style="vertical-align: bottom; font-size: 8.5px; padding: 2px;">${requestData.keputusan820 || ''}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Main Detail Table -->
    <table class="table-box" style="margin-top: -1px;">
      <tr>
        <td style="width: 50%;">
          <strong>PERIHAL :</strong> ${requestData.perihal || requestData.namaBarang || '-'}
        </td>
        <td style="width: 50%;">
          <strong>NAMA MACHINE :</strong> ${requestData.namaMachine || '-'}
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div style="flex: 1;">
              <strong>TUJUAN :</strong> ${tujuanHTML}
              <div style="margin-top: 3px;">
                <strong>(alasan) :</strong> ${requestData.alasan || requestData.spesifikasi || '-'}
              </div>
            </div>
            <div style="text-align: right; white-space: nowrap;">
              <span class="badge-tag">${(requestData.tujuan || 'SAFETY').toUpperCase()}</span>
              <span class="badge-tag" style="margin-left: 4px;">${(requestData.urgensi || 'Normal').toUpperCase()}</span>
              <span class="badge-tag" style="margin-left: 4px;">QTY: ${requestData.jumlah} ${requestData.satuan}</span>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="width: 50%;">
          <strong>SEKSI :</strong> ${requestData.seksiPemohon || '-'}
        </td>
        <td style="width: 50%;">
          <div style="display: flex; justify-content: space-between;">
            <span><strong>NAMA :</strong> ${requestData.picPemohon || requestData.drafter || '-'}</span>
            <span><strong>TELP. (Extension) :</strong> ${requestData.kontakPemohon || '-'}</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Keadaan Sekarang & Rencana Tindakan (Side by Side Photos) -->
    <table class="table-box" style="margin-top: -1px;">
      <tr>
        <!-- Left: Keadaan Sekarang -->
        <td style="width: 50%; padding: 4px;">
          <div style="font-weight: bold; margin-bottom: 2px;">Keadaan Sekarang :</div>
          <div style="font-size: 10px; min-height: 28px; color: #111;">
            ${requestData.keadaanSekarang || requestData.catatan || '(Belum ada uraian kondisi)'}
          </div>
          ${fotoSebelumHTML}
        </td>

        <!-- Right: Rencana Tindakan -->
        <td style="width: 50%; padding: 4px;">
          <div style="font-weight: bold; margin-bottom: 2px;">Rencana Tindakan :</div>
          <div style="font-size: 10px; min-height: 28px; color: #111;">
            ${requestData.rencanaTindakan || requestData.spesifikasi || '(Belum ada uraian rencana tindakan)'}
          </div>
          ${fotoSesudahHTML}
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <strong>Target Hasil : (Pcs/Day, Rp./Month, etc)</strong>
          <div style="font-size: 10.5px; padding-top: 2px;">
            ${requestData.targetHasil || '-'}
          </div>
        </td>
      </tr>
    </table>

    <!-- Penjelasan Pelaksanaan -->
    <table class="table-box" style="margin-top: -1px;">
      <tr>
        <td style="min-height: 38px;">
          <strong>Penjelasan tentang pelaksanaan : Evaluasi, Design, Pembelian Barang</strong>
          <div style="font-size: 10.5px; margin-top: 3px; min-height: 24px;">
            ${requestData.penjelasanPelaksanaan || requestData.catatanAdmin || '-'}
            ${requestData.kebutuhanSparepart ? `<br/><strong>Rencana Sparepart:</strong> ${requestData.kebutuhanSparepart}` : ''}
            ${requestData.kebutuhanMaterial ? `<br/><strong>Rencana Material:</strong> ${requestData.kebutuhanMaterial}` : ''}
            ${requestData.materials && requestData.materials.length > 0 ? `<div style="margin-top: 4px; font-size: 9.5px; padding-top: 2px; border-top: 1px dashed #ccc;"><strong>Realisasi Barang Terpakai:</strong> ${requestData.materials.map(m => `${m.namaKomponen} (${m.qty} ${m.satuan || 'Pcs'}${m.dimensi ? ` - ${m.dimensi}` : ''})`).join('; ')}</div>` : ''}
          </div>
        </td>
      </tr>
    </table>

    <!-- Evaluasi & Workflow Section -->
    <table class="table-box" style="margin-top: -1px;">
      <tr>
        <!-- Evaluasi Pekerjaan Table -->
        <td style="width: 40%; padding: 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 9.5px;">
            <tr>
              <th colspan="3" class="bg-sub" style="border: none; border-bottom: 1px solid #000; padding: 2px;">
                EVALUASI PEKERJAAN
              </th>
            </tr>
            <tr style="text-align: center; font-size: 9px; background: #fafafa;">
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; font-weight: bold; width: 40%;">ITEM</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; font-weight: bold; width: 30%;">ESTIMATE</td>
              <td style="border-bottom: 1px solid #000; font-weight: bold; width: 30%;">ACTUAL</td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2px;">Biaya</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2px; text-align: right;">${requestData.biayaEstimate || '-'}</td>
              <td style="border-bottom: 1px solid #000; padding: 2px; text-align: right;">${requestData.biayaActual || '-'}</td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2px;">Orang/Jam</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2px; text-align: right;">${requestData.orangJamEstimate || '-'}</td>
              <td style="border-bottom: 1px solid #000; padding: 2px; text-align: right;">${requestData.orangJamActual || '-'}</td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2px;">Waktu</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2px; text-align: right;">${requestData.waktuEstimate || '-'}</td>
              <td style="border-bottom: 1px solid #000; padding: 2px; text-align: right;">${requestData.waktuActual || '-'}</td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2px;">Tgl Pelaksanaan</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2px; text-align: right;">${requestData.tglPelaksanaanEstimate || '-'}</td>
              <td style="border-bottom: 1px solid #000; padding: 2px; text-align: right;">${requestData.tglPelaksanaanActual || '-'}</td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; padding: 2px;">Komentar</td>
              <td style="border-right: 1px solid #000; padding: 2px;">${requestData.komentarEstimate || '-'}</td>
              <td style="padding: 2px;">${requestData.komentarActual || '-'}</td>
            </tr>
          </table>
        </td>

        <!-- Arrow -->
        <td style="width: 3%; text-align: center; vertical-align: middle; font-size: 16px; font-weight: bold;">
          &#10140;
        </td>

        <!-- Keputusan 8210 / 820 -->
        <td style="width: 25%; padding: 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 9.5px;">
            <tr>
              <th colspan="2" class="bg-sub" style="border: none; border-bottom: 1px solid #000; padding: 2px;">
                KEPUTUSAN
              </th>
            </tr>
            <tr style="font-size: 9px; font-weight: bold; background: #fafafa;">
              <td style="width: 50%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2px;">8210</td>
              <td style="width: 50%; border-bottom: 1px solid #000; padding: 2px;">820</td>
            </tr>
            <tr style="height: 40px;">
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; vertical-align: bottom; font-size: 8px;">
                ${requestData.keputusan8210 || ''}
              </td>
              <td style="border-bottom: 1px solid #000; vertical-align: bottom; font-size: 8px;">
                ${requestData.keputusan820 || ''}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 4px; font-size: 9.5px;">
                <span class="decision-box ${isGo ? 'decision-active' : ''}">GO</span>
                <span class="decision-box ${isPending ? 'decision-active' : ''}">PENDING</span>
                <span class="decision-box ${isReject ? 'decision-active' : ''}">REJECT</span>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="font-size: 8px; color: #4b5563; padding: 2px; border-top: 1px dashed #000;">
                Selesai Bekerja &#10140; COPY KE SEKSI PEMOHON
              </td>
            </tr>
          </table>
        </td>

        <!-- Arrow -->
        <td style="width: 3%; text-align: center; vertical-align: middle; font-size: 16px; font-weight: bold;">
          &#10140;
        </td>

        <!-- Hasil Check & Schedule -->
        <td style="width: 29%; padding: 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 9.5px;">
            <tr>
              <th class="bg-sub" style="border: none; border-bottom: 1px solid #000; padding: 2px;">
                HASIL CHECK (Seksi Pemohon)
              </th>
            </tr>
            <tr>
              <td style="padding: 3px; border-bottom: 1px solid #000;">
                <div style="font-weight: bold; font-size: 8.5px;">Perbandingan Hasil : (Target VS Actual)</div>
                <div style="min-height: 24px; font-size: 9.5px; padding-top: 2px;">
                  ${requestData.hasilCheck || '-'}
                </div>
                <div style="text-align: right; font-size: 8px; color: #555;">
                  Checker: ${requestData.hasilCheckPemohon || '-'}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 2px; border-bottom: 1px solid #000; font-size: 8.5px;">
                <strong>SCHEDULE :</strong>
                <div>Planning: ${requestData.schedulePlanning || '-'}</div>
                <div>Actual: ${requestData.scheduleActual || '-'}</div>
              </td>
            </tr>
            <tr>
              <td style="font-size: 8px; text-align: center; padding: 2px;">
                Kembali 8210 &#10140; <strong>ORIGINAL FILE ENG.</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Asbes Disclaimer -->
    <div class="asbes-notice">
      Perhatian : Barang/Material yang dipergunakan di PT. Bridgestone Tire Indonesia tidak boleh mengandung ASBES
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

    printWin.document.open();
    printWin.document.write(fullPrintHTML);
    printWin.document.close();
  };

  const isGo = (requestData.keputusan || '').toUpperCase() === 'GO';
  const isPending = (requestData.keputusan || '').toUpperCase() === 'PENDING';
  const isReject = (requestData.keputusan || '').toUpperCase() === 'REJECT';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Modal Toolbar Header */}
        <div className="p-3.5 sm:p-4 px-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Dokumen Output Formulir Request Seksi</span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  ENG-KP-011 (2)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Pratinjau resmi standar formulir permohonan pembuatan/modifikasi Bridgestone
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container Preview (Accurate visual document) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/70">
          <div className="bg-white mx-auto shadow-md border-2 border-slate-900 p-3 sm:p-5 text-slate-900 text-xs font-sans max-w-3xl">
            {/* Top Registration & Logo */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-1.5">
              <span className="text-xs text-slate-600 font-mono">
                Regist. No. : ENG-KP-011 (2), Issue Date : 25 April 2012
              </span>
              <div className="flex items-center gap-1.5">
                <div className="relative w-5 h-5">
                  <Image src="/logo-bs.png" alt="BS" fill className="object-contain" />
                </div>
                <span className="font-black tracking-wider text-sm text-slate-900">BRIDGESTONE</span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center py-1">
              <h1 className="text-lg sm:text-xl font-black tracking-widest uppercase">R E Q U E S T</h1>
            </div>

            {/* Routing & Seksi Box */}
            <div className="grid grid-cols-12 border border-slate-900 text-xs mt-1">
              {/* Tanggal & No Req */}
              <div className="col-span-12 sm:col-span-4 p-2.5 border-b sm:border-b-0 sm:border-r border-slate-900 space-y-1">
                <div>
                  <span className="font-bold">TANGGAL : </span>
                  <span>{formatDateIndo(requestData.waktuDibuat)}</span>
                </div>
                <div>
                  <span className="font-bold">REQ. NO. : </span>
                  <span className="font-mono font-bold">{requestData.nomorRequest}</span>
                </div>
              </div>

              {/* Seksi Pemohon Signatures */}
              <div className="col-span-12 sm:col-span-4 p-0 border-b sm:border-b-0 sm:border-r border-slate-900">
                <div className="bg-slate-100 font-bold text-center py-1 border-b border-slate-900 text-xs">
                  Seksi Pemohon
                </div>
                <div className="grid grid-cols-3 text-center text-xs divide-x divide-slate-900 border-b border-slate-900 font-semibold bg-slate-50">
                  <div className="py-0.5">DRAFTER</div>
                  <div className="py-0.5">FOREMAN</div>
                  <div className="py-0.5">{requestData.kodeSeksi || '3122'}</div>
                </div>
                <div className="grid grid-cols-3 text-center text-xs divide-x divide-slate-900 h-11 items-end pb-1">
                  <div className="truncate px-1 font-medium">{requestData.drafter || requestData.picPemohon || '-'}</div>
                  <div className="truncate px-1 font-medium">{requestData.foreman || '-'}</div>
                  <div className="truncate px-1 font-medium">{requestData.seksiPemohon}</div>
                </div>
              </div>

              {/* Bengkel Prod */}
              <div className="col-span-12 sm:col-span-4 p-0">
                <div className="bg-slate-100 font-bold text-center py-1 border-b border-slate-900 text-xs">
                  Bengkel Prod.
                </div>
                <div className="grid grid-cols-3 text-center text-xs divide-x divide-slate-900 border-b border-slate-900 font-semibold bg-slate-50">
                  <div className="py-0.5">PWS</div>
                  <div className="py-0.5">K.SIE</div>
                  <div className="py-0.5">8210</div>
                </div>
                <div className="grid grid-cols-3 text-center text-xs divide-x divide-slate-900 h-11 items-end pb-1">
                  <div className="truncate px-1 font-medium">{requestData.picBengkel || '-'}</div>
                  <div className="truncate px-1 font-medium">{requestData.keputusan8210 || '-'}</div>
                  <div className="truncate px-1 font-medium">{requestData.keputusan820 || '-'}</div>
                </div>
              </div>
            </div>

            {/* Perihal & Nama Machine */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-x border-b border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 p-0 text-xs">
              <div className="p-2">
                <span className="font-bold">PERIHAL : </span>
                <span>{requestData.perihal || requestData.namaBarang || '-'}</span>
              </div>
              <div className="p-2">
                <span className="font-bold">NAMA MACHINE : </span>
                <span>{requestData.namaMachine || '-'}</span>
              </div>
            </div>

            {/* Tujuan, Alasan, Badges, Qty */}
            <div className="border-x border-b border-slate-900 p-2 text-xs space-y-1.5">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                  <span className="font-bold">TUJUAN : </span>
                  <span className="text-slate-700">
                    {TUJUAN_OPTIONS.map((t, idx) => {
                      const sel =
                        (requestData.tujuan || '').toLowerCase().includes(t.toLowerCase()) ||
                        (t === 'Safety' && (requestData.tujuan || '').toLowerCase().includes('safety'));
                      return (
                        <span key={t}>
                          {sel ? (
                            <strong className="underline underline-offset-2 font-bold text-slate-950 bg-slate-100 px-1 rounded">
                              {t}
                            </strong>
                          ) : (
                            <span>{t}</span>
                          )}
                          {idx < TUJUAN_OPTIONS.length - 1 ? ', ' : ''}
                        </span>
                      );
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <span className="border border-slate-900 font-bold px-2 py-0.5 rounded text-xs uppercase">
                    {requestData.tujuan || 'SAFETY'}
                  </span>
                  <span className="border border-slate-900 font-bold px-2 py-0.5 rounded text-xs uppercase">
                    {requestData.urgensi || 'NORMAL'}
                  </span>
                  <span className="border border-slate-900 font-bold px-2 py-0.5 rounded text-xs">
                    QTY: {requestData.jumlah} {requestData.satuan}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-bold">(alasan) : </span>
                <span>{requestData.alasan || requestData.spesifikasi || '-'}</span>
              </div>
            </div>

            {/* Seksi, Nama, Telp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 border-x border-b border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 p-0 text-xs">
              <div className="p-2">
                <span className="font-bold">SEKSI : </span>
                <span>{requestData.seksiPemohon}</span>
              </div>
              <div className="p-2">
                <span className="font-bold">NAMA : </span>
                <span>{requestData.picPemohon}</span>
              </div>
              <div className="p-2">
                <span className="font-bold">TELP. (Ext) : </span>
                <span>{requestData.kontakPemohon || '-'}</span>
              </div>
            </div>

            {/* Visual Condition: Keadaan Sekarang vs Rencana Tindakan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-x border-b border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 text-xs">
              {/* Kolom Kiri: Keadaan Sekarang */}
              <div className="p-2.5 space-y-2">
                <div className="font-bold text-slate-900">Keadaan Sekarang :</div>
                <p className="text-slate-800 text-xs leading-relaxed min-h-[32px]">
                  {requestData.keadaanSekarang || requestData.catatan || '(Belum ada penjelasan keadaan sekarang)'}
                </p>
                <div className="border border-slate-300 rounded bg-slate-50 min-h-[140px] flex items-center justify-center overflow-hidden">
                  {requestData.fotoSebelum ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={requestData.fotoSebelum}
                      alt="Keadaan Sekarang"
                      className="max-h-[180px] w-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">Tidak ada foto kondisi sekarang</span>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Rencana Tindakan */}
              <div className="p-2.5 space-y-2">
                <div className="font-bold text-slate-900">Rencana Tindakan :</div>
                <p className="text-slate-800 text-xs leading-relaxed min-h-[32px]">
                  {requestData.rencanaTindakan || requestData.spesifikasi || '(Belum ada rencana tindakan)'}
                </p>
                <div className="border border-slate-300 rounded bg-slate-50 min-h-[140px] flex items-center justify-center overflow-hidden">
                  {requestData.fotoSesudah ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={requestData.fotoSesudah}
                      alt="Rencana Tindakan"
                      className="max-h-[180px] w-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">Tidak ada foto rencana tindakan</span>
                  )}
                </div>
              </div>
            </div>

            {/* Target Hasil */}
            <div className="border-x border-b border-slate-900 p-2 text-xs">
              <span className="font-bold">Target Hasil : (Pcs/Day, Rp./Month, etc)</span>
              <p className="text-slate-800 mt-0.5">{requestData.targetHasil || '-'}</p>
            </div>

            {/* Penjelasan Pelaksanaan */}
            <div className="border-x border-b border-slate-900 p-2 text-xs">
              <span className="font-bold">Penjelasan tentang pelaksanaan : Evaluasi, Design, Pembelian Barang</span>
              <p className="text-slate-800 mt-1 min-h-[22px]">
                {requestData.penjelasanPelaksanaan || requestData.catatanAdmin || '-'}
              </p>
              {(requestData.kebutuhanSparepart || requestData.kebutuhanMaterial) && (
                <div className="mt-1.5 pt-1.5 border-t border-dashed border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {requestData.kebutuhanSparepart && (
                    <div>
                      <span className="font-semibold text-slate-700">Rencana Sparepart: </span>
                      <span className="text-slate-900">{requestData.kebutuhanSparepart}</span>
                    </div>
                  )}
                  {requestData.kebutuhanMaterial && (
                    <div>
                      <span className="font-semibold text-slate-700">Rencana Material: </span>
                      <span className="text-slate-900">{requestData.kebutuhanMaterial}</span>
                    </div>
                  )}
                </div>
              )}
              {requestData.materials && requestData.materials.length > 0 && (
                <div className="mt-1.5 pt-1 border-t border-dashed border-slate-300 text-xs text-slate-700">
                  <span className="font-bold">Realisasi Barang Terpakai: </span>
                  <span>
                    {requestData.materials.map(m => `${m.namaKomponen} (${m.qty} ${m.satuan || 'Pcs'}${m.dimensi ? ` - ${m.dimensi}` : ''})`).join('; ')}
                  </span>
                </div>
              )}
            </div>

            {/* Evaluasi, Keputusan & Hasil Check */}
            <div className="grid grid-cols-12 border-x border-b border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 text-xs">
              {/* Evaluasi Pekerjaan Table */}
              <div className="col-span-12 sm:col-span-5 p-0">
                <div className="bg-slate-100 font-bold text-center py-1 border-b border-slate-900">
                  EVALUASI PEKERJAAN
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-900 font-bold text-center">
                      <th className="p-1 border-r border-slate-900 w-2/5">ITEM</th>
                      <th className="p-1 border-r border-slate-900 w-3/10">ESTIMATE</th>
                      <th className="p-1 w-3/10">ACTUAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-1 border-r border-slate-900 font-medium">Biaya</td>
                      <td className="p-1 border-r border-slate-900 text-right">{requestData.biayaEstimate || '-'}</td>
                      <td className="p-1 text-right">{requestData.biayaActual || '-'}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-slate-900 font-medium">Orang/Jam</td>
                      <td className="p-1 border-r border-slate-900 text-right">{requestData.orangJamEstimate || '-'}</td>
                      <td className="p-1 text-right">{requestData.orangJamActual || '-'}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-slate-900 font-medium">Waktu</td>
                      <td className="p-1 border-r border-slate-900 text-right">{requestData.waktuEstimate || '-'}</td>
                      <td className="p-1 text-right">{requestData.waktuActual || '-'}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-slate-900 font-medium">Tgl Pelaksanaan</td>
                      <td className="p-1 border-r border-slate-900 text-right">{requestData.tglPelaksanaanEstimate || '-'}</td>
                      <td className="p-1 text-right">{requestData.tglPelaksanaanActual || '-'}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-slate-900 font-medium">Komentar</td>
                      <td className="p-1 border-r border-slate-900">{requestData.komentarEstimate || '-'}</td>
                      <td className="p-1">{requestData.komentarActual || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Keputusan GO/PENDING/REJECT */}
              <div className="col-span-12 sm:col-span-3 p-0 flex flex-col justify-between">
                <div>
                  <div className="bg-slate-100 font-bold text-center py-1 border-b border-slate-900">
                    KEPUTUSAN
                  </div>
                  <div className="grid grid-cols-2 text-center text-xs divide-x divide-slate-900 border-b border-slate-900 font-semibold bg-slate-50">
                    <div className="py-0.5">8210</div>
                    <div className="py-0.5">820</div>
                  </div>
                  <div className="grid grid-cols-2 text-center text-xs divide-x divide-slate-900 h-10 items-end pb-1 border-b border-slate-900">
                    <div className="truncate px-1">{requestData.keputusan8210 || '-'}</div>
                    <div className="truncate px-1">{requestData.keputusan820 || '-'}</div>
                  </div>
                  <div className="p-2 flex items-center justify-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 border border-slate-900 font-bold text-xs rounded ${
                        isGo ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      GO
                    </span>
                    <span
                      className={`px-2 py-0.5 border border-slate-900 font-bold text-xs rounded ${
                        isPending ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      PENDING
                    </span>
                    <span
                      className={`px-2 py-0.5 border border-slate-900 font-bold text-xs rounded ${
                        isReject ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      REJECT
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-center p-1 border-t border-dashed border-slate-300">
                  Selesai Bekerja &#10140; COPY KE SEKSI PEMOHON
                </div>
              </div>

              {/* Hasil Check & Schedule */}
              <div className="col-span-12 sm:col-span-4 p-0">
                <div className="bg-slate-100 font-bold text-center py-1 border-b border-slate-900">
                  HASIL CHECK
                </div>
                <div className="p-2 space-y-1.5 border-b border-slate-900">
                  <div className="font-bold text-xs">Perbandingan Hasil : (Target VS Actual)</div>
                  <p className="text-slate-800 text-xs min-h-[28px]">{requestData.hasilCheck || '-'}</p>
                  <div className="text-right text-xs text-slate-500">
                    Checker: <strong>{requestData.hasilCheckPemohon || '-'}</strong>
                  </div>
                </div>
                <div className="p-2 space-y-0.5 text-xs border-b border-slate-900">
                  <div className="font-bold">SCHEDULE :</div>
                  <div>Plan: {requestData.schedulePlanning || '-'}</div>
                  <div>Actual: {requestData.scheduleActual || '-'}</div>
                </div>
                <div className="text-center text-xs font-bold p-1 bg-slate-50">
                  Kembali 8210 &#10140; ORIGINAL FILE ENG.
                </div>
              </div>
            </div>

            {/* Asbestos Disclaimer */}
            <div className="text-center font-bold italic text-xs p-1.5 text-slate-700">
              Perhatian : Barang/Material yang dipergunakan di PT. Bridgestone Tire Indonesia tidak boleh mengandung ASBES
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 border-t border-slate-200 bg-white flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Status Sistem: <strong className="text-slate-800">{requestData.status}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
