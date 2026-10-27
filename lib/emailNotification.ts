/**
 * lib/emailNotification.ts
 * Layanan Notifikasi Email & In-App untuk Alur Flowchart Follow-up Request Bridgestone
 */

import sql, { TransactionClient } from '@/lib/db';
import type postgres from 'postgres';

export interface NotificationPayload {
  requestId: number;
  nomorRequest: string;
  targetRole: 'ADMIN' | 'USER_SEKSI' | 'ATASAN_SEKSI' | 'MENTOR';
  targetEmail?: string;
  targetUser?: string;
  tipe:
    | 'APPROVAL_ATASAN_SEKSI'
    | 'ASSIGN_DITERIMA_WORKSHOP'
    | 'ASSIGN_ATASAN_SPROJECT'
    | 'INFO_TOLAK_SEKSI'
    | 'INFO_PROSES_PENGERJAAN'
    | 'INFO_SELESAI_SEKSI';
  judul: string;
  pesan: string;
  link?: string;
}

/**
 * Simpan notifikasi ke database agar muncul di lonceng notifikasi aplikasi
 */
export async function createInAppNotification(
  payload: NotificationPayload,
  dbClient?: TransactionClient | postgres.Sql
) {
  const client = dbClient || sql;
  try {
    await client`
      INSERT INTO "SectionRequestNotification" (
        "requestId", "nomorRequest", "targetRole", "targetEmail",
        "targetUser", "tipe", "judul", "pesan", "link", "isRead", "waktu"
      )
      VALUES (
        ${payload.requestId},
        ${payload.nomorRequest},
        ${payload.targetRole},
        ${payload.targetEmail || null},
        ${payload.targetUser || null},
        ${payload.tipe},
        ${payload.judul},
        ${payload.pesan},
        ${payload.link || null},
        FALSE,
        NOW()
      )
    `;
  } catch (err) {
    console.error('[Notification] Gagal menyimpan in-app notification:', err);
  }
}

/**
 * Mengirim notifikasi email secara asynchronous non-blocking (fire-and-forget).
 * Menjamin response API tetap instan (< 200ms) tanpa tertahan oleh latensi jaringan server email.
 */
export function sendEmailAsync(options: {
  to?: string;
  subject: string;
  bodyText?: string;
  html?: string;
}): void {
  Promise.resolve()
    .then(async () => {
      try {
        if (process.env.RESEND_API_KEY || process.env.SMTP_HOST) {
          // Placeholder implementasi transportasi email eksternal jika dikonfigurasi
          console.log(`[Email Dispatch] Mengirim ke ${options.to || 'internal'}: ${options.subject}`);
        }
      } catch (err) {
        console.error('[Email Error]:', err);
      }
    })
    .catch((err) => {
      console.error('[Email Error]:', err);
    });
}

// Re-export client-safe email templates
export {
  buildAtasanSeksiEmailContent,
  buildAdminWorkshopEmailContent,
  buildAtasanSpecialProjectEmailContent,
} from '@/lib/emailTemplates';


