'use client';

import React from 'react';
import { TicketStatus } from '@/types/ticket';
import { normalizeStatus } from '@/lib/ticketParser';

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

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[9px]'
      : 'px-2.5 py-1 text-[10px] sm:text-xs';

  switch (clean) {
    case 'Done':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Done</span>
        </span>
      );
    case 'Progress':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-black bg-blue-100 text-blue-800 border border-blue-200 shadow-xs ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Progress</span>
        </span>
      );
    case 'Scrap':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-black bg-rose-100 text-rose-800 border border-rose-200 shadow-xs ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Scrap</span>
        </span>
      );
    case 'Open':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-black bg-amber-100 text-amber-800 border border-amber-200 shadow-xs ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Open</span>
        </span>
      );
  }
}
