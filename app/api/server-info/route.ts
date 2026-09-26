import { NextResponse } from 'next/server';
import { getServerInfo } from '@/lib/serverInfo';
import { requireAuth, checkRateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. RATE LIMITING (Maksimal 30 request/menit)
  const rateLimit = checkRateLimit(`server_info:${auth.ip}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan informasi server.' },
      { status: 429 }
    );
  }

  try {
    const info = getServerInfo();
    return NextResponse.json(info);
  } catch (error) {
    console.error('Error fetching server info:', error);
    return NextResponse.json(
      {
        ip: 'localhost',
        port: 3000,
        url: 'http://localhost:3000',
        formattedTitle: 'Daisha Maintenance | PT Bridgestone Tire Indonesia',
      },
      { status: 500 }
    );
  }
}
