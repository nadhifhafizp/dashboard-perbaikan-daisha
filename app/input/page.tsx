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
    matchedUnitInfo,
    applyMatchedUnit,
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
    setCreatedTicketForTag,
  } = useInputKerusakan();

  const totalDamageCount = selectedKerusakan.length + customKerusakanList.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* Header Form dengan Breadcrumb & Quick Nav */}
      <InputHeader isAdmin={isAdmin} isOperator={isOperator} />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Identifikasi Unit & Informasi Pelapor (5 Kolom) */}
          <div className="lg:col-span-5 space-y-5">
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
              matchedUnitInfo={matchedUnitInfo}
              applyMatchedUnit={applyMatchedUnit}
              setDismissedDuplicateUnit={setDismissedDuplicateUnit}
              setIsScanning={setIsScanning}
              isAdmin={isAdmin}
            />

            <InputPelaporSection
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
            />

            {/* Desktop Action Buttons */}
            <div className="hidden lg:block">
              <InputSubmitActions
                isDiagnosaBengkel={isDiagnosaBengkel}
                isAdmin={isAdmin}
                isOperator={isOperator}
                loading={loading}
                totalDamageCount={totalDamageCount}
                noDaisha={formData.noDaisha}
                onSubmit={handleSubmit}
              />
            </div>
          </div>

          {/* Kolom Kanan: Mode Kerusakan & Katalog Titik Kerusakan (7 Kolom) */}
          <div className="lg:col-span-7 space-y-5">
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

            {/* Mobile / Tablet Action Buttons */}
            <div className="lg:hidden">
              <InputSubmitActions
                isDiagnosaBengkel={isDiagnosaBengkel}
                isAdmin={isAdmin}
                isOperator={isOperator}
                loading={loading}
                totalDamageCount={totalDamageCount}
                noDaisha={formData.noDaisha}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </form>

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
        onClose={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
        onSecondaryClick={feedback.onSecondaryClick}
      />

      {/* Modal Cetak Tag Fisik Daisha setelah Submit Berhasil */}
      {createdTicketForTag && (
        <PrintTicketTagModal
          isOpen={isPrintTagOpen}
          ticket={createdTicketForTag}
          onClose={() => {
            setIsPrintTagOpen(false);
            setCreatedTicketForTag(null);
          }}
        />
      )}
    </div>
  );
}