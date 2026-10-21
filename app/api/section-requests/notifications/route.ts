import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAuth, sanitizeText } from '@/lib/security';

// GET: Ambil notifikasi terkini
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const role = auth.user?.role || 'OPERATOR';
    const username = auth.user?.username || '';

    // Filter notifikasi sesuai role pengguna
    const notifications = await sql`
      SELECT *
      FROM "SectionRequestNotification"
      WHERE (
        (${role}::text = 'ADMIN' AND "targetRole" IN ('ADMIN', 'MENTOR'))
        OR (${role}::text = 'USER_SEKSI' AND ("targetRole" = 'USER_SEKSI' OR "targetUser" = ${username}))
        OR (${role}::text = 'OPERATOR')
      )
      ORDER BY waktu DESC
      LIMIT 30
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

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: unreadCountRow[0]?.count || 0,
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/section-requests/notifications error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui notifikasi.' }, { status: 500 });
  }
}
