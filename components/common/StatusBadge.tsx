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
  const sizeClass = size === 'sm' ? 'h-5 px-2 text-xs' : 'h-6 px-2.5 text-xs';

  switch (clean) {
    case 'Done':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-[#ECFDF5] text-[#065F46] border border-emerald-200/60 ${sizeClass} gap-1.5 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
          <span>Selesai</span>
        </span>
      );
    case 'Progress':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-[#FFFBEB] text-[#92400E] border border-amber-200/60 ${sizeClass} gap-1.5 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
          <span>Dikerjakan</span>
        </span>
      );
    case 'Pending':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-[#FFF7ED] text-[#C2410C] border border-orange-200/60 ${sizeClass} gap-1.5 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
          <span>Pending Part</span>
        </span>
      );
    case 'Scrap':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-[#FEF2F2] text-[#991B1B] border border-red-200/60 ${sizeClass} gap-1.5 ${className}`}>
          <Trash2 className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
          <span>Rusak (Scrap)</span>
        </span>
      );
    case 'Open':
    default:
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-[#EFF6FF] text-[#1E40AF] border border-blue-200/60 ${sizeClass} gap-1.5 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
          <span>Menunggu</span>
        </span>
      );
  }
}
