import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { findUserByCredentials } from '@/lib/users';
import {
  getClientIp,
  checkRateLimit,
  resetRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
} from '@/lib/security';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // Validasi ukuran payload maksimum 64KB
  const sizeCheck = validatePayloadSize(request, 64 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // Pembatasan laju login (5 kali percobaan di production, 50 di development)
  const maxAttempts = process.env.NODE_ENV === 'production' ? 5 : 50;
  const rateLimit = checkRateLimit(`login:${ip}`, maxAttempts, 5 * 60 * 1000);
  if (!rateLimit.allowed) {
    recordAuditLog({
      action: 'LOGIN_BLOCKED_RATE_LIMIT',
      ip,
      status: 'DENIED',
      details: `Melebihi batas ${maxAttempts} percobaan login`,
    });
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa menit.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    
    // 3. VALIDATION & SANITIZATION
    const rawUsername = sanitizeText(body.username, 50);
    const rawPassword = typeof body.password === 'string' ? body.password : '';

    if (!rawUsername || !rawPassword) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // 4. AUTHENTICATION
    const user = await findUserByCredentials(rawUsername, rawPassword);

    if (!user) {
      recordAuditLog({
        action: 'LOGIN_FAILED',
        ip,
        user: rawUsername,
        status: 'FAILED',
        details: 'Kredensial tidak cocok',
      });
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // 5. AUDIT LOGGING (Login Berhasil) & RESET RATE LIMIT
    resetRateLimit(`login:${ip}`);
    recordAuditLog({
      action: 'LOGIN_SUCCESS',
      ip,
      user: user.username,
      role: user.role,
      status: 'SUCCESS',
      details: `Nama: ${user.name}`,
    });

    const token = await createSessionToken({
      username: user.username,
      role: user.role,
      name: user.name,
      seksi: user.seksi,
    });

    // 6. AUTHORIZATION REDIRECT
    const redirectUrl = user.role === 'OPERATOR' ? '/input' : '/';

    const response = NextResponse.json({
      success: true,
      message: `Login berhasil sebagai ${user.name}`,
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
        seksi: user.seksi,
      },
      redirectUrl,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 jam (sesuai shift kerja)
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    recordAuditLog({
      action: 'LOGIN_EXCEPTION',
      ip,
      status: 'FAILED',
      details: error instanceof Error ? error.message : 'Internal Server Error',
    });
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat login.' },
      { status: 500 }
    );
  }
}
