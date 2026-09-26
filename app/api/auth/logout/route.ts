import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseAndVerifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { getClientIp, recordAuditLog } from '@/lib/security';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await parseAndVerifySession(token);

  recordAuditLog({
    action: 'LOGOUT',
    ip,
    user: session.user?.username,
    role: session.user?.role,
    status: 'SUCCESS',
    details: 'User mengakhiri sesi',
  });

  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil',
  });

  // Hapus cookie sesi
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
