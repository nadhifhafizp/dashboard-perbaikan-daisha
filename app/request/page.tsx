'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RequestRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/kpi?tab=request');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-2.5">
        <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Mengarahkan ke Pusat Dashboard & KPI Request...</p>
      </div>
    </div>
  );
}
