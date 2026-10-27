import { useState, useEffect, useMemo } from 'react';
import { SectionRequestFull } from '../BridgestoneRequestPrintModal';
import { SparepartOption } from './types';
import { ClientMaterialItem, normalizeMaterialsClient, calculatePlateArea, formatPlateDimension } from '@/lib/materialArea';

export function useMaterialsEditor(
  requestData: SectionRequestFull | null,
  isOpen: boolean,
  onSuccess: () => void,
  handleUnauthorized: () => void,
  setErrorMsg: (msg: string) => void
) {
  const [itemCategoryMode, setItemCategoryMode] = useState<'SPAREPART' | 'MATERIAL'>('SPAREPART');
  const [sparepartsCatalog, setSparepartsCatalog] = useState<SparepartOption[]>([]);
  const [materialsList, setMaterialsList] = useState<ClientMaterialItem[]>([]);
  const [materialLoading, setMaterialLoading] = useState(false);

  // Form Khusus Sparepart
  const [selectedSparepart, setSelectedSparepart] = useState('');
  const [sparepartQty, setSparepartQty] = useState<number>(1);
  const [sparepartKeterangan, setSparepartKeterangan] = useState('');

  // Form Khusus Material
  const [materialSourceMode, setMaterialSourceMode] = useState<'CATALOG' | 'CUSTOM'>('CATALOG');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [customMaterialName, setCustomMaterialName] = useState('');
  const [materialQty, setMaterialQty] = useState<string>('1');
  const [materialSatuan, setMaterialSatuan] = useState<string>('cm²');
  const [customSatuan, setCustomSatuan] = useState<string>('');
  const [materialDimensi, setMaterialDimensi] = useState<string>('');
  const [materialKeterangan, setMaterialKeterangan] = useState('');
  const [materialPotongStokGudang, setMaterialPotongStokGudang] = useState(false);
  const [materialQtyPotongGudang, setMaterialQtyPotongGudang] = useState<number>(1);

  // Kalkulator Luas Plat Helper
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [calcPanjang, setCalcPanjang] = useState('');
  const [calcLebar, setCalcLebar] = useState('');
  const [calcTebal, setCalcTebal] = useState('');

  const [tableFilterType, setTableFilterType] = useState<'ALL' | 'SPAREPART' | 'MATERIAL'>('ALL');

  useEffect(() => {
    if (isOpen) {
      const fetchCatalog = async () => {
        try {
          const res = await fetch('/api/spareparts');
          if (res.status === 401) {
            handleUnauthorized();
            return;
          }
          const data = await res.json();
          if (res.ok && data.success) {
            setSparepartsCatalog(data.spareparts || []);
          }
        } catch {
          // ignore
        }
      };
      void fetchCatalog();
    }
  }, [isOpen, handleUnauthorized]);

  const [prevRequest, setPrevRequest] = useState(requestData);
  if (requestData !== prevRequest) {
    setPrevRequest(requestData);
    setMaterialsList(requestData ? normalizeMaterialsClient(requestData.materials) : []);
  }

  const isMaterialCategory = (s: SparepartOption) => {
    const kat = (s.kategori || '').toLowerCase();
    const nama = (s.namaKomponen || '').toLowerCase();
    return (
      kat.includes('plat') ||
      kat.includes('las') ||
      kat.includes('cat') ||
      kat.includes('rangka') ||
      kat.includes('bahan') ||
      kat.includes('kimia') ||
      s.satuan.toLowerCase() === 'lembar' ||
      s.satuan.toLowerCase() === 'kaleng' ||
      s.satuan.toLowerCase() === 'kg' ||
      nama.includes('plat strip') ||
      nama.includes('kawat las')
    );
  };

  const sparepartsCatalogList = useMemo(() => {
    return sparepartsCatalog.filter((s) => !isMaterialCategory(s));
  }, [sparepartsCatalog]);

  const materialsCatalogList = useMemo(() => {
    return sparepartsCatalog.filter((s) => isMaterialCategory(s));
  }, [sparepartsCatalog]);

  const computedArea = useMemo(() => {
    return calculatePlateArea(calcPanjang, calcLebar);
  }, [calcPanjang, calcLebar]);

  const applyPlateArea = () => {
    if (!computedArea) return;
    setMaterialQty(String(computedArea.cm2));
    setMaterialSatuan('cm²');
    setMaterialDimensi(formatPlateDimension(calcPanjang, calcLebar, calcTebal));
    setShowPlateCalc(false);
  };

  const handleAddSparepart = async () => {
    if (!selectedSparepart) {
      alert('Pilih sparepart dari daftar.');
      return;
    }
    if (!requestData) return;

    const detailSp = sparepartsCatalogList.find((s) => s.namaKomponen === selectedSparepart);
    const maxStok = detailSp ? detailSp.stokGudang : 999;
    if (sparepartQty > maxStok) {
      alert(`Stok tidak mencukupi. Sisa stok di gudang: ${maxStok}`);
      return;
    }

    setMaterialLoading(true);
    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MATERIAL',
          sectionRequestId: requestData.id,
          namaKomponen: selectedSparepart,
          tipe: 'SPAREPART',
          qty: sparepartQty,
          satuan: detailSp?.satuan || 'Pcs',
          potongStok: true,
          qtyPotongStok: sparepartQty,
          keterangan: sparepartKeterangan.trim() || undefined,
        }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setMaterialsList(normalizeMaterialsClient(data.materials));
        setSelectedSparepart('');
        setSparepartQty(1);
        setSparepartKeterangan('');
        const catRes = await fetch('/api/spareparts');
        const catData = await catRes.json();
        if (catRes.ok && catData.success) {
          setSparepartsCatalog(catData.spareparts || []);
        }
        onSuccess();
      } else {
        setErrorMsg(data.error || 'Gagal menambahkan sparepart.');
      }
    } catch {
      setErrorMsg('Gagal menghubungi server saat menambah sparepart.');
    } finally {
      setMaterialLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    const finalName = materialSourceMode === 'CATALOG' ? selectedMaterial : customMaterialName.trim();
    if (!finalName) {
      alert('Tentukan nama material.');
      return;
    }
    if (!requestData) return;

    const numQty = parseFloat(materialQty.replace(',', '.'));
    if (isNaN(numQty) || numQty <= 0) {
      alert('Kuantitas pemakaian material harus berupa angka lebih besar dari 0.');
      return;
    }

    const finalSatuan = materialSatuan === 'custom' ? customSatuan.trim() || 'Unit' : materialSatuan;

    setMaterialLoading(true);
    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MATERIAL',
          sectionRequestId: requestData.id,
          namaKomponen: finalName,
          tipe: 'MATERIAL',
          qty: numQty,
          satuan: finalSatuan,
          dimensi: materialDimensi.trim() || undefined,
          potongStok: materialSourceMode === 'CATALOG' && materialPotongStokGudang,
          qtyPotongStok:
            materialSourceMode === 'CATALOG' && materialPotongStokGudang ? materialQtyPotongGudang : undefined,
          keterangan: materialKeterangan.trim() || undefined,
        }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setMaterialsList(normalizeMaterialsClient(data.materials));
        if (materialSourceMode === 'CUSTOM') {
          setCustomMaterialName('');
        } else {
          setSelectedMaterial('');
        }
        setMaterialQty('1');
        setMaterialDimensi('');
        setMaterialKeterangan('');
        setMaterialPotongStokGudang(false);
        const catRes = await fetch('/api/spareparts');
        const catData = await catRes.json();
        if (catRes.ok && catData.success) {
          setSparepartsCatalog(catData.spareparts || []);
        }
        onSuccess();
      } else {
        setErrorMsg(data.error || 'Gagal menambahkan material.');
      }
    } catch {
      setErrorMsg('Gagal menghubungi server saat menambah material.');
    } finally {
      setMaterialLoading(false);
    }
  };

  const handleRemoveMaterial = async (matId: number, namaKomponen: string) => {
    if (!requestData) return;
    if (!confirm('Yakin ingin membatalkan pemakaian item ini?')) {
      return;
    }
    setMaterialLoading(true);
    try {
      const res = await fetch('/api/section-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REMOVE_MATERIAL',
          sectionRequestId: requestData.id,
          materialId: matId,
          namaKomponen: namaKomponen,
        }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setMaterialsList(normalizeMaterialsClient(data.materials));
        const catRes = await fetch('/api/spareparts');
        const catData = await catRes.json();
        if (catRes.ok && catData.success) {
          setSparepartsCatalog(catData.spareparts || []);
        }
        onSuccess();
      } else {
        setErrorMsg(data.error || 'Gagal membatalkan item.');
      }
    } catch {
      setErrorMsg('Gagal menghubungi server saat membatalkan item.');
    } finally {
      setMaterialLoading(false);
    }
  };

  const currentSparepartDetail = sparepartsCatalogList.find((s) => s.namaKomponen === selectedSparepart);
  const currentMaterialDetail = materialsCatalogList.find((s) => s.namaKomponen === selectedMaterial);

  const filteredMaterialsTable = useMemo(() => {
    if (tableFilterType === 'SPAREPART') return materialsList.filter((m) => m.tipe === 'SPAREPART');
    if (tableFilterType === 'MATERIAL') return materialsList.filter((m) => m.tipe === 'MATERIAL');
    return materialsList;
  }, [materialsList, tableFilterType]);

  const countSparepart = materialsList.filter((m) => m.tipe === 'SPAREPART').length;
  const countMaterial = materialsList.filter((m) => m.tipe === 'MATERIAL').length;

  return {
    itemCategoryMode,
    setItemCategoryMode,
    sparepartsCatalogList,
    materialsCatalogList,
    selectedSparepart,
    setSelectedSparepart,
    sparepartQty,
    setSparepartQty,
    sparepartKeterangan,
    setSparepartKeterangan,
    currentSparepartDetail,
    currentMaterialDetail,
    materialSourceMode,
    setMaterialSourceMode,
    selectedMaterial,
    setSelectedMaterial,
    customMaterialName,
    setCustomMaterialName,
    materialQty,
    setMaterialQty,
    materialSatuan,
    setMaterialSatuan,
    customSatuan,
    setCustomSatuan,
    materialDimensi,
    setMaterialDimensi,
    materialKeterangan,
    setMaterialKeterangan,
    materialPotongStokGudang,
    setMaterialPotongStokGudang,
    materialQtyPotongGudang,
    setMaterialQtyPotongGudang,
    showPlateCalc,
    setShowPlateCalc,
    calcPanjang,
    setCalcPanjang,
    calcLebar,
    setCalcLebar,
    calcTebal,
    setCalcTebal,
    computedArea,
    applyPlateArea,
    tableFilterType,
    setTableFilterType,
    filteredMaterialsTable,
    materialsList,
    countSparepart,
    countMaterial,
    materialLoading,
    handleAddSparepart,
    handleAddMaterial,
    handleRemoveMaterial,
  };
}
