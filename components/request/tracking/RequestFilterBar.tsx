'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { FlowchartFilter } from './types';

interface RequestFilterBarProps {
  filterFlow: FlowchartFilter;
  setFilterFlow: (filter: FlowchartFilter) => void;
  search: string;
  setSearch: (search: string) => void;
}

const TABS: { id: FlowchartFilter; label: string }[] = [
  { id: 'all', label: 'Semua Request' },
  { id: 'waiting_atasan', label: 'Menunggu Assign Atasan' },
  { id: 'workshop', label: 'Diterima Workshop' },
  { id: 'process', label: 'Dalam Pengerjaan' },
  { id: 'pending_material', label: 'Pending Material' },
  { id: 'completed', label: 'Selesai' },
  { id: 'rejected', label: 'Ditolak' },
];

export default function RequestFilterBar({
  filterFlow,
  setFilterFlow,
  search,
  setSearch,
}: RequestFilterBarProps) {
  return (
    <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center justify-between">
      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
        {TABS.map((tab) => {
          const isActive = filterFlow === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterFlow(tab.id)}
              className={`h-10 px-3.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="relative w-full sm:w-72">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nomor, perihal, mesin, seksi..."
          className="w-full h-10 pl-8 pr-3 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-red-600 outline-none text-slate-900 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
