'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  PenSquare,
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
} from 'lucide-react';
import PwaInstaller from '../common/PwaInstaller';

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

  // 1. Deteksi modul sistem aktif berdasarkan URL
  let currentModule: 'DAISHA' | 'REQUEST' | 'SPAREPARTS' = 'DAISHA';
  if (pathname.startsWith('/request')) {
    currentModule = 'REQUEST';
  } else if (pathname.startsWith('/spareparts')) {
    currentModule = 'SPAREPARTS';
  } else {
    currentModule = 'DAISHA';
  }

  // 2. Daftar link khusus per modul
  const getNavLinks = () => {
    if (isSeksi) {
      return [
        { href: '/request', label: 'Dashboard Request', icon: SendHorizonal },
      ];
    }

    if (isOperator) {
      return [
        { href: '/input', label: 'Lapor Kerusakan', icon: PenSquare },
        { href: '/riwayat', label: 'Pelacakan & Antrean', icon: ScanLine },
      ];
    }

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

  const MODULE_INFO = {
    DAISHA: {
      title: 'Perbaikan Daisha',
      badge: 'Modul Daisha',
      icon: Wrench,
    },
    REQUEST: {
      title: 'Request Seksi',
      badge: 'Modul Request',
      icon: SendHorizonal,
    },
    SPAREPARTS: {
      title: 'Manajemen Spareparts',
      badge: 'Modul Spareparts',
      icon: Package,
    },
  };

  const activeInfo = MODULE_INFO[currentModule];
  const ActiveIcon = activeInfo.icon;

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-30 bg-[#4A0005] text-neutral-200 border-r border-[#3A0004] flex flex-col transition-all duration-300 ease-in-out shrink-0
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${isDesktopCollapsed ? 'md:w-0 md:opacity-0 md:-translate-x-full md:pointer-events-none md:overflow-hidden' : 'md:w-64 md:opacity-100'}
      `}
    >
      {/* Brand Logo & Desktop Collapse Toggle */}
      <div className="hidden md:flex p-4 border-b border-[#3A0004] flex-col items-center justify-center bg-[#3D0004] relative">
        {onToggleDesktopCollapse && (
          <button
            type="button"
            onClick={onToggleDesktopCollapse}
            className="absolute right-2.5 top-2.5 p-1.5 text-red-200/70 hover:text-white hover:bg-white/10 rounded-md transition cursor-pointer"
            title="Sembunyikan Sidebar"
            aria-label="Sembunyikan Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="bg-white px-3.5 py-1.5 rounded-md shadow-xs flex items-center justify-center">
          <Image
            src="/logo-bs.png"
            alt="Logo Bridgestone"
            width={140}
            height={36}
            className="h-7 w-auto object-contain"
            priority
          />
        </div>
        <div className="mt-2.5 flex flex-col items-center w-full">
          <span className="text-xs font-semibold text-red-100/90 tracking-wide text-center">
            Workshop Management
          </span>
        </div>
      </div>

      {/* Module Context Banner */}
      <div className="px-4 py-3 border-b border-[#3A0004] bg-[#3D0004]/70 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center text-red-300 shrink-0">
          <ActiveIcon className="w-3.5 h-3.5" />
        </div>
        <div className="overflow-hidden">
          <span className="block text-[11px] font-medium text-red-200/60">
            {activeInfo.badge}
          </span>
          <p className="text-xs font-semibold text-white truncate">
            {activeInfo.title}
          </p>
        </div>
      </div>

      {/* User Info */}
      {currentUser && (
        <div className="px-4 py-2.5 border-b border-[#3A0004] flex items-center gap-2.5 bg-[#3D0004]/40">
          <div className="w-7 h-7 rounded-lg bg-[#300003] text-red-200 border border-[#500006] flex items-center justify-center font-medium text-xs shrink-0">
            {currentUser.role === 'ADMIN' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            ) : currentUser.role === 'USER_SEKSI' ? (
              <Users className="w-3.5 h-3.5 text-blue-300" />
            ) : (
              <Wrench className="w-3.5 h-3.5 text-amber-300" />
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-medium text-white truncate leading-tight">
              {currentUser.name || currentUser.username}
            </p>
            <span className="text-[11px] text-red-200/60 font-normal">
              {currentUser.role === 'USER_SEKSI' ? 'User Seksi' : currentUser.role === 'ADMIN' ? 'Administrator' : 'Operator Workshop'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Menu Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Back to Portal (Admin) */}
        {isAdmin && (
          <div className="pb-2 mb-2 border-b border-[#3A0004]">
            <Link
              href="/"
              onClick={onCloseMobileMenu}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-100 bg-[#3D0004]/80 hover:bg-[#5E0007] hover:text-white border border-[#500006] transition group"
              title="Kembali ke Pilihan Sistem di Beranda"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition text-red-300" />
              <span>Ganti Modul (Portal)</span>
            </Link>
          </div>
        )}

        {/* Current Module Nav Links */}
        <div className="space-y-0.5">
          <span className="text-[11px] font-semibold text-red-200/50 uppercase tracking-wider px-3 py-1 block">
            Menu Utama
          </span>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onCloseMobileMenu}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs font-semibold'
                    : 'text-red-100/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-red-200/70'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Module Switcher for Admin */}
        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-[#3A0004] space-y-0.5">
            <span className="text-[11px] font-semibold text-red-200/50 uppercase tracking-wider px-3 py-1 block">
              Pindah Modul
            </span>
            {currentModule !== 'DAISHA' && (
              <Link
                href="/daisha"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-200/70 hover:bg-white/10 hover:text-white transition"
              >
                <Wrench className="w-4 h-4 shrink-0 text-red-300/70" />
                <span>Perbaikan Daisha</span>
              </Link>
            )}
            {currentModule !== 'REQUEST' && (
              <Link
                href="/request"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-200/70 hover:bg-white/10 hover:text-white transition"
              >
                <SendHorizonal className="w-4 h-4 shrink-0 text-red-300/70" />
                <span>Request Seksi</span>
              </Link>
            )}
            {currentModule !== 'SPAREPARTS' && (
              <Link
                href="/spareparts"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-200/70 hover:bg-white/10 hover:text-white transition"
              >
                <Package className="w-4 h-4 shrink-0 text-red-300/70" />
                <span>Stok Sparepart</span>
              </Link>
            )}
          </div>
        )}

        {/* PWA & Logout */}
        <div className="pt-3 mt-3 border-t border-[#3A0004] space-y-2">
          <PwaInstaller buttonStyle="sidebar" />

          <button
            type="button"
            onClick={openLogoutModal}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-100/80 hover:bg-[#3D0004] hover:text-red-200 border border-transparent hover:border-[#600007] transition disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-300/70" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </nav>

      <div className="p-3 border-t border-[#3A0004] text-[11px] text-center text-red-300/40">
        © 2026 PT Bridgestone
      </div>
    </aside>
  );
}
