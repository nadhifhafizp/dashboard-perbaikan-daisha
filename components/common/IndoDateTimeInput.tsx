'use client';

import React, { useState, useRef } from 'react';
import { formatDisplayDate, toDateTimeLocalValue } from '@/lib/date';

interface IndoDateTimeInputProps {
  value: string; // Format ISO: YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  className?: string;
}

type Segment = 'day' | 'month' | 'year' | 'hour' | 'minute';

const SEGMENT_RANGES: Record<Segment, [number, number]> = {
  day: [0, 2],
  month: [3, 5],
  year: [6, 10],
  hour: [11, 13],
  minute: [14, 16],
};

export default function IndoDateTimeInput({
  value,
  onChange,
  name = 'waktuMasuk',
  required = false,
  className = '',
}: IndoDateTimeInputProps) {
  // Format rapat standar: "DD/MM/YYYY HH:mm"
  const toDisplay = (val: string) => {
    if (!val || val === '-') return '02/09/2026 12:00';
    return formatDisplayDate(val);
  };

  const [prevValue, setPrevValue] = useState(value);
  const [displayVal, setDisplayVal] = useState(() => toDisplay(value));
  const [activeSegment, setActiveSegment] = useState<Segment>('day');
  const [typedBuffer, setTypedBuffer] = useState<string>('');

  if (value !== prevValue) {
    setPrevValue(value);
    setDisplayVal(toDisplay(value));
  }

  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  // Ekstraksi nilai angka dari display string saat ini
  const parseCurrent = () => {
    const clean = displayVal.trim().replace(/\s+/g, ' ');
    const [dPart = '02/09/2026', tPart = '12:00'] = clean.split(' ');
    const [d = '02', m = '09', y = '2026'] = dPart.split('/');
    const [h = '12', mn = '00'] = tPart.split(':');

    return {
      day: parseInt(d, 10) || 2,
      month: parseInt(m, 10) || 9,
      year: parseInt(y, 10) || 2026,
      hour: parseInt(h, 10) || 12,
      minute: parseInt(mn, 10) || 0,
    };
  };

  // Helper untuk mem-blok (highlight) segmen tertentu
  // Pindah ke segmen baru (reset buffer)
  const moveToSegment = (seg: Segment) => {
    setActiveSegment(seg);
    setTypedBuffer('');
    const [start, end] = SEGMENT_RANGES[seg];
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(start, end);
      }
    }, 0);
  };

  // Tetap di segmen yang sama (pertahankan buffer)
  const reselectCurrent = (seg: Segment) => {
    const [start, end] = SEGMENT_RANGES[seg];
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(start, end);
      }
    }, 0);
  };

  // Tentukan segmen berdasarkan posisi kursor saat klik
  const getSegmentByPosition = (pos: number): Segment => {
    if (pos <= 2) return 'day';
    if (pos <= 5) return 'month';
    if (pos <= 10) return 'year';
    if (pos <= 13) return 'hour';
    return 'minute';
  };

  // Emit perubahan ke parent
  const emitUpdate = (
    newD: number,
    newM: number,
    newY: number,
    newH: number,
    newMn: number
  ) => {
    const dStr = String(Math.max(1, Math.min(31, newD))).padStart(2, '0');
    const mStr = String(Math.max(1, Math.min(12, newM))).padStart(2, '0');
    const yStr = String(Math.max(2000, Math.min(2100, newY)));
    const hStr = String(Math.max(0, Math.min(23, newH))).padStart(2, '0');
    const mnStr = String(Math.max(0, Math.min(59, newMn))).padStart(2, '0');

    const formatted = `${dStr}/${mStr}/${yStr} ${hStr}:${mnStr}`;
    setDisplayVal(formatted);
    onChange(`${yStr}-${mStr}-${dStr}T${hStr}:${mnStr}`);
  };

  // Saat pertama kali fokus: langsung blok tanggal (DD)
  const handleFocus = () => {
    moveToSegment('day');
  };

  // Saat user mengklik bagian tertentu: blok segmen yang diklik 1 per 1
  const handleMouseUp = () => {
    const pos = inputRef.current?.selectionStart ?? 0;
    const seg = getSegmentByPosition(pos);
    moveToSegment(seg);
  };

  // Tangani ketikan angka per segmen
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;

    // 1. Tombol Navigasi Panah Kiri / Kanan / Tab
    if (key === 'ArrowRight' || key === 'Tab') {
      if (key === 'ArrowRight') e.preventDefault();
      if (activeSegment === 'day') {
        if (key === 'Tab') e.preventDefault();
        moveToSegment('month');
      } else if (activeSegment === 'month') {
        if (key === 'Tab') e.preventDefault();
        moveToSegment('year');
      } else if (activeSegment === 'year') {
        if (key === 'Tab') e.preventDefault();
        moveToSegment('hour');
      } else if (activeSegment === 'hour') {
        if (key === 'Tab') e.preventDefault();
        moveToSegment('minute');
      }
      return;
    }

    if (key === 'ArrowLeft') {
      e.preventDefault();
      if (activeSegment === 'minute') moveToSegment('hour');
      else if (activeSegment === 'hour') moveToSegment('year');
      else if (activeSegment === 'year') moveToSegment('month');
      else if (activeSegment === 'month') moveToSegment('day');
      return;
    }

    // 2. Tombol Panah Atas / Bawah (Tambah / Kurang angka saat ini)
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      e.preventDefault();
      const current = parseCurrent();
      const delta = key === 'ArrowUp' ? 1 : -1;

      if (activeSegment === 'day') {
        let nextD = current.day + delta;
        if (nextD < 1) nextD = 31;
        if (nextD > 31) nextD = 1;
        emitUpdate(nextD, current.month, current.year, current.hour, current.minute);
        reselectCurrent('day');
      } else if (activeSegment === 'month') {
        let nextM = current.month + delta;
        if (nextM < 1) nextM = 12;
        if (nextM > 12) nextM = 1;
        emitUpdate(current.day, nextM, current.year, current.hour, current.minute);
        reselectCurrent('month');
      } else if (activeSegment === 'year') {
        const nextY = current.year + delta;
        emitUpdate(current.day, current.month, nextY, current.hour, current.minute);
        reselectCurrent('year');
      } else if (activeSegment === 'hour') {
        const nextH = (current.hour + delta + 24) % 24;
        emitUpdate(current.day, current.month, current.year, nextH, current.minute);
        reselectCurrent('hour');
      } else if (activeSegment === 'minute') {
        const nextMn = (current.minute + delta + 60) % 60;
        emitUpdate(current.day, current.month, current.year, current.hour, nextMn);
        reselectCurrent('minute');
      }
      return;
    }

    // 3. Tombol Angka (0-9): Ketik angka 2 digit & lompat otomatis ke segmen berikutnya!
    if (/^\d$/.test(key)) {
      e.preventDefault();
      const digit = key;
      const current = parseCurrent();

      if (activeSegment === 'day') {
        if (!typedBuffer) {
          if (parseInt(digit, 10) > 3) {
            // Angka 4-9: langsung set 04-09 dan lompat ke bulan
            emitUpdate(parseInt(digit, 10), current.month, current.year, current.hour, current.minute);
            moveToSegment('month');
          } else {
            // Angka pertama (0, 1, 2, 3), simpan di buffer untuk digit kedua
            setTypedBuffer(digit);
            emitUpdate(parseInt(digit, 10) || 1, current.month, current.year, current.hour, current.minute);
            reselectCurrent('day');
          }
        } else {
          // Angka kedua (misal ketik '1' lalu '5' -> '15', atau '2' lalu '8' -> '28')
          const combined = parseInt(`${typedBuffer}${digit}`, 10) || 1;
          const finalVal = Math.min(31, Math.max(1, combined));
          emitUpdate(finalVal, current.month, current.year, current.hour, current.minute);
          moveToSegment('month');
        }
      } else if (activeSegment === 'month') {
        if (!typedBuffer) {
          if (parseInt(digit, 10) > 1) {
            // Angka 2-9: langsung set 02-09 dan lompat ke tahun
            emitUpdate(current.day, parseInt(digit, 10), current.year, current.hour, current.minute);
            moveToSegment('year');
          } else {
            // Angka 0 atau 1, simpan di buffer untuk digit kedua
            setTypedBuffer(digit);
            emitUpdate(current.day, parseInt(digit, 10) || 1, current.year, current.hour, current.minute);
            reselectCurrent('month');
          }
        } else {
          // Angka kedua (misal ketik '1' lalu '2' -> '12', atau '0' lalu '8' -> '08')
          const combined = parseInt(`${typedBuffer}${digit}`, 10) || 1;
          const finalVal = Math.min(12, Math.max(1, combined));
          emitUpdate(current.day, finalVal, current.year, current.hour, current.minute);
          moveToSegment('year');
        }
      } else if (activeSegment === 'year') {
        const nextBuf = `${typedBuffer}${digit}`;
        if (nextBuf.length < 4) {
          setTypedBuffer(nextBuf);
          reselectCurrent('year');
        } else {
          const val = parseInt(nextBuf, 10) || 2026;
          emitUpdate(current.day, current.month, val, current.hour, current.minute);
          moveToSegment('hour');
        }
      } else if (activeSegment === 'hour') {
        if (!typedBuffer) {
          if (parseInt(digit, 10) > 2) {
            emitUpdate(current.day, current.month, current.year, parseInt(digit, 10), current.minute);
            moveToSegment('minute');
          } else {
            setTypedBuffer(digit);
            emitUpdate(current.day, current.month, current.year, parseInt(digit, 10), current.minute);
            reselectCurrent('hour');
          }
        } else {
          const combined = parseInt(`${typedBuffer}${digit}`, 10) || 0;
          const finalVal = Math.min(23, combined);
          emitUpdate(current.day, current.month, current.year, finalVal, current.minute);
          moveToSegment('minute');
        }
      } else if (activeSegment === 'minute') {
        if (!typedBuffer) {
          if (parseInt(digit, 10) > 5) {
            emitUpdate(current.day, current.month, current.year, current.hour, parseInt(digit, 10));
            reselectCurrent('minute');
          } else {
            setTypedBuffer(digit);
            emitUpdate(current.day, current.month, current.year, current.hour, parseInt(digit, 10));
            reselectCurrent('minute');
          }
        } else {
          const combined = parseInt(`${typedBuffer}${digit}`, 10) || 0;
          const finalVal = Math.min(59, combined);
          emitUpdate(current.day, current.month, current.year, current.hour, finalVal);
          reselectCurrent('minute');
        }
      }
      return;
    }

    // 4. Backspace
    if (key === 'Backspace') {
      e.preventDefault();
      setTypedBuffer('');
      if (activeSegment === 'minute') moveToSegment('hour');
      else if (activeSegment === 'hour') moveToSegment('year');
      else if (activeSegment === 'year') moveToSegment('month');
      else if (activeSegment === 'month') moveToSegment('day');
      return;
    }

    if (key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  // Handler saat memilih tanggal dari kalender bawaan
  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.value;
    if (picked) {
      onChange(picked);
      setDisplayVal(toDisplay(picked));
    }
  };

  const handleOpenPicker = () => {
    if (pickerRef.current) {
      if (typeof pickerRef.current.showPicker === 'function') {
        pickerRef.current.showPicker();
      } else {
        pickerRef.current.focus();
      }
    }
  };

  const isoForPicker = toDateTimeLocalValue(value);

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Hidden input agar form standar menerima nilai ISO */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* Input Teks Tunggal: Tampilan Rapat Bersih (Tanpa Jeda) & Otomatis Ngeblok 1 per 1 */}
      <input
        ref={inputRef}
        type="text"
        value={displayVal}
        onFocus={handleFocus}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        readOnly // Input dikendalikan via keyboard handler agar pem-blokan segmen 1 per 1 sempurna
        placeholder="DD/MM/YYYY HH:mm"
        required={required}
        className="w-full p-3 pr-10 border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold bg-white focus:ring-2 focus:ring-red-600 outline-none selection:bg-red-600 selection:text-white cursor-pointer focus:cursor-text"
      />

      {/* Icon Kalender di Kanan */}
      <div className="absolute right-3 flex items-center justify-center">
        <button
          type="button"
          onClick={handleOpenPicker}
          className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5 rounded hover:bg-slate-100 flex items-center justify-center"
          title="Buka Kalender"
          tabIndex={-1}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Input datetime-local bawaan tersembunyi */}
        <input
          ref={pickerRef}
          type="datetime-local"
          value={isoForPicker}
          onChange={handleNativePickerChange}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 opacity-0 w-6 h-6 cursor-pointer"
        />
      </div>
    </div>
  );
}
