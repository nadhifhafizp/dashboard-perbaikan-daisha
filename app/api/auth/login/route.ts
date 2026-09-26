import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { findUserByCredentials } from '@/lib/users';
import {
  getClientIp,
  checkRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
} from '@/lib/security';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // 1. FILE & PAYLOAD LIMIT (Maksimal 64KB untuk login payload)
  const sizeCheck = validatePayloadSize(request, 64 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // 2. RATE LIMITING (5 kali percobaan dalam 5 menit per IP)
  const rateLimit = checkRateLimit(`login:${ip}`, 5, 5 * 60 * 1000);
  if (!rateLimit.allowed) {
    recordAuditLog({
      action: 'LOGIN_BLOCKED_RATE_LIMIT',
      ip,
      status: 'DENIED',
      details: 'Melebihi batas 5 percobaan login',
    });
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan login gagal. Coba lagi dalam 5 menit.' },
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

    // 5. AUDIT LOGGING (Login Berhasil)
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
    });

    // 6. AUTHORIZATION REDIRECT
    const redirectUrl = user.role === 'OPERATOR' ? '/input' : user.role === 'USER_SEKSI' ? '/request' : '/';

    const response = NextResponse.json({
      success: true,
      message: `Login berhasil sebagai ${user.name}`,
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
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
