'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, BellRing, Check, ExternalLink, Clock } from 'lucide-react';

interface NotificationItem {
  id: number;
  requestId: number;
  nomorRequest: string;
  tipe: string;
  judul: string;
  pesan: string;
  link?: string;
  isRead: boolean;
  waktu: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/section-requests/notifications');
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Abaikan jika offline / belum login
    }
  };

  useEffect(() => {
    void fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling setiap 15 detik
    return () => clearInterval(interval);
  }, []);

  // Tutup dropdown jika klik di luar atau tekan Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/section-requests/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all' }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Silent error
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
        title="Notifikasi Alur Request"
        aria-label="Notifikasi Request"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-scale-up">
          <div className="p-3.5 px-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <BellRing className="w-3.5 h-3.5 text-red-600" />
              <span>Notifikasi Request & Mentor</span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-medium">
                <Bell className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
                <p className="text-xs">Belum ada notifikasi baru</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 space-y-1 transition ${
                    n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-red-50/40 hover:bg-red-50/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-900 leading-tight">{n.judul}</span>
                    <span className="text-xs text-slate-400 shrink-0 tabular-nums">
                      {formatTime(n.waktu)}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{n.pesan}</p>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 pt-0.5"
                    >
                      <span>Buka Form</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
