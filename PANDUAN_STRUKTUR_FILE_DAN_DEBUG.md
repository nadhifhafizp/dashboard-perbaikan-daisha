# 🗺️ Panduan Arsitektur Path File, Role, dan Troubleshooting Workshop

Dokumen ini adalah peta navigasi lengkap seluruh kode program di proyek **Dashboard Perbaikan Daisha & Workshop Management**. Gunakan panduan ini untuk mempermudah identifikasi file saat mengembangkan fitur baru, melakukan penelusuran bug (debugging), ataupun perbaikan sistem (troubleshooting).

---

## 📑 DAFTAR ISI
1. [Pemisahan Arsitektur: Frontend vs Backend](#1-pemisahan-arsitektur-frontend-vs-backend)
2. [Pemetaan Berdasarkan Hak Akses Pengguna (Role RBAC)](#2-pemetaan-berdasarkan-hak-akses-pengguna-role-rbac)
3. [Pemetaan Berdasarkan 3 Fitur Sistem Workshop](#3-pemetaan-berdasarkan-3-fitur-sistem-workshop)
4. [Tabel Lengkap Direktori & Path File](#4-tabel-lengkap-direktori--path-file)
5. [Petunjuk Cepat Troubleshooting & Debugging Kasus Nyata](#5-petunjuk-cepat-troubleshooting--debugging-kasus-nyata)

---

## 1. PEMISAHAN ARSITEKTUR: FRONTEND VS BACKEND

### A. 🎨 FRONTEND (Client-Side, Tampilan UI, State & Hook)
Frontend berjalan di peramban pengguna (*browser*), bertanggung jawab atas tata letak halaman, formulir input, diagram interaktif, dan penanganan status responsif.

| Lokasi Path | Kegunaan | File Terkait |
| :--- | :--- | :--- |
| **`app/`** | Halaman rute Next.js (App Router) | `app/page.tsx` (Portal Utama)<br>`app/daisha/page.tsx` (Dashboard Daisha)<br>`app/input/page.tsx` (Input Daisha)<br>`app/riwayat/page.tsx` (Riwayat Daisha)<br>`app/request/page.tsx` (Follow Up Request)<br>`app/spareparts/page.tsx` (Stok Spareparts)<br>`app/admin/page.tsx` (Panel Admin & Tiket)<br>`app/login/page.tsx` (Halaman Login) |
| **`components/`** | Komponen UI yang modular & terisolasi | `components/dashboard/` (Grafik & KPI Daisha)<br>`components/input/` (Formulir input tiket)<br>`components/riwayat/` (Tabel riwayat & modal hapus)<br>`components/admin/` (User & Catalog Manager)<br>`components/layout/` (Sidebar, MobileNav, AppShell)<br>`components/common/` (Badge status, modal feedback, tag fisik) |
| **`hooks/`** | Custom React Hook pengelola state & fetch data | `hooks/useTickets.ts` (Fetch & polling tiket Daisha)<br>`hooks/useDashboardAnalytics.ts` (Kalkulasi pareto & KPI)<br>`hooks/useDaishaCatalog.ts` (Data dropdown master)<br>`hooks/useServerInfo.ts` (Deteksi IP server lokal) |
| **`context/`** | Global React Context | `context/AuthContext.tsx` (Status login, sesi aktif, RBAC) |

---

### B. ⚙️ BACKEND (Server-Side, API Endpoints, Database & Auth)
Backend dieksekusi di Node.js server, mengelola koneksi database SQLite via Prisma ORM, verifikasi sesi JWT cookie, enkripsi password, dan validasi data.

| Lokasi Path | Kegunaan | File Terkait |
| :--- | :--- | :--- |
| **`app/api/`** | API Route Handlers (REST Endpoints) | `app/api/repair/route.ts` (CRUD tiket Daisha)<br>`app/api/section-requests/route.ts` (CRUD pesanan seksi)<br>`app/api/spareparts/route.ts` (Katalog & mutasi stok)<br>`app/api/users/route.ts` (Kelola akun & reset password)<br>`app/api/auth/login/route.ts` (Autentikasi login)<br>`app/api/auth/me/route.ts` (Verifikasi sesi token)<br>`app/api/auth/logout/route.ts` (Hapus cookie sesi)<br>`app/api/catalog/route.ts` (Katalog master Daisha)<br>`app/api/server-info/route.ts` (Deteksi IP lokal) |
| **`prisma/`** | Database ORM & Penyimpanan SQLite | `prisma/schema.prisma` (Definisi skema tabel database)<br>`prisma/dev.db` (File database SQLite lokal) |
| **`lib/`** | Layanan logika backend & utilitas inti | `lib/prisma.ts` (Prisma client singleton)<br>`lib/users.ts` (Lookup user & auto-seeder akun default)<br>`lib/passwords.ts` (Hashing PBKDF2 SHA-512 & verifikasi)<br>`lib/auth.ts` (Sign & verify JWT session token)<br>`lib/masterData.ts` (Daftar master awal jenis Daisha)<br>`lib/serverInfo.ts` (Pencarian IP lokal Wi-Fi/LAN) |

---

## 2. PEMETAAN BERDASARKAN HAK AKSES PENGGUNA (ROLE RBAC)

Sistem menggunakan 3 role pengguna yang memiliki ruang lingkup hak akses berbeda:

```
                  ┌──────────────────────────────────────────────┐
                  │                 PENGGUNA                     │
                  └──────┬────────────────┬───────────────┬──────┘
                         │                │               │
                         ▼                ▼               ▼
                   [ ADMIN ]        [ OPERATOR ]    [ USER_SEKSI ]
                  (Staff Bengkel /  (Teknisi Input) (Perwakilan Seksi)
                  Special Project)        │               │
                         │                ▼               ▼
                         │          - /input        - /request
                         │          - /riwayat
                         ▼
        ┌─────────────────────────────────────────────┐
        │  AKSES PENUH KE SELURUH SISTEM & ADMIN:     │
        │  • / (Portal Utama 3 Card)                  │
        │  • /daisha (Analitik & Rekap Daisha)        │
        │  • /request (Review & Eksekusi Pesanan)     │
        │  • /spareparts (Monitoring Stok & Mutasi)   │
        │  • /admin (User Manager & Reset Password)   │
        │  • /input & /riwayat (Akses operasional)    │
        └─────────────────────────────────────────────┘
```

### 1. 🛡️ ADMIN (Staff Special Project & Bengkel Produksi)
- **Karakter:** Pengguna tingkat tertinggi dengan wewenang mengelola 3 modul kerja dan manajemen akun.
- **Frontend Utama:**
  - `app/page.tsx` ➔ Portal Beranda dengan 3 Kartu Modul Kerja.
  - `app/admin/page.tsx` ➔ Panel Antrean & Rekapitulasi Tiket Daisha.
  - `components/admin/UserManager.tsx` ➔ Form tambah user, edit data, dan **reset kata sandi** jika user operator/seksi lupa password.
  - `components/admin/CatalogManager.tsx` ➔ Penambahan master jenis daisha, komponen, dan gejala.
- **Backend Terkait:**
  - `app/api/users/route.ts` ➔ Khusus role `ADMIN` (tolak jika bukan admin).
  - `app/api/spareparts/route.ts` ➔ Tambah item baru, restock, hapus stok (role `ADMIN`).

### 2. 🔧 OPERATOR (Staff Bengkel Lapangan / Teknisi Daisha)
- **Karakter:** Fokus hanya pada operasional pencatatan kerusakan troli/daisha.
- **Frontend Utama:**
  - `app/input/page.tsx` ➔ Formulir input Daisha rusak di plant/workshop.
  - `components/input/TicketForm.tsx` ➔ Logika form input & validasi.
  - `app/riwayat/page.tsx` ➔ Melihat antrean & tiket Daisha, serta menghapus/koreksi entri yang salah input.
- **Backend Terkait:**
  - `app/api/repair/route.ts` ➔ Method POST untuk simpan perbaikan baru, DELETE untuk koreksi salah input.

### 3. 🏢 USER_SEKSI (Perwakilan Setiap Seksi Pabrik)
- **Karakter:** Fokus pada permohonan pesanan pembuatan alat/barang dan pemantauan progress dari seksinya.
- **Frontend Utama:**
  - `app/request/page.tsx` ➔ Formulir pembuatan pesanan baru + tabel riwayat tiket pesanan milik seksinya.
- **Backend Terkait:**
  - `app/api/section-requests/route.ts` ➔ Otomatis hanya mengembalikan tiket yang dibuat oleh akun seksi tersebut.

---

## 3. PEMETAAN BERDASARKAN 3 FITUR SISTEM WORKSHOP

### 🛞 FITUR 1: SISTEM PERBAIKAN DAISHA
Sistem pencatatan unit troli daisha rusak, analisis pareto komponen, lead time servis, dan rekapitulasi data perbaikan.
- **Frontend:**
  - `app/daisha/page.tsx` ➔ Halaman dashboard analitik Daisha.
  - `app/input/page.tsx` ➔ Form input perbaikan Daisha.
  - `app/riwayat/page.tsx` ➔ Tabel riwayat perbaikan Daisha & status antrean.
  - `components/dashboard/` ➔ Seluruh grafik (`DaishaCharts.tsx`, `DamageCharts.tsx`, `ThroughputCharts.tsx`, `SectionCharts.tsx`, `KpiCards.tsx`, `FilterPanel.tsx`, `TicketTable.tsx`).
  - `components/input/` ➔ Pilihan Daisha (`DaishaSelector.tsx`) dan pilihan kerusakan (`DamageSelector.tsx`).
  - `hooks/useTickets.ts` & `hooks/useDashboardAnalytics.ts` ➔ Kalkulasi analitik pareto dan lead time.
- **Backend:**
  - `app/api/repair/route.ts` ➔ Operasi CREATE, UPDATE status, DELETE tiket daisha.
  - `app/api/catalog/route.ts` ➔ Master data jenis daisha, komponen, dan gejala.
  - Prisma Models: `RepairTicket`, `DaishaType`, `Component`, `Symptom`.

---

### 📨 FITUR 2: SISTEM FOLLOW UP REQUEST ANTAR SEKSI
Sistem alur kerja pengajuan pembuatan/modifikasi barang dari seksi pemohon hingga pengerjaan selesai oleh bengkel produksi.
- **Frontend:**
  - `app/request/page.tsx` ➔ Satu halaman multifungsi: Form pengajuan (untuk Seksi) + Modal review pengerjaan, penugasan PIC bengkel, estimasi selesai, dan pencatatan material (untuk Admin).
- **Backend:**
  - `app/api/section-requests/route.ts` ➔ Penanganan tiket request:
    - `action: "CREATE"` ➔ Seksi mengirim pesanan baru.
    - `action: "UPDATE_STATUS"` ➔ Admin bengkel menyetujui, menolak, menetapkan teknisi PJ, atau menyelesaikan pekerjaan.
    - `action: "ADD_MATERIAL"` ➔ Mencatat suku cadang / material yang digunakan untuk pembuatan barang tersebut.
    - `action: "DELETE"` ➔ Hapus request.
  - Prisma Models: `SectionRequest`, `SectionRequestMaterial`.

---

### 📦 FITUR 3: SISTEM MANAJEMEN & MONITORING SPAREPARTS
Sistem inventaris suku cadang bengkel dengan peringatan stok kritis (*safety stock*) dan audit log mutasi keluar-masuk.
- **Frontend:**
  - `app/spareparts/page.tsx` ➔ Tabel katalog suku cadang, indikator stok kritis (< minStok), modal restock stok masuk, modal pemakaian barang keluar, dan modal audit log mutasi.
- **Backend:**
  - `app/api/spareparts/route.ts` ➔ Endpoint persediaan suku cadang:
    - `action: "CREATE"` ➔ Tambah jenis sparepart baru ke katalog.
    - `action: "RESTOCK"` ➔ Tambah kuantitas stok masuk (menambah stok fisik + mencatat `SparepartLog` tipe MASUK).
    - `action: "USE"` ➔ Kurangi kuantitas untuk pemakaian (mengurangi stok fisik + mencatat `SparepartLog` tipe KELUAR).
    - `action: "DELETE"` ➔ Hapus item sparepart.
  - Prisma Models: `Sparepart`, `SparepartLog`.

---

## 4. TABEL LENGKAP DIREKTORI & PATH FILE

| Direktori / File | Jenis | Scope Fitur | Hak Akses | Deskripsi Singkat |
| :--- | :--- | :--- | :--- | :--- |
| `app/page.tsx` | Frontend | Portal Utama | Admin | Beranda dengan 3 kartu sistem & live feed aktivitas |
| `app/daisha/page.tsx` | Frontend | Daisha | Admin | Panel Analitik Daisha, pareto, grafik throughput |
| `app/input/page.tsx` | Frontend | Daisha | Operator, Admin | Halaman form input unit troli daisha rusak |
| `app/riwayat/page.tsx` | Frontend | Daisha | Operator, Admin | Halaman status antrean & hapus salah input |
| `app/request/page.tsx` | Frontend | Request | Seksi, Admin | Halaman pengajuan & tracking pesanan seksi |
| `app/spareparts/page.tsx` | Frontend | Spareparts | Admin | Halaman stok gudang bengkel, restock & mutasi |
| `app/admin/page.tsx` | Frontend | Administrasi | Admin | Panel tindakan bengkel, tiket Daisha, katalog |
| `app/login/page.tsx` | Frontend | Auth | Publik | Halaman login dengan username & password |
| `components/admin/UserManager.tsx` | Frontend | Administrasi | Admin | Kelola pengguna, buat akun seksi, **reset password** |
| `components/admin/CatalogManager.tsx` | Frontend | Daisha Master | Admin | Kelola daftar master jenis Daisha, komponen, gejala |
| `components/layout/Sidebar.tsx` | Frontend | Navigasi | Semua Role | Sidebar desktop dengan pengelompokan menu rapi |
| `components/layout/MobileNav.tsx` | Frontend | Navigasi | Semua Role | Bar navigasi bawah untuk layar smartphone |
| `app/api/repair/route.ts` | Backend | Daisha | Operator, Admin | Handler REST perbaikan Daisha (simpan, update, hapus) |
| `app/api/section-requests/route.ts` | Backend | Request | Seksi, Admin | Handler REST request seksi, status, alokasi material |
| `app/api/spareparts/route.ts` | Backend | Spareparts | Admin | Handler REST stok spareparts & log mutasi |
| `app/api/users/route.ts` | Backend | Administrasi | Admin | Handler REST CRUD user & update password |
| `app/api/auth/login/route.ts` | Backend | Auth | Publik | Handler verifikasi login & pembuatan cookie token |
| `lib/users.ts` | Backend | Auth | Server-side | Pencarian user di DB, auto-seed admin/operator/seksi |
| `lib/passwords.ts` | Backend | Keamanan | Server-side | Enkripsi PBKDF2 SHA-512 & verifikasi aman password |
| `lib/auth.ts` | Backend | Keamanan | Server-side | Enkode & verifikasi JWT payload sesi login |
| `prisma/schema.prisma` | Backend | Database | Server-side | Definisi model tabel SQLite untuk seluruh sistem |

---

## 5. PETUNJUK CEPAT TROUBLESHOOTING & DEBUGGING KASUS NYATA

### 🚨 Kasus 1: "User lupa password atau tidak bisa login"
1. **Langkah Cepat:**
   - Buka `/admin` sebagai Admin ➔ Pilih tab **Manajemen Pengguna**.
   - Cari username yang bermasalah ➔ Klik tombol **Ganti Password**.
   - Masukkan kata sandi baru dan simpan.
2. **File Kode Terkait untuk Debug:**
   - Frontend: `components/admin/UserManager.tsx`
   - Backend Endpoint: `app/api/users/route.ts` (cek blok `action === 'RESET_PASSWORD'`)
   - Algoritma Hashing: `lib/passwords.ts` (`hashPassword` & `verifyPassword`)

---

### 🚨 Kasus 2: "Seksi mengajukan request tapi datanya tidak muncul"
1. **Langkah Cepat:**
   - Pastikan akun seksi login dengan benar (bukan akun anonim).
   - Periksa apakah respon network di browser `F12` (Tab Network) pada `/api/section-requests` mengembalikan status 200 atau 401/403.
2. **File Kode Terkait untuk Debug:**
   - Frontend: `app/request/page.tsx` (cek fungsi `handleSubmit` dan `fetchRequests`)
   - Backend Endpoint: `app/api/section-requests/route.ts` (cek query `prisma.sectionRequest.create`)
   - Database Model: `prisma/schema.prisma` (model `SectionRequest`)

---

### 🚨 Kasus 3: "Stok spareparts tidak berkurang saat dipakai"
1. **Langkah Cepat:**
   - Cek apakah stok fisik mencukupi (tidak boleh minus).
   - Cek tab Network di `F12` saat klik Simpan Mutasi pada URL `/api/spareparts`.
2. **File Kode Terkait untuk Debug:**
   - Frontend: `app/spareparts/page.tsx` (cek fungsi `handleMutasiSubmit`)
   - Backend Endpoint: `app/api/spareparts/route.ts` (cek blok `action === 'USE'` atau `action === 'RESTOCK'`)
   - Pastikan transaksi prisma memperbarui field `stokGudang` sekaligus menambahkan baris di tabel `SparepartLog`.

---

### 🚨 Kasus 4: "Grafik di Dashboard Daisha tidak sinkron atau angka 0"
1. **Langkah Cepat:**
   - Klik tombol **Segarkan Data** di kanan atas.
   - Periksa apakah ada tiket yang memiliki tanggal tidak valid atau komponen kosong.
2. **File Kode Terkait untuk Debug:**
   - Frontend Page: `app/daisha/page.tsx`
   - Engine Hitung Analitik: `hooks/useDashboardAnalytics.ts`
   - Parser Kerusakan: `lib/damageParser.ts`
   - Data Fetcher: `hooks/useTickets.ts` ➔ memanggil `/api/repair`

---

### 🚨 Kasus 5: "Ingin mengubah skema database (menambah kolom baru)"
1. Edit file `prisma/schema.prisma`.
2. Buka terminal di folder proyek dan jalankan:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
3. Restart server pengembangan Next.js (`npm run dev`).
