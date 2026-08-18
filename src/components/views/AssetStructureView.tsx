import React, { useState, useMemo, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Hash,
  ListFilter,
  ToggleLeft,
  FileUp,
  Image as ImageIcon,
  Layers,
  HelpCircle,
  Sparkles,
  Info,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Check,
  X,
  Stethoscope,
  Building,
  Package,
  Boxes,
  Lock,
  Unlock,
  ChevronRight,
  Grid,
  List,
  Maximize2,
  Minimize2,
  Tag,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  AssetClassification,
  AssetRequirementField,
  AssetFieldType,
} from '../../types';
import {
  TAXONOMY_DOMAINS,
  STANDARD_ROLE_OPTIONS,
  RoleOption,
  getInheritedFieldsForNode,
} from '../../data/assetTaxonomyData';

interface AssetStructureViewProps {
  classificationsList: AssetClassification[];
  onAddClassification: (
    newCategory: Omit<AssetClassification, 'id' | 'createdAt' | 'updatedAt' | 'itemsCount'>
  ) => { id: string } | void;
  onUpdateClassification: (updated: AssetClassification) => void;
  onToggleActive: (id: string) => void;
  onDeleteClassification: (id: string) => boolean;
  createStructureTrigger?: number;
}

const FIELD_TYPE_LABELS: Record<
  AssetFieldType,
  { label: string; icon: React.ElementType; color: string; bgBadge: string }
> = {
  text: { label: 'متن ساده', icon: FileText, color: 'text-blue-600', bgBadge: 'bg-blue-50 text-blue-700 border-blue-200' },
  number: { label: 'عدد و رقم', icon: Hash, color: 'text-purple-600', bgBadge: 'bg-purple-50 text-purple-700 border-purple-200' },
  date: { label: 'تاریخ شمسی', icon: Calendar, color: 'text-amber-600', bgBadge: 'bg-amber-50 text-amber-700 border-amber-200' },
  select: { label: 'انتخاب گزینه‌ای', icon: ListFilter, color: 'text-teal-600', bgBadge: 'bg-teal-50 text-teal-700 border-teal-200' },
  boolean: { label: 'بله / خیر', icon: ToggleLeft, color: 'text-indigo-600', bgBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  file: { label: 'فایل / سند', icon: FileUp, color: 'text-rose-600', bgBadge: 'bg-rose-50 text-rose-700 border-rose-200' },
  image: { label: 'تصویر / مدیا', icon: ImageIcon, color: 'text-emerald-600', bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export const AssetStructureView: React.FC<AssetStructureViewProps> = ({
  classificationsList,
  onAddClassification,
  onUpdateClassification,
  onToggleActive,
  onDeleteClassification,
  createStructureTrigger,
}) => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'default' | 'custom'>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'cards'>('tree');

  // Expanded Tree Nodes - Initially all collapsed
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Selected Classification for Inspector Drawer
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'fields' | 'preview' | 'info'>('fields');

  // Modal State for Adding/Editing Structure
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalParentId, setModalParentId] = useState<string>('cat-1');
  const [modalName, setModalName] = useState('');
  const [modalSlug, setModalSlug] = useState('');
  const [modalCode, setModalCode] = useState('');
  const [modalDomain, setModalDomain] = useState<'medical' | 'laboratory' | 'hospital' | 'general_hospital'>('medical');
  const [modalDescription, setModalDescription] = useState('');
  const [modalIsLeaf, setModalIsLeaf] = useState(true);

  // Listen to external create trigger from top header
  useEffect(() => {
    if (createStructureTrigger && createStructureTrigger > 0) {
      handleOpenAddModal();
    }
  }, [createStructureTrigger]);

  // Field Edit / Add Inline in Inspector
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<AssetFieldType>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [newFieldHelp, setNewFieldHelp] = useState('');
  const [newFieldAssignedRole, setNewFieldAssignedRole] = useState<string>('warehouse_keeper');
  const [newFieldOptions, setNewFieldOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState('');

  // Editing existing field
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldType, setEditFieldType] = useState<AssetFieldType>('text');
  const [editFieldRequired, setEditFieldRequired] = useState(false);
  const [editFieldHelp, setEditFieldHelp] = useState('');
  const [editFieldAssignedRole, setEditFieldAssignedRole] = useState<string>('warehouse_keeper');
  const [editFieldOptions, setEditFieldOptions] = useState<string[]>([]);
  const [editOptionInput, setEditOptionInput] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Selected Node Object
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return classificationsList.find((c) => c.id === selectedNodeId) || null;
  }, [selectedNodeId, classificationsList]);

  // Expand / Collapse Helpers
  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    classificationsList.forEach((c) => {
      allIds[c.id] = true;
    });
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = classificationsList.length;
    const defaultCount = classificationsList.filter((c) => !c.isCustom).length;
    const customCount = classificationsList.filter((c) => c.isCustom).length;
    const leafCount = classificationsList.filter((c) => (c.fields && c.fields.length > 0) || c.isLeaf).length;
    const totalFields = classificationsList.reduce((sum, c) => sum + (c.fields ? c.fields.length : 0), 0);
    const totalItems = classificationsList.reduce((sum, c) => sum + (c.itemsCount || 0), 0);

    return { total, defaultCount, customCount, leafCount, totalFields, totalItems };
  }, [classificationsList]);

  // Build Children Map for Fast Hierarchy Traversal
  const childrenMap = useMemo(() => {
    const map = new Map<string | 'root', AssetClassification[]>();
    classificationsList.forEach((item) => {
      const pId = item.parentId || 'root';
      if (!map.has(pId)) {
        map.set(pId, []);
      }
      map.get(pId)!.push(item);
    });
    return map;
  }, [classificationsList]);

  // Filtered Classification List based on tab, domain and search
  const filteredList = useMemo(() => {
    return classificationsList.filter((item) => {
      // Tab Filter: All, Default Reference, Custom
      if (activeTab === 'default' && item.isCustom) return false;
      if (activeTab === 'custom' && !item.isCustom) return false;

      // Domain Filter
      if (selectedDomain !== 'all') {
        if (selectedDomain === 'medical' && item.domain !== 'medical' && !item.path?.includes('تجهیزات پزشکی')) return false;
        if (selectedDomain === 'laboratory' && item.domain !== 'laboratory' && !item.path?.includes('تجهیزات آزمایشگاهی')) return false;
        if (selectedDomain === 'hospital' && item.domain !== 'hospital' && !item.path?.includes('تجهیزات بیمارستانی')) return false;
        if (selectedDomain === 'general_hospital' && item.domain !== 'general_hospital' && !item.path?.includes('اموال عمومی و پشتیبانی')) return false;
        if (selectedDomain === 'custom' && !item.isCustom) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSlug = item.slug.toLowerCase().includes(q);
        const matchesCode = item.code?.toLowerCase().includes(q);
        const matchesPath = item.path?.toLowerCase().includes(q);
        const matchesField = item.fields?.some((f) => f.name.toLowerCase().includes(q));
        return matchesName || matchesSlug || matchesCode || matchesPath || matchesField;
      }

      return true;
    });
  }, [classificationsList, activeTab, selectedDomain, searchQuery]);

  // Filtered Root Nodes
  const rootNodes = useMemo(() => {
    const roots = childrenMap.get('root') || [];
    if (activeTab === 'all' && selectedDomain === 'all' && !searchQuery) {
      return roots;
    }
    // If filtering, we find roots that have matching descendants or match themselves
    const matchingIds = new Set(filteredList.map((c) => c.id));
    return roots.filter((root) => {
      if (matchingIds.has(root.id)) return true;
      // check if any descendant is in matchingIds
      const checkDescendant = (nodeId: string): boolean => {
        const children = childrenMap.get(nodeId) || [];
        for (const child of children) {
          if (matchingIds.has(child.id) || checkDescendant(child.id)) return true;
        }
        return false;
      };
      return checkDescendant(root.id);
    });
  }, [childrenMap, filteredList, activeTab, selectedDomain, searchQuery]);

  // Leaf Directory for Cards View
  const leafNodes = useMemo(() => {
    return filteredList.filter((item) => {
      const hasChildren = (childrenMap.get(item.id) || []).length > 0;
      return item.isLeaf || !hasChildren || (item.fields && item.fields.length > 0);
    });
  }, [filteredList, childrenMap]);

  // --------------------------------------------------------------------------
  // HANDLERS: CUSTOM STRUCTURE MODAL
  // --------------------------------------------------------------------------
  const handleOpenAddModal = (defaultParentId?: string) => {
    setModalParentId(defaultParentId || 'cat-med');
    setModalName('');
    setModalSlug('');
    setModalCode('');
    setModalDomain('medical');
    setModalDescription('');
    setModalIsLeaf(true);
    setIsAddModalOpen(true);
  };

  const handleSaveAddModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim()) {
      alert('لطفاً عنوان ساختار را وارد کنید.');
      return;
    }

    const parentObj = classificationsList.find((c) => c.id === modalParentId);
    const parentPath = parentObj?.path || parentObj?.name || '';
    const generatedPath = parentPath ? `${parentPath} > ${modalName.trim()}` : modalName.trim();
    const generatedSlug = modalSlug.trim() || modalName.trim().toLowerCase().replace(/\s+/g, '-');

    // Initial default fields for newly created medical/asset structure
    const initialFields: AssetRequirementField[] = [
      { id: `f-${Date.now()}-1`, name: 'برند و سازنده', type: 'text', required: true, helpText: 'نام شرکت یا کمپانی سازنده', order: 1 },
      { id: `f-${Date.now()}-2`, name: 'مدل دستگاه', type: 'text', required: true, helpText: 'مدل فنی ثبت‌شده روی پلاک', order: 2 },
      { id: `f-${Date.now()}-3`, name: 'شماره سریال', type: 'text', required: true, helpText: 'شماره سریال یکتا', order: 3 },
      { id: `f-${Date.now()}-4`, name: 'کد اموال', type: 'text', required: true, helpText: 'پلاک اموال بیمارستان', order: 4 },
    ];

    const newStruct = {
      name: modalName.trim(),
      slug: generatedSlug,
      description: modalDescription.trim() || 'ساختار سفارشی ثبت‌شده توسط کاربر بیمارستان.',
      parentId: modalParentId || undefined,
      parentName: parentObj?.name || undefined,
      isCustom: true,
      domain: modalDomain,
      code: modalCode.trim() || `CUST-${Math.floor(100 + Math.random() * 900)}`,
      path: generatedPath,
      isLeaf: modalIsLeaf,
      isActive: true,
      fields: initialFields,
      defaultFieldsBackup: [...initialFields],
    };

    const res = onAddClassification(newStruct);
    setIsAddModalOpen(false);
    showToast(`ساختار سفارشی «${modalName}» با موفقیت به درختواره افزوده شد.`);
    if (res && res.id) {
      setSelectedNodeId(res.id);
      setExpandedNodes((prev) => ({ ...prev, [modalParentId]: true, [res.id]: true }));
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: FIELD MANAGEMENT INSIDE INSPECTOR
  // --------------------------------------------------------------------------
  const handleAddFieldOption = () => {
    if (!optionInput.trim()) return;
    if (!newFieldOptions.includes(optionInput.trim())) {
      setNewFieldOptions([...newFieldOptions, optionInput.trim()]);
    }
    setOptionInput('');
  };

  const handleRemoveFieldOption = (index: number) => {
    setNewFieldOptions(newFieldOptions.filter((_, i) => i !== index));
  };

  const handleSaveNewField = () => {
    if (!selectedNode) return;
    if (!newFieldName.trim()) {
      alert('لطفاً عنوان فیلد را وارد کنید.');
      return;
    }

    const roleDef = STANDARD_ROLE_OPTIONS.find((r) => r.roleCode === newFieldAssignedRole);
    const newField: AssetRequirementField = {
      id: `f-${Date.now()}`,
      name: newFieldName.trim(),
      type: newFieldType,
      required: newFieldRequired,
      helpText: newFieldHelp.trim() || undefined,
      options: newFieldType === 'select' && newFieldOptions.length > 0 ? newFieldOptions : undefined,
      order: (selectedNode.fields?.length || 0) + 1,
      assignedRole: newFieldAssignedRole,
      assignedRoleTitleFa: roleDef?.titleFa || 'انباردار',
    };

    const updatedFields = [...(selectedNode.fields || []), newField];
    const updatedNode: AssetClassification = {
      ...selectedNode,
      fields: updatedFields,
      updatedAt: 'امروز',
    };

    onUpdateClassification(updatedNode);
    setIsAddingField(false);
    setNewFieldName('');
    setNewFieldHelp('');
    setNewFieldOptions([]);
    setNewFieldRequired(true);
    setNewFieldAssignedRole('warehouse_keeper');
    showToast(`فیلد «${newField.name}» به ساختار اضافه شد.`);
  };

  const handleStartEditField = (field: AssetRequirementField) => {
    setEditingFieldId(field.id);
    setEditFieldName(field.name);
    setEditFieldType(field.type);
    setEditFieldRequired(!!field.required);
    setEditFieldHelp(field.helpText || '');
    setEditFieldAssignedRole(field.assignedRole || 'warehouse_keeper');
    setEditFieldOptions(field.options ? [...field.options] : []);
    setEditOptionInput('');
  };

  const handleSaveEditField = () => {
    if (!selectedNode || !editingFieldId) return;
    if (!editFieldName.trim()) {
      alert('عنوان فیلد نباید خالی باشد.');
      return;
    }

    const roleDef = STANDARD_ROLE_OPTIONS.find((r) => r.roleCode === editFieldAssignedRole);
    const updatedFields = (selectedNode.fields || []).map((f) => {
      if (f.id === editingFieldId) {
        return {
          ...f,
          name: editFieldName.trim(),
          type: editFieldType,
          required: editFieldRequired,
          helpText: editFieldHelp.trim() || undefined,
          assignedRole: editFieldAssignedRole,
          assignedRoleTitleFa: roleDef?.titleFa || 'انباردار',
          options: editFieldType === 'select' && editFieldOptions.length > 0 ? editFieldOptions : undefined,
        };
      }
      return f;
    });

    const updatedNode: AssetClassification = {
      ...selectedNode,
      fields: updatedFields,
      updatedAt: 'امروز',
    };

    onUpdateClassification(updatedNode);
    setEditingFieldId(null);
    showToast('تغییرات فیلد ذخیره شد.');
  };

  const handleDeleteField = (fieldId: string) => {
    if (!selectedNode) return;
    const targetField = selectedNode.fields?.find((f) => f.id === fieldId);
    if (!confirm(`آیا از حذف فیلد «${targetField?.name}» از این ساختار اطمینان دارید؟`)) return;

    const updatedFields = (selectedNode.fields || []).filter((f) => f.id !== fieldId);
    const updatedNode: AssetClassification = {
      ...selectedNode,
      fields: updatedFields,
      updatedAt: 'امروز',
    };

    onUpdateClassification(updatedNode);
    showToast('فیلد با موفقیت حذف گردید.');
  };

  const handleToggleFieldRequired = (fieldId: string) => {
    if (!selectedNode) return;
    const updatedFields = (selectedNode.fields || []).map((f) => {
      if (f.id === fieldId) {
        return { ...f, required: !f.required };
      }
      return f;
    });

    const updatedNode: AssetClassification = {
      ...selectedNode,
      fields: updatedFields,
      updatedAt: 'امروز',
    };

    onUpdateClassification(updatedNode);
  };

  const handleResetFieldsToDefault = () => {
    if (!selectedNode) return;
    if (!selectedNode.defaultFieldsBackup || selectedNode.defaultFieldsBackup.length === 0) {
      alert('نسخه پیش‌فرض مرجع برای این ساختار یافت نشد.');
      return;
    }

    if (
      !confirm(
        'آیا می‌خواهید تمام فیلدهای این ساختار را به فیلدهای استاندارد مرجع بازنشانی کنید؟ تمام تغییرات شخصی شما بازنویسی خواهد شد.'
      )
    ) {
      return;
    }

    const updatedNode: AssetClassification = {
      ...selectedNode,
      fields: JSON.parse(JSON.stringify(selectedNode.defaultFieldsBackup)),
      updatedAt: 'امروز',
    };

    onUpdateClassification(updatedNode);
    showToast('فیلدهای ساختار به تنظیمات استاندارد مرجع بازنشانی شدند.');
  };

  const handleDeleteStructure = (nodeId: string) => {
    const target = classificationsList.find((c) => c.id === nodeId);
    if (!target) return;

    if (!target.isCustom) {
      alert('ساختارهای پیش‌فرض مرجع قابل حذف نیستند. در صورت نیاز می‌توانید آنها را غیرفعال کنید.');
      return;
    }

    if (!confirm(`آیا از حذف ساختار سفارشی «${target.name}» مطمئن هستید؟`)) return;

    const ok = onDeleteClassification(nodeId);
    if (ok) {
      showToast(`ساختار «${target.name}» با موفقیت حذف شد.`);
      if (selectedNodeId === nodeId) {
        setSelectedNodeId('type-icu-vent');
      }
    }
  };

  // --------------------------------------------------------------------------
  // RECURSIVE TREE RENDERER
  // --------------------------------------------------------------------------
  const renderTreeNode = (node: AssetClassification, level: number = 0) => {
    const children = childrenMap.get(node.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = selectedNodeId === node.id;
    const isLeafNode = node.isLeaf || (!hasChildren && (node.fields?.length || 0) > 0);

    return (
      <div key={node.id} className="relative select-none">
        {/* Node Row */}
        <div
          onClick={() => setSelectedNodeId(node.id)}
          className={`group flex items-center justify-between px-3 py-2.5 my-1 rounded-xl transition-all cursor-pointer border ${
            isSelected
              ? 'bg-sky-50/90 border-sky-300 text-sky-950 shadow-sm ring-2 ring-sky-400/20'
              : 'bg-white hover:bg-slate-50/80 border-slate-200/80 text-slate-800'
          }`}
          style={{ marginRight: `${level * 18}px` }}
        >
          {/* Left / Right Content: Expander + Icon + Title + Badges */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Expand / Collapse Button */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                className={`p-1 rounded-lg transition-colors ${
                  isExpanded
                    ? 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-sky-400" />
              </div>
            )}

            {/* Level Icon */}
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                node.isCustom
                  ? 'bg-purple-100 text-purple-700'
                  : level === 0
                  ? 'bg-blue-100 text-blue-700'
                  : level === 1
                  ? 'bg-sky-100 text-sky-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {node.isCustom ? (
                <Sparkles className="w-4 h-4" />
              ) : level === 0 ? (
                <FolderTree className="w-4 h-4" />
              ) : level === 1 ? (
                <Layers className="w-4 h-4" />
              ) : (
                <Stethoscope className="w-4 h-4" />
              )}
            </div>

            {/* Name and Path snippet */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span title={node.name} className="font-bold text-sm tracking-tight truncate">{node.name}</span>
                {node.code && (
                  <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    {node.code}
                  </span>
                )}
              </div>
              {node.slug && (
                <p className="text-[11px] text-slate-400 font-mono truncate">{node.slug}</p>
              )}
            </div>
          </div>

          {/* Right Badges & Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Level Tier Badge */}
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border hidden sm:inline-flex items-center gap-1 ${
                level === 0
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : level === 1
                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {level === 0 ? 'رده اول (Category)' : level === 1 ? 'رده دوم (Subcategory)' : 'رده سوم (Type)'}
            </span>

            {/* Custom vs Default Badge */}
            {node.isCustom ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-3 h-3 text-purple-600" />
                سفارشی مرکز
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                <ShieldCheck className="w-3 h-3 text-sky-600" />
                مرجع
              </span>
            )}

            {/* Fields Count Badge if Leaf or has fields */}
            {(node.fields?.length || 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                <Tag className="w-3 h-3 text-slate-500" />
                {node.fields?.length} فیلد
              </span>
            )}

            {/* Items Count Badge */}
            {(node.itemsCount || 0) > 0 && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-block">
                {node.itemsCount} قلم
              </span>
            )}

            {/* Quick Add Subcategory for branches */}
            <button
              type="button"
              title="افزودن زیرشاخه سفارشی به این بخش"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddModal(node.id);
              }}
              className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="relative pr-3 border-r-2 border-slate-200 mr-3 my-0.5">
            {children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 pt-2 px-3 sm:px-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ================================================================= */}
        {/* ACTIONS & SEARCH FILTERS BAR */}
        {/* ================================================================= */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          {/* Top Controls Row: View Mode & Expand/Collapse Controls side-by-side */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* View Mode & Expand / Collapse Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* View Mode Toggle: Tree vs Category Cards */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('tree')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'tree' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>نمای درختی</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>فهرست رده‌ها</span>
                </button>
              </div>

              {/* Visual Divider */}
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              {/* Expand / Collapse Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={expandAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                  title="گسترش همه شاخه‌ها"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>گسترش همه</span>
                </button>

                <button
                  type="button"
                  onClick={collapseAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                  title="بستن همه شاخه‌ها"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>بستن همه</span>
                </button>
              </div>
            </div>

            {/* Total structures counter info */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl font-medium">
                تعداد کل رده‌ها و ساختارها: <strong className="text-slate-900 font-bold">{metrics.total}</strong>
              </span>
            </div>
          </div>

          {/* Domain Chips & Search Input */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Domain Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {TAXONOMY_DOMAINS.map((dom) => {
                const isSelected = selectedDomain === dom.id;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => setSelectedDomain(dom.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {dom.shortLabel}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در ساختارها، کدها و فیلدها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MAIN WORKSPACE: TREE/CARDS VIEW (RIGHT) + INSPECTOR DRAWER (LEFT) */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content Area: Tree or Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm min-h-[500px]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-800 text-sm">
                    {viewMode === 'tree' ? 'درختواره سلسله‌مراتبی اموال' : 'فهرست ساختارهای نهایی'}
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">
                    ({filteredList.length} مورد منطبق)
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  جهت شخصی‌سازی فیلدها، روی هر ساختار کلیک نمایید
                </div>
              </div>

              {filteredList.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <FolderTree className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">ساختاری با فیلترهای انتخابی یافت نشد.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('all');
                      setSelectedDomain('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-sky-600 hover:underline font-bold"
                  >
                    پاکسازی تمام فیلترها
                  </button>
                </div>
              ) : viewMode === 'tree' ? (
                /* TREE VIEW */
                <div className="space-y-1">
                  {rootNodes.map((root) => renderTreeNode(root, 0))}
                </div>
              ) : (
                /* CARDS VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {leafNodes.map((leaf) => {
                    const isSelected = selectedNodeId === leaf.id;
                    return (
                      <div
                        key={leaf.id}
                        onClick={() => setSelectedNodeId(leaf.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                          isSelected
                            ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-400/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded-lg ${
                                leaf.isCustom
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-sky-100 text-sky-700'
                              }`}
                            >
                              {leaf.isCustom ? (
                                <Sparkles className="w-4 h-4" />
                              ) : (
                                <Stethoscope className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-xs leading-tight">
                                {leaf.name}
                              </h3>
                              {leaf.code && (
                                <span className="text-[10px] font-mono text-slate-500">
                                  {leaf.code}
                                </span>
                              )}
                            </div>
                          </div>
                          {leaf.isCustom ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              سفارشی
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                              مرجع
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {leaf.description || 'بدون توضیحات تکمیلی'}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-slate-400" />
                            {leaf.fields?.length || 0} فیلد ثبت
                          </span>
                          <span className="font-medium text-slate-500">
                            {leaf.itemsCount || 0} دستگاه موجود
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* =============================================================== */}
          {/* INSPECTOR & FIELD CUSTOMIZATION DRAWER (LEFT SIDE) */}
          {/* =============================================================== */}
          <div className="lg:col-span-5 space-y-4">
            {selectedNode ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 sticky top-4">
                {/* Inspector Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {selectedNode.isCustom ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          <Sparkles className="w-3 h-3" />
                          ساختار سفارشی مرکز
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          <ShieldCheck className="w-3 h-3" />
                          ساختار استاندارد مرجع
                        </span>
                      )}
                      {selectedNode.code && (
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {selectedNode.code}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg leading-tight">
                      {selectedNode.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {selectedNode.slug}
                    </p>
                  </div>

                  {/* Active Toggle & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      title={selectedNode.isActive ? 'غیرفعال‌سازی ساختار' : 'فعال‌سازی ساختار'}
                      onClick={() => onToggleActive(selectedNode.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        selectedNode.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {selectedNode.isActive ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>

                    {selectedNode.isCustom && (
                      <button
                        type="button"
                        title="حذف ساختار سفارشی"
                        onClick={() => handleDeleteStructure(selectedNode.id)}
                        className="p-1.5 rounded-lg border bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Path Breadcrumb */}
                {selectedNode.path && (
                  <div className="text-[11px] bg-slate-50 p-2 rounded-xl text-slate-600 border border-slate-100 leading-relaxed font-medium">
                    <span className="text-slate-400 ml-1">مسیر:</span>
                    {selectedNode.path}
                  </div>
                )}

                {/* Inspector Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setInspectorTab('fields')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                      inspectorTab === 'fields'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    فیلدهای ثبت ({selectedNode.fields?.length || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectorTab('preview')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                      inspectorTab === 'preview'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    پیش‌نمایش فرم ثبت
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectorTab('info')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                      inspectorTab === 'info'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    مشخصات فنی
                  </button>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* TAB 1: FIELD MANAGER */}
                {/* ----------------------------------------------------------- */}
                {inspectorTab === 'fields' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>فیلدهای اطلاعاتی ثبت موجودی</span>
                      <div className="flex items-center gap-1.5">
                        {!selectedNode.isCustom && selectedNode.defaultFieldsBackup && (
                          <button
                            type="button"
                            onClick={handleResetFieldsToDefault}
                            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] transition-colors"
                            title="بازنشانی فیلدها به مقادیر استاندارد مرجع"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-500" />
                            بازنشانی مرجع
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingField(!isAddingField);
                            setEditingFieldId(null);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          افزودن فیلد
                        </button>
                      </div>
                    </div>

                    {/* Inline Add Field Form */}
                    {isAddingField && (
                      <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-sky-900">تعریف فیلد جدید</span>
                          <button
                            type="button"
                            onClick={() => setIsAddingField(false)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">
                              عنوان فیلد <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="مثال: فشار کاری گاز هلیوم"
                              value={newFieldName}
                              onChange={(e) => setNewFieldName(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-medium mb-1">نوع فیلد</label>
                            <select
                              value={newFieldType}
                              onChange={(e) => setNewFieldType(e.target.value as AssetFieldType)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-sans"
                            >
                              {Object.entries(FIELD_TYPE_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-medium mb-1">مسئول تکمیل فیلد</label>
                            <select
                              value={newFieldAssignedRole}
                              onChange={(e) => setNewFieldAssignedRole(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-sans"
                            >
                              {STANDARD_ROLE_OPTIONS.map((role) => (
                                <option key={role.roleCode} value={role.roleCode}>
                                  {role.titleFa}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1 text-xs">
                            متن راهنما برای کاربر (Help Text)
                          </label>
                          <input
                            type="text"
                            placeholder="توضیح کوتاه برای پر کردن این فیلد در فرم"
                            value={newFieldHelp}
                            onChange={(e) => setNewFieldHelp(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          />
                        </div>

                        {/* Options if select */}
                        {newFieldType === 'select' && (
                          <div className="space-y-1.5 text-xs">
                            <label className="block text-slate-700 font-medium">گزینه‌های انتخابی</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="گزینه جدید را بنویسید..."
                                value={optionInput}
                                onChange={(e) => setOptionInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddFieldOption();
                                  }
                                }}
                                className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleAddFieldOption}
                                className="px-2.5 py-1 bg-slate-800 text-white rounded-lg font-bold"
                              >
                                افزودن
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {newFieldOptions.map((opt, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700"
                                >
                                  {opt}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFieldOption(idx)}
                                    className="text-slate-400 hover:text-rose-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={newFieldRequired}
                              onChange={(e) => setNewFieldRequired(e.target.checked)}
                              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                            />
                            تکمیل این فیلد الزامی باشد
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsAddingField(false)}
                              className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                            >
                              انصراف
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveNewField}
                              className="px-3 py-1 text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm"
                            >
                              ذخیره فیلد
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Field List */}
                    {(!selectedNode.fields || selectedNode.fields.length === 0) ? (
                      <div className="p-5 text-center bg-slate-50/80 rounded-xl border border-dashed border-slate-300/80 space-y-3">
                        <div className="inline-flex items-center justify-center p-2.5 bg-sky-50 text-sky-700 rounded-xl">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {!selectedNode.parentId
                              ? 'رده اول ساختار (Category) - فاقد فیلد ثبت مستقیم'
                              : (childrenMap[selectedNode.id]?.length || 0) > 0
                              ? 'رده دوم ساختار (Subcategory) - فاقد فیلد ثبت مستقیم'
                              : 'فیلد اختصاصی برای این ساختار ثبت نشده است'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                            {!selectedNode.parentId
                              ? 'بر اساس ساختار ۳ سطحی مرجع، رده اول شامل زیرگروه‌ها (Subcategory) بوده و فیلدهای ثبت موجودی در سطح سوم (Type) تعریف می‌شوند.'
                              : (childrenMap[selectedNode.id]?.length || 0) > 0
                              ? 'بر اساس ساختار ۳ سطحی مرجع، رده دوم شامل انواع کالا و تجهیزات (Type) بوده و فیلدهای ثبت در سطح سوم تعریف می‌شوند.'
                              : 'برای افزودن فیلدهای اختصاصی به این ساختار، روی دکمه «افزودن فیلد» در بالا کلیک کنید.'}
                          </p>
                        </div>

                        {/* Child nodes quick navigation */}
                        {(childrenMap[selectedNode.id]?.length || 0) > 0 && (
                          <div className="pt-2 border-t border-slate-200/60 text-right">
                            <p className="text-[11px] font-bold text-slate-700 mb-2">
                              {!selectedNode.parentId ? 'زیردسته‌های این رده (Subcategories):' : 'انواع تجهیزات این زیردسته (Types):'}
                            </p>
                            <div className="flex flex-wrap gap-1.5 justify-start">
                              {childrenMap[selectedNode.id].map((child) => (
                                <button
                                  key={child.id}
                                  type="button"
                                  onClick={() => setSelectedNodeId(child.id)}
                                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 rounded-lg text-slate-700 transition-colors shadow-2xs"
                                >
                                  <span>{child.name}</span>
                                  {(child.fields?.length || 0) > 0 && (
                                    <span className="text-[10px] px-1 py-0.2 bg-slate-100 rounded text-slate-600 font-mono">
                                      {child.fields.length} فیلد
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedNode.fields.map((f, index) => {
                          const typeMeta = FIELD_TYPE_LABELS[f.type] || FIELD_TYPE_LABELS.text;
                          const isEditing = editingFieldId === f.id;

                          if (isEditing) {
                            return (
                              <div
                                key={f.id}
                                className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5 text-xs animate-in fade-in duration-100"
                              >
                                <div className="font-bold text-amber-900">ویرایش فیلد «{f.name}»</div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div>
                                    <label className="block text-slate-700 font-medium mb-1">عنوان</label>
                                    <input
                                      type="text"
                                      value={editFieldName}
                                      onChange={(e) => setEditFieldName(e.target.value)}
                                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-700 font-medium mb-1">نوع</label>
                                    <select
                                      value={editFieldType}
                                      onChange={(e) => setEditFieldType(e.target.value as AssetFieldType)}
                                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-sans"
                                    >
                                      {Object.entries(FIELD_TYPE_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>
                                          {v.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-slate-700 font-medium mb-1">مسئول تکمیل</label>
                                    <select
                                      value={editFieldAssignedRole}
                                      onChange={(e) => setEditFieldAssignedRole(e.target.value)}
                                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-sans"
                                    >
                                      {STANDARD_ROLE_OPTIONS.map((role) => (
                                        <option key={role.roleCode} value={role.roleCode}>
                                          {role.titleFa}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-slate-700 font-medium mb-1">راهنما</label>
                                  <input
                                    type="text"
                                    value={editFieldHelp}
                                    onChange={(e) => setEditFieldHelp(e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg"
                                  />
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                                    <input
                                      type="checkbox"
                                      checked={editFieldRequired}
                                      onChange={(e) => setEditFieldRequired(e.target.checked)}
                                      className="rounded text-amber-600 w-3.5 h-3.5"
                                    />
                                    الزامی
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setEditingFieldId(null)}
                                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded"
                                    >
                                      انصراف
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleSaveEditField}
                                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded"
                                    >
                                      ذخیره
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={f.id}
                              className="p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl transition-all flex items-start justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-xs text-slate-900">{f.name}</span>
                                  {f.required ? (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                      الزامی *
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-600">
                                      اختیاری
                                    </span>
                                  )}
                                  <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${typeMeta.bgBadge}`}>
                                    {typeMeta.label}
                                  </span>
                                  {f.assignedRoleTitleFa && (
                                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                      مسئول: {f.assignedRoleTitleFa}
                                    </span>
                                  )}
                                </div>
                                {f.helpText && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                    {f.helpText}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  title="تغییر وضعیت الزامی / اختیاری"
                                  onClick={() => handleToggleFieldRequired(f.id)}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                    f.required
                                      ? 'bg-rose-100 text-rose-700 border-rose-200'
                                      : 'bg-slate-200 text-slate-600 border-slate-300'
                                  }`}
                                >
                                  {f.required ? 'اجباری' : 'اختیاری'}
                                </button>
                                <button
                                  type="button"
                                  title="ویرایش مشخصات فیلد"
                                  onClick={() => handleStartEditField(f)}
                                  className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="حذف فیلد"
                                  onClick={() => handleDeleteField(f.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ----------------------------------------------------------- */}
                {/* TAB 2: LIVE PREVIEW OF INVENTORY REGISTRATION FORM */}
                {/* ----------------------------------------------------------- */}
                {inspectorTab === 'preview' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl text-xs text-sky-900 leading-relaxed">
                      این پیش‌نمایش نحوه رندر فیلدهای این ساختار در زمان ثبت اموال/رسید در ماژول انبار را نمایش می‌دهد.
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                      <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
                        فرم مشخصات فنی — {selectedNode.name}
                      </div>

                      {(!selectedNode.fields || selectedNode.fields.length === 0) ? (
                        <p className="text-xs text-slate-400 text-center py-4">فیلدی برای نمایش وجود ندارد.</p>
                      ) : (
                        <div className="space-y-3 text-xs">
                          {selectedNode.fields.map((f) => (
                            <div key={f.id} className="space-y-1">
                              <label className="block text-slate-700 font-semibold">
                                {f.name}
                                {f.required && <span className="text-rose-500 font-bold mr-1">*</span>}
                              </label>

                              {f.type === 'select' ? (
                                <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20">
                                  <option value="">انتخاب کنید...</option>
                                  {(f.options || ['گزینه پیش‌فرض ۱', 'گزینه پیش‌فرض ۲']).map((opt, i) => (
                                    <option key={i} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : f.type === 'boolean' ? (
                                <div className="flex items-center gap-4 pt-1">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="radio" name={`prev-${f.id}`} className="text-sky-600" />
                                    <span>بله</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="radio" name={`prev-${f.id}`} className="text-sky-600" defaultChecked />
                                    <span>خیر</span>
                                  </label>
                                </div>
                              ) : f.type === 'number' ? (
                                <input
                                  type="number"
                                  placeholder={f.helpText || 'مقدار عددی...'}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              ) : f.type === 'date' ? (
                                <input
                                  type="text"
                                  placeholder="۱۴۰۳/۰۵/۲۰"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              ) : (
                                <input
                                  type="text"
                                  placeholder={f.helpText || 'ورود مقدار...'}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              )}

                              {f.helpText && (
                                <span className="text-[11px] text-slate-400 block">{f.helpText}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------- */}
                {/* TAB 3: TECHNICAL INFO & DESCRIPTION */}
                {/* ----------------------------------------------------------- */}
                {inspectorTab === 'info' && (
                  <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900">توضیحات ساختار</div>
                      <p className="text-slate-600">
                        {selectedNode.description || 'توضیحات تکمیلی ثبت نشده است.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block">شناسه یکتا (ID)</span>
                        <span className="font-mono font-bold text-slate-800">{selectedNode.id}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block">شناسه نام (Slug)</span>
                        <span className="font-mono font-bold text-slate-800">{selectedNode.slug}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block">تاریخ ایجاد</span>
                        <span className="font-bold text-slate-800">{selectedNode.createdAt || '۱۴۰۱/۰۱/۰۱'}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block">آخرین به‌روزرسانی</span>
                        <span className="font-bold text-slate-800">{selectedNode.updatedAt || 'امروز'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center text-slate-400 space-y-3">
                <FolderTree className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-medium">یک ساختار را از لیست انتخاب کنید تا فیلدها و جزییات آن نمایش داده شود.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL: CREATE CUSTOM STRUCTURE */}
      {/* =================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-base">ایجاد ساختار سفارشی جدید</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddModal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  نام ساختار اموال (فارسی) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: شتاب‌دهنده خطی پرتو درمانی (Medical LINAC)"
                  value={modalName}
                  onChange={(e) => {
                    setModalName(e.target.value);
                    if (!modalSlug) {
                      setModalSlug(e.target.value.trim().toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">شاخه والد در درختواره</label>
                  <select
                    value={modalParentId}
                    onChange={(e) => setModalParentId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-sans"
                  >
                    <option value="">بدون والد (شاخه ریشه اصلی)</option>
                    {classificationsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.isCustom ? '(سفارشی)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">حوزه و قلمرو</label>
                  <select
                    value={modalDomain}
                    onChange={(e) => setModalDomain(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-sans"
                  >
                    <option value="medical">تجهیزات پزشکی (Category ۱)</option>
                    <option value="laboratory">تجهیزات آزمایشگاهی (Category ۲)</option>
                    <option value="hospital">تجهیزات بیمارستانی (Category ۳)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">نام انگلیسی / شناسه (Slug)</label>
                  <input
                    type="text"
                    placeholder="medical-linac"
                    value={modalSlug}
                    onChange={(e) => setModalSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">کد رده‌بندی استاندارد</label>
                  <input
                    type="text"
                    placeholder="CUST-01"
                    value={modalCode}
                    onChange={(e) => setModalCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">توضیحات و دامنه کاربرد</label>
                <textarea
                  rows={2}
                  placeholder="توضیح کوتاه درباره این دستگاه و ویژگی‌های فنی آن..."
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px] leading-relaxed">
                با ایجاد ساختار، فیلدهای پیش‌فرض استاندارد (برند، مدل، شماره سریال، کد اموال) به‌طور خودکار تعریف شده و شما می‌توانید بلافاصله در پنل فیلدها، فیلدهای دلخواه خود را نیز اضافه کنید.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 transition-all active:scale-95"
                >
                  ثبت و ایجاد ساختار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
