'use client';

import React, { useState, useRef } from 'react';
import { formatDisplayDate, toDateTimeLocalValue, getInitialDateTime } from '@/lib/date';

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
  const getFallbackDisplay = () => formatDisplayDate(getInitialDateTime());

  // Format rapat standar Indonesia: "DD/MM/YYYY HH:mm"
  const toDisplay = (val: string) => {
    if (!val || val === '-') return getFallbackDisplay();
    const formatted = formatDisplayDate(val);
    if (!formatted || formatted === '-') return getFallbackDisplay();
    return formatted;
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
  const processedEventTimestamp = useRef<number>(0);

  const markProcessed = () => {
    processedEventTimestamp.current = Date.now();
  };

  const wasRecentlyProcessed = () => {
    return Date.now() - processedEventTimestamp.current < 50;
  };

  // Ekstraksi nilai angka dari display string saat ini
  const parseCurrent = () => {
    const clean = displayVal.trim().replace(/\s+/g, ' ');
    const [dPart = '01/01/2026', tPart = '12:00'] = clean.split(' ');
    const [d = '01', m = '01', y = '2026'] = dPart.split('/');
    const [h = '12', mn = '00'] = tPart.split(':');

    return {
      day: parseInt(d, 10) || 1,
      month: parseInt(m, 10) || 1,
      year: parseInt(y, 10) || 2026,
      hour: parseInt(h, 10) || 0,
      minute: parseInt(mn, 10) || 0,
    };
  };

  // Helper untuk mem-blok (highlight) segmen tertentu
  const moveToSegment = (seg: Segment) => {
    setActiveSegment(seg);
    setTypedBuffer('');
    const [start, end] = SEGMENT_RANGES[seg];
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(start, end);
      }
    });
  };

  // Tetap di segmen yang sama (pertahankan buffer)
  const reselectCurrent = (seg: Segment) => {
    const [start, end] = SEGMENT_RANGES[seg];
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(start, end);
      }
    });
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

  // Tangani ketikan angka secara universal (desktop, virtual keyboard mobile, dll)
  const processDigit = (digit: string) => {
    const current = parseCurrent();

    if (activeSegment === 'day') {
      if (!typedBuffer) {
        if (parseInt(digit, 10) > 3) {
          emitUpdate(parseInt(digit, 10), current.month, current.year, current.hour, current.minute);
          moveToSegment('month');
        } else {
          setTypedBuffer(digit);
          emitUpdate(parseInt(digit, 10) || 1, current.month, current.year, current.hour, current.minute);
          reselectCurrent('day');
        }
      } else {
        const combined = parseInt(`${typedBuffer}${digit}`, 10) || 1;
        const finalVal = Math.min(31, Math.max(1, combined));
        emitUpdate(finalVal, current.month, current.year, current.hour, current.minute);
        moveToSegment('month');
      }
    } else if (activeSegment === 'month') {
      if (!typedBuffer) {
        if (parseInt(digit, 10) > 1) {
          emitUpdate(current.day, parseInt(digit, 10), current.year, current.hour, current.minute);
          moveToSegment('year');
        } else {
          setTypedBuffer(digit);
          emitUpdate(current.day, parseInt(digit, 10) || 1, current.year, current.hour, current.minute);
          reselectCurrent('month');
        }
      } else {
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
  };

  const processBackspace = () => {
    setTypedBuffer('');
    if (activeSegment === 'minute') moveToSegment('hour');
    else if (activeSegment === 'hour') moveToSegment('year');
    else if (activeSegment === 'year') moveToSegment('month');
    else if (activeSegment === 'month') moveToSegment('day');
  };

  // Saat pertama kali fokus: langsung blok tanggal (DD)
  const handleFocus = () => {
    moveToSegment('day');
  };

  // Saat user mengklik / menyentuh bagian tertentu: blok segmen yang diklik
  const handleClickOrTouch = () => {
    if (inputRef.current) {
      const pos = inputRef.current.selectionStart ?? 0;
      const seg = getSegmentByPosition(pos);
      moveToSegment(seg);
    }
  };

  // Tangani ketikan keyboard fisik (Desktop / Laptop)
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

    // 3. Tombol Angka (0-9)
    if (/^\d$/.test(key)) {
      e.preventDefault();
      markProcessed();
      processDigit(key);
      return;
    }

    // 4. Backspace
    if (key === 'Backspace') {
      e.preventDefault();
      markProcessed();
      processBackspace();
      return;
    }

    if (key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  // Tangani input virtual keyboard di HP (Android Gboard, iOS keyboard, dll)
  const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const native = e.nativeEvent as InputEvent;
    if (!native) return;

    if (native.inputType === 'insertText' && native.data && /^\d+$/.test(native.data)) {
      e.preventDefault();
      markProcessed();
      for (const char of native.data) {
        processDigit(char);
      }
    } else if (native.inputType === 'deleteContentBackward') {
      e.preventDefault();
      markProcessed();
      processBackspace();
    }
  };

  // Fallback perubahan input teks
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (wasRecentlyProcessed()) return;

    const val = e.target.value;
    const digits = val.replace(/\D/g, '');
    if (digits.length > 0) {
      markProcessed();
      processDigit(digits[digits.length - 1]);
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
      try {
        if (typeof pickerRef.current.showPicker === 'function') {
          pickerRef.current.showPicker();
          return;
        }
      } catch {
        // Fallback jika showPicker dibatasi konteks
      }
      pickerRef.current.focus();
    }
  };

  // Shortcut tombol "Sekarang"
  const handleSetNow = () => {
    const nowIso = getInitialDateTime();
    onChange(nowIso);
    setDisplayVal(toDisplay(nowIso));
    setTypedBuffer('');
    moveToSegment('day');
  };

  const isoForPicker = toDateTimeLocalValue(value);

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Hidden input agar form standar menerima nilai ISO */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* Input Teks Tunggal: Mendukung keyboard HP (inputMode="numeric", tanpa readOnly) */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayVal}
        onFocus={handleFocus}
        onClick={handleClickOrTouch}
        onTouchEnd={handleClickOrTouch}
        onKeyDown={handleKeyDown}
        onBeforeInput={handleBeforeInput}
        onChange={handleChange}
        placeholder="DD/MM/YYYY HH:mm"
        required={required}
        autoComplete="off"
        className="w-full p-3 pr-28 border border-slate-300 rounded-xl text-xs text-slate-800 font-bold bg-white focus:ring-2 focus:ring-red-600 outline-none selection:bg-red-600 selection:text-white cursor-pointer focus:cursor-text"
      />

      {/* Action Buttons di Kanan: Shortcut "Sekarang" & Tombol Kalender */}
      <div className="absolute right-2 flex items-center gap-1">
        {/* Tombol Sekarang (Quick set current time) */}
        <button
          type="button"
          onClick={handleSetNow}
          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap"
          title="Set ke tanggal dan jam saat ini"
        >
          <span>⏱️</span>
          <span className="hidden sm:inline">Sekarang</span>
        </button>

        {/* Tombol Kalender dengan Picker Native */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={handleOpenPicker}
            className="p-1.5 text-slate-500 hover:text-slate-800 active:text-red-600 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center justify-center"
            title="Buka Kalender & Jam"
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

          {/* Input datetime-local bawaan yang menutupi tombol kalender agar touch di HP langsung memicu native picker */}
          <input
            ref={pickerRef}
            type="datetime-local"
            value={isoForPicker}
            onChange={handleNativePickerChange}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
          />
        </div>
      </div>
    </div>
  );
}
