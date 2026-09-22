'use client';

import React from 'react';
import { TicketStatus } from '@/types/ticket';
import { normalizeStatus } from '@/lib/ticketParser';
import { CheckCircle2, Clock, AlertCircle, Trash2, XCircle, Wrench } from 'lucide-react';

interface StatusBadgeProps {
  status: TicketStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({
  status,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const clean = normalizeStatus(status);
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  switch (clean) {
    case 'Done':
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClass} gap-1.5 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Selesai</span>
        </span>
      );
    case 'Progress':
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-blue-50 text-blue-800 border border-blue-200/80 ${sizeClass} gap-1.5 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Sedang Dikerjakan</span>
        </span>
      );
    case 'Scrap':
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-red-50 text-red-800 border border-red-200/80 ${sizeClass} gap-1.5 ${className}`}>
          <Trash2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>Rusak (Scrap)</span>
        </span>
      );
    case 'Open':
    default:
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClass} gap-1.5 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Open (Antre)</span>
        </span>
      );
  }
}
