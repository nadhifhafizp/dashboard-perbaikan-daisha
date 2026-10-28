'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
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
  Menu,
  ScanLine,
  Layers,
  CalendarClock,
  Target,
  ChevronDown,
  Home,
  ClipboardList,
  AlertTriangle,
  Truck,
  BarChart3,
  PlusCircle,
} from 'lucide-react';
import PwaInstaller from '../common/PwaInstaller';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktopCollapse?: () => void;
}

interface SubMenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface ModuleDef {
  id: 'KPI' | 'DAISHA' | 'FLEET' | 'REQUEST' | 'SPAREPARTS' | 'USERS';
  title: string;
  badge: string;
  icon: React.ElementType;
  items: SubMenuItem[];
}

function SidebarInner({
  isMobileMenuOpen,
  onCloseMobileMenu,
  isDesktopCollapsed = false,
  onToggleDesktopCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentUser, isOperator, isSeksi, isAdmin, openLogoutModal, isLoggingOut } = useAuth();

  // 1. Deteksi modul sistem aktif berdasarkan URL saat ini
  const getActiveModule = (path: string): 'KPI' | 'DAISHA' | 'FLEET' | 'REQUEST' | 'SPAREPARTS' | 'USERS' | '' => {
    if (path.startsWith('/kpi')) {
      return 'KPI';
    }
    if (path.startsWith('/maintenance') || path.startsWith('/catalog')) {
      return 'FLEET';
    }
    if (path.startsWith('/request')) {
      return 'REQUEST';
    }
    if (path.startsWith('/spareparts')) {
      return 'SPAREPARTS';
    }
    if (path.startsWith('/users')) {
      return 'USERS';
    }
    if (
      path.startsWith('/daisha') ||
      path.startsWith('/input') ||
      path.startsWith('/riwayat') ||
      path.startsWith('/admin')
    ) {
      return 'DAISHA';
    }
    return '';
  };

  const currentModule = getActiveModule(pathname);

  // 2. State Accordion per Modul (Derived state dengan override manual klik user)
  const [userToggled, setUserToggled] = useState<Record<string, boolean>>({});

  const toggleModule = (moduleId: string) => {
    setUserToggled((prev) => {
      const currentIsOpen =
        prev[moduleId] !== undefined
          ? prev[moduleId]
          : currentModule === moduleId || (currentModule === '' && moduleId === 'DAISHA');
      return {
        ...prev,
        [moduleId]: !currentIsOpen,
      };
    });
  };

  // 3. Definisi Modul Terstruktur Sesuai Kartu Portal
  const allModules: ModuleDef[] = [
    {
      id: 'KPI',
      title: 'KPI Daisha',
      badge: 'Analitik',
      icon: BarChart3,
      items: [
        { href: '/kpi?tab=daisha', label: 'Armada & PM', icon: Layers },
        { href: '/kpi?tab=request', label: 'Request Seksi', icon: SendHorizonal },
        { href: '/kpi?tab=spareparts', label: 'Stok Sparepart', icon: Package },
      ],
    },
    {
      id: 'DAISHA',
      title: 'Perbaikan Daisha',
      badge: 'Servis Unit',
      icon: Wrench,
      items: [
        ...(isAdmin ? [{ href: '/admin', label: 'Panel Tindakan', icon: Settings }] : []),
        { href: '/input', label: 'Input Kerusakan', icon: PenSquare },
        ...(!isAdmin ? [{ href: '/lapor-rusak', label: 'Lapor Rusak Seksi', icon: AlertTriangle }] : []),
        ...(!isAdmin ? [{ href: '/riwayat', label: 'Antrean Unit', icon: ScanLine }] : []),
      ],
    },
    {
      id: 'FLEET',
      title: 'PM Daisha',
      badge: 'PM & Armada',
      icon: Target,
      items: [
        { href: '/maintenance?tab=staging', label: 'Penjemputan PM', icon: Truck },
        { href: '/maintenance?tab=fleet', label: 'Katalog Armada', icon: Target },
        { href: '/maintenance?tab=logs', label: 'Riwayat PM', icon: ClipboardList },
        { href: '/catalog', label: 'Registri Daisha', icon: Layers },
      ],
    },
    {
      id: 'REQUEST',
      title: 'Request Seksi',
      badge: 'Proyek Unit',
      icon: SendHorizonal,
      items: [
        { href: '/request/tracking', label: 'Daftar Request', icon: ClipboardList },
        { href: '/request', label: 'Buat Request', icon: PlusCircle },
      ],
    },
    {
      id: 'SPAREPARTS',
      title: 'Stok Sparepart',
      badge: 'Gudang',
      icon: Package,
      items: [
        { href: '/spareparts', label: 'Inventaris Stok', icon: Package },
      ],
    },
    {
      id: 'USERS',
      title: 'Kelola Akun',
      badge: 'Akses',
      icon: Users,
      items: [
        { href: '/users', label: 'Daftar Akun', icon: Users },
      ],
    },
  ];

  // 4. Filter modul berdasarkan Hak Akses Role
  const getVisibleModules = (): ModuleDef[] => {
    if (isSeksi) {
      const seksiName = currentUser?.seksi || 'Plant';
      return [
        {
          id: 'KPI',
          title: 'KPI Seksi',
          badge: 'Analitik',
          icon: BarChart3,
          items: [
            { href: `/kpi?seksi=${encodeURIComponent(seksiName)}`, label: `KPI Seksi ${seksiName}`, icon: BarChart3 },
          ],
        },
        {
          id: 'DAISHA',
          title: 'Perbaikan Daisha',
          badge: 'Seksi Plant',
          icon: Wrench,
          items: [
            { href: '/lapor-rusak', label: 'Lapor Rusak', icon: AlertTriangle },
            { href: '/riwayat', label: 'Antrean Unit', icon: ScanLine },
          ],
        },
        {
          id: 'FLEET',
          title: 'PM Daisha',
          badge: 'Pemeliharaan',
          icon: Target,
          items: [
            { href: '/maintenance?tab=staging', label: 'Penjemputan PM', icon: Truck },
            { href: '/maintenance?tab=fleet', label: 'Katalog Armada', icon: Layers },
          ],
        },
        ...allModules.filter((m) => m.id === 'REQUEST'),
      ];
    }
    if (isOperator) {
      return [
        {
          id: 'DAISHA',
          title: 'Perbaikan Daisha',
          badge: 'Servis Unit',
          icon: Wrench,
          items: [
            { href: '/input', label: 'Input Kerusakan', icon: PenSquare },
            { href: '/riwayat', label: 'Antrean Unit', icon: ScanLine },
          ],
        },
        ...allModules.filter((m) => m.id === 'FLEET'),
      ];
    }
    // Admin memiliki akses ke seluruh modul
    return allModules;
  };

  const visibleModules = getVisibleModules();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-[transform,width,opacity] duration-300 ease-in-out shrink-0
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
        ${
          isDesktopCollapsed
            ? 'md:hidden md:w-0 md:opacity-0 md:-translate-x-full md:pointer-events-none md:overflow-hidden'
            : 'md:static md:translate-x-0 md:w-64 md:opacity-100 md:pointer-events-auto'
        }
      `}
    >
      {/* 1. Brand Logo & Collapse Toggle */}
      <div className="hidden md:flex p-4 border-b border-slate-800 flex-col items-center justify-center bg-slate-950 relative">
        {onToggleDesktopCollapse && (
          <button
            type="button"
            onClick={onToggleDesktopCollapse}
            className="absolute right-2.5 top-2.5 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            title="Sembunyikan Sidebar"
            aria-label="Sembunyikan Sidebar navigasi"
          >
            <Menu className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
        <div className="bg-white px-3 py-1.5 rounded-lg flex items-center justify-center">
          <Image
            src="/logo-bs.png"
            alt="Logo Bridgestone"
            width={130}
            height={32}
            className="h-6 w-auto object-contain"
            priority
          />
        </div>
        <div className="mt-2 flex flex-col items-center w-full">
          <span className="text-xs font-semibold text-slate-200 tracking-wide text-center">
            Workshop Management
          </span>
        </div>
      </div>

      {/* 2. User Info */}
      {currentUser && (
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2.5 bg-slate-950/60">
          <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center font-medium text-xs shrink-0">
            {currentUser.role === 'ADMIN' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            ) : currentUser.role === 'USER_SEKSI' ? (
              <Users className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate leading-tight">
              {currentUser.name || currentUser.username}
            </p>
            <span className="text-xs text-slate-400 font-normal">
              {currentUser.role === 'USER_SEKSI' ? 'User Seksi' : currentUser.role === 'ADMIN' ? 'Administrator' : 'Operator Workshop'}
            </span>
          </div>
        </div>
      )}

      {/* 3. Navigation Links (Accordion Per Modul) */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {/* Back to Portal Home Button (Admin) */}
        {isAdmin && (
          <div className="pb-2 border-b border-slate-800">
            <Link
              href="/"
              onClick={onCloseMobileMenu}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition group ${
                pathname === '/'
                  ? 'bg-red-600 text-white font-semibold'
                  : 'text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
              title="Kembali ke Portal Beranda"
            >
              <Home className={`w-3.5 h-3.5 transition group-hover:scale-105 ${pathname === '/' ? 'text-white' : 'text-slate-400'}`} />
              <span>Portal Beranda</span>
            </Link>
          </div>
        )}

        {/* Section Header */}
        <div className="px-1 pt-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu Operasional
          </span>
          <span className="text-xs font-mono text-slate-500">
            {visibleModules.length} Modul
          </span>
        </div>

        {/* Accordion List */}
        <div className="space-y-1.5">
          {visibleModules.map((module) => {
            const isExpanded =
              userToggled[module.id] !== undefined
                ? userToggled[module.id]
                : currentModule === module.id || (currentModule === '' && module.id === 'DAISHA');
            const isModuleActive = currentModule === module.id;
            const ModuleIcon = module.icon;

            return (
              <div
                key={module.id}
                className={`rounded-xl transition-all duration-200 border ${
                  isModuleActive
                    ? 'bg-slate-800/80 border-slate-700'
                    : 'bg-slate-900/60 border-transparent hover:border-slate-800 hover:bg-slate-850'
                }`}
              >
                {/* Accordion Header / Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-2.5 flex items-center justify-between gap-2 text-left transition cursor-pointer select-none group"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition ${
                        isModuleActive
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 group-hover:text-white group-hover:border-slate-600'
                      }`}
                    >
                      <ModuleIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold truncate transition ${
                            isModuleActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}
                        >
                          {module.title}
                        </span>
                        {isModuleActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        )}
                      </div>
                      <span className="block text-xs text-slate-400 font-normal truncate">
                        {module.badge}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isExpanded ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {/* Accordion Submenu Items */}
                {isExpanded && (
                  <div className="px-2 pb-2 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="border-l border-slate-750 ml-3.5 pl-2.5 space-y-1">
                      {module.items.map((subItem) => {
                        const isSubActive = (() => {
                          if (subItem.href.includes('?')) {
                            const [itemPath, itemQuery] = subItem.href.split('?');
                            if (pathname !== itemPath) return false;
                            const itemTab = new URLSearchParams(itemQuery).get('tab');
                            const currentTab = searchParams.get('tab') || 'dashboard';
                            return itemTab === currentTab;
                          }
                          return pathname === subItem.href && (!searchParams.get('tab') || searchParams.get('tab') === 'dashboard');
                        })();
                        const SubIcon = subItem.icon;

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={onCloseMobileMenu}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                              isSubActive
                                ? 'bg-red-600 text-white font-semibold'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <SubIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSubActive ? 'text-white' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 4. Bottom Actions: PWA & Logout */}
        <div className="pt-3 mt-3 border-t border-slate-800 space-y-2">
          <PwaInstaller buttonStyle="sidebar" />

          <button
            type="button"
            onClick={openLogoutModal}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-red-400 border border-transparent hover:border-slate-700 transition disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </nav>

      {/* 5. Footer */}
      <div className="p-3 border-t border-slate-800 text-xs text-center text-slate-500">
        PT Bridgestone Tire Indonesia
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
            ${props.isDesktopCollapsed ? 'md:hidden md:w-0' : 'md:static md:translate-x-0 md:w-64'}
          `}
          aria-hidden="true"
        />
      }
    >
      <SidebarInner {...props} />
    </Suspense>
  );
}
