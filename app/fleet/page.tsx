'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FleetPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/maintenance');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-slate-500 text-sm">
      Mengalihkan ke Modul Maintenance Daisha...
    </div>
  );
}
