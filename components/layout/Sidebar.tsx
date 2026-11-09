'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Wrench,
  Package,
  SendHorizonal,
  Users,
  Layers,
  Target,
  Home,
  AlertTriangle,
  Truck,
  BarChart3,
  PenSquare,
  ScanLine,
  Menu,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import PwaInstaller from '../common/PwaInstaller';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktopCollapse?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function SidebarInner({
  isMobileMenuOpen,
  onCloseMobileMenu,
  isDesktopCollapsed = false,
  onToggleDesktopCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, isOperator, isSeksi, isAdmin, openLogoutModal, isLoggingOut } = useAuth();

  // Definisi struktur navigasi langsung tanpa akordeon bersarang
  const getNavSections = (): NavSection[] => {
    if (isSeksi) {
      const seksiName = currentUser?.seksi || 'Plant';
      return [
        {
          title: 'Layanan Seksi',
          items: [
            { href: '/lapor-rusak', label: 'Lapor Rusak', icon: AlertTriangle },
            { href: '/riwayat', label: 'Antrean Unit Seksi', icon: ScanLine },
            { href: '/maintenance', label: 'Penjemputan PM', icon: Truck },
            { href: '/request/tracking', label: 'Request Modifikasi', icon: SendHorizonal },
          ],
        },
        {
          title: 'Monitoring',
          items: [
            { href: `/kpi?seksi=${encodeURIComponent(seksiName)}`, label: `KPI Seksi ${seksiName}`, icon: BarChart3 },
          ],
        },
      ];
    }

    if (isOperator) {
      return [
        {
          title: 'Operasional Bengkel',
          items: [
            { href: '/input', label: 'Input Kerusakan', icon: PenSquare },
            { href: '/riwayat', label: 'Tindakan Bengkel', icon: ScanLine },
            { href: '/maintenance', label: 'PM & Armada', icon: Target },
          ],
        },
        {
          title: 'Gudang & Inventaris',
          items: [
            { href: '/spareparts', label: 'Stok Sparepart', icon: Package },
          ],
        },
        {
          title: 'Analitik',
          items: [
            { href: '/kpi', label: 'Dashboard KPI', icon: BarChart3 },
          ],
        },
      ];
    }

    // Role Admin: 3 Zona Tegas & Jelas
    return [
      {
        title: 'Operasional Workshop',
        items: [
          { href: '/admin', label: 'Perbaikan & Servis', icon: Wrench },
          { href: '/maintenance', label: 'Pemeliharaan PM', icon: Target },
          { href: '/request/tracking', label: 'Request Seksi', icon: SendHorizonal },
        ],
      },
      {
        title: 'Logistik & Aset',
        items: [
          { href: '/spareparts', label: 'Stok Sparepart', icon: Package },
          { href: '/catalog', label: 'Registri Daisha', icon: Layers },
        ],
      },
      {
        title: 'Manajemen & Kontrol',
        items: [
          { href: '/kpi', label: 'Dashboard KPI Terpadu', icon: BarChart3 },
          { href: '/users', label: 'Pengelola Akun', icon: Users },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    const basePath = href.split('?')[0];
    return pathname.startsWith(basePath);
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-[transform,width,opacity] duration-300 ease-in-out shrink-0
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
        ${
          isDesktopCollapsed
            ? 'md:hidden md:w-0 md:opacity-0 md:-translate-x-full md:pointer-events-none md:overflow-hidden'
            : 'md:static md:translate-x-0 md:w-60 md:opacity-100 md:pointer-events-auto'
        }
      `}
    >
      {/* 1. Header Identitas */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-white px-2 py-1 rounded-md flex items-center shrink-0">
            <Image
              src="/logo-bs.png"
              alt="Bridgestone"
              width={100}
              height={22}
              className="h-5 w-auto object-contain"
              priority
            />
          </div>
          <span className="text-xs font-semibold text-slate-200 tracking-tight">
            Workshop
          </span>
        </Link>

        {onToggleDesktopCollapse && (
          <button
            type="button"
            onClick={onToggleDesktopCollapse}
            className="hidden md:flex p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
            title="Ciutkan Sidebar (Ctrl+B)"
            aria-label="Ciutkan Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Profil Akun Ringkas */}
      {currentUser && (
        <div className="px-3 py-2.5 border-b border-slate-800 flex items-center gap-2 bg-slate-950/40">
          <div className="w-6 h-6 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center text-xs shrink-0 font-bold">
            {currentUser.role === 'ADMIN' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            ) : currentUser.role === 'USER_SEKSI' ? (
              <Users className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <div className="overflow-hidden flex-1 leading-none">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser.name || currentUser.username}
            </p>
            <span className="text-[11px] text-slate-400 font-normal">
              {currentUser.role === 'ADMIN'
                ? 'Administrator'
                : currentUser.role === 'USER_SEKSI'
                ? `User Seksi ${currentUser.seksi || ''}`
                : 'Operator Bengkel'}
            </span>
          </div>
        </div>
      )}

      {/* 3. Daftar Menu Terstruktur (Direct Sectioned Menu) */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        {/* Tombol Beranda Utama */}
        <div>
          <Link
            href="/"
            onClick={onCloseMobileMenu}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
              pathname === '/'
                ? 'bg-red-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Beranda Portal</span>
          </Link>
        </div>

        {/* Zona Menu Langsung */}
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <span className="block px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {section.title}
            </span>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isLinkActive(item.href);
                const ItemIcon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobileMenu}
                    className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition ${
                      active
                        ? 'bg-slate-800 text-white font-semibold border-l-2 border-red-500 pl-2'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ItemIcon
                        className={`w-4 h-4 shrink-0 transition ${
                          active ? 'text-red-500' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 4. Footer & Logout */}
      <div className="p-2.5 border-t border-slate-800 space-y-1.5 bg-slate-950">
        <PwaInstaller buttonStyle="sidebar" />

        <button
          type="button"
          onClick={openLogoutModal}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </aside>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense
      fallback={
        <aside
          className={`
            fixed inset-y-0 left-0 z-30 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col shrink-0
            ${props.isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
            ${props.isDesktopCollapsed ? 'md:hidden md:w-0' : 'md:static md:translate-x-0 md:w-60'}
          `}
          aria-hidden="true"
        />
      }
    >
      <SidebarInner {...props} />
    </Suspense>
  );
}
