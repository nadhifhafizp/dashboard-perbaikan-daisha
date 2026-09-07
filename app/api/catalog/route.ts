import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseAndVerifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import prisma from '@/lib/prisma';
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

  const count = await prisma.daishaType.count();
  if (count > 0) {
    isCatalogSeeded = true;
    return;
  }

  console.log('[Catalog] Melakukan inisialisasi awal (auto-seeding) katalog Daisha ke database SQLite...');

  for (const [daishaName, info] of Object.entries(masterDataDaisha)) {
    const createdDaisha = await prisma.daishaType.create({
      data: {
        name: daishaName.trim(),
        seksi: info.seksi || 'All seksi',
      },
    });

    for (const [compName, symptoms] of Object.entries(info.jenisKerusakan)) {
      const createdComp = await prisma.daishaComponent.create({
        data: {
          daishaTypeId: createdDaisha.id,
          name: compName.trim(),
        },
      });

      if (Array.isArray(symptoms) && symptoms.length > 0) {
        await prisma.daishaSymptom.createMany({
          data: symptoms.map((s) => ({
            componentId: createdComp.id,
            description: String(s).trim(),
          })),
        });
      }
    }
  }

  console.log('[Catalog] Selesai seeder katalog Daisha.');
}

/**
 * GET /api/catalog - Mengambil data katalog Daisha, Komponen, dan Gejala
 */
export async function GET() {
  try {
    await ensureCatalogSeeded();

    const daishaTypes = await prisma.daishaType.findMany({
      include: {
        components: {
          include: {
            symptoms: true,
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Susun format pohon data lengkap untuk UI Admin
    const rawCatalog: Record<string, { seksi: string; jenisKerusakan: Record<string, string[]> }> = {};
    const detailedList = daishaTypes.map((d) => {
      const jenisKerusakan: Record<string, string[]> = {};
      d.components.forEach((c) => {
        jenisKerusakan[c.name] = c.symptoms.map((s) => s.description);
      });

      rawCatalog[d.name] = {
        seksi: d.seksi,
        jenisKerusakan,
      };

      return {
        id: d.id,
        name: d.name,
        seksi: d.seksi,
        components: d.components.map((c) => ({
          id: c.id,
          name: c.name,
          symptoms: c.symptoms.map((s) => ({
            id: s.id,
            description: s.description,
          })),
        })),
      };
    });

    // Kumpulkan daftar seksi unik
    const seksiSet = new Set<string>(DAFTAR_SEKSI);
    daishaTypes.forEach((d) => {
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
      const existing = await prisma.daishaType.findUnique({
        where: { name: trimmedName },
      });
      if (existing) {
        return NextResponse.json({ error: `Jenis Daisha "${trimmedName}" sudah ada.` }, { status: 400 });
      }

      const newDaisha = await prisma.daishaType.create({
        data: {
          name: trimmedName,
          seksi: (seksi || 'All seksi').trim(),
        },
      });

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
      const existing = await prisma.daishaComponent.findFirst({
        where: { daishaTypeId: Number(daishaTypeId), name: trimmedName },
      });
      if (existing) {
        return NextResponse.json({ error: `Komponen "${trimmedName}" sudah ada pada Daisha ini.` }, { status: 400 });
      }

      const newComp = await prisma.daishaComponent.create({
        data: {
          daishaTypeId: Number(daishaTypeId),
          name: trimmedName,
        },
      });

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

      const newSymptom = await prisma.daishaSymptom.create({
        data: {
          componentId: Number(componentId),
          description: description.trim(),
        },
      });

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

      const updated = await prisma.daishaType.update({
        where: { id: Number(id) },
        data: {
          name: name.trim(),
          seksi: seksi ? seksi.trim() : undefined,
        },
      });

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

      const updated = await prisma.daishaComponent.update({
        where: { id: Number(id) },
        data: { name: name.trim() },
      });

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

      const updated = await prisma.daishaSymptom.update({
        where: { id: Number(id) },
        data: { description: description.trim() },
      });

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
      await prisma.daishaType.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Jenis Daisha beserta seluruh komponennya berhasil dihapus.' });
    }

    if (type === 'component') {
      await prisma.daishaComponent.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Komponen beserta gejalanya berhasil dihapus.' });
    }

    if (type === 'symptom') {
      await prisma.daishaSymptom.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Gejala kerusakan berhasil dihapus.' });
    }

    return NextResponse.json({ error: 'Tipe penghapusan tidak valid.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus data dari katalog.';
    console.error('Error in DELETE /api/catalog:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
