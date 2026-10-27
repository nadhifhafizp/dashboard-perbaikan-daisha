'use client';

import React from 'react';
import FeedbackModal from '@/components/FeedbackModal';
import ConfirmModal from '@/components/ConfirmModal';
import { RefreshCw } from 'lucide-react';
import {
  AddDaishaModal,
  AddVariantModal,
  AddComponentModal,
  AddSymptomModal,
  EditCatalogItemModal,
} from './CatalogModals';
import { useCatalogManager } from './catalog/useCatalogManager';
import CatalogStatsHeader from './catalog/CatalogStatsHeader';
import CatalogFilterBar from './catalog/CatalogFilterBar';
import SeksiGroupSection from './catalog/SeksiGroupSection';

export default function CatalogManager() {
  const {
    tree,
    loading,
    refreshCatalog,
    search,
    setSearch,
    selectedSeksi,
    setSelectedSeksi,
    expandedDaishaIds,
    collapsedSeksi,
    toggleCollapseSeksi,
    collapseAllSeksi,
    expandAllSeksi,
    toggleAccordion,
    isAddDaishaModalOpen,
    setIsAddDaishaModalOpen,
    isAddVariantModalOpen,
    setIsAddVariantModalOpen,
    addVariantTarget,
    setAddVariantTarget,
    addComponentTarget,
    setAddComponentTarget,
    addSymptomTarget,
    setAddSymptomTarget,
    editItem,
    setEditItem,
    deleteItem,
    setDeleteItem,
    newDaishaForm,
    setNewDaishaForm,
    newVariantForm,
    setNewVariantForm,
    newComponentName,
    setNewComponentName,
    newSymptomText,
    setNewSymptomText,
    feedback,
    closeFeedback,
    groupedBySeksi,
    seksiCounts,
    totalAllUnits,
    uniqueSeksiList,
    handleAddDaishaSubmit,
    handleAddComponentSubmit,
    handleAddSymptomSubmit,
    handleAddVariantSubmit,
    handleEditSubmit,
    handleConfirmDelete,
  } = useCatalogManager();

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar & Quick Stats */}
      <CatalogStatsHeader
        loading={loading}
        onRefresh={() => void refreshCatalog()}
        onOpenAddDaisha={() => {
          setNewDaishaForm({
            name: '',
            seksi: 'Building',
            codePrefix: '',
            totalUnits: 0,
          });
          setIsAddDaishaModalOpen(true);
        }}
        totalSeksi={uniqueSeksiList.length}
        totalModel={tree.length}
        totalAllUnits={totalAllUnits}
      />

      {/* 2. Filter Bar */}
      <CatalogFilterBar
        selectedSeksi={selectedSeksi}
        setSelectedSeksi={setSelectedSeksi}
        uniqueSeksiList={uniqueSeksiList}
        seksiCounts={seksiCounts}
        totalTreeCount={tree.length}
        search={search}
        setSearch={setSearch}
        onExpandAll={expandAllSeksi}
        onCollapseAll={collapseAllSeksi}
      />

      {/* 3. Structured Hierarchical List */}
      <div className="space-y-4">
        {loading && tree.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-slate-200 text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
            <span>Memuat katalog master Daisha dari database...</span>
          </div>
        ) : groupedBySeksi.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-slate-200 text-slate-400 text-xs">
            Tidak ada jenis Daisha yang sesuai dengan filter atau pencarian Anda.
          </div>
        ) : (
          groupedBySeksi.map((group) => {
            const isSeksiCollapsed =
              !search.trim() && collapsedSeksi.includes(group.seksi);

            return (
              <SeksiGroupSection
                key={group.seksi}
                group={group}
                isSeksiCollapsed={isSeksiCollapsed}
                onToggleCollapseSeksi={toggleCollapseSeksi}
                expandedDaishaIds={expandedDaishaIds}
                onToggleAccordion={toggleAccordion}
                onOpenAddComponent={(daisha) => setAddComponentTarget(daisha)}
                onOpenAddVariant={(daisha) => {
                  setAddVariantTarget(daisha);
                  setNewVariantForm({
                    name: '',
                    ukuran: '',
                    susunan: '',
                    tipe: '',
                    codePrefix: daisha.codePrefix || '',
                    minNumber: 1,
                    maxNumber: 1,
                    totalUnits: 1,
                    rangeFormat: '',
                  });
                  setIsAddVariantModalOpen(true);
                }}
                onOpenAddSymptom={(target) => setAddSymptomTarget(target)}
                onEditItem={(state) => setEditItem(state)}
                onDeleteItem={(item) => setDeleteItem(item)}
              />
            );
          })
        )}
      </div>

      {/* 4. CRUD Modals */}
      <AddDaishaModal
        isOpen={isAddDaishaModalOpen}
        onClose={() => setIsAddDaishaModalOpen(false)}
        form={newDaishaForm}
        setForm={setNewDaishaForm}
        onSubmit={handleAddDaishaSubmit}
        seksiList={uniqueSeksiList}
      />

      <AddVariantModal
        isOpen={isAddVariantModalOpen}
        onClose={() => {
          setIsAddVariantModalOpen(false);
          setAddVariantTarget(null);
        }}
        daishaTarget={addVariantTarget}
        form={newVariantForm}
        setForm={setNewVariantForm}
        onSubmit={handleAddVariantSubmit}
      />

      <AddComponentModal
        isOpen={!!addComponentTarget}
        onClose={() => {
          setAddComponentTarget(null);
          setNewComponentName('');
        }}
        target={addComponentTarget}
        componentName={newComponentName}
        setComponentName={setNewComponentName}
        onSubmit={handleAddComponentSubmit}
      />

      <AddSymptomModal
        isOpen={!!addSymptomTarget}
        onClose={() => {
          setAddSymptomTarget(null);
          setNewSymptomText('');
        }}
        target={addSymptomTarget}
        symptomText={newSymptomText}
        setSymptomText={setNewSymptomText}
        onSubmit={handleAddSymptomSubmit}
      />

      <EditCatalogItemModal
        item={editItem}
        onClose={() => setEditItem(null)}
        setItem={setEditItem}
        onSubmit={handleEditSubmit}
        seksiList={uniqueSeksiList}
      />

      <ConfirmModal
        isOpen={!!deleteItem}
        title={deleteItem?.title || 'Hapus Data'}
        message={deleteItem?.description || 'Apakah Anda yakin ingin menghapus data ini?'}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteItem(null)}
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
