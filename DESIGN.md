---
name: Bridgestone Workshop Maintenance System
description: Dashboard operasional bengkel Daisha. Bersih, ringkas, mudah dipakai di lantai pabrik.
version: 2.0
colors:
  primary: "#E60012"
  primary-hover: "#CC0010"
  primary-active: "#B3000E"
  primary-subtle: "#FFF1F2"
  primary-foreground: "#FFFFFF"
  background: "#F8FAFC"
  card: "#FFFFFF"
  border: "#E2E8F0"
  border-strong: "#CBD5E1"
  text: "#0F172A"
  text-muted: "#475569"
  text-subtle: "#64748B"
  success: "#059669"
  warning: "#D97706"
  info: "#2563EB"
  danger: "#DC2626"
  chart-main: "#2563EB"
  chart-muted: "#94A3B8"
typography:
  page-title:  { fontSize: "24px", fontWeight: 700, lineHeight: "1.25", letterSpacing: "-0.02em" }
  section:     { fontSize: "18px", fontWeight: 600, lineHeight: "1.3",  letterSpacing: "-0.015em" }
  card-title:  { fontSize: "14px", fontWeight: 600, lineHeight: "1.4" }
  body:        { fontSize: "14px", fontWeight: 400, lineHeight: "1.5" }
  caption:     { fontSize: "12px", fontWeight: 500, lineHeight: "1.4" }
  kpi:         { fontSize: "32px", fontWeight: 700, lineHeight: "1.1",  fontVariantNumeric: "tabular-nums" }
spacing: { xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px }
rounded: { sm: 6px, md: 8px, lg: 12px, xl: 16px, full: 9999px }
---

# Design System: Workshop Daisha

## 1. Prinsip

1. **Ringkas.** Satu halaman, satu tujuan. Kalau teks bisa dihapus tanpa mengubah arti, hapus.
2. **Data lebih dulu.** Angka dan status adalah tokoh utama. Dekorasi tidak boleh bersaing dengannya.
3. **Satu aksi utama per area.** Hanya satu tombol merah per kartu atau section.
4. **Warna punya arti.** Warna dipakai untuk status, bukan hiasan.
5. **Terbaca di lantai pabrik.** Teks besar, kontras tinggi, target sentuh besar.

---

## 2. Warna

### Aturan inti
- **Merah Bridgestone = brand dan aksi utama** (tombol primer, menu aktif, fokus).
- **Merah danger = status buruk** (rusak, terlambat). Pakai `--danger` (`#DC2626`), bukan `--primary`, agar tombol "Simpan" tidak terlihat seperti error.
- **Hijau / Amber / Biru / Merah = status saja.** Jangan dipakai untuk membedakan kategori data biasa.
- Maksimal **3 warna aksen** dalam satu layar (selain netral).
- Tidak ada gradient, glassmorphism, atau shadow berwarna.

### Netral
| Token | Hex | Pakai untuk |
|---|---|---|
| `--background` | `#F8FAFC` | Latar halaman |
| `--card` | `#FFFFFF` | Kartu, tabel, modal |
| `--border` | `#E2E8F0` | Garis kartu dan pemisah |
| `--text` | `#0F172A` | Judul dan angka |
| `--text-muted` | `#475569` | Isi dan label |
| `--text-subtle` | `#64748B` | Caption, sumbu chart |

Teks hitam murni `#000` diganti `#0F172A` agar tidak terlalu keras di layar.

### Status
| Status | Teks | Latar | Contoh |
|---|---|---|---|
| Sukses | `#065F46` | `#ECFDF5` | Selesai, Sudah PM |
| Peringatan | `#92400E` | `#FFFBEB` | Dikerjakan, Mendekati batas |
| Info | `#1E40AF` | `#EFF6FF` | Menunggu, Staging |
| Bahaya | `#991B1B` | `#FEF2F2` | Rusak, Terlambat, Belum PM |

Status selalu ditampilkan dengan **teks + warna**, bukan warna saja.

---

## 3. Tipografi

Font: **Plus Jakarta Sans**. Angka memakai `tabular-nums`.

| Peran | Ukuran | Weight | Dipakai di |
|---|---|---|---|
| `page-title` | 24px | 700 | Judul halaman (1 per halaman) |
| `section` | 18px | 600 | Judul section |
| `card-title` | 14px | 600 | Judul kartu dan chart |
| `body` | 14px | 400 | Isi, tabel, form |
| `caption` | 12px | 500 | Subjudul, sumbu chart, label kecil |
| `kpi` | 32px | 700 | Angka utama KPI |

### Aturan
- **Ukuran minimum 12px.** Dilarang `text-[9px]`, `text-[10px]`, dan `text-[11px]`.
- Gunakan kelas utilitas, bukan ukuran manual: `.t-title`, `.t-section`, `.t-card`, `.t-body`, `.t-caption`, `.t-kpi`.
- Judul chart wajib **lebih besar atau sama** dengan isinya, tidak boleh lebih kecil.
- `uppercase` hanya untuk header kolom tabel. Tidak untuk judul atau badge.
- Maksimal 2 weight berbeda dalam satu kartu.
- Panjang baris teks maksimal 65 karakter.

---

## 4. Copywriting

Teks UI harus **pendek, aktif, dan langsung**.

| Elemen | Aturan | Contoh |
|---|---|---|
| Judul halaman | Maks. 3 kata | `Antrean Perbaikan` |
| Subjudul | Maks. 8 kata, satu baris | `Status pengerjaan di bengkel` |
| Judul chart | Maks. 4 kata | `Masuk vs Selesai` |
| Tombol | Kata kerja, 1 sampai 2 kata | `Simpan`, `Lapor Rusak`, `Lihat Antrean` |
| Label form | Kata benda, 1 sampai 3 kata | `Nomor Daisha` |
| Pesan kosong | Judul 3 sampai 5 kata + 1 aksi | `Belum ada tiket` |
| Pesan error | Apa yang salah + cara memperbaiki | `Nomor tidak ditemukan. Cek lagi.` |

### Dihapus dari semua teks
- Kata: `Dashboard`, `Halaman`, `Visualisasi`, `Manajemen`, `Pelacakan`, `Anda`, `yang`, `dapat`, `untuk`, `telah`.
- Pemisah `•` dan `-` di judul.
- Title Case Bertingkat Semua Kata. Pakai **sentence case**.
- Kalimat pembuka seperti "Selamat datang…" atau "Pilih modul di bawah:".

### Contoh sebelum dan sesudah
| Sebelum | Sesudah |
|---|---|
| Portal Layanan Daisha - Seksi X | Seksi X |
| Buka Form Lapor Rusak | Lapor Rusak |
| Tidak ditemukan unit yang sesuai dengan kombinasi filter… | Unit tidak ditemukan |
| Perhatian: 5 Item Membutuhkan Restock | 5 item perlu restock |
| Diagram Donut Kepatuhan PM Seluruh Seksi Pabrik | Kepatuhan PM per seksi |

### Istilah baku (satu istilah, satu arti)
`Kasus` (bukan "kejadian" atau "frekuensi"), `Pcs`, `Unit`, `Seksi`, `Tiket`, `PM`, `Staging`, `Lead time`.

---

## 5. Layout dan Spacing

- **Skala spasi:** 4, 8, 16, 24, 32. Tidak ada nilai di luar ini.
- Padding halaman: 16px (mobile), 24px (tablet), 32px (desktop).
- Jarak antar kartu: 16px (mobile), 24px (desktop).
- Padding dalam kartu: 16px (kecil), 24px (standar).
- Lebar konten maksimal: `max-w-7xl` (1280px). Halaman teks atau form: `max-w-3xl`.
- Sidebar desktop: `w-64`. Mobile: drawer.

### Struktur halaman
```
[Page header]        judul + subjudul + 1 aksi utama
[KPI row]            3 sampai 4 kartu
[Filter bar]         maks. 1 baris
[Konten utama]       chart / tabel
```

### Grid
- KPI: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Chart: `grid-cols-1 lg:grid-cols-2`. Chart lebar penuh hanya untuk data waktu.
- Kartu menu: `grid-cols-1 md:grid-cols-3`

---

## 6. Bentuk dan Kedalaman

| Elemen | Radius |
|---|---|
| Input, tombol | 8px |
| Kartu, tabel | 12px |
| Modal | 16px |
| Badge | full |

Satu radius per jenis elemen. Kartu di landing dan di dashboard harus sama (12px, bukan campur `xl` dan `2xl`).

- Kartu: border 1px `--border`, **tanpa shadow**.
- Hover kartu interaktif: border jadi `--border-strong`.
- Modal saja yang memakai shadow (`shadow-xl`).

---

## 7. Komponen

### Page header
- Judul `page-title`, subjudul `caption` warna `--text-subtle`, aksi utama di kanan.
- Tanpa badge dekoratif, tanpa pemisah `•`.

### Tombol
| Jenis | Gaya | Dipakai untuk |
|---|---|---|
| Primer | Latar merah, teks putih | 1 aksi utama per area |
| Sekunder | Putih, border, teks gelap | Aksi pendukung |
| Ghost | Tanpa border | Aksi tersier, "Reset" |
| Bahaya | Latar `--danger` | Hapus, tolak |

- Tinggi: **40px desktop, 44px layar sentuh**. Tidak ada tombol `h-8` (32px).
- Label berupa kata kerja, maksimal 2 kata.
- Ikon hanya jika memperjelas, di kiri label, 16px.
- Loading: spinner di dalam tombol, tombol dinonaktifkan.

### Kartu menu (landing)
Isi hanya: **ikon, judul, 1 baris deskripsi, 1 tombol**. Tidak ada badge, daftar centang, atau tombol kedua. Tautan sekunder boleh ditaruh sebagai teks kecil di bawah tombol.

### Badge status
- Bentuk pil, tinggi 24px, teks 12px weight 600.
- Latar dan teks mengikuti tabel status. Selalu ada teks.
- Satu badge per baris atau kartu.

### KPI card
```
Label (12px, muted)                [badge status, opsional]
32px ANGKA   / target kecil
[progress bar 6px]
Keterangan 1 baris (12px)
```
- Angka adalah elemen terbesar di kartu.
- Maksimal **5 baris** isi per kartu.
- Warna progress mengikuti **status terhadap target**, bukan selalu hijau. Netral (`--chart-main`) sampai ada risiko, lalu amber atau merah.
- Aturan seperti "Wajib 100%" masuk ke label, bukan badge.

### Tabel
- Header: 12px, weight 600, `--text-muted`, uppercase boleh.
- Baris: tinggi min. 48px, border bawah `--border`, hover latar `--background`.
- Angka rata kanan dengan `tabular-nums`. Status pakai badge.
- Mobile: ubah jadi kartu per baris atau scroll horizontal dengan kolom pertama menempel.

### Form
- Label di atas input, 14px weight 500. Placeholder hanya contoh, bukan pengganti label.
- Input tinggi 40px, border `--border-strong`, fokus ring 2px `--primary`.
- Error di bawah input, 12px, warna `--danger`.
- Bagi form panjang menjadi step bernomor dengan judul 1 kata: `1. Pelapor`, `2. Unit`, `3. Kerusakan`.
- Hanya tandai field **wajib** dengan `*`.

### Modal
- Judul + tombol tutup di kiri atas, aksi di kanan bawah (Batal = sekunder, Simpan = primer).
- Padding 24px, radius 16px, lebar maks. `max-w-lg` (form) atau `max-w-3xl` (detail).
- `role="dialog"`, `aria-modal="true"`, tutup dengan Escape, fokus terkunci di dalam.
- Hindari modal bertumpuk.

### Empty state
Ikon 32px abu-abu, judul singkat, 1 baris saran, 1 tombol jika ada aksi.
Contoh: `Belum ada tiket` / `Laporan baru akan muncul di sini.` / `[Lapor Rusak]`

### Notifikasi
Toast di kanan atas, hilang otomatis 4 detik, maksimal 1 kalimat. Error tidak hilang otomatis.

---

## 8. Chart

### Pilih jenis chart
| Data | Chart |
|---|---|
| Peringkat (komponen, gejala) | Bar horizontal |
| Tren waktu | Garis atau bar vertikal |
| Bagian dari total, **3 sampai 5 kategori** | Donat |
| Bagian dari total, 2 kategori | Satu bar 100% atau 2 angka besar |
| Lebih dari 6 kategori | Bar horizontal, bukan donat |

### Warna chart
- **Data kategori biasa: satu warna** `--chart-main` (`#2563EB`), solid. Tanpa gradasi opacity.
- Highlight: bar teratas atau yang dipilih memakai warna penuh, sisanya `--chart-muted`.
- Seri berbeda (maks. 4): biru `#2563EB`, slate `#64748B`, teal `#0D9488`, ungu `#7C3AED`.
- Merah, amber, hijau **hanya** untuk status (Belum PM, Di Staging, Sudah PM).
- Semua warna diambil dari `lib/chart-colors.ts`. Dilarang menulis `fill="#..."` langsung di komponen.

### Tipografi dan sumbu
- Judul 14px/600, subjudul 12px `--text-subtle`.
- Sumbu dan label 12px `--text-subtle`. Label nilai 12px/600 `--text`.
- Tanpa garis sumbu dan tick. Grid hanya garis horizontal tipis.
- Label nilai langsung di ujung bar, sehingga sumbu angka boleh disembunyikan.

### Donat
- `innerRadius` seragam (**60**), `outerRadius` 80. Total ditulis di tengah (angka 24px + label 12px).
- Legenda di samping atau bawah, dengan angka dan persen.

### Tooltip
Format satu baris: `Nama: nilai satuan (persen)`, contoh `Bearing roda: 12 kasus (18%)`.
Dilarang tag penilaian seperti "Kritis" atau "Dominan" kecuali berdasarkan ambang nyata.

### Legenda dan satuan
- Satu istilah per konsep: toggle, label sumbu, dan tooltip memakai kata yang sama (`Kasus | Pcs`).
- Legenda satu baris di bawah chart. Tidak ada kotak legenda terpisah.
- Lead time/SLA: **3 warna** (hijau sesuai SLA, amber mendekati batas, merah lewat).

### State chart
- Loading: skeleton setinggi chart.
- Kosong: `Belum ada data` + rentang filter aktif.
- Error: `Gagal memuat. [Coba lagi]`.

---

## 9. Interaksi dan Responsif

- Transisi 150ms (`transition-colors`). Hormati `prefers-reduced-motion`.
- Fokus terlihat jelas: ring 2px `--primary`, offset 2px, pada semua elemen interaktif.
- Target sentuh minimal **44x44px** di tablet dan HP.
- Titik henti: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.
- Mobile: satu kolom, aksi utama terlihat tanpa scroll, tabel jadi kartu.
- Dark mode: gunakan token (`--card`, `--border`, `--text`). Tidak ada warna hardcoded.

---

## 10. Aksesibilitas

- Kontras teks minimal **4.5:1**. Teks 12px abu-abu `--text-subtle` hanya di atas putih.
- Status tidak boleh hanya mengandalkan warna.
- Tombol ikon wajib `aria-label`. Chart punya ringkasan teks (`aria-label`) atau tabel alternatif.
- Urutan tab mengikuti urutan visual.

---

## 11. Do dan Don't

**Lakukan**
- Satu tombol primer per area.
- Pakai token CSS dan kelas tipografi.
- Tampilkan status dengan badge bernama.
- Tulis teks seperti bicara ke rekan kerja: singkat dan jelas.

**Jangan**
- Jangan pakai font di bawah 12px.
- Jangan pakai badge, centang, dan deskripsi panjang sekaligus di satu kartu.
- Jangan pakai warna status untuk membedakan kategori biasa.
- Jangan pakai gradasi opacity pada bar, shadow tebal, atau gradient.
- Jangan campur istilah (`kasus` / `kejadian` / `frekuensi`) untuk hal yang sama.
- Jangan membuat chart dengan lebih dari 6 warna.

---

## 12. Checklist sebelum merge

- [ ] Judul halaman ≤ 3 kata, subjudul ≤ 8 kata
- [ ] Hanya 1 tombol primer per area
- [ ] Tidak ada `text-[9px]`, `text-[10px]`, atau `text-[11px]`
- [ ] Tidak ada hex hardcoded di chart
- [ ] Semua tombol ≥ 40px (44px di sentuh)
- [ ] Empty, loading, dan error state tersedia
- [ ] Istilah konsisten dengan daftar baku
- [ ] Kontras ≥ 4.5:1, fokus terlihat
- [ ] Tampilan 375px, 768px, dan 1280px sudah dicek

---

## 13. Implementasi ke kode

Tambahkan ke `app/globals.css`:

```css
:root {
  --text: #0f172a;
  --danger: #dc2626;
  --chart-main: #2563eb;
  --chart-muted: #94a3b8;
}

.t-title   { font-size: 1.5rem;   font-weight: 700; line-height: 1.25; letter-spacing: -0.02em; }
.t-section { font-size: 1.125rem; font-weight: 600; line-height: 1.3; }
.t-card    { font-size: 0.875rem; font-weight: 600; line-height: 1.4; }
.t-body    { font-size: 0.875rem; font-weight: 400; line-height: 1.5; }
.t-caption { font-size: 0.75rem;  font-weight: 500; line-height: 1.4; color: var(--text-subtle); }
.t-kpi     { font-size: 2rem;     font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
```

Buat `lib/chart-colors.ts`:

```ts
export const CHART = {
  main: '#2563EB',
  muted: '#94A3B8',
  series: ['#2563EB', '#64748B', '#0D9488', '#7C3AED'],
  status: { ok: '#059669', warn: '#D97706', late: '#DC2626', info: '#2563EB' },
  axis: '#64748B',
  grid: '#F1F5F9',
} as const;

export const DONUT = { inner: 60, outer: 80 } as const;
```
