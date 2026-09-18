import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseAndVerifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import sql from '@/lib/db';
import { masterDataDaisha, DAFTAR_SEKSI } from '@/lib/masterData';

/**
 * Helper untuk verifikasi bahwa pemanggil adalah ADMIN yang sah.
 */
async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await parseAndVerifySession(token);

  if (!session.valid || !session.user || session.user.role !== 'ADMIN') {
    return { authorized: false, response: NextResponse.json({ error: 'Akses ditolak. Khusus Admin.' }, { status: 403 }) };
  }

  return { authorized: true, user: session.user };
}

let isCatalogSeeded = false;

/**
 * Auto-seed katalog awal dari static data masterDataDaisha jika tabel DaishaType masih kosong.
 */
async function ensureCatalogSeeded(): Promise<void> {
  if (isCatalogSeeded) return;

  const [{ count }] = await sql<[{ count: number }]>`
    SELECT COUNT(*)::int as count FROM "DaishaType"
  `;
  if (count > 0) {
    isCatalogSeeded = true;
    return;
  }

  console.log('[Catalog] Melakukan inisialisasi awal (auto-seeding) katalog Daisha ke database PostgreSQL...');

  await sql.begin(async (tx) => {
    for (const [daishaName, info] of Object.entries(masterDataDaisha)) {
      const [createdDaisha] = await tx<[{ id: number }]>`
        INSERT INTO "DaishaType" (name, seksi, "updatedAt")
        VALUES (${daishaName.trim()}, ${info.seksi || 'All seksi'}, NOW())
        RETURNING id
      `;

      for (const [compName, symptoms] of Object.entries(info.jenisKerusakan)) {
        const [createdComp] = await tx<[{ id: number }]>`
          INSERT INTO "DaishaComponent" ("daishaTypeId", name)
          VALUES (${createdDaisha.id}, ${compName.trim()})
          RETURNING id
        `;

        if (Array.isArray(symptoms) && symptoms.length > 0) {
          const symptomRows = symptoms.map((s) => ({
            componentId: createdComp.id,
            description: String(s).trim(),
          }));
          await tx`
            INSERT INTO "DaishaSymptom" ${tx(symptomRows, 'componentId', 'description')}
          `;
        }
      }
    }
  });

  isCatalogSeeded = true;
  console.log('[Catalog] Selesai seeder katalog Daisha.');
}

/**
 * GET /api/catalog - Mengambil data katalog Daisha, Komponen, dan Gejala
 */
export async function GET() {
  try {
    await ensureCatalogSeeded();

    const rows = await sql<
      Array<{
        id: number;
        name: string;
        seksi: string;
        components: Array<{
          id: number;
          name: string;
          symptoms: Array<{ id: number; description: string }>;
        }>;
      }>
    >`
      SELECT 
        dt.id, 
        dt.name, 
        dt.seksi,
        COALESCE(
          json_agg(
            json_build_object(
              'id', dc.id,
              'name', dc.name,
              'symptoms', COALESCE(symptoms_sub.symptoms, '[]'::json)
            ) ORDER BY dc.name ASC
          ) FILTER (WHERE dc.id IS NOT NULL),
          '[]'::json
        ) as components
      FROM "DaishaType" dt
      LEFT JOIN "DaishaComponent" dc ON dc."daishaTypeId" = dt.id
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'id', ds.id,
            'description', ds.description
          ) ORDER BY ds.id ASC
        ) as symptoms
        FROM "DaishaSymptom" ds
        WHERE ds."componentId" = dc.id
      ) symptoms_sub ON true
      GROUP BY dt.id
      ORDER BY dt.name ASC
    `;

    // Susun format pohon data lengkap untuk UI Admin
    const rawCatalog: Record<string, { seksi: string; jenisKerusakan: Record<string, string[]> }> = {};
    const detailedList = rows.map((d) => {
      const jenisKerusakan: Record<string, string[]> = {};
      (d.components || []).forEach((c) => {
        jenisKerusakan[c.name] = (c.symptoms || []).map((s) => s.description);
      });

      rawCatalog[d.name] = {
        seksi: d.seksi,
        jenisKerusakan,
      };

      return {
        id: d.id,
        name: d.name,
        seksi: d.seksi,
        components: (d.components || []).map((c) => ({
          id: c.id,
          name: c.name,
          symptoms: (c.symptoms || []).map((s) => ({
            id: s.id,
            description: s.description,
          })),
        })),
      };
    });

    // Kumpulkan daftar seksi unik
    const seksiSet = new Set<string>(DAFTAR_SEKSI);
    rows.forEach((d) => {
      if (d.seksi) seksiSet.add(d.seksi);
    });

    return NextResponse.json({
      success: true,
      seksiList: Array.from(seksiSet).sort(),
      catalog: rawCatalog,
      tree: detailedList,
    });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data katalog dari database.',
        catalog: masterDataDaisha,
        seksiList: DAFTAR_SEKSI,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/catalog - Menambah Daisha Baru, Komponen Baru, atau Gejala Baru
 */
export async function POST(request: Request) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { action } = body;

    // 1. Tambah Jenis Daisha Baru
    if (action === 'ADD_DAISHA') {
      const { name, seksi } = body;
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Nama Daisha wajib diisi.' }, { status: 400 });
      }

      const trimmedName = name.trim();
      const [existing] = await sql`SELECT id FROM "DaishaType" WHERE name = ${trimmedName} LIMIT 1`;
      if (existing) {
        return NextResponse.json({ error: `Jenis Daisha "${trimmedName}" sudah ada.` }, { status: 400 });
      }

      const [newDaisha] = await sql`
        INSERT INTO "DaishaType" (name, seksi, "updatedAt")
        VALUES (${trimmedName}, ${(seksi || 'All seksi').trim()}, NOW())
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        message: `Jenis Daisha "${newDaisha.name}" berhasil ditambahkan.`,
        data: newDaisha,
      });
    }

    // 2. Tambah Komponen Baru ke Jenis Daisha
    if (action === 'ADD_COMPONENT') {
      const { daishaTypeId, name } = body;
      if (!daishaTypeId || !name || !name.trim()) {
        return NextResponse.json({ error: 'ID Daisha dan Nama Komponen wajib diisi.' }, { status: 400 });
      }

      const trimmedName = name.trim();
      const [existing] = await sql`
        SELECT id FROM "DaishaComponent"
        WHERE "daishaTypeId" = ${Number(daishaTypeId)} AND name = ${trimmedName}
        LIMIT 1
      `;
      if (existing) {
        return NextResponse.json({ error: `Komponen "${trimmedName}" sudah ada pada Daisha ini.` }, { status: 400 });
      }

      const [newComp] = await sql`
        INSERT INTO "DaishaComponent" ("daishaTypeId", name)
        VALUES (${Number(daishaTypeId)}, ${trimmedName})
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        message: `Komponen "${newComp.name}" berhasil ditambahkan.`,
        data: newComp,
      });
    }

    // 3. Tambah Detail Gejala Kerusakan ke Komponen
    if (action === 'ADD_SYMPTOM') {
      const { componentId, description } = body;
      if (!componentId || !description || !description.trim()) {
        return NextResponse.json({ error: 'ID Komponen dan Gejala Kerusakan wajib diisi.' }, { status: 400 });
      }

      const [newSymptom] = await sql`
        INSERT INTO "DaishaSymptom" ("componentId", description)
        VALUES (${Number(componentId)}, ${description.trim()})
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        message: `Gejala kerusakan berhasil ditambahkan.`,
        data: newSymptom,
      });
    }

    return NextResponse.json({ error: 'Aksi katalog tidak dikenali.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses katalog.';
    console.error('Error in POST /api/catalog:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PUT /api/catalog - Edit Nama Daisha, Komponen, atau Gejala Kerusakan
 */
export async function PUT(request: Request) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { action } = body;

    // 1. Edit Daisha
    if (action === 'EDIT_DAISHA') {
      const { id, name, seksi } = body;
      if (!id || !name?.trim()) {
        return NextResponse.json({ error: 'ID dan Nama Daisha wajib diisi.' }, { status: 400 });
      }

      const [updated] = seksi !== undefined
        ? await sql`
            UPDATE "DaishaType"
            SET name = ${name.trim()}, seksi = ${seksi.trim()}, "updatedAt" = NOW()
            WHERE id = ${Number(id)}
            RETURNING *
          `
        : await sql`
            UPDATE "DaishaType"
            SET name = ${name.trim()}, "updatedAt" = NOW()
            WHERE id = ${Number(id)}
            RETURNING *
          `;

      return NextResponse.json({
        success: true,
        message: `Jenis Daisha berhasil diperbarui menjadi "${updated.name}".`,
        data: updated,
      });
    }

    // 2. Edit Komponen
    if (action === 'EDIT_COMPONENT') {
      const { id, name } = body;
      if (!id || !name?.trim()) {
        return NextResponse.json({ error: 'ID dan Nama Komponen wajib diisi.' }, { status: 400 });
      }

      const [updated] = await sql`
        UPDATE "DaishaComponent"
        SET name = ${name.trim()}
        WHERE id = ${Number(id)}
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        message: `Komponen berhasil diperbarui menjadi "${updated.name}".`,
        data: updated,
      });
    }

    // 3. Edit Gejala
    if (action === 'EDIT_SYMPTOM') {
      const { id, description } = body;
      if (!id || !description?.trim()) {
        return NextResponse.json({ error: 'ID dan Deskripsi Gejala wajib diisi.' }, { status: 400 });
      }

      const [updated] = await sql`
        UPDATE "DaishaSymptom"
        SET description = ${description.trim()}
        WHERE id = ${Number(id)}
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        message: `Gejala kerusakan berhasil diperbarui.`,
        data: updated,
      });
    }

    return NextResponse.json({ error: 'Aksi edit tidak dikenali.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memperbarui katalog.';
    console.error('Error in PUT /api/catalog:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/catalog?type=daisha|component|symptom&id=xxx - Hapus data katalog
 */
export async function DELETE(request: Request) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const idParam = searchParams.get('id');

    if (!type || !idParam) {
      return NextResponse.json({ error: 'Parameter type dan id wajib disertakan.' }, { status: 400 });
    }

    const id = Number(idParam);

    if (type === 'daisha') {
      await sql.begin(async (tx) => {
        await tx`DELETE FROM "DaishaSymptom" WHERE "componentId" IN (SELECT id FROM "DaishaComponent" WHERE "daishaTypeId" = ${id})`;
        await tx`DELETE FROM "DaishaComponent" WHERE "daishaTypeId" = ${id}`;
        await tx`DELETE FROM "DaishaType" WHERE id = ${id}`;
      });
      return NextResponse.json({ success: true, message: 'Jenis Daisha beserta seluruh komponennya berhasil dihapus.' });
    }

    if (type === 'component') {
      await sql.begin(async (tx) => {
        await tx`DELETE FROM "DaishaSymptom" WHERE "componentId" = ${id}`;
        await tx`DELETE FROM "DaishaComponent" WHERE id = ${id}`;
      });
      return NextResponse.json({ success: true, message: 'Komponen beserta gejalanya berhasil dihapus.' });
    }

    if (type === 'symptom') {
      await sql`DELETE FROM "DaishaSymptom" WHERE id = ${id}`;
      return NextResponse.json({ success: true, message: 'Gejala kerusakan berhasil dihapus.' });
    }

    return NextResponse.json({ error: 'Tipe penghapusan tidak valid.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus data dari katalog.';
    console.error('Error in DELETE /api/catalog:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
