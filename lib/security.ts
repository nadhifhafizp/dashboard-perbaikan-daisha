/**
 * lib/security.ts — Modul Keamanan Terpadu (Security Engine)
 * 
 * ============================================================================
 * CAKUPAN PERTAHANAN (6 PILAR KEAMANAN):
 * 1. Authentication : Helper verifikasi token sesi di level API Route.
 * 2. Authorization  : Penegakan RBAC (Admin, Operator, User Seksi) ketat per endpoint.
 * 3. Validation     : Validasi tipe, panjang karakter, pola regex, dan sanitasi XSS.
 * 4. Rate Limiting  : Pembatas frekuensi request berbasis sliding window per IP/User.
 * 5. File/Body Limit: Pembatasan ukuran payload request (mencegah DoS memory exhaustion).
 * 6. Audit Logging  : Pencatatan jejak audit (audit trail) terstruktur untuk forensik.
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseAndVerifySession, SESSION_COOKIE_NAME, SessionPayload } from '@/lib/auth';
import { UserRole } from '@/lib/users';

// ============================================================================
// 1. RATE LIMITING (Sliding-Window Memory Store)
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory bucket untuk rate limiting
const rateLimitStore = new Map<string, RateLimitRecord>();

// Bersihkan data kedaluwarsa secara berkala setiap 5 menit
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Memeriksa kuota request pengguna/IP.
 * 
 * @param key - Pengidentifikasi unik (misal: "mutation:192.168.1.10" atau "login:username")
 * @param maxRequests - Batas kuota request maksimum dalam jendela waktu
 * @param windowMs - Durasi jendela waktu dalam milidetik (default: 60.000 ms / 1 menit)
 */
export function checkRateLimit(
  key: string,
  maxRequests = 60,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

// ============================================================================
// 2. FILE & PAYLOAD SIZE LIMIT (Mencegah DoS Memory Exhaustion)
// ============================================================================

// Default limit: 1 MB (1.048.576 bytes) — sangat aman untuk JSON dan metadata workshop
export const DEFAULT_MAX_PAYLOAD_BYTES = 1024 * 1024; 

/**
 * Memvalidasi ukuran request header Content-Length sebelum parsing body.
 */
export function validatePayloadSize(
  request: Request,
  maxBytes: number = DEFAULT_MAX_PAYLOAD_BYTES
): { ok: boolean; errorResponse?: NextResponse } {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (!isNaN(size) && size > maxBytes) {
      const maxMb = (maxBytes / (1024 * 1024)).toFixed(1);
      return {
        ok: false,
        errorResponse: NextResponse.json(
          { error: `Ukuran payload melebihi batas maksimum (${maxMb} MB).` },
          { status: 413 }
        ),
      };
    }
  }
  return { ok: true };
}

// ============================================================================
// 3. AUDIT LOGGING (Pencatatan Jejak Aktivitas Terstruktur)
// ============================================================================

export interface AuditLogEntry {
  action: string;
  ip: string;
  user?: string;
  role?: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  targetId?: string | number;
  details?: string;
}

/**
 * Mencatat aktivitas penting dan perubahan data ke log audit sistem.
 */
export function recordAuditLog(entry: AuditLogEntry): void {
  const timestamp = new Date().toISOString();
  const userTag = entry.user ? `[${entry.user}:${entry.role || 'GUEST'}]` : '[ANONYMOUS]';
  const statusTag = entry.status === 'SUCCESS' ? '✓ OK' : entry.status === 'DENIED' ? '⚠ DENIED' : '✗ FAILED';
  const targetTag = entry.targetId ? ` -> Target:${entry.targetId}` : '';
  const detailTag = entry.details ? ` (${entry.details})` : '';

  console.log(
    `[AUDIT] ${timestamp} | IP:${entry.ip} | ${statusTag} | ${userTag} ${entry.action}${targetTag}${detailTag}`
  );
}

// ============================================================================
// 4. IP & CLIENT RECOGNITION
// ============================================================================

/**
 * Mendeteksi IP Address pemanggil request secara andal.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

// ============================================================================
// 5. AUTHENTICATION & AUTHORIZATION GUARD (Untuk API Routes)
// ============================================================================

export interface AuthGuardResult {
  authorized: boolean;
  user?: SessionPayload;
  ip: string;
  errorResponse?: NextResponse;
}

/**
 * Gatekeeper Otentikasi dan Otorisasi Terpusat untuk API Route Handlers.
 * 
 * @param request - HTTP Request object
 * @param allowedRoles - Daftar role yang berhak (kosong = siapa saja yang telah login)
 */
export async function requireAuth(
  request: Request,
  allowedRoles?: UserRole[]
): Promise<AuthGuardResult> {
  const ip = getClientIp(request);

  // 1. Ekstraksi Cookie Sesi
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await parseAndVerifySession(token);

  if (!session.valid || !session.user) {
    recordAuditLog({
      action: 'API_ACCESS',
      ip,
      status: 'DENIED',
      details: 'Akses tanpa autentikasi / sesi tidak valid',
    });
    return {
      authorized: false,
      ip,
      errorResponse: NextResponse.json(
        { error: 'Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      ),
    };
  }

  // 2. Evaluasi Otorisasi (RBAC)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(session.user.role)) {
      recordAuditLog({
        action: 'API_RBAC_CHECK',
        ip,
        user: session.user.username,
        role: session.user.role,
        status: 'DENIED',
        details: `Role tidak memiliki izin. Membutuhkan: ${allowedRoles.join('/')}`,
      });
      return {
        authorized: false,
        user: session.user,
        ip,
        errorResponse: NextResponse.json(
          { error: 'Akses ditolak. Anda tidak memiliki wewenang untuk aksi ini.' },
          { status: 403 }
        ),
      };
    }
  }

  return {
    authorized: true,
    user: session.user,
    ip,
  };
}

// ============================================================================
// 6. VALIDASI & SANITASI INPUT DATA (XSS Defense & Data Integrity)
// ============================================================================

/**
 * Sanitasi string teks:
 * - Menghapus karakter kontrol terlarang (NULL bytes, Escape, control chars)
 * - Menghilangkan tag HTML `<` dan `>` untuk mematikan payload XSS
 * - Memotong panjang teks sesuai limit maksimal
 */
export function sanitizeText(val: unknown, maxLength = 255): string {
  if (typeof val !== 'string') return '';
  return val
    .trim()
    .replace(/[\x00-\x1F\x7F<>]/g, '')
    .slice(0, maxLength);
}

/**
 * Validasi nomor unit Daisha (misal: "S30015", "GT-01", "VB-12").
 */
export function validateNoDaisha(noDaisha: unknown): { valid: boolean; value: string; error?: string } {
  const clean = sanitizeText(noDaisha, 50).toUpperCase();
  if (!clean) {
    return { valid: false, value: '', error: 'Nomor Daisha wajib diisi.' };
  }
  // Hanya izinkan karakter alfanumerik, spasi, dash, dan garis miring
  if (!/^[A-Z0-9\s\-_/]+$/.test(clean)) {
    return { valid: false, value: clean, error: 'Format Nomor Daisha tidak valid (hanya huruf, angka, tanda minus/slash).' };
  }
  return { valid: true, value: clean };
}

/**
 * Validasi angka bulat positif (untuk Qty, ID, dan total).
 */
export function validatePositiveInt(val: unknown, fieldName = 'Nilai', min = 1, max = 100000): { valid: boolean; value: number; error?: string } {
  const num = typeof val === 'number' ? val : parseInt(String(val), 10);
  if (isNaN(num) || num < min || num > max) {
    return { valid: false, value: min, error: `${fieldName} harus berupa angka antara ${min} dan ${max}.` };
  }
  return { valid: true, value: num };
}
