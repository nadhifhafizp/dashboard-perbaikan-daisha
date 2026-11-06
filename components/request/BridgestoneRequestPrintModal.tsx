'use client';

import React from 'react';
import Image from 'next/image';
import { X, Printer, Check, ArrowRight, ShieldCheck, FileText, Download } from 'lucide-react';
import { getSeksiCode } from '@/lib/nomorSurat';

export interface SectionRequestFull {
  id: number;
  nomorRequest: string;
  nomorSurat?: string | null;
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
  faktor?: string;
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
  emailManajerSeksi?: string;
  namaManajerSeksi?: string;
  statusApprovalAtasanSeksi?: string;
  statusApprovalManajerSeksi?: string;
  waktuApprovalAtasanSeksi?: string;
  waktuApprovalManajerSeksi?: string;
  catatanAtasanSeksi?: string;
  approvalToken?: string;
  emailMentorWorkshop?: string;
  statusApprovalAtasanSpecialProject?: string;
  waktuApprovalAtasanSpecialProject?: string;
  kebutuhanSparepart?: string;
  kebutuhanMaterial?: string;
  flowStep?: string;
  alasanPending?: string;
  ttdAtasanSeksi?: string;
  ttdDrafter?: string;
  ttdManajerSeksi?: string;
  ttdAdminWorkshop?: string;
  ttdSpvWorkshop?: string;
  ttdAtasanSpecialProject?: string;
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

export const FAKTOR_OPTIONS = [
  'Safety',
  'Environment',
  'Quality',
  'Cost',
  'Delivery',
] as const;

export const TUJUAN_OPTIONS = [...FAKTOR_OPTIONS];

function cleanPersonName(val?: string | null): string {
  if (!val) return '-';
  const trimmed = val.trim();
  if (
    trimmed.startsWith('Manager Special') ||
    trimmed.startsWith('Dept Head Special') ||
    trimmed === '8210' ||
    trimmed === '820' ||
    trimmed === '8236'
  ) {
    return '-';
  }
  return trimmed;
}

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

    const currentFaktors = (requestData.faktor || requestData.tujuan || 'Safety')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const faktorHTML = FAKTOR_OPTIONS.map((f) => {
      const isSelected = currentFaktors.some((cf) => cf === f.toLowerCase() || cf.includes(f.toLowerCase()));
      return isSelected
        ? `<strong style="text-decoration: underline; background: #e5e7eb; padding: 1px 5px; border-radius: 2px; border: 1px solid #64748b;">${f}</strong>`
        : `<span style="color: #4b5563;">${f}</span>`;
    }).join(' &nbsp;|&nbsp; ');

    const fotoSebelumHTML = requestData.fotoSebelum
      ? `<img src="${requestData.fotoSebelum}" alt="Keadaan Sekarang" style="width: 100%; max-height: 175px; min-height: 120px; object-fit: contain; border: 1px solid #9ca3af; background: #fafafa; display: block; margin: 3px auto;" />`
      : `<div style="height: 130px; border: 1.5px dashed #9ca3af; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 10.5px; color: #64748b; background: #fbfbfb; border-radius: 4px; gap: 3px;"><strong style="color: #475569;">(Area Foto / Sketsa Kondisi)</strong><span style="font-size: 8.5px; color: #94a3b8;">Belum ada foto terlampir</span></div>`;

    const fotoSesudahHTML = requestData.fotoSesudah
      ? `<img src="${requestData.fotoSesudah}" alt="Rencana Tindakan" style="width: 100%; max-height: 175px; min-height: 120px; object-fit: contain; border: 1px solid #9ca3af; background: #fafafa; display: block; margin: 3px auto;" />`
      : `<div style="height: 130px; border: 1.5px dashed #9ca3af; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 10.5px; color: #64748b; background: #fbfbfb; border-radius: 4px; gap: 3px;"><strong style="color: #475569;">(Area Foto / Sketsa Rencana)</strong><span style="font-size: 8.5px; color: #94a3b8;">Belum ada foto terlampir</span></div>`;

    const isGo = (requestData.keputusan || '').toUpperCase() === 'GO';
    const isPending = (requestData.keputusan || '').toUpperCase() === 'PENDING';
    const isReject = (requestData.keputusan || '').toUpperCase() === 'REJECT';

    const makePrintBadge = (isVerified: boolean, manualImg?: string | null) => {
      if (manualImg && manualImg.startsWith('data:image')) {
        return `<img src="${manualImg}" style="max-height: 44px; max-width: 90%; display: block; margin: 0 auto;" />`;
      }
      if (isVerified) {
        return `<div style="border: 1.5px solid #15803d; background: #f0fdf4; border-radius: 4px; padding: 3px 6px; text-align: center; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; min-width: 60px; margin: 0 auto;">
          <span style="font-size: 8.5px; font-weight: 800; color: #15803d; line-height: 1.1; letter-spacing: 0.4px;">&#10003; VERIFIED</span>
          <span style="font-size: 6.5px; font-weight: 700; color: #166534; font-family: monospace;">DIGITAL SIGN</span>
        </div>`;
      }
      return `<span style="font-size: 9px; color: #94a3b8; font-style: italic;">(Pending)</span>`;
    };

    const fullPrintHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>REQUEST - ${requestData.nomorRequest}</title>
<style>
  @page {
    size: A4 portrait;
    margin: 4mm 6mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;
    color: #000;
    background: #fff;
    font-size: 10.5px;
    line-height: 1.3;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .page-wrapper {
    width: 100%;
    max-width: 198mm;
    margin: 0 auto;
    box-sizing: border-box;
  }
  .outer-id {
    font-family: monospace;
    font-size: 10px;
    color: #475569;
    font-weight: 600;
    margin-bottom: 1.5mm;
    text-align: left;
  }
  .form-container {
    width: 100%;
    box-sizing: border-box;
    border: 2px solid #000;
    padding: 2mm 2.5mm;
    page-break-inside: avoid;
    break-inside: avoid;
    page-break-after: avoid;
  }
  .table-box {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .table-box th, .table-box td {
    border: 1px solid #000;
    padding: 3.5px 5px;
    vertical-align: top;
  }
  .header-reg {
    font-size: 9px;
    font-weight: normal;
  }
  .main-title {
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 3px;
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
    padding: 1.5px 5px;
    font-size: 9.5px;
    text-align: center;
  }
  .decision-box {
    display: inline-block;
    padding: 3px 8px;
    border: 1.5px solid #000;
    font-weight: bold;
    margin: 1.5px;
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
    padding: 3.5px;
    border-top: 1px solid #000;
    margin-top: 2px;
  }
  .signature-space {
    height: 48px;
  }
</style>
</head>
<body>
  <div class="page-wrapper">
    <div class="outer-id">
      ID: ${requestData.nomorRequest}
    </div>
    <div class="form-container">
      <!-- 1. Top Header -->
      <table class="table-box" style="border: none;">
        <tr style="border-bottom: 1px solid #000;">
          <td style="width: 50%; border: none; vertical-align: middle; padding-bottom: 2px; text-align: left;">
            <span style="font-size: 9px; color: #64748b;">PT BRIDGESTONE TIRE INDONESIA</span>
          </td>
          <td style="width: 50%; text-align: right; border: none; padding-bottom: 2px;">
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

      <!-- 2. Routing / Seksi Box Header -->
      <table class="table-box" style="margin-top: 2px;">
        <tr>
          <!-- Tanggal & Req No / Nomor Surat -->
          <td style="width: 32%; vertical-align: middle; padding: 5px 6px;">
            <div style="font-size: 11px; margin-bottom: 3.5px;">
              <strong>TANGGAL :</strong> ${formatDateIndo(requestData.waktuDibuat)}
            </div>
            <div style="font-size: 11px;">
              <strong>REQ. NO. :</strong> ${
                requestData.nomorSurat && !requestData.nomorSurat.startsWith('REQ-')
                  ? `<span style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; color: #b91c1c;">${requestData.nomorSurat}</span>`
                  : `<span style="font-style: italic; color: #64748b; font-size: 9.5px;">(Belum Terbit)</span>`
              }
            </div>
          </td>

          <!-- Seksi Pemohon & Special Project Approval Box -->
          <td style="width: 68%; padding: 0; vertical-align: top;">
            <table style="width: 100%; border-collapse: collapse; text-align: center;">
              <!-- Header Grup -->
              <tr>
                <th colspan="3" class="bg-sub" style="width: 50%; border: none; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2.5px; font-size: 10px; font-weight: bold;">
                  Seksi Pemohon
                </th>
                <th colspan="3" class="bg-sub" style="width: 50%; border: none; border-bottom: 1px solid #000; padding: 2.5px; font-size: 10px; font-weight: bold;">
                  Special Project
                </th>
              </tr>
              <!-- Baris 1: Jabatan -->
              <tr style="font-size: 9px; font-weight: bold; background: #fafafa; border-bottom: 1px solid #000;">
                <td style="width: 16.66%; border-right: 1px solid #000; padding: 2.5px 1px;">Staff</td>
                <td style="width: 16.66%; border-right: 1px solid #000; padding: 2.5px 1px;">Spv</td>
                <td style="width: 16.68%; border-right: 1px solid #000; padding: 2.5px 1px; font-size: 8.5px;">Manajer (${requestData.kodeSeksi || getSeksiCode(requestData.seksiPemohon)})</td>
                <td style="width: 16.66%; border-right: 1px solid #000; padding: 2.5px 1px;">Staff</td>
                <td style="width: 16.66%; border-right: 1px solid #000; padding: 2.5px 1px;">Spv</td>
                <td style="width: 16.68%; padding: 2.5px 1px; font-size: 8.5px;">Manajer (8236)</td>
              </tr>
              <!-- Baris 2: Tanda Tangan Digital Resmi -->
              <tr style="height: 48px; border-bottom: 1px solid #000; background: #ffffff;">
                <td style="border-right: 1px solid #000; vertical-align: middle; text-align: center; padding: 2px;">
                  ${makePrintBadge(Boolean(requestData.drafter || requestData.picPemohon), requestData.ttdDrafter)}
                </td>
                <td style="border-right: 1px solid #000; vertical-align: middle; text-align: center; padding: 2px;">
                  ${makePrintBadge(requestData.statusApprovalAtasanSeksi === 'APPROVED' || Boolean(requestData.ttdAtasanSeksi), requestData.ttdAtasanSeksi)}
                </td>
                <td style="border-right: 1px solid #000; vertical-align: middle; text-align: center; padding: 2px;">
                  ${makePrintBadge(requestData.statusApprovalManajerSeksi === 'APPROVED' || Boolean(requestData.ttdManajerSeksi), requestData.ttdManajerSeksi)}
                </td>
                <td style="border-right: 1px solid #000; vertical-align: middle; text-align: center; padding: 2px;">
                  ${makePrintBadge(Boolean(requestData.picBengkel || requestData.ttdAdminWorkshop || (requestData.flowStep && requestData.flowStep !== 'STEP_1_PENGAJUAN' && requestData.flowStep !== 'STEP_2_WAITING_ATASAN_SEKSI' && requestData.flowStep !== 'STEP_2B_WAITING_MANAJER_SEKSI')), requestData.ttdAdminWorkshop)}
                </td>
                <td style="border-right: 1px solid #000; vertical-align: middle; text-align: center; padding: 2px;">
                  ${makePrintBadge(Boolean(requestData.keputusan8210 || requestData.flowStep === 'STEP_6_DALAM_PENGERJAAN' || requestData.status === 'Dikerjakan' || requestData.status === 'Selesai'), requestData.ttdSpvWorkshop)}
                </td>
                <td style="vertical-align: middle; text-align: center; padding: 2px;">
                  ${makePrintBadge(Boolean(requestData.keputusan === 'GO' || requestData.ttdAtasanSpecialProject || requestData.flowStep === 'STEP_6_DALAM_PENGERJAAN' || requestData.status === 'Dikerjakan' || requestData.status === 'Selesai'), requestData.ttdAtasanSpecialProject)}
                </td>
              </tr>
              <!-- Baris 3: Nama Orangnya -->
              <tr style="font-size: 8px; font-weight: bold; background: #fafafa;">
                <td style="border-right: 1px solid #000; padding: 2px; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${requestData.drafter || requestData.picPemohon || '-'}
                </td>
                <td style="border-right: 1px solid #000; padding: 2px; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${requestData.foreman || requestData.namaAtasanSeksi || '-'}
                </td>
                <td style="border-right: 1px solid #000; padding: 2px; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${requestData.namaManajerSeksi || requestData.seksiPemohon || '-'}
                </td>
                <td style="border-right: 1px solid #000; padding: 2px; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${requestData.picBengkel || '-'}
                </td>
                <td style="border-right: 1px solid #000; padding: 2px; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${cleanPersonName(requestData.keputusan8210)}
                </td>
                <td style="padding: 2px; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${cleanPersonName(requestData.keputusan820)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- 3. Main Detail Table: Kotak-kotak Terpisah Rapi -->
      <table class="table-box" style="margin-top: -1px;">
        <tr>
          <td style="width: 50%; padding: 4px 6px;">
            <strong>PERIHAL :</strong> ${requestData.perihal || requestData.namaBarang || '-'}
          </td>
          <td style="width: 50%; padding: 4px 6px;">
            <strong>NAMA MACHINE :</strong> ${requestData.namaMachine || '-'}
          </td>
        </tr>
        <tr>
          <td style="width: 50%; vertical-align: top; padding: 4px 6px;">
            <strong>TUJUAN :</strong> ${requestData.tujuan || '-'}
          </td>
          <td style="width: 50%; vertical-align: top; padding: 4px 6px;">
            <strong>FAKTOR :</strong> ${faktorHTML}
          </td>
        </tr>
        <tr>
          <td style="width: 35%; padding: 4px 6px;">
            <strong>SEKSI :</strong> ${requestData.seksiPemohon || '-'}
          </td>
          <td style="width: 35%; padding: 4px 6px;">
            <div style="display: flex; justify-content: space-between;">
              <span><strong>NAMA :</strong> ${requestData.picPemohon || requestData.drafter || '-'}</span>
              <span><strong>TELP. (Ext) :</strong> ${requestData.kontakPemohon || '-'}</span>
            </div>
          </td>
          <td style="width: 30%; text-align: right; white-space: nowrap; padding: 4px 6px;">
            <span class="badge-tag">${(requestData.urgensi || 'Normal').toUpperCase()}</span>
            <span class="badge-tag" style="margin-left: 4px;">QTY: ${requestData.jumlah} ${requestData.satuan}</span>
          </td>
        </tr>
      </table>

      <!-- 4. Keadaan Sekarang, Rencana Tindakan & Target Hasil (Kolom Foto Lebih Lebar) -->
      <table class="table-box" style="margin-top: -1px;">
        <tr>
          <!-- Col 1: Keadaan Sekarang (Lebar 42%) -->
          <td style="width: 42%; padding: 5px; vertical-align: top;">
            <div style="font-weight: bold; margin-bottom: 2px; font-size: 10.5px;">Keadaan Sekarang :</div>
            <div style="font-size: 10px; min-height: 28px; color: #111; line-height: 1.35; margin-bottom: 3px;">
              ${requestData.keadaanSekarang || requestData.catatan || '(Belum ada uraian kondisi)'}
            </div>
            ${fotoSebelumHTML}
          </td>

          <!-- Col 2: Rencana Tindakan (Lebar 42%) -->
          <td style="width: 42%; padding: 5px; vertical-align: top;">
            <div style="font-weight: bold; margin-bottom: 2px; font-size: 10.5px;">Rencana Tindakan :</div>
            <div style="font-size: 10px; min-height: 28px; color: #111; line-height: 1.35; margin-bottom: 3px;">
              ${requestData.rencanaTindakan || requestData.spesifikasi || '(Belum ada uraian rencana tindakan)'}
            </div>
            ${fotoSesudahHTML}
          </td>

          <!-- Col 3: Target Hasil (Ramping 16%) -->
          <td style="width: 16%; padding: 5px 4px; vertical-align: top;">
            <div style="font-weight: bold; margin-bottom: 1px; font-size: 10px;">Target Hasil :</div>
            <div style="font-size: 8px; color: #64748b; margin-bottom: 4px; line-height: 1.1;">(Pcs/Day, Rp./Month, etc)</div>
            <div style="font-size: 9.5px; color: #111; line-height: 1.35; word-break: break-word;">
              ${requestData.targetHasil || '-'}
            </div>
          </td>
        </tr>
      </table>

      <!-- 5. Penjelasan Pelaksanaan -->
      <table class="table-box" style="margin-top: -1px;">
        <tr>
          <td style="min-height: 40px; padding: 5px 6px;">
            <strong>Penjelasan tentang pelaksanaan : Evaluasi, Design, Pembelian Barang</strong>
            <div style="font-size: 10.5px; margin-top: 3px; min-height: 24px; line-height: 1.35;">
              ${requestData.penjelasanPelaksanaan || requestData.catatanAdmin || '-'}
              ${requestData.kebutuhanSparepart ? `<br/><strong>Rencana Sparepart:</strong> ${requestData.kebutuhanSparepart}` : ''}
              ${requestData.kebutuhanMaterial ? `<br/><strong>Rencana Material:</strong> ${requestData.kebutuhanMaterial}` : ''}
              ${requestData.materials && requestData.materials.length > 0 ? `<div style="margin-top: 4px; font-size: 9.5px; padding-top: 2px; border-top: 1px dashed #ccc;"><strong>Realisasi Barang Terpakai:</strong> ${requestData.materials.map(m => `${m.namaKomponen} (${m.qty} ${m.satuan || 'Pcs'}${m.dimensi ? ` - ${m.dimensi}` : ''})`).join('; ')}</div>` : ''}
            </div>
          </td>
        </tr>
      </table>

      <!-- 6. Evaluasi & Keputusan Section -->
      <table class="table-box" style="margin-top: -1px;">
        <tr>
          <!-- Evaluasi Pekerjaan Table -->
          <td style="width: 55%; padding: 0; vertical-align: top;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 9.5px;">
              <tr>
                <th colspan="3" class="bg-sub" style="border: none; border-bottom: 1px solid #000; padding: 3px;">
                  EVALUASI PEKERJAAN
                </th>
              </tr>
              <tr style="text-align: center; font-size: 9px; background: #fafafa;">
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; font-weight: bold; width: 40%; padding: 2.5px;">ITEM</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; font-weight: bold; width: 30%; padding: 2.5px;">ESTIMATE</td>
                <td style="border-bottom: 1px solid #000; font-weight: bold; width: 30%; padding: 2.5px;">ACTUAL</td>
              </tr>
              <tr>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">Biaya</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px; text-align: right;">${requestData.biayaEstimate || '-'}</td>
                <td style="border-bottom: 1px solid #000; padding: 3px 5px; text-align: right;">${requestData.biayaActual || '-'}</td>
              </tr>
              <tr>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">Orang/Jam</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px; text-align: right;">${requestData.orangJamEstimate || '-'}</td>
                <td style="border-bottom: 1px solid #000; padding: 3px 5px; text-align: right;">${requestData.orangJamActual || '-'}</td>
              </tr>
              <tr>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">Waktu</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px; text-align: right;">${requestData.waktuEstimate || '-'}</td>
                <td style="border-bottom: 1px solid #000; padding: 3px 5px; text-align: right;">${requestData.waktuActual || '-'}</td>
              </tr>
              <tr>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">Tgl Pelaksanaan</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px; text-align: right;">${requestData.tglPelaksanaanEstimate || '-'}</td>
                <td style="border-bottom: 1px solid #000; padding: 3px 5px; text-align: right;">${requestData.tglPelaksanaanActual || '-'}</td>
              </tr>
              <tr>
                <td style="border-right: 1px solid #000; padding: 3px 5px;">Komentar</td>
                <td style="border-right: 1px solid #000; padding: 3px 5px;">${requestData.komentarEstimate || '-'}</td>
                <td style="padding: 3px 5px;">${requestData.komentarActual || '-'}</td>
              </tr>
            </table>
          </td>

          <!-- Arrow -->
          <td style="width: 6%; text-align: center; vertical-align: middle; font-size: 18px; font-weight: bold;">
            &#10140;
          </td>

          <!-- Keputusan 8210 / 820 -->
          <td style="width: 39%; padding: 0; vertical-align: top;">
            <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 9.5px;">
              <tr>
                <th colspan="2" class="bg-sub" style="border: none; border-bottom: 1px solid #000; padding: 3px;">
                  KEPUTUSAN
                </th>
              </tr>
              <tr style="font-size: 9px; font-weight: bold; background: #fafafa;">
                <td style="width: 50%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 2.5px;">Spv</td>
                <td style="width: 50%; border-bottom: 1px solid #000; padding: 2.5px;">Manajer (8236)</td>
              </tr>
              <tr style="height: 48px;">
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; vertical-align: bottom; font-size: 8.5px; padding: 2px;">
                  ${cleanPersonName(requestData.keputusan8210)}
                </td>
                <td style="border-bottom: 1px solid #000; vertical-align: bottom; font-size: 8.5px; padding: 2px;">
                  ${cleanPersonName(requestData.keputusan820)}
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 5px 4px; font-size: 10px;">
                  <span class="decision-box ${isGo ? 'decision-active' : ''}">GO</span>
                  <span class="decision-box ${isPending ? 'decision-active' : ''}">PENDING</span>
                  <span class="decision-box ${isReject ? 'decision-active' : ''}">REJECT</span>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="font-size: 8.5px; color: #4b5563; padding: 3.5px 2px; border-top: 1px dashed #000;">
                  Selesai Bekerja &#10140; COPY KE SEKSI PEMOHON
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- 7. Asbes Disclaimer -->
      <div class="asbes-notice">
        Perhatian : Barang/Material yang dipergunakan di PT. Bridgestone Tire Indonesia tidak boleh mengandung ASBES
      </div>
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
        <div className="p-3.5 sm:p-4 px-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Dokumen Output Formulir Request Seksi</span>
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/70 flex justify-center">
          <div className="w-full max-w-[210mm] box-border">
            {/* ID ditempatkan di luar kotak formulir per permintaan */}
            <div className="text-left font-mono text-[11px] font-semibold text-slate-500 mb-1 pl-0.5">
              ID: {requestData.nomorRequest}
            </div>

            <div className="printable-request-area bg-white shadow-xl border-2 border-slate-900 p-3 sm:p-5 text-slate-900 text-xs font-sans w-full min-h-[265mm] flex flex-col justify-between box-border">
              {/* Top Registration & Logo */}
              <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-1.5">
                <span className="text-[10px] text-slate-500 font-medium">PT BRIDGESTONE TIRE INDONESIA</span>
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
                  {requestData.nomorSurat && !requestData.nomorSurat.startsWith('REQ-') ? (
                    <span className="font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                      {requestData.nomorSurat}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-xs">
                      (Belum Terbit)
                    </span>
                  )}
                </div>
              </div>

              {/* Seksi Pemohon & Special Project Approval Box */}
              <div className="col-span-12 sm:col-span-8 p-0 flex flex-col justify-between">
                {/* Header Grup Seksi */}
                <div className="grid grid-cols-2 text-center text-xs font-bold divide-x divide-slate-900 bg-slate-100 border-b border-slate-900">
                  <div className="py-1">Seksi Pemohon</div>
                  <div className="py-1">Special Project</div>
                </div>

                {/* Baris 1: Jabatan */}
                <div className="grid grid-cols-6 text-center text-[10px] sm:text-[10.5px] font-bold divide-x divide-slate-900 bg-slate-50 border-b border-slate-900">
                  <div className="py-1 px-0.5 truncate">Staff</div>
                  <div className="py-1 px-0.5 truncate">Spv</div>
                  <div className="py-1 px-0.5 truncate leading-tight">
                    Manajer ({requestData.kodeSeksi || getSeksiCode(requestData.seksiPemohon)})
                  </div>
                  <div className="py-1 px-0.5 truncate">Staff</div>
                  <div className="py-1 px-0.5 truncate">Spv</div>
                  <div className="py-1 px-0.5 truncate leading-tight">Manajer (8236)</div>
                </div>

                {/* Baris 2: Tanda Tangan */}
                <div className="grid grid-cols-6 text-center divide-x divide-slate-900 h-14 bg-white">
                  <div className="h-full flex items-center justify-center p-1">
                    {renderPreviewSignBox(Boolean(requestData.drafter || requestData.picPemohon), requestData.ttdDrafter)}
                  </div>
                  <div className="h-full flex items-center justify-center p-1">
                    {renderPreviewSignBox(requestData.statusApprovalAtasanSeksi === 'APPROVED' || Boolean(requestData.ttdAtasanSeksi), requestData.ttdAtasanSeksi)}
                  </div>
                  <div className="h-full flex items-center justify-center p-1">
                    {renderPreviewSignBox(requestData.statusApprovalManajerSeksi === 'APPROVED' || Boolean(requestData.ttdManajerSeksi), requestData.ttdManajerSeksi)}
                  </div>
                  <div className="h-full flex items-center justify-center p-1">
                    {renderPreviewSignBox(Boolean(requestData.picBengkel || requestData.ttdAdminWorkshop || (requestData.flowStep && requestData.flowStep !== 'STEP_1_PENGAJUAN' && requestData.flowStep !== 'STEP_2_WAITING_ATASAN_SEKSI' && requestData.flowStep !== 'STEP_2B_WAITING_MANAJER_SEKSI')), requestData.ttdAdminWorkshop)}
                  </div>
                  <div className="h-full flex items-center justify-center p-1">
                    {renderPreviewSignBox(Boolean(requestData.keputusan8210 || requestData.flowStep === 'STEP_6_DALAM_PENGERJAAN' || requestData.status === 'Dikerjakan' || requestData.status === 'Selesai'), requestData.ttdSpvWorkshop)}
                  </div>
                  <div className="h-full flex items-center justify-center p-1">
                    {renderPreviewSignBox(Boolean(requestData.keputusan === 'GO' || requestData.ttdAtasanSpecialProject || requestData.flowStep === 'STEP_6_DALAM_PENGERJAAN' || requestData.status === 'Dikerjakan' || requestData.status === 'Selesai'), requestData.ttdAtasanSpecialProject)}
                  </div>
                </div>

                {/* Baris 3: Nama Orangnya */}
                <div className="grid grid-cols-6 text-center text-[9.5px] sm:text-[10px] font-semibold divide-x divide-slate-900 bg-slate-50 border-t border-slate-900">
                  <div className="py-1 px-1 truncate" title={requestData.drafter || requestData.picPemohon}>
                    {requestData.drafter || requestData.picPemohon || '-'}
                  </div>
                  <div className="py-1 px-1 truncate font-bold text-emerald-800" title={requestData.foreman || requestData.namaAtasanSeksi}>
                    {requestData.foreman || requestData.namaAtasanSeksi || '-'}
                  </div>
                  <div className="py-1 px-1 truncate font-bold text-emerald-800" title={requestData.namaManajerSeksi || requestData.seksiPemohon}>
                    {requestData.namaManajerSeksi || requestData.seksiPemohon || '-'}
                  </div>
                  <div className="py-1 px-1 truncate" title={requestData.picBengkel}>
                    {requestData.picBengkel || '-'}
                  </div>
                  <div className="py-1 px-1 truncate font-medium text-slate-800" title={cleanPersonName(requestData.keputusan8210)}>
                    {cleanPersonName(requestData.keputusan8210)}
                  </div>
                  <div className="py-1 px-1 truncate font-medium text-slate-800" title={cleanPersonName(requestData.keputusan820)}>
                    {cleanPersonName(requestData.keputusan820)}
                  </div>
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

            {/* Tujuan & Faktor (SEQCD) - Kotak Terpisah */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-x border-b border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 p-0 text-xs">
              <div className="p-2 space-y-1">
                <span className="font-bold">TUJUAN : </span>
                <span className="text-slate-800">{requestData.tujuan || '-'}</span>
              </div>
              <div className="p-2 space-y-1">
                <span className="font-bold">FAKTOR : </span>
                <span className="text-slate-700">
                  {FAKTOR_OPTIONS.map((f, idx) => {
                    const activeFaktors = (requestData.faktor || requestData.tujuan || 'Safety')
                      .split(',')
                      .map((s) => s.trim().toLowerCase())
                      .filter(Boolean);
                    const sel = activeFaktors.some((af) => af === f.toLowerCase() || af.includes(f.toLowerCase()));
                    return (
                      <span key={f}>
                        {sel ? (
                          <strong className="underline underline-offset-2 font-bold text-slate-950 bg-slate-200 px-1 py-0.5 rounded border border-slate-400">
                            {f}
                          </strong>
                        ) : (
                          <span className="text-slate-600">{f}</span>
                        )}
                        {idx < FAKTOR_OPTIONS.length - 1 ? ' | ' : ''}
                      </span>
                    );
                  })}
                </span>
              </div>
            </div>

            {/* Seksi, Nama, Telp & Qty / Urgensi */}
            <div className="grid grid-cols-1 sm:grid-cols-12 border-x border-b border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 p-0 text-xs">
              <div className="sm:col-span-4 p-2">
                <span className="font-bold">SEKSI : </span>
                <span>{requestData.seksiPemohon}</span>
              </div>
              <div className="sm:col-span-4 p-2 flex justify-between gap-1">
                <span><strong className="font-bold">NAMA : </strong>{requestData.picPemohon}</span>
                <span><strong className="font-bold">TELP. (Ext) : </strong>{requestData.kontakPemohon || '-'}</span>
              </div>
              <div className="sm:col-span-4 p-2 flex items-center justify-end gap-1.5 flex-wrap">
                <span className="border border-slate-900 font-bold px-2 py-0.5 rounded text-xs uppercase bg-slate-50">
                  {requestData.urgensi || 'NORMAL'}
                </span>
                <span className="border border-slate-900 font-bold px-2 py-0.5 rounded text-xs bg-slate-50">
                  QTY: {requestData.jumlah} {requestData.satuan}
                </span>
              </div>
            </div>

            {/* Visual Condition: Keadaan Sekarang vs Rencana Tindakan vs Target Hasil (Kolom Foto Lebih Lebar) */}
            <div className="grid grid-cols-1 md:grid-cols-12 border-x border-b border-slate-900 divide-y md:divide-y-0 md:divide-x divide-slate-900 text-xs">
              {/* Kolom 1: Keadaan Sekarang (Lebar 5 dari 12 cols = 41.7%) */}
              <div className="md:col-span-5 p-2.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-slate-900">Keadaan Sekarang :</div>
                  <p className="text-slate-800 text-xs leading-relaxed min-h-[32px] mt-1">
                    {requestData.keadaanSekarang || requestData.catatan || '(Belum ada penjelasan keadaan sekarang)'}
                  </p>
                </div>
                <div className="border border-slate-300 rounded bg-slate-50 min-h-[140px] flex items-center justify-center overflow-hidden">
                  {requestData.fotoSebelum ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={requestData.fotoSebelum}
                      alt="Keadaan Sekarang"
                      className="max-h-[220px] w-full object-contain p-1"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center gap-1">
                      <span className="font-semibold text-slate-600 text-xs">(Area Foto / Sketsa Kondisi)</span>
                      <span className="text-[11px] text-slate-400">Belum ada foto terlampir</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom 2: Rencana Tindakan (Lebar 5 dari 12 cols = 41.7%) */}
              <div className="md:col-span-5 p-2.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-slate-900">Rencana Tindakan :</div>
                  <p className="text-slate-800 text-xs leading-relaxed min-h-[32px] mt-1">
                    {requestData.rencanaTindakan || requestData.spesifikasi || '(Belum ada rencana tindakan)'}
                  </p>
                </div>
                <div className="border border-slate-300 rounded bg-slate-50 min-h-[140px] flex items-center justify-center overflow-hidden">
                  {requestData.fotoSesudah ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={requestData.fotoSesudah}
                      alt="Rencana Tindakan"
                      className="max-h-[220px] w-full object-contain p-1"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center gap-1">
                      <span className="font-semibold text-slate-600 text-xs">(Area Foto / Sketsa Rencana)</span>
                      <span className="text-[11px] text-slate-400">Belum ada foto terlampir</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom 3: Target Hasil (Ramping 2 dari 12 cols = 16.6%) */}
              <div className="md:col-span-2 p-2.5 space-y-1 flex flex-col">
                <div className="font-bold text-slate-900">Target Hasil :</div>
                <span className="text-[10px] text-slate-500 block">(Pcs/Day, Rp./Month, etc)</span>
                <p className="text-slate-800 text-xs leading-relaxed mt-1 whitespace-pre-wrap">
                  {requestData.targetHasil || '-'}
                </p>
              </div>
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

            {/* Evaluasi & Keputusan (Centered & Full Width) */}
            <div className="grid grid-cols-12 border-x border-b border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 text-xs">
              {/* Evaluasi Pekerjaan Table */}
              <div className="col-span-12 sm:col-span-7 p-0">
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
                      <td className="p-1.5 border-r border-slate-900 font-medium">Biaya</td>
                      <td className="p-1.5 border-r border-slate-900 text-right">{requestData.biayaEstimate || '-'}</td>
                      <td className="p-1.5 text-right">{requestData.biayaActual || '-'}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border-r border-slate-900 font-medium">Orang/Jam</td>
                      <td className="p-1.5 border-r border-slate-900 text-right">{requestData.orangJamEstimate || '-'}</td>
                      <td className="p-1.5 text-right">{requestData.orangJamActual || '-'}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border-r border-slate-900 font-medium">Waktu</td>
                      <td className="p-1.5 border-r border-slate-900 text-right">{requestData.waktuEstimate || '-'}</td>
                      <td className="p-1.5 text-right">{requestData.waktuActual || '-'}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border-r border-slate-900 font-medium">Tgl Pelaksanaan</td>
                      <td className="p-1.5 border-r border-slate-900 text-right">{requestData.tglPelaksanaanEstimate || '-'}</td>
                      <td className="p-1.5 text-right">{requestData.tglPelaksanaanActual || '-'}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border-r border-slate-900 font-medium">Komentar</td>
                      <td className="p-1.5 border-r border-slate-900">{requestData.komentarEstimate || '-'}</td>
                      <td className="p-1.5">{requestData.komentarActual || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Keputusan GO/PENDING/REJECT (Centered) */}
              <div className="col-span-12 sm:col-span-5 p-0 flex flex-col justify-between">
                <div>
                  <div className="bg-slate-100 font-bold text-center py-1 border-b border-slate-900">
                    KEPUTUSAN
                  </div>
                  <div className="grid grid-cols-2 text-center text-xs divide-x divide-slate-900 border-b border-slate-900 font-semibold bg-slate-50">
                    <div className="py-1">Spv</div>
                    <div className="py-1">Manajer (8236)</div>
                  </div>
                  <div className="grid grid-cols-2 text-center text-xs divide-x divide-slate-900 h-12 items-end pb-1 border-b border-slate-900">
                    <div className="truncate px-1 font-medium">{cleanPersonName(requestData.keputusan8210)}</div>
                    <div className="truncate px-1 font-medium">{cleanPersonName(requestData.keputusan820)}</div>
                  </div>
                  <div className="p-3 flex items-center justify-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 border border-slate-900 font-bold text-xs rounded ${
                        isGo ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      GO
                    </span>
                    <span
                      className={`px-3 py-1 border border-slate-900 font-bold text-xs rounded ${
                        isPending ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      PENDING
                    </span>
                    <span
                      className={`px-3 py-1 border border-slate-900 font-bold text-xs rounded ${
                        isReject ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      REJECT
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-center p-2 border-t border-dashed border-slate-300 font-medium">
                  Selesai Bekerja &#10140; COPY KE SEKSI PEMOHON
                </div>
              </div>
            </div>

            {/* Asbestos Disclaimer */}
            <div className="text-center font-bold italic text-xs p-1.5 text-slate-700">
              Perhatian : Barang/Material yang dipergunakan di PT. Bridgestone Tire Indonesia tidak boleh mengandung ASBES
            </div>
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

export function renderPreviewSignBox(isVerified: boolean, manualImg?: string | null) {
  if (manualImg && manualImg.startsWith('data:image')) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={manualImg} alt="TTD" className="max-h-12 max-w-full object-contain" />
    );
  }
  if (isVerified) {
    return (
      <div className="border border-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5 text-center inline-flex flex-col items-center justify-center shadow-2xs">
        <span className="text-[8px] font-black text-emerald-700 tracking-wider flex items-center gap-0.5">
          <span>✓</span> VERIFIED
        </span>
        <span className="text-[6px] font-mono font-bold text-emerald-800">
          DIGITAL SIGN
        </span>
      </div>
    );
  }
  return <span className="text-[8.5px] text-slate-400 italic font-mono">(Pending)</span>;
}
