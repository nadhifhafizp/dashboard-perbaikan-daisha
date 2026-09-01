import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { findUserByCredentials } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const user = findUserByCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      username: user.username,
      role: user.role,
      name: user.name,
    });

    // Operator langsung diarahkan ke form input, Atasan ke dashboard rekap
    const redirectUrl = user.role === 'OPERATOR' ? '/input' : '/';

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
      maxAge: 7 * 24 * 60 * 60, // 7 hari
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
