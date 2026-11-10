import { describe, it, expect } from 'vitest';

describe('Special Project Email & Workflow Evaluation Logic', () => {
  it('harus memfilter email agar hanya untuk SPV/Manager/Admin dan tidak untuk Seksi', () => {
    const rolesWithEmail = ['ADMIN', 'OPERATOR'];
    const rolesWithoutEmail = ['USER_SEKSI'];

    const canHaveEmail = (role: string) => !rolesWithoutEmail.includes(role);

    expect(canHaveEmail('ADMIN')).toBe(true);
    expect(canHaveEmail('OPERATOR')).toBe(true);
    expect(canHaveEmail('USER_SEKSI')).toBe(false);
  });

  it('harus memverifikasi bahwa status pengerjaan terbuka jika disetujui Atasan Special Project atau berstatus pengerjaan', () => {
    const checkIsApproved = (req: {
      statusApprovalAtasanSpecialProject?: string;
      ttdAtasanSpecialProject?: string | null;
      status?: string;
      flowStep?: string;
    }, formStatus?: string, formFlowStep?: string) => {
      if (req.statusApprovalAtasanSpecialProject === 'APPROVED') return true;
      if (req.ttdAtasanSpecialProject && req.ttdAtasanSpecialProject !== 'NONE' && req.ttdAtasanSpecialProject !== 'DITOLAK') return true;
      if (formStatus && ['Dikerjakan', 'Pending: Material Habis', 'Pekerjaan Fisik Selesai', 'Selesai'].includes(formStatus)) return true;
      if (formFlowStep && ['STEP_6_DALAM_PENGERJAAN', 'STEP_7_PEKERJAAN_SELESAI', 'STEP_8_SELESAI'].includes(formFlowStep)) return true;
      if (req.status && ['Dikerjakan', 'Pending: Material Habis', 'Pekerjaan Fisik Selesai', 'Selesai'].includes(req.status)) return true;
      if (req.flowStep && ['STEP_6_DALAM_PENGERJAAN', 'STEP_7_PEKERJAAN_SELESAI', 'STEP_8_SELESAI'].includes(req.flowStep)) return true;
      return false;
    };

    // Case 1: Status masih evaluasi awal -> Terkunci
    expect(checkIsApproved({
      statusApprovalAtasanSpecialProject: 'PENDING',
      ttdAtasanSpecialProject: null,
      status: 'Diajukan',
      flowStep: 'STEP_4_EVALUASI_WORKSHOP'
    })).toBe(false);

    // Case 2: Atasan Special Project ACC via approval link -> Terbuka
    expect(checkIsApproved({
      statusApprovalAtasanSpecialProject: 'APPROVED',
      ttdAtasanSpecialProject: 'VERIFIED_DIGITAL',
      status: 'Dikerjakan',
      flowStep: 'STEP_6_DALAM_PENGERJAAN'
    })).toBe(true);

    // Case 3: Admin Workshop klik Fast Track -> Form status langsung 'Dikerjakan' -> Langsung Terbuka tanpa lag
    expect(checkIsApproved({
      statusApprovalAtasanSpecialProject: 'PENDING',
      ttdAtasanSpecialProject: null,
      status: 'Diajukan',
      flowStep: 'STEP_4_EVALUASI_WORKSHOP'
    }, 'Dikerjakan', 'STEP_6_DALAM_PENGERJAAN')).toBe(true);

    // Case 4: Status Pekerjaan Fisik Selesai -> Tetap Terbuka
    expect(checkIsApproved({
      statusApprovalAtasanSpecialProject: 'APPROVED',
      status: 'Pekerjaan Fisik Selesai',
      flowStep: 'STEP_7_PEKERJAAN_SELESAI'
    })).toBe(true);
  });
});
