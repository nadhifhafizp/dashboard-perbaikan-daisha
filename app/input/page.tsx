'use client';

import React from 'react';
import FeedbackModal from '@/components/FeedbackModal';
import QrScannerModal from '@/components/input/QrScannerModal';
import ReviewTicketModal from '@/components/input/ReviewTicketModal';
import PrintTicketTagModal from '@/components/common/PrintTicketTagModal';

import { useInputKerusakan } from '@/components/input/useInputKerusakan';
import InputHeader from '@/components/input/InputHeader';
import InputPelaporSection from '@/components/input/InputPelaporSection';
import InputUnitSection from '@/components/input/InputUnitSection';
import InputDamageSection from '@/components/input/InputDamageSection';
import InputSubmitActions from '@/components/input/InputSubmitActions';

export default function InputKerusakanPage() {
  const {
    isAdmin,
    isOperator,
    formData,
    setFormData,
    handleChange,
    seksiList,
    pilihanDaishaTersedia,
    showAllDaisha,
    detectedSize,
    duplicateActiveTicket,
    normalizedNoDaisha,
    setDismissedDuplicateUnit,
    isScanning,
    setIsScanning,
    isDiagnosaBengkel,
    setIsDiagnosaBengkel,
    catatanGejala,
    setCatatanGejala,
    katalogKerusakan,
    selectedKerusakan,
    tindakanMap,
    qtyMap,
    customKerusakanList,
    customTindakanMap,
    customQtyMap,
    toggleKerusakan,
    setItemTindakan,
    setItemQty,
    handleAddCustom,
    handleRemoveCustom,
    setCustomTindakan,
    setCustomItemQty,
    loading,
    handleSubmit,
    executeSubmit,
    isReviewModalOpen,
    setIsReviewModalOpen,
    pendingPayload,
    feedback,
    setFeedback,
    showFeedback,
    isPrintTagOpen,
    setIsPrintTagOpen,
    createdTicketForTag,
  } = useInputKerusakan();

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 md:p-8 flex justify-center items-start pb-24 md:pb-10">
      <div className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200/80 w-full max-w-3xl">
        {/* Header Form dengan Breadcrumb & Quick Nav */}
        <InputHeader isAdmin={isAdmin} isOperator={isOperator} />

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Informasi Pelapor & Waktu */}
          <InputPelaporSection
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
          />

          {/* Section 2: Identifikasi Unit Daisha */}
          <InputUnitSection
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            seksiList={seksiList}
            pilihanDaishaTersedia={pilihanDaishaTersedia}
            showAllDaisha={showAllDaisha}
            detectedSize={detectedSize}
            duplicateActiveTicket={duplicateActiveTicket}
            normalizedNoDaisha={normalizedNoDaisha}
            setDismissedDuplicateUnit={setDismissedDuplicateUnit}
            setIsScanning={setIsScanning}
            isAdmin={isAdmin}
          />

          {/* Section 3: Status / Mode Kerusakan Unit & Katalog */}
          <InputDamageSection
            formData={formData}
            setFormData={setFormData}
            isDiagnosaBengkel={isDiagnosaBengkel}
            setIsDiagnosaBengkel={setIsDiagnosaBengkel}
            catatanGejala={catatanGejala}
            setCatatanGejala={setCatatanGejala}
            katalogKerusakan={katalogKerusakan}
            selectedKerusakan={selectedKerusakan}
            tindakanMap={tindakanMap}
            qtyMap={qtyMap}
            customKerusakanList={customKerusakanList}
            customTindakanMap={customTindakanMap}
            customQtyMap={customQtyMap}
            toggleKerusakan={toggleKerusakan}
            setItemTindakan={setItemTindakan}
            setItemQty={setItemQty}
            handleAddCustom={handleAddCustom}
            handleRemoveCustom={handleRemoveCustom}
            setCustomTindakan={setCustomTindakan}
            setCustomItemQty={setCustomItemQty}
          />

          {/* Action Buttons */}
          <InputSubmitActions
            isDiagnosaBengkel={isDiagnosaBengkel}
            isAdmin={isAdmin}
            isOperator={isOperator}
            loading={loading}
            onSubmit={handleSubmit}
          />
        </form>
      </div>

      {/* Camera QR/Barcode Scanner Modal */}
      <QrScannerModal
        isOpen={isScanning}
        onScanSuccess={(decoded) => {
          const upper = decoded.trim().toUpperCase();
          setFormData((prev) => ({ ...prev, noDaisha: upper }));
          setIsScanning(false);
          setDismissedDuplicateUnit(null);
          showFeedback(
            'success',
            'Barcode Terbaca',
            `Nomor Unit Daisha ${upper} berhasil terdeteksi otomatis.`,
            decoded
          );
        }}
        onClose={() => setIsScanning(false)}
        onError={(err) => {
          showFeedback('error', 'Izin Kamera Diperlukan', err);
          setIsScanning(false);
        }}
      />

      {/* Review Ringkasan Sebelum Kirim */}
      <ReviewTicketModal
        isOpen={isReviewModalOpen}
        payload={pendingPayload}
        isLoading={loading}
        onConfirm={executeSubmit}
        onCancel={() => setIsReviewModalOpen(false)}
      />

      {/* Interactive Feedback Modal */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        detail={feedback.detail}
        buttonText={feedback.buttonText}
        secondaryButtonText={feedback.secondaryButtonText}
        onSecondaryClick={feedback.onSecondaryClick}
        onClose={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Modal Cetak Tag Fisik Unit Daisha */}
      <PrintTicketTagModal
        isOpen={isPrintTagOpen}
        ticket={createdTicketForTag}
        onClose={() => setIsPrintTagOpen(false)}
      />
    </div>
  );
}