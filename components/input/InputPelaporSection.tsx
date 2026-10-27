'use client';

import React from 'react';
import { User } from 'lucide-react';
import IndoDateTimeInput from '@/components/common/IndoDateTimeInput';
import { FormDataState } from './useInputKerusakan';

interface InputPelaporSectionProps {
  formData: FormDataState;
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
}

export default function InputPelaporSection({
  formData,
  setFormData,
  handleChange,
}: InputPelaporSectionProps) {
  return (
    <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80">
      <h2 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <User className="w-4 h-4 text-red-600" />
        <span>1. Pelapor</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="input-waktu-masuk"
            className="block text-xs font-medium text-slate-700 mb-1.5 cursor-pointer"
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

        <div>
          <label htmlFor="input-nama-pelapor" className="block text-xs font-medium text-slate-700 mb-1.5">
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
            placeholder="Ketik nama Anda…"
            required
            className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:border-red-600 placeholder:font-normal placeholder-slate-400"
          />
        </div>
      </div>
    </div>
  );
}
