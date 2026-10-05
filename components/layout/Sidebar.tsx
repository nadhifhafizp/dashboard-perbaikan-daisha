'use client';

import React, { useState, useEffect } from 'react';
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
  Menu,
  ScanLine,
  Layers,
  CalendarClock,
  Target,
  ChevronDown,
  Home,
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
  id: 'DAISHA' | 'FLEET' | 'REQUEST' | 'SPAREPARTS' | 'USERS';
  title: string;
  badge: string;
  icon: React.ElementType;
  items: SubMenuItem[];
}

export default function Sidebar({
  isMobileMenuOpen,
  onCloseMobileMenu,
  isDesktopCollapsed = false,
  onToggleDesktopCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, isOperator, isSeksi, isAdmin, openLogoutModal, isLoggingOut } = useAuth();

  // 1. Deteksi modul sistem aktif berdasarkan URL saat ini
  const getActiveModule = (path: string): 'DAISHA' | 'FLEET' | 'REQUEST' | 'SPAREPARTS' | 'USERS' | '' => {
    if (path.startsWith('/maintenance') || path.startsWith('/fleet') || path.startsWith('/catalog')) {
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

  // 3. Definisi 5 Modul Terstruktur Sesuai Kartu Portal
  const allModules: ModuleDef[] = [
    {
      id: 'DAISHA',
      title: 'Perbaikan Daisha',
      badge: 'Unit Maintenance',
      icon: Wrench,
      items: [
        { href: '/daisha', label: 'Dashboard Analitik', icon: LayoutDashboard },
        { href: '/input', label: 'Lapor Kerusakan', icon: PenSquare },
        { href: '/riwayat', label: 'Pelacakan & Antrean', icon: ScanLine },
        ...(isAdmin ? [{ href: '/admin', label: 'Panel Tindakan Bengkel', icon: Settings }] : []),
      ],
    },
    {
      id: 'FLEET',
      title: 'Modul Maintenance',
      badge: 'Annual KPI & Grid',
      icon: Target,
      items: [
        { href: '/maintenance', label: 'Target & Mapping Grid', icon: Target },
        { href: '/fleet', label: 'Kontrol Siklus Armada', icon: CalendarClock },
        { href: '/catalog', label: 'Master & Registri Daisha', icon: Layers },
      ],
    },
    {
      id: 'REQUEST',
      title: 'Request Seksi',
      badge: 'Special Project',
      icon: SendHorizonal,
      items: [
        { href: '/request', label: 'Dashboard & Tiket Request', icon: SendHorizonal },
      ],
    },
    {
      id: 'SPAREPARTS',
      title: 'Stok Sparepart',
      badge: 'Logistik Bengkel',
      icon: Package,
      items: [
        { href: '/spareparts', label: 'Monitoring & Inventaris', icon: Package },
      ],
    },
    {
      id: 'USERS',
      title: 'Manajemen Pengguna',
      badge: 'Sistem & Akses',
      icon: Users,
      items: [
        { href: '/users', label: 'Akun & Hak Akses', icon: Users },
      ],
    },
  ];

  // 4. Filter modul berdasarkan Hak Akses Role
  const getVisibleModules = (): ModuleDef[] => {
    if (isSeksi) {
      return allModules.filter((m) => m.id === 'REQUEST');
    }
    if (isOperator) {
      return [
        {
          id: 'DAISHA',
          title: 'Perbaikan Daisha',
          badge: 'Unit Maintenance',
          icon: Wrench,
          items: [
            { href: '/input', label: 'Lapor Kerusakan', icon: PenSquare },
            { href: '/riwayat', label: 'Pelacakan & Antrean', icon: ScanLine },
          ],
        },
      ];
    }
    // Admin memiliki akses ke semua 5 modul
    return allModules;
  };

  const visibleModules = getVisibleModules();

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-30 bg-[#4A0005] text-neutral-200 border-r border-[#3A0004] flex flex-col transition-all duration-300 ease-in-out shrink-0
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${isDesktopCollapsed ? 'md:w-0 md:opacity-0 md:-translate-x-full md:pointer-events-none md:overflow-hidden' : 'md:w-64 md:opacity-100'}
      `}
    >
      {/* 1. Brand Logo & Collapse Toggle */}
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

      {/* 2. User Info */}
      {currentUser && (
        <div className="px-4 py-2.5 border-b border-[#3A0004] flex items-center gap-2.5 bg-[#3D0004]/60">
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
            <p className="text-xs font-semibold text-white truncate leading-tight">
              {currentUser.name || currentUser.username}
            </p>
            <span className="text-[10px] text-red-200/70 font-normal">
              {currentUser.role === 'USER_SEKSI' ? 'User Seksi' : currentUser.role === 'ADMIN' ? 'Administrator' : 'Operator Workshop'}
            </span>
          </div>
        </div>
      )}

      {/* 3. Navigation Links (Accordion Per Modul) */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {/* Back to Portal Home Button (Admin) */}
        {isAdmin && (
          <div className="pb-2 border-b border-[#3A0004]">
            <Link
              href="/"
              onClick={onCloseMobileMenu}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition group ${
                pathname === '/'
                  ? 'bg-red-600 text-white font-semibold shadow-xs'
                  : 'text-red-100 bg-[#3D0004]/80 hover:bg-[#5E0007] hover:text-white border border-[#500006]'
              }`}
              title="Kembali ke Beranda Pilihan Modul"
            >
              <Home className={`w-3.5 h-3.5 transition group-hover:scale-110 ${pathname === '/' ? 'text-white' : 'text-red-300'}`} />
              <span>Portal Beranda (5 Modul)</span>
            </Link>
          </div>
        )}

        {/* Section Header */}
        <div className="px-1 pt-1 flex items-center justify-between">
          <span className="text-[10px] font-bold text-red-200/50 uppercase tracking-wider">
            Modul Operasional
          </span>
          <span className="text-[10px] font-mono text-red-200/40">
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
                    ? 'bg-[#3A0004]/90 border-red-500/30 shadow-2xs'
                    : 'bg-[#3A0004]/30 border-transparent hover:border-[#550007] hover:bg-[#3A0004]/60'
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
                          ? 'bg-red-600 text-white border-red-500 shadow-2xs'
                          : 'bg-[#2E0003] text-red-200 border-[#4D0006] group-hover:text-white group-hover:border-red-400/40'
                      }`}
                    >
                      <ModuleIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold truncate transition ${
                            isModuleActive ? 'text-white' : 'text-red-100 group-hover:text-white'
                          }`}
                        >
                          {module.title}
                        </span>
                        {isModuleActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        )}
                      </div>
                      <span className="block text-[10px] text-red-200/60 font-medium truncate">
                        {module.badge}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-red-300/70 transition-transform duration-200 shrink-0 ${
                      isExpanded ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {/* Accordion Submenu Items */}
                {isExpanded && (
                  <div className="px-2.5 pb-2.5 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="border-l-2 border-red-800/40 ml-3.5 pl-2.5 space-y-1">
                      {module.items.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        const SubIcon = subItem.icon;

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={onCloseMobileMenu}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                              isSubActive
                                ? 'bg-red-600 text-white font-semibold shadow-xs'
                                : 'text-red-100/75 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <SubIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSubActive ? 'text-white' : 'text-red-200/70'
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

      {/* 5. Footer */}
      <div className="p-3 border-t border-[#3A0004] text-[10px] text-center text-red-300/40">
        © 2026 PT Bridgestone
      </div>
    </aside>
  );
}
