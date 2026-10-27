import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseAndVerifySessionEdge, SESSION_COOKIE_NAME } from './lib/authEdge';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Tracing ID (F8.2): Buat requestId unik untuk observabilitas lintas layer
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  const makeResponse = (res?: NextResponse) => {
    const finalRes = res || NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    finalRes.headers.set('x-request-id', requestId);
    return finalRes;
  };

  // 1. Dapatkan token sesi dari cookie HTTP
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const verification = await parseAndVerifySessionEdge(sessionToken);
  const isAuthenticated = verification.valid && Boolean(verification.user);
  const userRole = verification.user?.role;

  // 2. Proteksi Halaman Login: Jika sudah login, arahkan ke dashboard
  if (pathname === '/login') {
    if (isAuthenticated) {
      const redirectUrl = userRole === 'ADMIN' ? '/admin' : '/';
      return makeResponse(NextResponse.redirect(new URL(redirectUrl, request.url)));
    }
    return makeResponse();
  }

  // 3. Rute Khusus Approval Form (/request/approval)
  // Catatan: Jika ada token approval di query string (misal dari tautan email atasan),
  // izinkan atasan membuka formulir persetujuan langsung tanpa akun login.
  if (pathname.startsWith('/request/approval')) {
    const hasToken = searchParams.has('token');
    if (hasToken) {
      return makeResponse();
    }
    // Jika tanpa token, wajib terautentikasi sebagai Admin / Operator
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return makeResponse(NextResponse.redirect(loginUrl));
    }
    return makeResponse();
  }

  // 4. Proteksi Rute Sensitif Admin & Manajemen Pengguna (/admin, /users)
  // Hanya role ADMIN yang memiliki otoritas penuh
  if (pathname.startsWith('/admin') || pathname.startsWith('/users')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return makeResponse(NextResponse.redirect(loginUrl));
    }

    if (userRole !== 'ADMIN') {
      // Role non-admin dilarang masuk ke panel kontrol admin
      return makeResponse(NextResponse.redirect(new URL('/', request.url)));
    }

    return makeResponse();
  }

  // 5. Proteksi Rute Workshop Maintenance (/maintenance)
  // Hanya ADMIN dan OPERATOR yang dapat mengelola staging & PM unit Daisha
  if (pathname.startsWith('/maintenance')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return makeResponse(NextResponse.redirect(loginUrl));
    }

    if (userRole === 'USER_SEKSI') {
      // User seksi plant diarahkan ke halaman pelaporan atau pelacakan
      return makeResponse(NextResponse.redirect(new URL('/riwayat', request.url)));
    }

    return makeResponse();
  }

  return makeResponse();
}

/**
 * Konfigurasi Matcher:
 * Mencegah middleware dieksekusi pada aset statis PWA, Next.js internal, dan file gambar
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js, manifest.json (PWA files)
     * - icon-*.png, logo-*.png (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icon-.*\\.png|logo-.*\\.png).*)',
  ],
};
