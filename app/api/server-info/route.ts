import { NextResponse } from 'next/server';
import { getServerInfo } from '@/lib/serverInfo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
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
