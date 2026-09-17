'use client';

import React from 'react';
import Image from 'next/image';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';

export interface PrintableTicketData {
  idTiket: string;
  noDaisha: string;
  namaDaisha: string;
  seksi: string;
  namaPelapor: string;
  waktuMasuk: string;
  status?: string;
  detail: string;
  catatanTeknisi?: string;
}

interface PrintTicketTagModalProps {
  isOpen: boolean;
  ticket: PrintableTicketData | null;
  onClose: () => void;
}

export default function PrintTicketTagModal({
  isOpen,
  ticket,
  onClose,
}: PrintTicketTagModalProps) {
  if (!isOpen || !ticket) return null;

  const parsed = parseTicketDamageDetail(ticket.detail);
  const sizeInfo = detectDaishaSize(ticket.noDaisha);

  const handlePrint = () => {
    const origin = window.location.origin;
    const logoSrc = `${origin}/logo-bs.png`;

    const itemRowsHTML = parsed.items.length > 0
      ? parsed.items.map((item, idx) => `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f9fafb'}; border-bottom:1px solid #d1d5db;">
            <td style="padding:7px 10px; vertical-align:middle;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:14px; height:14px; border:2px solid #000; border-radius:2px; flex-shrink:0;"></span>
                <div>
                  ${item.komponen && item.komponen !== 'Umum' && item.komponen !== 'Others'
                    ? `<div style="font-size:8px; font-weight:700; text-transform:uppercase; color:#6b7280; letter-spacing:0.05em;">${item.komponen}</div>` : ''}
                  <div style="font-size:11px; font-weight:800; color:#111827;">${item.gejala}</div>
                </div>
              </div>
            </td>
            <td style="padding:7px 10px; text-align:right; white-space:nowrap; vertical-align:middle;">
              <span style="font-size:9px; font-weight:900; background:#f3f4f6; border:1px solid #374151; padding:2px 5px; border-radius:3px; margin-right:4px;">${item.qty}&times;</span>
              <span style="font-size:9px; font-weight:900; padding:2px 8px; border-radius:4px; border:2px solid ${item.tindakan === 'Ganti' ? '#1e40af' : '#9a3412'}; color:#fff; background:${item.tindakan === 'Ganti' ? '#2563eb' : '#ea580c'};">
                ${item.tindakan === 'Ganti' ? 'GANTI' : 'REPAIR'}
              </span>
            </td>
          </tr>`).join('')
      : `<tr><td colspan="2" style="padding:10px; text-align:center; font-size:11px;">${ticket.detail}</td></tr>`;

    const catatanHTML = parsed.catatan
      ? `<div style="margin-top:8px; padding:6px 10px; border-left:4px solid #f59e0b; background:#fffbeb; font-size:9px; font-weight:600; color:#92400e;">
           &#128204; ${parsed.catatan}
         </div>` : '';

    const sizeHTML = sizeInfo
      ? `<span style="font-size:10px; font-weight:900; padding:3px 8px; border:2px solid #000; border-radius:4px; background:#f3f4f6; text-transform:uppercase; vertical-align:middle; margin-left:8px;">${sizeInfo.label}</span>`
      : '';

    const printHTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Tag Daisha - ${ticket.noDaisha}</title>
  <style>
    @page { size: A5 portrait; margin: 8mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: #fff;
      color: #000;
    }
    .tag {
      width: 100%;
      border: 2px solid #000;
      border-radius: 0;
      overflow: hidden;
    }
    .header {
      background: #dc2626;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-left { display: flex; align-items: center; gap: 10px; }
    .logo-wrap {
      width: 48px; height: 36px;
      background: #fff;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      padding: 3px; flex-shrink: 0;
    }
    .logo-wrap img { width: 100%; height: 100%; object-fit: contain; }
    .company-name { color:#fff; font-weight:900; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; line-height:1.2; }
    .company-sub  { color:#fca5a5; font-weight:700; font-size:8px; letter-spacing:0.08em; text-transform:uppercase; }
    .ticket-id { text-align:right; }
    .ticket-id .id  { color:#fff; font-family:monospace; font-weight:700; font-size:9px; opacity:0.9; }
    .ticket-id .date { color:#fca5a5; font-weight:600; font-size:8px; }

    .unit-section {
      padding: 12px 14px 10px;
      border-bottom: 2px solid #000;
      text-align: center;
    }
    .unit-label { font-size:8px; font-weight:900; text-transform:uppercase; letter-spacing:0.2em; color:#6b7280; margin-bottom:3px; }
    .unit-number { font-family:monospace; font-weight:900; font-size:42px; color:#111; line-height:1; }
    .unit-meta { margin-top:6px; font-size:11px; font-weight:700; color:#374151; }
    .unit-return { margin-top:3px; font-size:8px; color:#9ca3af; }

    .meta-row {
      padding: 6px 14px;
      border-bottom: 1px solid #d1d5db;
      display: flex;
      justify-content: space-between;
      background: #f9fafb;
    }
    .meta-row span { font-size:9px; }
    .meta-row strong { font-size:9px; }

    .checklist-section { padding: 10px 14px; }
    .checklist-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 6px;
    }
    .checklist-title { font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.05em; }
    .checklist-total { font-size:9px; font-weight:700; background:#e5e7eb; padding:2px 8px; border-radius:20px; border:1px solid #374151; }
    .checklist-table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid #000;
      border-radius: 6px;
      overflow: hidden;
    }

    .sig-section {
      padding: 10px 14px;
      border-top: 2px solid #000;
    }
    .sig-title { font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px; }
    .sig-grid { display:flex; gap:6px; }
    .sig-box {
      flex:1; border:2px solid #000; border-radius:4px;
      padding:6px 8px; min-height:56px;
      display:flex; flex-direction:column;
    }
    .sig-label { font-size:8px; font-weight:900; text-transform:uppercase; letter-spacing:0.05em; }
    .sig-spacer { flex:1; }
    .sig-line { border-top:1px dashed #555; padding-top:4px; margin-top:4px; }
    .sig-sub { font-size:8px; font-weight:600; color:#9ca3af; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    .footer {
      margin: 0 14px 10px;
      padding-top: 8px;
      border-top: 2px dashed #9ca3af;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-left { display:flex; align-items:center; gap:6px; }
    .hole { width:18px; height:18px; border-radius:50%; border:2px solid #9ca3af; background:#fff; flex-shrink:0; }
    .footer-text { font-size:8px; font-weight:600; color:#9ca3af; }
    .footer-brand { font-family:monospace; font-size:8px; font-weight:700; color:#9ca3af; }
  </style>
</head>
<body>
<div class="tag">

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      <div class="logo-wrap">
        <img src="${logoSrc}" alt="Bridgestone Logo" />
      </div>
      <div>
        <div class="company-name">PT. Bridgestone Tire Indonesia</div>
        <div class="company-sub">Daisha Repair &amp; Maintenance</div>
      </div>
    </div>
    <div class="ticket-id">
      <div class="id">${ticket.idTiket}</div>
      <div class="date">${ticket.waktuMasuk}</div>
    </div>
  </div>

  <!-- UNIT NUMBER -->
  <div class="unit-section">
    <div class="unit-label">Nomor Unit Daisha</div>
    <div>
      <span class="unit-number">${ticket.noDaisha}</span>${sizeHTML}
    </div>
    <div class="unit-meta">${ticket.namaDaisha} &nbsp;|&nbsp; ${ticket.seksi}</div>
    <div class="unit-return">&#8617; Kembalikan ke: <strong>${ticket.seksi}</strong> setelah selesai diperbaiki</div>
  </div>

  <!-- META ROW -->
  <div class="meta-row">
    <span><strong>Pelapor:</strong> <strong>${ticket.namaPelapor}</strong></span>
    <span><strong>Tgl Masuk:</strong> <strong>${ticket.waktuMasuk}</strong></span>
  </div>

  <!-- CHECKLIST -->
  <div class="checklist-section">
    <div class="checklist-header">
      <span class="checklist-title">Rincian Kerusakan &amp; Tindakan:</span>
      <span class="checklist-total">${parsed.totalQtyAll} pcs total</span>
    </div>
    <table class="checklist-table">
      <tbody>
        ${itemRowsHTML}
      </tbody>
    </table>
    ${catatanHTML}
  </div>

  <!-- SIGNATURES -->
  <div class="sig-section">
    <div class="sig-title">Verifikasi Serah Terima Unit:</div>
    <div class="sig-grid">
      <div class="sig-box">
        <div class="sig-label">1. Pelapor</div>
        <div class="sig-spacer"></div>
        <div class="sig-line"><div class="sig-sub">${ticket.namaPelapor}</div></div>
      </div>
      <div class="sig-box">
        <div class="sig-label">2. Mekanik</div>
        <div class="sig-spacer"></div>
        <div class="sig-line"><div class="sig-sub">Paraf &amp; Tgl</div></div>
      </div>
      <div class="sig-box">
        <div class="sig-label">3. QC Check</div>
        <div class="sig-spacer"></div>
        <div class="sig-line"><div class="sig-sub">Status OK</div></div>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">
      <div class="hole"></div>
      <span class="footer-text">Lubang Gantungan</span>
    </div>
    <span class="footer-brand">PT. Bridgestone Tire Indonesia</span>
  </div>

</div>
<script>
  var img = document.querySelector('.logo-wrap img');
  if (img && img.complete) {
    window.print();
  } else if (img) {
    img.onload = function() { window.print(); };
    img.onerror = function() { window.print(); };
    setTimeout(function() { window.print(); }, 800);
  } else {
    window.print();
  }
</script>
</body>
</html>`;

    const pw = window.open('', '_blank', 'width=640,height=900');
    if (!pw) {
      alert('Pop-up diblokir browser. Harap izinkan pop-up untuk halaman ini agar bisa mencetak.');
      return;
    }
    pw.document.open();
    pw.document.write(printHTML);
    pw.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="no-print w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-up flex flex-col max-h-[94vh]">

        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏷️</span>
            <div>
              <h3 className="text-sm font-black text-slate-900">Pratinjau Tag Fisik Unit Daisha</h3>
              <p className="text-[11px] text-slate-500 font-medium">Cetak dan gantungkan pada unit daisha di bengkel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center font-black text-sm cursor-pointer shadow-2xs"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Scrollable Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center items-start">

          {/* THE PRINTABLE TAG */}
          <div className="printable-tag-area w-full max-w-sm bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none border-2 border-slate-300 print:border-2 print:border-black">

            {/* 1. RED HEADER BAND */}
            <div className="bg-red-600 print:bg-black px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-14 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 p-1">
                  <Image
                    src="/logo-bs.png"
                    alt="Bridgestone Logo"
                    width={52}
                    height={36}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-white font-black text-[11px] tracking-widest uppercase leading-tight">PT. Bridgestone Tire Indonesia</p>
                  <p className="text-red-200 print:text-white font-bold text-[9px] tracking-wider uppercase">Daisha Repair &amp; Maintenance</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-mono font-bold text-[8px] leading-tight opacity-80">{ticket.idTiket}</p>
                <p className="text-red-200 print:text-white font-semibold text-[8px] leading-tight">{ticket.waktuMasuk}</p>
              </div>
            </div>

            {/* 2. UNIT NUMBER HERO */}
            <div className="px-4 pt-4 pb-3 border-b-2 border-black text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 print:text-slate-700 mb-0.5">NOMOR UNIT DAISHA</p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono font-black text-5xl tracking-tight text-slate-900 leading-none">
                  {ticket.noDaisha}
                </span>
                {sizeInfo && (
                  <span className="text-xs font-black px-2.5 py-1 rounded border-2 border-black bg-slate-100 uppercase self-center">
                    {sizeInfo.label}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-sm font-bold text-slate-700 print:text-black">{ticket.namaDaisha}</span>
                <span className="text-slate-300 print:text-black">|</span>
                <span className="text-sm font-bold text-slate-700 print:text-black uppercase">{ticket.seksi}</span>
              </div>
              <p className="text-[9px] font-semibold text-slate-400 print:text-black mt-1">
                ↩ Kembalikan ke: <strong>{ticket.seksi}</strong> setelah selesai diperbaiki
              </p>
            </div>

            {/* 3. METADATA ROW */}
            <div className="px-4 py-2 border-b border-black/30 flex justify-between items-center bg-slate-50 print:bg-transparent">
              <div className="text-[9px]">
                <span className="font-bold uppercase tracking-wide text-slate-500 print:text-black">Pelapor: </span>
                <span className="font-black text-slate-900">{ticket.namaPelapor}</span>
              </div>
              <div className="text-[9px]">
                <span className="font-bold uppercase tracking-wide text-slate-500 print:text-black">Tgl Masuk: </span>
                <span className="font-black text-slate-900">{ticket.waktuMasuk}</span>
              </div>
            </div>

            {/* 4. DAMAGE CHECKLIST */}
            <div className="px-4 pt-3 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider">RINCIAN KERUSAKAN &amp; TINDAKAN:</span>
                <span className="text-[9px] font-bold bg-slate-200 px-2 py-0.5 rounded-full border border-slate-300 print:border-black">
                  {parsed.totalQtyAll} pcs total
                </span>
              </div>

              <div className="border-2 border-black rounded-lg overflow-hidden">
                {parsed.items.length > 0 ? (
                  parsed.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-2.5 py-2 ${idx < parsed.items.length - 1 ? 'border-b border-black/20' : ''} ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60 print:bg-white'}`}
                    >
                      {/* Checkbox */}
                      <span className="w-4 h-4 border-2 border-black rounded-sm shrink-0" />

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        {item.komponen && item.komponen !== 'Umum' && item.komponen !== 'Others' && (
                          <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400 print:text-slate-600 block leading-tight">{item.komponen}</span>
                        )}
                        <span className="text-[11px] font-extrabold text-slate-900 leading-tight block">
                          {item.gejala}
                        </span>
                      </div>

                      {/* Right badges */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9px] font-black bg-slate-100 border border-black px-1.5 py-0.5 rounded">
                          {item.qty}&times;
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border-2 ${
                          item.tindakan === 'Ganti'
                            ? 'bg-blue-600 text-white border-blue-800 print:bg-white print:text-black print:border-black'
                            : 'bg-orange-500 text-white border-orange-700 print:bg-white print:text-black print:border-black'
                        }`}>
                          {item.tindakan === 'Ganti' ? 'GANTI' : 'REPAIR'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-[11px] font-medium text-center text-slate-600">{ticket.detail}</div>
                )}
              </div>

              {parsed.catatan && (
                <div className="mt-2 px-2.5 py-2 border-l-4 border-amber-500 bg-amber-50 print:bg-transparent print:border-black rounded-r text-[9px] font-semibold text-amber-900 print:text-black">
                  📌 {parsed.catatan}
                </div>
              )}
            </div>

            {/* 5. SIGNATURE / HANDOVER BOXES */}
            <div className="px-4 pb-3 border-t-2 border-black pt-3">
              <p className="text-[9px] font-black uppercase tracking-wider mb-2">VERIFIKASI SERAH TERIMA UNIT:</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '1. Pelapor', sub: ticket.namaPelapor },
                  { label: '2. Mekanik', sub: 'Paraf & Tgl' },
                  { label: '3. QC Check', sub: 'Status OK' },
                ].map(({ label, sub }) => (
                  <div key={label} className="border-2 border-black rounded p-2 flex flex-col gap-1 min-h-[56px]">
                    <span className="text-[8px] font-black uppercase tracking-wide block">{label}</span>
                    <div className="flex-1" />
                    <div className="border-t border-dashed border-black/60 pt-1">
                      <span className="text-[8px] font-semibold text-slate-400 print:text-slate-600 truncate block">{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. FOOTER / HOLE PUNCH */}
            <div className="mx-4 mb-3 pt-2 border-t-2 border-dashed border-slate-400 print:border-black flex items-center justify-between text-[8px] text-slate-400 print:text-black">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full border-2 border-slate-400 print:border-black bg-white" />
                <span className="font-semibold">Lubang Gantungan</span>
              </div>
              <span className="font-mono font-bold">PT. Bridgestone Tire Indonesia</span>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 px-6 border-t border-slate-200 bg-white flex justify-between items-center gap-3 shrink-0">
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            💡 Tips: Gunakan kertas A5/A6 atau printer thermal label.
          </p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-900/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🖨️</span>
              <span>Cetak Tag Fisik (Print)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
