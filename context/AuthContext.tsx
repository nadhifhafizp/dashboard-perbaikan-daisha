'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SessionPayload } from '@/lib/auth';

interface AuthContextType {
  currentUser: SessionPayload | null;
  isLoading: boolean;
  isOperator: boolean;
  isAdmin: boolean;
  isSeksi: boolean;
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

  // Durasi timeout idle: 30 menit tanpa aktivitas pengguna
  const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
  const lastActivityRef = React.useRef<number>(Date.now());

  // Handle auto logout saat idle
  const handleIdleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Idle logout error:', err);
    } finally {
      setCurrentUser(null);
      router.push('/login?reason=idle');
      router.refresh();
    }
  }, [router]);

  // Pantau aktivitas pengguna (mouse, keyboard, scroll, touch)
  useEffect(() => {
    if (pathname === '/login' || !currentUser) return;

    // Reset waktu aktivitas saat user pertama terautentikasi
    lastActivityRef.current = Date.now();

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    
    // Throttle listener agar efisien (maksimal catat tiap 2 detik)
    let lastRecorded = 0;
    const throttledHandler = () => {
      const now = Date.now();
      if (now - lastRecorded > 2000) {
        lastRecorded = now;
        recordActivity();
      }
    };

    events.forEach((evt) => {
      window.addEventListener(evt, throttledHandler, { passive: true });
    });

    // Pengecekan interval berkala setiap 15 detik
    const timerInterval = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS) {
        clearInterval(timerInterval);
        void handleIdleLogout();
      }
    }, 15000);

    // Cek juga saat tab kembali dilihat (misal setelah laptop sleep / ganti tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS) {
          clearInterval(timerInterval);
          void handleIdleLogout();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, throttledHandler);
      });
      clearInterval(timerInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname, currentUser, handleIdleLogout, IDLE_TIMEOUT_MS]);

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
  const isSeksi = currentUser?.role === 'USER_SEKSI';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isOperator,
        isAdmin,
        isSeksi,
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

