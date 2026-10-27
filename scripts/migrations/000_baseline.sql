-- ============================================================================
-- scripts/migrations/000_baseline.sql
-- Baseline Schema DDL untuk Dashboard Perbaikan Daisha Bridgestone
-- Kompatibel dengan PostgreSQL 15+ / Supabase
-- ============================================================================

-- Ekstensi UUID dan Kriptografi
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABEL: User (Autentikasi & RBAC)
CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(100) UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL CHECK ("role" IN ('ADMIN', 'OPERATOR', 'USER_SEKSI')),
    "seksi" VARCHAR(100),
    "description" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- 2. TABEL: Daisha (Master Armada Daisha)
CREATE TABLE IF NOT EXISTS "Daisha" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nomor_daisha" TEXT UNIQUE NOT NULL,
    "nama_daisha" TEXT,
    "jenis" TEXT NOT NULL,
    "ukuran" TEXT NOT NULL,
    "seksi" TEXT,
    "last_condition" TEXT DEFAULT 'OK',
    "last_maintenance_date" TIMESTAMPTZ,
    "last_repair_date" TIMESTAMPTZ,
    "last_waktu_masuk" TIMESTAMPTZ,
    "last_waktu_keluar" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now()
);

-- 3. TABEL: MaintenanceLog (Log PM Bengkel & Riwayat Servis)
CREATE TABLE IF NOT EXISTS "MaintenanceLog" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "daisha_id" UUID NOT NULL REFERENCES "Daisha"("id") ON DELETE CASCADE,
    "nomor_daisha" TEXT NOT NULL,
    "jenis_pekerjaan" TEXT NOT NULL,
    "kondisi" TEXT DEFAULT 'OK',
    "detail_kerusakan" TEXT,
    "tindakan" TEXT,
    "tanggal_pengerjaan" TIMESTAMPTZ NOT NULL,
    "waktu_masuk" TIMESTAMPTZ,
    "waktu_keluar" TIMESTAMPTZ,
    "admin_id" TEXT,
    "catatan" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 4. TABEL: Ticket (Tiket Perbaikan Daisha)
CREATE TABLE IF NOT EXISTS "Ticket" (
    "idTiket" TEXT PRIMARY KEY,
    "noDaisha" TEXT NOT NULL,
    "namaPelapor" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Queue',
    "waktuMasuk" TIMESTAMPTZ DEFAULT now(),
    "waktuSelesai" TIMESTAMPTZ,
    "catatan" TEXT,
    "items" JSONB DEFAULT '[]'::jsonb
);

-- 5. TABEL: TicketDetail (Rincian Komponen Tiket)
CREATE TABLE IF NOT EXISTS "TicketDetail" (
    "idDetail" SERIAL PRIMARY KEY,
    "idTiket" TEXT REFERENCES "Ticket"("idTiket") ON DELETE CASCADE,
    "komponen" TEXT,
    "gejala" TEXT,
    "qty" INT DEFAULT 1,
    "tindakan" TEXT
);

-- 6. TABEL: SectionRequest (Formulir Resmi Pengajuan Seksi Bridgestone)
CREATE TABLE IF NOT EXISTS "SectionRequest" (
    "id" SERIAL PRIMARY KEY,
    "nomorRequest" VARCHAR(100) UNIQUE NOT NULL,
    "seksiPemohon" VARCHAR(100) NOT NULL,
    "picPemohon" VARCHAR(100) NOT NULL,
    "kontakPemohon" VARCHAR(100),
    "namaBarang" VARCHAR(255) NOT NULL,
    "spesifikasi" TEXT,
    "jumlah" INT NOT NULL DEFAULT 1,
    "satuan" VARCHAR(50) NOT NULL DEFAULT 'Pcs',
    "urgensi" VARCHAR(50) NOT NULL DEFAULT 'Normal',
    "catatan" TEXT,
    "status" VARCHAR(100) NOT NULL DEFAULT 'Menunggu Assign Atasan Seksi',
    "flowStep" VARCHAR(100) NOT NULL DEFAULT 'STEP_2_WAITING_ATASAN_SEKSI',
    "approvalToken" VARCHAR(100),
    "statusApprovalAtasanSeksi" VARCHAR(50) DEFAULT 'PENDING',
    "emailAtasanSeksi" VARCHAR(255),
    "namaAtasanSeksi" VARCHAR(255),
    "emailMentorWorkshop" VARCHAR(255),
    "dibuatOleh" VARCHAR(100),
    "waktuDibuat" TIMESTAMPTZ DEFAULT now(),
    "waktuUpdate" TIMESTAMPTZ DEFAULT now(),

    -- Kolom Formulir Resmi Bridgestone
    "perihal" VARCHAR(255),
    "namaMachine" VARCHAR(255),
    "tujuan" VARCHAR(100),
    "alasan" TEXT,
    "kodeSeksi" VARCHAR(50),
    "drafter" VARCHAR(100),
    "foreman" VARCHAR(100),
    "keadaanSekarang" TEXT,
    "fotoSebelum" TEXT,
    "rencanaTindakan" TEXT,
    "fotoSesudah" TEXT,
    "targetHasil" TEXT,
    "penjelasanPelaksanaan" TEXT,
    "biayaEstimate" VARCHAR(100),
    "biayaActual" VARCHAR(100),
    "orangJamEstimate" VARCHAR(100),
    "orangJamActual" VARCHAR(100),
    "waktuEstimate" VARCHAR(100),
    "waktuActual" VARCHAR(100),
    "tglPelaksanaanEstimate" VARCHAR(100),
    "tglPelaksanaanActual" VARCHAR(100),
    "komentarEstimate" TEXT,
    "komentarActual" TEXT,
    "keputusan" VARCHAR(50),
    "keputusan8210" VARCHAR(100),
    "keputusan820" VARCHAR(100),
    "hasilCheck" TEXT,
    "hasilCheckPemohon" VARCHAR(100),
    "schedulePlanning" TEXT,
    "scheduleActual" TEXT,
    "alasanPending" TEXT,
    "materials" JSONB DEFAULT '[]'::jsonb
);

-- 7. TABEL: SectionRequestMaterial (Material & Suku Cadang Terkait Request Seksi)
CREATE TABLE IF NOT EXISTS "SectionRequestMaterial" (
    "id" SERIAL PRIMARY KEY,
    "requestId" INT REFERENCES "SectionRequest"("id") ON DELETE CASCADE,
    "namaKomponen" VARCHAR(255) NOT NULL,
    "spesifikasi" TEXT,
    "jumlah" INT NOT NULL DEFAULT 1,
    "satuan" VARCHAR(50) NOT NULL DEFAULT 'Pcs',
    "keterangan" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 8. TABEL: SectionRequestNotification (Notifikasi In-App Sistem)
CREATE TABLE IF NOT EXISTS "SectionRequestNotification" (
    "id" SERIAL PRIMARY KEY,
    "requestId" INT,
    "nomorRequest" VARCHAR(100),
    "targetRole" VARCHAR(50),
    "targetEmail" VARCHAR(255),
    "targetUser" VARCHAR(100),
    "tipe" VARCHAR(100),
    "judul" VARCHAR(255) NOT NULL,
    "pesan" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN DEFAULT FALSE,
    "waktu" TIMESTAMPTZ DEFAULT now()
);

-- 9. TABEL: Sparepart (Inventaris Gudang Bengkel)
CREATE TABLE IF NOT EXISTS "Sparepart" (
    "id" SERIAL PRIMARY KEY,
    "namaKomponen" VARCHAR(255) UNIQUE NOT NULL,
    "kategori" VARCHAR(100) NOT NULL DEFAULT 'Umum',
    "stokGudang" INT NOT NULL DEFAULT 0,
    "satuan" VARCHAR(50) NOT NULL DEFAULT 'Pcs',
    "minStok" INT NOT NULL DEFAULT 0,
    "lokasi" VARCHAR(100),
    "logs" JSONB DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now()
);

-- 10. TABEL: SparepartLog (Histori Keluar Masuk Sparepart)
CREATE TABLE IF NOT EXISTS "SparepartLog" (
    "id" SERIAL PRIMARY KEY,
    "namaKomponen" VARCHAR(255) NOT NULL,
    "aksi" VARCHAR(50) NOT NULL,
    "jumlah" INT NOT NULL,
    "user" VARCHAR(100),
    "catatan" TEXT,
    "tanggal" TIMESTAMPTZ DEFAULT now()
);

-- 11. TABEL: Master Katalog & Seksi
CREATE TABLE IF NOT EXISTS "DaishaType" (
    "id" SERIAL PRIMARY KEY,
    "kode" VARCHAR(50) UNIQUE NOT NULL,
    "nama" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "DaishaVariant" (
    "id" SERIAL PRIMARY KEY,
    "idType" INT REFERENCES "DaishaType"("id") ON DELETE CASCADE,
    "kode" VARCHAR(50) UNIQUE NOT NULL,
    "nama" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "DaishaComponent" (
    "id" SERIAL PRIMARY KEY,
    "kode" VARCHAR(50) UNIQUE NOT NULL,
    "nama" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "DaishaSymptom" (
    "id" SERIAL PRIMARY KEY,
    "idComponent" INT REFERENCES "DaishaComponent"("id") ON DELETE CASCADE,
    "kode" VARCHAR(50) UNIQUE NOT NULL,
    "nama" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Section" (
    "id" SERIAL PRIMARY KEY,
    "kode" VARCHAR(50) UNIQUE NOT NULL,
    "nama" VARCHAR(100) NOT NULL
);

-- ============================================================================
-- INDEKS PERFORMA KUERI
-- ============================================================================
CREATE INDEX IF NOT EXISTS "idx_user_username" ON "User"("username");
CREATE INDEX IF NOT EXISTS "idx_daisha_nomor" ON "Daisha"("nomor_daisha");
CREATE INDEX IF NOT EXISTS "idx_daisha_jenis_ukuran" ON "Daisha"("jenis", "ukuran");
CREATE INDEX IF NOT EXISTS "idx_maintenance_log_daisha" ON "MaintenanceLog"("daisha_id");
CREATE INDEX IF NOT EXISTS "idx_maintenance_log_tanggal" ON "MaintenanceLog"("tanggal_pengerjaan");
CREATE INDEX IF NOT EXISTS "idx_ticket_no_daisha" ON "Ticket"("noDaisha");
CREATE INDEX IF NOT EXISTS "idx_ticket_waktu_masuk" ON "Ticket"("waktuMasuk");
CREATE INDEX IF NOT EXISTS "idx_ticket_status" ON "Ticket"("status");
CREATE INDEX IF NOT EXISTS "idx_section_request_nomor" ON "SectionRequest"("nomorRequest");
CREATE INDEX IF NOT EXISTS "idx_section_request_status" ON "SectionRequest"("status");
CREATE INDEX IF NOT EXISTS "idx_section_request_pemohon" ON "SectionRequest"("seksiPemohon");
CREATE INDEX IF NOT EXISTS "idx_sr_notification_user_unread" ON "SectionRequestNotification"("targetUser", "isRead");
CREATE INDEX IF NOT EXISTS "idx_sparepart_kategori" ON "Sparepart"("kategori");
