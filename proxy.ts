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
    if (parts.length !== 4 && parts.length !== 5) return { valid: false };

    const role = parts[1];
    const timestampStr = parts[2];
    const providedSignature = parts[parts.length - 1];

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return { valid: false };

    // Cek kadaluwarsa: 12 jam (sesuai shift kerja pabrik)
    const MAX_AGE_MS = 12 * 60 * 60 * 1000;
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

    const data = parts.slice(0, parts.length - 1).join('|');
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

  // 2. Sudah login tapi buka /login → redirect ke halaman utama masing-masing role
  if (isLoginPage) {
    const destination = role === 'OPERATOR' ? '/input' : role === 'USER_SEKSI' ? '/request' : '/';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 3. Hak akses OPERATOR: hanya /input dan /riwayat
  if (role === 'OPERATOR') {
    if (pathname === '/' || pathname.startsWith('/admin') || pathname.startsWith('/request') || pathname.startsWith('/spareparts')) {
      return NextResponse.redirect(new URL('/input', request.url));
    }
  }

  // 4. Hak akses USER_SEKSI: hanya /request
  if (role === 'USER_SEKSI') {
    if (pathname === '/' || pathname.startsWith('/admin') || pathname.startsWith('/input') || pathname.startsWith('/spareparts')) {
      return NextResponse.redirect(new URL('/request', request.url));
    }
  }

  // 5. ADMIN memiliki akses ke semua halaman
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path kecuali:
     * - api (API routes — diproteksi oleh verifySessionToken masing-masing)
     * - _next/static, _next/image (aset statis)
     * - favicon.ico, manifest.json, sw.js dan file publik lainnya
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest\\.json|manifest\\.webmanifest|sw\\.js|.*\\.png|.*\\.svg|.*\\.ico).*)',
  ],
};
