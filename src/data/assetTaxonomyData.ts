import { AssetClassification, AssetRequirementField } from '../types';

export interface TaxonomyDomainOption {
  id: 'all' | 'medical' | 'laboratory' | 'hospital' | 'general_hospital' | 'custom';
  label: string;
  shortLabel: string;
  iconName: string;
  description: string;
  badgeColor: string;
}

export const TAXONOMY_DOMAINS: TaxonomyDomainOption[] = [
  {
    id: 'all',
    label: 'همه ساختارها و دسته‌ها',
    shortLabel: 'همه',
    iconName: 'FolderTree',
    description: 'نمایش کامل ساختار اموال (Category، Subcategory، Type) بر اساس ساختار مرجع',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    id: 'medical',
    label: 'تجهیزات پزشکی',
    shortLabel: 'تجهیزات پزشکی',
    iconName: 'Stethoscope',
    description: 'Category ۱: تجهیزات پزشکی و شاخه‌های درمانی، جراحی و مواد اولیه',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  {
    id: 'laboratory',
    label: 'تجهیزات آزمایشگاهی',
    shortLabel: 'تجهیزات آزمایشگاهی',
    iconName: 'Package',
    description: 'Category ۲: سیستم‌ها، معرف‌ها، کیت‌ها و فرآورده‌های آزمایشگاهی',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  {
    id: 'hospital',
    label: 'تجهیزات بیمارستانی',
    shortLabel: 'تجهیزات بیمارستانی',
    iconName: 'Building',
    description: 'Category ۳: دستگاه‌های بیمارستانی، هتلینگ، گازهای طبی، پسماند و بسته‌بندی',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'general_hospital',
    label: 'اموال عمومی و پشتیبانی بیمارستان',
    shortLabel: 'اموال عمومی و پشتیبانی',
    iconName: 'Boxes',
    description: 'Category ۴: هتلینگ، اداری، IT، تأسیسات، ایمنی، آشپزخانه، انبار و خدمات عمومی',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    id: 'custom',
    label: 'ساختارهای سفارشی مرکز',
    shortLabel: 'سفارشی مرکز',
    iconName: 'Sparkles',
    description: 'ساختارهای ایجادشده و شخصی‌سازی‌شده توسط کاربران دارای دسترسی',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
];

export interface RoleOption {
  roleCode: string;
  titleFa: string;
  badgeClass: string;
}

export const STANDARD_ROLE_OPTIONS: RoleOption[] = [
  { roleCode: 'warehouse_keeper', titleFa: 'انباردار', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  { roleCode: 'procurement_officer', titleFa: 'مسئول خرید', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { roleCode: 'biomedical_engineer', titleFa: 'مهندس پزشکی', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  { roleCode: 'finance_manager', titleFa: 'مدیر مالی', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200' },
  { roleCode: 'dept_head', titleFa: 'سرپرست بخش / کارشناس فنی', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { roleCode: 'nurse_operator', titleFa: 'اپراتور / پرستار', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' },
  { roleCode: 'hospital_admin', titleFa: 'مدیر سامانه', badgeClass: 'bg-slate-50 text-slate-800 border-slate-200' },
];

// Helper to generate standard requirement fields for Type level with domain-specific fields and responsible roles
const makeStandardFields = (
  typeName: string,
  subcatName: string = '',
  catName: string = ''
): AssetRequirementField[] => {
  // IT / فناوری اطلاعات و مخابرات
  if (
    subcatName.includes('فناوری اطلاعات') ||
    subcatName.includes('مخابرات') ||
    subcatName.includes('صوتی و تصویری') ||
    typeName.includes('رایانه') ||
    typeName.includes('پردازش') ||
    typeName.includes('شبکه') ||
    typeName.includes('چاپ') ||
    typeName.includes('ذخیرهسازی') ||
    typeName.includes('سرور') ||
    typeName.includes('لپتاپ') ||
    typeName.includes('لپ‌تاپ') ||
    typeName.includes('نمایشگر') ||
    typeName.includes('تلفن')
  ) {
    return [
      { id: 'f-qty', name: 'تعداد موجودی', type: 'number', required: true, helpText: 'تعداد فیزیکی اقلام', order: 1, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-brand', name: 'برند / شرکت سازنده', type: 'text', required: true, helpText: 'نام کمپانی سازنده (مانند Asus, HP, Dell, Cisco, Lenovo)', order: 2, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-model', name: 'مدل و پارت نامبر دقیق', type: 'text', required: true, helpText: 'مدل تجاری و پارت‌نامبر تجهیز', order: 3, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-serial', name: 'شماره سریال / Service Tag', type: 'text', required: true, helpText: 'شماره سریال کارخانه‌ای منحصر‌به‌فرد', order: 4, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-asset-code', name: 'پلاک / کد اموال بیمارستان', type: 'text', required: true, helpText: 'بارکد یا برچسب اموال الصاقی', order: 5, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-it-specs', name: 'مشخصات سخت‌افزاری (CPU / RAM / Storage)', type: 'text', required: true, helpText: 'ظرفیت رم، نوع پردازنده، حافظه SSD/HDD', order: 6, assignedRole: 'dept_head', assignedRoleTitleFa: 'کارشناس IT' },
      { id: 'f-ip-mac', name: 'آدرس فیزیکی MAC / IP اختصاصی', type: 'text', required: false, helpText: 'شناسه شبکه یا مک‌آدرس دستگاه', order: 7, assignedRole: 'dept_head', assignedRoleTitleFa: 'کارشناس IT' },
      { id: 'f-price', name: 'مبلغ خرید (تومان)', type: 'number', required: true, helpText: 'مبلغ رسمی فاکتور خرید', order: 8, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
      { id: 'f-invoice', name: 'شماره فاکتور و نام تأمین‌کننده', type: 'text', required: false, helpText: 'شماره فاکتور و نام شرکت فروشنده', order: 9, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
      { id: 'f-warranty', name: 'مدت گارانتی و پشتیبانی', type: 'select', required: true, options: ['یک‌ساله', 'دوساله', 'سه‌ساله', 'فاقد گارانتی'], helpText: 'مدت اعتبار ضمانت‌نامه شرکتی', order: 10, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
    ];
  }

  // Facilities / تأسیسات مکانیکی، الکتریکی، آسانسور و چیلر
  if (
    subcatName.includes('تأسیسات') ||
    typeName.includes('سرمایش') ||
    typeName.includes('گرمایش') ||
    typeName.includes('پمپاژ') ||
    typeName.includes('برق اضطراری') ||
    typeName.includes('آسانسور') ||
    typeName.includes('چیلر') ||
    typeName.includes('ژنراتور') ||
    typeName.includes('دیگ بخار')
  ) {
    return [
      { id: 'f-qty', name: 'تعداد دستگاه / پکیج', type: 'number', required: true, helpText: 'تعداد فیزیکی یونیت‌ها', order: 1, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-brand', name: 'سازنده / برند', type: 'text', required: true, helpText: 'کمپانی سازنده یا مجری سیستم تأسیساتی', order: 2, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-model', name: 'مدل و تیپ فنی', type: 'text', required: true, helpText: 'مدل و شماره پلاک فنی دستگاه', order: 3, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-serial', name: 'شماره سریال / شناسه پلاک', type: 'text', required: true, helpText: 'سریال کارخانه سازنده', order: 4, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-asset-code', name: 'پلاک اموال تأسیسات', type: 'text', required: true, helpText: 'کد الصاقی اموال واحد تاسیسات', order: 5, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-capacity', name: 'ظرفیت نامی / توان عملیاتی (KW/BTU/Ton)', type: 'text', required: true, helpText: 'ظرفیت برودتی، حرارتی، توان پمپاژ یا خروجی برق', order: 6, assignedRole: 'dept_head', assignedRoleTitleFa: 'مهندس تأسیسات' },
      { id: 'f-maint-period', name: 'دوره سرویس و نگهداری پیشگیرانه (PM)', type: 'select', required: true, options: ['ماهانه', 'سه‌ماهه', 'شش‌ماهه', 'سالانه'], helpText: 'بازه سررسید بازرسی دوره‌ای روغن‌کاری و فیلترها', order: 7, assignedRole: 'dept_head', assignedRoleTitleFa: 'مهندس تأسیسات' },
      { id: 'f-price', name: 'قیمت خرید و نصب (تومان)', type: 'number', required: true, helpText: 'مبلغ فاکتور رسمی خرید و راه‌اندازی', order: 8, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
      { id: 'f-contractor', name: 'شرکت پیمانکار / نصاب', type: 'text', required: false, helpText: 'نام شرکت مجری و گارانتی تأسیساتی', order: 9, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
      { id: 'f-safety-cert', name: 'تأییدیه تست و راه‌اندازی اولیه', type: 'boolean', required: true, helpText: 'تأیید کارکرد بدون عیب توسط واحد فنی و مهندسی', order: 10, assignedRole: 'dept_head', assignedRoleTitleFa: 'مهندس تأسیسات' },
    ];
  }

  // Kitchen & Nutrition / آشپزخانه و تغذیه (چای‌ساز، فر، سردخانه، ماشین ظرفشویی)
  if (
    subcatName.includes('آشپزخانه') ||
    subcatName.includes('تغذیه') ||
    subcatName.includes('لاندری') ||
    typeName.includes('پخت') ||
    typeName.includes('سردخانه') ||
    typeName.includes('چایساز') ||
    typeName.includes('چای‌ساز') ||
    typeName.includes('شستوشو') ||
    typeName.includes('سرو')
  ) {
    return [
      { id: 'f-qty', name: 'تعداد موجودی', type: 'number', required: true, helpText: 'تعداد فیزیکی کالا', order: 1, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-brand', name: 'برند / سازنده', type: 'text', required: true, helpText: 'نام تجاری کالا', order: 2, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-model', name: 'مدل دستگاه', type: 'text', required: true, helpText: 'مدل درج‌شده روی مشخصات کالا', order: 3, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-asset-code', name: 'پلاک / کد اموال', type: 'text', required: true, helpText: 'کد اموال الصاقی', order: 4, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-kitchen-spec', name: 'نوع تغذیه و گنجایش (لیتر / گاز / برق)', type: 'text', required: false, helpText: 'مشخصات مصرف انرژی و حجم کاری دستگاه', order: 5, assignedRole: 'dept_head', assignedRoleTitleFa: 'سرپرست خدمات / تغذیه' },
      { id: 'f-price', name: 'قیمت خرید (تومان)', type: 'number', required: true, helpText: 'مبلغ فاکتور رسمی', order: 6, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
      { id: 'f-supplier', name: 'تأمین‌کننده / فروشگاه', type: 'text', required: false, helpText: 'فروشنده طرف قرارداد', order: 7, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
    ];
  }

  // Hoteling, Administrative, Furniture, Public Space / هتلینگ، اداری و مبلمان
  if (
    subcatName.includes('هتلینگ') ||
    subcatName.includes('اداری') ||
    subcatName.includes('پذیرش') ||
    subcatName.includes('رفاهی') ||
    subcatName.includes('محوطه') ||
    subcatName.includes('آموزشی') ||
    typeName.includes('میز') ||
    typeName.includes('صندلی') ||
    typeName.includes('بایگانی') ||
    typeName.includes('اتاق بیمار') ||
    typeName.includes('لابی') ||
    typeName.includes('مبلمان')
  ) {
    return [
      { id: 'f-qty', name: 'تعداد', type: 'number', required: true, helpText: 'تعداد فیزیکی اقلام', order: 1, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-brand', name: 'برند / کارگاه سازنده', type: 'text', required: true, helpText: 'نام برند یا شرکت تولیدکننده', order: 2, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-model', name: 'مدل و جنس بدنه / روکش', type: 'text', required: true, helpText: 'مانند تمام MDF، فلزی، چرمی، پارچه‌ای، استیل ضدزنگ', order: 3, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-asset-code', name: 'پلاک / کد اموال', type: 'text', required: true, helpText: 'برچسب کد اموال بیمارستان', order: 4, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-location-room', name: 'بخش و اتاق استقرار', type: 'text', required: true, helpText: 'محل فیزیکی استقرار مبلمان یا تجهیز اقامتی', order: 5, assignedRole: 'dept_head', assignedRoleTitleFa: 'سرپرست بخش' },
      { id: 'f-price', name: 'قیمت خرید (تومان)', type: 'number', required: true, helpText: 'مبلغ فاکتور رسمی', order: 6, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
      { id: 'f-supplier', name: 'فروشنده / تأمین‌کننده', type: 'text', required: false, helpText: 'شرکت طرف قرارداد خرید', order: 7, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
    ];
  }

  // Safety, Fire, Security / ایمنی، آتش‌نشانی و حراست
  if (
    subcatName.includes('ایمنی') ||
    subcatName.includes('آتشنشانی') ||
    subcatName.includes('امنیتی') ||
    subcatName.includes('حفاظت') ||
    subcatName.includes('بحران') ||
    typeName.includes('اطفای حریق') ||
    typeName.includes('اعلام حریق') ||
    typeName.includes('نظارت تصویری') ||
    typeName.includes('کنترل تردد')
  ) {
    return [
      { id: 'f-qty', name: 'تعداد', type: 'number', required: true, helpText: 'تعداد فیزیکی کپسول یا تجهیزات', order: 1, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-brand', name: 'برند / سازنده', type: 'text', required: true, helpText: 'سازنده تجهیز', order: 2, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-asset-code', name: 'پلاک / کد شناسایی اموال', type: 'text', required: true, helpText: 'کد الصاقی واحد بهداشت حرفه‌ای، ایمنی یا حراست', order: 3, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-safety-type', name: 'مشخصه فنی / نوع ماده اطفایی یا رزولوشن', type: 'text', required: true, helpText: 'مانند کپسول CO2، پودر و گاز، دوربین مداربسته 4MP IP', order: 4, assignedRole: 'dept_head', assignedRoleTitleFa: 'کارشناس ایمنی HSE / حراست' },
      { id: 'f-charge-date', name: 'تاریخ شارژ / تست عملکرد', type: 'date', required: true, helpText: 'تاریخ بازرسی و شارژ مجدد یا آزمون', order: 5, assignedRole: 'dept_head', assignedRoleTitleFa: 'کارشناس ایمنی HSE' },
      { id: 'f-next-charge', name: 'تاریخ انقضای شارژ / بازرسی بعدی', type: 'date', required: true, helpText: 'سررسید شارژ دوره‌ای سالانه یا بازرسی', order: 6, assignedRole: 'dept_head', assignedRoleTitleFa: 'کارشناس ایمنی HSE' },
      { id: 'f-price', name: 'قیمت خرید (تومان)', type: 'number', required: true, helpText: 'مبلغ فاکتور رسمی', order: 7, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
    ];
  }

  // Vehicles & Logistics / حمل‌ونقل و انبار
  if (
    subcatName.includes('حملونقل') ||
    subcatName.includes('انبار') ||
    subcatName.includes('کارگاهی') ||
    subcatName.includes('ساختمانی') ||
    typeName.includes('خودرو') ||
    typeName.includes('حمل داخلی') ||
    typeName.includes('قفسه')
  ) {
    return [
      { id: 'f-qty', name: 'تعداد موجودی', type: 'number', required: true, helpText: 'تعداد فیزیکی قلم', order: 1, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-brand', name: 'سازنده / مدل تجاری', type: 'text', required: true, helpText: 'برند یا کارخانه سازنده', order: 2, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-serial', name: 'شماره پلاک / شماره شاسی یا سریال', type: 'text', required: true, helpText: 'شماره شناسایی خودرو یا ابزار', order: 3, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-asset-code', name: 'پلاک / کد اموال', type: 'text', required: true, helpText: 'کد الصاقی اموال مرکز', order: 4, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-capacity', name: 'ظرفیت باربری / مشخصه عملیاتی', type: 'text', required: false, helpText: 'تناژ حمل، ظرفیت قفسه یا مشخصات فنی', order: 5, assignedRole: 'dept_head', assignedRoleTitleFa: 'سرپرست ترابری / لجستیک' },
      { id: 'f-price', name: 'قیمت خرید (تومان)', type: 'number', required: true, helpText: 'مبلغ فاکتور رسمی خرید', order: 6, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
    ];
  }

  // Consumables & Raw Materials
  const isConsumableOrRaw =
    typeName.includes('مصرفی') ||
    typeName.includes('مواد اولیه') ||
    typeName.includes('معرف') ||
    typeName.includes('کیت') ||
    typeName.includes('نخ') ||
    typeName.includes('کاغذ') ||
    typeName.includes('پانسمان') ||
    typeName.includes('ایمپلنت') ||
    typeName.includes('پروتز') ||
    typeName.includes('Reagents');

  if (isConsumableOrRaw) {
    return [
      { id: 'f-qty', name: 'تعداد موجودی ورودی', type: 'number', required: true, helpText: 'تعداد فیزیکی قلم ورودی به انبار', order: 1, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-unit', name: 'واحد سنجش', type: 'select', required: true, options: ['بسته', 'جعبه', 'عدد', 'کارتن', 'رول', 'لیتر', 'ست'], helpText: 'واحد سنجش شمارش', order: 2, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-brand', name: 'برند / شرکت تولیدکننده', type: 'text', required: true, helpText: 'نام تجاری یا شرکت سازنده', order: 3, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-batch', name: 'شماره لات / Batch Number', type: 'text', required: true, helpText: 'شماره سری ساخت یا بچ کالا', order: 4, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-exp', name: 'تاریخ انقضای مصرف', type: 'date', required: true, helpText: 'سررسید انقضای مصرف', order: 5, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
      { id: 'f-price', name: 'قیمت واحد خرید (تومان)', type: 'number', required: true, helpText: 'مبلغ فاکتور رسمی خرید', order: 6, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
      { id: 'f-supplier', name: 'شرکت تأمین‌کننده / فروشنده', type: 'text', required: false, helpText: 'نام شرکت فروشنده طرف قرارداد', order: 7, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
    ];
  }

  // Standard Medical Equipment & Devices
  return [
    { id: 'f-qty', name: 'تعداد موجودی', type: 'number', required: true, helpText: 'تعداد فیزیکی دستگاه‌ها', order: 1, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
    { id: 'f-brand', name: 'برند و کمپانی سازنده', type: 'text', required: true, helpText: 'نام شرکت یا کمپانی سازنده دستگاه', order: 2, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
    { id: 'f-model', name: 'مدل فنی دستگاه', type: 'text', required: true, helpText: 'مدل دقیق درج‌شده روی پلاک مشخصات', order: 3, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
    { id: 'f-serial', name: 'شماره سریال کارخانه (Serial No)', type: 'text', required: true, helpText: 'شماره سریال منحصر‌به‌فرد دستگاه', order: 4, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
    { id: 'f-asset-code', name: 'پلاک / کد اموال', type: 'text', required: true, helpText: 'کد الصاقی اموال مرکز', order: 5, assignedRole: 'warehouse_keeper', assignedRoleTitleFa: 'انباردار' },
    { id: 'f-price', name: 'قیمت خرید (تومان)', type: 'number', required: true, helpText: 'مبلغ کل فاکتور خرید', order: 6, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
    { id: 'f-invoice-no', name: 'شماره فاکتور و تأمین‌کننده', type: 'text', required: false, helpText: 'شماره فاکتور و نام شرکت تأمین‌کننده', order: 7, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
    { id: 'f-purchase-date', name: 'تاریخ خرید', type: 'date', required: true, helpText: 'تاریخ ثبت فاکتور ورود', order: 8, assignedRole: 'procurement_officer', assignedRoleTitleFa: 'مسئول خرید' },
    { id: 'f-calib-period', name: 'دوره کالیبراسیون و بازرسی', type: 'select', required: true, options: ['شش‌ماهه', 'سالانه', 'دو سالانه', 'فاقد نیاز به کالیبراسیون'], helpText: 'بازه سررسید بازرسی دوره‌ای', order: 9, assignedRole: 'biomedical_engineer', assignedRoleTitleFa: 'مهندس پزشکی' },
    { id: 'f-tech-approval', name: 'تأییدیه کنترل کیفی و ایمنی اولیه', type: 'boolean', required: true, helpText: 'تأیید سلامت عملکردی توسط مهندسی پزشکی', order: 10, assignedRole: 'biomedical_engineer', assignedRoleTitleFa: 'مهندس پزشکی' },
  ];
};

// Raw Taxonomy Matrix defined strictly from the user's prompt
export interface RawCategoryDef {
  name: string;
  domain: 'medical' | 'laboratory' | 'hospital' | 'general_hospital' | 'custom';
  subcategories: {
    name: string;
    types: string[];
  }[];
}

export const RAW_TAXONOMY: RawCategoryDef[] = [
  // ==========================================================================
  // Category 1: تجهیزات پزشکی
  // ==========================================================================
  {
    name: 'تجهیزات پزشکی',
    domain: 'medical',
    subcategories: [
      {
        name: 'قلب و عروق',
        types: ['مصرفی های قلب و عروق', 'دستگاه های قلب و عروق'],
      },
      {
        name: 'مغز و اعصاب',
        types: ['مصرفی های مغز و اعصاب', 'ابزار مغز و اعصاب', 'دستگاه های مغز و اعصاب'],
      },
      {
        name: 'جراحی عمومی',
        types: ['مصرفیهای جراحی عمومی', 'دستگاههای جراحی عمومی'],
      },
      {
        name: 'ارتوپدی',
        types: [
          'ایمپلنت های استخوانی جذبی',
          'ایمپلنت استخوانی تروما',
          'فیکساتورهای خارجی استخوان',
          'ایمپلنت های استخوانی ستون فقرات',
          'ایمپلنت های استخوانی فک و صورت و جمجمه',
          'بیو مواد استخوانی',
          'پروتز',
          'ایمپلنت های طب ورزشی',
          'ایمپلنت های استخوانی پا (مچ، پاشنه و انگشتان)',
          'ایمپلنت های استخوانی دست و آرنج',
          'دستگاه های ارتوپدی',
          'ایمپلنت های استخوانی قفسه سینه',
          'ژل تزریقی',
        ],
      },
      {
        name: 'تصویربرداری',
        types: [
          'دستگاه های تصویربرداری',
          'مصرفی های تصویربرداری',
          'ابزار تصویربرداری',
          'نرم افزارهای تصویربرداری',
        ],
      },
      {
        name: 'چشم',
        types: ['مصرفیهای چشم', 'دستگاههای چشم'],
      },
      {
        name: 'داروخانه ای',
        types: ['دستگاههای داروخانهای و مراقبت خانگی', 'مصرفی داروخانه'],
      },
      {
        name: 'ابزارها',
        types: ['ابزار جراحی', 'ابزار معاینه'],
      },
      {
        name: 'دستگاه ها و لوازم عمومی پزشکی',
        types: ['مصرفی عمومی', 'دستگاه های عمومی'],
      },
      {
        name: 'تنفسی و بیهوشی',
        types: ['تنفسی', 'بیهوشی'],
      },
      {
        name: 'ارولوژی و نفرولوژی',
        types: ['مصرفی های ارولوژی و نفرولوژی', 'دستگاه های ارولوژی و نفرولوژی'],
      },
      {
        name: 'گوارش',
        types: ['عمومی گوارشی', 'دستگاه های گوارش'],
      },
      {
        name: 'فیزیوتراپی و توانبخشی',
        types: [
          'مصرفی فیزیوتراپی و توانبخشی',
          'ابزار فیزوتراپی و توانبخشی',
          'دستگاههای فیزیوتراپی و توانبخشی',
          'نرم افزار فیزیوتراپی و توانبخشی',
        ],
      },
      {
        name: 'زنان و زایمان، نازایی',
        types: ['مصرفیهای زنان و زایمان، نازایی', 'دستگاههای زنان و زایمان، نازایی'],
      },
      {
        name: 'رادیوتراپی و درمان سرطان',
        types: [
          'دستگاههای رادیوتراپی و درمان سرطان',
          'مصرفی رادیوتراپی و درمان سرطان',
          'لوازم جانبی دستگاه های رادیوتراپی و درمان سرطان',
        ],
      },
      {
        name: 'پزشکی هستهای',
        types: ['دستگاههای پزشکی هستهای', 'لوازم جانبی دستگاههای پزشکی هستهای'],
      },
      {
        name: 'ENT',
        types: ['دستگاههای ENT', 'مصرفیهای ENT'],
      },
      {
        name: 'پوست و مو، زیبایی، ترمیمی',
        types: [
          'دستگاههای پوست و مو، زیبایی، ترمیمی',
          'مصرفیهای پوست و مو، زیبایی، ترمیمی',
        ],
      },
      {
        name: 'اندوسکوپی و اندوسرجری',
        types: ['دستگاه های اندوسکوپی', 'مصرفی اندوسکوپی', 'ابزار اندوسکوپی'],
      },
      {
        name: 'اطفال و نوزادان',
        types: ['دستگاه های اطفال و نوزادان'],
      },
      {
        name: 'مواد اولیه خط تولید',
        types: [
          'پروفیل استیل 316LVM',
          'ورق استیل 316LVM',
          'میلگرد استیل 316LVM',
          'پروفیل تیتانیوم',
          'ورق تیتانیوم',
          'میلگرد تیتانیوم',
          'میلگرد PEEK',
          'میلگرد UHMWPE Crosslinked',
          'هالوفایبر پلی سولفان با سرعت جریان کم',
          'هالوفایبر پلی سولفان با سرعت جریان زیاد',
          'هالوفایبر پلی اترسولفان با سرعت جریان کم',
          'هالوفایبر پلی اترسولفان با سرعت جریان زیاد',
          'اورینگ',
          'چسب ایزوسیانات',
          'چسب پلی یول',
          'مواد اولیه فیلم بسته بندی',
          'پلی کربنات با گرید پزشکی',
          'پلی اوره تان با گرید پزشکی',
          'گرانول PVC با گرید پزشکی',
          'ورق نیتروسلولز',
          'مواد اولیه نخ بخیه پلی گلیکاپرون',
          'مواد اولیه نخ بخیه پلی دیاکسانون',
          'مواد اولیه نخ بخیه پلی گلایکولیک',
          'مواد اولیه نخ بخیه سیلک',
          'مواد اولیه نخ بخیه نایلون',
          'مواد اولیه نخ بخیه پلی اتیلن',
          'مواد اولیه نخ بخیه پلی پروپیلن',
          'مواد اولیه نخ بخیه پی وی دی اف',
          'مواد اولیه سوزن بخیه',
          'اجزا و قطعات کیسه خون',
          'اجزاء و قطعات سوزن فیستولا',
          'اجزاء و قطعات ست لوله های رابط دیالیز',
          'اجزاء و قطعات ست سرم',
          'اجزاء و قطعات ست خون',
          'اجزاء و قطعات سرنگ',
          'اجزاء و قطعات سرنگ انسولین',
          'اجزاء و قطعات میکروست',
          'اجزاء و قطعات سوزن های زیرجلدی',
          'اجزاء و قطعات کتتر (سوند) فولی',
          'لاتکس با گرید پزشکی',
          'مواد اولیه انواع چسب',
          'اجزاء و قطعات استنت حالب',
          'مواد اولیه کاندوم',
          'مواد اولیه الکترود یکبارمصرف الکتروکاردیوگرافی',
          'اجزاء و قطعات آنژیوکت',
          'مواد اولیه لنز داخل چشمی',
          'مواد اولیه پانسمان بانداژهای چسبنده',
          'اجزاء و قطعات گایدوایر',
          'اجزاء و قطعات اینجکتور کارتریج',
          'اجزاء و قطعات چاقوی چشمی',
          'مواد اولیه انواع سوزن',
          'اجزاء و قطعات سه راهی تزریق',
          'اجزاء و قطعات سوزن تزریق',
          'مواد اولیه کیت تشخیص سریع مورفین',
          'مواد اولیه کیت تشخیص سریع آمفتامین',
          'مواد اولیه کیت تشخیص سریع مت آمفتامین',
          'مواد اولیه کیت تشخیص سریع متادون',
          'مواد اولیه کیت تشخیص سریع حشیش',
          'مواد اولیه کیت تشخیص سریع ترامادول',
          'مواد اولیه کیت تشخیص سریع بوپرونرفین',
          'مواد اولیه کیت تشخیص سریع کوکایین',
          'مواد اولیه کیت تشخیص سریع باربیتورات',
          'مواد اولیه کیت تشخیص سریع اکستازی',
          'مواد اولیه دستکش معاینه وینیل غیر استریل',
          'گسکت',
          'منسوج نبافته لمینیت شده',
          'اتیلن وینیل استات',
          'مواد اولیه دستکش جراحی لاتکس',
          'مواد اولیه دستکش جراحی ضدحساسیت',
          'مواد اولیه دستکش معاینه لاتکس غیر استریل',
          'مواد اولیه اسپونژ چشمی پلی وینیل الکل',
          'بخش فمورال ریخته گری شده پروتز مفصل زانو',
          'بخش تیبیا ریخته گری شده پروتز مفصل زانو',
          'میلگرد کروم کبالت',
          'مواد اولیه فمورال کامپوننت پروتز لگن',
          'مواد اولیه فمورال کامپوننت پروتز زانو',
          'مواد اولیه تیبیا کامپوننت پروتز زانو',
          'مواد اولیه تولید باند فایبرگلاس',
          'مواد اولیه تولید باند گچی',
          'مواد اولیه تولید چسب برش جراحی',
          'مواد اولیه تولید ساکشن ایریگیشن',
          'مواد اولیه تولید کتتر ساکشن لوله تراشه',
          'منسوج نبافته',
          'مواد اولیه داروی ظهور و ثبوت',
          'مواد اولیه سوزن بیوپسی بن مارو( I / J )',
          'مواد اولیه دسته درن - ماندرن',
          'ابزار جراحی نیمه ساخته',
          'مواد اولیه اسکالپ وین',
          'مواد اولیه یورین بگ کیسه ادرار',
          'اجزاء و قطعات ست تزریق داروهای شیمی درمانی',
          'اجزاء و قطعات مدار بیهوشی',
          'اجزاء و قطعات مدار های بیهوشی تنفسی ونتیلاتور',
          'اجزاء و قطعات فیلتر تنفسی ضد باکتری ویروسی',
          'اجزاء و قطعات ماسک بیهوشی',
          'اجزاء و قطعات ماسک اکسیژن ساده',
          'مواد اولیه هموفیلتر بزرگسال جراحی قلب',
          'اجزاء و قطعات نازوگاستریک تیوب',
          'مواد اولیه پانسمان های ترمیم زخم',
          'اجزاء و قطعات ست نفروستمی',
          'اجزاء و قطعات چست تیوب',
          'اجزاء و قطعات رابط فشار قوی',
          'مواد اولیه تولید کیت آنژیوگرافی',
          'اجزا و قطعات محفظه های بی کربنات سدیم',
          'هوزینگ دیالیز',
          'اجزاء و قطعات پانکچرنیدل شیبانیدل',
          'پودر بی کربنات سدیم',
          'مواد اولیه محلول همودیالیز',
          'اجزاء و قطعات ماسک های مدیریت اکسیژن درمانی هوا',
          'مواد اولیه تولید بالون آنژیوپلاستی',
          'مواد اولیه مش جراحی',
          'فیلتر مورد استفاده در تولید کیسه ساکشن یکبار مصرف',
          'مواد اولیه تولید گرانول PVC',
          'ماده اولیه تولید پودر آمالگام کپسولی',
          'پودر جاذب',
          'گرانول PLLA-TCP',
          'اجزا و قطعات اینفلیتور',
          'الیاف UHMWPE',
          'اجزاء و قطعات ماسک اکسیژن غیرقابل تنفس مجدد',
          'اجزاء و قطعات ماسک ونچوری',
          'اجزاء و قطعات لارنژیال ماسک',
          'اجزاء و قطعات لوله تراشه',
          'پودر تیتانیوم',
          'لوله تیتانیوم',
          'لوله استیل',
          'مواد اولیه و اجزا و قطعات پلیت یکبار مصرف دولبه و تک لبه',
          'مواد اولیه تثبیت کننده بافت قلب',
          'پلیمر های پلی پروپیلن با گرید پزشکی',
          'پلیمر های پلی اتیلن با گرید پزشکی',
          'مواد اولیه کاغذ بسته بندی',
          'اجزاء و قطعات ساخت قلم بای پلار و قلم مونوپلار یکبار مصرف',
          'سیلیکون با گرید پزشکی',
          'مواد اولیه دستکش معاینه نیتریل غیر استریل',
          'مواد اولیه بیومواد استخوانی سنتزی',
          'گرانول پلی استال با گرید پزشکی',
          'مواد اولیه فیلم و کاغذ بسته بندی',
          'مواد اولیه نخ بخیه پلی استر',
          'نخ الاستیک با فشار کنترل شده',
          'پارچه کشباف',
          'اجزاء و قطعات رابط های تزریق',
          'ورق پلی وینیل الکل',
          'اجزاء و قطعات فیلتر اسپیرومتری',
          'پلی اتیلن ترفتالات (PET)',
          'اجزاء و قطعات کتتر مونت',
          'اجزاء و قطعات مبدل گرما و رطوبت فیلتردار',
          'اجزاء و قطعات کاتتر IUI',
          'اجزا و قطعات استپلر پوستی',
          'آلیاژ فولاد',
          'اجزاء و قطعات تروکار',
          'مواد اولیه تاندون مصنوعی',
          'آلیاژ آلومینیوم',
          'اجزا و قطعات روپوش، جلیقه و دامن سربی',
          'بالک ماده جاذب دی اکسید کربن ماشین بیهوشی',
          'اجزا و قطعات وسیله بستن رگ بعد از آنژیورادیال',
          'مواد اولیه شیت',
          'بالک سواب غیر استریل',
          'اجزا و قطعات ساخت ست کایفو پلاستی',
          'ماده اولیه تولید گرانول TPE با گرید پزشکی',
          'مواد اولیه ژل اولتراسوند',
          'اجزاء و قطعات کتتر بسکت',
          'مواد اولیه پیچ و پلاک جذبی',
          'اجزاء و قطعات لانست ایمنی',
          'اجزا و قطعات هپارین لاک',
          'اجزا و قطعات سوزن اسپاینال',
          'اجزا و قطعات سوزن اپیدورال',
          'کاغذ سونوگرافی',
          'مواد اولیه لنز تماسی',
          'اجزا و قطعات سوزن بیوپسی بافت نرم',
          'اجزا و قطعات مصرفی های وکیوم تراپی زخم',
          'اجزا و قطعات سوزن آسپیراسیون و نمونه برداری تخمدان',
          'اجزاء و قطعات پمپ تزریق یکبار مصرف الاستومریک',
          'اجزاء و قطعات کتترهای ادراری سوپراپوبیک',
          'اجزا و قطعات اسنیر یکبار مصرف الکتروسرجیکال',
          'اجزا و قطعات استنت بیلیاری',
          'اجزا و قطعات فورسپس بیوپسی یکبار مصرف',
          'مواد اولیه پک های جراحی',
          'اجزا و قطعات کتتر تشخیص رادیال',
          'اجزا و قطعات کتتر فمورال',
          'اجزا و قطعات گایدینگ کتتر',
          'اجزا و قطعات ترنسدیوسر فشار قلبی مانیتور همودینامیک قلب',
          'مواد اولیه آلو گرفت',
          'لوله پلی فنیل سولفان(PPSU tube)',
          'اجزا و قطعات ساخت استپلر لاپاراسکوپی',
          'اجزا و قطعات کتتر ورید مرکزی سی وی سی',
          'اجزا و قطعات پانچ بیوپسی یکبار مصرف',
          'اجزا و قطعات کتتر همودیالیز عروقی',
          'اجزا و قطعات مصرفی های کولون هیدوتراپی',
          'اجزا و قطعات مصرفی های فیزیوتراپی و توانبخشی',
          'مواد اولیه موم استخوان',
          'اجزا و قطعات کیت PRP',
          'اجزا و قطعات کتترهای ادراری حالب',
          'اجزا و قطعات کتتر یوروداینامیک',
          'ورق UHMWPE',
          'اجزا و قطعات درماتوم',
          'اجزاء و قطعات ست پلاسما فرز',
          'اجزا و قطعات نی انجماد و نگهداری ایمن جنین',
          'مواد اولیه برس اسکراب',
          'مواد اولیه نیمه ساخته تیغ جراحی',
          'اجزا و قطعات پورت تزریق',
          'اجزا و قطعات هموکلیپس',
          'مواد اولیه محلول CRRT',
          'مواد اولیه تولید بیومواد استخوانی سیمان استخوانی',
          'اجزا و قطعات بگ اندوسکوپی',
          'اجزا و قطعات پورت شیمی درمانی',
          'اجزاء و قطعات آرتریال کتتر',
          'مواد اولیه اسپیلنت خارجی',
          'اجزا و قطعات سرسوزن قلم انسولین',
          'مواد اولیه کانولای قلبی',
          'اجزاء و قطعات ساخت اکسیژناتور قلبی',
          'مواد اولیه تولید انواع نخ لیفت',
          'مواد اولیه کیسه استومی',
          'مواد اولیه زیرانداز بیمار',
          'اجزا و قطعات کیت های بیهوشی اپیدورال',
          'مواد اولیه پارتیکل آمبولیزاسیون',
          'اجزا و قطعات مصرفی های اپیدروپلاستی',
          'اجزا و قطعات ست یکبار مصرف دیسککتومی',
          'مواد اولیه محلول شستشو لنزهای تماسی',
          'مواد اولیه کلیپس اپلایر یکبار مصرف',
          'گرانول پیک',
          'مواد اولیه نخ بخیه پلی گلاکتین',
          'گرانول TPE با گرید پزشکی',
          'اجزاء و قطعات ساخت احیاء کننده ( آمبوبگ ) ریوی دستی',
          'اجزا و قطعات منستورال کاپ',
          'مواد اولیه ماسک رادیوتراپی',
          'مواد اولیه سوزن خونگیری',
          'اجزا و قطعات ساخت ماسک دهان و بینی سی پپ',
          'اجزا و قطعات سوزن ورس',
          'اجزا و قطعات کتترهای نمونه برداری آندومتر',
          'مواد اولیه پانسمان های سیلیکونی',
          'مواد اولیه پانسمان های سوختگی',
          'مواد اولیه سوزن نشانه گذاری پستان',
          'مواد اولیه پانسمان فوم(فوم ها)',
          'مواد اولیه پانسمان هیدروکلوئید',
          'مواد اولیه پانسمان های ضدباکتری',
          'مواد اولیه تیشو اکسپندر',
          'اجزاء و قطعات دستگاه میکس سیمان ارتوپدی تحت خلاء',
          'مواد اولیه پانسمان عمومی',
          'مواد اولیه پانسمان جاذب ترشح زخم',
          'مواد اولیه نخ استیل ضدزنگ',
          'مواد اولیه کلیپس عروقی',
          'اجزا و قطعات ساخت فیبر لیزردایود جراحی',
          'اجزا و قطعات کویل مغزی',
          'اجزا و قطعات میکرو کتتر مغزی',
          'اجزا و قطعات وسیله محافظ کاروتید',
          'اجزا و قطعات قلاب اندوسکوپی',
          'اجزا و قطعات ساخت سوزن اسکلروتراپی',
          'اجزا و قطعات میکروکتتر مایع و پارتیکل',
          'اجزا و قطعات استنت ترومبکتومی',
          'اجزا و قطعات استنت فلودایورتور',
          'اجزا و قطعات کتترهای ترومبکتومی تکه ساز لخته',
          'اجزا و قطعات مایع امبولیزاسیون',
          'اجزا و قطعات میکروگایدوایر',
          'اجزا و قطعات استنت ساپورت کویلینگ',
          'اجزا و قطعات ساخت استنت دارویی',
          'ماده اولیه آتل ارتوپدی مشبک',
          'ورق کروم کبالت',
          'اجزا و قطعات آسپیراسیون و جمع آوری تخمک',
          'مواد اولیه تولید استنت فلزی مری',
          'مواد اولیه تولید استنت فلزی بیلیاری',
          'مواد اولیه پانسمان های آلژینات',
          'مواد اولیه ست ابزار جایگذاری ست ورتبروپلاستی',
          'اجزا و قطعات میکرو کتتر قلبی',
          'اجزاء و قطعات فیلتر همو دیالیز Blood cap',
          'اجزاء و قطعات فیلتر همو دیالیز Hansen Connector cap',
          'اجزاء و قطعات فیلتر همو دیالیز Vented cap',
          'مواد اولیه بالون دارویی قلبی',
          'اجزا و قطعات کتترهای انتقال جنین',
          'اجزا و قطعات ICSI Pipet',
          'اجزا و قطعات Holding Pipet',
          'اجزا و قطعات Culturedish',
          'اجزاء و قطعات گاید ارولوژِی',
          'مواد اولیه محیطهای کشت و افزودنیهای محیط کشت IVF/IUI',
          'اجزا و قطعات فیلتر همودیالیز',
        ],
      },
      {
        name: 'فناوری اطلاعات پزشکی (IT)*',
        types: ['پایش سلامت از راه دور'],
      },
      {
        name: 'تجهیزات و فرآورده های پزشکی تحقیقاتی',
        types: ['سیستم ها و دستگاه های پزشکی تحقیقاتی'],
      },
    ],
  },

  // ==========================================================================
  // Category 2: تجهیزات آزمایشگاهی
  // ==========================================================================
  {
    name: 'تجهیزات آزمایشگاهی',
    domain: 'laboratory',
    subcategories: [
      {
        name: 'Clinical Chemistry',
        types: [
          'Clinical Chemistry Instrument',
          'Clinical Chemistry Reagents',
          'Immunochemistry Reagents',
        ],
      },
      {
        name: 'Molecular Genetics',
        types: ['Molecular Genetic Reagents', 'Molecular Genetic Instruments'],
      },
      {
        name: 'Microbiology',
        types: [
          'Microbiology Reagents Infectious Immunology',
          'Microbiology Instruments Culture',
          'Microbiology Reagents Culture',
        ],
      },
      {
        name: 'Hematology Histology Cytology',
        types: ['HHC Instruments', 'HHC Reagents'],
      },
      {
        name: 'General Laboratory',
        types: ['General Laboratory Instruments'],
      },
      {
        name: 'Immunology',
        types: ['Immunology Instruments', 'Immunology Reagents'],
      },
      {
        name: 'تجهیزات و فرآورده های آزمایشگاهی تحقیقاتی',
        types: [
          'مواد و فرآورده های آزمایشگاهی تحقیقاتی',
          'لوازم مصرفی آزمایشگاهی تحقیقاتی',
          'سیستمها و دستگاههای آزمایشگاهی تحقیقاتی',
        ],
      },
      {
        name: 'مواد اولیه خط تولید آزمایشگاهی',
        types: [
          'مواد اولیه انواع معرف بیوشیمی بالینی',
          'مواد اولیه انواع معرف ایمونوشیمی',
          'مواد اولیه انواع معرف ایمنی شناسی',
          'مواد اولیه انواع معرف ژنتیک مولکولی',
          'مواد اولیه معرف های محیط کشت میکروبی',
          'مواد اولیه کالیبراتور کنترل و استاندارد میکروبی',
          'مواد اولیه معرف رنگ آمیزی و بافر میکروبی',
          'مواد اولیه معرف تشخیصی سوء مصرف دارو',
          'مواد اولیه انواع معرف خون شناسی بافت شناسی سلول شناسی',
          'مواد اولیه لوله خونگیری خلا',
          'مواد اولیه لوله خونگیری بدون خلا',
          'مواد اولیه خط تولید مصرفی آزمایشگاهی',
          'مواد اولیه نوار تست قند خون',
          'مواد اولیه کیت های آزمایشگاهی کرونا ویروس جدید',
          'مواد اولیه مولکولی میکروب شناسی',
        ],
      },
    ],
  },

  // ==========================================================================
  // Category 3: تجهیزات بیمارستانی
  // ==========================================================================
  {
    name: 'تجهیزات بیمارستانی',
    domain: 'hospital',
    subcategories: [
      {
        name: 'دستگاه های بیمارستانی',
        types: [
          'شستشو و استریل (CSR)',
          'ساکشن و درناژ',
          'انژکتور ماده حاجب',
          'مراقبتهای ویژه و بستری',
          'اتاق عمل',
          'هتلینگ',
          'وکیوم مرکزی بیمارستانی',
          'تصفیه و ضدعفونی کننده هوا و محیط',
          'محفظه جمع آوری دستگاه آسپیراتور',
          'وکیوم تراپی زخم',
          'مولد پرتو فرابنفش جهت ضدعفونی کنندگی',
          'تصفیه کننده آب',
          'هشداردهنده گازهای طبی',
          'لامپ نور مرئی میکروب کشی',
          'دستگاه سیستم ضدعفونی کننده سطح بالا',
          'محفظه اکسیژن پرفشار',
        ],
      },
      {
        name: 'مدیریت پسماند',
        types: ['مصرفی مدیریت پسماند', 'دستگاه های مدیریت پسماند'],
      },
      {
        name: 'بسته بندی ابزار و لوازم پزشکی',
        types: [
          'کاغذ بسته بندی',
          'فیلم بسته بندی',
          'فیلم و کاغذ بسته بندی',
          'کاغذ کرپ',
          'لوازم مصرفی بسته بندی ابزار و لوازم پزشکی',
        ],
      },
      {
        name: 'سیستم گازهای طبی',
        types: [
          'مخزن اکسیژن مایع',
          'اکسیژن ساز بیمارستانی',
          'هوای مدیکال بیمارستانی',
          'ولو باکس گازهای طبی',
          'سیلندر گازهای طبی',
        ],
      },
      {
        name: 'مواد اولیه خط تولید بیمارستانی',
        types: ['مواد اولیه خط تولید اندیکاتورهای استریلیزاسیون'],
      },
    ],
  },
  // ==========================================================================
  // Category 4: اموال عمومی و پشتیبانی بیمارستان (۲۵ زیرمجموعه استاندارد)
  // ==========================================================================
  {
    name: 'اموال عمومی و پشتیبانی بیمارستان',
    domain: 'general_hospital',
    subcategories: [
      {
        name: 'هتلینگ و اقامتی',
        types: ['اتاق بیمار', 'لابی و فضاهای عمومی', 'اتاق همراه و استراحت', 'تجهیزات اقامتی عمومی'],
      },
      {
        name: 'اداری و سازمانی',
        types: ['میز و صندلی', 'بایگانی و اسناد', 'تجهیزات اداری'],
      },
      {
        name: 'فناوری اطلاعات',
        types: [
          'رایانه و پردازش',
          'نمایشگر و ورودی',
          'چاپ و دیجیتالسازی',
          'شبکه و زیرساخت',
          'ذخیرهسازی و پشتیبانگیری',
          'برق و حفاظت',
          'شناسایی و کنترل',
        ],
      },
      {
        name: 'مخابرات و ارتباطات',
        types: ['تلفن و داخلی', 'ارتباط اضطراری', 'کنفرانس و ارتباط تصویری'],
      },
      {
        name: 'صوتی و تصویری',
        types: ['نمایش', 'صوت', 'تصویربرداری', 'تولید محتوا'],
      },
      {
        name: 'آشپزخانه و تغذیه',
        types: [
          'پختوپز',
          'آمادهسازی',
          'سردخانه و نگهداری',
          'سرو و پذیرایی',
          'رستوران و سالن غذاخوری',
        ],
      },
      {
        name: 'لاندری و رختشویی',
        types: ['شستوشو', 'خشککردن', 'اتو و پرس', 'حمل و نگهداری'],
      },
      {
        name: 'نظافت و خدمات عمومی',
        types: ['نظافت مکانیزه', 'حمل و جمعآوری', 'خدمات عمومی'],
      },
      {
        name: 'تأسیسات مکانیکی',
        types: [
          'سرمایش و تهویه',
          'گرمایش',
          'پمپاژ',
          'آب و فاضلاب',
          'گاز و سوخت',
          'آسانسور و جابهجایی عمودی',
        ],
      },
      {
        name: 'تأسیسات الکتریکی',
        types: ['تولید و برق اضطراری', 'توزیع برق', 'روشنایی', 'حفاظت الکتریکی'],
      },
      {
        name: 'ایمنی و آتشنشانی',
        types: ['اطفای حریق', 'اعلام حریق', 'ایمنی عمومی'],
      },
      {
        name: 'امنیتی و حفاظتی',
        types: ['نظارت تصویری', 'کنترل تردد', 'حفاظت فیزیکی'],
      },
      {
        name: 'حملونقل',
        types: ['خودرو', 'حمل داخلی', 'پارکینگ'],
      },
      {
        name: 'انبار و لجستیک',
        types: ['قفسه و نگهداری', 'جابهجایی', 'شناسایی و برچسبگذاری', 'اندازهگیری'],
      },
      {
        name: 'آموزشی و پژوهشی',
        types: ['فضای آموزشی', 'پژوهشی عمومی'],
      },
      {
        name: 'رفاهی کارکنان',
        types: ['آشپزخانه و پذیرایی', 'استراحت', 'ورزش و رفاه'],
      },
      {
        name: 'محوطه و فضای سبز',
        types: ['مبلمان فضای باز', 'محوطه', 'فضای سبز', 'آبیاری'],
      },
      {
        name: 'کارگاهی و ابزار',
        types: ['ابزار برقی', 'ابزار دستی', 'تجهیزات کارگاه'],
      },
      {
        name: 'ساختمانی و عمرانی',
        types: ['کار در ارتفاع', 'تجهیزات ساختمانی', 'اجزای قابل ثبت'],
      },
      {
        name: 'فرهنگی، تزئینی و اطلاعرسانی',
        types: ['دکوراسیون', 'علائم', 'اطلاعرسانی'],
      },
      {
        name: 'مدیریت پسماند',
        types: ['جمعآوری', 'حمل', 'پردازش و فشردهسازی'],
      },
      {
        name: 'پذیرش و مراجعین',
        types: ['پذیرش', 'انتظار', 'راهنمایی'],
      },
      {
        name: 'مدیریت اسناد و بایگانی',
        types: ['بایگانی فیزیکی', 'دیجیتالسازی', 'امحا'],
      },
      {
        name: 'تجهیزات بحران و پشتیبان',
        types: ['برق و انرژی', 'ارتباط اضطراری', 'تخلیه و نجات'],
      },
      {
        name: 'حفاظت فردی و ایمنی کارکنان',
        types: ['لباس و پوشش', 'محافظت فردی', 'کار در ارتفاع'],
      },
    ],
  },
];

// Helper to build the final flat list of classifications
function buildClassificationsList(): AssetClassification[] {
  const result: AssetClassification[] = [];

  RAW_TAXONOMY.forEach((catDef, catIndex) => {
    const catNumber = catIndex + 1;
    const catId = `cat-${catNumber}`;
    const catCode = `CAT-${String(catNumber).padStart(2, '0')}`;

    // Level 1: Category (NO FIELDS)
    const categoryNode: AssetClassification = {
      id: catId,
      name: catDef.name,
      slug: `category-${catNumber}`,
      description: `رده اول ساختار: ${catDef.name}`,
      parentId: undefined,
      parentName: undefined,
      domain: catDef.domain,
      code: catCode,
      path: catDef.name,
      isCustom: false,
      isLeaf: false,
      itemsCount: 0,
      isActive: true,
      createdAt: '۱۴۰۳/۰۱/۰۱',
      updatedAt: '۱۴۰۳/۰۵/۲۰',
      fields: [], // Category has strictly NO fields
    };
    result.push(categoryNode);

    catDef.subcategories.forEach((subDef, subIndex) => {
      const subNumber = subIndex + 1;
      const subId = `sub-${catNumber}-${subNumber}`;
      const subCode = `SUB-${String(catNumber).padStart(2, '0')}-${String(subNumber).padStart(2, '0')}`;
      const subPath = `${catDef.name} > ${subDef.name}`;

      // Level 2: Subcategory (NO FIELDS)
      const subcategoryNode: AssetClassification = {
        id: subId,
        name: subDef.name,
        slug: `subcategory-${catNumber}-${subNumber}`,
        description: `رده دوم ساختار: ${subDef.name} (تحت ${catDef.name})`,
        parentId: catId,
        parentName: catDef.name,
        domain: catDef.domain,
        code: subCode,
        path: subPath,
        isCustom: false,
        isLeaf: false,
        itemsCount: 0,
        isActive: true,
        createdAt: '۱۴۰۳/۰۱/۰۱',
        updatedAt: '۱۴۰۳/۰۵/۲۰',
        fields: [], // Subcategory has strictly NO fields
      };
      result.push(subcategoryNode);

      subDef.types.forEach((typeName, typeIndex) => {
        const typeNumber = typeIndex + 1;
        const typeId = `type-${catNumber}-${subNumber}-${typeNumber}`;
        const typeCode = `TYP-${String(catNumber).padStart(2, '0')}-${String(subNumber).padStart(2, '0')}-${String(typeNumber).padStart(2, '0')}`;
        const typePath = `${catDef.name} > ${subDef.name} > ${typeName}`;

        const reqFields = makeStandardFields(typeName, subDef.name, catDef.name);

        // Level 3: Type (ONLY Type can have fields)
        const typeNode: AssetClassification = {
          id: typeId,
          name: typeName,
          slug: `type-${catNumber}-${subNumber}-${typeNumber}`,
          description: `رده سوم ساختار (Type): ${typeName}`,
          parentId: subId,
          parentName: subDef.name,
          domain: catDef.domain,
          code: typeCode,
          path: typePath,
          isCustom: false,
          isLeaf: true,
          itemsCount: 0,
          isActive: true,
          createdAt: '۱۴۰۳/۰۱/۰۱',
          updatedAt: '۱۴۰۳/۰۵/۲۰',
          fields: reqFields,
          defaultFieldsBackup: reqFields,
        };
        result.push(typeNode);
      });
    });
  });

  return result;
}

export const INITIAL_STRUCTURES_DATA: AssetClassification[] = buildClassificationsList();

/**
 * Returns all inherited and direct fields for any classification node (Category -> Subcategory -> Type).
 */
export function getInheritedFieldsForNode(
  nodeId: string,
  classificationsList: AssetClassification[] = INITIAL_STRUCTURES_DATA
): { levelLabel: string; field: AssetRequirementField }[] {
  const result: { levelLabel: string; field: AssetRequirementField }[] = [];
  const visited = new Set<string>();

  const targetNode = classificationsList.find((c) => c.id === nodeId);
  if (!targetNode) return result;

  // Build hierarchy path upwards
  const pathNodes: AssetClassification[] = [targetNode];
  let current = targetNode;
  while (current.parentId) {
    const parent = classificationsList.find((c) => c.id === current.parentId);
    if (parent) {
      pathNodes.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }

  // Iterate top-down (Category -> Subcategory -> Type)
  pathNodes.forEach((node) => {
    const levelLabel = node.parentId === undefined ? 'دسته اصلی' : node.isLeaf ? 'نوع کالا' : 'زیردسته';
    (node.fields || []).forEach((field) => {
      if (!visited.has(field.id)) {
        visited.add(field.id);
        result.push({ levelLabel, field });
      }
    });
  });

  return result;
}

export interface EquipmentTypeDirectoryItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  type: string;
  path: string;
  fields: AssetRequirementField[];
}

/**
 * Returns a flattened directory of all reference equipment types (Level 3) for instant search.
 */
export function getAllTaxonomyEquipmentTypes(
  classificationsList: AssetClassification[] = INITIAL_STRUCTURES_DATA
): EquipmentTypeDirectoryItem[] {
  const types = classificationsList.filter((c) => c.isLeaf || (!c.parentId?.startsWith('root') && c.id.startsWith('type-')));
  return types.map((t) => {
    const sub = classificationsList.find((c) => c.id === t.parentId);
    const cat = sub ? classificationsList.find((c) => c.id === sub.parentId) : null;
    const categoryName = cat?.name || 'تجهیزات پزشکی';
    const subcategoryName = sub?.name || 'عمومی';
    const inherited = getInheritedFieldsForNode(t.id, classificationsList);

    return {
      id: t.id,
      name: t.name,
      category: categoryName,
      subcategory: subcategoryName,
      type: t.name,
      path: t.path || `${categoryName} > ${subcategoryName} > ${t.name}`,
      fields: inherited.map((i) => i.field),
    };
  });
}

/**
 * Resolves or guesses the best matching equipment taxonomy from text/title.
 */
export function guessTaxonomyForText(
  text: string,
  classificationsList: AssetClassification[] = INITIAL_STRUCTURES_DATA
): EquipmentTypeDirectoryItem | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  const allTypes = getAllTaxonomyEquipmentTypes(classificationsList);

  // Exact or close match on type name
  const exact = allTypes.find((t) => lower.includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(lower));
  if (exact) return exact;

  // Subcategory match
  const subMatch = allTypes.find((t) => lower.includes(t.subcategory.toLowerCase()));
  if (subMatch) return subMatch;

  // Fallback to first medical equipment
  return allTypes[0] || null;
}


/**
 * Returns the list of Category names (Level 1)
 */
export function getTaxonomyCategories(): string[] {
  return RAW_TAXONOMY.map((c) => c.name);
}

/**
 * Returns the list of Subcategories (Level 2) strictly belonging to the given Category (or all if 'all'/empty)
 */
export function getTaxonomySubcategories(categoryName?: string): string[] {
  if (!categoryName || categoryName === 'all') {
    return Array.from(new Set(RAW_TAXONOMY.flatMap((c) => c.subcategories.map((s) => s.name))));
  }
  const cat = RAW_TAXONOMY.find((c) => c.name === categoryName);
  return cat ? cat.subcategories.map((s) => s.name) : [];
}

/**
 * Returns the list of Types (Level 3) strictly belonging to the selected Subcategory and Category
 */
export function getTaxonomyTypes(categoryName?: string, subcategoryName?: string): string[] {
  if (!subcategoryName || subcategoryName === 'all') {
    if (!categoryName || categoryName === 'all') {
      return Array.from(new Set(RAW_TAXONOMY.flatMap((c) => c.subcategories.flatMap((s) => s.types))));
    }
    const cat = RAW_TAXONOMY.find((c) => c.name === categoryName);
    return cat ? Array.from(new Set(cat.subcategories.flatMap((s) => s.types))) : [];
  }

  if (categoryName && categoryName !== 'all') {
    const cat = RAW_TAXONOMY.find((c) => c.name === categoryName);
    const subcat = cat?.subcategories.find((s) => s.name === subcategoryName);
    return subcat ? subcat.types : [];
  }

  for (const c of RAW_TAXONOMY) {
    const subcat = c.subcategories.find((s) => s.name === subcategoryName);
    if (subcat) return subcat.types;
  }
  return [];
}

