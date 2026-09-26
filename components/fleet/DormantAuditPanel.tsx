'use client';

import React, { useMemo, useState } from 'react';
import { FleetUnitItem } from '@/hooks/useFleetAnalytics';
import {
  RadioTower,
  AlertTriangle,
  ClipboardCheck,
  Building,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface DormantAuditPanelProps {
  dormantUnits: FleetUnitItem[];
  onSelectUnit: (unit: FleetUnitItem) => void;
}

export default function DormantAuditPanel({
  dormantUnits,
  onSelectUnit,
}: DormantAuditPanelProps) {
  const [copiedSeksi, setCopiedSeksi] = useState<string | null>(null);

  // Kelompokkan unit dormant berdasarkan seksi
  const groupedBySeksi = useMemo(() => {
    const map = new Map<string, FleetUnitItem[]>();
    dormantUnits.forEach((u) => {
      const s = u.seksi || 'LAINNYA';
      if (!map.has(s)) map.set(s, []);
      map.get(s)!.push(u);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [dormantUnits]);

  const handleCopyChecklist = (seksi: string, units: FleetUnitItem[]) => {
    const text = `CHECKLIST PATROLI WORKSHOP - SEKSI ${seksi}\nTanggal: ${new Date().toLocaleDateString('id-ID')}\nUnit Dicurigai Mengendap / Jarang Masuk (> 60 hari / 0 servis):\n` +
      units.map((u, i) => `${i + 1}. [ ] Unit ${u.noDaisha} (${u.namaDaisha}) - ${u.daysSinceLastService !== null ? `${u.daysSinceLastService} hari lalu` : 'Belum pernah ke bengkel'}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSeksi(seksi);
    setTimeout(() => setCopiedSeksi(null), 2500);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <RadioTower className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Audit Unit Tanpa Catatan Servis (&gt; 60 Hari)
            </h2>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              {dormantUnits.length} Unit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar unit troli yang tidak memiliki tiket masuk bengkel dalam 60 hari terakhir untuk keperluan patroli fisik lapangan.
          </p>
        </div>
      </div>

      {/* Grouped Breakdown by Seksi */}
      <div className="p-4 sm:p-5 space-y-4">
        {groupedBySeksi.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 rounded border border-dashed border-slate-200">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">Semua Unit Terpantau Aktif</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Tidak ditemukan unit daisha yang belum pernah atau tidak masuk servis lebih dari 60 hari.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedBySeksi.map(([seksi, units]) => (
              <div
                key={seksi}
                className="p-4 rounded-lg border border-slate-200 bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-500" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase">
                      Seksi {seksi}
                    </h3>
                    <span className="text-[11px] font-bold font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {units.length} Unit
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyChecklist(seksi, units)}
                    className="self-start sm:self-auto h-7 px-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSeksi === seksi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin ke Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Salin Daftar Patroli Seksi</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Units Grid */}
                <div className="flex flex-wrap gap-1.5">
                  {units.map((unit) => (
                    <button
                      key={unit.noDaisha}
                      type="button"
                      onClick={() => onSelectUnit(unit)}
                      className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-slate-50 hover:bg-red-50 text-slate-800 hover:text-[#E60012] border border-slate-200 hover:border-red-200 transition flex items-center gap-1.5 cursor-pointer"
                      title={`Klik untuk detail riwayat unit ${unit.noDaisha}`}
                    >
                      <span className="font-bold">{unit.noDaisha}</span>
                      <span className="text-slate-400 text-[11px]">
                        ({unit.daysSinceLastService !== null ? `${unit.daysSinceLastService}h` : '0x'})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
