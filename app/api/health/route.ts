import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import sql from '@/lib/db';

/**
 * GET /api/health
 * 
 * Health check endpoint untuk memverifikasi kesiapan aplikasi dan koneksi database
 * tanpa mengekspos data internal (F8.4).
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const startTime = Date.now();

  try {
    const [result] = await sql`SELECT 1 as alive`;
    const latencyMs = Date.now() - startTime;

    if (!result || result.alive !== 1) {
      throw new Error('Database ping return unexpected result');
    }

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          latencyMs,
        },
      },
      {
        status: 200,
        headers: {
          'x-request-id': requestId,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[HealthCheck Error]', { requestId, error });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'disconnected',
        },
        error: {
          message: 'Database connection failed',
          requestId,
        },
      },
      {
        status: 503,
        headers: {
          'x-request-id': requestId,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
