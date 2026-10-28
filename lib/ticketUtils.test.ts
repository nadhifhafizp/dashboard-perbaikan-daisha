import { describe, it, expect } from 'vitest';
import { validateTicketInput, buildTicketDamagePayload, isInvalidOperatorName } from './ticketUtils';

describe('lib/ticketUtils - Ticket Validation and Payload Builder', () => {
  describe('isInvalidOperatorName', () => {
    it('harus menolak nama operator placeholder atau kata default', () => {
      expect(isInvalidOperatorName('operator')).toBe(true);
      expect(isInvalidOperatorName('ADMIN')).toBe(true);
      expect(isInvalidOperatorName('user')).toBe(true);
      expect(isInvalidOperatorName('test')).toBe(true);
      expect(isInvalidOperatorName('contoh')).toBe(true);
      expect(isInvalidOperatorName('-')).toBe(true);
      expect(isInvalidOperatorName('   ')).toBe(true);
      expect(isInvalidOperatorName(null)).toBe(true);
      expect(isInvalidOperatorName(undefined)).toBe(true);
    });

    it('harus menerima nama operator teknisi asli', () => {
      expect(isInvalidOperatorName('Budi Santoso')).toBe(false);
      expect(isInvalidOperatorName('Rahmat Hidayat')).toBe(false);
      expect(isInvalidOperatorName('Dedi Kurniawan')).toBe(false);
    });
  });

  describe('validateTicketInput', () => {
    it('harus menolak jika nama pelapor kosong atau nama placeholder', () => {
      const result = validateTicketInput({
        namaPelapor: 'admin',
        seksi: 'Building',
        noDaisha: 'S-010',
        totalDamageCount: 1,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Harap isi nama Anda sebagai teknisi / operator pelapor');
    });

    it('harus menolak jika seksi belum dipilih', () => {
      const result = validateTicketInput({
        namaPelapor: 'Agus Setiawan',
        seksi: '',
        noDaisha: 'S-010',
        totalDamageCount: 1,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Harap pilih seksi asal unit Daisha');
    });

    it('harus menolak nomor Daisha kosong', () => {
      const result = validateTicketInput({
        namaPelapor: 'Agus Setiawan',
        seksi: 'Banbury',
        noDaisha: '',
        totalDamageCount: 1,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Harap isi atau scan nomor fisik unit Daisha');
    });

    it('harus menolak jika item kerusakan kosong dan bukan diagnosa bengkel', () => {
      const result = validateTicketInput({
        namaPelapor: 'Agus Setiawan',
        seksi: 'Building',
        noDaisha: 'S-010',
        isDiagnosaBengkel: false,
        totalDamageCount: 0,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Harap pilih minimal 1 kerusakan');
    });

    it('harus lolos jika semua data terisi dengan valid', () => {
      const result = validateTicketInput({
        namaPelapor: 'Agus Setiawan',
        seksi: 'Building',
        noDaisha: 'S-010',
        jenisDaisha: 'VERTICAL',
        totalDamageCount: 1,
      });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('harus lolos jika mode diagnosa bengkel aktif meskipun tanpa rincian katalog', () => {
      const result = validateTicketInput({
        namaPelapor: 'Agus Setiawan',
        seksi: 'Building',
        noDaisha: 'S-010',
        isDiagnosaBengkel: true,
        totalDamageCount: 0,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('buildTicketDamagePayload', () => {
    it('harus merangkai string keterangan kerusakan yang rapi dan seragam', () => {
      const payload = buildTicketDamagePayload({
        isDiagnosaBengkel: false,
        selectedKerusakan: ['Roda:::Pecah', 'Handle:::Bengkok'],
        tindakanMap: { 'Roda:::Pecah': 'Ganti', 'Handle:::Bengkok': 'Repair' },
        qtyMap: { 'Roda:::Pecah': 2, 'Handle:::Bengkok': 1 },
      });

      expect(payload.detail).toContain('1. [Roda] Pecah (Qty: 2, Tindakan: Ganti)');
      expect(payload.detail).toContain('2. [Handle] Bengkok (Qty: 1, Tindakan: Repair)');
      expect(payload.items).toHaveLength(2);
      expect(payload.items[0].tindakan).toBe('Ganti');
      expect(payload.items[0].qty).toBe(2);
    });

    it('harus menyusun format pemeriksaan bengkel jika isDiagnosaBengkel aktif', () => {
      const payload = buildTicketDamagePayload({
        isDiagnosaBengkel: true,
        catatanGejala: 'Troli berbunyi keras saat didorong',
        selectedKerusakan: [],
        tindakanMap: {},
        qtyMap: {},
      });

      expect(payload.kategoriKerusakan).toBe('Menunggu Diagnosa Bengkel');
      expect(payload.detail).toContain('Troli berbunyi keras saat didorong');
      expect(payload.items).toHaveLength(1);
      expect(payload.items[0].tindakan).toBe('Pemeriksaan');
    });
  });
});
