'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';
import FeedbackModal from '@/components/FeedbackModal';
import BridgestoneRequestPrintModal from '@/components/request/BridgestoneRequestPrintModal';
import EvaluationModal from '@/components/request/EvaluationModal';
import {
  ClipboardList,
  AlertTriangle,
  Plus,
  ArrowLeft,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { useSectionRequests } from '@/components/request/tracking/useSectionRequests';
import RequestCreateFormModal from '@/components/request/tracking/RequestCreateFormModal';
import SubmittedSuccessModal from '@/components/request/tracking/SubmittedSuccessModal';
import ShareApprovalModal from '@/components/request/tracking/ShareApprovalModal';
import RequestFilterBar from '@/components/request/tracking/RequestFilterBar';
import RequestTable from '@/components/request/tracking/RequestTable';

function RequestTrackingContent() {
  const {
    isAdmin,
    currentUser,
    requests,
    filtered,
    loading,
    filterFlow,
    setFilterFlow,
    search,
    setSearch,
    showForm,
    setShowForm,
    submitting,
    formData,
    setFormData,
    submittedData,
    setSubmittedData,
    printModalRequest,
    setPrintModalRequest,
    openPrintModal,
    evalModalRequest,
    setEvalModalRequest,
    openEvalModal,
    shareApprovalRequest,
    setShareApprovalRequest,
    requestToDelete,
    setRequestToDelete,
    feedback,
    showFeedback,
    closeFeedback,
    handleSubmit,
    confirmDelete,
    fetchRequests,
  } = useSectionRequests();

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-5">
      {/* 1. Page Header (Flat Layout) */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-200">
        <div className="space-y-1">
          {isAdmin && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-1 text-xs">
              <Link
                href="/"
                className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Portal</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-900">Request Seksi</span>
            </nav>
          )}
          <h1 className="t-title text-slate-900 tracking-tight">Antrean Request</h1>
          <p className="t-caption text-slate-500">
            Status formulir pekerjaan antar seksi
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {!isAdmin && (
            <Link
              href="/lapor-rusak"
              className="h-11 sm:h-10 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
              <span>Lapor Rusak</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="h-11 sm:h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Tutup Formulir' : 'Buat Request'}</span>
          </button>
          <button
            type="button"
            onClick={() => fetchRequests(true)}
            disabled={loading}
            className="h-11 sm:h-10 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Memuat...' : 'Segarkan'}</span>
          </button>
        </div>
      </header>

      {/* 2. Top Navigation Tabs (Pills: Dashboard vs Tracking) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pt-1">
        <Link
          href="/kpi?tab=request"
          className="pb-2.5 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 border-b-2 border-transparent"
        >
          <BarChart3 className="w-3.5 h-3.5 text-red-600" />
          <span>KPI Request</span>
        </Link>
        <div className="pb-2.5 px-3 text-xs font-bold text-red-600 border-b-2 border-red-600 flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Antrean Request ({requests.length})</span>
        </div>
      </div>

      {/* 3. Formulir Input Request Baru (ENG-KP-011) */}
      {showForm && (
        <RequestCreateFormModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          submitting={submitting}
          currentUser={currentUser}
          onClose={() => setShowForm(false)}
          onError={(title, message) => showFeedback('error', title, message)}
        />
      )}

      {/* 4. Filter Tabs & Table/Cards */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <RequestFilterBar
          filterFlow={filterFlow}
          setFilterFlow={setFilterFlow}
          search={search}
          setSearch={setSearch}
        />
        <RequestTable
          requests={requests}
          filtered={filtered}
          loading={loading}
          isAdmin={isAdmin}
          onResetFilter={() => setFilterFlow('all')}
          onOpenPrint={(req) => void openPrintModal(req)}
          onOpenEval={(req) => void openEvalModal(req)}
          onOpenShareApproval={(req) => setShareApprovalRequest(req)}
          onRequestDelete={(req) => setRequestToDelete(req)}
        />
      </div>

      {/* 5. Modals */}
      <SubmittedSuccessModal
        data={submittedData}
        onClose={() => setSubmittedData(null)}
      />

      <ShareApprovalModal
        request={shareApprovalRequest}
        onClose={() => setShareApprovalRequest(null)}
      />

      <BridgestoneRequestPrintModal
        isOpen={!!printModalRequest}
        requestData={printModalRequest}
        onClose={() => setPrintModalRequest(null)}
      />

      <EvaluationModal
        isOpen={!!evalModalRequest}
        requestData={evalModalRequest}
        onClose={() => setEvalModalRequest(null)}
        onSuccess={() => {
          showFeedback(
            'success',
            'Alur Flowchart Diperbarui',
            'Data evaluasi & status pengerjaan bengkel berhasil diperbarui.'
          );
          void fetchRequests();
        }}
      />

      <ConfirmModal
        isOpen={!!requestToDelete}
        title="Hapus Pengajuan Request"
        message={`Apakah Anda yakin ingin menghapus request "${requestToDelete?.nomorRequest}" (${requestToDelete?.perihal || requestToDelete?.namaBarang})?`}
        confirmText="Hapus Pengajuan"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setRequestToDelete(null)}
      />

      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={closeFeedback}
      />
    </div>
  );
}

export default function RequestTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
          <span>Memuat antrean request...</span>
        </div>
      }
    >
      <RequestTrackingContent />
    </Suspense>
  );
}
