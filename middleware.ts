import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseAndVerifySession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await parseAndVerifySession(token);

  const isLoginPage = pathname === '/login';

  // 1. Jika belum login dan mencoba mengakses rute aplikasi
  if (!session.valid || !session.user) {
    if (!isLoginPage) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Jika sudah login dan membuka halaman /login
  if (isLoginPage) {
    const destination = session.user.role === 'OPERATOR' ? '/input' : '/';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 3. Hak Akses Khusus OPERATOR (Hanya untuk input data)
  if (session.user.role === 'OPERATOR') {
    // Jika operator mencoba membuka Dashboard Rekap (/) atau Admin Panel (/admin)
    if (pathname === '/' || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/input', request.url));
    }
  }

  // 4. ATASAN memiliki akses ke semua halaman (/, /input, /admin)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo-bs.png, etc. (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)',
  ],
};
