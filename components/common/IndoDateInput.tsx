'use client';

import React, { useRef } from 'react';
import { Calendar, X } from 'lucide-react';
import { parseToISODate } from '@/lib/date';

interface IndoDateInputProps {
  value: string; // Format ISO: YYYY-MM-DD atau string kosong
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function IndoDateInput({
  value,
  onChange,
  id,
  name,
  placeholder = 'Tanggal/ Bulan/ Tahun',
  className = '',
  disabled = false,
}: IndoDateInputProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  // Format ke standar Indonesia: Tanggal/ Bulan/ Tahun (DD / MM / YYYY)
  const displayValue = React.useMemo(() => {
    if (!value) return '';
    const iso = parseToISODate(value);
    if (!iso || !iso.includes('-')) return value;
    const [yyyy, mm, dd] = iso.split('-');
    return `${dd} / ${mm} / ${yyyy}`;
  }, [value]);

  const handleOpenPicker = () => {
    if (disabled) return;
    try {
      if (pickerRef.current && typeof pickerRef.current.showPicker === 'function') {
        pickerRef.current.showPicker();
      } else {
        pickerRef.current?.focus();
      }
    } catch {
      pickerRef.current?.focus();
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Input date bawaan browser tersembunyi untuk memunculkan popup kalender */}
      <input
        ref={pickerRef}
        type="date"
        id={id}
        name={name}
        value={value ? parseToISODate(value) : ''}
        onChange={handleNativeChange}
        disabled={disabled}
        className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Tampilan teks yang terkunci paten pada format Tanggal / Bulan / Tahun */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleOpenPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenPicker();
          }
        }}
        className={`w-full h-10 px-3 border border-slate-300 rounded-lg text-xs bg-white flex items-center justify-between transition cursor-pointer select-none hover:border-slate-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
        }`}
      >
        <span
          className={
            displayValue
              ? 'text-slate-900 font-semibold font-mono tracking-wide'
              : 'text-slate-400 font-normal'
          }
        >
          {displayValue || placeholder}
        </span>

        <div className="flex items-center gap-1.5 text-slate-400 ml-2">
          {displayValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-slate-700 rounded-md hover:bg-slate-100 transition cursor-pointer"
              title="Hapus tanggal"
              aria-label="Hapus tanggal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
        </div>
      </div>
    </div>
  );
}

