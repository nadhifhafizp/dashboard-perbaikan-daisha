import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAuth, sanitizeText } from '@/lib/security';

// In-memory cache singkat (15 detik) untuk mencegah query SQL berulang saat navigasi cepat
interface NotifCacheEntry {
  data: {
    success: boolean;
    notifications: Array<Record<string, unknown>>;
    unreadCount: number;
  };
  timestamp: number;
}
const notifCache = new Map<string, NotifCacheEntry>();
const NOTIF_CACHE_TTL_MS = 15_000;

function invalidateNotifCache() {
  notifCache.clear();
}

// GET: Ambil notifikasi terkini
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  const role = auth.user?.role || 'OPERATOR';
  const username = auth.user?.username || '';
  const cacheKey = `${role}:${username}`;

  const cached = notifCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < NOTIF_CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  try {
    // Lightweight query: Ambil kolom ringkas yang dibutuhkan UI saja (hindari SELECT *)
    const notifications = await sql`
      SELECT 
        id,
        "requestId",
        "nomorRequest",
        tipe,
        judul,
        pesan,
        link,
        "isRead",
        waktu
      FROM "SectionRequestNotification"
      WHERE (
        (${role}::text = 'ADMIN' AND "targetRole" IN ('ADMIN', 'MENTOR'))
        OR (${role}::text = 'USER_SEKSI' AND ("targetRole" = 'USER_SEKSI' OR "targetUser" = ${username}))
        OR (${role}::text = 'OPERATOR')
      )
      ORDER BY waktu DESC
      LIMIT 25
    `;

    const unreadCountRow = await sql`
      SELECT COUNT(*)::int as count
      FROM "SectionRequestNotification"
      WHERE "isRead" = FALSE
        AND (
          (${role}::text = 'ADMIN' AND "targetRole" IN ('ADMIN', 'MENTOR'))
          OR (${role}::text = 'USER_SEKSI' AND ("targetRole" = 'USER_SEKSI' OR "targetUser" = ${username}))
        )
    `;

    const responsePayload = {
      success: true,
      notifications,
      unreadCount: unreadCountRow[0]?.count || 0,
    };

    notifCache.set(cacheKey, {
      data: responsePayload,
      timestamp: Date.now(),
    });

    return NextResponse.json(responsePayload, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (err) {
    console.error('GET /api/section-requests/notifications error:', err);
    return NextResponse.json({ error: 'Gagal mengambil notifikasi.' }, { status: 500 });
  }
}

// POST: Tandai notifikasi telah dibaca
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const body = await request.json();
    const id = body.id;

    if (id === 'all') {
      await sql`UPDATE "SectionRequestNotification" SET "isRead" = TRUE WHERE "isRead" = FALSE`;
    } else if (typeof id === 'number') {
      await sql`UPDATE "SectionRequestNotification" SET "isRead" = TRUE WHERE id = ${id}`;
    }

    invalidateNotifCache();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/section-requests/notifications error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui notifikasi.' }, { status: 500 });
  }
}
