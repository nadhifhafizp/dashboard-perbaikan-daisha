import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import {
  requireAuth,
  checkRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
  validatePositiveInt,
} from '@/lib/security';

// GET: Ambil daftar sparepart beserta log mutasi terakhir (Khusus ADMIN)
export async function GET(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. RATE LIMITING (60 req/menit)
  const rateLimit = checkRateLimit(`spareparts_get:${auth.ip}`, 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan inventaris.' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const withLogs = searchParams.get('logs') === 'true';
    const kategori = searchParams.get('kategori');
    const filterKategori = kategori && kategori !== 'all' ? sanitizeText(kategori, 50) : null;

    const spareparts = withLogs
      ? await sql`
          SELECT 
            s.*,
            COALESCE(
              (
                SELECT json_agg(l)
                FROM (
                  SELECT sl.*
                  FROM "SparepartLog" sl
                  WHERE sl."namaKomponen" = s."namaKomponen"
                  ORDER BY sl.tanggal DESC
                  LIMIT 50
                ) l
              ),
              '[]'::json
            ) as logs
          FROM "Sparepart" s
          WHERE (${filterKategori}::text IS NULL OR s.kategori = ${filterKategori})
          ORDER BY s."namaKomponen" ASC
        `
      : await sql`
          SELECT *
          FROM "Sparepart"
          WHERE (${filterKategori}::text IS NULL OR kategori = ${filterKategori})
          ORDER BY "namaKomponen" ASC
        `;

    return NextResponse.json({ success: true, spareparts });
  } catch (error) {
    console.error('GET /api/spareparts error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data spareparts.' }, { status: 500 });
  }
}

// POST: CRUD spareparts & mutasi stok (Khusus ADMIN)
export async function POST(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. FILE & PAYLOAD SIZE LIMIT (Maksimal 128KB)
  const sizeCheck = validatePayloadSize(request, 128 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // 3. RATE LIMITING (40 req/menit)
  const rateLimit = checkRateLimit(`spareparts_post:${auth.ip}`, 40, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak transaksi suku cadang.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const action = sanitizeText(body.action, 30);

    // 1. Tambah sparepart baru
    if (action === 'CREATE') {
      const namaKomponen = sanitizeText(body.namaKomponen, 100);
      const kategori = sanitizeText(body.kategori, 50) || 'Umum';
      const stokGudang = validatePositiveInt(body.stokGudang ?? 0, 'Stok Gudang', 0, 100000).value;
      const satuan = sanitizeText(body.satuan, 20);
      const minStok = validatePositiveInt(body.minStok ?? 0, 'Min Stok', 0, 100000).value;
      const lokasi = sanitizeText(body.lokasi, 100);

      if (!namaKomponen || !satuan) {
        return NextResponse.json({ error: 'Nama komponen dan satuan wajib diisi.' }, { status: 400 });
      }

      const [exists] = await sql`SELECT "namaKomponen" FROM "Sparepart" WHERE "namaKomponen" = ${namaKomponen} LIMIT 1`;
      if (exists) {
        return NextResponse.json({ error: `Sparepart "${namaKomponen}" sudah ada.` }, { status: 400 });
      }

      const [created] = await sql`
        INSERT INTO "Sparepart" ("namaKomponen", kategori, "stokGudang", satuan, "minStok", lokasi)
        VALUES (${namaKomponen}, ${kategori}, ${stokGudang}, ${satuan}, ${minStok}, ${lokasi || null})
        RETURNING *
      `;

      if (stokGudang > 0) {
        await sql`
          INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, keterangan, tanggal)
          VALUES (${namaKomponen}, 'IN', ${stokGudang}, 'Stok awal saat pendaftaran', NOW())
        `;
      }

      recordAuditLog({
        action: 'SPAREPART_CREATE',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: namaKomponen,
        details: `Stok Awal: ${stokGudang} ${satuan}`,
      });

      return NextResponse.json({ success: true, message: `Sparepart "${namaKomponen}" berhasil ditambahkan.`, sparepart: created });
    }

    // 2. Update info sparepart
    if (action === 'UPDATE') {
      const namaKomponen = sanitizeText(body.namaKomponen, 100);
      const kategori = body.kategori !== undefined ? sanitizeText(body.kategori, 50) : undefined;
      const satuan = body.satuan !== undefined ? sanitizeText(body.satuan, 20) : undefined;
      const minStok = body.minStok !== undefined ? validatePositiveInt(body.minStok, 'Min Stok', 0, 100000).value : undefined;
      const lokasi = body.lokasi !== undefined ? sanitizeText(body.lokasi, 100) : undefined;

      if (!namaKomponen) {
        return NextResponse.json({ error: 'Nama komponen wajib diisi.' }, { status: 400 });
      }

      const [current] = await sql<Array<{
        kategori: string;
        satuan: string;
        minStok: number;
        lokasi: string | null;
      }>>`
        SELECT kategori, satuan, "minStok", lokasi
        FROM "Sparepart"
        WHERE "namaKomponen" = ${namaKomponen}
      `;

      if (!current) {
        return NextResponse.json({ error: 'Sparepart tidak ditemukan.' }, { status: 404 });
      }

      const [updated] = await sql`
        UPDATE "Sparepart"
        SET
          kategori = ${kategori !== undefined ? kategori : current.kategori},
          satuan = ${satuan !== undefined ? satuan : current.satuan},
          "minStok" = ${minStok !== undefined ? minStok : current.minStok},
          lokasi = ${lokasi !== undefined ? lokasi : current.lokasi}
        WHERE "namaKomponen" = ${namaKomponen}
        RETURNING *
      `;

      recordAuditLog({
        action: 'SPAREPART_UPDATE',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: namaKomponen,
      });

      return NextResponse.json({ success: true, message: 'Info sparepart diperbarui.', sparepart: updated });
    }

    // 3. Restock (tambah stok masuk)
    if (action === 'RESTOCK') {
      const namaKomponen = sanitizeText(body.namaKomponen, 100);
      const qty = validatePositiveInt(body.qty, 'Jumlah restock', 1, 10000).value;
      const keterangan = sanitizeText(body.keterangan, 255) || 'Restock manual';

      if (!namaKomponen || !body.qty) {
        return NextResponse.json({ error: 'Nama komponen dan jumlah restock wajib diisi.' }, { status: 400 });
      }

      await sql.begin(async (tx) => {
        await tx`
          UPDATE "Sparepart"
          SET "stokGudang" = "stokGudang" + ${qty}
          WHERE "namaKomponen" = ${namaKomponen}
        `;
        await tx`
          INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, keterangan, tanggal)
          VALUES (${namaKomponen}, 'IN', ${qty}, ${keterangan}, NOW())
        `;
      });

      recordAuditLog({
        action: 'SPAREPART_RESTOCK',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: namaKomponen,
        details: `+${qty} unit (${keterangan})`,
      });

      return NextResponse.json({ success: true, message: `Restock ${qty} unit berhasil.` });
    }

    // 4. Pemakaian manual (pengeluaran stok)
    if (action === 'USE') {
      const namaKomponen = sanitizeText(body.namaKomponen, 100);
      const qty = validatePositiveInt(body.qty, 'Jumlah pemakaian', 1, 10000).value;
      const referensi = sanitizeText(body.referensi, 50);
      const keterangan = sanitizeText(body.keterangan, 255) || 'Pemakaian manual';

      if (!namaKomponen || !body.qty) {
        return NextResponse.json({ error: 'Nama komponen dan jumlah pemakaian wajib diisi.' }, { status: 400 });
      }

      const [sparepart] = await sql<Array<{ stokGudang: number }>>`
        SELECT "stokGudang" FROM "Sparepart" WHERE "namaKomponen" = ${namaKomponen} LIMIT 1
      `;
      if (!sparepart) {
        return NextResponse.json({ error: `Sparepart "${namaKomponen}" tidak ditemukan.` }, { status: 404 });
      }
      if (sparepart.stokGudang < qty) {
        return NextResponse.json({ error: `Stok tidak mencukupi (sisa: ${sparepart.stokGudang}).` }, { status: 400 });
      }

      await sql.begin(async (tx) => {
        await tx`
          UPDATE "Sparepart"
          SET "stokGudang" = "stokGudang" - ${qty}
          WHERE "namaKomponen" = ${namaKomponen}
        `;
        await tx`
          INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, referensi, keterangan, tanggal)
          VALUES (${namaKomponen}, 'OUT', ${qty}, ${referensi || null}, ${keterangan}, NOW())
        `;
      });

      recordAuditLog({
        action: 'SPAREPART_USAGE',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: namaKomponen,
        details: `-${qty} unit (${keterangan})`,
      });

      return NextResponse.json({ success: true, message: `Pengeluaran ${qty} unit berhasil.` });
    }

    // 5. Hapus sparepart
    if (action === 'DELETE') {
      const namaKomponen = sanitizeText(body.namaKomponen, 100);
      if (!namaKomponen) {
        return NextResponse.json({ error: 'Nama komponen wajib diisi.' }, { status: 400 });
      }

      await sql.begin(async (tx) => {
        await tx`DELETE FROM "SparepartLog" WHERE "namaKomponen" = ${namaKomponen}`;
        await tx`DELETE FROM "SectionRequestMaterial" WHERE "namaKomponen" = ${namaKomponen}`;
        await tx`DELETE FROM "Sparepart" WHERE "namaKomponen" = ${namaKomponen}`;
      });

      recordAuditLog({
        action: 'SPAREPART_DELETE',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: namaKomponen,
      });

      return NextResponse.json({ success: true, message: `Sparepart "${namaKomponen}" berhasil dihapus.` });
    }

    // 6. GET logs untuk sparepart tertentu
    if (action === 'GET_LOGS') {
      const namaKomponen = sanitizeText(body.namaKomponen, 100);
      const logs = namaKomponen
        ? await sql`
            SELECT * FROM "SparepartLog"
            WHERE "namaKomponen" = ${namaKomponen}
            ORDER BY tanggal DESC
            LIMIT 100
          `
        : await sql`
            SELECT * FROM "SparepartLog"
            ORDER BY tanggal DESC
            LIMIT 100
          `;
      return NextResponse.json({ success: true, logs });
    }

    return NextResponse.json({ error: 'Action tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/spareparts error:', error);
    recordAuditLog({
      action: 'SPAREPART_ERROR',
      ip: auth.ip,
      user: auth.user?.username,
      status: 'FAILED',
      details: error instanceof Error ? error.message : 'Internal Server Error',
    });
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
