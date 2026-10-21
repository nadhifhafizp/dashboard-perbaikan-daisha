/**
 * lib/emailTemplates.ts
 * Template Email Client-Safe (Bisa dijalankan di browser maupun server)
 */

import { DEFAULT_WORKSHOP_ADMIN_EMAIL, DEFAULT_ATASAN_SPROJECT_EMAIL } from '@/lib/workflowConstants';

/**
 * 1. PIC Seksi Mengirimkan Link Approval ke Atasan Seksinya (Foreman/K.Sie)
 */
export function buildAtasanSeksiEmailContent({
  nomorRequest,
  perihal,
  seksiPemohon,
  picPemohon,
  namaAtasan,
  approvalLink,
}: {
  nomorRequest: string;
  perihal: string;
  seksiPemohon: string;
  picPemohon: string;
  namaAtasan: string;
  approvalLink: string;
}) {
  const subject = `[APPROVAL REQUEST] Permohonan ${nomorRequest} - Seksi ${seksiPemohon}`;

  const bodyText = `Yth. Bapak/Ibu ${namaAtasan || 'Atasan Seksi'},

PIC Seksi ${picPemohon} (${seksiPemohon}) telah mengajukan permohonan modifikasi/perbaikan barang (Form ENG-KP-011):

- No. Request: ${nomorRequest}
- Perihal: ${perihal}
- Pemohon: ${picPemohon}

Mohon kesediaan Anda untuk meninjau formulir dan memberikan persetujuan (Assign / Tanda Tangan) melalui tautan resmi berikut:
${approvalLink}

Setelah Anda menyetujui, formulir akan otomatis diteruskan ke Admin / PIC Workshop Produksi untuk dievaluasi.

Terima kasih.
PT Bridgestone Tire Indonesia - Sistem Workshop Management`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

  return { subject, bodyText, mailtoUrl };
}

/**
 * 2. Setelah Atasan Seksi Approve, Notifikasi Email Masuk ke Admin Workshop
 */
export function buildAdminWorkshopEmailContent({
  nomorRequest,
  perihal,
  seksiPemohon,
  picPemohon,
  namaAtasan,
  detailLink,
  toEmail = DEFAULT_WORKSHOP_ADMIN_EMAIL,
}: {
  nomorRequest: string;
  perihal: string;
  seksiPemohon: string;
  picPemohon: string;
  namaAtasan: string;
  detailLink: string;
  toEmail?: string;
}) {
  const subject = `[WORKSHOP REQUEST] No. Req: ${nomorRequest} telah disetujui Atasan ${seksiPemohon}`;

  const bodyText = `Yth. Admin & PIC Workshop Produksi,

Permohonan request perbaikan/modifikasi baru telah disetujui & ditandatangani oleh atasan seksi pemohon (${namaAtasan}):

- No. Request: ${nomorRequest}
- Seksi Pemohon: ${seksiPemohon}
- PIC Pemohon: ${picPemohon}
- Disetujui Oleh: ${namaAtasan || 'Atasan Seksi'}
- Perihal: ${perihal}

Silakan buka sistem dashboard workshop untuk melakukan evaluasi pekerjaan (1. Waktu, 2. Men Power, 3. Sparepart, 4. Material):
${detailLink}

Terima kasih.
PT Bridgestone Tire Indonesia - Sistem Workshop Management`;

  const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

  return { toEmail, subject, bodyText, mailtoUrl };
}

/**
 * 3. PIC Workshop Mengirimkan Notifikasi ke Atasan Special Project (Baik GO / Menyanggupi maupun REJECT / Tidak Menyanggupi)
 */
export function buildAtasanSpecialProjectEmailContent({
  action, // 'GO' | 'REJECT'
  nomorRequest,
  perihal,
  seksiPemohon,
  picPemohon,
  waktuEstimate,
  orangJamEstimate,
  kebutuhanSparepart,
  kebutuhanMaterial,
  biayaEstimate,
  alasanTolak,
  detailLink,
  toEmail = DEFAULT_ATASAN_SPROJECT_EMAIL,
}: {
  action: 'GO' | 'REJECT';
  nomorRequest: string;
  perihal: string;
  seksiPemohon: string;
  picPemohon: string;
  waktuEstimate?: string;
  orangJamEstimate?: string;
  kebutuhanSparepart?: string;
  kebutuhanMaterial?: string;
  biayaEstimate?: string;
  alasanTolak?: string;
  detailLink: string;
  toEmail?: string;
}) {
  if (action === 'GO') {
    const subject = `[ASSIGN S.PROJECT] Permohonan ${nomorRequest} Disanggupi Workshop - Mohon Persetujuan Atasan Special Project`;
    const bodyText = `Yth. Atasan Special Project (8210 / 820),

PIC Workshop Produksi telah mengevaluasi dan MENYANGGUPI permohonan pengerjaan berikut:

- No. Request: ${nomorRequest}
- Seksi Pemohon: ${seksiPemohon} (Drafter: ${picPemohon})
- Perihal: ${perihal}

HASIL EVALUASI WORKSHOP:
1. Estimasi Waktu: ${waktuEstimate || '-'}
2. Estimasi Men Power: ${orangJamEstimate || '-'}
3. Kebutuhan Sparepart: ${kebutuhanSparepart || '-'}
4. Kebutuhan Material: ${kebutuhanMaterial || '-'}
5. Estimasi Biaya: ${biayaEstimate || '-'}

Mohon kesediaan Bapak/Ibu untuk memeriksa dan memberikan persetujuan (Assign / Tanda Tangan S.Project) melalui tautan:
${detailLink}

Setelah persetujuan diberikan, notifikasi otomatis akan langsung muncul di web apps admin workshop untuk memulai pengerjaan fisik oleh operator bengkel.

Terima kasih.
PT Bridgestone Tire Indonesia - Sistem Workshop Management`;

    const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    return { toEmail, subject, bodyText, mailtoUrl };
  } else {
    const subject = `[INFO S.PROJECT] Permohonan ${nomorRequest} TIDAK DISANGGUPI / DITOLAK oleh Workshop`;
    const bodyText = `Yth. Atasan Special Project (8210 / 820),

Diberitahukan bahwa permohonan pengerjaan berikut TIDAK DISANGGUPI / DITOLAK oleh PIC Workshop Produksi:

- No. Request: ${nomorRequest}
- Seksi Pemohon: ${seksiPemohon} (Drafter: ${picPemohon})
- Perihal: ${perihal}
- Alasan Penolakan: ${alasanTolak || 'Keterbatasan sumber daya workshop'}

Informasi penolakan juga telah diteruskan ke Seksi Pemohon terkait.

Detail selengkapnya dapat dilihat pada tautan:
${detailLink}

Terima kasih.
PT Bridgestone Tire Indonesia - Sistem Workshop Management`;

    const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    return { toEmail, subject, bodyText, mailtoUrl };
  }
}
