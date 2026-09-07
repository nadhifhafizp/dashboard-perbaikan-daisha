/**
 * proxy.ts — Next.js 16 Edge Runtime Proxy (pengganti middleware.ts)
 *
 * PENTING: File ini berjalan di Edge Runtime (bukan Node.js), sehingga:
 * - Tidak boleh import 'crypto' dari Node.js
 * - Tidak boleh import Prisma / database
 * - Harus menggunakan Web Crypto API (globalThis.crypto.subtle)
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'daisha_auth_session';

/**
 * Verifikasi token session menggunakan Web Crypto API (Edge-compatible).
 * Format token: base64(username)|role|timestamp|hmac_signature
 * Harus identik dengan generateHmacSignature di lib/crypto.ts
 */
async function verifyTokenEdge(token: string): Promise<{ valid: boolean; role?: string }> {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return { valid: false };

    let cleanToken = token;
    if (token.includes('%')) {
      try { cleanToken = decodeURIComponent(token); } catch { /* abaikan */ }
    }

    const parts = cleanToken.split('|');
    if (parts.length !== 4) return { valid: false };

    const [, role, timestampStr, providedSignature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return { valid: false };

    // Cek kadaluwarsa: 7 hari
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > MAX_AGE_MS) return { valid: false };

    // HMAC-SHA256 via Web Crypto API (Edge-compatible)
    const encoder = new TextEncoder();
    const cryptoKey = await globalThis.crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const data = parts.slice(0, 3).join('|');
    const signatureBytes = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (providedSignature !== expectedSignature) return { valid: false };

    return { valid: true, role };
  } catch {
    return { valid: false };
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { valid, role } = await verifyTokenEdge(token ?? '');

  const isLoginPage = pathname === '/login';

  // 1. Belum login → redirect ke halaman login
  if (!valid || !role) {
    if (!isLoginPage) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Sudah login tapi buka /login → redirect ke dashboard
  if (isLoginPage) {
    const destination = role === 'OPERATOR' ? '/input' : '/';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 3. Hak akses OPERATOR: hanya /input
  if (role === 'OPERATOR') {
    if (pathname === '/' || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/input', request.url));
    }
  }

  // 4. ADMIN memiliki akses ke semua halaman
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path kecuali:
     * - api (API routes — diproteksi oleh verifySessionToken masing-masing)
     * - _next/static, _next/image (aset statis)
     * - favicon.ico dan file publik lainnya
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)',
  ],
};
