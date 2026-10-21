/**
 * lib/emailNotification.ts
 * Layanan Notifikasi Email & In-App untuk Alur Flowchart Follow-up Request Bridgestone
 */

import sql from '@/lib/db';
import { recordAuditLog } from '@/lib/security';

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
export async function createInAppNotification(payload: NotificationPayload) {
  try {
    await sql`
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

// Re-export client-safe email templates
export {
  buildAtasanSeksiEmailContent,
  buildAdminWorkshopEmailContent,
  buildAtasanSpecialProjectEmailContent,
} from '@/lib/emailTemplates';

