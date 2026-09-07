'use client';

import React from 'react';

export type TabType = 'all' | 'daisha' | 'damage' | 'throughput' | 'seksi' | 'table';

interface VisualFilterTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function VisualFilterTabs({
  activeTab,
  setActiveTab,
}: VisualFilterTabsProps) {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'all', label: 'Semua Visualisasi', icon: '🌟' },
    { id: 'daisha', label: 'Daisha & Frekuensi Unit', icon: '🛒' },
    { id: 'damage', label: 'Analisis Kerusakan', icon: '🔧' },
    { id: 'throughput', label: 'Tren & Lead Time', icon: '📈' },
    { id: 'seksi', label: 'Seksi & Pelapor', icon: '🏢' },
    { id: 'table', label: 'Tabel Data', icon: '📋' },
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300 overflow-x-auto pb-2 sm:pb-1.5 sm:flex-wrap">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400 font-extrabold'
              : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
