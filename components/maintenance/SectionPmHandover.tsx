'use client';

import React from 'react';
import { FleetUnit } from './FleetExplorer';
import FeedbackModal from '@/components/FeedbackModal';
import { usePmHandover } from './pm-handover/usePmHandover';
import HandoverHeaderBanner from './pm-handover/HandoverHeaderBanner';
import HandoverBatchForm from './pm-handover/HandoverBatchForm';
import HandoverTargetTable from './pm-handover/HandoverTargetTable';
import HandoverActiveLocations from './pm-handover/HandoverActiveLocations';
import HandoverVisualGrid from './pm-handover/HandoverVisualGrid';

export { formatUkuran } from './pm-handover/types';
export type {
  PmStagingRecord,
  ColorCodedVariantGroup,
  StagedLocationGroup,
} from './pm-handover/types';

interface SectionPmHandoverProps {
  seksi: string;
  units: FleetUnit[];
  isSeksiUser: boolean;
  remainingWorkDays?: number;
  queuedUnitNo?: string | null;
  onClearQueuedUnit?: () => void;
  onRefreshData?: () => void;
}

export default function SectionPmHandover({
  seksi,
  units,
  remainingWorkDays = 50,
  queuedUnitNo,
  onClearQueuedUnit,
  onRefreshData,
}: SectionPmHandoverProps) {
  const {
    selectedUnits,
    setSelectedUnits,
    manualInputText,
    setManualInputText,
    inputAlert,
    setInputAlert,
    lokasiPenjemputan,
    setLokasiPenjemputan,
    catatan,
    setCatatan,
    submitting,
    expandedCards,
    setExpandedCards,
    showVisualGrid,
    setShowVisualGrid,
    feedback,
    closeFeedback,
    dueUnits,
    stagedByLocation,
    variantGroups,
    totalSectionDailyTarget,
    totalSectionStagedToday,
    filteredSuggestions,
    handleAddManualUnits,
    handleToggleUnit,
    handleSelectVariant,
    handleSubmitStaging,
  } = usePmHandover({
    seksi,
    units,
    remainingWorkDays,
    queuedUnitNo,
    onClearQueuedUnit,
    onRefreshData,
  });

  return (
    <div className="space-y-5 font-sans">
      {/* 1. Header Banner Ringkas */}
      <HandoverHeaderBanner
        seksi={seksi}
        totalUnits={units.length}
        dueCount={dueUnits.length}
        stagedTodayCount={totalSectionStagedToday}
      />

      {/* 2. Formulir Penyiapan & Pengingat Workshop (Batch Dispatch Fleksibel) */}
      <HandoverBatchForm
        seksi={seksi}
        selectedUnits={selectedUnits}
        setSelectedUnits={setSelectedUnits}
        manualInputText={manualInputText}
        setManualInputText={setManualInputText}
        filteredSuggestions={filteredSuggestions}
        inputAlert={inputAlert}
        setInputAlert={setInputAlert}
        lokasiPenjemputan={lokasiPenjemputan}
        setLokasiPenjemputan={setLokasiPenjemputan}
        catatan={catatan}
        setCatatan={setCatatan}
        submitting={submitting}
        onAddManualUnits={handleAddManualUnits}
        onToggleUnit={handleToggleUnit}
        onSubmit={handleSubmitStaging}
      />

      {/* 3. Tabel Alokasi Target Harian PM per Varian Armada */}
      <HandoverTargetTable
        seksi={seksi}
        totalSectionDailyTarget={totalSectionDailyTarget}
        totalSectionStagedToday={totalSectionStagedToday}
        remainingWorkDays={remainingWorkDays}
        totalUnits={units.length}
        dueCount={dueUnits.length}
        variantGroups={variantGroups}
        selectedUnits={selectedUnits}
        onSelectVariant={handleSelectVariant}
      />

      {/* 4. Peta Titik Penjemputan Staging yang Sedang Aktif */}
      <HandoverActiveLocations
        stagedByLocation={stagedByLocation}
        totalStagedUnitsCount={selectedUnits.length}
      />

      {/* 5. Kartu Visual Simpel dengan Kode Pewarnaan per Varian */}
      <HandoverVisualGrid
        showVisualGrid={showVisualGrid}
        setShowVisualGrid={setShowVisualGrid}
        selectedUnits={selectedUnits}
        variantGroups={variantGroups}
        expandedCards={expandedCards}
        setExpandedCards={setExpandedCards}
        onSelectVariant={handleSelectVariant}
        onToggleUnit={handleToggleUnit}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        buttonText="Tutup"
        onClose={closeFeedback}
      />
    </div>
  );
}
