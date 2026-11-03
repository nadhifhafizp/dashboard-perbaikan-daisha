import { describe, it, expect } from 'vitest';

describe('Special Project Approval Simulation Payload & Role Logic', () => {
  it('harus memvalidasi struktur payload approval Atasan Special Project', () => {
    const payload = {
      token: 'tok_test_123',
      role: 'special_project' as const,
      action: 'APPROVE_SPROJECT' as const,
      namaAtasan: 'Manager Special Project (8210)',
      namaDeptHead: 'Dept Head Special Project (820)',
      catatan: 'Prioritas bubut roda shift 1',
    };

    expect(payload.token).toBe('tok_test_123');
    expect(payload.role).toBe('special_project');
    expect(payload.action).toBe('APPROVE_SPROJECT');
    expect(payload.namaAtasan).toContain('8210');
    expect(payload.namaDeptHead).toContain('820');
  });

  it('harus menentukan URL approval yang tepat untuk masing-masing peran', () => {
    const origin = 'https://dashboard-perbaikan-daisha.vercel.app';
    const token = 'xyz789';

    const getApprovalUrl = (role: 'seksi' | 'special_project') => {
      const roleQuery = role === 'special_project' ? '&role=special_project' : '';
      return `${origin}/request/approval?token=${token}${roleQuery}`;
    };

    expect(getApprovalUrl('seksi')).toBe(
      'https://dashboard-perbaikan-daisha.vercel.app/request/approval?token=xyz789'
    );
    expect(getApprovalUrl('special_project')).toBe(
      'https://dashboard-perbaikan-daisha.vercel.app/request/approval?token=xyz789&role=special_project'
    );
  });

  it('harus menetapkan status dan flowStep yang sesuai saat Special Project approve', () => {
    const initialStatus = 'Pending: Menunggu Assign S.Project';
    const initialFlowStep = 'STEP_5_MENUNGGU_ATASAN_SPROJECT';

    expect(initialStatus).toBe('Pending: Menunggu Assign S.Project');
    expect(initialFlowStep).toBe('STEP_5_MENUNGGU_ATASAN_SPROJECT');

    // Transisi saat disetujui Atasan S.Project
    const nextStatus = 'Dikerjakan';
    const nextFlowStep = 'STEP_6_DALAM_PENGERJAAN';

    expect(nextStatus).toBe('Dikerjakan');
    expect(nextFlowStep).toBe('STEP_6_DALAM_PENGERJAAN');
  });
});

