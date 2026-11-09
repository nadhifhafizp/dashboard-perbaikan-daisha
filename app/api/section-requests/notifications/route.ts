import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAuth } from '@/lib/security';

// In-memory cache singkat (10 detik) untuk mencegah query SQL berulang saat navigasi cepat
interface NotifCacheEntry {
  data: {
    success: boolean;
    notifications: Array<Record<string, unknown>>;
    unreadCount: number;
  };
  timestamp: number;
}
const notifCache = new Map<string, NotifCacheEntry>();
const NOTIF_CACHE_TTL_MS = 10_000;

function invalidateNotifCache() {
  notifCache.clear();
}

// GET: Ambil notifikasi terhitung langsung dari 10 tabel TWMS
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  const role = auth.user?.role || 'OPERATOR';
  const username = auth.user?.username || '';
  const seksi = auth.user?.seksi || '';
  const cacheKey = `${role}:${username}`;

  const cached = notifCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < NOTIF_CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  try {
    const notifications: Array<{
      id: string | number;
      requestId: number;
      nomorRequest: string;
      tipe: string;
      judul: string;
      pesan: string;
      link: string;
      isRead: boolean;
      waktu: string;
    }> = [];

    // 1. Notifikasi dari TWMSSectionRequest
    const pendingRequests = await sql`
      SELECT 
        sr."Id" AS id,
        sr."RequestNo" AS "nomorRequest",
        sr."Subject" AS perihal,
        sr."ItemTitle" AS "namaBarang",
        sr."RequesterSection" AS "seksiPemohon",
        sr."RequesterName" AS "picPemohon",
        sr."WorkflowStatus" AS status,
        sr."FlowStep" AS "flowStep",
        sr."UpdateDate" AS waktu
      FROM "TWMSSectionRequest" sr
      WHERE (
        (${role}::text = 'ADMIN' AND sr."FlowStep" IN ('STEP_3_DITERIMA_WORKSHOP', 'STEP_5_MENUNGGU_ATASAN_SPROJECT'))
        OR (${role}::text = 'USER_SEKSI' AND LOWER(sr."RequesterSection") = LOWER(${seksi}))
        OR (${role}::text = 'OPERATOR')
      )
      ORDER BY sr."UpdateDate" DESC
      LIMIT 20
    `;

    pendingRequests.forEach((r) => {
      notifications.push({
        id: `sr-${r.id}`,
        requestId: r.id,
        nomorRequest: r.nomorRequest,
        tipe: 'REQUEST_STATUS',
        judul: `Permohonan Seksi: ${r.nomorRequest}`,
        pesan: `${r.seksiPemohon} (${r.picPemohon}): ${r.perihal || r.namaBarang} [${r.status}]`,
        link: `/request`,
        isRead: false,
        waktu: (r.waktu ? new Date(r.waktu) : new Date()).toISOString(),
      });
    });

    // 2. Notifikasi antrean penjemputan Daisha PM dari TWMSMaintenanceLog
    if (role === 'ADMIN' || role === 'OPERATOR') {
      const stagingPickups = await sql`
        SELECT 
          min("Id") AS id,
          "SectionName" AS seksi,
          "StagingLocation" AS lokasi,
          count(*)::int AS unit_count,
          "StagingDate" AS waktu
        FROM "TWMSMaintenanceLog"
        WHERE "RecordType" = 'STAGING' AND "StagingStatus" = 'WAITING_PICKUP'
        GROUP BY "SectionName", "StagingLocation", "StagingDate"
        ORDER BY "StagingDate" DESC
        LIMIT 5
      `;

      stagingPickups.forEach((p) => {
        notifications.push({
          id: `staging-${p.id}`,
          requestId: p.id,
          nomorRequest: `STG-${p.id}`,
          tipe: 'PM_PICKUP',
          judul: `Unit PM Siap Dijemput - Seksi ${p.seksi}`,
          pesan: `${p.unit_count} unit Daisha siap dijemput di lokasi ${p.lokasi || '-'} untuk pemeliharaan berkala.`,
          link: `/maintenance`,
          isRead: false,
          waktu: (p.waktu ? new Date(p.waktu) : new Date()).toISOString(),
        });
      });
    }

    const responsePayload = {
      success: true,
      notifications,
      unreadCount: notifications.length,
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
    invalidateNotifCache();
    return NextResponse.json({ success: true, message: 'Status notifikasi diperbarui.' });
  } catch (err) {
    console.error('POST /api/section-requests/notifications error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
