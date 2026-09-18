import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { findUserByCredentials } from '@/lib/users';

// Rate limiting sederhana berbasis IP (5 percobaan gagal / 5 menit)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const now = Date.now();
    const attempt = loginAttempts.get(ip);

    // Rate limiting hanya diterapkan di mode production agar saat development lokal tidak terkunci
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && attempt && now < attempt.resetAt && attempt.count >= 5) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan login gagal. Coba lagi dalam 5 menit.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await findUserByCredentials(username, password);

    if (!user) {
      const current = (attempt && now < attempt.resetAt) ? attempt.count + 1 : 1;
      loginAttempts.set(ip, { count: current, resetAt: now + 5 * 60 * 1000 });
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    loginAttempts.delete(ip);

    const token = await createSessionToken({
      username: user.username,
      role: user.role,
      name: user.name,
    });

    // Operator → form input Daisha, User Seksi → halaman request, Admin → dashboard rekap
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
      maxAge: 12 * 60 * 60, // 12 jam (sesuai shift kerja pabrik)
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat login.' },
      { status: 500 }
    );
  }
}
