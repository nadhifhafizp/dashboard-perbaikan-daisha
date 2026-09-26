'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
  CalendarClock,
  Layers,
  Users,
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

  const navItems: { href: string; icon: React.ElementType; label: string }[] = [];

  if (isAdmin) {
    if (pathname.startsWith('/fleet') || pathname.startsWith('/catalog')) {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/fleet', icon: CalendarClock, label: 'Kontrol' },
        { href: '/catalog', icon: Layers, label: 'Master' },
        { href: '/daisha', icon: BarChart2, label: 'Perbaikan' },
      );
    } else if (pathname.startsWith('/request')) {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/request', icon: SendHorizonal, label: 'Request' },
        { href: '/fleet', icon: CalendarClock, label: 'Kontrol' },
        { href: '/daisha', icon: BarChart2, label: 'Daisha' },
      );
    } else if (pathname.startsWith('/spareparts')) {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/spareparts', icon: Package, label: 'Stok' },
        { href: '/fleet', icon: CalendarClock, label: 'Kontrol' },
        { href: '/daisha', icon: BarChart2, label: 'Daisha' },
      );
    } else if (pathname.startsWith('/users')) {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/users', icon: Users, label: 'User' },
        { href: '/daisha', icon: BarChart2, label: 'Perbaikan' },
        { href: '/fleet', icon: CalendarClock, label: 'Kontrol' },
      );
    } else {
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
      {/* Top Mobile Bar */}
      <div className="md:hidden bg-[#4A0005] border-b border-[#3A0004] text-white flex items-center justify-between px-3.5 py-2.5 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-white px-2 py-0.5 rounded flex items-center shadow-xs">
            <Image
              src="/logo-bs.png"
              alt="Logo Bridgestone"
              width={90}
              height={18}
              className="h-4 w-auto object-contain"
              priority
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="min-h-[36px] px-2.5 py-1.5 rounded-md bg-[#3D0004] hover:bg-[#5E0007] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer flex items-center gap-1.5 text-xs font-medium border border-[#630008]"
          aria-label={isMobileMenuOpen ? 'Tutup navigasi samping' : 'Buka navigasi samping'}
        >
          {isMobileMenuOpen ? (
            <><X className="w-4 h-4" /><span>Tutup</span></>
          ) : (
            <><Menu className="w-4 h-4" /><span>Menu</span></>
          )}
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav aria-label="Navigasi Bawah Layar Sentuh" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-sm">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 px-3 rounded-lg transition relative ${
                isActive ? 'text-red-600 font-semibold' : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {isActive && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-600 rounded-full" />}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={openLogoutModal}
          className="flex flex-col items-center justify-center min-h-[44px] py-1 px-3 text-slate-500 hover:text-red-600 rounded-lg transition cursor-pointer"
          aria-label="Keluar dari akun sistem"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Keluar</span>
        </button>
      </nav>
    </>
  );
}
