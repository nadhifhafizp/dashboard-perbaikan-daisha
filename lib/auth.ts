/**
 * lib/auth.ts — Modul Keamanan Sesi & Kriptografi Token
 * 
 * ============================================================================
 * FUNGSI UTAMA:
 * 1. Manajemen sesi stateless berbasis cryptographic token (HMAC-SHA256).
 * 2. Menghasilkan dan memverifikasi token sesi tanpa query database (0 DB roundtrip).
 * 3. Menghalau serangan Timing Attack menggunakan `crypto.timingSafeEqual`.
 * 4. Mendukung validasi masa aktif sesi 12 jam (sesuai standar 1 shift kerja).
 * ============================================================================
 */
import crypto from 'crypto';
import { UserRole } from './users';

/**
 * Komparasi dua string dalam waktu konstan (Constant-Time Comparison).
 * Mencegah serangan 'Timing Attack' di mana penyerang menganalisis waktu respons
 * komparasi byte-per-byte untuk menebak signature.
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Menghasilkan tanda tangan digital HMAC-SHA256 dari string data dan secret key.
 */
function generateHmacSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Mengambil secret key dari environment variable (`SESSION_SECRET`).
 * Jika belum dikonfigurasi, sistem melempar exception demi mencegah insecure fallback.
 */
function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      '[Auth] SESSION_SECRET tidak ditemukan di environment variables. ' +
      'Pastikan variabel ini sudah diisi di environment variables sebelum menjalankan aplikasi.'
    );
  }
  return secret;
}

/**
 * Nama cookie HTTP yang digunakan untuk menyimpan token sesi pengguna
 */
export const SESSION_COOKIE_NAME = 'daisha_auth_session';

/**
 * Payload data pengguna di dalam token sesi
 */
export interface SessionPayload {
  username: string;
  role: UserRole;
  name?: string;
}

/**
 * Hasil verifikasi token sesi
 */
export interface VerificationResult {
  valid: boolean;
  user?: SessionPayload;
}

/**
 * Membuat token sesi terenkripsi dan tertandatangani secara kriptografis (Stateless Token).
 * 
 * Struktur token (5 bagian dipisah pipa '|'):
 * base64(username) | role | timestamp | base64(namaLengkap) | hmac_signature
 * 
 * @param payload - Informasi pengguna (username, role, nama tampilan)
 * @returns String token sesi siap disimpan di cookie HttpOnly
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const timestamp = Date.now().toString();
  const encodedUsername = Buffer.from(payload.username).toString('base64');
  const encodedName = Buffer.from(payload.name || payload.username).toString('base64');
  const data = `${encodedUsername}|${payload.role}|${timestamp}|${encodedName}`;
  const signature = generateHmacSignature(data, getSecret());
  return `${data}|${signature}`;
}

/**
 * Memvalidasi integritas, masa berlaku, dan keaslian token sesi secara instan di memori server.
 * 
 * Tahapan Verifikasi:
 * 1. Sanitasi URL-encoding (jika token terbaca dari header HTTP).
 * 2. Pengecekan struktur format payload (4 atau 5 bagian).
 * 3. Pengecekan batas waktu kadaluwarsa (12 jam dari timestamp pembuatan).
 * 4. Pengecekan kecocokan signature via timing-safe equal.
 * 
 * @param token - String token sesi dari cookie
 * @returns VerificationResult (valid status dan data pengguna jika sah)
 */
export async function parseAndVerifySession(token: string | undefined | null): Promise<VerificationResult> {
  if (!token) return { valid: false };

  try {
    let cleanToken = token;
    try {
      if (token.includes('%')) {
        cleanToken = decodeURIComponent(token);
      }
    } catch {
      // Abaikan jika bukan format URL-encoded
    }

    const parts = cleanToken.split('|');
    if (parts.length !== 4 && parts.length !== 5) return { valid: false };

    // Format 5 Bagian (Format Utama): encodedUsername|role|timestamp|encodedName|signature
    if (parts.length === 5) {
      const [encodedUsername, role, timestampStr, encodedName, providedSignature] = parts;
      const timestamp = parseInt(timestampStr, 10);

      if (isNaN(timestamp)) return { valid: false };

      // Validasi masa aktif token: 12 jam (sesuai siklus 1 shift kerja pabrik)
      const MAX_AGE_MS = 12 * 60 * 60 * 1000;
      if (Date.now() - timestamp > MAX_AGE_MS) {
        return { valid: false };
      }

      const data = `${encodedUsername}|${role}|${timestampStr}|${encodedName}`;
      const expectedSignature = generateHmacSignature(data, getSecret());

      // Verifikasi tanda tangan dengan proteksi timing attack
      if (!constantTimeCompare(providedSignature, expectedSignature)) {
        return { valid: false };
      }

      const username = Buffer.from(encodedUsername, 'base64').toString('utf8');
      const name = Buffer.from(encodedName, 'base64').toString('utf8');

      return {
        valid: true,
        user: {
          username,
          role: role as UserRole,
          name,
        },
      };
    }

    // Format 4 Bagian (Backward Compatibility untuk token sesi sebelumnya)
    const [encodedUsername, role, timestampStr, providedSignature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) return { valid: false };

    const MAX_AGE_MS = 12 * 60 * 60 * 1000;
    if (Date.now() - timestamp > MAX_AGE_MS) {
      return { valid: false };
    }

    const data = `${encodedUsername}|${role}|${timestampStr}`;
    const expectedSignature = generateHmacSignature(data, getSecret());

    if (!constantTimeCompare(providedSignature, expectedSignature)) {
      return { valid: false };
    }

    const username = Buffer.from(encodedUsername, 'base64').toString('utf8');
    return {
      valid: true,
      user: {
        username,
        role: role as UserRole,
        name: username,
      },
    };
  } catch (err) {
    console.error('[Auth] Kesalahan verifikasi token:', err);
    return { valid: false };
  }
}
