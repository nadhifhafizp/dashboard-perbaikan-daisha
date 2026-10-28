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
 * Mengambil daftar unit yang disiapkan seksi untuk penjemputan PM
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { searchParams } = new URL(request.url);
    const querySeksi = sanitizeText(searchParams.get('seksi') || '', 50);

    let rows: PmStagingItem[] = [];
    if (
      querySeksi &&
      querySeksi.toLowerCase() !== 'all seksi' &&
      querySeksi.toLowerCase() !== 'semua seksi'
    ) {
      rows = await sql<PmStagingItem[]>`
        SELECT 
          "id",
          "seksi",
          "units",
          "lokasi",
          "catatan",
          "pelapor",
          "status",
          "createdAt",
          "pickedUpAt",
          "completedAt"
        FROM "PmStaging"
        WHERE LOWER("seksi") = LOWER(${querySeksi})
        ORDER BY "createdAt" DESC
        LIMIT 50
      `;
    } else {
      rows = await sql<PmStagingItem[]>`
        SELECT 
          "id",
          "seksi",
          "units",
          "lokasi",
          "catatan",
          "pelapor",
          "status",
          "createdAt",
          "pickedUpAt",
          "completedAt"
        FROM "PmStaging"
        ORDER BY "createdAt" DESC
        LIMIT 100
      `;
    }

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

      // Simpan ke tabel PmStaging & notifikasi dalam 1 transaksi atomik aman
      const inserted = await withTransaction(async (tx) => {
        const [row] = await tx<PmStagingItem[]>`
          INSERT INTO "PmStaging" ("seksi", "units", "lokasi", "catatan", "pelapor", "status", "createdAt")
          VALUES (
            ${seksi},
            ${tx.json(cleanUnits)},
            ${lokasi},
            ${catatan || null},
            ${pelapor},
            'WAITING_PICKUP',
            NOW()
          )
          RETURNING *
        `;

        // Kirim notifikasi lonceng ke tim Workshop (ADMIN & OPERATOR)
        const notifPesan = `Seksi ${seksi} telah menyiapkan ${cleanUnits.length} unit Daisha (${cleanUnits.join(', ')}) untuk pemeliharaan berkala (PM) di lokasi: ${lokasi}. Silakan tim Workshop mengambil unit.`;

        await tx`
          INSERT INTO "SectionRequestNotification" 
            ("targetRole", "tipe", "judul", "pesan", "link", "isRead", "waktu")
          VALUES 
            ('ADMIN', 'PM_PICKUP', ${'Unit PM Siap Dijemput - Seksi ' + seksi}, ${notifPesan}, '/maintenance', false, NOW()),
            ('OPERATOR', 'PM_PICKUP', ${'Unit PM Siap Dijemput - Seksi ' + seksi}, ${notifPesan}, '/maintenance', false, NOW())
        `;

        return row;
      });

      return NextResponse.json({
        success: true,
        message: `Pemberitahuan berhasil dikirim ke Workshop! ${cleanUnits.length} unit Daisha tercatat siap dijemput di ${lokasi}.`,
        data: inserted,
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
        const [row] = await tx<PmStagingItem[]>`
          UPDATE "PmStaging"
          SET 
            "status" = ${newStatus},
            "pickedUpAt" = CASE WHEN ${newStatus} = 'PICKED_UP' AND "pickedUpAt" IS NULL THEN NOW() ELSE "pickedUpAt" END,
            "completedAt" = CASE WHEN ${newStatus} = 'COMPLETED' THEN NOW() ELSE "completedAt" END
          WHERE "id" = ${id}
          RETURNING *
        `;

        if (!row) return null;

        // Kirim notifikasi balik ke Seksi jika status berubah
        if (newStatus === 'PICKED_UP') {
          const pesan = `Tim Workshop telah mengambil ${row.units.length} unit Daisha dari lokasi ${row.lokasi} dan saat ini sedang dilakukan pemeliharaan berkala (PM).`;
          await tx`
            INSERT INTO "SectionRequestNotification" 
              ("targetRole", "tipe", "judul", "pesan", "link", "isRead", "waktu")
            VALUES 
              ('USER_SEKSI', 'PM_IN_PROGRESS', ${'Unit Daisha Sedang Di-PM di Workshop'}, ${pesan}, '/maintenance', false, NOW())
          `;
        } else if (newStatus === 'COMPLETED') {
          const pesan = `Pemeliharaan berkala (PM) untuk ${row.units.length} unit Daisha (${row.units.join(', ')}) telah selesai dikerjakan oleh tim Workshop. Unit siap digunakan kembali.`;
          await tx`
            INSERT INTO "SectionRequestNotification" 
              ("targetRole", "tipe", "judul", "pesan", "link", "isRead", "waktu")
            VALUES 
              ('USER_SEKSI', 'PM_COMPLETED', ${'PM Unit Daisha Selesai Diservis'}, ${pesan}, '/maintenance', false, NOW())
          `;
        }

        return row;
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
