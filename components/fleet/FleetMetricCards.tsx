'use client';

import React from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RadioTower,
  Wrench,
} from 'lucide-react';

interface FleetMetricCardsProps {
  totalFleetUnits: number;
  healthyUnits: number;
  dueSoonUnits: number;
  overdueUnits: number;
  dormantUnits: number;
  inWorkshopUnits: number;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export default function FleetMetricCards({
  totalFleetUnits,
  healthyUnits,
  dueSoonUnits,
  overdueUnits,
  dormantUnits,
  inWorkshopUnits,
  activeFilter,
  onSelectFilter,
}: FleetMetricCardsProps) {
  const cards = [
    {
      id: 'ALL',
      title: 'Total Armada',
      count: totalFleetUnits,
      icon: Layers,
      iconColor: 'text-slate-700',
      activeColor: 'border-slate-800 ring-slate-800 bg-slate-50',
    },
    {
      id: 'HEALTHY',
      title: 'Terawat Rutin',
      count: healthyUnits,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      activeColor: 'border-emerald-600 ring-emerald-600 bg-emerald-50/50',
    },
    {
      id: 'OVERDUE',
      title: 'Overdue Servis',
      count: overdueUnits,
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
      activeColor: 'border-rose-600 ring-rose-600 bg-rose-50/50',
    },
    {
      id: 'IN_WORKSHOP',
      title: 'Sedang di Bengkel',
      count: inWorkshopUnits,
      icon: Wrench,
      iconColor: 'text-blue-600',
      activeColor: 'border-blue-600 ring-blue-600 bg-blue-50/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;
        const Icon = card.icon;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(isSelected ? 'ALL' : card.id)}
            className={`
              p-3.5 sm:p-4 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between
              ${
                isSelected
                  ? `${card.activeColor} ring-1`
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
              }
            `}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 shrink-0 ${card.iconColor}`} />
            </div>

            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight block leading-none">
                {card.count.toLocaleString('id-ID')}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

