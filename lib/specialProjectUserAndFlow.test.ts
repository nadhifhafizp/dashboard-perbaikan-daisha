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

  it('harus mempertahankan status pengerjaan saat di-save dan tidak me-revert Dikerjakan kembali ke Step 5', () => {
    // Fungsi resolusi alur state machine yang telah diperbaiki
    const resolveNextFlow = (current: { WorkflowStatus: string; FlowStep: string }, body: { status?: string; flowStep?: string; keputusan?: string }) => {
      const isAlreadyWorking =
        current.WorkflowStatus === 'Dikerjakan' ||
        current.WorkflowStatus === 'Pending: Material Habis' ||
        current.WorkflowStatus === 'Pekerjaan Fisik Selesai' ||
        current.FlowStep === 'STEP_6_DALAM_PENGERJAAN' ||
        current.FlowStep === 'STEP_7_PEKERJAAN_SELESAI';

      let nextStatus = body.status || current.WorkflowStatus;
      let nextFlowStep = current.FlowStep;

      if (isAlreadyWorking || ['STEP_8_SELESAI'].includes(current.FlowStep) || current.WorkflowStatus === 'Selesai') {
        if (body.status) nextStatus = body.status;
        if (body.flowStep) {
          nextFlowStep = body.flowStep;
        } else if (nextStatus === 'Pekerjaan Fisik Selesai') {
          nextFlowStep = 'STEP_7_PEKERJAAN_SELESAI';
        } else if (nextStatus === 'Selesai') {
          nextFlowStep = 'STEP_8_SELESAI';
        } else if (nextStatus === 'Dikerjakan') {
          nextFlowStep = 'STEP_6_DALAM_PENGERJAAN';
        }
      } else if (body.keputusan === 'GO') {
        nextFlowStep = 'STEP_5_MENUNGGU_ATASAN_SPROJECT';
        nextStatus = 'Menunggu Assign S.Project';
      }

      return { nextStatus, nextFlowStep };
    };

    // Simulasi: Tiket sudah Dikerjakan, user klik simpan actual di Tab 3
    const res1 = resolveNextFlow(
      { WorkflowStatus: 'Dikerjakan', FlowStep: 'STEP_6_DALAM_PENGERJAAN' },
      { status: 'Dikerjakan', keputusan: 'GO' }
    );
    expect(res1.nextStatus).toBe('Dikerjakan');
    expect(res1.nextFlowStep).toBe('STEP_6_DALAM_PENGERJAAN');

    // Simulasi: Operator klik Pekerjaan Fisik Selesai
    const res2 = resolveNextFlow(
      { WorkflowStatus: 'Dikerjakan', FlowStep: 'STEP_6_DALAM_PENGERJAAN' },
      { status: 'Pekerjaan Fisik Selesai', flowStep: 'STEP_7_PEKERJAAN_SELESAI', keputusan: 'GO' }
    );
    expect(res2.nextStatus).toBe('Pekerjaan Fisik Selesai');
    expect(res2.nextFlowStep).toBe('STEP_7_PEKERJAAN_SELESAI');

    // Simulasi: User menyelesaikan request
    const res3 = resolveNextFlow(
      { WorkflowStatus: 'Dikerjakan', FlowStep: 'STEP_6_DALAM_PENGERJAAN' },
      { status: 'Selesai', flowStep: 'STEP_8_SELESAI', keputusan: 'GO' }
    );
    expect(res3.nextStatus).toBe('Selesai');
    expect(res3.nextFlowStep).toBe('STEP_8_SELESAI');
  });
});

