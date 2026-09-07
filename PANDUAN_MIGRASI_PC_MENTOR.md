# PANDUAN LENGKAP MIGRASI KE PC MENTOR (SERVER PUSAT DAISHA)
**PT Bridgestone Tire Indonesia — Daisha Maintenance Management System**

Panduan ini dibuat agar aplikasi Daisha dapat dipindahkan ke PC Mentor dan langsung berjalan (**plug and play / sekali klik**) di jaringan lokal workshop secara aman dan efisien.

---

## 1. Keunggulan Sistem Internal (Lokal & Aman)

1. **Database Mandiri (SQLite Internal):**
   * Tidak memerlukan instalasi database server eksternal seperti MySQL, PostgreSQL, atau XAMPP di PC Mentor.
   * Seluruh data **tiket perbaikan**, akun login (`admin` & `operator`), password terenkripsi, riwayat, dan katalog master tersimpan aman di file `prisma/dev.db`.
2. **Sekali Klik Langsung Jalan (`START-SERVER.bat`):**
   * Mentor tidak perlu mengetik perintah terminal yang rumit.
   * Cukup **klik 2x file `START-SERVER.bat`**, sistem akan otomatis mendeteksi IP PC mentor dan menyalakan server lokal.
3. **100% Aman dari Luar (Hanya Jaringan Internal Bridgestone):**
   * Tidak ada koneksi tunnel atau cloud pihak ketiga yang berisiko.
   * Hanya perangkat yang terhubung ke Wi-Fi / kabel LAN yang sama di area pabrik/workshop yang dapat membuka dashboard.

---

## 2. Persiapan di PC Mentor (Hanya Butuh 1 Hal)

Di PC Mentor, satu-satunya aplikasi yang perlu diinstall adalah:
* **Node.js (Versi LTS):**
  * Download dari website resmi: [https://nodejs.org/](https://nodejs.org/)
  * Install dengan mengikuti petunjuk layar (klik *Next -> Next -> Finish*).

---

## 3. Langkah-Langkah Memindahkan Folder ke PC Mentor

1. **Salin Folder Proyek:**
   * Salin (Copy) seluruh folder `dashboard-perbaikan-daisha` dari flashdisk / penyimpanan ke PC Mentor (misal di `D:\DAISHA\dashboard-perbaikan-daisha` atau di Desktop).
2. **Pastikan File-File Utama Ini Ikut Tersalin:**
   * File database: `prisma/dev.db` (berisi data tiket dan master katalog).
   * File konfigurasi: `.env.local` dan `.env`.
   * File peluncur otomatis: `START-SERVER.bat`.

---

## 4. Cara Menjalankan Server di PC Mentor (Sangat Mudah!)

1. Buka folder `dashboard-perbaikan-daisha` di PC Mentor.
2. **Klik 2x file `START-SERVER.bat`**.
3. Jendela konsol hijau Bridgestone akan terbuka dan otomatis menyiapkan sistem:

```text
=====================================================================
          PT BRIDGESTONE TIRE INDONESIA - DAISHA SYSTEM
                    SERVER INTERNAL WORKSHOP
=====================================================================

IP Server  : 10.92.179.102 (contoh IP PC Mentor otomatis)
Port       : 3000

Akses dari perangkat lain di jaringan Wi-Fi / LAN yang SAMA:

   [PC Server Ini] : http://localhost:3000
   [HP / Tab Lain] : http://10.92.179.102:3000

Akun Login:
   - Admin    : admin / admin123 (atau Technosport)
   - Operator : operator / operator123 (atau Technosport)

Tekan Ctrl+C untuk menghentikan server.
=====================================================================
```

---

## 5. Cara Mengakses Web dari HP / Tablet / Laptop Teknisi

1. Pastikan perangkat (HP/Tablet/Laptop) terhubung ke jaringan **Wi-Fi / LAN yang sama** dengan PC Mentor.
2. Buka browser (Google Chrome, Edge, atau Safari).
3. Ketik alamat IP PC Mentor diikuti port 3000, contoh:
   ```text
   http://10.92.179.102:3000
   ```
4. Halaman login Daisha akan langsung terbuka tanpa hambatan.

---

## 6. Akun Login Sistem

| Peran (Role) | Username | Password Default | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin Maintenance** | `admin` | `admin123` / `Technosport` | Rekapitulasi penuh, grafik statistik, ekspor Excel, filter, kelola katalog daisha, manajemen pengguna. |
| **Teknisi Lapangan** | `operator` | `operator123` / `Technosport` | Form pelaporan kerusakan daisha, input komponen, dan submit tiket. |

*(Akun dan password dapat diubah atau ditambah baru melalui dashboard Admin pada menu Manajemen Akun).*

---

## 7. Cara Backup Data Tiket Berkala

Untuk mencadangkan seluruh data perbaikan Daisha:
1. Salin (copy) file **`prisma/dev.db`**.
2. Simpan salinan file tersebut ke flashdisk atau folder backup (contoh: `backup-daisha-2026-09-04.db`).
3. Jika PC Mentor diganti atau install ulang, cukup pasang file `dev.db` tersebut kembali dan semua data tiket langsung pulih 100%.
