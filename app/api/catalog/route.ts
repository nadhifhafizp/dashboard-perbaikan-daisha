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
import { syncDaishaMasterFromCatalog, insertNewDaishaUnits } from '@/lib/daishaCatalogSync';
import { invalidateMaintenanceCache } from '@/app/api/maintenance/route';

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

function invalidateCatalogCache(): void {
  cachedCatalogResponse = null;
  cachedCatalogTimestamp = 0;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/catalog - Mengambil data katalog Daisha, Komponen, dan Gejala dari TWMSDamageCatalog & TWMSDaishaCatalog
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
    // 1. Ambil seluruh data hierarki dari TWMSDamageCatalog
    const rows = await sql`
      SELECT 
        "Id" AS id,
        "DaishaType" AS daisha_type,
        COALESCE("SectionName", 'Building') AS section_name,
        "ComponentName" AS component_name,
        "SymptomDesc" AS symptom_desc
      FROM "TWMSDamageCatalog"
      ORDER BY "DaishaType" ASC, "ComponentName" ASC NULLS LAST, "SymptomDesc" ASC NULLS LAST
    `;

    // 2. Hitung jumlah unit armada per jenis dari TWMSDaishaCatalog
    const unitStats = await sql`
      SELECT 
        "DaishaType" AS daisha_type,
        COUNT(*)::int AS total_units
      FROM "TWMSDaishaCatalog"
      WHERE "IsActive" = TRUE
      GROUP BY "DaishaType"
    `;
    const unitMap = new Map<string, number>();
    unitStats.forEach((u) => {
      if (u.daisha_type) unitMap.set(u.daisha_type.toLowerCase(), u.total_units);
    });

    // 3. Ambil varian ukuran dari TWMSDaishaCatalog
    const sizeRows = await sql`
      SELECT 
        "DaishaType" AS daisha_type,
        "SizeSpec" AS size,
        COUNT(*)::int AS count
      FROM "TWMSDaishaCatalog"
      WHERE "IsActive" = TRUE AND "SizeSpec" IS NOT NULL AND "SizeSpec" != 'NONE'
      GROUP BY "DaishaType", "SizeSpec"
      ORDER BY "DaishaType", "SizeSpec"
    `;
    const sizeMap = new Map<string, VariantObj[]>();
    sizeRows.forEach((s) => {
      const key = s.daisha_type?.toLowerCase();
      if (!key) return;
      if (!sizeMap.has(key)) sizeMap.set(key, []);
      sizeMap.get(key)!.push({
        id: sizeMap.get(key)!.length + 1,
        name: `${s.daisha_type} ${s.size}`,
        ukuran: s.size,
        totalUnits: s.count,
      });
    });

    const defaultSectionRows = Object.values(SECTION_METAS).map((s, idx) => ({
      id: idx + 1,
      name: s.name as string,
      colorName: s.colorName,
      badgeBg: s.badgeBg,
      textColor: s.textColor,
      borderColor: s.borderColor,
      accentBorder: s.accentBorder,
    }));

    // Kelompokkan per DaishaType
    const groupedDaisha = new Map<
      string,
      {
        id: number;
        name: string;
        seksi: string;
        codePrefix: string;
        totalUnits: number;
        componentsMap: Map<string, { id: number; name: string; symptoms: SymptomObj[] }>;
        variants: VariantObj[];
      }
    >();

    let typeSeq = 1;
    let compSeq = 1;
    let symSeq = 1;

    for (const r of rows) {
      if (!r.daisha_type) continue;
      const typeKey = r.daisha_type.trim();
      if (!groupedDaisha.has(typeKey)) {
        groupedDaisha.set(typeKey, {
          id: typeSeq++,
          name: typeKey,
          seksi: r.section_name,
          codePrefix: '',
          totalUnits: unitMap.get(typeKey.toLowerCase()) || 0,
          componentsMap: new Map(),
          variants: sizeMap.get(typeKey.toLowerCase()) || [],
        });
      }

      const d = groupedDaisha.get(typeKey)!;
      if (r.component_name && r.component_name.trim()) {
        const compKey = r.component_name.trim();
        if (!d.componentsMap.has(compKey)) {
          d.componentsMap.set(compKey, {
            id: compSeq++,
            name: compKey,
            symptoms: [],
          });
        }
        const c = d.componentsMap.get(compKey)!;
        if (r.symptom_desc && r.symptom_desc.trim()) {
          const symDesc = r.symptom_desc.trim();
          if (!c.symptoms.some((s) => s.description === symDesc)) {
            c.symptoms.push({
              id: symSeq++,
              description: symDesc,
            });
          }
        }
      }
    }

    const rawCatalog: Record<string, unknown> = {};
    const tree: Array<unknown> = [];

    for (const [name, d] of groupedDaisha) {
      const jenisKerusakan: Record<string, string[]> = {};
      const components = Array.from(d.componentsMap.values());
      components.forEach((c) => {
        jenisKerusakan[c.name] = c.symptoms.map((s) => s.description);
      });

      rawCatalog[name] = {
        seksi: d.seksi,
        codePrefix: d.codePrefix,
        totalUnits: d.totalUnits,
        jenisKerusakan,
        variants: d.variants,
      };

      tree.push({
        id: d.id,
        name: d.name,
        seksi: d.seksi,
        codePrefix: d.codePrefix,
        totalUnits: d.totalUnits,
        components,
        variants: d.variants,
      });
    }

    const seksiSet = new Set<string>(DAFTAR_SEKSI);
    defaultSectionRows.forEach((s) => seksiSet.add(s.name));
    for (const [, d] of groupedDaisha) {
      if (d.seksi) seksiSet.add(d.seksi);
    }

    const responsePayload: CatalogCacheData = {
      success: true,
      seksiList: Array.from(seksiSet).sort(),
      sections: defaultSectionRows,
      catalog: rawCatalog,
      tree,
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
 * POST /api/catalog - Menambah Daisha Baru, Komponen Baru, atau Gejala Baru ke TWMSDamageCatalog
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

    // 1. Tambah jenis daisha baru
    if (action === 'ADD_DAISHA') {
      const name = sanitizeText(body.name, 100);
      const seksi = sanitizeText(body.seksi, 50) || 'Building';
      const codePrefix = sanitizeText(body.codePrefix, 20);
      const totalUnits = validatePositiveInt(body.totalUnits ?? 0, 'Total Unit', 0, 10000).value;

      if (!name) {
        return NextResponse.json({ error: 'Nama Daisha wajib diisi.' }, { status: 400 });
      }

      const [existing] = await sql`
        SELECT "Id" FROM "TWMSDamageCatalog" 
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${name})) 
        LIMIT 1
      `;
      if (existing) {
        return NextResponse.json({ error: `Jenis Daisha "${name}" sudah ada.` }, { status: 400 });
      }

      const [newDaisha] = await sql`
        INSERT INTO "TWMSDamageCatalog" ("DaishaType", "SectionName", "UpdateDate")
        VALUES (${name}, ${seksi}, NOW())
        RETURNING "Id" AS id, "DaishaType" AS name, "SectionName" AS seksi
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

      if (totalUnits > 0) {
        await insertNewDaishaUnits(newDaisha.name, newDaisha.seksi, codePrefix || null, totalUnits);
      }

      await syncDaishaMasterFromCatalog();
      invalidateMaintenanceCache();

      return NextResponse.json({
        success: true,
        message: `Jenis Daisha "${newDaisha.name}" berhasil ditambahkan.`,
        data: newDaisha,
      });
    }

    // 2. Tambah Komponen Baru ke Jenis Daisha
    if (action === 'ADD_COMPONENT') {
      const daishaName = sanitizeText(body.daishaName || body.name_daisha, 100);
      const daishaId = body.daishaId ? Number(body.daishaId) : null;
      const name = sanitizeText(body.name, 100);

      if (!name) {
        return NextResponse.json({ error: 'Nama Komponen wajib diisi.' }, { status: 400 });
      }

      let targetDaishaType = daishaName;
      let targetSection = 'Building';

      if (!targetDaishaType && daishaId) {
        const [dRow] = await sql`SELECT "DaishaType", "SectionName" FROM "TWMSDamageCatalog" WHERE "Id" = ${daishaId} LIMIT 1`;
        if (dRow) {
          targetDaishaType = dRow.DaishaType;
          targetSection = dRow.SectionName || 'Building';
        }
      }

      if (!targetDaishaType) {
        return NextResponse.json({ error: 'Jenis Daisha tidak ditemukan.' }, { status: 404 });
      }

      const [exists] = await sql`
        SELECT "Id" FROM "TWMSDamageCatalog"
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${targetDaishaType}))
          AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${name}))
        LIMIT 1
      `;
      if (exists) {
        return NextResponse.json({ error: `Komponen "${name}" sudah ada pada Daisha ini.` }, { status: 400 });
      }

      const [newComp] = await sql`
        INSERT INTO "TWMSDamageCatalog" ("DaishaType", "SectionName", "ComponentName", "UpdateDate")
        VALUES (${targetDaishaType}, ${targetSection}, ${name}, NOW())
        RETURNING "Id" AS id, "ComponentName" AS name
      `;

      recordAuditLog({
        action: 'CATALOG_ADD_COMPONENT',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newComp.id,
        details: `Komponen: ${name}, Daisha: ${targetDaishaType}`,
      });

      invalidateMaintenanceCache();

      return NextResponse.json({
        success: true,
        message: `Komponen "${name}" berhasil ditambahkan ke ${targetDaishaType}.`,
        data: { id: newComp.id, name, symptoms: [] },
      });
    }

    // 3. Tambah Detail Gejala Kerusakan ke Komponen
    if (action === 'ADD_SYMPTOM') {
      const daishaName = sanitizeText(body.daishaName, 100);
      const componentName = sanitizeText(body.componentName, 100);
      const description = sanitizeText(body.description, 255);

      if (!description) {
        return NextResponse.json({ error: 'Deskripsi gejala kerusakan wajib diisi.' }, { status: 400 });
      }

      let targetType = daishaName;
      let targetComp = componentName;
      let targetSeksi = 'Building';

      if (!targetType || !targetComp) {
        const compId = body.componentId ? Number(body.componentId) : null;
        if (compId) {
          const [cRow] = await sql`SELECT "DaishaType", "ComponentName", "SectionName" FROM "TWMSDamageCatalog" WHERE "Id" = ${compId} LIMIT 1`;
          if (cRow) {
            targetType = cRow.DaishaType;
            targetComp = cRow.ComponentName;
            targetSeksi = cRow.SectionName || 'Building';
          }
        }
      }

      if (!targetType || !targetComp) {
        return NextResponse.json({ error: 'Komponen tidak ditemukan di katalog.' }, { status: 404 });
      }

      const [exists] = await sql`
        SELECT "Id" FROM "TWMSDamageCatalog"
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${targetType}))
          AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${targetComp}))
          AND LOWER(TRIM("SymptomDesc")) = LOWER(TRIM(${description}))
        LIMIT 1
      `;
      if (exists) {
        return NextResponse.json({ error: 'Gejala kerusakan ini sudah ada pada komponen tersebut.' }, { status: 400 });
      }

      const [newSym] = await sql`
        INSERT INTO "TWMSDamageCatalog" ("DaishaType", "SectionName", "ComponentName", "SymptomDesc", "UpdateDate")
        VALUES (${targetType}, ${targetSeksi}, ${targetComp}, ${description}, NOW())
        RETURNING "Id" AS id, "SymptomDesc" AS description
      `;

      recordAuditLog({
        action: 'CATALOG_ADD_SYMPTOM',
        ip: auth.ip,
        user: auth.user?.username,
        role: auth.user?.role,
        status: 'SUCCESS',
        targetId: newSym.id,
        details: `Gejala: ${description}, Komponen: ${targetComp}`,
      });

      invalidateMaintenanceCache();

      return NextResponse.json({
        success: true,
        message: `Gejala kerusakan berhasil ditambahkan.`,
        data: { id: newSym.id, description },
      });
    }

    // 4. Update Daisha / Komponen / Gejala
    if (action === 'EDIT_DAISHA' || action === 'UPDATE_DAISHA') {
      const oldName = sanitizeText(body.oldName || body.name, 100);
      const newName = sanitizeText(body.newName || body.name, 100);
      const seksi = sanitizeText(body.seksi, 50);

      if (!oldName || !newName) {
        return NextResponse.json({ error: 'Nama Daisha wajib diisi.' }, { status: 400 });
      }

      await sql`
        UPDATE "TWMSDamageCatalog"
        SET 
          "DaishaType" = ${newName},
          "SectionName" = COALESCE(${seksi}, "SectionName"),
          "UpdateDate" = NOW()
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${oldName}))
      `;

      await sql`
        UPDATE "TWMSDaishaCatalog"
        SET 
          "DaishaType" = ${newName},
          "SectionName" = COALESCE(${seksi}, "SectionName"),
          "UpdateDate" = NOW()
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${oldName}))
      `;

      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: `Jenis Daisha "${newName}" berhasil diperbarui.` });
    }

    if (action === 'EDIT_COMPONENT' || action === 'UPDATE_COMPONENT') {
      const daishaName = sanitizeText(body.daishaName, 100);
      const oldName = sanitizeText(body.oldName, 100);
      const newName = sanitizeText(body.newName, 100);

      if (!daishaName || !oldName || !newName) {
        return NextResponse.json({ error: 'Parameter komponen tidak lengkap.' }, { status: 400 });
      }

      await sql`
        UPDATE "TWMSDamageCatalog"
        SET "ComponentName" = ${newName}, "UpdateDate" = NOW()
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
          AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${oldName}))
      `;

      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: `Komponen "${newName}" berhasil diperbarui.` });
    }

    if (action === 'EDIT_SYMPTOM' || action === 'UPDATE_SYMPTOM') {
      const daishaName = sanitizeText(body.daishaName, 100);
      const componentName = sanitizeText(body.componentName, 100);
      const oldDesc = sanitizeText(body.oldDescription || body.oldDesc, 255);
      const newDesc = sanitizeText(body.newDescription || body.newDesc, 255);

      if (!daishaName || !componentName || !oldDesc || !newDesc) {
        return NextResponse.json({ error: 'Parameter gejala tidak lengkap.' }, { status: 400 });
      }

      await sql`
        UPDATE "TWMSDamageCatalog"
        SET "SymptomDesc" = ${newDesc}, "UpdateDate" = NOW()
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
          AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${componentName}))
          AND LOWER(TRIM("SymptomDesc")) = LOWER(TRIM(${oldDesc}))
      `;

      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: `Gejala kerusakan berhasil diperbarui.` });
    }

    return NextResponse.json({ error: 'Aksi tidak valid.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memproses katalog.';
    console.error('Error in POST /api/catalog:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/catalog - Hapus data dari TWMSDamageCatalog (Khusus role ADMIN)
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
    const daishaName = sanitizeText(searchParams.get('daisha') || searchParams.get('name') || '', 100);
    const componentName = sanitizeText(searchParams.get('component') || '', 100);
    const symptomDesc = sanitizeText(searchParams.get('symptom') || '', 255);

    if (!type) {
      try {
        const body = await request.json();
        if (body.type) type = body.type;
        if (body.id) idParam = String(body.id);
      } catch {}
    }

    if (type === 'daisha' && daishaName) {
      await sql`
        DELETE FROM "TWMSDamageCatalog"
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
      `;
      await sql`
        DELETE FROM "TWMSDaishaCatalog"
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
      `;
      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: `Jenis Daisha "${daishaName}" berhasil dihapus.` });
    }

    if (type === 'component' && daishaName && componentName) {
      await sql`
        DELETE FROM "TWMSDamageCatalog"
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
          AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${componentName}))
      `;
      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: `Komponen "${componentName}" berhasil dihapus.` });
    }

    if (type === 'symptom' && daishaName && componentName && symptomDesc) {
      await sql`
        DELETE FROM "TWMSDamageCatalog"
        WHERE LOWER(TRIM("DaishaType")) = LOWER(TRIM(${daishaName}))
          AND LOWER(TRIM("ComponentName")) = LOWER(TRIM(${componentName}))
          AND LOWER(TRIM("SymptomDesc")) = LOWER(TRIM(${symptomDesc}))
      `;
      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: `Gejala "${symptomDesc}" berhasil dihapus.` });
    }

    if (idParam) {
      const id = validatePositiveInt(idParam, 'ID', 1).value;
      await sql`DELETE FROM "TWMSDamageCatalog" WHERE "Id" = ${id}`;
      invalidateMaintenanceCache();
      return NextResponse.json({ success: true, message: 'Item katalog berhasil dihapus.' });
    }

    return NextResponse.json({ error: 'Parameter penghapusan tidak lengkap.' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus data dari katalog.';
    console.error('Error in DELETE /api/catalog:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
