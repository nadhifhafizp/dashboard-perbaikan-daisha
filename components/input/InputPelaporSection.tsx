'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';
import IndoDateTimeInput from '@/components/common/IndoDateTimeInput';
import { FormDataState } from './useInputKerusakan';

interface InputPelaporSectionProps {
  formData: FormDataState;
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  seksiList: string[];
}

export default function InputPelaporSection({
  formData,
  setFormData,
  handleChange,
  seksiList,
}: InputPelaporSectionProps) {
  return (
    <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-red-600" />
        <span>1. Pelapor &amp; Seksi Asal</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label htmlFor="input-nama-pelapor" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nama Pelapor / Teknisi *
          </label>
          <input
            id="input-nama-pelapor"
            type="text"
            name="namaPelapor"
            autoComplete="name"
            value={formData.namaPelapor}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            placeholder="Ketik nama pelapor / teknisi..."
            required
            className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 placeholder:font-normal placeholder-slate-400"
          />
        </div>

        <div>
          <label htmlFor="input-seksi" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Seksi Asal Unit *
          </label>
          <select
            id="input-seksi"
            name="seksi"
            value={formData.seksi}
            onChange={handleChange}
            required
            className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
          >
            <option value="">-- Pilih Seksi --</option>
            {seksiList
              .filter((s) => s.toLowerCase() !== 'all seksi')
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="input-waktu-masuk"
            className="block text-xs font-semibold text-slate-700 mb-1.5 cursor-pointer"
          >
            Waktu Temuan / Masuk *
          </label>
          <IndoDateTimeInput
            id="input-waktu-masuk"
            value={formData.waktuMasuk}
            onChange={(val) => setFormData((prev) => ({ ...prev, waktuMasuk: val }))}
            required
          />
        </div>
      </div>
    </div>
  );
}
