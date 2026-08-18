import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Package,
  Boxes,
  Activity,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  Layers,
  List,
  FolderTree,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  FileUp,
  Loader2,
  Sparkles,
  CheckCircle2,
  Edit3,
  FolderPlus,
  Check,
  X,
  FileCheck,
  Folder,
  Layers3,
  SlidersHorizontal,
  Trash2,
  Send,
  Award,
  ShieldCheck,
  Wrench,
  Ban,
  QrCode,
  Archive,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ClipboardList,
  Printer,
  Building2,
  FileSignature,
  TrendingUp,
  MessageSquare,
  MessageSquarePlus,
  Star,
  ThumbsUp,
  ShoppingCart,
  RotateCcw,
} from 'lucide-react';
import { EquipmentItem, EquipmentComment, AssetClassification, AssetRequirementField, AppUser, EquipmentStatus, ItemKind, CustomEquipmentFilter, PageId } from '../../types';
import { SearchableSelect, SelectOption } from '../common/SearchableSelect';
import {
  getAllPermittedEquipmentProducts,
  RAW_EQUIPMENT_CATALOG,
  resolveTaxonomyForProduct,
  EquipmentProductReference,
} from '../../data/equipmentCatalogProducts';
import { STANDARD_ROLE_OPTIONS, INITIAL_STRUCTURES_DATA } from '../../data/assetTaxonomyData';
import { SmartInventoryPicker } from '../inventory/SmartInventoryPicker';
import {
  recordAndLearnInventoryItem,
  syncExistingInventoryWithMemory,
  getLearnedInventoryCatalog,
  resolveTaxonomyForLearnedItem,
  LearnedInventoryItem,
} from '../../data/learnedInventoryMemory';

interface InventoryViewProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  classificationsList?: AssetClassification[];
  customFiltersList?: CustomEquipmentFilter[];
  initialCustomFilterId?: string | null;
  onNavigateToFilterBuilder?: () => void;
  onAddEquipment: (item: EquipmentItem) => void;
  onUpdateEquipment: (item: EquipmentItem) => void;
  onAddClassification: (
    newCategory: Omit<AssetClassification, 'id' | 'createdAt' | 'updatedAt' | 'itemsCount'>
  ) => void;
  selectedEquipmentParam?: EquipmentItem | null;
  onNavigateToCalibration?: (equipment: EquipmentItem) => void;
  setActivePage?: (page: PageId) => void;
  initialTab?: 'drafts' | 'inventory';
  initialLayout?: 'grouped' | 'individual' | 'tree';
  initialStatusFilter?: string;
  actionGuidance?: {
    type: 'draft_tagging' | 'low_stock' | 'asset_transfer' | 'purchase_approval' | string;
    title?: string;
    description?: string;
    message?: string;
    targetDraftId?: string;
  } | null;
  openAssetTransferModal?: boolean;
  openQuickRestockModal?: boolean;
  onClearActionGuidance?: () => void;
}

interface GroupedProduct {
  groupName: string;
  category: string;
  brand: string;
  model: string;
  items: EquipmentItem[];
  totalQuantity: number;
  unit: string;
  recordCount: number;
  suppliers: string[];
  nearestExpiry: string;
  overallStatus: string;
}

export function getItemCalibrationStatus(item: EquipmentItem): 'valid' | 'expiring_soon' | 'expired' | 'in_progress' | 'not_required' {
  const isConsumable =
    item.itemKind === 'consumable' ||
    ['بسته', 'جعبه', 'عدد', 'کارتن', 'رول', 'لیتر', 'ست'].includes(item.unit || '') ||
    (item.category &&
      (item.category.includes('مصرفی') ||
        item.category.includes('دارویی') ||
        item.category.includes('بهداشتی') ||
        item.category.includes('تزریقات')));
  if (isConsumable) return 'not_required';
  if (item.status === 'calibrating') return 'in_progress';
  if (
    !item.nextCalibrationDate ||
    item.nextCalibrationDate === '-' ||
    item.nextCalibrationDate.includes('منقضی') ||
    item.nextCalibrationDate.includes('۱۴۰۲') ||
    item.nextCalibrationDate.includes('۱۴۰۳')
  ) {
    return 'expired';
  }
  if (
    item.nextCalibrationDate.includes('۱۴۰۴/۰۱') ||
    item.nextCalibrationDate.includes('۱۴۰۴/۰۲') ||
    item.nextCalibrationDate.includes('۱۴۰۴/۰۳') ||
    item.nextCalibrationDate.includes('۱۴۰۴/۰۴') ||
    item.nextCalibrationDate.includes('۱۴۰۴/۰۵') ||
    item.nextCalibrationDate.includes('۱۴۰۴/۰۶')
  ) {
    return 'expiring_soon';
  }
  return 'valid';
}

export function getItemCalibrationPeriod(item: EquipmentItem): '3_months' | '6_months' | '12_months' | '24_months' {
  if (item.specs?.['دوره کالیبراسیون']) {
    const val = item.specs['دوره کالیبراسیون'];
    if (val.includes('۳') || val.includes('3')) return '3_months';
    if (val.includes('۶') || val.includes('6')) return '6_months';
    if (val.includes('۲۴') || val.includes('24') || val.includes('۲ سال')) return '24_months';
    return '12_months';
  }
  const text = `${item.faName} ${item.category}`.toLowerCase();
  if (text.includes('شوک') || text.includes('حیاتی') || text.includes('قلبی')) return '3_months';
  if (
    text.includes('بیهوشی') ||
    text.includes('ونتیلاتور') ||
    text.includes('مانیتور') ||
    text.includes('کوتر') ||
    text.includes('پمپ') ||
    text.includes('تنفسی')
  ) {
    return '6_months';
  }
  if (
    text.includes('تخت') ||
    text.includes('چراغ') ||
    text.includes('نگاتوسکوپ') ||
    text.includes('برانکارد') ||
    text.includes('صندلی')
  ) {
    return '24_months';
  }
  return '12_months';
}

export function getItemExpiryStatus(
  item: EquipmentItem
): 'expired' | 'near_3m' | 'near_6m' | 'near_year' | 'valid' | 'no_expiry' {
  if (!item.expiryDate || item.expiryDate === '-' || item.expiryDate.trim() === '') return 'no_expiry';
  if (item.status === 'expired' || item.expiryDate.includes('۱۴۰۲') || item.expiryDate.includes('۱۴۰۳')) {
    return 'expired';
  }
  if (
    item.status === 'near_expiry' ||
    item.expiryDate.includes('۱۴۰۴/۰۱') ||
    item.expiryDate.includes('۱۴۰۴/۰۲') ||
    item.expiryDate.includes('۱۴۰۴/۰۳') ||
    item.expiryDate.includes('۱۴۰۴/۰۴')
  ) {
    return 'near_3m';
  }
  if (
    item.expiryDate.includes('۱۴۰۴/۰۵') ||
    item.expiryDate.includes('۱۴۰۴/۰۶') ||
    item.expiryDate.includes('۱۴۰۴/۰۷') ||
    item.expiryDate.includes('۱۴۰۴/۰۸')
  ) {
    return 'near_6m';
  }
  if (item.expiryDate.includes('۱۴۰۴')) return 'near_year';
  return 'valid';
}

export function getItemWarrantyStatus(item: EquipmentItem): 'valid' | 'near_expiry' | 'expired_none' {
  if (
    !item.warrantyExpiry ||
    item.warrantyExpiry === '-' ||
    item.warrantyExpiry.includes('منقضی') ||
    item.warrantyExpiry.includes('۱۴۰۲') ||
    item.warrantyExpiry.includes('۱۴۰۳')
  ) {
    return 'expired_none';
  }
  if (item.warrantyExpiry.includes('۱۴۰۴')) return 'near_expiry';
  return 'valid';
}

export function getItemRiskLevel(item: EquipmentItem): 'high' | 'medium' | 'low' {
  const text = `${item.faName} ${item.category} ${item.department}`.toLowerCase();
  if (
    text.includes('شوک') ||
    text.includes('بیهوشی') ||
    text.includes('ونتیلاتور') ||
    text.includes('icu') ||
    text.includes('ccu') ||
    text.includes('اتاق عمل') ||
    text.includes('قلب')
  ) {
    return 'high';
  }
  if (
    text.includes('مانیتور') ||
    text.includes('تصویر') ||
    text.includes('سونوگرافی') ||
    text.includes('اتوکلاو') ||
    text.includes('پمپ') ||
    text.includes('رادیولوژی') ||
    text.includes('ساکشن') ||
    text.includes('آزمایشگاه')
  ) {
    return 'medium';
  }
  return 'low';
}

export function getItemSafetyLevel(item: EquipmentItem): 'high_90' | 'medium_70_89' | 'low_70' {
  const sc = item.safetyScore ?? 95;
  if (sc >= 95) return 'high_90';
  if (sc >= 85) return 'medium_70_89';
  return 'low_70';
}

export function getItemStockStatus(item: EquipmentItem): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (item.status === 'out_of_stock' || item.quantity === 0) return 'out_of_stock';
  if (
    item.status === 'low_stock' ||
    (item.quantity !== undefined && item.quantity > 0 && item.quantity <= 15)
  ) {
    return 'low_stock';
  }
  return 'in_stock';
}

export const StatusBadge: React.FC<{ item: EquipmentItem; compact?: boolean }> = ({ item, compact = false }) => {
  const isConsumable =
    item.itemKind === 'consumable' ||
    ['بسته', 'جعبه', 'عدد', 'کارتن', 'رول', 'لیتر', 'ست'].includes(item.unit || '') ||
    (item.category &&
      (item.category.includes('مصرفی') ||
        item.category.includes('دارویی') ||
        item.category.includes('بهداشتی') ||
        item.category.includes('تزریقات')));

  let st = item.status;
  if (!st) {
    if (isConsumable) {
      st = item.quantity === 0 ? 'out_of_stock' : item.quantity < 20 ? 'low_stock' : 'in_stock';
    } else {
      st = 'active';
    }
  }

  let label = 'فعال';
  let badgeStyle = 'bg-blue-50 text-[#2b64f6] border-blue-200';
  let dotStyle = 'bg-blue-500';

  switch (st) {
    // Devices & Equipment
    case 'in_use':
      label = 'در حال استفاده';
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      dotStyle = 'bg-emerald-500 animate-pulse';
      break;
    case 'active':
      label = isConsumable ? 'موجود در انبار' : 'فعال و آماده به کار';
      badgeStyle = 'bg-blue-50 text-[#2b64f6] border-blue-200/90 font-bold';
      dotStyle = 'bg-blue-500';
      break;
    case 'under_maintenance':
      label = 'در حال تعمیر';
      badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      dotStyle = 'bg-amber-500';
      break;
    case 'calibrating':
      label = 'در حال کالیبراسیون';
      badgeStyle = 'bg-sky-50 text-sky-800 border-sky-200/90 font-bold';
      dotStyle = 'bg-sky-500';
      break;
    case 'idle':
      label = 'بلااستفاده / مازاد';
      badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300 font-bold';
      dotStyle = 'bg-slate-400';
      break;
    case 'decommissioned':
      label = 'اسقاط شده';
      badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200/90 font-bold';
      dotStyle = 'bg-rose-500';
      break;

    // Consumables & Supplies
    case 'in_stock':
      label = 'موجود در انبار';
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/90 font-bold';
      dotStyle = 'bg-emerald-500';
      break;
    case 'low_stock':
      label = 'کمبود موجودی';
      badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      dotStyle = 'bg-amber-500';
      break;
    case 'out_of_stock':
      label = 'تمام شده / ناموجود';
      badgeStyle = 'bg-rose-50 text-rose-700 border-rose-300 font-extrabold';
      dotStyle = 'bg-rose-500';
      break;
    case 'expired':
      label = 'منقضی شده';
      badgeStyle = 'bg-red-100 text-red-800 border-red-300 font-extrabold';
      dotStyle = 'bg-red-600';
      break;
    case 'near_expiry':
      label = 'در شرف انقضا';
      badgeStyle = 'bg-orange-50 text-orange-800 border-orange-200/90 font-bold';
      dotStyle = 'bg-orange-500';
      break;
    case 'draft':
      label = 'پیش‌نویس';
      badgeStyle = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      dotStyle = 'bg-amber-600';
      break;
    default:
      label = 'فعال';
      badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
      dotStyle = 'bg-slate-400';
      break;
  }

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] whitespace-nowrap ${badgeStyle}`}
        title={`وضعیت: ${label}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle}`} />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap shadow-2xs ${badgeStyle}`}
      title={`وضعیت: ${label}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotStyle}`} />
      <span>{label}</span>
    </span>
  );
};

export function getItemStatusDescription(item: EquipmentItem): string {
  const isConsumable =
    item.itemKind === 'consumable' ||
    ['بسته', 'جعبه', 'عدد', 'کارتن', 'رول', 'لیتر', 'ست'].includes(item.unit || '') ||
    (item.category &&
      (item.category.includes('مصرفی') ||
        item.category.includes('دارویی') ||
        item.category.includes('بهداشتی') ||
        item.category.includes('تزریقات')));

  const st = item.status;
  switch (st) {
    case 'in_use':
      return 'تجهیز در بخش بالینی مستقر بوده و هم‌اکنون تحت بهره‌برداری و استفاده فعال کادر درمان قرار دارد.';
    case 'active':
      return isConsumable
        ? 'کالای مصرفی با موجودی مناسب در انبار ذخیره شده و آماده توزیع به بخش‌ها است.'
        : 'دستگاه کاملاً سالم، آماده به کار و دارای تاییدیه فنی و ایمنی معتبر می‌باشد.';
    case 'under_maintenance':
      return 'دستگاه به دلیل نیاز به سرویس، تعمیر قطعه یا رفع عیب در کارگاه مهندسی پزشکی تحت اقدام فنی قرار دارد.';
    case 'calibrating':
      return 'دستگاه در حال انجام آزمون‌های کنترل کیفی، کالیبراسیون و اعتبارسنجی استانداردهای پزشکی است.';
    case 'idle':
      return 'تجهیز سالم است اما در حال حاضر مازاد بر نیاز بخش بوده و در انبار راکد / آماده واگذاری نگهداری می‌شود.';
    case 'decommissioned':
      return 'تجهیز به علت استهلاک کامل یا عدم توجیه اقتصادی تعمیر، اسقاط شده و از چرخه خدمات بیمارستان خارج است.';
    case 'in_stock':
      return 'موجودی این کالای مصرفی در انبار در وضعیت نرمال و پاسخگوی نیاز بیمارستان است.';
    case 'low_stock':
      return 'موجودی به زیر حداقل نقطه سفارش (حاشیه اطمینان) رسیده و نیازمند صدور درخواست خرید است.';
    case 'out_of_stock':
      return 'موجودی فیزیکی در انبار صفر شده و قلم به صورت فوری در اولویت خرید قرار دارد.';
    case 'expired':
      return 'تاریخ انقضای مصرف این کالا سپری شده و باید سریعاً از انبار خارج و در قرنطینه امحاء قرار گیرد.';
    case 'near_expiry':
      return 'کمتر از ۶۰ روز تا انقضای این محموله باقی مانده و باید در اولویت مصرف (FEFO) قرار گیرد.';
    case 'draft':
      return 'شناسنامه و مشخصات هویتی این قلم هنوز کامل نشده و در وضعیت پیش‌نویس ثبت قرار دارد.';
    default:
      return 'وضعیت ثبت‌شده در سامانه کنترل اموال و انبارداری.';
  }
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  currentUser,
  equipmentList,
  classificationsList = [],
  customFiltersList = [],
  initialCustomFilterId = null,
  onNavigateToFilterBuilder,
  onAddEquipment,
  onUpdateEquipment,
  onAddClassification,
  selectedEquipmentParam,
  onNavigateToCalibration,
  setActivePage,
  initialTab,
  initialLayout,
  initialStatusFilter,
  actionGuidance,
  openAssetTransferModal,
  openQuickRestockModal,
  onClearActionGuidance,
}) => {
  const isReadOnly = currentUser?.role === 'hospital_admin' || currentUser?.role === 'finance_manager' || currentUser?.modulePermissions?.['inventory'] === 'view';
  const canAccessCalibration = currentUser?.role !== 'asset_manager' && currentUser?.role !== 'procurement_officer';
  // Main Tab State: 'drafts' (پیشنویس‌ها) vs 'inventory' (موجودی‌ها)
  const [activeTab, setActiveTab] = useState<'drafts' | 'inventory'>(initialTab || 'inventory');

  // Custom Filters State
  const [activeCustomFilterId, setActiveCustomFilterId] = useState<string | null>(initialCustomFilterId || null);

  // Guided Action Banner & Interactive Navigation Context State
  const [activeGuidance, setActiveGuidance] = useState<{
    type: 'draft_tagging' | 'low_stock' | 'asset_transfer' | 'purchase_approval' | string;
    title?: string;
    description?: string;
    message?: string;
    targetDraftId?: string;
  } | null>(actionGuidance || null);

  // Asset Handover Protocol Modal
  const [showAssetTransferModal, setShowAssetTransferModal] = useState<boolean>(openAssetTransferModal || false);

  // Quick Restock Entry Modal
  const [showQuickRestockModal, setShowQuickRestockModal] = useState<boolean>(openQuickRestockModal || false);

  // Toast Banner Notification
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle?: string; type: 'success' | 'info' } | null>(null);

  // Quick Restock State
  const [restockItemId, setRestockItemId] = useState<string>('eq-cons-1');
  const [restockQuantity, setRestockQuantity] = useState<number>(50);
  const [restockInvoiceNo, setRestockInvoiceNo] = useState<string>('RC-1403-912');
  const [restockBatchNo, setRestockBatchNo] = useState<string>('BATCH-2024-AUG');
  const [restockSupplier, setRestockSupplier] = useState<string>('شرکت پخش دارویی و ملزومات آریا طب');

  // Handover & Transfer Protocol state
  const [transferEquipmentId, setTransferEquipmentId] = useState<string>('eq-1');
  const [transferTargetDept, setTransferTargetDept] = useState<string>('اتاق عمل و جراحی');
  const [transferTargetLocation, setTransferTargetLocation] = useState<string>('بخش جراحی عمومی - اتاق عمل ۳');
  const [transferReceiverName, setTransferReceiverName] = useState<string>('مهندس رفیعی (مسئول تجهیزات جراحی)');
  const [transferSenderName, setTransferSenderName] = useState<string>('سرپرستار حسینی (بخش ICU)');
  const [transferReason, setTransferReason] = useState<string>('توسعه ظرفیت اتاق عمل‌های جراحی و اورژانس');
  const [transferChecklist, setTransferChecklist] = useState({
    powerCable: true,
    accessories: true,
    physicalIntegrity: true,
    calibrationLabel: true,
  });

  // Registration Option Selection Modal
  const [showEntryOptionModal, setShowEntryOptionModal] = useState<boolean>(false);

  // Registration Workflows Modals
  const [showSmartUploadModal, setShowSmartUploadModal] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);

  // Smart Upload Mode: 'file' or 'text'
  const [smartMode, setSmartMode] = useState<'file' | 'text'>('file');
  const [rawTextInput, setRawTextInput] = useState('');

  // Dedicated Draft Completion Modal State
  const [showDraftCompletionModal, setShowDraftCompletionModal] = useState<boolean>(false);
  const [draftFaName, setDraftFaName] = useState('');
  const [draftEnName, setDraftEnName] = useState('');
  const [draftCode, setDraftCode] = useState('');
  const [draftBrand, setDraftBrand] = useState('');
  const [draftModel, setDraftModel] = useState('');
  const [draftCategory, setDraftCategory] = useState('');
  const [draftSerialNumber, setDraftSerialNumber] = useState('');
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [draftUnit, setDraftUnit] = useState('عدد');
  const [draftDepartment, setDraftDepartment] = useState('انبار مرکزی تجهیزات');
  const [draftLocation, setDraftLocation] = useState('');
  const [draftStatus, setDraftStatus] = useState<EquipmentStatus>('active');
  const [draftItemKind, setDraftItemKind] = useState<ItemKind>('device');
  const [draftSupplier, setDraftSupplier] = useState('');
  const [draftBatchNo, setDraftBatchNo] = useState('');
  const [draftExpiryDate, setDraftExpiryDate] = useState('');
  const [draftOwner, setDraftOwner] = useState('');
  const [draftPrice, setDraftPrice] = useState<number>(0);

  // Manual Registration State - Product Selection Catalog & Smart Memory
  const [editingDraftItem, setEditingDraftItem] = useState<EquipmentItem | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState<string>('');
  const [formSubcategory, setFormSubcategory] = useState<string>('');
  const [formType, setFormType] = useState<string>('');
  const [formCustomInheritedFields, setFormCustomInheritedFields] = useState<{ levelLabel: string; field: AssetRequirementField }[]>([]);

  // Synchronize equipment list with Smart Memory Catalog on load
  useEffect(() => {
    syncExistingInventoryWithMemory(equipmentList);
  }, [equipmentList]);

  // Manual Form Fields
  const [formFaName, setFormFaName] = useState('');
  const [formEnName, setFormEnName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formUnit, setFormUnit] = useState('عدد');
  const [formDepartment, setFormDepartment] = useState('انبار مرکزی تجهیزات');
  const [formLocation, setFormLocation] = useState('');
  const [formStatus, setFormStatus] = useState<EquipmentStatus>('active');
  const [formItemKind, setFormItemKind] = useState<ItemKind>('device');
  const [formSupplier, setFormSupplier] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formBatchNo, setFormBatchNo] = useState('');
  const [formOwner, setFormOwner] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formSpecs, setFormSpecs] = useState<Record<string, string>>({});

  // File Upload State for Smart Registration
  const [uploadedFileState, setUploadedFileState] = useState<{
    file: File | null;
    fileName: string;
    fileSize: string;
    fileType: string;
    status: 'idle' | 'analyzing' | 'completed';
    extractedItemsCount: number;
    extractedDraftsCount: number;
  } | null>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStepText, setUploadStepText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comprehensive Automatic Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState<boolean>(false);
  const [quickPreset, setQuickPreset] = useState<
    | 'all'
    | 'calibration_due'
    | 'near_expiry'
    | 'maintenance'
    | 'low_stock'
    | 'critical_care'
    | 'under_warranty'
    | 'high_risk'
  >('all');

  const [filterItemName, setFilterItemName] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [filterItemKind, setFilterItemKind] = useState<'all' | 'device' | 'consumable'>('all');
  const [filterCalibrationStatus, setFilterCalibrationStatus] = useState<string>('all');
  const [filterCalibrationPeriod, setFilterCalibrationPeriod] = useState<string>('all');
  const [filterExpiry, setFilterExpiry] = useState<string>('all');
  const [filterWarranty, setFilterWarranty] = useState<string>('all');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [filterSafetyScore, setFilterSafetyScore] = useState<string>('all');
  const [filterStockLevel, setFilterStockLevel] = useState<string>('all');

  // Display Mode State: 'grouped' (نمای تجمیعی) vs 'individual' (نمای جزئیات) vs 'tree' (سلسله‌مراتبی)
  const [displayLayout, setDisplayLayout] = useState<'grouped' | 'individual' | 'tree'>(initialLayout || 'grouped');

  // Expanded State for Groups & Hierarchy Nodes
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Viewing Item Passport Detail Modal
  const [viewingItem, setViewingItem] = useState<EquipmentItem | null>(
    selectedEquipmentParam || null
  );

  // Equipment Commenting Modal State
  const [showAddCommentModal, setShowAddCommentModal] = useState<boolean>(false);
  const [newCommentType, setNewCommentType] = useState<EquipmentComment['commentType']>('operational_note');
  const [newCommentRating, setNewCommentRating] = useState<number>(5);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [commentToastMsg, setCommentToastMsg] = useState<string | null>(null);

  // Synchronize incoming navigation params and triggers
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (initialLayout) {
      setDisplayLayout(initialLayout);
    }
    if (initialStatusFilter) {
      setSelectedStatus(initialStatusFilter);
      setIsFiltersExpanded(true);
    }
    if (initialCustomFilterId !== undefined) {
      setActiveCustomFilterId(initialCustomFilterId);
    }
    if (actionGuidance) {
      setActiveGuidance(actionGuidance);
      if (actionGuidance.targetDraftId) {
        const target = equipmentList.find((e) => e.id === actionGuidance.targetDraftId);
        if (target) {
          handleOpenDraftCompletion(target);
        }
      }
    }
    if (openAssetTransferModal) {
      setShowAssetTransferModal(true);
    }
    if (openQuickRestockModal) {
      setShowQuickRestockModal(true);
    }
  }, [initialTab, initialLayout, initialStatusFilter, actionGuidance, openAssetTransferModal, openQuickRestockModal]);

  // --------------------------------------------------------------------------
  // STATS CALCULATIONS FOR SUMMARY CARDS
  // --------------------------------------------------------------------------
  const draftList = equipmentList.filter((e) => e.isDraft);
  const finalizedList = equipmentList.filter((e) => !e.isDraft);

  const totalQuantitySum = finalizedList.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  const equipmentCount = finalizedList.filter(
    (e) =>
      e.category.includes('تجهیزات') ||
      e.category.includes('دستگاه') ||
      e.category.includes('مانیتور') ||
      e.unit === 'دستگاه'
  ).length;

  const consumableCount = finalizedList.length - equipmentCount;

  const attentionNeededCount = finalizedList.filter(
    (e) => e.status === 'attention' || e.status === 'out_of_stock' || (e.safetyScore && e.safetyScore < 85)
  ).length;

  const nearExpiryCount = finalizedList.filter(
    (e) => e.expiryDate && (e.expiryDate.includes('۱۴۰۳') || e.expiryDate.includes('۱۴۰۴'))
  ).length;

  // --------------------------------------------------------------------------
  // PRODUCT CATALOG OPTIONS & INHERITED FIELDS COMPUTATION
  // --------------------------------------------------------------------------
  // Permitted Equipment Catalog Options (Strictly excluding dental equipment)
  const allPermittedProducts = useMemo(() => {
    return getAllPermittedEquipmentProducts();
  }, []);

  const productOptions: SelectOption[] = useMemo(() => {
    return allPermittedProducts.map((p) => ({
      id: p.id,
      name: `${p.name} (${p.enName})`,
      description: `${p.category} > ${p.subcategory} > ${p.type}${p.umdns ? ` | UMDNS: ${p.umdns}` : ''}`,
    }));
  }, [allPermittedProducts]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return RAW_EQUIPMENT_CATALOG.find((p) => p.id === selectedProductId) || null;
  }, [selectedProductId]);

  // Fields defined specifically for the selected Product or Smart Memory structure (Type, Subcategory, Category)
  const inheritedFieldsList = useMemo(() => {
    if (formCustomInheritedFields && formCustomInheritedFields.length > 0) {
      return formCustomInheritedFields;
    }
    if (selectedProduct) {
      const res = resolveTaxonomyForProduct(selectedProduct, classificationsList);
      return res.inheritedFields;
    }
    if (formType || formSubcategory || formCategory) {
      const res = resolveTaxonomyForLearnedItem(
        { category: formCategory, subcategory: formSubcategory, type: formType },
        classificationsList
      );
      return res.inheritedFields;
    }
    return [];
  }, [formCustomInheritedFields, selectedProduct, formCategory, formSubcategory, formType, classificationsList]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const prod = RAW_EQUIPMENT_CATALOG.find((p) => p.id === productId);
    if (prod) {
      setFormFaName(prod.name);
      setFormEnName(prod.enName);
      setFormCategory(prod.category);
      setFormSubcategory(prod.subcategory);
      setFormType(prod.type);
      setFormItemKind(prod.itemKind);
      setFormUnit(prod.defaultUnit || (prod.itemKind === 'consumable' ? 'عدد' : 'دستگاه'));
      setFormStatus(prod.itemKind === 'consumable' ? 'in_stock' : 'active');
      setFormCustomInheritedFields([]);
      if (!formCode) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setFormCode(`EQ-1403-${randomNum}`);
      }
    }
  };

  const handleSmartMemorySelect = (item: {
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
  }) => {
    setFormFaName(item.name);
    setFormEnName(item.enName || '');
    setFormCategory(item.category);
    setFormSubcategory(item.subcategory);
    setFormType(item.type);
    setFormItemKind(item.itemKind);
    setFormUnit(item.defaultUnit || (item.itemKind === 'consumable' ? 'عدد' : 'دستگاه'));
    setFormStatus(item.itemKind === 'consumable' ? 'in_stock' : 'active');
    if (item.defaultBrand && !formBrand) setFormBrand(item.defaultBrand);
    if (item.defaultModel && !formModel) setFormModel(item.defaultModel);
    setFormCustomInheritedFields(item.inheritedFields || []);

    const matchingProd = RAW_EQUIPMENT_CATALOG.find((p) => p.name === item.name);
    setSelectedProductId(matchingProd ? matchingProd.id : `learned-${Date.now()}`);

    if (!formCode) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setFormCode(`EQ-1403-${randomNum}`);
    }
  };

  // --------------------------------------------------------------------------
  // UPLOAD & RAW TEXT HANDLERS FOR SMART REGISTRATION
  // --------------------------------------------------------------------------
  const handleFileSelected = (file: File) => {
    const sizeInKb = (file.size / 1024).toFixed(1) + ' KB';
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

    setUploadedFileState({
      file,
      fileName: file.name,
      fileSize: sizeInKb,
      fileType: ext,
      status: 'analyzing',
      extractedItemsCount: 0,
      extractedDraftsCount: 0,
    });

    setIsUploading(true);
    setUploadStepText('در حال آنالیز اسناد و استخراج اطلاعات...');

    setTimeout(() => {
      setUploadStepText('تطبیق هوشمند با ساختار دسته‌بندی بیمارستان...');
    }, 800);

    setTimeout(() => {
      setIsUploading(false);
      const timestamp = Date.now();

      const newItemFinal: EquipmentItem = {
        id: `eq-file-${timestamp}-1`,
        code: `INV-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
        faName: `تجهیز استخراج‌شده (${file.name.slice(0, 16)})`,
        enName: 'Extracted Document Item',
        category: 'تجهیزات تنفسی و بیهوشی',
        brand: 'Fisher & Paykel',
        model: 'OptiFlow FX',
        department: 'انبار مرکزی تجهیزات',
        location: 'قفسه B-12',
        status: 'active',
        purchaseDate: '۱۴۰۳/۰۵/۲۲',
        price: 14500000,
        serialNumber: `SN-${timestamp}`,
        warrantyExpiry: '۱۴۰۵/۰۵/۲۲',
        nextCalibrationDate: '-',
        safetyScore: 92,
        owner: 'سرپرست انبار',
        isDraft: false,
        quantity: 50,
        unit: 'عدد',
        batchNo: `LOT-${timestamp.toString().slice(-4)}`,
        expiryDate: '۱۴۰۶/۰۸/۱۵',
        supplier: 'شرکت تامین تجهیزات استخراج‌شده',
        creator: 'سیستم پردازش هوشمند فایل',
        createdAt: 'هم‌اکنون',
      };

      const newItemDraft: EquipmentItem = {
        id: `eq-file-${timestamp}-2`,
        code: `EQ-DRAFT-${Math.floor(10 + Math.random() * 90)}`,
        faName: `اقلام فاقد کد اموال (${file.name.slice(0, 12)})`,
        enName: 'Draft Extracted Equipment',
        category: 'تجهیزات مانیتورینگ و ثبت',
        brand: 'نامشخص',
        model: 'نامشخص',
        department: 'انبار مرکزی تجهیزات',
        location: 'تحویل نگرفته',
        status: 'draft',
        purchaseDate: '۱۴۰۳/۰۵/۲۲',
        price: 0,
        serialNumber: '',
        warrantyExpiry: '-',
        nextCalibrationDate: '-',
        safetyScore: 0,
        owner: 'تعیین‌نشده',
        isDraft: true,
        quantity: 10,
        unit: 'دستگاه',
        batchNo: '',
        expiryDate: '',
        supplier: 'نیازمند استعلام فاکتور',
        creator: 'پردازش هوشمند سند',
        createdAt: 'هم‌اکنون',
        missingFields: ['کد اموال', 'برند سازنده', 'مدل دستگاه', 'شماره سریال'],
      };

      onAddEquipment(newItemFinal);
      onAddEquipment(newItemDraft);

      setUploadedFileState({
        file,
        fileName: file.name,
        fileSize: sizeInKb,
        fileType: ext,
        status: 'completed',
        extractedItemsCount: 1,
        extractedDraftsCount: 1,
      });
    }, 1500);
  };

  const handleProcessRawText = () => {
    if (!rawTextInput.trim()) return;

    setIsUploading(true);
    setUploadStepText('در حال پردازش متن و انطباق فیلدها با ساختار اموال...');

    setTimeout(() => {
      setIsUploading(false);
      const timestamp = Date.now();

      const newDraftTextItem: EquipmentItem = {
        id: `eq-text-${timestamp}`,
        code: `EQ-DRAFT-${Math.floor(10 + Math.random() * 90)}`,
        faName: rawTextInput.slice(0, 30) + '...',
        enName: 'Extracted Raw Text Item',
        category: 'تجهیزات عمومی',
        brand: 'نامشخص',
        model: 'نامشخص',
        department: 'انبار مرکزی تجهیزات',
        location: 'ورودی اولیه',
        status: 'draft',
        purchaseDate: '۱۴۰۳/۰۵/۲۲',
        price: 0,
        serialNumber: '',
        warrantyExpiry: '-',
        nextCalibrationDate: '-',
        safetyScore: 0,
        owner: 'کارشناس انبار',
        isDraft: true,
        quantity: 1,
        unit: 'عدد',
        batchNo: '',
        expiryDate: '',
        supplier: 'ورودی متن خام',
        creator: 'ورودی متن هوشمند',
        createdAt: 'هم‌اکنون',
        missingFields: ['برند سازنده', 'مدل دستگاه', 'شماره سریال', 'کد اموال'],
      };

      onAddEquipment(newDraftTextItem);
      setShowSmartUploadModal(false);
      setRawTextInput('');
      setActiveTab('drafts');
    }, 1200);
  };

  const handleResetUpload = () => {
    setUploadedFileState(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --------------------------------------------------------------------------
  // MANUAL REGISTRATION HANDLERS
  // --------------------------------------------------------------------------
  const handleStartManualRegistration = () => {
    setShowEntryOptionModal(false);
    setEditingDraftItem(null);
    setSelectedProductId(null);
    resetFormFields();
    setShowManualModal(true);
  };

  const handleOpenDraftCompletion = (draftItem: EquipmentItem) => {
    setEditingDraftItem(draftItem);
    setDraftFaName(draftItem.faName || '');
    setDraftEnName(draftItem.enName || '');

    // Auto-generate standard asset code if it's currently a draft placeholder
    if (!draftItem.code || draftItem.code.toUpperCase().includes('DRAFT')) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setDraftCode(`EQ-1403-${randomNum}`);
    } else {
      setDraftCode(draftItem.code);
    }

    setDraftBrand(draftItem.brand !== 'نامشخص' ? draftItem.brand : '');
    setDraftModel(draftItem.model !== 'نامشخص' ? draftItem.model : '');
    setDraftCategory(draftItem.category || 'تجهیزات عمومی');

    if (draftItem.serialNumber && !draftItem.serialNumber.includes('نامشخص') && !draftItem.serialNumber.includes('DRAFT')) {
      setDraftSerialNumber(draftItem.serialNumber);
    } else {
      setDraftSerialNumber('');
    }

    setDraftQuantity(draftItem.quantity || 1);
    setDraftUnit(draftItem.unit || (draftItem.itemKind === 'consumable' ? 'بسته' : 'دستگاه'));
    setDraftDepartment(draftItem.department || 'انبار مرکزی تجهیزات');
    setDraftLocation(draftItem.location && !draftItem.location.includes('موقت') ? draftItem.location : '');
    setDraftItemKind(draftItem.itemKind || 'device');
    setDraftStatus(draftItem.itemKind === 'consumable' ? 'in_stock' : 'active');
    setDraftSupplier(draftItem.supplier || '');
    setDraftBatchNo(draftItem.batchNo || '');
    setDraftExpiryDate(draftItem.expiryDate || '');
    setDraftOwner(draftItem.owner && draftItem.owner !== 'تعیین‌نشده' ? draftItem.owner : '');
    setDraftPrice(draftItem.price || 0);

    setShowDraftCompletionModal(true);
  };

  const handleFinalizeDraft = () => {
    if (!editingDraftItem) return;

    const finalCode = draftCode.trim() || `EQ-1403-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalLocation = draftLocation.trim() || 'انبار مرکزی تجهیزات';
    const finalSerial = draftSerialNumber.trim() || 'SN-' + Math.floor(100000 + Math.random() * 900000);
    const finalGroupKey = `${draftFaName.trim() || editingDraftItem.faName} — ${draftBrand.trim() || editingDraftItem.brand} ${draftModel.trim() || editingDraftItem.model}`.trim();

    const finalizedItem: EquipmentItem = {
      ...editingDraftItem,
      faName: draftFaName.trim() || editingDraftItem.faName,
      enName: draftEnName.trim() || editingDraftItem.enName,
      code: finalCode,
      brand: draftBrand.trim() || editingDraftItem.brand,
      model: draftModel.trim() || editingDraftItem.model,
      category: draftCategory || editingDraftItem.category,
      department: draftDepartment,
      location: finalLocation,
      serialNumber: finalSerial,
      status: draftItemKind === 'device' ? (draftStatus === 'draft' ? 'active' : draftStatus) : 'in_stock',
      itemKind: draftItemKind,
      quantity: draftQuantity,
      unit: draftUnit,
      price: draftPrice,
      supplier: draftSupplier.trim() || editingDraftItem.supplier,
      batchNo: draftBatchNo.trim() || editingDraftItem.batchNo,
      expiryDate: draftExpiryDate.trim() || editingDraftItem.expiryDate,
      owner: draftOwner.trim() || 'امین اموال بیمارستان',
      isDraft: false,
      missingFields: [],
      safetyScore: 95,
      groupKey: finalGroupKey,
    };

    onUpdateEquipment(finalizedItem);
    setShowDraftCompletionModal(false);
    setEditingDraftItem(null);

    // Learn and save to Smart Memory
    recordAndLearnInventoryItem({
      name: finalizedItem.faName,
      enName: finalizedItem.enName,
      category: finalizedItem.category,
      subcategory: finalizedItem.subcategory || '',
      type: finalizedItem.type || '',
      itemKind: finalizedItem.itemKind,
      defaultUnit: finalizedItem.unit,
      defaultBrand: finalizedItem.brand,
      defaultModel: finalizedItem.model,
      specs: finalizedItem.specs,
    });

    setToastMessage({
      title: `شناسنامه «${finalizedItem.faName}» با موفقیت تکمیل و پلاک‌کوبی شد`,
      subtitle: `کد دائم اموال: ${finalizedItem.code} | محل استقرار: ${finalizedItem.department} (${finalizedItem.location}) | سریال: ${finalizedItem.serialNumber}`,
      type: 'success',
    });

    if (activeGuidance?.type === 'draft_tagging') {
      setActiveGuidance(null);
      onClearActionGuidance?.();
    }

    setActiveTab('inventory');
  };

  const handleSaveDraftAsDraft = () => {
    if (!editingDraftItem) return;

    const missing: string[] = [];
    if (!draftCode.trim() || draftCode.includes('DRAFT')) missing.push('کد دائم اموال');
    if (!draftSerialNumber.trim()) missing.push('شماره سریال');
    if (!draftLocation.trim()) missing.push('محل استقرار دقیق');

    const updatedDraft: EquipmentItem = {
      ...editingDraftItem,
      faName: draftFaName.trim() || editingDraftItem.faName,
      enName: draftEnName.trim() || editingDraftItem.enName,
      code: draftCode.trim() || editingDraftItem.code,
      brand: draftBrand.trim() || editingDraftItem.brand,
      model: draftModel.trim() || editingDraftItem.model,
      category: draftCategory || editingDraftItem.category,
      department: draftDepartment,
      location: draftLocation.trim() || editingDraftItem.location,
      serialNumber: draftSerialNumber.trim() || editingDraftItem.serialNumber,
      itemKind: draftItemKind,
      quantity: draftQuantity,
      unit: draftUnit,
      price: draftPrice,
      supplier: draftSupplier.trim() || editingDraftItem.supplier,
      batchNo: draftBatchNo.trim() || editingDraftItem.batchNo,
      expiryDate: draftExpiryDate.trim() || editingDraftItem.expiryDate,
      owner: draftOwner.trim() || editingDraftItem.owner,
      isDraft: true,
      missingFields: missing.length > 0 ? missing : editingDraftItem.missingFields,
    };

    onUpdateEquipment(updatedDraft);
    setShowDraftCompletionModal(false);
    setEditingDraftItem(null);

    setToastMessage({
      title: `پیش‌نویس «${updatedDraft.faName}» به‌روزرسانی شد`,
      subtitle: missing.length > 0 ? `اقلام باقی‌مانده: ${missing.join('، ')}` : 'شناسنامه آماده نهایی‌سازی است',
      type: 'info',
    });
  };

  const resetFormFields = () => {
    setFormFaName('');
    setFormEnName('');
    setFormCategory('');
    setFormSubcategory('');
    setFormType('');
    setFormCustomInheritedFields([]);
    setFormCode('');
    setFormBrand('');
    setFormModel('');
    setFormSerialNumber('');
    setFormQuantity(1);
    setFormUnit('عدد');
    setFormDepartment('انبار مرکزی تجهیزات');
    setFormLocation('');
    setFormStatus('active');
    setFormItemKind('device');
    setFormSupplier('');
    setFormExpiryDate('');
    setFormBatchNo('');
    setFormOwner('');
    setFormPrice(0);
    setFormSpecs({});
  };

  const calculateMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!formFaName.trim()) missing.push('نام کالا/تجهیز');
    if (!formBrand.trim()) missing.push('برند سازنده');
    if (!formModel.trim()) missing.push('مدل دستگاه');
    if (!formSerialNumber.trim()) missing.push('شماره سریال');
    if (!formCode.trim()) missing.push('کد اموال');
    if (!formLocation.trim()) missing.push('محل استقرار دقیق');

    inheritedFieldsList.forEach(({ field }) => {
      if (field.required) {
        const val = formSpecs[field.name];
        if (!val || val.trim() === '') {
          if (!missing.includes(field.name)) {
            missing.push(field.name);
          }
        }
      }
    });

    return missing;
  };

  const handleSaveRegistration = (asDraft: boolean) => {
    const missing = calculateMissingFields();
    const isReallyDraft = asDraft || missing.length > 0;

    const resolvedCategory = formCategory || selectedProduct?.category || 'اموال عمومی و پشتیبانی بیمارستان';
    const resolvedSubcategory = formSubcategory || selectedProduct?.subcategory || '';
    const resolvedType = formType || selectedProduct?.type || '';

    const categoryName = resolvedSubcategory
      ? `${resolvedCategory} - ${resolvedSubcategory}`
      : resolvedCategory;
    const groupKey = `${formFaName || selectedProduct?.name || 'تجهیز جدید'} — ${formBrand || 'برند'} ${formModel || ''}`.trim();

    const newItem: EquipmentItem = {
      id: editingDraftItem ? editingDraftItem.id : `eq-${Date.now()}`,
      code: formCode.trim() || `EQ-DRAFT-${Math.floor(10 + Math.random() * 90)}`,
      faName: formFaName.trim() || selectedProduct?.name || 'تجهیز جدید',
      enName: formEnName.trim() || selectedProduct?.enName || 'New Equipment Item',
      category: categoryName,
      subcategory: resolvedSubcategory,
      type: resolvedType,
      classificationPath: `${resolvedCategory}${resolvedSubcategory ? ' ❯ ' + resolvedSubcategory : ''}${resolvedType ? ' ❯ ' + resolvedType : ''}`,
      brand: formBrand.trim() || 'نامشخص',
      model: formModel.trim() || 'نامشخص',
      department: formDepartment,
      location: formLocation.trim() || 'انبار موقت',
      status: isReallyDraft ? 'draft' : formStatus,
      itemKind: formItemKind,
      purchaseDate: editingDraftItem?.purchaseDate || '۱۴۰۳/۰۵/۲۲',
      price: formPrice || 0,
      serialNumber: formSerialNumber.trim() || 'نامشخص',
      warrantyExpiry: '۱۴۰۶/۰۵/۲۲',
      nextCalibrationDate: '-',
      safetyScore: isReallyDraft ? 0 : 95,
      owner: formOwner.trim() || 'مسئول انبار',
      isDraft: isReallyDraft,
      quantity: formQuantity || 1,
      unit: formUnit || 'عدد',
      batchNo: formBatchNo.trim(),
      expiryDate: formExpiryDate.trim(),
      supplier: formSupplier.trim(),
      creator: editingDraftItem?.creator || 'کارشناس اموال و انبار',
      createdAt: editingDraftItem?.createdAt || 'امروز',
      missingFields: isReallyDraft ? missing : [],
      specs: formSpecs,
      groupKey: groupKey,
    };

    if (editingDraftItem) {
      onUpdateEquipment(newItem);
    } else {
      onAddEquipment(newItem);
    }

    // Permanently record and learn in Smart Memory
    recordAndLearnInventoryItem({
      name: newItem.faName,
      enName: newItem.enName,
      category: resolvedCategory,
      subcategory: resolvedSubcategory,
      type: resolvedType,
      itemKind: newItem.itemKind,
      defaultUnit: newItem.unit,
      defaultBrand: newItem.brand,
      defaultModel: newItem.model,
      specs: newItem.specs,
    });

    if (!isReallyDraft) {
      setToastMessage({
        title: `شناسنامه «${newItem.faName}» با موفقیت نهایی و پلاک‌کوبی شد`,
        subtitle: `کد دائم اموال: ${newItem.code} | ساختار: ${resolvedCategory} ❯ ${resolvedType || resolvedSubcategory} | محل: ${newItem.location}`,
        type: 'success',
      });
      if (activeGuidance?.type === 'draft_tagging') {
        setActiveGuidance(null);
        onClearActionGuidance?.();
      }
    } else {
      setToastMessage({
        title: `پیش‌نویس «${newItem.faName}» ذخیره شد`,
        subtitle: `اقلام ناقص: ${missing.join('، ')}`,
        type: 'info',
      });
    }

    setShowManualModal(false);
  };

  const handleConfirmAssetTransfer = () => {
    const targetItem = equipmentList.find((e) => e.id === transferEquipmentId || e.code === transferEquipmentId);
    if (targetItem) {
      const updated = {
        ...targetItem,
        department: transferTargetDept,
        location: transferTargetLocation,
      };
      onUpdateEquipment(updated);
    }
    setShowAssetTransferModal(false);
    setToastMessage({
      title: 'صورت‌جلسه جابجایی اموال (TR-1403-882) تایید و ثبت شد',
      subtitle: `تجهیز با موفقیت به «${transferTargetDept} - ${transferTargetLocation}» تحویل داده شد.`,
      type: 'success',
    });
    if (activeGuidance?.type === 'asset_transfer') {
      setActiveGuidance(null);
      onClearActionGuidance?.();
    }
  };

  const handleConfirmQuickRestock = () => {
    const targetItem = equipmentList.find((e) => e.id === restockItemId);
    if (targetItem) {
      const newQty = (targetItem.quantity || 0) + (restockQuantity || 1);
      const updated: EquipmentItem = {
        ...targetItem,
        quantity: newQty,
        status: targetItem.itemKind === 'consumable' ? 'in_stock' : targetItem.status,
        batchNo: restockBatchNo || targetItem.batchNo,
        supplier: restockSupplier || targetItem.supplier,
      };
      onUpdateEquipment(updated);
    }
    setShowQuickRestockModal(false);
    setToastMessage({
      title: `رسید ورود کالا و شارژ انبار (${restockInvoiceNo}) با موفقیت ثبت شد`,
      subtitle: `تعداد ${restockQuantity} واحد به کاردکس موجودی کالا افزوده گردید.`,
      type: 'success',
    });
    if (activeGuidance?.type === 'low_stock') {
      setActiveGuidance(null);
      onClearActionGuidance?.();
    }
  };

  // --------------------------------------------------------------------------
  // COMPREHENSIVE AUTOMATIC FILTERING LOGIC
  // --------------------------------------------------------------------------
  const filteredFinalized = finalizedList.filter((item) => {
    // 1. Quick Smart Preset Check
    if (quickPreset === 'calibration_due') {
      const calSt = getItemCalibrationStatus(item);
      if (calSt !== 'expired' && calSt !== 'expiring_soon' && item.status !== 'calibrating') return false;
    } else if (quickPreset === 'near_expiry') {
      const expSt = getItemExpiryStatus(item);
      if (expSt !== 'expired' && expSt !== 'near_3m' && expSt !== 'near_6m' && item.status !== 'near_expiry') return false;
    } else if (quickPreset === 'maintenance') {
      if (item.status !== 'under_maintenance' && (item.safetyScore === undefined || item.safetyScore >= 85)) return false;
    } else if (quickPreset === 'low_stock') {
      const stSt = getItemStockStatus(item);
      if (stSt !== 'low_stock' && stSt !== 'out_of_stock') return false;
    } else if (quickPreset === 'critical_care') {
      const isCrit =
        item.department.includes('ICU') ||
        item.department.includes('CCU') ||
        item.department.includes('اتاق عمل') ||
        item.department.includes('اورژانس') ||
        item.location.includes('ICU') ||
        item.location.includes('CCU') ||
        item.location.includes('اتاق عمل');
      if (!isCrit) return false;
    } else if (quickPreset === 'under_warranty') {
      const wSt = getItemWarrantyStatus(item);
      if (wSt !== 'valid' && wSt !== 'near_expiry') return false;
    } else if (quickPreset === 'high_risk') {
      if (getItemRiskLevel(item) !== 'high') return false;
    }

    // 2. Comprehensive Search Query
    if (searchQuery.trim()) {
      const kw = searchQuery.toLowerCase().trim();
      const match =
        item.faName.toLowerCase().includes(kw) ||
        (item.enName && item.enName.toLowerCase().includes(kw)) ||
        item.code.toLowerCase().includes(kw) ||
        item.brand.toLowerCase().includes(kw) ||
        item.model.toLowerCase().includes(kw) ||
        item.department.toLowerCase().includes(kw) ||
        item.location.toLowerCase().includes(kw) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(kw)) ||
        (item.batchNo && item.batchNo.toLowerCase().includes(kw)) ||
        (item.supplier && item.supplier.toLowerCase().includes(kw));
      if (!match) return false;
    }

    // 3. Name Filter
    if (filterItemName !== 'all' && item.faName !== filterItemName) {
      return false;
    }

    // 4. Item Kind
    if (filterItemKind !== 'all') {
      const kind = item.itemKind || (item.unit === 'دستگاه' ? 'device' : 'consumable');
      if (kind !== filterItemKind) return false;
    }

    // 5. Operational / Stock Status
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'in_stock') {
        if (item.status !== 'in_stock' && !(item.quantity !== undefined && item.quantity > 0)) return false;
      } else if (selectedStatus === 'out_of_stock') {
        if (item.status !== 'out_of_stock' && item.quantity !== 0) return false;
      } else if (selectedStatus === 'low_stock') {
        if (item.status !== 'low_stock' && !(item.quantity !== undefined && item.quantity > 0 && item.quantity <= 15)) return false;
      } else if (selectedStatus === 'expired') {
        if (item.status !== 'expired' && getItemExpiryStatus(item) !== 'expired') return false;
      } else if (selectedStatus === 'near_expiry') {
        if (item.status !== 'near_expiry' && getItemExpiryStatus(item) !== 'near_3m' && getItemExpiryStatus(item) !== 'near_6m') return false;
      } else if (item.status !== selectedStatus) {
        return false;
      }
    }

    // 6. Department / Location
    if (selectedDept !== 'all' && item.department !== selectedDept && !item.location.includes(selectedDept)) {
      return false;
    }

    // 7. Category
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // 8. Brand
    if (selectedBrand !== 'all' && item.brand !== selectedBrand) {
      return false;
    }

    // 9. Supplier
    if (selectedSupplier !== 'all' && item.supplier !== selectedSupplier) {
      return false;
    }

    // 10. Calibration Status
    if (filterCalibrationStatus !== 'all') {
      if (getItemCalibrationStatus(item) !== filterCalibrationStatus) return false;
    }

    // 11. Calibration Period
    if (filterCalibrationPeriod !== 'all') {
      if (getItemCalibrationPeriod(item) !== filterCalibrationPeriod) return false;
    }

    // 12. Expiry Status
    if (filterExpiry !== 'all') {
      if (getItemExpiryStatus(item) !== filterExpiry) return false;
    }

    // 13. Warranty Status
    if (filterWarranty !== 'all') {
      if (getItemWarrantyStatus(item) !== filterWarranty) return false;
    }

    // 14. Risk Level
    if (filterRiskLevel !== 'all') {
      if (getItemRiskLevel(item) !== filterRiskLevel) return false;
    }

    // 15. Safety Score
    if (filterSafetyScore !== 'all') {
      if (getItemSafetyLevel(item) !== filterSafetyScore) return false;
    }

    // 16. Stock Level
    if (filterStockLevel !== 'all') {
      if (getItemStockStatus(item) !== filterStockLevel) return false;
    }

    return true;
  });

  const departments = Array.from(new Set(equipmentList.map((e) => e.department).filter(Boolean)));
  const categories = Array.from(new Set(equipmentList.map((e) => e.category).filter(Boolean)));
  const brands = Array.from(new Set(equipmentList.map((e) => e.brand).filter((b) => b && b !== 'نامشخص')));
  const suppliers = Array.from(
    new Set(equipmentList.map((e) => e.supplier).filter((s) => s && s.trim() !== ''))
  );
  const itemNames = Array.from(new Set(equipmentList.map((e) => e.faName).filter(Boolean))).sort();

  // Active filters count and reset handler
  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    (quickPreset !== 'all' ? 1 : 0) +
    (filterItemName !== 'all' ? 1 : 0) +
    (selectedDept !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (selectedSupplier !== 'all' ? 1 : 0) +
    (filterItemKind !== 'all' ? 1 : 0) +
    (filterCalibrationStatus !== 'all' ? 1 : 0) +
    (filterCalibrationPeriod !== 'all' ? 1 : 0) +
    (filterExpiry !== 'all' ? 1 : 0) +
    (filterWarranty !== 'all' ? 1 : 0) +
    (filterRiskLevel !== 'all' ? 1 : 0) +
    (filterSafetyScore !== 'all' ? 1 : 0) +
    (filterStockLevel !== 'all' ? 1 : 0);

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setQuickPreset('all');
    setFilterItemName('all');
    setSelectedDept('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedBrand('all');
    setSelectedSupplier('all');
    setFilterItemKind('all');
    setFilterCalibrationStatus('all');
    setFilterCalibrationPeriod('all');
    setFilterExpiry('all');
    setFilterWarranty('all');
    setFilterRiskLevel('all');
    setFilterSafetyScore('all');
    setFilterStockLevel('all');
  };

  // Quick Preset Counts
  const presetCounts = {
    all: finalizedList.length,
    calibration_due: finalizedList.filter((i) => {
      const s = getItemCalibrationStatus(i);
      return s === 'expired' || s === 'expiring_soon' || i.status === 'calibrating';
    }).length,
    near_expiry: finalizedList.filter((i) => {
      const s = getItemExpiryStatus(i);
      return s === 'expired' || s === 'near_3m' || s === 'near_6m' || i.status === 'near_expiry';
    }).length,
    maintenance: finalizedList.filter(
      (i) => i.status === 'under_maintenance' || (i.safetyScore !== undefined && i.safetyScore < 85)
    ).length,
    low_stock: finalizedList.filter((i) => {
      const s = getItemStockStatus(i);
      return s === 'low_stock' || s === 'out_of_stock';
    }).length,
    critical_care: finalizedList.filter(
      (i) =>
        i.department.includes('ICU') ||
        i.department.includes('CCU') ||
        i.department.includes('اتاق عمل') ||
        i.department.includes('اورژانس') ||
        i.location.includes('ICU') ||
        i.location.includes('CCU') ||
        i.location.includes('اتاق عمل')
    ).length,
    under_warranty: finalizedList.filter((i) => {
      const s = getItemWarrantyStatus(i);
      return s === 'valid' || s === 'near_expiry';
    }).length,
    high_risk: finalizedList.filter((i) => getItemRiskLevel(i) === 'high').length,
  };

  // Grouped Product Logic for "نمای تجمیعی"
  const groupedProducts: Record<string, GroupedProduct> = filteredFinalized.reduce(
    (acc: Record<string, GroupedProduct>, item: EquipmentItem) => {
      const key = item.groupKey || `${item.faName} — ${item.brand} ${item.model}`;
      if (!acc[key]) {
        acc[key] = {
          groupName: key,
          category: item.category,
          brand: item.brand,
          model: item.model,
          items: [],
          totalQuantity: 0,
          unit: item.unit || 'عدد',
          recordCount: 0,
          suppliers: [],
          nearestExpiry: '1499/12/29',
          overallStatus: 'active',
        };
      }

      acc[key].items.push(item);
      acc[key].totalQuantity += item.quantity || 1;
      acc[key].recordCount += 1;

      if (item.supplier && !acc[key].suppliers.includes(item.supplier)) {
        acc[key].suppliers.push(item.supplier);
      }

      if (item.expiryDate && item.expiryDate < acc[key].nearestExpiry) {
        acc[key].nearestExpiry = item.expiryDate;
      }

      return acc;
    },
    {}
  );

  const toggleGroupExpand = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // --------------------------------------------------------------------------
  // HIERARCHICAL TREE BUILDING (3 Levels: Category → Subcategory → Type → Item)
  // --------------------------------------------------------------------------
  const buildTreeHierarchy = () => {
    const tree: Record<string, {
      categoryName: string;
      subcategories: Record<string, {
        subCategoryName: string;
        types: Record<string, EquipmentItem[]>;
      }>;
    }> = {};

    filteredFinalized.forEach((item) => {
      const catName = item.category || 'عمومی / سایر';

      if (!tree[catName]) {
        tree[catName] = {
          categoryName: catName,
          subcategories: {},
        };
      }

      const subCatName = item.department || 'دپارتمان عمومی';
      if (!tree[catName].subcategories[subCatName]) {
        tree[catName].subcategories[subCatName] = {
          subCategoryName: subCatName,
          types: {},
        };
      }

      const typeName = `${item.faName} (${item.brand} ${item.model})`.trim();
      if (!tree[catName].subcategories[subCatName].types[typeName]) {
        tree[catName].subcategories[subCatName].types[typeName] = [];
      }

      tree[catName].subcategories[subCatName].types[typeName].push(item);
    });

    return tree;
  };

  const treeHierarchy = buildTreeHierarchy();

  return (
    <div className="space-y-6 pb-16 font-sans dir-rtl text-right text-slate-800">
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER & COMPACT SUMMARY CARDS                                    */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Page Title Bar */}
        <div className="bg-white rounded-3xl p-5 border border-blue-50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2b64f6] flex items-center justify-center font-bold shadow-xs border border-blue-100/60 shrink-0">
              <Package className="w-6 h-6 text-[#2b64f6]" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight">
                انبار و تجهیزات
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                داشبورد جامع مدیریت موجودی، پیش‌نویس‌ها، استعلامات و شناسه اموال بیمارستانی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-[#2b64f6] text-xs font-extrabold border border-blue-100">
              مدیریت هوشمند انبار آوید+
            </span>
          </div>
        </div>

        {/* Global Operational Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">مجموع موجودی</span>
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-800">
              {totalQuantitySum.toLocaleString('fa-IR')}{' '}
              <span className="text-[11px] text-slate-500 font-normal">قلم</span>
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold truncate">
              در {finalizedList.length} رکورد
            </p>
          </div>

          <div
            onClick={() => setActiveTab('drafts')}
            className={`rounded-2xl p-3.5 border shadow-xs hover:shadow-md transition-all cursor-pointer space-y-1 ${
              draftList.length > 0
                ? 'bg-amber-50/90 border-amber-200/90 text-amber-900'
                : 'bg-white border-slate-200/80 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold opacity-80">پیش‌نویس‌ها</span>
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black">
              {draftList.length}{' '}
              <span className="text-[11px] opacity-70 font-normal">مورد</span>
            </div>
            <p className="text-[10px] font-semibold text-amber-700 truncate">
              {draftList.length > 0 ? 'نیازمند تکمیل' : 'تمام اقلام نهایی'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">نزدیک به انقضا</span>
              <div className="w-7 h-7 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-800">
              {nearExpiryCount}{' '}
              <span className="text-[11px] text-slate-500 font-normal">عنوان</span>
            </div>
            <p className="text-[10px] text-orange-600 font-semibold truncate">تاریخ انقضا نزدیک</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1.5. TOAST NOTIFICATION BANNER                                            */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black">{toastMessage.title}</h4>
              {toastMessage.subtitle && (
                <p className="text-[11px] text-emerald-800 mt-0.5">{toastMessage.subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1.6. ACTION GUIDANCE BANNER (FROM DASHBOARD & HEADER NOTIFICATIONS)       */}
      {/* ========================================================================= */}
      {activeGuidance && (
        <div className="rounded-3xl p-5 border shadow-xs transition-all animate-in fade-in slide-in-from-top-2 bg-gradient-to-r from-blue-50/95 via-sky-50/80 to-indigo-50/90 border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#2b64f6] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                {activeGuidance.type === 'draft_tagging' ? (
                  <QrCode className="w-5 h-5" />
                ) : activeGuidance.type === 'low_stock' ? (
                  <ClipboardList className="w-5 h-5" />
                ) : (
                  <Archive className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2b64f6] text-white text-[10px] font-black">
                    راهنمای اقدام فوری
                  </span>
                  <h3 className="text-sm font-black text-slate-900">
                    {activeGuidance.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-3xl">
                  {activeGuidance.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {activeGuidance.type === 'draft_tagging' && (
                <button
                  onClick={() => {
                    const draftToEdit =
                      equipmentList.find((e) => e.id === activeGuidance.targetDraftId) ||
                      equipmentList.find((e) => e.isDraft);
                    if (draftToEdit) {
                      handleOpenDraftCompletion(draftToEdit);
                    }
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-black shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>تکمیل شناسنامه و صدور پلاک بارکد ❮</span>
                </button>
              )}

              {activeGuidance.type === 'low_stock' && (
                <button
                  onClick={() => {
                    if (setActivePage) {
                      setActivePage('purchase_requests');
                    }
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>ثبت درخواست خرید و تامین کالا ❮</span>
                </button>
              )}

              {activeGuidance.type === 'asset_transfer' && (
                <button
                  onClick={() => setShowAssetTransferModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Archive className="w-4 h-4" />
                  <span>بررسی صورت‌جلسه تحویل و جابجایی ❮</span>
                </button>
              )}

              <button
                onClick={() => {
                  setActiveGuidance(null);
                  onClearActionGuidance?.();
                }}
                className="p-2 rounded-2xl bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200 transition-all cursor-pointer"
                title="بستن راهنما"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRIMARY NAVIGATION TABS & ACTION BUTTON                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main View Switcher: Inventory vs Drafts */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4 text-[#2b64f6]" />
              <span>لیست کل موجودی‌ها</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                {finalizedList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'drafts'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>پیش‌نویس‌های ثبت‌نشده</span>
              {draftList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold animate-pulse">
                  {draftList.length}
                </span>
              )}
            </button>
          </div>

          {/* Action Button: "ثبت موجودی" (Opens Selection Modal) */}
          {!isReadOnly && (
            <button
              onClick={() => setShowEntryOptionModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-extrabold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت موجودی</span>
            </button>
          )}
        </div>

        {/* TAB 1: DRAFTS LIST VIEW (پیش‌نویس‌ها) */}
        {activeTab === 'drafts' && (
          <div className="p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>لیست اقلام پیش‌نویس نیازمند تکمیل شناسنامه اموال</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  اقلام زیر از اسناد هوشمند یا ثبت ناقص ایجاد شده‌اند و نیازمند تکمیل فیلدها هستند.
                </p>
              </div>
            </div>

            {draftList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {draftList.map((draft) => {
                  const missingCount = draft.missingFields ? draft.missingFields.length : 3;

                  return (
                    <div
                      key={draft.id}
                      className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/60 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{draft.faName}</span>
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                              پیش‌نویس
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            دسته‌بندی: <strong>{draft.category}</strong> | محل: {draft.location}
                          </p>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold shrink-0">
                          {missingCount} مورد ناقص
                        </span>
                      </div>

                      {draft.missingFields && draft.missingFields.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {draft.missingFields.map((field, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-white text-rose-600 border border-rose-200 text-[10px] font-medium"
                            >
                              فقدان {field}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          منبع: {draft.creator || 'پردازش هوشمند'}
                        </span>

                        <button
                          onClick={() => handleOpenDraftCompletion(draft)}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isReadOnly ? 'مشاهده پیش‌نویس' : 'ادامه تکمیل'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                هیچ پیش‌نویس ناقصی وجود ندارد. تمام موجودی‌ها نهایی شده‌اند.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FINALIZED INVENTORY VIEW (موجودی‌ها) */}
        {activeTab === 'inventory' && (
          <div className="p-5 space-y-5 animate-in fade-in">
            {/* 1. Quick Smart Automatic Filter Presets Bar (Compact) */}
            <div className="p-2.5 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/40 rounded-xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 shrink-0 ml-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  <span>فیلترهای هوشمند:</span>
                </div>

                <button
                  onClick={() => setQuickPreset('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    quickPreset === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>همه موجودی</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      quickPreset === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {presetCounts.all}
                  </span>
                </button>

                <button
                  onClick={() => setQuickPreset(quickPreset === 'calibration_due' ? 'all' : 'calibration_due')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    quickPreset === 'calibration_due'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white text-purple-800 border border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  <Award className="w-3 h-3 text-purple-500" />
                  <span>موعد کالیبراسیون</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      quickPreset === 'calibration_due' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {presetCounts.calibration_due}
                  </span>
                </button>

                <button
                  onClick={() => setQuickPreset(quickPreset === 'near_expiry' ? 'all' : 'near_expiry')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    quickPreset === 'near_expiry'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <Clock className="w-3 h-3 text-rose-500" />
                  <span>نزدیک به انقضا</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      quickPreset === 'near_expiry' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {presetCounts.near_expiry}
                  </span>
                </button>

                <button
                  onClick={() => setQuickPreset(quickPreset === 'maintenance' ? 'all' : 'maintenance')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    quickPreset === 'maintenance'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <Wrench className="w-3 h-3 text-amber-500" />
                  <span>تعمیرات / نقص</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      quickPreset === 'maintenance' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {presetCounts.maintenance}
                  </span>
                </button>

                <button
                  onClick={() => setQuickPreset(quickPreset === 'low_stock' ? 'all' : 'low_stock')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    quickPreset === 'low_stock'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-orange-800 border border-orange-200 hover:bg-orange-50'
                  }`}
                >
                  <Boxes className="w-3 h-3 text-orange-500" />
                  <span>کسری موجودی</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      quickPreset === 'low_stock' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {presetCounts.low_stock}
                  </span>
                </button>

                <button
                  onClick={() => setQuickPreset(quickPreset === 'critical_care' ? 'all' : 'critical_care')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    quickPreset === 'critical_care'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <Activity className="w-3 h-3 text-emerald-500" />
                  <span>بخش ویژه و اورژانس</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      quickPreset === 'critical_care' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {presetCounts.critical_care}
                  </span>
                </button>

                <button
                  onClick={() => setQuickPreset(quickPreset === 'under_warranty' ? 'all' : 'under_warranty')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    quickPreset === 'under_warranty'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-teal-800 border border-teal-200 hover:bg-teal-50'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 text-teal-500" />
                  <span>گارانتی معتبر</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      quickPreset === 'under_warranty' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {presetCounts.under_warranty}
                  </span>
                </button>

                <button
                  onClick={() => setQuickPreset(quickPreset === 'high_risk' ? 'all' : 'high_risk')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    quickPreset === 'high_risk'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white text-red-800 border border-red-200 hover:bg-red-50'
                  }`}
                >
                  <ShieldAlert className="w-3 h-3 text-red-500" />
                  <span>خطر بالا</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      quickPreset === 'high_risk' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {presetCounts.high_risk}
                  </span>
                </button>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetAllFilters}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 shrink-0 cursor-pointer bg-white px-2 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors shadow-2xs"
                >
                  <X className="w-3 h-3" />
                  <span>بازنشانی فیلترها</span>
                </button>
              )}
            </div>

            {/* 2. Search + Filter Toggle + View Mode Switcher */}
            <div className="space-y-3 border-b border-slate-100 pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی جامع نام کالا، برند، مدل، دپارتمان، سریال، بچ، تأمین‌کننده..."
                    className="w-full pr-9 pl-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2b64f6] focus:bg-white focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeFiltersCount > 0
                        ? 'bg-blue-50 text-[#2b64f6] border-blue-200 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>فیلترها</span>
                    {activeFiltersCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-md bg-blue-600 text-white text-[10px] font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setDisplayLayout('grouped')}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        displayLayout === 'grouped'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="نمای تجمیعی کالاهای مشابه"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>نمای تجمیعی</span>
                    </button>

                    <button
                      onClick={() => setDisplayLayout('individual')}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        displayLayout === 'individual'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="نمای جزئیات و تکی اقلام"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>نمای جزئیات</span>
                    </button>

                    <button
                      onClick={() => setDisplayLayout('tree')}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        displayLayout === 'tree'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="نمای سلسله‌مراتبی و درختی"
                    >
                      <FolderTree className="w-3.5 h-3.5" />
                      <span>نمای سلسله‌مراتبی</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Automatic Comprehensive Attribute Filter Grid */}
              {isFiltersExpanded && (
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 text-xs animate-in fade-in shadow-2xs">
                  {/* فیلتر ۱: نام کالا و تجهیز */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3 text-blue-600" />
                      <span>نام و عنوان قلم:</span>
                    </label>
                    <select
                      value={filterItemName}
                      onChange={(e) => setFilterItemName(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه نام‌ها ({itemNames.length} کالا)</option>
                      {itemNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* فیلتر ۲: نوع قلم (سرمایه‌ای / مصرفی) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Boxes className="w-3 h-3 text-indigo-600" />
                      <span>نوع کالا و ماهیت:</span>
                    </label>
                    <select
                      value={filterItemKind}
                      onChange={(e) => setFilterItemKind(e.target.value as any)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه انواع اقلام</option>
                      <option value="device">دستگاه و تجهیزات</option>
                      <option value="consumable">کالای مصرفی و دارویی</option>
                    </select>
                  </div>

                  {/* فیلتر ۳: وضعیت عملیاتی و انبار */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-600" />
                      <span>وضعیت عملیاتی / انبار:</span>
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه وضعیت‌ها</option>
                      <optgroup label="── وضعیت تجهیزات و دستگاه‌ها ──">
                        <option value="in_use">در حال استفاده (In Use)</option>
                        <option value="active">فعال و آماده به کار (Active)</option>
                        <option value="under_maintenance">در حال تعمیر (Under Maintenance)</option>
                        <option value="calibrating">در حال کالیبراسیون (Calibrating)</option>
                        <option value="idle">بلااستفاده / مازاد (Idle)</option>
                        <option value="decommissioned">اسقاط شده (Decommissioned)</option>
                      </optgroup>
                      <optgroup label="── وضعیت اقلام مصرفی و انبار ──">
                        <option value="in_stock">موجود در انبار (In Stock)</option>
                        <option value="low_stock">کمبود موجودی (Low Stock)</option>
                        <option value="out_of_stock">تمام شده / ناموجود (Out of Stock)</option>
                        <option value="expired">منقضی شده (Expired)</option>
                        <option value="near_expiry">در شرف انقضا (Near Expiry)</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* فیلتر ۴: وضعیت کالیبراسیون */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Award className="w-3 h-3 text-purple-600" />
                      <span>وضعیت کالیبراسیون:</span>
                    </label>
                    <select
                      value={filterCalibrationStatus}
                      onChange={(e) => setFilterCalibrationStatus(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه وضعیت‌های کالیبراسیون</option>
                      <option value="valid">دارای گواهی کالیبره معتبر</option>
                      <option value="expiring_soon">نزدیک به موعد کالیبراسیون</option>
                      <option value="expired">کالیبراسیون منقضی‌شده (اقدام فوری)</option>
                      <option value="in_progress">در حال انجام کالیبراسیون</option>
                      <option value="not_required">غیرنیازمند به کالیبراسیون (مصرفی)</option>
                    </select>
                  </div>

                  {/* فیلتر ۵: دوره تناوب کالیبراسیون */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-600" />
                      <span>دوره تناوب کالیبراسیون:</span>
                    </label>
                    <select
                      value={filterCalibrationPeriod}
                      onChange={(e) => setFilterCalibrationPeriod(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه دوره‌ها</option>
                      <option value="3_months">دوره ۳ ماهه (حیاتی/شوک)</option>
                      <option value="6_months">دوره ۶ ماهه (تنفسی/بیهوشی/مانیتور)</option>
                      <option value="12_months">دوره ۱ ساله (استاندارد)</option>
                      <option value="24_months">دوره ۲ ساله (پشتیبانی/عمومی)</option>
                    </select>
                  </div>

                  {/* فیلتر ۶: تاریخ انقضای کالا */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-600" />
                      <span>تاریخ انقضای مصرف:</span>
                    </label>
                    <select
                      value={filterExpiry}
                      onChange={(e) => setFilterExpiry(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه تاریخ‌های انقضا</option>
                      <option value="expired">منقضی‌شده (غیرقابل استفاده)</option>
                      <option value="near_3m">کمتر از ۳ ماه به انقضا</option>
                      <option value="near_6m">کمتر از ۶ ماه به انقضا</option>
                      <option value="near_year">کمتر از ۱ سال به انقضا</option>
                      <option value="valid">دارای تاریخ انقضای معتبر</option>
                      <option value="no_expiry">فاقد تاریخ انقضا (دستگاه)</option>
                    </select>
                  </div>

                  {/* فیلتر ۷: دپارتمان و بخش */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-blue-600" />
                      <span>دپارتمان / محل استقرار:</span>
                    </label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه دپارتمان‌ها ({departments.length} بخش)</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* فیلتر ۸: دسته‌بندی تجهیز */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Folder className="w-3 h-3 text-sky-600" />
                      <span>دسته‌بندی تجهیز:</span>
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه دسته‌بندی‌ها ({categories.length} گروه)</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* فیلتر ۹: برند سازنده */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Award className="w-3 h-3 text-teal-600" />
                      <span>برند سازنده:</span>
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه برندها ({brands.length} برند)</option>
                      {brands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* فیلتر ۱۰: تأمین‌کننده / خدمات‌دهنده */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-amber-600" />
                      <span>تأمین‌کننده / خدمات‌دهنده:</span>
                    </label>
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه تأمین‌کنندگان ({suppliers.length} شرکت)</option>
                      {suppliers.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* فیلتر ۱۱: وضعیت گارانتی و ضمانت */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>وضعیت گارانتی / ضمانت:</span>
                    </label>
                    <select
                      value={filterWarranty}
                      onChange={(e) => setFilterWarranty(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه وضعیت‌های گارانتی</option>
                      <option value="valid">دارای گارانتی معتبر و فعال</option>
                      <option value="near_expiry">در شرف پایان گارانتی</option>
                      <option value="expired_none">منقضی یا فاقد گارانتی</option>
                    </select>
                  </div>

                  {/* فیلتر ۱۲: سطح ریسک و کلاس خطر */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-red-600" />
                      <span>کلاس خطر و ریسک:</span>
                    </label>
                    <select
                      value={filterRiskLevel}
                      onChange={(e) => setFilterRiskLevel(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه سطوح ریسک</option>
                      <option value="high">کلاس III (حیاتی و پرخطر)</option>
                      <option value="medium">کلاس II (ریسک متوسط/تصویربرداری/مانیتورینگ)</option>
                      <option value="low">کلاس I (کم‌خطر/عمومی/تخت و چراغ)</option>
                    </select>
                  </div>

                  {/* فیلتر ۱۳: شاخص سلامت و ایمنی */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      <span>شاخص ایمنی و سلامت:</span>
                    </label>
                    <select
                      value={filterSafetyScore}
                      onChange={(e) => setFilterSafetyScore(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه شاخص‌های ایمنی</option>
                      <option value="high_90">عالی و استاندارد (بالای ۹۵٪)</option>
                      <option value="medium_70_89">خوب و پایدار (۸۵٪ تا ۹۴٪)</option>
                      <option value="low_70">نیازمند بررسی فنی (زیر ۸۵٪)</option>
                    </select>
                  </div>

                  {/* فیلتر ۱۴: سطح موجودی انبار */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Boxes className="w-3 h-3 text-orange-600" />
                      <span>سطح موجودی انبار:</span>
                    </label>
                    <select
                      value={filterStockLevel}
                      onChange={(e) => setFilterStockLevel(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="all">همه سطوح موجودی</option>
                      <option value="in_stock">موجودی کافی و نرمال</option>
                      <option value="low_stock">نقطه سفارش / کمبود موجودی</option>
                      <option value="out_of_stock">اتمام موجودی / صفر</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 4. Active Filter Summary & Result Count Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-700">
                    نمایش <strong>{filteredFinalized.length}</strong> قلم از مجموع <strong>{finalizedList.length}</strong> مورد در انبار
                  </span>

                  {activeFiltersCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                      {activeFiltersCount} فیلتر فعال
                    </span>
                  )}
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetAllFilters}
                    className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>پاک‌کردن فیلترها</span>
                  </button>
                )}
              </div>
            </div>

            {/* VIEW MODE 1: AGGREGATED VIEW */}
            {displayLayout === 'grouped' && (
              <div className="space-y-3">
                {Object.keys(groupedProducts).length > 0 ? (
                  Object.entries(groupedProducts).map(([groupKey, group]) => {
                    const isExpanded = expandedGroups[groupKey] ?? false;

                    return (
                      <div
                        key={groupKey}
                        className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs transition-all"
                      >
                        <div
                          onClick={() => toggleGroupExpand(groupKey)}
                          className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/60 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <button className="p-1 rounded bg-white border border-slate-200 text-slate-500">
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 text-xs">
                                  {group.groupName}
                                </h3>
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2b64f6] border border-blue-200/80 text-[10px] font-semibold">
                                  {group.category}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 mt-0.5">
                                برند: <strong>{group.brand}</strong> | مدل:{' '}
                                <strong>{group.model}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">
                                مجموع موجودی:
                              </span>
                              <span className="font-extrabold text-[#2b64f6] text-xs">
                                {group.totalQuantity.toLocaleString('fa-IR')} {group.unit}
                              </span>
                            </div>

                            <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">
                                تعداد رکوردها:
                              </span>
                              <span className="font-bold text-slate-700">
                                {group.recordCount} رکورد
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Group Details */}
                        {isExpanded && (
                          <div className="p-3 bg-white space-y-2">
                            {group.items.map((subItem) => (
                              <div
                                key={subItem.id}
                                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 text-xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                                      {subItem.code}
                                    </span>
                                    <span className="font-bold text-slate-800">
                                      سریال: {subItem.serialNumber || '—'}
                                    </span>
                                    <StatusBadge item={subItem} compact />
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                                    <span>محل: <strong>{subItem.location}</strong></span>
                                    <span>•</span>
                                    <span>تأمین‌کننده: <strong>{subItem.supplier || '—'}</strong></span>
                                    <span>•</span>
                                    <span>تاریخ انقضا: <strong className="dir-ltr inline-block">{subItem.expiryDate || '—'}</strong></span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-800">
                                    {subItem.quantity} {subItem.unit}
                                  </span>
                                  {canAccessCalibration && (
                                    <button
                                      onClick={() => onNavigateToCalibration?.(subItem)}
                                      className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                                      title="کالیبراسیون و ایمنی این تجهیز"
                                    >
                                      <Award className="w-3.5 h-3.5 text-sky-600" />
                                      <span>کالیبراسیون و ایمنی</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setViewingItem(subItem)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
                                  >
                                    شناسنامه
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    هیچ کالایی مطابق با فیلترهای انتخابی یافت نشد.
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE 2: INDIVIDUAL RECORDS VIEW */}
            {displayLayout === 'individual' && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">کد اموال</th>
                      <th className="p-3">نام کالا/تجهیز</th>
                      <th className="p-3">برند / مدل</th>
                      <th className="p-3">وضعیت</th>
                      <th className="p-3">محل استقرار</th>
                      <th className="p-3">موجودی</th>
                      <th className="p-3">تاریخ انقضا</th>
                      <th className="p-3">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFinalized.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-700">{item.code}</td>
                        <td className="p-3 font-bold text-slate-900">{item.faName}</td>
                        <td className="p-3 text-slate-600">{item.brand} — {item.model}</td>
                        <td className="p-3">
                          <StatusBadge item={item} />
                        </td>
                        <td className="p-3 text-slate-600">{item.location}</td>
                        <td className="p-3 font-extrabold text-[#2b64f6]">{item.quantity} {item.unit}</td>
                        <td className="p-3 text-amber-700 dir-ltr text-right">{item.expiryDate || '—'}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {canAccessCalibration && (
                              <button
                                onClick={() => onNavigateToCalibration?.(item)}
                                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                title="کالیبراسیون و ایمنی"
                              >
                                <Award className="w-3.5 h-3.5 text-sky-600" />
                                <span>کالیبراسیون و ایمنی</span>
                              </button>
                            )}
                            <button
                              onClick={() => setViewingItem(item)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                            >
                              شناسنامه
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* VIEW MODE 3: HIERARCHICAL TREE VIEW (3 Levels) */}
            {displayLayout === 'tree' && (
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 mb-2 font-bold flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-[#2b64f6]" />
                  <span>ساختار سلسله‌مراتبی اموال: دسته بندی → زیردسته → نوع</span>
                </div>

                {Object.entries(treeHierarchy).map(([catName, catData]) => {
                  const catNodeId = `cat-${catName}`;
                  const isCatOpen = expandedNodes[catNodeId] ?? false;

                  return (
                    <div key={catName} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                      {/* Level 1: Category */}
                      <div
                        onClick={() => toggleNodeExpand(catNodeId)}
                        className="p-3 bg-slate-100/90 hover:bg-slate-200/80 cursor-pointer flex items-center justify-between font-bold text-slate-800 text-xs border-b border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isCatOpen ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-600" />}
                          <Folder className="w-4 h-4 text-[#2b64f6]" />
                          <span>دسته بندی: {catName}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                          {Object.keys(catData.subcategories).length} زیردسته
                        </span>
                      </div>

                      {/* Level 2: Subcategory */}
                      {isCatOpen && (
                        <div className="p-3 space-y-3 bg-white pr-6">
                          {Object.entries(catData.subcategories).map(([subCatName, subCatData]) => {
                            const subNodeId = `sub-${catName}-${subCatName}`;
                            const isSubOpen = expandedNodes[subNodeId] ?? false;

                            return (
                              <div key={subCatName} className="rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden">
                                <div
                                  onClick={() => toggleNodeExpand(subNodeId)}
                                  className="p-2.5 bg-slate-100/60 hover:bg-slate-100 cursor-pointer flex items-center justify-between font-bold text-slate-700 text-xs border-b border-slate-200/60"
                                >
                                  <div className="flex items-center gap-2">
                                    {isSubOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                    <Layers3 className="w-3.5 h-3.5 text-slate-600" />
                                    <span>زیردسته: {subCatName}</span>
                                  </div>
                                </div>

                                {/* Level 3: Type */}
                                {isSubOpen && (
                                  <div className="p-2.5 space-y-2 bg-white pr-6">
                                    {Object.entries(subCatData.types).map(([typeName, items]) => {
                                      const typeNodeId = `type-${subCatName}-${typeName}`;
                                      const isTypeOpen = expandedNodes[typeNodeId] ?? false;

                                      return (
                                        <div key={typeName} className="rounded-lg border border-slate-100 bg-slate-50/30 overflow-hidden">
                                          <div
                                            onClick={() => toggleNodeExpand(typeNodeId)}
                                            className="p-2 bg-slate-50 hover:bg-slate-100/70 cursor-pointer flex items-center justify-between font-bold text-slate-800 text-[11px]"
                                          >
                                            <div className="flex items-center gap-2">
                                              {isTypeOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                                              <Package className="w-3.5 h-3.5 text-[#2b64f6]" />
                                              <span>نوع: {typeName}</span>
                                            </div>
                                            <span className="text-[10px] text-[#2b64f6] font-bold">
                                              {items.length} رکورد
                                            </span>
                                          </div>

                                          {/* Item Records */}
                                          {isTypeOpen && (
                                            <div className="p-2 space-y-1.5 bg-white pr-6">
                                              {items.map((item) => (
                                                <div
                                                  key={item.id}
                                                  className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]"
                                                >
                                                  <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono font-bold text-slate-700">{item.code}</span>
                                                    <span>•</span>
                                                    <span>سریال: {item.serialNumber || '—'}</span>
                                                    <span>•</span>
                                                    <StatusBadge item={item} compact />
                                                    <span>•</span>
                                                    <span>محل: {item.location}</span>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#2b64f6]">{item.quantity} {item.unit}</span>
                                                    {canAccessCalibration && (
                                                      <button
                                                        onClick={() => onNavigateToCalibration?.(item)}
                                                        className="px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                                                        title="کالیبراسیون و ایمنی"
                                                      >
                                                        <Award className="w-3 h-3 text-sky-600" />
                                                        <span>کالیبراسیون</span>
                                                      </button>
                                                    )}
                                                    <button
                                                      onClick={() => setViewingItem(item)}
                                                      className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                                                    >
                                                      مشاهده
                                                    </button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: ENTRY SELECTION (ثبت موجودی هوشمند vs ثبت موجودی دستی)        */}
      {/* ========================================================================= */}
      {showEntryOptionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden dir-rtl text-right animate-in fade-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#2b64f6]" />
                <h3 className="text-sm font-bold text-slate-900">روش ثبت موجودی</h3>
              </div>

              <button
                onClick={() => setShowEntryOptionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Exactly Two Options with No Paragraph Explanations */}
            <div className="p-5 space-y-3">
              {/* Option 1: ثبت موجودی هوشمند */}
              <div
                onClick={() => {
                  setShowEntryOptionModal(false);
                  setShowSmartUploadModal(true);
                }}
                className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-all cursor-pointer flex items-center gap-3.5 group shadow-xs hover:shadow"
              >
                <div className="p-3 rounded-xl bg-[#2b64f6] text-white group-hover:scale-105 transition-transform shrink-0">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-900">
                    ثبت موجودی هوشمند
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                    بارگذاری فایل (Excel, CSV, PDF, Word, عکس/اسکن) یا ورود/پیست متن خام
                  </span>
                </div>
              </div>

              {/* Option 2: ثبت دستی موجودی */}
              <div
                onClick={handleStartManualRegistration}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-3.5 group shadow-xs hover:shadow"
              >
                <div className="p-3 rounded-xl bg-slate-200 text-slate-800 group-hover:scale-105 transition-transform shrink-0">
                  <FolderTree className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    ثبت دستی موجودی
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                    ثبت موجودی جدید به کمک فرم آماده
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-left">
              <button
                onClick={() => setShowEntryOptionModal(false)}
                className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: SMART INVENTORY REGISTRATION (FILE & RAW TEXT)                 */}
      {/* ========================================================================= */}
      {showSmartUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden dir-rtl text-right animate-in fade-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#2b64f6]" />
                <h3 className="text-sm font-bold text-slate-900">ثبت موجودی هوشمند</h3>
              </div>

              <button
                onClick={() => setShowSmartUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Smart Mode Toggle: File Upload vs Raw Text */}
            <div className="p-2 bg-slate-100 border-b border-slate-200 flex text-xs font-bold">
              <button
                onClick={() => setSmartMode('file')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  smartMode === 'file' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileUp className="w-4 h-4 text-[#2b64f6]" />
                <span>بارگذاری فایل (Excel, CSV, PDF, Word, عکس)</span>
              </button>

              <button
                onClick={() => setSmartMode('text')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  smartMode === 'text' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4 text-[#2b64f6]" />
                <span>ورود / پیست متن خام</span>
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {smartMode === 'file' ? (
                !uploadedFileState ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/60 transition-all cursor-pointer text-center space-y-3 group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelected(e.target.files[0]);
                        }
                      }}
                      accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                      className="hidden"
                    />

                    <div className="flex justify-center">
                      <div className="p-3 rounded-full bg-blue-100 text-[#2b64f6] group-hover:scale-110 transition-transform">
                        <FileUp className="w-8 h-8 text-[#2b64f6]" />
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        برای بارگذاری فایل کلیک کنید یا فایل را بکشید و رها کنید
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        فرمت‌های پشتیبانی‌شده: Excel, CSV, PDF, Word, PNG/JPG و اسناد اسکن‌شده
                      </span>
                    </div>

                    <div className="pt-2">
                      <span className="px-4 py-2 rounded-xl bg-[#2b64f6] text-white text-xs font-bold shadow-2xs group-hover:bg-blue-700 transition-colors inline-block">
                        انتخاب فایل از سیستم
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {uploadedFileState.fileType.includes('XLS') || uploadedFileState.fileType.includes('CSV') ? (
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-[#2b64f6]" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                            {uploadedFileState.fileName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            حجم: {uploadedFileState.fileSize} | فرمت: {uploadedFileState.fileType}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleResetUpload}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="حذف فایل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {uploadedFileState.status === 'analyzing' ? (
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-center gap-2 text-xs text-[#2b64f6] font-medium">
                        <Loader2 className="w-4 h-4 animate-spin text-[#2b64f6]" />
                        <span>{uploadStepText}</span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>استخراج و تطبیق اطلاعات انجام شد</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          اقلام کامل به موجودی و اقلام ناقص به بخش پیش‌نویس‌ها انتقال یافتند.
                        </p>
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* Raw Text Mode */
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    متن خام فاکتور یا مشخصات اقلام را اینجا پیست کنید:
                  </label>
                  <textarea
                    rows={6}
                    value={rawTextInput}
                    onChange={(e) => setRawTextInput(e.target.value)}
                    placeholder="مثلا: ۵ عدد ونتیلاتور مدل OptiFlow ساخت فیشر پیکل با شماره سریال..."
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2b64f6]"
                  />

                  <button
                    onClick={handleProcessRawText}
                    disabled={!rawTextInput.trim() || isUploading}
                    className="w-full py-2.5 rounded-xl bg-[#2b64f6] hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>در حال پردازش متن...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>پردازش و استخراج خودکار اقلام</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setShowSmartUploadModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                بستن
              </button>

              {uploadedFileState?.status === 'completed' && (
                <button
                  onClick={() => {
                    setShowSmartUploadModal(false);
                    setActiveTab('inventory');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  مشاهده در موجودی‌ها
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: MANUAL INVENTORY REGISTRATION (SEARCH-BASED PRODUCT SELECTION)   */}
      {/* ========================================================================= */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl lg:max-w-5xl w-full min-h-[560px] max-h-[92vh] overflow-hidden flex flex-col dir-rtl text-right animate-in fade-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#2b64f6] flex items-center justify-center shrink-0">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    ثبت دستی موجودی تجهیز / کالا
                  </h3>
                  <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                    انتخاب از کاتالوگ استاندارد و تکمیل مشخصات فنی و استقرار
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowManualModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
              {!selectedProductId ? (
                /* Step 1: Unified Smart Inventory Picker */
                <div className="space-y-4 animate-in fade-in">
                  <SmartInventoryPicker
                    onSelectItem={handleSmartMemorySelect}
                    classificationsList={classificationsList}
                    placeholder="نام موجودی، کالا، دستگاه یا تجهیز موردنظر را جستجو یا تایپ کنید..."
                    autoFocus={true}
                  />
                </div>
              ) : (
                /* Step 2: Selected Equipment Banner + Form Fields */
                <div className="space-y-4 pt-1 animate-in fade-in">
                  {/* Selected Product Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-sky-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#2b64f6] border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900">
                            موجودی انتخاب‌شده: {formFaName || selectedProduct?.name}
                          </span>
                          {formEnName && (
                            <span className="text-[11px] text-slate-500 font-sans font-semibold dir-ltr">
                              ({formEnName})
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-[#2b64f6] font-bold border border-blue-200">
                            {formCategory || selectedProduct?.category || (formItemKind === 'consumable' ? 'قلم مصرفی' : 'دستگاه / تجهیز')}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>ساختار اموال:</span>
                          <span className="font-bold text-slate-800">
                            {formCategory || selectedProduct?.category} ❯ {formSubcategory || selectedProduct?.subcategory} ❯ {formType || selectedProduct?.type}
                          </span>
                          {selectedProduct?.umdns && (
                            <span className="font-mono bg-white px-1.5 py-0.2 rounded text-[9px] border border-slate-200">
                              UMDNS: {selectedProduct.umdns}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductId(null);
                        setFormCategory('');
                        setFormSubcategory('');
                        setFormType('');
                        setFormCustomInheritedFields([]);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#2b64f6] border border-blue-200 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>تغییر یا انتخاب مجدد کالا</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-extrabold text-slate-800 mb-3.5 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-[#2b64f6]" />
                      <span>مشخصات عمومی و اطلاعات استقرار</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          نام فارسی کالا/تجهیز: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formFaName}
                          onChange={(e) => setFormFaName(e.target.value)}
                          placeholder="مثلا: ونتیلاتور مراقبت ویژه"
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:border-[#2b64f6] focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          نام انگلیسی:
                        </label>
                        <input
                          type="text"
                          value={formEnName}
                          onChange={(e) => setFormEnName(e.target.value)}
                          placeholder="ICU Ventilator"
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-left font-sans text-xs focus:border-[#2b64f6] focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          برند سازنده: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formBrand}
                          onChange={(e) => setFormBrand(e.target.value)}
                          placeholder="مثلا: Fisher & Paykel"
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:border-[#2b64f6] focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          مدل دستگاه: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formModel}
                          onChange={(e) => setFormModel(e.target.value)}
                          placeholder="مثلا: OptiFlow 850"
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:border-[#2b64f6] focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          شماره سریال: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formSerialNumber}
                          onChange={(e) => setFormSerialNumber(e.target.value)}
                          placeholder="SN-90241"
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono text-xs focus:border-[#2b64f6] focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            کد اموال / پلاک‌کوبی: <span className="text-rose-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const randomNum = Math.floor(1000 + Math.random() * 9000);
                              setFormCode(`EQ-1403-${randomNum}`);
                            }}
                            className="text-[10px] text-[#2b64f6] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>تولید خودکار کد</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={formCode}
                          onChange={(e) => setFormCode(e.target.value)}
                          placeholder="مثلاً: EQ-1403-1045"
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono font-bold text-xs focus:border-[#2b64f6] focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      {/* Live Metal Asset Tag Mockup Preview */}
                      <div className="col-span-1 sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 border border-slate-300 shadow-inner flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center p-1 shadow-xs shrink-0">
                            <QrCode className="w-9 h-9 text-slate-900" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-900 tracking-tight">
                                بیمارستان تخصصی و فوق‌تخصصی آوید
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-white font-mono font-bold">
                                پلاک فلزی اموال
                              </span>
                            </div>
                            <div className="text-xs font-mono font-black text-blue-900 mt-0.5">
                              کد اموال: {formCode || 'EQ-1403-XXXX'}
                            </div>
                            <p className="text-[10px] text-slate-600 truncate max-w-xs mt-0.5">
                              {formFaName || 'عنوان تجهیز'} | سریال: {formSerialNumber || 'SN-XXXX'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold hidden sm:inline-block">
                          پیش‌نمایش پلاک اموال
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          نوع موجودی:
                        </label>
                        <select
                          value={formItemKind}
                          onChange={(e) => {
                            const kind = e.target.value as ItemKind;
                            setFormItemKind(kind);
                            setFormStatus(kind === 'device' ? 'active' : 'in_stock');
                          }}
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                        >
                          <option value="device">دستگاه / تجهیز (تجهیزات پزشکی، عمومی و اداری)</option>
                          <option value="consumable">قلم مصرفی / انبار (دستکش، دارو، ست تزریق و ...)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          وضعیت قلم / موجودی:
                        </label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as EquipmentStatus)}
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-xs"
                        >
                          {formItemKind === 'device' ? (
                            <>
                              <option value="active">فعال و آماده به کار (Active)</option>
                              <option value="in_use">در حال استفاده (In Use)</option>
                              <option value="under_maintenance">در حال تعمیر (Under Maintenance)</option>
                              <option value="calibrating">در حال کالیبراسیون (Calibrating)</option>
                              <option value="idle">بلااستفاده / مازاد (Idle)</option>
                              <option value="decommissioned">اسقاط شده (Decommissioned)</option>
                            </>
                          ) : (
                            <>
                              <option value="in_stock">موجود در انبار (In Stock)</option>
                              <option value="low_stock">کمبود موجودی (Low Stock)</option>
                              <option value="out_of_stock">تمام شده / ناموجود (Out of Stock)</option>
                              <option value="expired">منقضی شده (Expired)</option>
                              <option value="near_expiry">در شرف انقضا (Near Expiry)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          محل استقرار دقیق: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formLocation}
                          onChange={(e) => setFormLocation(e.target.value)}
                          placeholder="بخش ICU - تخت ۴"
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:border-[#2b64f6]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          تعداد:
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={formQuantity}
                          onChange={(e) => setFormQuantity(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          واحد سنجش:
                        </label>
                        <select
                          value={formUnit}
                          onChange={(e) => setFormUnit(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                        >
                          <option value="عدد">عدد</option>
                          <option value="دستگاه">دستگاه</option>
                          <option value="بسته">بسته</option>
                          <option value="جعبه">جعبه</option>
                          <option value="کارتن">کارتن</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Inherited Fields (Role-Aware) */}
                  {inheritedFieldsList.length > 0 && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <SlidersHorizontal className="w-4 h-4 text-[#2b64f6]" />
                          <span>فیلدهای اطلاعاتی موردنیاز طبقه‌بندی</span>
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {inheritedFieldsList.map(({ levelLabel, field }) => {
                          const isFieldEditable =
                            !field.assignedRole ||
                            field.assignedRole === 'all' ||
                            currentUser?.role === 'hospital_admin' ||
                            currentUser?.role === 'asset_manager' ||
                            currentUser?.role === field.assignedRole;

                          return (
                            <div key={field.id} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="block text-[11px] font-bold text-slate-700">
                                  {field.name} {field.required && <span className="text-rose-500">*</span>}
                                </label>
                                {field.assignedRoleTitleFa && field.assignedRole !== 'all' && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600 font-medium">
                                    {field.assignedRoleTitleFa}
                                  </span>
                                )}
                              </div>

                              {field.type === 'select' && field.options ? (
                                <select
                                  disabled={!isFieldEditable}
                                  value={formSpecs[field.name] || ''}
                                  onChange={(e) =>
                                    setFormSpecs({ ...formSpecs, [field.name]: e.target.value })
                                  }
                                  className={`w-full p-2.5 rounded-xl border text-slate-800 text-xs ${
                                    isFieldEditable
                                      ? 'bg-white border-slate-200 focus:border-[#2b64f6]'
                                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                  }`}
                                >
                                  <option value="">انتخاب کنید...</option>
                                  {field.options.map((opt, idx) => (
                                    <option key={idx} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  disabled={!isFieldEditable}
                                  type={field.type === 'number' ? 'number' : 'text'}
                                  value={formSpecs[field.name] || ''}
                                  onChange={(e) =>
                                    setFormSpecs({ ...formSpecs, [field.name]: e.target.value })
                                  }
                                  placeholder={field.helpText || field.name}
                                  className={`w-full p-2.5 rounded-xl border text-slate-800 text-xs ${
                                    isFieldEditable
                                      ? 'bg-white border-slate-200 focus:border-[#2b64f6]'
                                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setShowManualModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                {isReadOnly ? 'بستن' : 'انصراف'}
              </button>

              {!isReadOnly && selectedProductId ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveRegistration(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    ذخیره پیش‌نویس
                  </button>
                  <button
                    onClick={() => handleSaveRegistration(false)}
                    className="px-4 py-2 rounded-xl bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    ثبت نهایی در موجودی‌ها
                  </button>
                </div>
              ) : !isReadOnly && !selectedProductId ? (
                <div className="text-[11px] text-slate-400 font-medium">
                  برای ادامه، روی یکی از اقلام فهرست بالا کلیک کنید
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: PASSPORT / EQUIPMENT DETAILS                                    */}
      {/* ========================================================================= */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden dir-rtl text-right animate-in fade-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#2b64f6]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{viewingItem.faName}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{viewingItem.code}</p>
                </div>
              </div>

              <button
                onClick={() => setViewingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px] font-bold">وضعیت فعلی موجودی:</span>
                  <StatusBadge item={viewingItem} />
                </div>
                <span className="text-[11px] text-slate-500">
                  {getItemStatusDescription(viewingItem)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px]">دسته‌بندی:</span>
                  <span className="font-bold text-slate-800">{viewingItem.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">نوع قلم:</span>
                  <span className="font-bold text-slate-800">
                    {viewingItem.itemKind === 'consumable' ? 'قلم مصرفی انبار' : 'دستگاه / تجهیز پزشکی'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">برند / مدل:</span>
                  <span className="font-bold text-slate-800">
                    {viewingItem.brand} — {viewingItem.model}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">شماره سریال:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {viewingItem.serialNumber || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">محل استقرار:</span>
                  <span className="font-bold text-slate-800">{viewingItem.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">موجودی:</span>
                  <span className="font-extrabold text-[#2b64f6]">
                    {viewingItem.quantity} {viewingItem.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">تأمین‌کننده:</span>
                  <span className="font-bold text-slate-800">{viewingItem.supplier || '—'}</span>
                </div>
                {viewingItem.expiryDate && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">تاریخ انقضا:</span>
                    <span className="font-mono font-bold text-amber-700 dir-ltr inline-block">
                      {viewingItem.expiryDate}
                    </span>
                  </div>
                )}
                {viewingItem.batchNo && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">شماره بهر / لات:</span>
                    <span className="font-mono font-bold text-slate-800">{viewingItem.batchNo}</span>
                  </div>
                )}
              </div>

              {/* SECTION: OPERATOR COMMENTS & USABILITY FEEDBACK (ثبت نظر درباره تجهیز) */}
              <div className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#2b64f6]" />
                    <span className="font-extrabold text-slate-800 text-xs">
                      سوابق و نظرات کاربری درباره این تجهیز ({viewingItem.comments?.length || 0})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setNewCommentText('');
                      setNewCommentRating(5);
                      setNewCommentType('operational_note');
                      setShowAddCommentModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#2b64f6] hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>ثبت نظر درباره تجهیز</span>
                  </button>
                </div>

                {viewingItem.comments && viewingItem.comments.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {viewingItem.comments.map((cm) => (
                      <div
                        key={cm.id}
                        className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800 text-[11px]">{cm.authorName}</span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              {cm.authorRole}
                            </span>
                            {cm.department && (
                              <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-medium">
                                {cm.department}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {cm.rating && (
                              <div className="flex items-center text-amber-500">
                                {Array.from({ length: cm.rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                                ))}
                              </div>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">{cm.date}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-700 leading-relaxed">{cm.text}</p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                          <span className="text-blue-600 font-semibold">
                            {cm.commentType === 'operational_note'
                              ? '📌 نکته تجربی کاربری'
                              : cm.commentType === 'usability'
                              ? '⚡ سهولت کاربری و بالینی'
                              : cm.commentType === 'shift_handover'
                              ? '🔄 تحویل شیفت'
                              : '💬 نظر عمومی'}
                          </span>
                          <span className="text-[9px] text-emerald-600 font-medium">ثبت‌شده در شناسنامه تجهیز</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-[11px]">
                    هنوز نظری درباره این تجهیز ثبت نشده است. می‌توانید با کلیک روی «ثبت نظر درباره تجهیز» بازخورد کاربری خود را اضافه کنید.
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {canAccessCalibration ? (
                <button
                  onClick={() => {
                    const target = viewingItem;
                    setViewingItem(null);
                    if (target) onNavigateToCalibration?.(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-white" />
                  <span>کالیبراسیون و ایمنی این تجهیز</span>
                </button>
              ) : (
                <div className="text-[10px] text-slate-400 font-medium">
                  شناسنامه تجهیز • دسترسی مشاهده موجودی
                </div>
              )}
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT EQUIPMENT COMMENT (ثبت نظر درباره تجهیز) */}
      {showAddCommentModal && viewingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 dir-rtl text-right animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#2b64f6] flex items-center justify-center">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">ثبت نظر درباره تجهیز</h3>
                  <p className="text-[11px] text-slate-500">{viewingItem.faName} ({viewingItem.code})</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCommentModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Note Distinction Notice */}
            <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200/80 text-[11px] text-sky-900 space-y-1">
              <span className="font-bold block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2b64f6]" />
                تفکیک بازخورد از گزارش خرابی:
              </span>
              <p className="text-sky-800/90 leading-relaxed text-[11px]">
                ثبت نظر در این بخش صرفاً جهت اشتراک تجربیات کاربری، سهولت استفاده و نکات تحویل شیفت است و به منزله توقف کاربری یا اعلام خرابی دستگاه نمی‌باشد.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCommentText.trim()) return;

                const newComment: EquipmentComment = {
                  id: `cm-${Date.now()}`,
                  authorName: currentUser?.name || 'اپراتور',
                  authorRole: currentUser?.roleFa || 'اپراتور',
                  department: currentUser?.department || viewingItem.department,
                  date: '۱۴۰۵/۰۵/۲۰',
                  commentType: newCommentType,
                  rating: newCommentRating,
                  text: newCommentText.trim(),
                };

                const updatedItem: EquipmentItem = {
                  ...viewingItem,
                  comments: [newComment, ...(viewingItem.comments || [])],
                };

                onUpdateEquipment(updatedItem);
                setViewingItem(updatedItem);
                setShowAddCommentModal(false);
                setCommentToastMsg('نظر شما با موفقیت در سوابق این تجهیز ثبت گردید.');
                setTimeout(() => setCommentToastMsg(null), 4000);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  دسته‌بندی و نوع نظر:
                </label>
                <select
                  value={newCommentType}
                  onChange={(e) => setNewCommentType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-[#2b64f6]"
                >
                  <option value="operational_note">📌 نکته تجربی کاربری و عملکردی</option>
                  <option value="usability">⚡ سهولت کاربری، کیفیت و عملکرد بالینی</option>
                  <option value="shift_handover">🔄 یادداشت تحویل شیفت و ملزومات همراه</option>
                  <option value="general">💬 نظر عمومی و پیشنهاد بهبود</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  امتیاز رضایت و کارایی:
                </label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewCommentRating(star)}
                      className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newCommentRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-[11px] font-bold text-slate-600 mr-2">
                    ({newCommentRating} از ۵ ستاره)
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  متن نظر و تجربیات کاربری شما: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="تجربه کار با دستگاه، وضعیت عملکردی در شیفت، سهولت تنظیمات و..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-[#2b64f6]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCommentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-5 py-2 rounded-xl bg-[#2b64f6] hover:bg-blue-700 disabled:bg-slate-300 text-white font-extrabold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ثبت و ذخیره نظر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Toast Notification */}
      {commentToastMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-in fade-in border border-emerald-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{commentToastMsg}</span>
          <button
            onClick={() => setCommentToastMsg(null)}
            className="p-1 hover:bg-emerald-800 rounded-lg mr-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: ASSET HANDOVER & TRANSFER PROTOCOL (صورت‌جلسه جابجایی اموال)    */}
      {/* ========================================================================= */}
      {showAssetTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden dir-rtl text-right animate-in fade-in flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/90 to-indigo-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2b64f6] text-white flex items-center justify-center font-bold shadow-xs">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">
                      صورت‌جلسه تحویل و تحول اموال و تجهیزات بیمارستان
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold">
                      TR-1403-882
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    فرم رسمی جابجایی فیزیکی، تغییر امین اموال و ثبت در کاردکس مرکزی
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssetTransferModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              {/* Target Equipment Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block font-black text-slate-800 text-xs">
                  انتخاب تجهیز موضوع انتقال:
                </label>
                <select
                  value={transferEquipmentId}
                  onChange={(e) => setTransferEquipmentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-[#2b64f6]"
                >
                  {equipmentList
                    .filter((e) => !e.isDraft)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.faName} ({item.brand} {item.model}) — کد اموال: {item.code} — محل فعلی: {item.department} ({item.location})
                      </option>
                    ))}
                </select>
              </div>

              {/* Origin & Destination Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-amber-900 font-black">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    <span>مبدا (بخش تحویل‌دهنده):</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">بخش فرستنده:</span>
                    <span className="font-bold text-slate-800">بخش مراقبت‌های ویژه (ICU)</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نام مسئول / تحویل‌دهنده:
                    </label>
                    <input
                      type="text"
                      value={transferSenderName}
                      onChange={(e) => setTransferSenderName(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-amber-200 text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-blue-900 font-black">
                    <Building2 className="w-4 h-4 text-[#2b64f6]" />
                    <span>مقصد (بخش تحویل‌گیرنده):</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      دپارتمان مقصد:
                    </label>
                    <select
                      value={transferTargetDept}
                      onChange={(e) => setTransferTargetDept(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-blue-200 text-slate-800 text-xs font-bold"
                    >
                      <option value="اتاق عمل و جراحی">اتاق عمل و جراحی</option>
                      <option value="بخش مراقبت‌های ویژه (ICU)">بخش مراقبت‌های ویژه (ICU)</option>
                      <option value="بخش بستری داخلی">بخش بستری داخلی</option>
                      <option value="اورژانس">اورژانس</option>
                      <option value="تصویربرداری و رادیولوژی">تصویربرداری و رادیولوژی</option>
                      <option value="آزمایشگاه مرکزی">آزمایشگاه مرکزی</option>
                      <option value="انبار مرکزی تجهیزات">انبار مرکزی تجهیزات</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      محل استقرار دقیق جدید:
                    </label>
                    <input
                      type="text"
                      value={transferTargetLocation}
                      onChange={(e) => setTransferTargetLocation(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-blue-200 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نام تحویل‌گیرنده:
                    </label>
                    <input
                      type="text"
                      value={transferReceiverName}
                      onChange={(e) => setTransferReceiverName(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-blue-200 text-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Handover Reason */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  علت و مجوز انتقال اموال:
                </label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#2b64f6]"
                />
              </div>

              {/* Physical Condition Checklist */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 block text-xs">
                  چک‌لیست سلامت فیزیکی و ضمائم در زمان تحویل:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transferChecklist.powerCable}
                      onChange={(e) =>
                        setTransferChecklist({ ...transferChecklist, powerCable: e.target.checked })
                      }
                      className="rounded text-[#2b64f6]"
                    />
                    <span>کابل برق و آداپتور اصلی سالم است</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transferChecklist.accessories}
                      onChange={(e) =>
                        setTransferChecklist({ ...transferChecklist, accessories: e.target.checked })
                      }
                      className="rounded text-[#2b64f6]"
                    />
                    <span>پروب‌ها و کابل‌های جانبی تحویل شد</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transferChecklist.physicalIntegrity}
                      onChange={(e) =>
                        setTransferChecklist({ ...transferChecklist, physicalIntegrity: e.target.checked })
                      }
                      className="rounded text-[#2b64f6]"
                    />
                    <span>بدنه و نمایشگر بدون شکستگی و سالم است</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transferChecklist.calibrationLabel}
                      onChange={(e) =>
                        setTransferChecklist({ ...transferChecklist, calibrationLabel: e.target.checked })
                      }
                      className="rounded text-[#2b64f6]"
                    />
                    <span>پلاک اموال و برچسب کالیبراسیون معتبر است</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setShowAssetTransferModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                انصراف
              </button>

              <button
                onClick={handleConfirmAssetTransfer}
                className="px-5 py-2.5 rounded-xl bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileSignature className="w-4 h-4" />
                <span>تایید و امضای الکترونیک صورت‌جلسه انتقال</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: QUICK RESTOCK & GOODS RECEIPT (ثبت رسید ورود و شارژ موجودی)   */}
      {/* ========================================================================= */}
      {showQuickRestockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden dir-rtl text-right animate-in fade-in flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50/90 to-yellow-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    ثبت رسید ورود کالا و شارژ موجودی انبار مرکزی
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    افزایش موجودی اقلام مصرفی یا ورود تجهیزات جدید به کاردکس انبار
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickRestockModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  انتخاب قلم کالا: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={restockItemId}
                  onChange={(e) => setRestockItemId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-amber-600"
                >
                  {equipmentList
                    .filter((e) => e.itemKind === 'consumable' || e.status === 'low_stock' || e.status === 'in_stock')
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.faName} ({item.brand} {item.model}) — موجودی فعلی: {item.quantity} {item.unit} ({item.status === 'low_stock' ? 'کسری موجودی' : 'موجود'})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    تعداد وارده جدید: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-black text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    شماره فاکتور / رسید ورود:
                  </label>
                  <input
                    type="text"
                    value={restockInvoiceNo}
                    onChange={(e) => setRestockInvoiceNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    شماره بچ / Batch No:
                  </label>
                  <input
                    type="text"
                    value={restockBatchNo}
                    onChange={(e) => setRestockBatchNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    تأمین‌کننده:
                  </label>
                  <input
                    type="text"
                    value={restockSupplier}
                    onChange={(e) => setRestockSupplier(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setShowQuickRestockModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                انصراف
              </button>

              <button
                onClick={handleConfirmQuickRestock}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>ثبت رسید ورود و شارژ کاردکس انبار</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MODAL: DEDICATED DRAFT COMPLETION & ASSET TAGGING (تکمیل پیش‌نویس)   */}
      {/* ========================================================================= */}
      {showDraftCompletionModal && editingDraftItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden dir-rtl text-right animate-in fade-in flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/90 via-sky-50 to-indigo-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2b64f6] text-white flex items-center justify-center font-bold shadow-xs">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      تکمیل شناسنامه و صدور پلاک اموال پیش‌نویس
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold">
                      {editingDraftItem.code || 'EQ-DRAFT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    منبع ثبت: {editingDraftItem.creator || 'پردازش هوشمند اسناد'} | تاریخ ورود: {editingDraftItem.createdAt || 'اخیر'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDraftCompletionModal(false);
                  setEditingDraftItem(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-xs">
              {/* Context Summary & Deficiency Notice Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>اطلاعات استخراج‌شده از سند ورود اولیه (پیش‌نویس کاردکس)</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-lg">
                    نیازمند تکمیل و پلاک‌کوبی
                  </span>
                </div>
                <div className="text-[11px] text-amber-950 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 border-t border-amber-200/60">
                  <div><span className="text-amber-700">نام کالا:</span> <strong>{draftFaName || 'دستگاه جدید'}</strong></div>
                  <div><span className="text-amber-700">برند/مدل:</span> <strong>{draftBrand || '-'} {draftModel || ''}</strong></div>
                  <div><span className="text-amber-700">دسته‌بندی:</span> <strong>{draftCategory}</strong></div>
                  <div><span className="text-amber-700">تعداد:</span> <strong>{draftQuantity} {draftUnit}</strong></div>
                </div>

                {editingDraftItem.missingFields && editingDraftItem.missingFields.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-rose-700">فیلدهای ناقص:</span>
                    {editingDraftItem.missingFields.map((field, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white text-rose-600 border border-rose-200 text-[10px] font-bold">
                        ⚠️ فقدان {field}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 1: Base Identification */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-blue-600" />
                  <span>۱. اطلاعات هویتی و دسته‌بندی کالا</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نام فارسی کالا / تجهیز: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={draftFaName}
                      onChange={(e) => setDraftFaName(e.target.value)}
                      placeholder="مثلاً: دستگاه مانیتورینگ علائم حیاتی"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold focus:border-[#2b64f6] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نام انگلیسی / کاتالوگ:
                    </label>
                    <input
                      type="text"
                      value={draftEnName}
                      onChange={(e) => setDraftEnName(e.target.value)}
                      placeholder="e.g. Portable Vital Signs Monitor"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:border-[#2b64f6] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      برند سازنده: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={draftBrand}
                      onChange={(e) => setDraftBrand(e.target.value)}
                      placeholder="مثلاً: Mindray"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:border-[#2b64f6] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      مدل دستگاه: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={draftModel}
                      onChange={(e) => setDraftModel(e.target.value)}
                      placeholder="مثلاً: uMEC 10"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:border-[#2b64f6] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      دسته‌بندی تجهیز:
                    </label>
                    <input
                      type="text"
                      value={draftCategory}
                      onChange={(e) => setDraftCategory(e.target.value)}
                      placeholder="مثلاً: مانیتورینگ و ثبت"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:border-[#2b64f6] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Mandatory Asset Plate & Tagging Fields */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>۲. تخصیص کد دائم اموال، شماره سریال و استقرار فیزیکی (پلاک‌کوبی)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    فیلدهای الزامی صدور پلاک
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        کد دائم اموال / شماره پلاک: <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const randomNum = Math.floor(1000 + Math.random() * 9000);
                          setDraftCode(`EQ-1403-${randomNum}`);
                        }}
                        className="text-[10px] text-[#2b64f6] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>تولید خودکار کد بعدی ⚡</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={draftCode}
                      onChange={(e) => setDraftCode(e.target.value)}
                      placeholder="EQ-1403-1045"
                      className="w-full p-2.5 rounded-xl bg-white border border-blue-300 text-blue-950 font-mono font-black text-sm focus:border-blue-500 focus:outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      شماره سریال کارخانه (Serial No): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={draftSerialNumber}
                      onChange={(e) => setDraftSerialNumber(e.target.value)}
                      placeholder="مثلاً: SN-MND-984210"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono font-bold focus:border-[#2b64f6] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      دپارتمان / بخش تحویل‌گیرنده: <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={draftDepartment}
                      onChange={(e) => setDraftDepartment(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold focus:border-[#2b64f6] focus:outline-none"
                    >
                      <option value="بخش مراقبت‌های ویژه (ICU)">بخش مراقبت‌های ویژه (ICU)</option>
                      <option value="بخش مراقبت‌های قلبی (CCU)">بخش مراقبت‌های قلبی (CCU)</option>
                      <option value="اتاق عمل و جراحی">اتاق عمل و جراحی</option>
                      <option value="اورژانس و فوریت‌ها">اورژانس و فوریت‌ها</option>
                      <option value="بخش بستری داخلی و جراحی">بخش بستری داخلی و جراحی</option>
                      <option value="تصویربرداری و رادیولوژی">تصویربرداری و رادیولوژی</option>
                      <option value="آزمایشگاه و پاتولوژی">آزمایشگاه و پاتولوژی</option>
                      <option value="انبار مرکزی تجهیزات">انبار مرکزی تجهیزات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      محل استقرار دقیق فیزیکی: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={draftLocation}
                      onChange={(e) => setDraftLocation(e.target.value)}
                      placeholder="مثلاً: تخت شماره ۴ یا اتاق عمل ۳ قفسه کالیبراسیون"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold focus:border-[#2b64f6] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    امین اموال / مسئول تحویل‌گیرنده:
                  </label>
                  <input
                    type="text"
                    value={draftOwner}
                    onChange={(e) => setDraftOwner(e.target.value)}
                    placeholder="مثلاً: مهندس سارا امیری (بیومدیکال) یا سرپرستار بخش"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:border-[#2b64f6] focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Metal Asset Tag Mockup Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 border border-slate-300 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-300 flex items-center justify-center p-1.5 shadow-xs shrink-0">
                    <QrCode className="w-11 h-11 text-slate-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 tracking-tight">
                        بیمارستان تخصصی و فوق‌تخصصی آوید
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold">
                        پلاک فلزی اموال
                      </span>
                    </div>
                    <div className="text-sm font-mono font-black text-blue-900 mt-1 flex items-center gap-2">
                      <span>کد اموال: {draftCode || 'EQ-1403-XXXX'}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 truncate max-w-sm mt-0.5 font-medium">
                      {draftFaName || 'دستگاه'} | سریال: {draftSerialNumber || 'SN-XXXX'} | استقرار: {draftDepartment} ({draftLocation || 'تعیین‌نشده'})
                    </p>
                  </div>
                </div>
                <div className="text-right sm:text-left shrink-0">
                  <span className="text-[10px] text-slate-600 font-bold block">
                    پیش‌نمایش زنده پلاک QR فلزی
                  </span>
                  <span className="text-[9px] text-emerald-700 font-extrabold flex items-center gap-1 justify-end sm:justify-start mt-0.5">
                    <Check className="w-3 h-3" />
                    آماده صدور و چاپ لیبل
                  </span>
                </div>
              </div>

              {/* SECTION 3: Inventory Kind, Pricing & Batch */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  <span>۳. نوع موجودی، ارزش دفتری و اطلاعات تأمین</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نوع قلم:
                    </label>
                    <select
                      value={draftItemKind}
                      onChange={(e) => {
                        const k = e.target.value as ItemKind;
                        setDraftItemKind(k);
                        setDraftStatus(k === 'device' ? 'active' : 'in_stock');
                      }}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold focus:border-[#2b64f6] focus:outline-none"
                    >
                      <option value="device">دستگاه و تجهیزات</option>
                      <option value="consumable">قلم و کالای مصرفی انبار</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      تعداد و واحد:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        value={draftQuantity}
                        onChange={(e) => setDraftQuantity(Number(e.target.value))}
                        className="w-20 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold"
                      />
                      <input
                        type="text"
                        value={draftUnit}
                        onChange={(e) => setDraftUnit(e.target.value)}
                        placeholder="عدد / دستگاه / بسته"
                        className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ارزش دفتری / قیمت خرید (ریال):
                    </label>
                    <input
                      type="number"
                      value={draftPrice}
                      onChange={(e) => setDraftPrice(Number(e.target.value))}
                      placeholder="ریال"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      شرکت تأمین‌کننده:
                    </label>
                    <input
                      type="text"
                      value={draftSupplier}
                      onChange={(e) => setDraftSupplier(e.target.value)}
                      placeholder="شرکت توزیع‌کننده یا بازرگانی"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      شماره فاکتور / Batch No:
                    </label>
                    <input
                      type="text"
                      value={draftBatchNo}
                      onChange={(e) => setDraftBatchNo(e.target.value)}
                      placeholder="BATCH-XXXX یا INV-XXXX"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      تاریخ انقضا (در صورت کالای مصرفی):
                    </label>
                    <input
                      type="text"
                      value={draftExpiryDate}
                      onChange={(e) => setDraftExpiryDate(e.target.value)}
                      placeholder="۱۴۰۶/۰۵/۲۲"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowDraftCompletionModal(false);
                    setEditingDraftItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  انصراف
                </button>

                <button
                  onClick={handleSaveDraftAsDraft}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  ذخیره موقت پیش‌نویس
                </button>
              </div>

              <button
                onClick={handleFinalizeDraft}
                className="px-6 py-2.5 rounded-2xl bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>تکمیل شناسنامه و صدور پلاک قطعی اموال ❮</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Registration Modal */}
    </div>
  );
};
