import { EquipmentItem, AssetClassification, PurchaseRequest, CalibrationRecord, FailureReport, TaskEvent, AppUser, Vendor } from '../types';

export type MainCategoryKey = 'medical' | 'laboratory' | 'hospital';

export interface MainCategoryInfo {
  key: MainCategoryKey;
  label: string;
  enLabel: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  accentColor: string;
}

export const MAIN_CATEGORIES: Record<MainCategoryKey, MainCategoryInfo> = {
  medical: {
    key: 'medical',
    label: 'تجهیزات پزشکی',
    enLabel: 'Medical Equipment',
    iconName: 'Stethoscope',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    borderColor: 'border-sky-200',
    accentColor: '#0284c7',
  },
  laboratory: {
    key: 'laboratory',
    label: 'تجهیزات آزمایشگاهی',
    enLabel: 'Laboratory Equipment',
    iconName: 'FlaskConical',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    borderColor: 'border-teal-200',
    accentColor: '#0d9488',
  },
  hospital: {
    key: 'hospital',
    label: 'تجهیزات بیمارستانی',
    enLabel: 'Hospital Equipment',
    iconName: 'Building2',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-200',
    accentColor: '#d97706',
  },
};

export const MAIN_CATEGORIES_LIST = Object.values(MAIN_CATEGORIES);

/**
 * Maps any equipment item or classification into the 3 canonical categories
 */
export function resolveItemCategory(item: EquipmentItem): MainCategoryKey {
  const text = `${item.category || ''} ${item.faName || ''} ${item.enName || ''} ${item.department || ''}`.toLowerCase();

  // Laboratory
  if (
    text.includes('آزمایشگاه') ||
    text.includes('lab') ||
    text.includes('سانتریفیوژ') ||
    text.includes('آنالایزر') ||
    text.includes('میکروسکوپ') ||
    text.includes('پاتولوژی') ||
    text.includes('بیوشیمی') ||
    text.includes('کیت') ||
    text.includes('معرف') ||
    text.includes('الایزا') ||
    text.includes('سل کانتر')
  ) {
    return 'laboratory';
  }

  // Hospital / General
  if (
    text.includes('هتلینگ') ||
    text.includes('بیمارستانی') ||
    text.includes('تخت') ||
    text.includes('برانکارد') ||
    text.includes('استریلیزاسیون') ||
    text.includes('اتوکلاو') ||
    text.includes('cssd') ||
    text.includes('تاسیسات') ||
    text.includes('پسماند') ||
    text.includes('گازهای طبی') ||
    text.includes('لانژری') ||
    text.includes('ژنراتور') ||
    text.includes('یو پی اس') ||
    text.includes('پشتیبانی') ||
    text.includes('نگاتوسکوپ') ||
    text.includes('چراغ معاینه') ||
    text.includes('ویلچر')
  ) {
    return 'hospital';
  }

  // Default to Medical
  return 'medical';
}

/**
 * Resolves or extracts Subcategory for an equipment item
 */
export function resolveItemSubcategory(item: EquipmentItem): string {
  if (item.category && !['تجهیزات پزشکی', 'تجهیزات آزمایشگاهی', 'تجهیزات بیمارستانی'].includes(item.category)) {
    return item.category;
  }
  const main = resolveItemCategory(item);
  switch (main) {
    case 'medical':
      if (item.faName.includes('ونتیلاتور') || item.faName.includes('بیهوشی')) return 'بیهوشی و تنفسی';
      if (item.faName.includes('مانیتور') || item.faName.includes('نوار قلب')) return 'مانیتورینگ و علائم حیاتی';
      if (item.faName.includes('سی‌تی') || item.faName.includes('ام‌آر‌آی') || item.faName.includes('سونوگرافی') || item.faName.includes('رادیولوژی')) return 'تصویربرداری و رادیولوژی';
      if (item.faName.includes('کوتر') || item.faName.includes('جراحی') || item.faName.includes('لاپاراسکوپ')) return 'جراحی و اتاق عمل';
      if (item.faName.includes('دیالیز')) return 'دیالیز و کلیه';
      if (item.faName.includes('شوک') || item.faName.includes('احیا')) return 'اورژانس و احیا';
      return 'تجهیزات مراقبت بالینی';
    case 'laboratory':
      if (item.faName.includes('آنالایزر') || item.faName.includes('سل کانتر')) return 'آنالایزرها و شمارنده‌ها';
      if (item.faName.includes('سانتریفیوژ')) return 'جداسازی و سانتریفیوژ';
      if (item.faName.includes('میکروسکوپ')) return 'میکروسکوپی و پاتولوژی';
      return 'کیت‌ها و معرف‌های آزمایشگاهی';
    case 'hospital':
      if (item.faName.includes('تخت') || item.faName.includes('صندلی')) return 'هتلینگ و بستری';
      if (item.faName.includes('اتوکلاو') || item.faName.includes('استریل')) return 'استریلیزاسیون و CSSD';
      if (item.faName.includes('اکسیژن') || item.faName.includes('ساکشن سنترال')) return 'گازهای طبی و تاسیسات';
      return 'تجهیزات عمومی بیمارستانی';
  }
}

/**
 * Resolves the Type (Level 3) for an item
 */
export function resolveItemType(item: EquipmentItem): string {
  if (item.model && item.model !== '-') {
    return `${item.brand || ''} ${item.model}`.trim();
  }
  return item.faName.split('—')[0].trim();
}

/**
 * Calculates item information completion percentage (0 - 100)
 */
export function calculateItemCompleteness(item: EquipmentItem): number {
  let score = 0;
  const maxScore = 10;

  if (item.code && !item.code.includes('DRAFT')) score += 1;
  if (item.faName && item.faName.length > 3) score += 1;
  if (item.enName && item.enName.length > 2) score += 0.5;
  if (item.brand && item.brand !== '-' && item.brand !== 'نامشخص') score += 1;
  if (item.model && item.model !== '-' && item.model !== 'نامشخص') score += 1;
  if (item.serialNumber && !item.serialNumber.includes('نامشخص') && !item.serialNumber.includes('DRAFT')) score += 1;
  if (item.department && item.department !== 'نامشخص') score += 1;
  if (item.location && item.location !== 'نامشخص' && item.location.trim().length > 0) score += 1;
  if (item.owner && item.owner !== 'تعیین‌نشده' && item.owner !== 'نامشخص') score += 1;
  if (item.purchaseDate && item.purchaseDate !== '-') score += 0.5;
  if (item.price && item.price > 0) score += 1;
  if (!item.isDraft && item.status !== 'draft') score += 1;

  const pct = Math.min(100, Math.round((score / maxScore) * 100));
  return pct;
}

/**
 * Checks if a draft has exceeded completion deadline (delayed / دارای تأخیر)
 */
export function isDraftDelayed(item: EquipmentItem): boolean {
  if (!item.isDraft && item.status !== 'draft') return false;
  if (item.createdAt && (item.createdAt.includes('۱۴۰۴') || item.createdAt.includes('۱۴۰۳'))) {
    return true;
  }
  // If draft has missing fields count >= 3
  if (item.missingFields && item.missingFields.length >= 3) return true;
  return false;
}

/**
 * Categorized summary metrics for the 4 primary categories
 */
export interface CategorySummaryMetric {
  key: MainCategoryKey;
  label: string;
  totalCount: number;
  activeCount: number;
  draftCount: number;
  completionRate: number;
  totalValue: number;
  maintenanceCount: number;
  overdueDraftsCount: number;
}

export function getCategoriesSummaryMetrics(equipmentList: EquipmentItem[]): Record<MainCategoryKey, CategorySummaryMetric> {
  const result: Record<MainCategoryKey, CategorySummaryMetric> = {
    medical: {
      key: 'medical',
      label: 'تجهیزات پزشکی',
      totalCount: 0,
      activeCount: 0,
      draftCount: 0,
      completionRate: 0,
      totalValue: 0,
      maintenanceCount: 0,
      overdueDraftsCount: 0,
    },
    laboratory: {
      key: 'laboratory',
      label: 'تجهیزات آزمایشگاهی',
      totalCount: 0,
      activeCount: 0,
      draftCount: 0,
      completionRate: 0,
      totalValue: 0,
      maintenanceCount: 0,
      overdueDraftsCount: 0,
    },
    hospital: {
      key: 'hospital',
      label: 'تجهیزات بیمارستانی',
      totalCount: 0,
      activeCount: 0,
      draftCount: 0,
      completionRate: 0,
      totalValue: 0,
      maintenanceCount: 0,
      overdueDraftsCount: 0,
    },
  };

  const completenessSum: Record<MainCategoryKey, number> = {
    medical: 0,
    laboratory: 0,
    hospital: 0,
  };

  equipmentList.forEach((item) => {
    const cat = resolveItemCategory(item);
    const metric = result[cat];
    metric.totalCount += 1;
    metric.totalValue += item.price || 0;

    if (item.isDraft || item.status === 'draft') {
      metric.draftCount += 1;
      if (isDraftDelayed(item)) {
        metric.overdueDraftsCount += 1;
      }
    } else if (item.status === 'active' || item.status === 'in_use' || item.status === 'in_stock') {
      metric.activeCount += 1;
    } else if (item.status === 'under_maintenance' || item.status === 'calibrating') {
      metric.maintenanceCount += 1;
    }

    const cRate = calculateItemCompleteness(item);
    completenessSum[cat] += cRate;
  });

  Object.keys(result).forEach((key) => {
    const k = key as MainCategoryKey;
    const total = result[k].totalCount;
    result[k].completionRate = total > 0 ? Math.round(completenessSum[k] / total) : 0;
  });

  return result;
}

/**
 * Format currency to Persian Toman string
 */
export function formatToman(value: number): string {
  if (value >= 1_000_000_000) {
    const billions = (value / 1_000_000_000).toFixed(1);
    return `${billions} میلیارد تومان`;
  }
  if (value >= 1_000_000) {
    const millions = Math.round(value / 1_000_000);
    return `${millions.toLocaleString('fa-IR')} میلیون تومان`;
  }
  return `${value.toLocaleString('fa-IR')} تومان`;
}

/**
 * Format raw number to Persian digits
 */
export function toPersianNumber(val: number | string): string {
  return String(val).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}
