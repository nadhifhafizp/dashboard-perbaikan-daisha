'use client';

import React from 'react';
import Image from 'next/image';
import { Tag, X, MapPin, Lightbulb, Printer } from 'lucide-react';
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
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

    const catatanHTML = ticket.catatanTeknisi && ticket.catatanTeknisi !== '-'
      ? `<div style="margin-top:8px; padding:6px 10px; background:#fef3c7; border:1.5px solid #d97706; border-radius:4px; font-size:10px; color:#78350f;">
          <strong>Catatan:</strong> ${ticket.catatanTeknisi}
        </div>` : '';

    const sizeHTML = sizeInfo
      ? `<span class="size-badge">${sizeInfo.label}</span>` : '';

    const printHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Tag Daisha - ${ticket.noDaisha}</title>
<style>
  @page {
    size: A5 portrait;
    margin: 6mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    color: #000;
    background: #fff;
    padding: 0;
  }
  .tag {
    border: 2.5px solid #000;
    border-radius: 6px;
    overflow: hidden;
    max-width: 130mm;
    margin: 0 auto;
  }
  .header {
    background: #000;
    color: #fff;
    padding: 7px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #000;
  }
  .header-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .logo-wrap {
    background: #fff;
    border-radius: 4px;
    padding: 2px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 32px;
  }
  .logo-wrap img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }
  .company-name { font-size: 10px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
  .system-name { font-size: 8px; font-weight: 700; color: #ccc; letter-spacing: 0.05em; text-transform: uppercase; }
  .header-id { text-align: right; }
  .ticket-id { font-family: monospace; font-size: 9px; font-weight: 900; color: #fff; }
  .ticket-date { font-size: 8px; color: #aaa; }
  .unit-hero {
    border-bottom: 2px solid #000;
    padding: 8px 10px;
    text-align: center;
    background: #fff;
  }
  .unit-label { font-size: 8px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; color: #555; margin-bottom: 2px; }
  .unit-number { font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: -0.02em; line-height: 1; }
  .size-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 900;
    padding: 2px 8px;
    border: 2px solid #000;
    border-radius: 4px;
    background: #eee;
    text-transform: uppercase;
    vertical-align: middle;
    margin-left: 6px;
  }
  .unit-meta { font-size: 11px; font-weight: 700; color: #222; margin-top: 3px; }
  .unit-return { font-size: 8px; font-weight: 700; color: #444; margin-top: 2px; }
  .meta-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 10px;
    background: #f3f4f6;
    border-bottom: 1.5px solid #000;
    font-size: 9px;
  }
  .checklist-section { padding: 6px 10px; }
  .checklist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .checklist-title { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
  .checklist-total { font-size: 8px; font-weight: 700; background: #e5e7eb; border: 1px solid #9ca3af; padding: 1px 6px; border-radius: 3px; }
  .checklist-table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; border-radius: 4px; overflow: hidden; }
  .sig-section { border-top: 1.5px solid #000; padding: 6px 10px; background: #fafafa; }
  .sig-title { font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #333; margin-bottom: 4px; }
  .sig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .sig-box { border: 1px solid #000; border-radius: 4px; padding: 4px; background: #fff; text-align: center; }
  .sig-label { font-size: 7.5px; font-weight: 700; color: #555; text-transform: uppercase; }
  .sig-spacer { height: 26px; }
  .sig-line { border-top: 1px dashed #666; padding-top: 2px; }
  .sig-sub { font-size: 7px; color: #555; font-weight: 600; }
  .footer {
    border-top: 1.5px dashed #000;
    padding: 4px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
  }
  .footer-left { display: flex; align-items: center; gap: 5px; }
  .hole { width: 14px; height: 14px; border: 1.5px solid #000; border-radius: 50%; background: #fff; }
  .footer-text { font-size: 7.5px; font-weight: 700; color: #555; }
  .footer-brand { font-family: monospace; font-size: 7px; font-weight: 700; color: #666; }
</style>
</head>
<body>
<div class="tag">

  <!-- HEADER -->
  <div class="header">
    <div class="header-brand">
      <div class="logo-wrap">
        <img src="${logoSrc}" alt="BS" onerror="this.parentElement.style.display='none'">
      </div>
      <div>
        <div class="company-name">PT. Bridgestone Tire Indonesia</div>
        <div class="system-name">Daisha Repair &amp; Maintenance</div>
      </div>
    </div>
    <div class="header-id">
      <div class="ticket-id">${ticket.idTiket}</div>
      <div class="ticket-date">${ticket.waktuMasuk}</div>
    </div>
  </div>

  <!-- UNIT HERO -->
  <div class="unit-hero">
    <div class="unit-label">Nomor Unit Daisha</div>
    <div>
      <span class="unit-number">${ticket.noDaisha}</span>${sizeHTML}
    </div>
    <div class="unit-meta">${ticket.namaDaisha} &nbsp;|&nbsp; ${ticket.seksi}</div>
    <div class="unit-return">&#8617; Kembalikan ke: <strong>${ticket.seksi}</strong> setelah selesai diperbaiki</div>
  </div>

  <!-- META ROW -->
  <div class="meta-row">
    <span><strong>Pelapor:</strong> ${ticket.namaPelapor}</span>
    <span><strong>Tgl Masuk:</strong> ${ticket.waktuMasuk}</span>
  </div>

  <!-- CHECKLIST -->
  <div class="checklist-section">
    <div class="checklist-header">
      <span class="checklist-title">Rincian Kerusakan &amp; Tindakan</span>
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
    <div class="sig-title">Verifikasi Serah Terima Unit</div>
    <div class="sig-grid">
      <div class="sig-box">
        <div class="sig-label">1. Pelapor</div>
        <div class="sig-spacer"></div>
        <div class="sig-line">
          <div class="sig-sub">${ticket.namaPelapor}</div>
        </div>
      </div>
      <div class="sig-box">
        <div class="sig-label">2. Mekanik</div>
        <div class="sig-spacer"></div>
        <div class="sig-line">
          <div class="sig-sub">Paraf &amp; Tgl</div>
        </div>
      </div>
      <div class="sig-box">
        <div class="sig-label">3. QC Check</div>
        <div class="sig-spacer"></div>
        <div class="sig-line">
          <div class="sig-sub">Status OK</div>
        </div>
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
  function doPrint() {
    window.focus();
    window.print();
    setTimeout(function() { window.close(); }, 500);
  }
  if (img && !img.complete) {
    img.onload = doPrint;
    img.onerror = doPrint;
    setTimeout(doPrint, 800);
  } else {
    setTimeout(doPrint, 250);
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-tag-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="no-print w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden transform transition-all animate-scale-up flex flex-col max-h-[94vh]">

        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 id="print-tag-dialog-title" className="text-sm font-semibold text-slate-900">Pratinjau Tag Fisik Unit Daisha</h3>
              <p className="text-xs text-slate-600 font-normal">Cetak dan gantungkan pada unit daisha di bengkel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-medium text-sm cursor-pointer shadow-2xs transition focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Tutup pratinjau tag fisik"
            title="Tutup Pratinjau"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center items-start">

          {/* THE PRINTABLE TAG */}
          <div className="printable-tag-area w-full max-w-sm bg-white shadow-md rounded-lg overflow-hidden print:shadow-none print:rounded-none print:max-w-none border border-slate-300 print:border-2 print:border-black">

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
                <div className="mt-2 px-2.5 py-2 border border-amber-300 bg-amber-50 print:bg-transparent print:border-black rounded-lg text-xs font-medium text-amber-950 print:text-black flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>{parsed.catatan}</span>
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
          <p className="text-xs text-slate-500 font-medium hidden sm:flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Tips: Gunakan kertas A5/A6 atau printer thermal label.</span>
          </p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial min-h-[40px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial min-h-[40px] px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg shadow-xs transition cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Tag Fisik (Print)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
