import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { DAFTAR_SEKSI } from '@/lib/masterData';
import { SECTION_METAS } from '@/lib/daishaVariants';
import {
  requireAuth,
  checkRateLimit,
  validatePayloadSize,
  recordAuditLog,
  sanitizeText,
  validatePositiveInt,
} from '@/lib/security';
import { syncDaishaMasterFromCatalog } from '@/lib/daishaCatalogSync';

interface SymptomObj {
  id: number;
  description: string;
}

interface ComponentObj {
  id: number;
  name: string;
  symptoms: SymptomObj[];
}

interface VariantObj {
  id: number;
  name: string;
  ukuran?: string | null;
  susunan?: string | null;
  tipe?: string | null;
  codePrefix?: string | null;
  padLength?: number | null;
  minNumber?: number | null;
  maxNumber?: number | null;
  totalUnits?: number | null;
  rangeFormat?: string | null;
  badgeColor?: string | null;
}

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
const CATALOG_CACHE_TTL_MS = 60 * 1000;

const toJsonb = (data: unknown) => sql.json(data as never);

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
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.errorResponse!;

  const rateLimit = checkRateLimit(`catalog_get:${auth.ip}`, 120, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan katalog. Silakan coba sesaat lagi.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const bypassCache = searchParams.has('t') || searchParams.has('nocache');

  if (!bypassCache && cachedCatalogResponse && Date.now() - cachedCatalogTimestamp < CATALOG_CACHE_TTL_MS) {
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
        components: ComponentObj[];
        variants: VariantObj[];
      }>
    >`
      SELECT 
        id, 
        name, 
        seksi,
        "codePrefix",
        COALESCE("totalUnits", 0)::int as "totalUnits",
        COALESCE(components, '[]'::jsonb) as components,
        COALESCE(variants, '[]'::jsonb) as variants
      FROM "DaishaCatalog"
      ORDER BY name ASC
    `;

    // Ambil data Section dari DB jika ada
    let customSections: Array<{
      id: number;
      name: string;
      colorName: string | null;
      badgeBg: string | null;
      textColor: string | null;
      borderColor: string | null;
      accentBorder: string | null;
    }> = [];
    try {
      customSections = await sql`SELECT id, name, "colorName", "badgeBg", "textColor", "borderColor", "accentBorder" FROM "Section" ORDER BY id ASC`;
    } catch {
      // Abaikan jika tabel Section belum terisi
    }

    const defaultSectionRows = Object.values(SECTION_METAS).map((s, idx) => ({
      id: idx + 1,
      name: s.name as string,
      colorName: s.colorName,
      badgeBg: s.badgeBg,
      textColor: s.textColor,
      borderColor: s.borderColor,
      accentBorder: s.accentBorder,
    }));

    const mergedSections = [...defaultSectionRows];
    for (const cs of customSections) {
      if (!mergedSections.some((ms) => ms.name.toLowerCase() === cs.name.toLowerCase())) {
        mergedSections.push({
          id: mergedSections.length + 1,
          name: cs.name,
          colorName: cs.colorName || 'Custom',
          badgeBg: cs.badgeBg || 'bg-slate-100',
          textColor: cs.textColor || 'text-slate-900',
          borderColor: cs.borderColor || 'border-slate-300',
          accentBorder: cs.accentBorder || 'border-slate-500',
        });
      }
    }

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
          ukuran?: string;
          susunan?: string;
          tipe?: string;
          codePrefix: string;
          padLength: number;
          minNumber: number;
          maxNumber: number;
          totalUnits: number;
          rangeFormat: string;
          badgeColor?: string;
        }>;
      }
    > = {};

    const detailedList = rows.map((d) => {
      const jenisKerusakan: Record<string, string[]> = {};
      const components = Array.isArray(d.components) ? d.components : [];
      components.forEach((c) => {
        jenisKerusakan[c.name] = (c.symptoms || []).map((s) => s.description);
      });

      const variants = Array.isArray(d.variants) ? d.variants : [];
      const seenVariantKeys = new Set<string>();
      const formattedVariants: Array<{
        id: number;
        name: string;
        ukuran?: string;
        susunan?: string;
        tipe?: string;
        codePrefix: string;
        padLength: number;
        minNumber: number;
        maxNumber: number;
        totalUnits: number;
        rangeFormat: string;
        badgeColor?: string;
      }> = [];

      for (const v of variants) {
        const vKey = `${v.id}_${v.codePrefix || ''}_${v.name}_${v.ukuran || ''}_${v.susunan || ''}`;
        if (seenVariantKeys.has(vKey)) continue;
        seenVariantKeys.add(vKey);

        formattedVariants.push({
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
        });
      }

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
        components: components.map((c) => ({
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

    const seksiSet = new Set<string>(DAFTAR_SEKSI);
    mergedSections.forEach((s) => seksiSet.add(s.name));
    rows.forEach((d) => {
      if (d.seksi) seksiSet.add(d.seksi);
    });

    const responsePayload: CatalogCacheData = {
      success: true,
      seksiList: Array.from(seksiSet).sort(),
      sections: mergedSections,
      catalog: rawCatalog,
      tree: detailedList,
    };

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
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  const sizeCheck = validatePayloadSize(request, 256 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  const rateLimit = checkRateLimit(`catalog_post:${auth.ip}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak operasi perubahan katalog.' }, { status: 429 });
  }

  try {
    invalidateCatalogCache();
    const body = await request.json();
    const action = sanitizeText(body.action, 50);

    // Tambah jenis daisha baru
    if (action === 'ADD_DAISHA') {
      const name = sanitizeText(body.name, 100);
      const seksi = sanitizeText(body.seksi, 50) || 'All seksi';
      const codePrefix = sanitizeText(body.codePrefix, 20);
      const totalUnits = validatePositiveInt(body.totalUnits ?? 0, 'Total Unit', 0, 10000).value;

      if (!name) {
        return NextResponse.json({ error: 'Nama Daisha wajib diisi.' }, { status: 400 });
      }

      const [existing] = await sql`SELECT id FROM "DaishaCatalog" WHERE LOWER(name) = LOWER(${name}) LIMIT 1`;
      if (existing) {
        return NextResponse.json({ error: `Jenis Daisha "${name}" sudah ada.` }, { status: 400 });
      }

      const [newDaisha] = await sql`
        INSERT INTO "DaishaCatalog" (
          name, 
          seksi, 
          "codePrefix", 
          "totalUnits", 
          components, 
          variants, 
          "createdAt", 
          "updatedAt"
        )
        VALUES (
          ${name},
          ${seksi},
          ${codePrefix || null},
          ${totalUnits},
          '[]'::jsonb,
          '[]'::jsonb,
          NOW(),
          NOW()
        )
        RETURNING id, name, seksi, "codePrefix", "totalUnits"
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

      // Sinkronkan tabel master unit Daisha seketika
      await syncDaishaMasterFromCatalog().catch((err) => console.error('Sync catalog error:', err));

      return NextResponse.json({
        success: true,
        message: `Jenis Daisha "${newDaisha.name}" berhasil ditambahkan.`,
        data: newDaisha,
      });
    }

    // 2. Tambah Komponen Baru ke Jenis Daisha
    if (action === 'ADD_COMPONENT') {
      const daishaId = validatePositiveInt(body.daishaId || body.daishaTypeId, 'ID Daisha', 1).value;
      const name = sanitizeText(body.name, 100);

      if (!daishaId || !name) {
        return NextResponse.json({ error: 'ID Daisha dan Nama Komponen wajib diisi.' }, { status: 400 });
      }

      const [daisha] = await sql<Array<{ id: number; name: string; components: ComponentObj[] }>>`
        SELECT id, name, COALESCE(components, '[]'::jsonb) as components 
        FROM "DaishaCatalog" 
        WHERE id = ${daishaId} 
        LIMIT 1
      `;

      if (!daisha) {
        return NextResponse.json({ error: 'Daisha tidak ditemukan.' }, { status: 404 });
      }

      const comps: ComponentObj[] = Array.isArray(daisha.components) ? daisha.components : [];
      if (comps.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        return NextResponse.json({ error: `Komponen "${name}" sudah ada pada Daisha ini.` }, { status: 400 });
      }

      const [seq] = await sql`SELECT nextval('"DaishaComponent_id_seq"') as id`;
      const newCompId = Number(seq.id);

      const newComponent: ComponentObj = {
        id: newCompId,
        name,
        symptoms: [],
      };

      comps.push(newComponent);

      await sql`
        UPDATE "DaishaCatalog"
        SET components = ${toJsonb(comps)},
            "updatedAt" = NOW()
        WHERE id = ${daishaId}
      `;

      recordAuditLog({
        action: 'CATALOG_ADD_COMPONENT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newCompId,
        details: `Komponen: ${name}, Daisha: ${daisha.name}`,
      });

      return NextResponse.json({
        success: true,
        message: `Komponen "${name}" berhasil ditambahkan ke ${daisha.name}.`,
        data: newComponent,
      });
    }

    // 3. Tambah Detail Gejala Kerusakan ke Komponen
    if (action === 'ADD_SYMPTOM') {
      const componentId = validatePositiveInt(body.componentId, 'ID Komponen', 1).value;
      const description = sanitizeText(body.description, 255);

      if (!componentId || !description) {
        return NextResponse.json({ error: 'ID Komponen dan Gejala Kerusakan wajib diisi.' }, { status: 400 });
      }

      // Cari record DaishaCatalog yang memiliki componentId
      const [daisha] = await sql<Array<{ id: number; name: string; components: ComponentObj[] }>>`
        SELECT id, name, COALESCE(components, '[]'::jsonb) as components
        FROM "DaishaCatalog"
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(components, '[]'::jsonb)) comp
          WHERE (comp->>'id')::int = ${componentId}
        )
        LIMIT 1
      `;

      if (!daisha) {
        return NextResponse.json({ error: 'Komponen tidak ditemukan di katalog.' }, { status: 404 });
      }

      const comps: ComponentObj[] = Array.isArray(daisha.components) ? daisha.components : [];
      const targetComp = comps.find((c) => c.id === componentId);
      if (!targetComp) {
        return NextResponse.json({ error: 'Komponen tidak ditemukan.' }, { status: 404 });
      }

      if (!targetComp.symptoms) {
        targetComp.symptoms = [];
      }

      if (targetComp.symptoms.some((s) => s.description.toLowerCase() === description.toLowerCase())) {
        return NextResponse.json({ error: 'Gejala kerusakan ini sudah ada pada komponen tersebut.' }, { status: 400 });
      }

      const [seq] = await sql`SELECT nextval('"DaishaSymptom_id_seq"') as id`;
      const newSymptomId = Number(seq.id);

      const newSymptom: SymptomObj = {
        id: newSymptomId,
        description,
      };

      targetComp.symptoms.push(newSymptom);

      await sql`
        UPDATE "DaishaCatalog"
        SET components = ${toJsonb(comps)},
            "updatedAt" = NOW()
        WHERE id = ${daisha.id}
      `;

      recordAuditLog({
        action: 'CATALOG_ADD_SYMPTOM',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newSymptomId,
        details: `Gejala: ${description}, Komponen: ${targetComp.name}`,
      });

      return NextResponse.json({
        success: true,
        message: `Gejala kerusakan berhasil ditambahkan.`,
        data: newSymptom,
      });
    }

    // 4. Tambah Varian Baru ke Jenis Daisha
    if (action === 'ADD_VARIANT') {
      const daishaId = validatePositiveInt(body.daishaTypeId || body.daishaId, 'ID Daisha', 1).value;
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

      if (!daishaId || !name) {
        return NextResponse.json({ error: 'ID Daisha dan Nama Varian wajib diisi.' }, { status: 400 });
      }

      const [daisha] = await sql<Array<{ id: number; name: string; variants: VariantObj[] }>>`
        SELECT id, name, COALESCE(variants, '[]'::jsonb) as variants 
        FROM "DaishaCatalog" 
        WHERE id = ${daishaId} 
        LIMIT 1
      `;

      if (!daisha) {
        return NextResponse.json({ error: 'Daisha tidak ditemukan.' }, { status: 404 });
      }

      const variants: VariantObj[] = Array.isArray(daisha.variants) ? daisha.variants : [];
      const [seq] = await sql`SELECT nextval('"DaishaVariant_id_seq"') as id`;
      const newVarId = Number(seq.id);

      const newVariant: VariantObj = {
        id: newVarId,
        name,
        ukuran: ukuran || null,
        susunan: susunan || null,
        tipe: tipe || null,
        codePrefix: codePrefix || null,
        padLength,
        minNumber,
        maxNumber,
        totalUnits,
        rangeFormat: rangeFormat || null,
        badgeColor: badgeColor || null,
      };

      variants.push(newVariant);
      const totalUnitsSum = variants.reduce((acc, v) => acc + (Number(v.totalUnits) || 0), 0);

      await sql`
        UPDATE "DaishaCatalog"
        SET variants = ${toJsonb(variants)},
            "totalUnits" = ${totalUnitsSum},
            "updatedAt" = NOW()
        WHERE id = ${daishaId}
      `;

      recordAuditLog({
        action: 'CATALOG_ADD_VARIANT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newVarId,
        details: `Varian: ${name}, Daisha: ${daisha.name}`,
      });

      // Sinkronkan tabel master unit Daisha seketika
      await syncDaishaMasterFromCatalog().catch((err) => console.error('Sync catalog error:', err));

      return NextResponse.json({
        success: true,
        message: `Varian "${name}" berhasil ditambahkan.`,
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
        message: `Seksi "${newSection.name}" berhasil disimpan.`,
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
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  const sizeCheck = validatePayloadSize(request, 256 * 1024);
  if (!sizeCheck.ok) return sizeCheck.errorResponse!;

  const rateLimit = checkRateLimit(`catalog_put:${auth.ip}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan update katalog.' }, { status: 429 });
  }

  try {
    invalidateCatalogCache();
    const body = await request.json();
    const action = sanitizeText(body.action, 50);

    // Perbarui metadata daisha
    if (action === 'EDIT_DAISHA' || action === 'UPDATE_DAISHA') {
      const id = validatePositiveInt(body.id, 'ID Daisha', 1).value;
      const name = sanitizeText(body.name, 100);
      const seksi = sanitizeText(body.seksi, 50) || 'All seksi';
      const codePrefix = sanitizeText(body.codePrefix, 20);
      const totalUnits = validatePositiveInt(body.totalUnits ?? 0, 'Total Unit', 0, 10000).value;

      if (!id || !name) {
        return NextResponse.json({ error: 'ID dan Nama Daisha wajib diisi.' }, { status: 400 });
      }

      const [updated] = await sql`
        UPDATE "DaishaCatalog"
        SET name = ${name},
            seksi = ${seksi},
            "codePrefix" = ${codePrefix || null},
            "totalUnits" = ${totalUnits},
            "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING id, name, seksi, "codePrefix", "totalUnits"
      `;

      if (!updated) {
        return NextResponse.json({ error: 'Jenis Daisha tidak ditemukan.' }, { status: 404 });
      }

      recordAuditLog({
        action: 'CATALOG_UPDATE_DAISHA',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Nama: ${updated.name}`,
      });

      // Sinkronkan tabel master unit Daisha seketika
      await syncDaishaMasterFromCatalog().catch((err) => console.error('Sync catalog error:', err));

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

      if (!id || !name) {
        return NextResponse.json({ error: 'ID dan Nama Komponen wajib diisi.' }, { status: 400 });
      }

      const [daisha] = await sql<Array<{ id: number; name: string; components: ComponentObj[] }>>`
        SELECT id, name, COALESCE(components, '[]'::jsonb) as components
        FROM "DaishaCatalog"
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(components, '[]'::jsonb)) comp
          WHERE (comp->>'id')::int = ${id}
        )
        LIMIT 1
      `;

      if (!daisha) {
        return NextResponse.json({ error: 'Komponen tidak ditemukan.' }, { status: 404 });
      }

      const comps: ComponentObj[] = Array.isArray(daisha.components) ? daisha.components : [];
      const comp = comps.find((c) => c.id === id);
      if (!comp) {
        return NextResponse.json({ error: 'Komponen tidak ditemukan di katalog Daisha.' }, { status: 404 });
      }

      comp.name = name;

      await sql`
        UPDATE "DaishaCatalog"
        SET components = ${toJsonb(comps)},
            "updatedAt" = NOW()
        WHERE id = ${daisha.id}
      `;

      recordAuditLog({
        action: 'CATALOG_UPDATE_COMPONENT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Nama: ${name}, Daisha: ${daisha.name}`,
      });

      return NextResponse.json({
        success: true,
        message: `Komponen berhasil diperbarui menjadi "${name}".`,
        data: comp,
      });
    }

    // 3. Edit Gejala
    if (action === 'EDIT_SYMPTOM' || action === 'UPDATE_SYMPTOM') {
      const id = validatePositiveInt(body.id, 'ID Gejala', 1).value;
      const description = sanitizeText(body.description || body.name, 255);

      if (!id || !description) {
        return NextResponse.json({ error: 'ID dan Deskripsi Gejala wajib diisi.' }, { status: 400 });
      }

      const [daisha] = await sql<Array<{ id: number; name: string; components: ComponentObj[] }>>`
        SELECT id, name, COALESCE(components, '[]'::jsonb) as components
        FROM "DaishaCatalog"
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(components, '[]'::jsonb)) comp,
          LATERAL jsonb_array_elements(COALESCE(comp->'symptoms', '[]'::jsonb)) sym
          WHERE (sym->>'id')::int = ${id}
        )
        LIMIT 1
      `;

      if (!daisha) {
        return NextResponse.json({ error: 'Gejala tidak ditemukan di katalog.' }, { status: 404 });
      }

      const comps: ComponentObj[] = Array.isArray(daisha.components) ? daisha.components : [];
      let foundSymptom: SymptomObj | null = null;

      for (const comp of comps) {
        if (comp.symptoms) {
          const s = comp.symptoms.find((item) => item.id === id);
          if (s) {
            s.description = description;
            foundSymptom = s;
            break;
          }
        }
      }

      if (!foundSymptom) {
        return NextResponse.json({ error: 'Gejala tidak ditemukan.' }, { status: 404 });
      }

      await sql`
        UPDATE "DaishaCatalog"
        SET components = ${toJsonb(comps)},
            "updatedAt" = NOW()
        WHERE id = ${daisha.id}
      `;

      recordAuditLog({
        action: 'CATALOG_UPDATE_SYMPTOM',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Gejala: ${description}`,
      });

      return NextResponse.json({
        success: true,
        message: `Gejala kerusakan berhasil diperbarui.`,
        data: foundSymptom,
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

      const [daisha] = await sql<Array<{ id: number; name: string; variants: VariantObj[] }>>`
        SELECT id, name, COALESCE(variants, '[]'::jsonb) as variants
        FROM "DaishaCatalog"
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(variants, '[]'::jsonb)) v
          WHERE (v->>'id')::int = ${id}
        )
        LIMIT 1
      `;

      if (!daisha) {
        return NextResponse.json({ error: 'Varian tidak ditemukan di katalog.' }, { status: 404 });
      }

      const variants: VariantObj[] = Array.isArray(daisha.variants) ? daisha.variants : [];
      const variant = variants.find((v) => v.id === id);
      if (!variant) {
        return NextResponse.json({ error: 'Varian tidak ditemukan.' }, { status: 404 });
      }

      variant.name = name;
      variant.ukuran = ukuran || null;
      variant.susunan = susunan || null;
      variant.tipe = tipe || null;
      variant.codePrefix = codePrefix || null;
      variant.padLength = padLength;
      variant.minNumber = minNumber;
      variant.maxNumber = maxNumber;
      variant.totalUnits = totalUnits;
      variant.rangeFormat = rangeFormat || null;
      variant.badgeColor = badgeColor || null;

      const totalUnitsSum = variants.reduce((acc, v) => acc + (Number(v.totalUnits) || 0), 0);

      await sql`
        UPDATE "DaishaCatalog"
        SET variants = ${toJsonb(variants)},
            "totalUnits" = ${totalUnitsSum},
            "updatedAt" = NOW()
        WHERE id = ${daisha.id}
      `;

      recordAuditLog({
        action: 'CATALOG_UPDATE_VARIANT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Varian: ${name}, Daisha: ${daisha.name}`,
      });

      // Sinkronkan tabel master unit Daisha seketika
      await syncDaishaMasterFromCatalog().catch((err) => console.error('Sync catalog error:', err));

      return NextResponse.json({
        success: true,
        message: `Varian berhasil diperbarui menjadi "${name}".`,
        data: variant,
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
  const auth = await requireAuth(request, ['ADMIN']);
  if (!auth.authorized) return auth.errorResponse!;

  const rateLimit = checkRateLimit(`catalog_delete:${auth.ip}`, 20, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan penghapusan.' }, { status: 429 });
  }

  try {
    invalidateCatalogCache();
    const { searchParams } = new URL(request.url);
    let type = searchParams.get('type');
    let idParam = searchParams.get('id');

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

    // Hapus jenis daisha
    if (type === 'daisha') {
      const [deleted] = await sql`DELETE FROM "DaishaCatalog" WHERE id = ${id} RETURNING id, name`;
      if (!deleted) {
        return NextResponse.json({ error: 'Jenis Daisha tidak ditemukan.' }, { status: 404 });
      }

      recordAuditLog({
        action: 'CATALOG_DELETE_DAISHA',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Nama: ${deleted.name}`,
      });

      // Sinkronkan tabel master unit Daisha seketika
      await syncDaishaMasterFromCatalog().catch((err) => console.error('Sync catalog error:', err));

      return NextResponse.json({ success: true, message: `Jenis Daisha "${deleted.name}" beserta komponennya berhasil dihapus.` });
    }

    // 2. Hapus Komponen
    if (type === 'component') {
      const [daisha] = await sql<Array<{ id: number; name: string; components: ComponentObj[] }>>`
        SELECT id, name, COALESCE(components, '[]'::jsonb) as components
        FROM "DaishaCatalog"
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(components, '[]'::jsonb)) comp
          WHERE (comp->>'id')::int = ${id}
        )
        LIMIT 1
      `;

      if (!daisha) {
        return NextResponse.json({ error: 'Komponen tidak ditemukan di katalog.' }, { status: 404 });
      }

      const comps: ComponentObj[] = Array.isArray(daisha.components) ? daisha.components : [];
      const updatedComps = comps.filter((c) => c.id !== id);

      await sql`
        UPDATE "DaishaCatalog"
        SET components = ${toJsonb(updatedComps)},
            "updatedAt" = NOW()
        WHERE id = ${daisha.id}
      `;

      recordAuditLog({
        action: 'CATALOG_DELETE_COMPONENT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Daisha: ${daisha.name}`,
      });

      return NextResponse.json({ success: true, message: 'Komponen beserta gejalanya berhasil dihapus.' });
    }

    // 3. Hapus Gejala
    if (type === 'symptom') {
      const [daisha] = await sql<Array<{ id: number; name: string; components: ComponentObj[] }>>`
        SELECT id, name, COALESCE(components, '[]'::jsonb) as components
        FROM "DaishaCatalog"
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(components, '[]'::jsonb)) comp,
          LATERAL jsonb_array_elements(COALESCE(comp->'symptoms', '[]'::jsonb)) sym
          WHERE (sym->>'id')::int = ${id}
        )
        LIMIT 1
      `;

      if (!daisha) {
        return NextResponse.json({ error: 'Gejala tidak ditemukan di katalog.' }, { status: 404 });
      }

      const comps: ComponentObj[] = Array.isArray(daisha.components) ? daisha.components : [];
      for (const comp of comps) {
        if (comp.symptoms) {
          comp.symptoms = comp.symptoms.filter((s) => s.id !== id);
        }
      }

      await sql`
        UPDATE "DaishaCatalog"
        SET components = ${toJsonb(comps)},
            "updatedAt" = NOW()
        WHERE id = ${daisha.id}
      `;

      recordAuditLog({
        action: 'CATALOG_DELETE_SYMPTOM',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Daisha: ${daisha.name}`,
      });

      return NextResponse.json({ success: true, message: 'Gejala kerusakan berhasil dihapus.' });
    }

    // 4. Hapus Varian
    if (type === 'variant') {
      const [daisha] = await sql<Array<{ id: number; name: string; variants: VariantObj[] }>>`
        SELECT id, name, COALESCE(variants, '[]'::jsonb) as variants
        FROM "DaishaCatalog"
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(variants, '[]'::jsonb)) v
          WHERE (v->>'id')::int = ${id}
        )
        LIMIT 1
      `;

      if (!daisha) {
        return NextResponse.json({ error: 'Varian tidak ditemukan di katalog.' }, { status: 404 });
      }

      const variants: VariantObj[] = Array.isArray(daisha.variants) ? daisha.variants : [];
      const updatedVariants = variants.filter((v) => v.id !== id);
      const totalUnitsSum = updatedVariants.reduce((acc, v) => acc + (Number(v.totalUnits) || 0), 0);

      await sql`
        UPDATE "DaishaCatalog"
        SET variants = ${toJsonb(updatedVariants)},
            "totalUnits" = ${totalUnitsSum},
            "updatedAt" = NOW()
        WHERE id = ${daisha.id}
      `;

      recordAuditLog({
        action: 'CATALOG_DELETE_VARIANT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: id,
        details: `Daisha: ${daisha.name}`,
      });

      // Sinkronkan tabel master unit Daisha seketika
      await syncDaishaMasterFromCatalog().catch((err) => console.error('Sync catalog error:', err));

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
