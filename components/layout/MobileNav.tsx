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
  Target,
  LayoutDashboard,
  AlertTriangle,
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
    if (pathname.startsWith('/kpi')) {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/kpi?tab=daisha', icon: BarChart2, label: 'Daisha' },
        { href: '/kpi?tab=pm', icon: Target, label: 'PM' },
        { href: '/kpi?tab=request', icon: SendHorizonal, label: 'Request' },
      );
    } else if (pathname.startsWith('/maintenance') || pathname.startsWith('/catalog')) {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/maintenance?tab=staging', icon: Target, label: 'Antrean PM' },
        { href: '/maintenance?tab=fleet', icon: Layers, label: 'Armada' },
        { href: '/kpi?tab=daisha', icon: BarChart2, label: 'KPI Daisha' },
      );
    } else if (pathname.startsWith('/request')) {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/request/tracking', icon: ClipboardList, label: 'Pelacakan' },
        { href: '/request', icon: PenSquare, label: 'Buat' },
        { href: '/kpi?tab=request', icon: BarChart2, label: 'KPI Req' },
      );
    } else if (pathname.startsWith('/spareparts')) {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/spareparts', icon: Package, label: 'Stok' },
        { href: '/kpi?tab=spareparts', icon: BarChart2, label: 'KPI Stok' },
      );
    } else if (pathname.startsWith('/users')) {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/users', icon: Users, label: 'User' },
        { href: '/admin', icon: Settings, label: 'Bengkel' },
      );
    } else {
      navItems.push(
        { href: '/', icon: Home, label: 'Portal' },
        { href: '/kpi', icon: BarChart2, label: 'Pusat KPI' },
        { href: '/admin', icon: Settings, label: 'Bengkel' },
        { href: '/input', icon: PenSquare, label: 'Lapor' },
      );
    }
  } else if (isOperator) {
    navItems.push(
      { href: '/input', icon: PenSquare, label: 'Lapor' },
      { href: '/riwayat', icon: ClipboardList, label: 'Status' },
    );
  } else if (isSeksi) {
    navItems.push(
      { href: '/', icon: Home, label: 'Portal' },
      { href: '/lapor-rusak', icon: AlertTriangle, label: 'Lapor' },
      { href: '/maintenance', icon: Target, label: 'PM Seksi' },
      { href: '/request', icon: LayoutDashboard, label: 'Request' },
    );
  }

  return (
    <>
      {/* Top Mobile Bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-3.5 py-2.5 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-white px-2 py-0.5 rounded flex items-center">
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
          className="min-h-[44px] px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-slate-700 active:scale-95 transition"
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
      <nav aria-label="Navigasi Bawah Layar Sentuh" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around">
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
              <span className="text-xs mt-0.5">{item.label}</span>
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
          <span className="text-xs mt-0.5">Keluar</span>
        </button>
      </nav>
    </>
  );
}
