/**
 * proxy.ts — Next.js 16 Edge Runtime Security Proxy (Pengganti middleware.ts)
 * 
 * ============================================================================
 * FUNGSI KEAMANAN & ARSITEKTUR:
 * 1. Menjadi gerbang pertama (First Line of Defense) untuk semua HTTP request.
 * 2. Berjalan di Next.js Edge Runtime (V8 isolates super cepat tanpa overhead Node.js).
 * 3. Memvalidasi tanda tangan HMAC-SHA256 token sesi secara independen via Web Crypto API.
 * 4. Mencegah manipulasi session cookie di browser (tamper-proof stateless token).
 * 5. Menerapkan matriks RBAC (Role-Based Access Control) secara ketat:
 *    - ADMIN      : Akses penuh ke seluruh halaman dan panel sistem.
 *    - OPERATOR   : Hanya diizinkan mengakses /input dan /riwayat.
 *    - USER_SEKSI : Hanya diizinkan mengakses /request.
 * ============================================================================
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'daisha_auth_session';

/**
 * Verifikasi integritas dan masa berlaku token sesi di Edge Runtime.
 * 
 * @param token - String session token dari cookie `daisha_auth_session`
 * @returns Object status validitas token dan role pengguna yang terverifikasi
 */
async function verifyTokenEdge(token: string): Promise<{ valid: boolean; role?: string }> {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return { valid: false };

    let cleanToken = token;
    if (token.includes('%')) {
      try { cleanToken = decodeURIComponent(token); } catch { /* Abaikan jika bukan encoded */ }
    }

    const parts = cleanToken.split('|');
    // Format yang didukung: 4-part (lama) atau 5-part (baru dengan nama terenkripsi)
    if (parts.length !== 4 && parts.length !== 5) return { valid: false };

    const role = parts[1];
    const timestampStr = parts[2];
    const providedSignature = parts[parts.length - 1];

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return { valid: false };

    // Validasi masa aktif token: Maksimal 12 jam (sesuai siklus 1 shift operasional pabrik)
    const MAX_AGE_MS = 12 * 60 * 60 * 1000;
    if (Date.now() - timestamp > MAX_AGE_MS) return { valid: false };

    // Verifikasi HMAC-SHA256 menggunakan Web Crypto API standar W3C
    const encoder = new TextEncoder();
    const cryptoKey = await globalThis.crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const data = parts.slice(0, parts.length - 1).join('|');
    const signatureBytes = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Tolak jika signature hasil kalkulasi tidak cocok dengan yang dikirim client
    if (providedSignature !== expectedSignature) return { valid: false };

    return { valid: true, role };
  } catch {
    return { valid: false };
  }
}

/**
 * Middleware / Proxy Handler Utama
 * Mengecek otentikasi dan mengarahkan rute sesuai role pengguna.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { valid, role } = await verifyTokenEdge(token ?? '');

  const isLoginPage = pathname === '/login';

  // 1. PENGGUNA BELUM LOGIN / SESI KADALUWARSA
  // Arahkan ke halaman login, simpan parameter redirect URL awal
  if (!valid || !role) {
    if (!isLoginPage) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. PENGGUNA SUDAH LOGIN TETAPI MEMBUKA /login
  // Otomatis redirect ke landing page masing-masing role
  if (isLoginPage) {
    const destination = role === 'OPERATOR' ? '/input' : role === 'USER_SEKSI' ? '/request' : '/';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 3. ENFORCEMENT RBAC: OPERATOR
  // Hanya memiliki hak akses operasional lapangan (/input dan /riwayat)
  if (role === 'OPERATOR') {
    const allowedForOperator = pathname.startsWith('/input') || pathname.startsWith('/riwayat');
    if (!allowedForOperator) {
      return NextResponse.redirect(new URL('/input', request.url));
    }
  }

  // 4. ENFORCEMENT RBAC: USER_SEKSI
  // Hanya memiliki hak akses pengajuan pesanan seksinya (/request)
  if (role === 'USER_SEKSI') {
    const allowedForSeksi = pathname.startsWith('/request');
    if (!allowedForSeksi) {
      return NextResponse.redirect(new URL('/request', request.url));
    }
  }

  // 5. ENFORCEMENT RBAC: ADMIN
  // Memiliki otoritas penuh ke semua halaman (/portal, /daisha, /admin, /catalog, /users, /fleet, /spareparts, dll)
  return NextResponse.next();
}

/**
 * Filter matcher untuk Proxy Next.js:
 * Mencegah eksekusi middleware pada aset statis, font, icon, dan endpoint API internal
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest\\.json|manifest\\.webmanifest|sw\\.js|.*\\.png|.*\\.svg|.*\\.ico).*)',
  ],
};
