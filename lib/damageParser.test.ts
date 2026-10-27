import { describe, it, expect } from 'vitest';
import { parseTicketDamageDetail } from './damageParser';

describe('lib/damageParser — Damage Detail Parser', () => {
  it('harus mengurai string rincian kerusakan multi-item dengan benar', () => {
    const raw = '1. [Roda Putar] Roda aus (Qty: 2, Tindakan: Ganti) | 2. [Body daisha] Tiang bengkok (Qty: 1, Tindakan: Repair)';
    const result = parseTicketDamageDetail(raw);

    expect(result.items).toHaveLength(2);
    expect(result.hasStructuredItems).toBe(true);

    expect(result.items[0]).toEqual({
      komponen: 'Roda Putar',
      gejala: 'Roda aus',
      qty: 2,
      tindakan: 'Ganti',
      rawText: expect.any(String),
    });

    expect(result.items[1]).toEqual({
      komponen: 'Body daisha',
      gejala: 'Tiang bengkok',
      qty: 1,
      tindakan: 'Repair',
      rawText: expect.any(String),
    });

    expect(result.gantiItems).toHaveLength(1);
    expect(result.repairItems).toHaveLength(1);
    expect(result.totalQtyGanti).toBe(2);
    expect(result.totalQtyRepair).toBe(1);
    expect(result.totalQtyAll).toBe(3);
  });

  it('harus mendeteksi tiket yang menunggu diagnosa bengkel', () => {
    const raw = '1. [Menunggu Diagnosa Bengkel] Laporan Seksi: Rusak di plant (Qty: 1, Tindakan: Pemeriksaan)';
    const result = parseTicketDamageDetail(raw);

    expect(result.isWaitingDiagnosis).toBe(true);
  });

  it('harus menangani string kosong atau tanda strip "-" dengan anggun', () => {
    const emptyResult = parseTicketDamageDetail('');
    expect(emptyResult.items).toEqual([]);
    expect(emptyResult.totalQtyAll).toBe(0);
    expect(emptyResult.hasStructuredItems).toBe(false);

    const dashResult = parseTicketDamageDetail('-');
    expect(dashResult.items).toEqual([]);
  });
});
