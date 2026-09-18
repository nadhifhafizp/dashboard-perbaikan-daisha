import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { parseAndVerifySession } from '@/lib/auth';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'daisha_auth_session';

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return parseAndVerifySession(token);
}

// GET: Ambil daftar sparepart beserta log mutasi terakhir
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session.valid || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hanya admin boleh melihat inventaris spareparts
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const withLogs = searchParams.get('logs') === 'true';
    const kategori = searchParams.get('kategori');
    const filterKategori = kategori && kategori !== 'all' ? kategori : null;

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

// POST: CRUD spareparts & mutasi stok
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.valid || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya admin yang dapat mengelola spareparts.' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    // Tambah sparepart baru
    if (action === 'CREATE') {
      const { namaKomponen, kategori, stokGudang, satuan, minStok, lokasi } = body;

      if (!namaKomponen || !satuan) {
        return NextResponse.json({ error: 'Nama komponen dan satuan wajib diisi.' }, { status: 400 });
      }

      const [exists] = await sql`SELECT "namaKomponen" FROM "Sparepart" WHERE "namaKomponen" = ${namaKomponen} LIMIT 1`;
      if (exists) {
        return NextResponse.json({ error: `Sparepart "${namaKomponen}" sudah ada.` }, { status: 400 });
      }

      const [created] = await sql`
        INSERT INTO "Sparepart" ("namaKomponen", kategori, "stokGudang", satuan, "minStok", lokasi)
        VALUES (${namaKomponen}, ${kategori || 'Umum'}, ${Number(stokGudang) || 0}, ${satuan}, ${Number(minStok) || 0}, ${lokasi || null})
        RETURNING *
      `;

      // Log stok awal jika ada
      if (stokGudang && Number(stokGudang) > 0) {
        await sql`
          INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, keterangan, tanggal)
          VALUES (${namaKomponen}, 'IN', ${Number(stokGudang)}, 'Stok awal saat pendaftaran', NOW())
        `;
      }

      return NextResponse.json({ success: true, message: `Sparepart "${namaKomponen}" berhasil ditambahkan.`, sparepart: created });
    }

    // Update info sparepart
    if (action === 'UPDATE') {
      const { namaKomponen, kategori, satuan, minStok, lokasi } = body;

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
          "minStok" = ${minStok !== undefined ? Number(minStok) : current.minStok},
          lokasi = ${lokasi !== undefined ? lokasi : current.lokasi}
        WHERE "namaKomponen" = ${namaKomponen}
        RETURNING *
      `;

      return NextResponse.json({ success: true, message: 'Info sparepart diperbarui.', sparepart: updated });
    }

    // Restock (tambah stok masuk)
    if (action === 'RESTOCK') {
      const { namaKomponen, qty, keterangan } = body;

      if (!namaKomponen || !qty || Number(qty) <= 0) {
        return NextResponse.json({ error: 'Nama komponen dan jumlah restock wajib diisi.' }, { status: 400 });
      }

      await sql.begin(async (tx) => {
        await tx`
          UPDATE "Sparepart"
          SET "stokGudang" = "stokGudang" + ${Number(qty)}
          WHERE "namaKomponen" = ${namaKomponen}
        `;
        await tx`
          INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, keterangan, tanggal)
          VALUES (${namaKomponen}, 'IN', ${Number(qty)}, ${keterangan || 'Restock manual'}, NOW())
        `;
      });

      return NextResponse.json({ success: true, message: `Restock ${qty} unit berhasil.` });
    }

    // Pemakaian manual (pengeluaran stok)
    if (action === 'USE') {
      const { namaKomponen, qty, referensi, keterangan } = body;

      if (!namaKomponen || !qty || Number(qty) <= 0) {
        return NextResponse.json({ error: 'Nama komponen dan jumlah pemakaian wajib diisi.' }, { status: 400 });
      }

      const [sparepart] = await sql<Array<{ stokGudang: number }>>`
        SELECT "stokGudang" FROM "Sparepart" WHERE "namaKomponen" = ${namaKomponen} LIMIT 1
      `;
      if (!sparepart) {
        return NextResponse.json({ error: `Sparepart "${namaKomponen}" tidak ditemukan.` }, { status: 404 });
      }
      if (sparepart.stokGudang < Number(qty)) {
        return NextResponse.json({ error: `Stok tidak mencukupi (sisa: ${sparepart.stokGudang}).` }, { status: 400 });
      }

      await sql.begin(async (tx) => {
        await tx`
          UPDATE "Sparepart"
          SET "stokGudang" = "stokGudang" - ${Number(qty)}
          WHERE "namaKomponen" = ${namaKomponen}
        `;
        await tx`
          INSERT INTO "SparepartLog" ("namaKomponen", tipe, qty, referensi, keterangan, tanggal)
          VALUES (${namaKomponen}, 'OUT', ${Number(qty)}, ${referensi || null}, ${keterangan || 'Pemakaian manual'}, NOW())
        `;
      });

      return NextResponse.json({ success: true, message: `Pengeluaran ${qty} unit berhasil.` });
    }

    // Hapus sparepart
    if (action === 'DELETE') {
      const { namaKomponen } = body;
      if (!namaKomponen) {
        return NextResponse.json({ error: 'Nama komponen wajib diisi.' }, { status: 400 });
      }

      await sql.begin(async (tx) => {
        await tx`DELETE FROM "SparepartLog" WHERE "namaKomponen" = ${namaKomponen}`;
        await tx`DELETE FROM "SectionRequestMaterial" WHERE "namaKomponen" = ${namaKomponen}`;
        await tx`DELETE FROM "Sparepart" WHERE "namaKomponen" = ${namaKomponen}`;
      });

      return NextResponse.json({ success: true, message: `Sparepart "${namaKomponen}" berhasil dihapus.` });
    }

    // GET logs untuk sparepart tertentu
    if (action === 'GET_LOGS') {
      const { namaKomponen } = body;
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
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
