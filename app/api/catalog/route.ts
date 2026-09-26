import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { DAFTAR_SEKSI } from '@/lib/masterData';
import {
  requireAuth,
  checkRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
  validatePositiveInt,
} from '@/lib/security';

// ============================================================================
// IN-MEMORY RESPONSE CACHE (< 2ms response time)
// ============================================================================
interface CatalogCacheData {
  success: boolean;
  seksiList: string[];
  sections: Array<{
    id: number;
    name: string;
    colorName: string | null;
    badgeBg: string | null;
    textColor: string | null;
    borderColor: string | null;
    accentBorder: string | null;
  }>;
  catalog: Record<string, unknown>;
  tree: Array<unknown>;
}

let cachedCatalogResponse: CatalogCacheData | null = null;
let cachedCatalogTimestamp = 0;
const CATALOG_CACHE_TTL_MS = 60 * 1000; // 60 detik

export function invalidateCatalogCache(): void {
  cachedCatalogResponse = null;
  cachedCatalogTimestamp = 0;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/catalog - Mengambil data katalog Daisha, Komponen, Gejala, Varian, dan Seksi
 */
export async function GET(request: Request) {
  // 1. AUTHENTICATION & AUTHORIZATION (Semua user terotentikasi berhak membaca katalog)
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. RATE LIMITING (120 req/menit per IP)
  const rateLimit = checkRateLimit(`catalog_get:${auth.ip}`, 120, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan katalog. Silakan coba sesaat lagi.' }, { status: 429 });
  }

  // 3. FAST IN-MEMORY CACHE HIT (< 2ms)
  if (cachedCatalogResponse && Date.now() - cachedCatalogTimestamp < CATALOG_CACHE_TTL_MS) {
    return NextResponse.json(cachedCatalogResponse, {
      headers: {
        'X-Cache': 'HIT',
      },
    });
  }

  try {

    const rows = await sql<
      Array<{
        id: number;
        name: string;
        seksi: string;
        codePrefix: string | null;
        totalUnits: number | null;
        components: Array<{
          id: number;
          name: string;
          symptoms: Array<{ id: number; description: string }>;
        }>;
        variants: Array<{
          id: number;
          name: string;
          ukuran: string | null;
          susunan: string | null;
          tipe: string | null;
          codePrefix: string | null;
          padLength: number | null;
          minNumber: number | null;
          maxNumber: number | null;
          totalUnits: number | null;
          rangeFormat: string | null;
          badgeColor: string | null;
        }>;
      }>
    >`
      SELECT 
        dt.id, 
        dt.name, 
        dt.seksi,
        dt."codePrefix",
        COALESCE(dt."totalUnits", 0)::int as "totalUnits",
        COALESCE(comps_sub.components, '[]'::json) as components,
        COALESCE(variants_sub.variants, '[]'::json) as variants
      FROM "DaishaType" dt
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'id', dc.id,
            'name', dc.name,
            'symptoms', COALESCE(symptoms_sub.symptoms, '[]'::json)
          ) ORDER BY dc.name ASC
        ) as components
        FROM "DaishaComponent" dc
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
        WHERE dc."daishaTypeId" = dt.id
      ) comps_sub ON true
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'id', dv.id,
            'name', dv.name,
            'ukuran', dv.ukuran,
            'susunan', dv.susunan,
            'tipe', dv.tipe,
            'codePrefix', dv."codePrefix",
            'padLength', COALESCE(dv."padLength", 0),
            'minNumber', COALESCE(dv."minNumber", 1),
            'maxNumber', COALESCE(dv."maxNumber", 1),
            'totalUnits', COALESCE(dv."totalUnits", 0),
            'rangeFormat', dv."rangeFormat",
            'badgeColor', dv."badgeColor"
          ) ORDER BY dv.id ASC
        ) as variants
        FROM "DaishaVariant" dv
        WHERE dv."daishaTypeId" = dt.id
      ) variants_sub ON true
      ORDER BY dt.name ASC
    `;

    // Ambil daftar seksi lengkap dari tabel Section
    const sectionRows = await sql<
      Array<{
        id: number;
        name: string;
        colorName: string | null;
        badgeBg: string | null;
        textColor: string | null;
        borderColor: string | null;
        accentBorder: string | null;
      }>
    >`
      SELECT id, name, "colorName", "badgeBg", "textColor", "borderColor", "accentBorder"
      FROM "Section"
      ORDER BY id ASC
    `;

    // Susun format pohon data lengkap untuk UI Admin
    const rawCatalog: Record<
      string,
      {
        seksi: string;
        codePrefix?: string;
        totalUnits?: number;
        jenisKerusakan: Record<string, string[]>;
        variants: Array<{
          id: number;
          name: string;
          ukuran?: string | null;
          susunan?: string | null;
          tipe?: string | null;
          codePrefix?: string | null;
          padLength?: number;
          minNumber?: number;
          maxNumber?: number;
          totalUnits?: number;
          rangeFormat?: string | null;
          badgeColor?: string | null;
        }>;
      }
    > = {};

    const detailedList = rows.map((d) => {
      const jenisKerusakan: Record<string, string[]> = {};
      (d.components || []).forEach((c) => {
        jenisKerusakan[c.name] = (c.symptoms || []).map((s) => s.description);
      });

      const formattedVariants = (d.variants || []).map((v) => ({
        id: v.id,
        name: v.name,
        ukuran: v.ukuran || undefined,
        susunan: v.susunan || undefined,
        tipe: v.tipe || undefined,
        codePrefix: v.codePrefix || '',
        padLength: v.padLength ?? 0,
        minNumber: v.minNumber ?? 1,
        maxNumber: v.maxNumber ?? 1,
        totalUnits: v.totalUnits ?? 0,
        rangeFormat: v.rangeFormat || '',
        badgeColor: v.badgeColor || undefined,
      }));

      rawCatalog[d.name] = {
        seksi: d.seksi,
        codePrefix: d.codePrefix || '',
        totalUnits: d.totalUnits || 0,
        jenisKerusakan,
        variants: formattedVariants,
      };

      return {
        id: d.id,
        name: d.name,
        seksi: d.seksi,
        codePrefix: d.codePrefix || '',
        totalUnits: d.totalUnits || 0,
        components: (d.components || []).map((c) => ({
          id: c.id,
          name: c.name,
          symptoms: (c.symptoms || []).map((s) => ({
            id: s.id,
            description: s.description,
          })),
        })),
        variants: formattedVariants,
      };
    });

    // Kumpulkan daftar nama seksi unik
    const seksiSet = new Set<string>(DAFTAR_SEKSI);
    sectionRows.forEach((s) => seksiSet.add(s.name));
    rows.forEach((d) => {
      if (d.seksi) seksiSet.add(d.seksi);
    });

    const responsePayload: CatalogCacheData = {
      success: true,
      seksiList: Array.from(seksiSet).sort(),
      sections: sectionRows,
      catalog: rawCatalog,
      tree: detailedList,
    };

    // Simpan ke in-memory cache untuk request berikutnya
    cachedCatalogResponse = responsePayload;
    cachedCatalogTimestamp = Date.now();

    return NextResponse.json(responsePayload, {
      headers: {
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data katalog dari database.',
        catalog: {},
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
  // 1. AUTHORIZATION (Khusus role ADMIN)
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. FILE & PAYLOAD SIZE LIMIT (Maksimal 256KB)
  const sizeCheck = validatePayloadSize(request, 256 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // 3. RATE LIMITING (Maksimal 30 mutasi/menit)
  const rateLimit = checkRateLimit(`catalog_post:${auth.ip}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak operasi perubahan katalog.' }, { status: 429 });
  }

  try {
    invalidateCatalogCache();
    const body = await request.json();
    const action = sanitizeText(body.action, 50);

    // 1. Tambah Jenis Daisha Baru
    if (action === 'ADD_DAISHA') {
      const name = sanitizeText(body.name, 100);
      const seksi = sanitizeText(body.seksi, 50) || 'All seksi';
      const codePrefix = sanitizeText(body.codePrefix, 20);
      const totalUnits = validatePositiveInt(body.totalUnits ?? 0, 'Total Unit', 0, 10000).value;

      if (!name) {
        return NextResponse.json({ error: 'Nama Daisha wajib diisi.' }, { status: 400 });
      }

      const [existing] = await sql`SELECT id FROM "DaishaType" WHERE name = ${name} LIMIT 1`;
      if (existing) {
        return NextResponse.json({ error: `Jenis Daisha "${name}" sudah ada.` }, { status: 400 });
      }

      const [newDaisha] = await sql`
        INSERT INTO "DaishaType" (name, seksi, "codePrefix", "totalUnits", "updatedAt")
        VALUES (
          ${name},
          ${seksi},
          ${codePrefix || null},
          ${totalUnits},
          NOW()
        )
        RETURNING *
      `;

      recordAuditLog({
        action: 'CATALOG_ADD_DAISHA',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newDaisha.id,
        details: `Nama: ${newDaisha.name}, Seksi: ${newDaisha.seksi}`,
      });

      return NextResponse.json({
        success: true,
        message: `Jenis Daisha "${newDaisha.name}" berhasil ditambahkan.`,
        data: newDaisha,
      });
    }

    // 2. Tambah Komponen Baru ke Jenis Daisha
    if (action === 'ADD_COMPONENT') {
      const daishaTypeId = validatePositiveInt(body.daishaTypeId, 'ID Daisha', 1).value;
      const name = sanitizeText(body.name, 100);

      if (!body.daishaTypeId || !name) {
        return NextResponse.json({ error: 'ID Daisha dan Nama Komponen wajib diisi.' }, { status: 400 });
      }

      const [existing] = await sql`
        SELECT id FROM "DaishaComponent"
        WHERE "daishaTypeId" = ${daishaTypeId} AND name = ${name}
        LIMIT 1
      `;
      if (existing) {
        return NextResponse.json({ error: `Komponen "${name}" sudah ada pada Daisha ini.` }, { status: 400 });
      }

      const [newComp] = await sql`
        INSERT INTO "DaishaComponent" ("daishaTypeId", name)
        VALUES (${daishaTypeId}, ${name})
        RETURNING *
      `;

      recordAuditLog({
        action: 'CATALOG_ADD_COMPONENT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newComp.id,
        details: `Komponen: ${newComp.name}, DaishaID: ${daishaTypeId}`,
      });

      return NextResponse.json({
        success: true,
        message: `Komponen "${newComp.name}" berhasil ditambahkan.`,
        data: newComp,
      });
    }

    // 3. Tambah Detail Gejala Kerusakan ke Komponen
    if (action === 'ADD_SYMPTOM') {
      const componentId = validatePositiveInt(body.componentId, 'ID Komponen', 1).value;
      const description = sanitizeText(body.description, 255);

      if (!body.componentId || !description) {
        return NextResponse.json({ error: 'ID Komponen dan Gejala Kerusakan wajib diisi.' }, { status: 400 });
      }

      const [newSymptom] = await sql`
        INSERT INTO "DaishaSymptom" ("componentId", description)
        VALUES (${componentId}, ${description})
        RETURNING *
      `;

      recordAuditLog({
        action: 'CATALOG_ADD_SYMPTOM',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newSymptom.id,
        details: `Gejala: ${newSymptom.description}, CompID: ${componentId}`,
      });

      return NextResponse.json({
        success: true,
        message: `Gejala kerusakan berhasil ditambahkan.`,
        data: newSymptom,
      });
    }

    // 4. Tambah Varian Baru ke Jenis Daisha
    if (action === 'ADD_VARIANT') {
      const daishaTypeId = validatePositiveInt(body.daishaTypeId, 'ID Daisha', 1).value;
      const name = sanitizeText(body.name, 150);
      const ukuran = sanitizeText(body.ukuran, 50);
      const susunan = sanitizeText(body.susunan, 50);
      const tipe = sanitizeText(body.tipe, 50);
      const codePrefix = sanitizeText(body.codePrefix, 50);
      const padLength = validatePositiveInt(body.padLength ?? 0, 'Pad Length', 0, 10).value;
      const minNumber = validatePositiveInt(body.minNumber ?? 1, 'Nomor Min', 0, 1000000).value;
      const maxNumber = validatePositiveInt(body.maxNumber ?? 1, 'Nomor Max', 0, 1000000).value;
      const totalUnits = validatePositiveInt(body.totalUnits ?? 0, 'Total Units', 0, 1000000).value;
      const rangeFormat = sanitizeText(body.rangeFormat, 100);
      const badgeColor = sanitizeText(body.badgeColor, 50);

      if (!daishaTypeId || !name) {
        return NextResponse.json({ error: 'ID Daisha dan Nama Varian wajib diisi.' }, { status: 400 });
      }

      const [newVariant] = await sql`
        INSERT INTO "DaishaVariant" (
          "daishaTypeId", name, ukuran, susunan, tipe, "codePrefix",
          "padLength", "minNumber", "maxNumber", "totalUnits", "rangeFormat", "badgeColor",
          "updatedAt"
        ) VALUES (
          ${daishaTypeId}, ${name}, ${ukuran || null}, ${susunan || null}, ${tipe || null}, ${codePrefix || null},
          ${padLength}, ${minNumber}, ${maxNumber}, ${totalUnits}, ${rangeFormat || null}, ${badgeColor || null},
          NOW()
        )
        RETURNING *
      `;

      // Perbarui total unit pada DaishaType
      await sql`
        UPDATE "DaishaType"
        SET "totalUnits" = (SELECT COALESCE(SUM("totalUnits"), 0)::int FROM "DaishaVariant" WHERE "daishaTypeId" = ${daishaTypeId})
        WHERE id = ${daishaTypeId}
      `;

      recordAuditLog({
        action: 'CATALOG_ADD_VARIANT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newVariant.id,
        details: `Varian: ${newVariant.name}, DaishaID: ${daishaTypeId}`,
      });

      return NextResponse.json({
        success: true,
        message: `Varian "${newVariant.name}" berhasil ditambahkan ke database.`,
        data: newVariant,
      });
    }

    // 5. Tambah Seksi Baru
    if (action === 'ADD_SECTION') {
      const name = sanitizeText(body.name, 50);
      const colorName = sanitizeText(body.colorName, 50) || 'Custom';
      const badgeBg = sanitizeText(body.badgeBg, 50) || 'bg-slate-100';
      const textColor = sanitizeText(body.textColor, 50) || 'text-slate-900';
      const borderColor = sanitizeText(body.borderColor, 50) || 'border-slate-300';
      const accentBorder = sanitizeText(body.accentBorder, 50) || 'border-slate-500';

      if (!name) {
        return NextResponse.json({ error: 'Nama Seksi wajib diisi.' }, { status: 400 });
      }

      const [newSection] = await sql`
        INSERT INTO "Section" (name, "colorName", "badgeBg", "textColor", "borderColor", "accentBorder", "updatedAt")
        VALUES (${name}, ${colorName}, ${badgeBg}, ${textColor}, ${borderColor}, ${accentBorder}, NOW())
        ON CONFLICT (name) DO UPDATE SET 
          "colorName" = EXCLUDED."colorName",
          "badgeBg" = EXCLUDED."badgeBg",
          "textColor" = EXCLUDED."textColor",
          "borderColor" = EXCLUDED."borderColor",
          "accentBorder" = EXCLUDED."accentBorder",
          "updatedAt" = NOW()
        RETURNING *
      `;

      recordAuditLog({
        action: 'CATALOG_ADD_SECTION',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newSection.id,
        details: `Seksi: ${newSection.name}`,
      });

      return NextResponse.json({
        success: true,
        message: `Seksi "${newSection.name}" berhasil disimpan di database.`,
        data: newSection,
      });
    }

    return NextResponse.json({ error: 'Aksi katalog tidak dikenali.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses katalog.';
    console.error('Error in POST /api/catalog:', error);
    recordAuditLog({
      action: 'CATALOG_POST_ERROR',
      ip: auth.ip,
      user: auth.user?.username,
      status: 'FAILED',
      details: msg,
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PUT /api/catalog - Edit Nama Daisha, Komponen, atau Gejala Kerusakan
 */
export async function PUT(request: Request) {
  // 1. AUTHORIZATION (Khusus role ADMIN)
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. FILE & PAYLOAD SIZE LIMIT (Maksimal 256KB)
  const sizeCheck = validatePayloadSize(request, 256 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  // 3. RATE LIMITING (30 req/menit)
  const rateLimit = checkRateLimit(`catalog_put:${auth.ip}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan update katalog.' }, { status: 429 });
  }

  try {
    invalidateCatalogCache();
    const body = await request.json();
    const action = sanitizeText(body.action, 50);

    // 1. Edit Daisha
    if (action === 'EDIT_DAISHA' || action === 'UPDATE_DAISHA') {
      const id = validatePositiveInt(body.id, 'ID Daisha', 1).value;
      const name = sanitizeText(body.name, 100);
      const seksi = sanitizeText(body.seksi, 50) || 'All seksi';
      const codePrefix = sanitizeText(body.codePrefix, 20);
      const totalUnits = validatePositiveInt(body.totalUnits ?? 0, 'Total Unit', 0, 10000).value;

      if (!body.id || !name) {
        return NextResponse.json({ error: 'ID dan Nama Daisha wajib diisi.' }, { status: 400 });
      }

      const [updated] = await sql`
        UPDATE "DaishaType"
        SET name = ${name},
            seksi = ${seksi},
            "codePrefix" = ${codePrefix || null},
            "totalUnits" = ${totalUnits},
            "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      recordAuditLog({
        action: 'CATALOG_UPDATE_DAISHA',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Nama: ${updated.name}`,
      });

      return NextResponse.json({
        success: true,
        message: `Jenis Daisha berhasil diperbarui menjadi "${updated.name}".`,
        data: updated,
      });
    }

    // 2. Edit Komponen
    if (action === 'EDIT_COMPONENT' || action === 'UPDATE_COMPONENT') {
      const id = validatePositiveInt(body.id, 'ID Komponen', 1).value;
      const name = sanitizeText(body.name, 100);

      if (!body.id || !name) {
        return NextResponse.json({ error: 'ID dan Nama Komponen wajib diisi.' }, { status: 400 });
      }

      const [updated] = await sql`
        UPDATE "DaishaComponent"
        SET name = ${name}
        WHERE id = ${id}
        RETURNING *
      `;

      recordAuditLog({
        action: 'CATALOG_UPDATE_COMPONENT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Nama: ${updated.name}`,
      });

      return NextResponse.json({
        success: true,
        message: `Komponen berhasil diperbarui menjadi "${updated.name}".`,
        data: updated,
      });
    }

    // 3. Edit Gejala
    if (action === 'EDIT_SYMPTOM' || action === 'UPDATE_SYMPTOM') {
      const id = validatePositiveInt(body.id, 'ID Gejala', 1).value;
      const description = sanitizeText(body.description, 255);

      if (!body.id || !description) {
        return NextResponse.json({ error: 'ID dan Deskripsi Gejala wajib diisi.' }, { status: 400 });
      }

      const [updated] = await sql`
        UPDATE "DaishaSymptom"
        SET description = ${description}
        WHERE id = ${id}
        RETURNING *
      `;

      recordAuditLog({
        action: 'CATALOG_UPDATE_SYMPTOM',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Gejala: ${updated.description}`,
      });

      return NextResponse.json({
        success: true,
        message: `Gejala kerusakan berhasil diperbarui.`,
        data: updated,
      });
    }

    // 4. Edit Varian
    if (action === 'EDIT_VARIANT' || action === 'UPDATE_VARIANT') {
      const id = validatePositiveInt(body.id, 'ID Varian', 1).value;
      const name = sanitizeText(body.name, 150);
      const ukuran = sanitizeText(body.ukuran, 50);
      const susunan = sanitizeText(body.susunan, 50);
      const tipe = sanitizeText(body.tipe, 50);
      const codePrefix = sanitizeText(body.codePrefix, 50);
      const padLength = validatePositiveInt(body.padLength ?? 0, 'Pad Length', 0, 10).value;
      const minNumber = validatePositiveInt(body.minNumber ?? 1, 'Nomor Min', 0, 1000000).value;
      const maxNumber = validatePositiveInt(body.maxNumber ?? 1, 'Nomor Max', 0, 1000000).value;
      const totalUnits = validatePositiveInt(body.totalUnits ?? 0, 'Total Units', 0, 1000000).value;
      const rangeFormat = sanitizeText(body.rangeFormat, 100);
      const badgeColor = sanitizeText(body.badgeColor, 50);

      if (!id || !name) {
        return NextResponse.json({ error: 'ID dan Nama Varian wajib diisi.' }, { status: 400 });
      }

      const [updated] = await sql`
        UPDATE "DaishaVariant"
        SET
          name = ${name},
          ukuran = ${ukuran || null},
          susunan = ${susunan || null},
          tipe = ${tipe || null},
          "codePrefix" = ${codePrefix || null},
          "padLength" = ${padLength},
          "minNumber" = ${minNumber},
          "maxNumber" = ${maxNumber},
          "totalUnits" = ${totalUnits},
          "rangeFormat" = ${rangeFormat || null},
          "badgeColor" = ${badgeColor || null},
          "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (updated?.daishaTypeId) {
        await sql`
          UPDATE "DaishaType"
          SET "totalUnits" = (SELECT COALESCE(SUM("totalUnits"), 0)::int FROM "DaishaVariant" WHERE "daishaTypeId" = ${updated.daishaTypeId})
          WHERE id = ${updated.daishaTypeId}
        `;
      }

      recordAuditLog({
        action: 'CATALOG_UPDATE_VARIANT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Varian: ${updated?.name}`,
      });

      return NextResponse.json({
        success: true,
        message: `Varian berhasil diperbarui menjadi "${updated.name}".`,
        data: updated,
      });
    }

    return NextResponse.json({ error: 'Aksi edit tidak dikenali.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memperbarui katalog.';
    console.error('Error in PUT /api/catalog:', error);
    recordAuditLog({
      action: 'CATALOG_PUT_ERROR',
      ip: auth.ip,
      user: auth.user?.username,
      status: 'FAILED',
      details: msg,
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/catalog - Hapus data katalog (Khusus role ADMIN)
 */
export async function DELETE(request: Request) {
  // 1. AUTHORIZATION (Khusus role ADMIN)
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  // 2. RATE LIMITING (20 delete/menit)
  const rateLimit = checkRateLimit(`catalog_delete:${auth.ip}`, 20, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan penghapusan.' }, { status: 429 });
  }

  try {
    invalidateCatalogCache();
    const { searchParams } = new URL(request.url);
    let type = searchParams.get('type');
    let idParam = searchParams.get('id');

    // Jika tidak ada di query params, coba baca dari JSON body
    if (!type || !idParam) {
      try {
        const body = await request.json();
        if (body.action) {
          if (body.action.includes('DAISHA')) type = 'daisha';
          else if (body.action.includes('COMPONENT')) type = 'component';
          else if (body.action.includes('SYMPTOM')) type = 'symptom';
          else if (body.action.includes('VARIANT')) type = 'variant';
        }
        if (body.type) type = body.type;
        if (body.id) idParam = String(body.id);
      } catch {
        // Abaikan jika tidak ada body JSON
      }
    }

    if (!type || !idParam) {
      return NextResponse.json({ error: 'Parameter type dan id wajib disertakan.' }, { status: 400 });
    }

    const id = validatePositiveInt(idParam, 'ID', 1).value;

    if (type === 'daisha') {
      await sql.begin(async (tx) => {
        await tx`DELETE FROM "DaishaSymptom" WHERE "componentId" IN (SELECT id FROM "DaishaComponent" WHERE "daishaTypeId" = ${id})`;
        await tx`DELETE FROM "DaishaComponent" WHERE "daishaTypeId" = ${id}`;
        await tx`DELETE FROM "DaishaVariant" WHERE "daishaTypeId" = ${id}`;
        await tx`DELETE FROM "DaishaType" WHERE id = ${id}`;
      });

      recordAuditLog({
        action: 'CATALOG_DELETE_DAISHA',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
      });

      return NextResponse.json({ success: true, message: 'Jenis Daisha beserta seluruh komponennya berhasil dihapus.' });
    }

    if (type === 'component') {
      await sql.begin(async (tx) => {
        await tx`DELETE FROM "DaishaSymptom" WHERE "componentId" = ${id}`;
        await tx`DELETE FROM "DaishaComponent" WHERE id = ${id}`;
      });

      recordAuditLog({
        action: 'CATALOG_DELETE_COMPONENT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
      });

      return NextResponse.json({ success: true, message: 'Komponen beserta gejalanya berhasil dihapus.' });
    }

    if (type === 'symptom') {
      await sql`DELETE FROM "DaishaSymptom" WHERE id = ${id}`;

      recordAuditLog({
        action: 'CATALOG_DELETE_SYMPTOM',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
      });

      return NextResponse.json({ success: true, message: 'Gejala kerusakan berhasil dihapus.' });
    }

    if (type === 'variant') {
      const [existing] = await sql<Array<{ daishaTypeId: number }>>`
        SELECT "daishaTypeId" FROM "DaishaVariant" WHERE id = ${id} LIMIT 1
      `;
      await sql`DELETE FROM "DaishaVariant" WHERE id = ${id}`;

      if (existing?.daishaTypeId) {
        await sql`
          UPDATE "DaishaType"
          SET "totalUnits" = (SELECT COALESCE(SUM("totalUnits"), 0)::int FROM "DaishaVariant" WHERE "daishaTypeId" = ${existing.daishaTypeId})
          WHERE id = ${existing.daishaTypeId}
        `;
      }

      recordAuditLog({
        action: 'CATALOG_DELETE_VARIANT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
      });

      return NextResponse.json({ success: true, message: 'Varian Daisha berhasil dihapus dari database.' });
    }

    return NextResponse.json({ error: 'Tipe penghapusan tidak valid.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus data dari katalog.';
    console.error('Error in DELETE /api/catalog:', error);
    recordAuditLog({
      action: 'CATALOG_DELETE_ERROR',
      ip: auth.ip,
      user: auth.user?.username,
      status: 'FAILED',
      details: msg,
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
