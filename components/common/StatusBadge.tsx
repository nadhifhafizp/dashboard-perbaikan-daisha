'use client';

import React from 'react';
import { TicketStatus } from '@/types/ticket';
import { normalizeStatus } from '@/lib/ticketParser';
import { Badge } from '@/components/ui/badge';
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
        <Badge variant="success" className={`${sizeClass} gap-1.5 font-bold shadow-xs ${className}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Done</span>
        </Badge>
      );
    case 'Progress':
      return (
        <Badge variant="info" className={`${sizeClass} gap-1.5 font-bold shadow-xs ${className}`}>
          <Clock className="w-3 h-3 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Progress</span>
        </Badge>
      );
    case 'Scrap':
      return (
        <Badge variant="destructive" className={`${sizeClass} gap-1.5 font-bold shadow-xs ${className}`}>
          <Trash2 className="w-3 h-3 text-white" />
          <span>Scrap</span>
        </Badge>
      );
    case 'Open':
    default:
      return (
        <Badge variant="warning" className={`${sizeClass} gap-1.5 font-bold shadow-xs ${className}`}>
          <AlertCircle className="w-3 h-3 text-amber-600" />
          <span>Open</span>
        </Badge>
      );
  }
}

