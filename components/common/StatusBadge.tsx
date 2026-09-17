'use client';

import React from 'react';
import { TicketStatus } from '@/types/ticket';
import { normalizeStatus } from '@/lib/ticketParser';
import { CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react';

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
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs';

  switch (clean) {
    case 'Done':
      return (
        <span className={`inline-flex items-center rounded-full font-bold shadow-xs bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClass} gap-1.5 ${className}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Selesai</span>
        </span>
      );
    case 'Progress':
      return (
        <span className={`inline-flex items-center rounded-full font-bold shadow-xs bg-blue-50 text-blue-800 border border-blue-200/80 ${sizeClass} gap-1.5 ${className}`}>
          <Clock className="w-3 h-3 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Sedang Dikerjakan</span>
        </span>
      );
    case 'Scrap':
      return (
        <span className={`inline-flex items-center rounded-full font-bold shadow-xs bg-red-600 text-white border border-red-600 ${sizeClass} gap-1.5 ${className}`}>
          <Trash2 className="w-3 h-3 text-white" />
          <span>Rusak (Scrap)</span>
        </span>
      );
    case 'Open':
    default:
      return (
        <span className={`inline-flex items-center rounded-full font-bold shadow-xs bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClass} gap-1.5 ${className}`}>
          <AlertCircle className="w-3 h-3 text-amber-500" />
          <span>Open (Antre)</span>
        </span>
      );
  }
}
