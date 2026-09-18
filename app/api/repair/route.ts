import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseAndVerifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import sql from '@/lib/db';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';
import { parseToTimestamp } from '@/lib/date';

function sanitizeString(val: unknown, maxLength = 255): string {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/[\x00-\x1F\x7F<>]/g, '').slice(0, maxLength);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 1. FUNGSI GET: Membaca data langsung dari PostgreSQL via postgres.js (< 5ms)
export async function GET() {
  // Proteksi: Wajib login (Admin atau Operator)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await parseAndVerifySession(sessionCookie);

  if (!session.valid || !session.user) {
    return NextResponse.json(
      { error: "Akses ditolak. Sesi login diperlukan untuk melihat data perbaikan." },
      { status: 401 }
    );
  }

  try {
    const tickets = await sql`
      SELECT 
        t."idTiket",
        t."status",
        t."namaPelapor",
        t."noDaisha",
        t."waktuMasuk",
        t."waktuSelesai",
        t."catatan",
        m."namaDaisha",
        m."seksi",
        COALESCE(
          json_agg(
            json_build_object(
              'idDetail', d."idDetail",
              'komponen', d."komponen",
              'gejala', d."gejala",
              'tindakan', d."tindakan",
              'qty', d."qty"
            )
          ) FILTER (WHERE d."idDetail" IS NOT NULL),
          '[]'::json
        ) AS details
      FROM "Ticket" t
      LEFT JOIN "MasterDaisha" m ON t."noDaisha" = m."noDaisha"
      LEFT JOIN "TicketDetail" d ON t."idTiket" = d."idTiket"
      GROUP BY t."idTiket", m."namaDaisha", m."seksi"
      ORDER BY t."waktuMasuk" DESC
    `;

    // Helper format tanggal ke format standar tampilan Indonesia: DD/MM/YYYY HH:mm
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatIndoDate = (d: Date | string | null) => {
      if (!d) return '-';
      const date = typeof d === 'string' ? new Date(d) : d;
      if (isNaN(date.getTime())) return '-';
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    // Format output 100% kompatibel dengan frontend tanpa merubah UI/komponen apa pun
    const formattedData = tickets.map((t) => {
      let detailsList: Array<{ komponen: string; gejala: string; qty: number; tindakan: string }> = [];
      try {
        if (Array.isArray(t.details)) {
          detailsList = t.details;
        } else if (typeof t.details === 'string') {
          detailsList = JSON.parse(t.details || '[]');
        }
      } catch {
        detailsList = [];
      }
      const kategoriList = Array.from(new Set(detailsList.map((d: { komponen: string }) => d.komponen))).filter(Boolean);
      const detailStr = detailsList.length > 0
        ? detailsList.map((d: { komponen: string; gejala: string; qty: number; tindakan: string }, idx: number) => `${idx + 1}. [${d.komponen}] ${d.gejala} (Qty: ${d.qty}, Tindakan: ${d.tindakan})`).join(' | ')
        : '-';

      return {
        ID_Tiket: t.idTiket,
        Status: t.status,
        Nama_Pelapor: t.namaPelapor,
        Seksi: t.seksi || '-',
        No_Daisha: t.noDaisha,
        Nama_Daisha: t.namaDaisha || '-',
        Kategori_Kerusakan: kategoriList.join(', ') || 'Umum',
        Detail_Kerusakan: detailStr,
        Catatan: t.catatan || '-',
        Waktu_Masuk: formatIndoDate(t.waktuMasuk),
        Waktu_Keluar: formatIndoDate(t.waktuSelesai),
      };
    });

    return NextResponse.json(formattedData, {
      headers: {
        'X-Database': 'PostgreSQL-Native',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    console.error("Database GET Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data tiket dari database" },
      { status: 500 }
    );
  }
}

// 2. FUNGSI POST: Create, Update, Delete tiket langsung via postgres.js
export async function POST(request: Request) {
  // Proteksi Autentikasi Umum
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await parseAndVerifySession(sessionCookie);

  if (!session.valid || !session.user) {
    return NextResponse.json(
      { error: "Akses ditolak. Silakan login terlebih dahulu sebelum melakukan aksi." },
      { status: 401 }
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Format request tidak valid, harus JSON" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const action = sanitizeString(body.action).toUpperCase();

    if (!action || !['CREATE', 'UPDATE', 'DELETE', 'EDIT_TICKET'].includes(action)) {
      return NextResponse.json(
        { error: "Aksi tidak valid. Hanya 'CREATE', 'UPDATE', 'DELETE', atau 'EDIT_TICKET' yang diizinkan." },
        { status: 400 }
      );
    }

    // 2.1 CREATE (Bisa dilakukan oleh Operator maupun Admin)
    if (action === 'CREATE') {
      const idTiket = sanitizeString(body.idTiket, 50) || `TCK-${Date.now()}`;
      const waktuMasuk = sanitizeString(body.waktuMasuk, 30);
      const namaPelapor = sanitizeString(body.namaPelapor, 100);
      const seksi = sanitizeString(body.seksi, 50);
      const namaDaisha = sanitizeString(body.namaDaisha, 100);
      const noDaisha = sanitizeString(body.noDaisha, 50).toUpperCase();
      const detail = sanitizeString(body.detail, 2000);

      // Validasi kelengkapan data form laporan
      if (!namaPelapor || !seksi || !namaDaisha || !noDaisha) {
        return NextResponse.json(
          { error: "Field wajib (Nama Pelapor, Seksi, Nama Daisha, No Daisha) tidak boleh kosong." },
          { status: 400 }
        );
      }

      // Pastikan Master Daisha terdaftar
      const sizeInfo = detectDaishaSize(noDaisha);
      const ukuran = sizeInfo?.code || 'Standard';
      await sql`
        INSERT INTO "MasterDaisha" ("noDaisha", "namaDaisha", "ukuran", "seksi")
        VALUES (${noDaisha}, ${namaDaisha}, ${ukuran}, ${seksi})
        ON CONFLICT ("noDaisha") DO UPDATE 
        SET "namaDaisha" = EXCLUDED."namaDaisha", "ukuran" = EXCLUDED."ukuran", "seksi" = EXCLUDED."seksi"
      `;

      // Parse waktu masuk secara konsisten (aman format DD/MM/YYYY maupun ISO)
      let parsedDateMasuk = new Date();
      if (waktuMasuk) {
        const ts = parseToTimestamp(waktuMasuk);
        if (ts > 0) parsedDateMasuk = new Date(ts);
      }

      // Buat Tiket
      await sql`
        INSERT INTO "Ticket" ("idTiket", "noDaisha", "namaPelapor", "status", "waktuMasuk", "catatan")
        VALUES (${idTiket}, ${noDaisha}, ${namaPelapor}, 'Open', ${parsedDateMasuk}, '-')
      `;

      // Pecah rincian kerusakan ke TicketDetail
      const parsedDetails = parseTicketDamageDetail(detail);
      if (parsedDetails.items.length > 0) {
        await sql`
          INSERT INTO "TicketDetail" ("idTiket", "komponen", "gejala", "tindakan", "qty")
          VALUES ${sql(parsedDetails.items.map(it => [idTiket, it.komponen, it.gejala, it.tindakan || 'Repair', it.qty || 1]))}
        `;
      }

      // Pengurangan stok otomatis untuk komponen Ganti Baru (Projek 3)
      const gantiItems = parsedDetails.items.filter((it) => it.tindakan === 'Ganti');
      await Promise.allSettled(
        gantiItems.map((it) =>
          sql`
            UPDATE "Sparepart"
            SET "stokGudang" = "stokGudang" - ${it.qty || 1}
            WHERE "namaKomponen" = ${it.komponen}
          `.catch((e) => {
            console.warn(`[Sparepart] Komponen '${it.komponen}' tidak ditemukan, skip pengurangan stok:`, e);
          })
        )
      );

      return NextResponse.json({
        success: true,
        message: `Tiket ${idTiket} berhasil dibuat di database`,
        idTiket,
      });
    }

    // 2.2 UPDATE STATUS & CATATAN (KHUSUS ROLE ADMIN)
    else if (action === 'UPDATE') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: "Akses ditolak. Hanya akun ADMIN yang berhak memperbarui status perbaikan tiket." },
          { status: 403 }
        );
      }

      const idTiket = sanitizeString(body.idTiket, 50);
      const status = sanitizeString(body.status, 20);
      const waktuKeluar = sanitizeString(body.waktuKeluar, 30);
      const catatan = sanitizeString(body.catatan, 500);

      if (!idTiket) {
        return NextResponse.json(
          { error: "ID Tiket wajib diisi untuk melakukan update." },
          { status: 400 }
        );
      }

      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (!['Progress', 'Done', 'Scrap'].includes(normalizedStatus)) {
        return NextResponse.json(
          { error: "Status tidak valid. Tiket yang sedang/sudah diproses tidak dapat dikembalikan ke status 'Open'." },
          { status: 400 }
        );
      }

      // Parse waktu selesai secara konsisten
      let parsedWaktuSelesai: Date | null = null;
      if (normalizedStatus === 'Done') {
        if (waktuKeluar && waktuKeluar !== '-') {
          const ts = parseToTimestamp(waktuKeluar);
          parsedWaktuSelesai = ts > 0 ? new Date(ts) : new Date();
        } else {
          parsedWaktuSelesai = new Date();
        }
      }

      await sql`
        UPDATE "Ticket"
        SET 
          "status" = ${normalizedStatus},
          "waktuSelesai" = ${parsedWaktuSelesai},
          "catatan" = ${catatan && catatan !== '-' ? catatan : null}
        WHERE "idTiket" = ${idTiket}
      `;

      return NextResponse.json({
        success: true,
        message: `Status tiket ${idTiket} berhasil diubah menjadi ${normalizedStatus}`,
      });
    }

    // 2.3 DELETE / BATALKAN TIKET (KHUSUS ROLE ADMIN — operasi destruktif)
    else if (action === 'DELETE') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: "Akses ditolak. Hanya akun ADMIN yang berhak menghapus tiket." },
          { status: 403 }
        );
      }

      const idTiket = sanitizeString(body.idTiket, 50);
      if (!idTiket) {
        return NextResponse.json(
          { error: "ID Tiket wajib diisi untuk membatalkan tiket." },
          { status: 400 }
        );
      }

      await sql`DELETE FROM "TicketDetail" WHERE "idTiket" = ${idTiket}`;
      await sql`DELETE FROM "Ticket" WHERE "idTiket" = ${idTiket}`;

      return NextResponse.json({
        success: true,
        message: `Tiket ${idTiket} berhasil dibatalkan / dihapus`,
      });
    }

    // 2.4 EDIT_TICKET (Koreksi data tiket oleh Pelapor/Operator)
    else if (action === 'EDIT_TICKET') {
      const idTiket = sanitizeString(body.idTiket, 50);
      const namaPelapor = sanitizeString(body.namaPelapor, 100);
      const seksi = sanitizeString(body.seksi, 50);
      const namaDaisha = sanitizeString(body.namaDaisha, 100);
      const noDaisha = sanitizeString(body.noDaisha, 50).toUpperCase();
      const detail = sanitizeString(body.detail, 2000);

      if (!idTiket || !noDaisha) {
        return NextResponse.json(
          { error: "ID Tiket dan Nomor Daisha wajib diisi untuk melakukan koreksi." },
          { status: 400 }
        );
      }

      // Update Master Daisha
      const sizeInfo = detectDaishaSize(noDaisha);
      const ukuran = sizeInfo?.code || 'Standard';
      await sql`
        INSERT INTO "MasterDaisha" ("noDaisha", "namaDaisha", "ukuran", "seksi")
        VALUES (${noDaisha}, ${namaDaisha}, ${ukuran}, ${seksi})
        ON CONFLICT ("noDaisha") DO UPDATE 
        SET "namaDaisha" = EXCLUDED."namaDaisha", "ukuran" = EXCLUDED."ukuran", "seksi" = EXCLUDED."seksi"
      `;

      // Update Ticket
      const waktuMasukRaw = sanitizeString(body.waktuMasuk, 30);
      let parsedWaktuMasuk: Date | null = null;
      if (waktuMasukRaw && waktuMasukRaw !== '-') {
        const d = new Date(waktuMasukRaw);
        if (!isNaN(d.getTime())) parsedWaktuMasuk = d;
      }

      await sql`
        UPDATE "Ticket"
        SET 
          "noDaisha" = ${noDaisha},
          "namaPelapor" = ${namaPelapor || session.user.name || 'Operator'},
          "waktuMasuk" = COALESCE(${parsedWaktuMasuk}, "waktuMasuk")
        WHERE "idTiket" = ${idTiket}
      `;

      // Update Rincian Kerusakan
      await sql`DELETE FROM "TicketDetail" WHERE "idTiket" = ${idTiket}`;
      const parsedDetails = parseTicketDamageDetail(detail);
      if (parsedDetails.items.length > 0) {
        await sql`
          INSERT INTO "TicketDetail" ("idTiket", "komponen", "gejala", "tindakan", "qty")
          VALUES ${sql(parsedDetails.items.map(it => [idTiket, it.komponen, it.gejala, it.tindakan || 'Repair', it.qty || 1]))}
        `;
      }

      return NextResponse.json({
        success: true,
        message: `Tiket ${idTiket} berhasil dikoreksi`,
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Database POST Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server database" },
      { status: 500 }
    );
  }
}