import { NextResponse } from 'next/server';
import sql, { withTransaction } from '@/lib/db';
import { requireAuth, checkRateLimit, sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface PmStagingItem {
  id: number;
  seksi: string;
  units: string[];
  lokasi: string;
  catatan: string | null;
  pelapor: string;
  status: 'WAITING_PICKUP' | 'PICKED_UP' | 'COMPLETED';
  createdAt: string;
  pickedUpAt: string | null;
  completedAt: string | null;
}

/**
 * GET /api/maintenance/staging?seksi=Building
 * Mengambil daftar unit yang disiapkan seksi untuk penjemputan PM dari TWMSMaintenanceLog
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { searchParams } = new URL(request.url);
    const rawSeksi = sanitizeText(searchParams.get('seksi') || '', 50);
    const querySeksi =
      rawSeksi && !['all seksi', 'semua seksi', 'all', 'semua'].includes(rawSeksi.toLowerCase())
        ? rawSeksi
        : null;

    const rows = await sql<PmStagingItem[]>`
      SELECT 
        min("Id") AS id,
        "SectionName" AS seksi,
        json_agg("UnitCode" ORDER BY "UnitCode") AS units,
        COALESCE("StagingLocation", '-') AS lokasi,
        "Notes" AS catatan,
        COALESCE("ReporterName", '-') AS pelapor,
        COALESCE("StagingStatus", 'WAITING_PICKUP') AS status,
        "StagingDate" AS "createdAt",
        "PickedUpDate" AS "pickedUpAt",
        "CompletedDate" AS "completedAt"
      FROM "TWMSMaintenanceLog"
      WHERE "RecordType" = 'STAGING'
        AND (${querySeksi}::text IS NULL OR LOWER("SectionName") = LOWER(${querySeksi}))
      GROUP BY "StagingDate", "StagingLocation", "ReporterName", "SectionName", "StagingStatus", "PickedUpDate", "CompletedDate", "Notes"
      ORDER BY "StagingDate" DESC
      LIMIT 100
    `;

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (err: unknown) {
    console.error('GET /api/maintenance/staging error:', err);
    return NextResponse.json(
      { error: 'Gagal mengambil data kesiapan PM seksi.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/maintenance/staging
 * Membuat pemberitahuan kesiapan penjemputan PM ke Workshop atau update status penjemputan
 */
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  // Rate Limiting (30 req/menit)
  const rateLimit = checkRateLimit(`pm_staging:${auth.ip}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Silakan tunggu sesaat.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const action = body.action || 'CREATE';

    // 1. Seksi memberitahukan unit siap di-PM
    if (action === 'CREATE') {
      const seksi = sanitizeText(body.seksi || auth.user?.seksi || 'Plant', 50);
      const lokasi = sanitizeText(body.lokasi || '', 255);
      const catatan = sanitizeText(body.catatan || '', 500);
      const pelapor = sanitizeText(body.pelapor || auth.user?.name || auth.user?.username || 'User Seksi', 100);
      const unitsRaw: unknown = body.units;

      if (!lokasi) {
        return NextResponse.json(
          { error: 'Lokasi penjemputan unit wajib dicantumkan agar tim workshop dapat mengambil unit.' },
          { status: 400 }
        );
      }

      if (!Array.isArray(unitsRaw) || unitsRaw.length === 0) {
        return NextResponse.json(
          { error: 'Pilih minimal satu unit Daisha yang sudah disiapkan untuk PM.' },
          { status: 400 }
        );
      }

      const cleanUnits: string[] = unitsRaw
        .map((u) => String(u).trim().toUpperCase())
        .filter((u) => u.length > 0);

      if (cleanUnits.length === 0) {
        return NextResponse.json(
          { error: 'Daftar nomor unit tidak valid.' },
          { status: 400 }
        );
      }

      const now = new Date();
      const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Simpan 1 baris per unit di TWMSMaintenanceLog
      const firstId = await withTransaction(async (tx) => {
        let createdFirstId = 0;
        for (let i = 0; i < cleanUnits.length; i++) {
          const u = cleanUnits[i];
          const [row] = await tx<Array<{ Id: number }>>`
            INSERT INTO "TWMSMaintenanceLog" (
              "UnitCode", "SectionName", "RecordType", "PeriodMonth",
              "StagingStatus", "StagingLocation", "ReporterName",
              "StagingDate", "Notes", "UpdateDate"
            )
            VALUES (
              ${u}, ${seksi}, 'STAGING', ${periodMonth},
              'WAITING_PICKUP', ${lokasi}, ${pelapor},
              ${now}, ${catatan || null}, NOW()
            )
            RETURNING "Id"
          `;
          if (i === 0) createdFirstId = row.Id;
        }

        return createdFirstId;
      });

      return NextResponse.json({
        success: true,
        message: `Pemberitahuan berhasil dikirim ke Workshop! ${cleanUnits.length} unit Daisha tercatat siap dijemput di ${lokasi}.`,
        data: {
          id: firstId,
          seksi,
          units: cleanUnits,
          lokasi,
          catatan,
          pelapor,
          status: 'WAITING_PICKUP',
          createdAt: now.toISOString(),
        },
      });
    }

    // 2. Workshop memperbarui status (Diambil / Selesai)
    if (action === 'UPDATE_STATUS') {
      const id = parseInt(body.id, 10);
      const newStatus = sanitizeText(body.status, 50);

      if (!id || !['WAITING_PICKUP', 'PICKED_UP', 'COMPLETED'].includes(newStatus)) {
        return NextResponse.json(
          { error: 'ID penjemputan atau status tidak valid.' },
          { status: 400 }
        );
      }

      const updated = await withTransaction(async (tx) => {
        // Cari informasi grup staging berdasarkan Id
        const [target] = await tx<Array<{
          StagingDate: Date;
          StagingLocation: string | null;
          ReporterName: string | null;
        }>>`
          SELECT "StagingDate", "StagingLocation", "ReporterName"
          FROM "TWMSMaintenanceLog"
          WHERE "Id" = ${id} AND "RecordType" = 'STAGING'
          LIMIT 1
        `;

        if (!target) return null;

        await tx`
          UPDATE "TWMSMaintenanceLog"
          SET 
            "StagingStatus" = ${newStatus},
            "PickedUpDate" = CASE WHEN ${newStatus} = 'PICKED_UP' AND "PickedUpDate" IS NULL THEN NOW() ELSE "PickedUpDate" END,
            "CompletedDate" = CASE WHEN ${newStatus} = 'COMPLETED' THEN NOW() ELSE "CompletedDate" END,
            "UpdateDate" = NOW()
          WHERE "RecordType" = 'STAGING'
            AND "StagingDate" = ${target.StagingDate}
            AND COALESCE("StagingLocation", '') = COALESCE(${target.StagingLocation}, '')
            AND COALESCE("ReporterName", '') = COALESCE(${target.ReporterName}, '')
        `;

        return { id, status: newStatus };
      });

      if (!updated) {
        return NextResponse.json({ error: 'Data penjemputan tidak ditemukan.' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Status penjemputan berhasil diperbarui menjadi ${newStatus}.`,
        data: updated,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal.' }, { status: 400 });
  } catch (err: unknown) {
    console.error('POST /api/maintenance/staging error:', err);
    return NextResponse.json(
      { error: 'Gagal memproses data penjemputan PM.' },
      { status: 500 }
    );
  }
}
