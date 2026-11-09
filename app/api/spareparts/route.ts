import { NextResponse } from 'next/server';
import sql, { withTransaction } from '@/lib/db';
import {
  requireAuth,
  checkRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
  validatePositiveInt,
} from '@/lib/security';

// GET: Ambil daftar sparepart beserta stok gudang dan mutasi
export async function GET(request: Request) {
  // Verifikasi otorisasi (ADMIN, OPERATOR, USER_SEKSI berhak membaca stok sparepart)
  const auth = await requireAuth(request, ['ADMIN', 'OPERATOR', 'USER_SEKSI']);
  if (!auth.authorized) return auth.errorResponse!;

  // Pembatasan laju permintaan (rate limiting 60 req/menit)
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
            s."Id" AS id,
            s."PartName" AS "namaKomponen",
            s."Category" AS kategori,
            s."CurrentStock" AS "stokGudang",
            s."Unit" AS satuan,
            s."MinStock" AS "minStok",
            s."LocationRack" AS lokasi,
            s."UpdateDate" AS "updatedAt",
            COALESCE(
              (
                SELECT json_agg(l)
                FROM (
                  SELECT 
                    sl."Id" AS id,
                    sl."SparepartId" AS "sparepartId",
                    sl."PartName" AS "namaKomponen",
                    sl."MovementType" AS tipe,
                    sl."Qty" AS qty,
                    sl."TicketId" AS referensi,
                    sl."Notes" AS keterangan,
                    sl."MovementDate" AS tanggal
                  FROM "TWMSSparepartLog" sl
                  WHERE sl."SparepartId" = s."Id" OR UPPER(TRIM(sl."PartName")) = UPPER(TRIM(s."PartName"))
                  ORDER BY sl."MovementDate" DESC
                  LIMIT 50
                ) l
              ),
              '[]'::json
            ) AS logs
          FROM "TWMSSparepartMaster" s
          WHERE (${filterKategori}::text IS NULL OR s."Category" = ${filterKategori})
          ORDER BY s."PartName" ASC
        `
      : await sql`
          SELECT 
            s."Id" AS id,
            s."PartName" AS "namaKomponen",
            s."Category" AS kategori,
            s."CurrentStock" AS "stokGudang",
            s."Unit" AS satuan,
            s."MinStock" AS "minStok",
            s."LocationRack" AS lokasi,
            s."UpdateDate" AS "updatedAt"
          FROM "TWMSSparepartMaster" s
          WHERE (${filterKategori}::text IS NULL OR s."Category" = ${filterKategori})
          ORDER BY s."PartName" ASC
        `;

    return NextResponse.json({ success: true, spareparts });
  } catch (error) {
    console.error('GET /api/spareparts error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data spareparts.' }, { status: 500 });
  }
}

// POST: CRUD spareparts & mutasi stok (Khusus ADMIN)
export async function POST(request: Request) {
  // Verifikasi otorisasi admin
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  // Validasi ukuran payload maksimum 128KB
  const sizeCheck = validatePayloadSize(request, 128 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // Pembatasan laju permintaan (rate limiting 40 req/menit)
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

      const [exists] = await sql`
        SELECT "Id" FROM "TWMSSparepartMaster" 
        WHERE UPPER(TRIM("PartName")) = UPPER(TRIM(${namaKomponen})) 
        LIMIT 1
      `;
      if (exists) {
        return NextResponse.json({ error: `Sparepart "${namaKomponen}" sudah ada.` }, { status: 400 });
      }

      const created = await withTransaction(async (tx) => {
        const [row] = await tx`
          INSERT INTO "TWMSSparepartMaster" ("PartName", "Category", "CurrentStock", "Unit", "MinStock", "LocationRack", "UpdateDate")
          VALUES (${namaKomponen}, ${kategori}, ${stokGudang}, ${satuan}, ${minStok}, ${lokasi || null}, NOW())
          RETURNING "Id" AS id, "PartName" AS "namaKomponen", "Category" AS kategori, "CurrentStock" AS "stokGudang", "Unit" AS satuan, "MinStock" AS "minStok", "LocationRack" AS lokasi
        `;

        if (stokGudang > 0) {
          await tx`
            INSERT INTO "TWMSSparepartLog" ("SparepartId", "PartName", "MovementType", "Qty", "Notes", "MovementDate")
            VALUES (${row.id}, ${namaKomponen}, 'IN', ${stokGudang}, 'Stok awal saat pendaftaran', NOW())
          `;
        }

        return row;
      });

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
        Id: number;
        Category: string;
        Unit: string;
        MinStock: number;
        LocationRack: string | null;
      }>>`
        SELECT "Id", "Category", "Unit", "MinStock", "LocationRack"
        FROM "TWMSSparepartMaster"
        WHERE UPPER(TRIM("PartName")) = UPPER(TRIM(${namaKomponen}))
        LIMIT 1
      `;

      if (!current) {
        return NextResponse.json({ error: 'Sparepart tidak ditemukan.' }, { status: 404 });
      }

      const [updated] = await sql`
        UPDATE "TWMSSparepartMaster"
        SET
          "Category" = ${kategori !== undefined ? kategori : current.Category},
          "Unit" = ${satuan !== undefined ? satuan : current.Unit},
          "MinStock" = ${minStok !== undefined ? minStok : current.MinStock},
          "LocationRack" = ${lokasi !== undefined ? lokasi : current.LocationRack},
          "UpdateDate" = NOW()
        WHERE "Id" = ${current.Id}
        RETURNING "Id" AS id, "PartName" AS "namaKomponen", "Category" AS kategori, "CurrentStock" AS "stokGudang", "Unit" AS satuan, "MinStock" AS "minStok", "LocationRack" AS lokasi
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

      await withTransaction(async (tx) => {
        const [target] = await tx<Array<{ Id: number; PartName: string }>>`
          SELECT "Id", "PartName" FROM "TWMSSparepartMaster"
          WHERE UPPER(TRIM("PartName")) = UPPER(TRIM(${namaKomponen}))
          LIMIT 1
        `;

        if (!target) {
          throw new Error(`Sparepart "${namaKomponen}" tidak ditemukan.`);
        }

        await tx`
          UPDATE "TWMSSparepartMaster"
          SET "CurrentStock" = "CurrentStock" + ${qty}, "UpdateDate" = NOW()
          WHERE "Id" = ${target.Id}
        `;

        await tx`
          INSERT INTO "TWMSSparepartLog" ("SparepartId", "PartName", "MovementType", "Qty", "Notes", "MovementDate")
          VALUES (${target.Id}, ${target.PartName}, 'IN', ${qty}, ${keterangan}, NOW())
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

      const [sparepart] = await sql<Array<{ Id: number; PartName: string; CurrentStock: number }>>`
        SELECT "Id", "PartName", "CurrentStock" FROM "TWMSSparepartMaster" 
        WHERE UPPER(TRIM("PartName")) = UPPER(TRIM(${namaKomponen})) 
        LIMIT 1
      `;
      if (!sparepart) {
        return NextResponse.json({ error: `Sparepart "${namaKomponen}" tidak ditemukan.` }, { status: 404 });
      }
      if (sparepart.CurrentStock < qty) {
        return NextResponse.json({ error: `Stok tidak mencukupi (sisa: ${sparepart.CurrentStock}).` }, { status: 400 });
      }

      await withTransaction(async (tx) => {
        await tx`
          UPDATE "TWMSSparepartMaster"
          SET "CurrentStock" = "CurrentStock" - ${qty}, "UpdateDate" = NOW()
          WHERE "Id" = ${sparepart.Id}
        `;
        await tx`
          INSERT INTO "TWMSSparepartLog" ("SparepartId", "PartName", "MovementType", "Qty", "Notes", "MovementDate")
          VALUES (${sparepart.Id}, ${sparepart.PartName}, 'OUT', ${qty}, ${referensi ? `${referensi}: ${keterangan}` : keterangan}, NOW())
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

      const [target] = await sql<Array<{ Id: number }>>`
        SELECT "Id" FROM "TWMSSparepartMaster"
        WHERE UPPER(TRIM("PartName")) = UPPER(TRIM(${namaKomponen}))
        LIMIT 1
      `;

      if (target) {
        await withTransaction(async (tx) => {
          await tx`DELETE FROM "TWMSSparepartLog" WHERE "SparepartId" = ${target.Id} OR UPPER(TRIM("PartName")) = UPPER(TRIM(${namaKomponen}))`;
          await tx`DELETE FROM "TWMSSectionRequestMaterial" WHERE "SparepartId" = ${target.Id} OR UPPER(TRIM("MaterialName")) = UPPER(TRIM(${namaKomponen}))`;
          await tx`DELETE FROM "TWMSSparepartMaster" WHERE "Id" = ${target.Id}`;
        });
      }

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
            SELECT 
              sl."Id" AS id,
              sl."SparepartId" AS "sparepartId",
              sl."PartName" AS "namaKomponen",
              sl."MovementType" AS tipe,
              sl."Qty" AS qty,
              sl."TicketId" AS referensi,
              sl."Notes" AS keterangan,
              sl."MovementDate" AS tanggal
            FROM "TWMSSparepartLog" sl
            WHERE UPPER(TRIM(sl."PartName")) = UPPER(TRIM(${namaKomponen}))
            ORDER BY sl."MovementDate" DESC
            LIMIT 100
          `
        : await sql`
            SELECT 
              sl."Id" AS id,
              sl."SparepartId" AS "sparepartId",
              sl."PartName" AS "namaKomponen",
              sl."MovementType" AS tipe,
              sl."Qty" AS qty,
              sl."TicketId" AS referensi,
              sl."Notes" AS keterangan,
              sl."MovementDate" AS tanggal
            FROM "TWMSSparepartLog" sl
            ORDER BY sl."MovementDate" DESC
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
