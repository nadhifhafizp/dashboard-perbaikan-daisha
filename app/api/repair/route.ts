import { NextResponse } from 'next/server';

// Ambil URL rahasia dari environment variables (.env.local)
const POWER_AUTOMATE_GET_URL = process.env.POWER_AUTOMATE_GET_URL || "";
const POWER_AUTOMATE_POST_URL = process.env.POWER_AUTOMATE_POST_URL || "";

// 1. FUNGSI GET (Mengambil data dari Power Automate/Excel)
export async function GET() {
  try {
    const response = await fetch(POWER_AUTOMATE_GET_URL);
    if (!response.ok) throw new Error("Gagal mengambil data dari server");

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data server" }, { status: 500 });
  }
}

// 2. FUNGSI POST (Untuk Create, Update, dan Delete)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.action) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await fetch(POWER_AUTOMATE_POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error("Gagal memproses data ke server");
    }

    return NextResponse.json({ success: true, message: "Aksi berhasil diproses" });
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server internal" }, { status: 500 });
  }
}