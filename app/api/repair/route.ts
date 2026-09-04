import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseAndVerifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { sanitizeString } from '@/lib/sanitize';
import { prisma } from '@/lib/prisma';
import { parseTicketDamageDetail } from '@/lib/damageParser';
import { detectDaishaSize } from '@/lib/daishaSize';

const POWER_AUTOMATE_POST_URL = process.env.POWER_AUTOMATE_POST_URL || "";

// 1. FUNGSI GET: Membaca data langsung dari SQLite via Prisma (Kecepatan Instan < 5ms)
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
    const tickets = await prisma.ticket.findMany({
      include: {
        daisha: true,
        details: true,
      },
      orderBy: {
        waktuMasuk: 'desc',
      },
    });

    // Helper format tanggal ke format standar tampilan Indonesia: DD/MM/YYYY HH:mm
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatIndoDate = (d: Date | null) => {
      if (!d) return '-';
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // Format output 100% kompatibel dengan frontend tanpa merubah UI/komponen apa pun
    const formattedData = tickets.map((t) => {
      const kategoriList = Array.from(new Set(t.details.map((d) => d.komponen))).filter(Boolean);
      const detailStr = t.details.length > 0
        ? t.details.map((d, idx) => `${idx + 1}. [${d.komponen}] ${d.gejala} (Qty: ${d.qty}, Tindakan: ${d.tindakan})`).join(' | ')
        : '-';

      return {
        ID_Tiket: t.idTiket,
        Status: t.status,
        Nama_Pelapor: t.namaPelapor,
        Seksi: t.daisha?.seksi || '-',
        No_Daisha: t.noDaisha,
        Nama_Daisha: t.daisha?.namaDaisha || '-',
        Kategori_Kerusakan: kategoriList.join(', ') || 'Umum',
        Detail_Kerusakan: detailStr,
        Catatan: t.catatan || '-',
        Waktu_Masuk: formatIndoDate(t.waktuMasuk),
        Waktu_Keluar: formatIndoDate(t.waktuSelesai),
      };
    });

    return NextResponse.json(formattedData, {
      headers: {
        'X-Database': 'SQLite-Prisma',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    console.error("Prisma GET Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data tiket dari database lokal" },
      { status: 500 }
    );
  }
}

// 2. FUNGSI POST: Create, Update, Delete tiket langsung ke SQLite via Prisma
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
      await prisma.masterDaisha.upsert({
        where: { noDaisha },
        update: { namaDaisha, seksi, ukuran },
        create: { noDaisha, namaDaisha, seksi, ukuran },
      });

      // Parse waktu masuk
      let parsedDateMasuk = new Date();
      if (waktuMasuk) {
        const d = new Date(waktuMasuk);
        if (!isNaN(d.getTime())) parsedDateMasuk = d;
      }

      // Buat Tiket
      await prisma.ticket.create({
        data: {
          idTiket,
          noDaisha,
          namaPelapor,
          status: 'Open',
          waktuMasuk: parsedDateMasuk,
          catatan: '-',
        },
      });

      // Pecah rincian kerusakan ke TicketDetail (createMany lebih efisien dari loop sequential)
      const parsedDetails = parseTicketDamageDetail(detail);
      if (parsedDetails.items.length > 0) {
        await prisma.ticketDetail.createMany({
          data: parsedDetails.items.map((it) => ({
            idTiket,
            komponen: it.komponen,
            gejala: it.gejala,
            tindakan: it.tindakan || 'Repair',
            qty: it.qty || 1,
          })),
        });
      }

      // Pengurangan stok otomatis untuk komponen Ganti Baru (Projek 3)
      const gantiItems = parsedDetails.items.filter((it) => it.tindakan === 'Ganti');
      await Promise.allSettled(
        gantiItems.map((it) =>
          prisma.sparepart
            .update({
              where: { namaKomponen: it.komponen },
              data: { stokGudang: { decrement: it.qty || 1 } },
            })
            .catch((e) => {
              // Lanjutkan jika komponen belum terdaftar di tabel Sparepart
              console.warn(`[Sparepart] Komponen '${it.komponen}' tidak ditemukan, skip pengurangan stok:`, e);
            })
        )
      );

      // Background Sync Opsional ke Power Automate (tanpa membuat user menunggu)
      if (POWER_AUTOMATE_POST_URL) {
        fetch(POWER_AUTOMATE_POST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'CREATE',
            idTiket,
            waktuMasuk: waktuMasuk || new Date().toISOString().slice(0, 16).replace('T', ' '),
            waktuKeluar: '-',
            status: 'Open',
            namaPelapor,
            seksi,
            namaDaisha,
            noDaisha,
            kategori: sanitizeString(body.kategori, 500) || 'Umum',
            detail: detail || '-',
          }),
        }).catch((err) => console.error("Async Power Automate Sync Error:", err));
      }

      return NextResponse.json({
        success: true,
        message: `Tiket ${idTiket} berhasil dibuat di database lokal`,
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

      const parsedWaktuSelesai = normalizedStatus === 'Done'
        ? (waktuKeluar && waktuKeluar !== '-' && !isNaN(new Date(waktuKeluar).getTime()) ? new Date(waktuKeluar) : new Date())
        : null;

      await prisma.ticket.update({
        where: { idTiket },
        data: {
          status: normalizedStatus,
          waktuSelesai: parsedWaktuSelesai,
          catatan: catatan && catatan !== '-' ? catatan : undefined,
        },
      });

      // Background Sync ke Power Automate jika ada
      if (POWER_AUTOMATE_POST_URL) {
        fetch(POWER_AUTOMATE_POST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'UPDATE',
            idTiket,
            status: normalizedStatus,
            waktuKeluar: waktuKeluar || '-',
            catatan: catatan || '-',
          }),
        }).catch((err) => console.error("Async Power Automate Sync Error:", err));
      }

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

      await prisma.ticketDetail.deleteMany({ where: { idTiket } });
      await prisma.ticket.delete({ where: { idTiket } });

      if (POWER_AUTOMATE_POST_URL) {
        fetch(POWER_AUTOMATE_POST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'DELETE', idTiket }),
        }).catch((err) => console.error("Async Power Automate Sync Error:", err));
      }

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
      await prisma.masterDaisha.upsert({
        where: { noDaisha },
        update: { namaDaisha, seksi, ukuran },
        create: { noDaisha, namaDaisha, seksi, ukuran },
      });

      // Update Ticket
      await prisma.ticket.update({
        where: { idTiket },
        data: {
          noDaisha,
          namaPelapor: namaPelapor || session.user.name || 'Operator',
        },
      });

      // Update Rincian Kerusakan (createMany lebih efisien dari loop sequential)
      await prisma.ticketDetail.deleteMany({ where: { idTiket } });
      const parsedDetails = parseTicketDamageDetail(detail);
      if (parsedDetails.items.length > 0) {
        await prisma.ticketDetail.createMany({
          data: parsedDetails.items.map((it) => ({
            idTiket,
            komponen: it.komponen,
            gejala: it.gejala,
            tindakan: it.tindakan || 'Repair',
            qty: it.qty || 1,
          })),
        });
      }

      return NextResponse.json({
        success: true,
        message: `Tiket ${idTiket} berhasil dikoreksi`,
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Prisma POST Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server database" },
      { status: 500 }
    );
  }
}