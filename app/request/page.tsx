'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RequestAnalyticsDashboard from '@/components/request/RequestAnalyticsDashboard';
import { SectionRequestFull } from '@/components/request/BridgestoneRequestPrintModal';
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  SendHorizonal,
} from 'lucide-react';

export default function RequestAnalyticsPage() {
  const router = useRouter();
  const { isAdmin, currentUser, isLoading: authLoading } = useAuth();

  const [requests, setRequests] = useState<SectionRequestFull[]>([]);
  const [loading, setLoading] = useState(true);

  // Sesi guard: jika belum login, arahkan ke login
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login?from=/request');
    }
  }, [authLoading, currentUser, router]);

  // Fetch all requests
  const fetchRequests = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch('/api/section-requests');
      if (res.status === 401) {
        router.replace('/login?from=/request');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const handleFilterByStatus = (statusKey: string) => {
    router.push(`/request/tracking?status=${encodeURIComponent(statusKey)}`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-5">
      {/* 1. Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          {isAdmin && (
            <div className="flex items-center gap-2 mb-2 text-xs">
              <Link
                href="/"
                className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Portal</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-900">
                Request Seksi
              </span>
            </div>
          )}
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-red-600" />
            <span>Dashboard Request Seksi</span>
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Special Project & Modifikasi Antar Seksi
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Link
            href="/request/tracking?new=true"
            className="min-h-[44px] sm:min-h-0 h-8.5 px-3.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Request Baru</span>
          </Link>

          <Link
            href="/request/tracking"
            className="min-h-[44px] sm:min-h-0 h-8.5 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>Daftar Pelacakan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => fetchRequests(true)}
            disabled={loading}
            className="min-h-[44px] sm:min-h-0 h-8.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-300 transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Segarkan data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Memuat...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs (Pills: Dashboard vs Tracking) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pt-1">
        <div className="pb-2.5 px-3 text-xs font-bold text-red-600 border-b-2 border-red-600 flex items-center gap-1.5">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard Analitik Request</span>
        </div>
        <Link
          href="/request/tracking"
          className="pb-2.5 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 border-b-2 border-transparent"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Daftar Pelacakan & Antrean ({requests.length})</span>
        </Link>
      </div>

      {/* 3. Analytics Dashboard Body */}
      {loading && !requests.length ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Memuat analitik permohonan antar seksi...</p>
        </div>
      ) : (
        <RequestAnalyticsDashboard
          requests={requests}
          onFilterByStatus={handleFilterByStatus}
        />
      )}
    </div>
  );
}
