'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SessionPayload } from '@/lib/auth';

interface AuthContextType {
  currentUser: SessionPayload | null;
  isLoading: boolean;
  isOperator: boolean;
  isAdmin: boolean;
  isLogoutModalOpen: boolean;
  isLoggingOut: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  executeLogout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [currentUser, setCurrentUser] = useState<SessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState(() => !isLoginPage);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Verifikasi sesi ke server dan update state pengguna.
   * Satu fungsi tunggal — dipakai oleh useEffect dan juga di-expose sebagai refreshAuth.
   */
  const checkAuth = useCallback(async () => {
    if (pathname === '/login') {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/login') {
      void checkAuth();
    }
  }, [pathname, checkAuth]);

  const executeLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const isOperator = currentUser?.role === 'OPERATOR';
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isOperator,
        isAdmin,
        isLogoutModalOpen,
        isLoggingOut,
        openLogoutModal: () => setIsLogoutModalOpen(true),
        closeLogoutModal: () => !isLoggingOut && setIsLogoutModalOpen(false),
        executeLogout,
        refreshAuth: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
