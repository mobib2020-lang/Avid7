import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  FolderTree,
  ChevronLeft,
  ChevronDown,
  Plus,
  CheckCircle2,
  AlertCircle,
  Folder,
  SlidersHorizontal,
  X,
  Package,
} from 'lucide-react';
import {
  AssetClassification,
  AssetRequirementField,
  ItemKind,
} from '../../types';
import {
  LearnedInventoryItem,
  getLearnedInventoryCatalog,
  searchLearnedInventory,
  findLearnedItemByName,
  recordAndLearnInventoryItem,
  resolveTaxonomyForLearnedItem,
} from '../../data/learnedInventoryMemory';
import { INITIAL_STRUCTURES_DATA, getInheritedFieldsForNode } from '../../data/assetTaxonomyData';

interface SmartInventoryPickerProps {
  selectedItemName?: string;
  selectedCategory?: string;
  selectedSubcategory?: string;
  selectedType?: string;
  classificationsList?: AssetClassification[];
  onSelectItem: (item: {
    name: string;
    enName?: string;
    category: string;
    subcategory: string;
    type: string;
    itemKind: ItemKind;
    defaultUnit?: string;
    defaultBrand?: string;
    defaultModel?: string;
    inheritedFields: { levelLabel: string; field: AssetRequirementField }[];
    isNewlyCreated?: boolean;
  }) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export const SmartInventoryPicker: React.FC<SmartInventoryPickerProps> = ({
  selectedItemName = '',
  selectedCategory = '',
  selectedSubcategory = '',
  selectedType = '',
  classificationsList = INITIAL_STRUCTURES_DATA,
  onSelectItem,
  placeholder = 'نام موجودی، تجهیز یا کالا را جستجو کنید (مثلاً: تخت بیمارستانی، ست جراحی، مانیتور...)',
  autoFocus = false,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(selectedItemName);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [showStructureMappingModal, setShowStructureMappingModal] = useState<boolean>(false);

  // 3-Step Structure Selection State
  const [newCustomItemName, setNewCustomItemName] = useState<string>('');
  const [mappingStep, setMappingStep] = useState<1 | 2 | 3>(1);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [modalSubSearch, setModalSubSearch] = useState<string>('');
  const [modalTypeSearch, setModalTypeSearch] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Load unified memory catalog
  const catalog = useMemo(() => getLearnedInventoryCatalog(), [showStructureMappingModal]);

  // Filtered unified search results
  const itemsList = useMemo(() => {
    return searchLearnedInventory(searchTerm, selectedFilterCategory, catalog);
  }, [searchTerm, selectedFilterCategory, catalog]);

  // Check if current search matches an existing item exactly
  const exactMatch = useMemo(() => {
    if (!searchTerm.trim()) return null;
    return findLearnedItemByName(searchTerm, catalog);
  }, [searchTerm, catalog]);

  // Is the user typing an unlisted item?
  const isUnlistedItem = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) return false;
    return !exactMatch && itemsList.length === 0;
  }, [searchTerm, exactMatch, itemsList]);

  // Top level categories (Level 1)
  const categoryNodes = useMemo(() => {
    return classificationsList.filter((c) => !c.parentId && c.isActive);
  }, [classificationsList]);

  // Subcategories of selected Category (Level 2)
  const subcategoryNodes = useMemo(() => {
    if (!selectedCatId) return [];
    let list = classificationsList.filter((c) => c.parentId === selectedCatId && c.isActive);
    if (modalSubSearch.trim()) {
      const q = modalSubSearch.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q)));
    }
    return list;
  }, [classificationsList, selectedCatId, modalSubSearch]);

  // Types of selected Subcategory (Level 3)
  const typeNodes = useMemo(() => {
    if (!selectedSubId) return [];
    let list = classificationsList.filter((c) => c.parentId === selectedSubId && c.isActive);
    if (modalTypeSearch.trim()) {
      const q = modalTypeSearch.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q)));
    }
    return list;
  }, [classificationsList, selectedSubId, modalTypeSearch]);

  // Selected node objects
  const activeCategoryNode = useMemo(() => {
    return categoryNodes.find((c) => c.id === selectedCatId);
  }, [categoryNodes, selectedCatId]);

  const activeSubcategoryNode = useMemo(() => {
    return classificationsList.find((c) => c.id === selectedSubId);
  }, [classificationsList, selectedSubId]);

  const activeTypeNode = useMemo(() => {
    return classificationsList.find((c) => c.id === selectedTypeId);
  }, [classificationsList, selectedTypeId]);

  // Inherited fields preview for selected structure
  const structureInheritedFields = useMemo(() => {
    const targetNodeId = selectedTypeId || selectedSubId || selectedCatId;
    if (!targetNodeId) return [];
    return getInheritedFieldsForNode(targetNodeId, classificationsList);
  }, [selectedTypeId, selectedSubId, selectedCatId, classificationsList]);

  // Synchronize incoming selectedItemName
  useEffect(() => {
    if (selectedItemName && selectedItemName !== searchTerm) {
      setSearchTerm(selectedItemName);
    }
  }, [selectedItemName]);

  // Handler: Select an existing unified item
  const handlePickKnownItem = (item: LearnedInventoryItem) => {
    setSearchTerm(item.name);

    const { inheritedFields } = resolveTaxonomyForLearnedItem(
      {
        category: item.category,
        subcategory: item.subcategory,
        type: item.type,
      },
      classificationsList
    );

    onSelectItem({
      name: item.name,
      enName: item.enName,
      category: item.category,
      subcategory: item.subcategory,
      type: item.type,
      itemKind: item.itemKind || 'device',
      defaultUnit: item.defaultUnit,
      defaultBrand: item.defaultBrand,
      defaultModel: item.defaultModel,
      inheritedFields,
      isNewlyCreated: false,
    });
  };

  // Handler: Start 3-step structure mapping for an unlisted item
  const handleStartStructureMapping = (customName?: string) => {
    const nameToMap = customName || searchTerm || '';
    setNewCustomItemName(nameToMap);
    setMappingStep(1);
    setSelectedCatId('');
    setSelectedSubId('');
    setSelectedTypeId('');
    setShowStructureMappingModal(true);
  };

  // Handler: Finalize 3-step structure mapping
  const handleCompleteStructureMapping = () => {
    if (!activeCategoryNode || !activeSubcategoryNode || !activeTypeNode) return;

    const inheritedFields = getInheritedFieldsForNode(activeTypeNode.id, classificationsList);

    // Save and record in unified memory
    const learned = recordAndLearnInventoryItem({
      name: newCustomItemName.trim(),
      category: activeCategoryNode.name,
      subcategory: activeSubcategoryNode.name,
      type: activeTypeNode.name,
      itemKind: activeCategoryNode.domain === 'consumables' ? 'consumable' : 'device',
      defaultUnit: activeCategoryNode.domain === 'consumables' ? 'عدد' : 'دستگاه',
      sourceType: 'user_custom',
    });

    setSearchTerm(learned.name);
    setShowStructureMappingModal(false);

    onSelectItem({
      name: learned.name,
      enName: learned.enName,
      category: learned.category,
      subcategory: learned.subcategory,
      type: learned.type,
      itemKind: learned.itemKind,
      defaultUnit: learned.defaultUnit,
      inheritedFields,
      isNewlyCreated: true,
    });
  };

  return (
    <div className={`space-y-4 dir-rtl text-right ${className}`}>
      {/* Unified Search & Category Filter Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#2b64f6]" />
              <span>جستجو و انتخاب قلم موجودی</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              نام موجودی یا کالا را جستجو کرده و برای ثبت انتخاب نمایید:
            </p>
          </div>

          <div className="text-[11px] text-blue-700 font-bold bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs self-start sm:self-auto">
            اقلام موجود در فهرست: {itemsList.length.toLocaleString('fa-IR')}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            autoFocus={autoFocus}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 pr-10 pl-10 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#2b64f6] focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition-all"
          />

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </div>

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                inputRef.current?.focus();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => setSelectedFilterCategory('all')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              selectedFilterCategory === 'all'
                ? 'bg-[#2b64f6] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            همه موجودی‌ها
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilterCategory('medical')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              selectedFilterCategory === 'medical'
                ? 'bg-[#2b64f6] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            تجهیزات پزشکی و تشخیصی
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilterCategory('general_hospital')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              selectedFilterCategory === 'general_hospital'
                ? 'bg-[#2b64f6] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            اموال عمومی و اداری
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilterCategory('laboratory')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              selectedFilterCategory === 'laboratory'
                ? 'bg-[#2b64f6] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            تجهیزات آزمایشگاهی
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilterCategory('consumable')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              selectedFilterCategory === 'consumable'
                ? 'bg-[#2b64f6] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            اقلام و قطعات مصرفی
          </button>
        </div>

        {/* Selected Structure Breadcrumb Bar (if item is selected) */}
        {selectedCategory && selectedType && (
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-[11px] text-blue-950 animate-in fade-in">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[#2b64f6]">ساختار انتخابی:</span>
              <span className="font-semibold text-slate-800">{selectedCategory}</span>
              {selectedSubcategory && (
                <>
                  <span className="text-slate-400">❯</span>
                  <span className="font-semibold text-slate-800">{selectedSubcategory}</span>
                </>
              )}
              {selectedType && (
                <>
                  <span className="text-slate-400">❯</span>
                  <span className="font-extrabold text-[#2b64f6] bg-white px-2 py-0.5 rounded-md border border-blue-200">
                    {selectedType}
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleStartStructureMapping(searchTerm)}
              className="text-[10px] text-slate-500 hover:text-[#2b64f6] font-bold underline shrink-0 cursor-pointer"
            >
              تغییر ساختار اموال
            </button>
          </div>
        )}
      </div>

      {/* UNLISTED ITEM PROMPT: If searched item is not found */}
      {isUnlistedItem && (
        <div className="p-4.5 bg-gradient-to-r from-amber-50 to-orange-50/80 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-xs font-black text-amber-950">
                این موجودی در فهرست موجودی‌های ثبت‌شده وجود ندارد. آیا می‌خواهید آن را به فهرست اضافه کنید؟
              </p>
              <p className="text-[11px] text-amber-800">
                قلم واردشده: <strong>«{searchTerm.trim()}»</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/60">
            <button
              type="button"
              onClick={() => handleStartStructureMapping(searchTerm.trim())}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن به فهرست و تعیین ساختار اموال ❮</span>
            </button>
          </div>
        </div>
      )}

      {/* UNIFIED LIST OF ITEMS */}
      <div className="max-h-[380px] overflow-y-auto rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-inner">
        {itemsList.length > 0 ? (
          itemsList.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => handlePickKnownItem(item)}
                className="p-3.5 hover:bg-blue-50/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-extrabold text-slate-900 group-hover:text-[#2b64f6] text-xs transition-colors">
                      {item.name}
                    </h5>
                    {item.enName && (
                      <span className="text-[11px] text-slate-500 font-sans font-medium dir-ltr inline-block">
                        ({item.enName})
                      </span>
                    )}
                    {item.itemKind === 'consumable' ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        قلم مصرفی
                      </span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-blue-50 text-[#2b64f6] font-bold border border-blue-200">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {item.category}
                    </span>
                    <span>❯</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {item.subcategory}
                    </span>
                    <span>❯</span>
                    <span className="text-slate-700 font-bold">{item.type}</span>
                    {item.umdns && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono text-[9px]">
                        UMDNS: {item.umdns}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePickKnownItem(item);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 group-hover:bg-[#2b64f6] group-hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs shrink-0 flex items-center justify-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <span>انتخاب موجودی</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        ) : !isUnlistedItem ? (
          <div className="p-8 text-center space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              هیچ موردی مطابق با جستجوی شما یافت نشد.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedFilterCategory('all');
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#2b64f6] text-xs font-bold hover:bg-blue-100 cursor-pointer"
            >
              پاک کردن فیلترها و نمایش همه
            </button>
          </div>
        ) : null}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: STEP-BY-STEP STRUCTURE CLASSIFICATION FOR NEW INVENTORY ITEM     */}
      {/* ========================================================================= */}
      {showStructureMappingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden dir-rtl text-right animate-in fade-in flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/90 to-indigo-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2b64f6] text-white flex items-center justify-center font-bold shadow-xs">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    تعیین جایگاه موجودی جدید در ساختار اموال
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    تعیین رده، زیردسته و نوع برای قلم: <strong className="text-blue-900 font-bold">{newCustomItemName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStructureMappingModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setMappingStep(1)}
                className={`flex items-center gap-2 font-bold transition-colors ${
                  mappingStep === 1
                    ? 'text-[#2b64f6]'
                    : selectedCatId
                    ? 'text-emerald-700 cursor-pointer'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    mappingStep === 1
                      ? 'bg-[#2b64f6] text-white'
                      : selectedCatId
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  ۱
                </span>
                <span>مرحله ۱: انتخاب Category (رده اصلی)</span>
              </button>

              <span className="text-slate-300">❯</span>

              <button
                type="button"
                disabled={!selectedCatId}
                onClick={() => selectedCatId && setMappingStep(2)}
                className={`flex items-center gap-2 font-bold transition-colors ${
                  mappingStep === 2
                    ? 'text-[#2b64f6]'
                    : selectedSubId
                    ? 'text-emerald-700 cursor-pointer'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    mappingStep === 2
                      ? 'bg-[#2b64f6] text-white'
                      : selectedSubId
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  ۲
                </span>
                <span>مرحله ۲: انتخاب Subcategory (زیردسته)</span>
              </button>

              <span className="text-slate-300">❯</span>

              <button
                type="button"
                disabled={!selectedSubId}
                onClick={() => selectedSubId && setMappingStep(3)}
                className={`flex items-center gap-2 font-bold transition-colors ${
                  mappingStep === 3
                    ? 'text-[#2b64f6]'
                    : selectedTypeId
                    ? 'text-emerald-700 cursor-pointer'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    mappingStep === 3
                      ? 'bg-[#2b64f6] text-white'
                      : selectedTypeId
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  ۳
                </span>
                <span>مرحله ۳: انتخاب Type (نوع قلم)</span>
              </button>
            </div>

            {/* Stepper Content */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs flex-1">
              {/* Item Name Input Editor */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">
                    نام قلم موجودی در حال ثبت:
                  </label>
                  <input
                    type="text"
                    value={newCustomItemName}
                    onChange={(e) => setNewCustomItemName(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-blue-200 font-bold text-slate-900 text-xs focus:outline-none focus:border-[#2b64f6]"
                  />
                </div>
              </div>

              {/* STEP 1: CATEGORY SELECTION */}
              {mappingStep === 1 && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span>مرحله اول: انتخاب رده اصلی اموال (Category)</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      حوزه کلی فعالیت و نگهداری این قلم را مشخص کنید
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categoryNodes.map((cat) => {
                      const isSelected = selectedCatId === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setSelectedCatId(cat.id);
                            setSelectedSubId('');
                            setSelectedTypeId('');
                            setMappingStep(2);
                          }}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 group ${
                            isSelected
                              ? 'border-[#2b64f6] bg-blue-50/70 shadow-sm'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#2b64f6] text-white'
                                : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                            }`}
                          >
                            <Folder className="w-5 h-5" />
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-black text-slate-900 text-xs group-hover:text-[#2b64f6]">
                              {cat.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2">
                              {cat.description || 'شامل زیرمجموعه‌ها و انواع تجهیزات مرتبط'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: SUBCATEGORY SELECTION */}
              {mappingStep === 2 && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-black text-slate-800">
                        مرحله دوم: انتخاب زیردسته مربوط به «{activeCategoryNode?.name}»
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        روی هر زیردسته نگه دارید تا نام کامل آن را مشاهده کنید
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMappingStep(1)}
                      className="text-[11px] text-[#2b64f6] font-bold hover:underline cursor-pointer self-start sm:self-auto"
                    >
                      ❮ بازگشت به انتخاب رده اصلی (Category)
                    </button>
                  </div>

                  {/* Search bar inside Subcategory list */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={modalSubSearch}
                      onChange={(e) => setModalSubSearch(e.target.value)}
                      placeholder="جستجوی سریع در زیردسته‌ها..."
                      className="w-full pr-9 pl-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#2b64f6] focus:outline-none"
                    />
                    {modalSubSearch && (
                      <button
                        type="button"
                        onClick={() => setModalSubSearch('')}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
                    {subcategoryNodes.length > 0 ? (
                      subcategoryNodes.map((sub) => {
                        const isSelected = selectedSubId === sub.id;
                        return (
                          <div
                            key={sub.id}
                            title={sub.name}
                            onClick={() => {
                              setSelectedSubId(sub.id);
                              setSelectedTypeId('');
                              setMappingStep(3);
                            }}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2.5 group ${
                              isSelected
                                ? 'border-[#2b64f6] bg-blue-50/80 font-bold text-blue-900 shadow-2xs'
                                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <span
                              title={sub.name}
                              className="text-xs font-bold leading-relaxed break-words flex-1 group-hover:text-[#2b64f6]"
                            >
                              {sub.name}
                            </span>
                            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-[#2b64f6] shrink-0" />
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        زیردسته‌ای مطابق با «{modalSubSearch}» یافت نشد.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: TYPE SELECTION & FIELD ASSOCIATION */}
              {mappingStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-black text-slate-800">
                        مرحله سوم: انتخاب نوع دقیق (Type) در زیردسته «{activeSubcategoryNode?.name}»
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        اسامی طولانی به‌صورت کامل و چندخطی نمایش داده می‌شوند؛ با نگه‌داشتن موس نیز نام کامل مشخص است
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMappingStep(2)}
                      className="text-[11px] text-[#2b64f6] font-bold hover:underline cursor-pointer self-start sm:self-auto"
                    >
                      ❮ بازگشت به انتخاب زیردسته (Subcategory)
                    </button>
                  </div>

                  {/* Search bar inside Type list */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={modalTypeSearch}
                      onChange={(e) => setModalTypeSearch(e.target.value)}
                      placeholder="جستجوی سریع در انواع کالا و تجهیز (Type)..."
                      className="w-full pr-9 pl-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#2b64f6] focus:outline-none"
                    />
                    {modalTypeSearch && (
                      <button
                        type="button"
                        onClick={() => setModalTypeSearch('')}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto p-1">
                    {typeNodes.length > 0 ? (
                      typeNodes.map((typeNode) => {
                        const isSelected = selectedTypeId === typeNode.id;
                        return (
                          <div
                            key={typeNode.id}
                            title={typeNode.name}
                            onClick={() => setSelectedTypeId(typeNode.id)}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-2.5 group ${
                              isSelected
                                ? 'border-[#2b64f6] bg-blue-50/80 font-bold text-blue-900 shadow-2xs'
                                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <span
                                title={typeNode.name}
                                className="text-xs font-bold leading-relaxed break-words block group-hover:text-[#2b64f6]"
                              >
                                {typeNode.name}
                              </span>
                              {typeNode.code && (
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                                  کد: {typeNode.code}
                                </span>
                              )}
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-[#2b64f6] shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        موردی مطابق با «{modalTypeSearch}» یافت نشد.
                      </div>
                    )}
                  </div>

                  {/* Association & Dynamic Inherited Fields Preview */}
                  {selectedTypeId && structureInheritedFields.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <SlidersHorizontal className="w-4 h-4 text-[#2b64f6]" />
                          <span>فیلدهای اطلاعاتی مرتبط شناسایی‌شده برای «{activeTypeNode?.name}»:</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          {structureInheritedFields.length} فیلد تخصصی
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600">
                        بر اساس ساختار تعریف‌شده، فیلدهای اطلاعاتی زیر در فرم ثبت موجودی برای این قلم فعال خواهند شد:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {structureInheritedFields.map(({ field }) => (
                          <div
                            key={field.id}
                            className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px]"
                          >
                            <span className="font-bold text-slate-800">
                              {field.name} {field.required && <span className="text-rose-500">*</span>}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({field.type})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowStructureMappingModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                انصراف
              </button>

              <div className="flex items-center gap-2">
                {mappingStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setMappingStep((prev) => (prev - 1) as 1 | 2)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    مرحله قبلی
                  </button>
                )}

                {mappingStep < 3 ? (
                  <button
                    type="button"
                    disabled={
                      (mappingStep === 1 && !selectedCatId) ||
                      (mappingStep === 2 && !selectedSubId)
                    }
                    onClick={() => setMappingStep((prev) => (prev + 1) as 2 | 3)}
                    className="px-5 py-2 rounded-xl bg-[#2b64f6] hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>مرحله بعدی</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!selectedTypeId || !newCustomItemName.trim()}
                    onClick={handleCompleteStructureMapping}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأیید ساختار و افزودن به فهرست یکپارچه موجودی‌ها ❮</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

