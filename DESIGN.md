---
name: Bridgestone Workshop Maintenance System
description: Industrial-grade fleet and maintenance management system for Bridgestone tire factory workshop
colors:
  primary: "#E60012"
  primary-hover: "#CC0010"
  primary-active: "#B3000E"
  primary-subtle: "#FFF1F2"
  primary-foreground: "#FFFFFF"
  neutral-bg: "#F8FAFC"
  neutral-fg: "#000000"
  card-bg: "#FFFFFF"
  border: "#E2E8F0"
  border-strong: "#CBD5E1"
  success: "#059669"
  success-alt: "#10B981"
  warning: "#D97706"
  warning-alt: "#F59E0B"
  info: "#2563EB"
  danger: "#E60012"
  danger-alt: "#EF4444"
  slate-slate: "#334155"
  slate-muted: "#64748B"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.25rem)"
    fontWeight: 700
    lineHeight: "1.2"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.3"
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "-0.011em"
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1.4"
    letterSpacing: "0.02em"
  caption:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "1.3"
    letterSpacing: "0.01em"
  micro:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: "1.2"
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

# Bridgestone Workshop Design System

## Overview
Sistem antarmuka digital operasional bengkel pemeliharaan unit daisha Bridgestone. Dirancang untuk kejelasan maksimal (*high operational clarity*), kontras tinggi untuk kondisi lantai pabrik, dan ergonomi sentuh di tablet maupun workstation desktop.

## Colors
Identitas visual dibangun di atas warna resmi merek Bridgestone dengan palet pendukung slate netral:
- **Primary / Accent**: `Bridgestone Red` (`#E60012`) melambangkan presisi, keandalan, dan identitas resmi. Digunakan pada aksi primer, status kritis, dan indikator aktif.
- **Dark Primary Accent**: `#FF2E3E` untuk kontras tinggi pada latar gelap/night shift.
- **Surface & Backgrounds**:
  - *Light Mode*: Latar dasar `#F8FAFC` (Slate 50), Kartu `#FFFFFF`, Border `#E2E8F0`.
  - *Dark Mode*: Latar dasar `#090D16` (Deep Industrial Slate), Kartu `#111827`, Border `#1F2937`.
- **Status Semantik**:
  - *Success* (Selesai/Normal): Emerald `#059669`
  - *Warning* (Sedang Dikerjakan/Pending): Amber `#D97706`
  - *Info* (Menunggu Evaluasi/Inspeksi): Blue `#2563EB`
  - *Danger* (Rusak/Tertunda): Bridgestone Red `#E60012`

## Typography
- **Font Utama**: `Plus Jakarta Sans` di seluruh antarmuka aplikasi.
- **Karakter Tipografi**:
  - Ketat (*tight tracking* -0.011em s/d -0.02em) untuk keterbacaan data teknis yang cepat.
  - Tabular figures pada data numerik (durasi pengerjaan, ID unit, kuantitas suku cadang).
  - Hirarki jelas: Title (700 bold), Subheading (600 semibold), Body (400/500 regular).

## Layout
- **Responsif Multi-Device**:
  - Desktop: Sidebar navigasi industrial tetap (`w-64`) dengan area kerja fleksibel.
  - Mobile/Tablet: Header ringkas dengan Drawer Navigasi sentuh (minimum 44x44px per tap target).
- **Grid Kerja**:
  - Grid kartu unit daisha reflow otomatis (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
  - Padding konsisten 16px (mobile) hingga 32px (desktop monitor).

## Elevation & Depth
- **Filosofi Kedalaman**: Mengutamakan *crisp 1px borders* daripada bayangan tebal yang mendegradasi performa rendering.
- **Shadow Scale**:
  - Subtly raised (`shadow-sm`): Kartu interaktif dan filter pills.
  - Layer modal dialog (`shadow-2xl`): Fokus terlindung pada jendela inspeksi dan input perbaikan.

## Shapes
- **Radius Skala**:
  - Input field dan tombol: `8px` (`rounded-lg`).
  - Kartu ringkasan dan tabel container: `12px` s/d `16px` (`rounded-xl` / `rounded-2xl`).
  - Badge status: `9999px` (`rounded-full`).

## Components
- **Unit Card**: Menampilkan kode unit, seksi bengkel, status perbaikan, dan aksi cepat dengan feedback visual hover dan focus ring 2px.
- **Dialog Modal**: Mengimplementasikan `role="dialog"`, `aria-modal="true"`, kaitan `aria-labelledby`, dan penutup Escape key.
- **Filter Pills**: Tab navigasi dengan `role="tablist"` dan target sentuh minimal 44px tinggi.

## Do's and Don'ts
- **DO**: Selalu gunakan token semantic (`var(--primary)`, `var(--card)`, `var(--border)`) saat membuat modul baru.
- **DO**: Pastikan teks di atas latar putih atau gelap memiliki rasio kontras minimal 4.5:1 (WCAG AA).
- **DON'T**: Jangan menggunakan gradient rainbow atau efek glassmorphism berlebihan yang mengaburkan data operasional teknis pabrik.
- **DON'T**: Jangan memasang tombol interaktif dengan ukuran di bawah 44px pada layar sentuh.
