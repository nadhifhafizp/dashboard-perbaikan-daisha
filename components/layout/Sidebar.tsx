'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  PenSquare,
  ClipboardList,
  Settings,
  LogOut,
  ShieldCheck,
  Wrench,
  Package,
  SendHorizonal,
  Users,
  ArrowLeft,
  Menu,
  ScanLine,
  Copy,
  Check,
} from 'lucide-react';
import PwaInstaller from '../common/PwaInstaller';
import { useServerInfo } from '@/hooks/useServerInfo';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktopCollapse?: () => void;
}

export default function Sidebar({
  isMobileMenuOpen,
  onCloseMobileMenu,
  isDesktopCollapsed = false,
  onToggleDesktopCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, isOperator, isSeksi, isAdmin, openLogoutModal, isLoggingOut } = useAuth();
  const { serverInfo, copied, copyUrl } = useServerInfo();

  // 1. Deteksi modul sistem aktif berdasarkan URL
  // Catatan: /admin (Panel Tindakan Bengkel) adalah bagian inti dari alur kerja Modul Daisha
  let currentModule: 'DAISHA' | 'REQUEST' | 'SPAREPARTS' = 'DAISHA';
  if (pathname.startsWith('/request')) {
    currentModule = 'REQUEST';
  } else if (pathname.startsWith('/spareparts')) {
    currentModule = 'SPAREPARTS';
  } else {
    currentModule = 'DAISHA';
  }

  // 2. Daftar link khusus per modul (tidak dicampur aduk)
  const getNavLinks = () => {
    // Role USER_SEKSI: Hanya modul request
    if (isSeksi) {
      return [
        { href: '/request', label: 'Dashboard Request', icon: SendHorizonal },
      ];
    }

    // Role OPERATOR: Hanya modul perbaikan daisha
    if (isOperator) {
      return [
        { href: '/input', label: 'Lapor Kerusakan', icon: PenSquare },
        { href: '/riwayat', label: 'Pelacakan & Antrean', icon: ScanLine },
      ];
    }

    // Role ADMIN: Disesuaikan per modul yang sedang dibuka
    switch (currentModule) {
      case 'REQUEST':
        return [
          { href: '/request', label: 'Dashboard & Tiket Request', icon: SendHorizonal },
        ];
      case 'SPAREPARTS':
        return [
          { href: '/spareparts', label: 'Monitoring & Inventaris', icon: Package },
        ];
      case 'DAISHA':
      default:
        return [
          { href: '/daisha', label: 'Dashboard Analitik', icon: LayoutDashboard },
          { href: '/input', label: 'Lapor Kerusakan', icon: PenSquare },
          { href: '/riwayat', label: 'Pelacakan & Antrean', icon: ScanLine },
          { href: '/admin', label: 'Panel Tindakan Bengkel', icon: Settings },
        ];
    }
  };

  const navLinks = getNavLinks();

  // Konfigurasi visual kartu context
  const MODULE_INFO = {
    DAISHA: {
      title: 'Sistem Perbaikan Daisha',
      badge: 'Modul Daisha',
      accentColor: 'border-red-500 bg-red-800/90 text-red-100',
      icon: Wrench,
    },
    REQUEST: {
      title: 'Follow-Up Request Seksi',
      badge: 'Modul Request',
      accentColor: 'border-blue-500 bg-blue-900/90 text-blue-100',
      icon: SendHorizonal,
    },
    SPAREPARTS: {
      title: 'Manajemen Spareparts',
      badge: 'Modul Spareparts',
      accentColor: 'border-emerald-500 bg-emerald-900/90 text-emerald-100',
      icon: Package,
    },
  };

  const activeInfo = MODULE_INFO[currentModule];
  const ActiveIcon = activeInfo.icon;

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-30 bg-red-700 text-white shadow-xl flex flex-col transition-all duration-300 ease-in-out shrink-0
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${isDesktopCollapsed ? 'md:w-0 md:opacity-0 md:-translate-x-full md:pointer-events-none md:overflow-hidden' : 'md:w-64 md:opacity-100'}
      `}
    >
      {/* Brand Logo & Desktop Collapse Toggle */}
      <div className="hidden md:flex p-4 text-center border-b border-red-600 flex-col items-center justify-center bg-white relative">
        {onToggleDesktopCollapse && (
          <button
            type="button"
            onClick={onToggleDesktopCollapse}
            className="absolute right-2.5 top-2.5 p-1.5 text-slate-400 hover:text-red-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Sembunyikan Sidebar"
            aria-label="Sembunyikan Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <Image
          src="/logo-bs.png"
          alt="Logo Bridgestone"
          width={160}
          height={42}
          className="h-9 w-auto object-contain mx-auto"
          style={{ width: 'auto', height: '2.25rem' }}
          priority
        />
        <div className="mt-2 flex flex-col items-center w-full">
          <span className="text-[11px] font-black text-gray-900 tracking-widest uppercase text-center">
            Workshop Management
          </span>
          {serverInfo && (
            <button
              type="button"
              onClick={copyUrl}
              className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-full text-[10px] font-bold text-emerald-800 transition cursor-pointer shadow-2xs group"
              title="Klik untuk menyalin URL akses jaringan lokal"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-mono">IP: {serverInfo.ip}:{serverInfo.port}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-emerald-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Module Context Banner (Menunjukkan modul aktif saat ini) */}
      <div className="p-3.5 bg-red-800/90 border-b border-red-600">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-red-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            <ActiveIcon className="w-4 h-4 text-red-700" />
          </div>
          <div className="overflow-hidden">
            <span className="block text-[10px] font-black uppercase tracking-wider text-red-200">
              {activeInfo.badge}
            </span>
            <p className="text-xs font-black text-white truncate">
              {activeInfo.title}
            </p>
          </div>
        </div>
      </div>

      {/* User Badge Info */}
      {currentUser && (
        <div className="px-4 py-3 bg-red-850 border-b border-red-600 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-red-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            {currentUser.role === 'ADMIN' ? (
              <ShieldCheck className="w-4 h-4 text-red-700" />
            ) : currentUser.role === 'USER_SEKSI' ? (
              <Users className="w-4 h-4 text-red-700" />
            ) : (
              <Wrench className="w-4 h-4 text-red-700" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">
              {currentUser.name || currentUser.username}
            </p>
            <span className="inline-block text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.2 rounded-full bg-red-900/80 text-red-200">
              {currentUser.role === 'USER_SEKSI' ? 'SEKSI' : currentUser.role}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Menu Links (Khusus Modul Ini) */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {/* Tombol Kembali ke Portal Utama (Untuk Admin) */}
        {isAdmin && (
          <div className="pb-2.5 mb-2 border-b border-red-600/70">
            <Link
              href="/"
              onClick={onCloseMobileMenu}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black bg-black/25 hover:bg-black/40 text-white transition-all border border-white/10 hover:border-white/20 shadow-xs group"
              title="Kembali ke 3 Pilihan Card di Beranda"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
              <span>Ganti Modul (Portal)</span>
            </Link>
          </div>
        )}

        {/* Menu Khusus Modul Ini Saja */}
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-red-300/80 px-3">
            Menu {activeInfo.badge}
          </span>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onCloseMobileMenu}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-red-700 shadow-sm font-bold scale-[1.02]'
                    : 'text-red-100 hover:bg-red-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-700' : 'text-red-200'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Navigasi Pindah Modul Langsung (Khusus Admin) */}
        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-red-600/60 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-red-300/80 px-3">
              Pindah Modul
            </span>
            {currentModule !== 'DAISHA' && (
              <Link
                href="/daisha"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-100 hover:bg-red-800/80 hover:text-white transition-all"
              >
                <Wrench className="w-4 h-4 shrink-0 text-red-200" />
                <span>Perbaikan Daisha</span>
              </Link>
            )}
            {currentModule !== 'REQUEST' && (
              <Link
                href="/request"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-100 hover:bg-red-800/80 hover:text-white transition-all"
              >
                <SendHorizonal className="w-4 h-4 shrink-0 text-blue-200" />
                <span>Request Seksi</span>
              </Link>
            )}
            {currentModule !== 'SPAREPARTS' && (
              <Link
                href="/spareparts"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-100 hover:bg-red-800/80 hover:text-white transition-all"
              >
                <Package className="w-4 h-4 shrink-0 text-emerald-200" />
                <span>Stok Sparepart</span>
              </Link>
            )}
          </div>
        )}

        {/* Instalasi App Desktop untuk PC Client & Tombol Logout */}
        <div className="pt-4 mt-4 border-t border-red-600/60 space-y-2">
          <PwaInstaller buttonStyle="sidebar" />
          
          <button
            type="button"
            onClick={openLogoutModal}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-red-800/80 hover:bg-red-900 text-red-100 transition-all disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-300" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </nav>

      <div className="p-3 border-t border-red-600 text-[11px] font-medium text-center text-red-200">
        © 2026 PT Bridgestone
      </div>
    </aside>
  );
}
