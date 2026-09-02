'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import ConfirmModal from '@/components/ConfirmModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    isLogoutModalOpen,
    isLoggingOut,
    closeLogoutModal,
    executeLogout,
  } = useAuth();

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Mobile Top Navbar */}
      <MobileNav
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Backdrop saat Mobile Drawer terbuka */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-25 md:hidden backdrop-blur-xs"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pb-20 md:pb-0">
        {children}
      </main>

      {/* Global Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Konfirmasi Keluar (Logout)"
        message="Apakah Anda yakin ingin keluar dari akun sistem Daisha Maintenance?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        isLoading={isLoggingOut}
        loadingText="Keluar dari sesi..."
        onConfirm={executeLogout}
        onCancel={closeLogoutModal}
      />
    </div>
  );
}
