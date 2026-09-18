'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useServerInfo } from '@/hooks/useServerInfo';
import {
  Home,
  BarChart2,
  PenSquare,
  ClipboardList,
  Settings,
  SendHorizonal,
  Package,
  LogOut,
  Menu,
  X,
  Copy,
  Check,
} from 'lucide-react';

interface MobileNavProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export default function MobileNav({
  isMobileMenuOpen,
  onToggleMobileMenu,
}: MobileNavProps) {
  const pathname = usePathname();
  const { isOperator, isAdmin, isSeksi, openLogoutModal } = useAuth();
  const { serverInfo, copied, copyUrl } = useServerInfo();

  // Build bottom nav items based on role and active module
  const navItems: { href: string; icon: React.ElementType; label: string }[] = [];

  if (isAdmin) {
    if (pathname.startsWith('/request')) {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/request', icon: SendHorizonal, label: 'Request' },
        { href: '/daisha', icon: BarChart2, label: 'Daisha' },
        { href: '/spareparts', icon: Package, label: 'Stok' },
      );
    } else if (pathname.startsWith('/spareparts')) {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/spareparts', icon: Package, label: 'Stok' },
        { href: '/daisha', icon: BarChart2, label: 'Daisha' },
        { href: '/request', icon: SendHorizonal, label: 'Request' },
      );
    } else {
      // Modul Daisha (termasuk /daisha, /input, /riwayat, /admin)
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/daisha', icon: BarChart2, label: 'Analitik' },
        { href: '/input', icon: PenSquare, label: 'Lapor' },
        { href: '/riwayat', icon: ClipboardList, label: 'Antrean' },
        { href: '/admin', icon: Settings, label: 'Tindakan' },
      );
    }
  } else if (isOperator) {
    navItems.push(
      { href: '/input', icon: PenSquare, label: 'Lapor' },
      { href: '/riwayat', icon: ClipboardList, label: 'Status' },
    );
  } else if (isSeksi) {
    navItems.push(
      { href: '/request', icon: SendHorizonal, label: 'Request' },
    );
  }

  return (
    <>
      {/* Top Mobile Bar (Hanya di layar kecil) */}
      <div className="md:hidden bg-red-700 text-white flex items-center justify-between p-3.5 shadow-md z-20">
        <div className="flex items-center gap-2">
          <div className="bg-white px-2.5 py-1 rounded flex items-center">
            <Image
              src="/logo-bs.png"
              alt="Logo Bridgestone"
              width={100}
              height={20}
              className="h-5 w-auto object-contain"
              style={{ width: 'auto', height: '1.25rem' }}
              priority
            />
          </div>
          {serverInfo && (
            <button
              type="button"
              onClick={copyUrl}
              className="px-2 py-1 bg-red-800/90 hover:bg-red-900 border border-red-500/60 rounded text-[10.5px] font-mono text-red-100 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              title="Salin alamat IP server"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{serverInfo.ip}:{serverInfo.port}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-300" />
              ) : (
                <Copy className="w-3 h-3 text-red-300" />
              )}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg bg-red-800 text-white focus:outline-none cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {isMobileMenuOpen ? (
            <><X className="w-4 h-4" /><span>Tutup</span></>
          ) : (
            <><Menu className="w-4 h-4" /><span>Menu</span></>
          )}
        </button>
      </div>

      {/* Bottom Navigation Bar (Khusus Smartphone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition relative ${
                isActive ? 'text-red-700 font-black' : 'text-slate-500 font-medium'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-600 rounded-full" />}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={openLogoutModal}
          className="flex flex-col items-center justify-center py-1 px-2 text-slate-500 hover:text-red-600 rounded-xl transition cursor-pointer"
          aria-label="Keluar"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Keluar</span>
        </button>
      </nav>
    </>
  );
}
