import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Layers,
  ArrowRight,
  UserCheck,
  Building,
  KeyRound,
  FileSpreadsheet,
  Workflow,
  ExternalLink,
  ChevronLeft,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { EquipmentItem, PurchaseRequest, AppUser, TaskEvent } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';

interface AdminReportsProps {
  currentUser?: AppUser;
  usersList?: AppUser[];
  equipmentList: EquipmentItem[];
  purchaseRequests: PurchaseRequest[];
  tasksList?: TaskEvent[];
  onNavigateToPage?: (page: string) => void;
  onSelectEquipment?: (item: EquipmentItem) => void;
}

export const AdminReports: React.FC<AdminReportsProps> = ({
  currentUser,
  usersList = [],
  equipmentList,
  purchaseRequests,
  tasksList = [],
  onNavigateToPage,
  onSelectEquipment,
}) => {
  // Navigation helper
  const handleActionClick = (targetPage: string, itemTitle?: string) => {
    if (onNavigateToPage) {
      onNavigateToPage(targetPage);
    }
  };

  // State for search/filters
  const [report1Filter, setReport1Filter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [report1Search, setReport1Search] = useState('');
  const [selectedIssueModal, setSelectedIssueModal] = useState<any | null>(null);

  // =========================================================================
  // REPORT 1: موارد نیازمند رسیدگی در سیستم (PRIMARY ACTIONABLE ISSUES)
  // =========================================================================
  const unresolvedIssues = useMemo(() => {
    return [
      {
        id: 'iss-1',
        title: 'کاربران بدون کارگروه تخصیص‌یافته',
        section: 'کاربران',
        problemType: 'ساختار سازمانی',
        duration: '—',
        priority: 'بالا' as const,
        actionLabel: 'بررسی',
        targetPage: 'users',
        description: '۲ کاربر جدید در سامانه ثبت شده‌اند اما به هیچ کارگروه تخصصی متصل نشده‌اند.',
      },
      {
        id: 'iss-2',
        title: 'Draftهای قدیمی و تکمیل‌نشده',
        section: 'موجودی',
        problemType: 'اطلاعات ناقص',
        duration: '۸ روز',
        priority: 'بالا' as const,
        actionLabel: 'مشاهده',
        targetPage: 'inventory',
        description: '۳ پیش‌نویس تجهیز ثبت‌شده بیش از یک هفته بدون تایید نهایی در کارتابل رها شده‌اند.',
      },
      {
        id: 'iss-3',
        title: 'کارگروه تصویربرداری و ام‌آر‌آی بدون سرپرست',
        section: 'کارگروه‌ها',
        problemType: 'ساختار سازمانی',
        duration: '۱۲ روز',
        priority: 'بالا' as const,
        actionLabel: 'اصلاح',
        targetPage: 'my_workgroup',
        description: 'این کارگروه فاقد سرپرست مستقیم بوده و ارجاع وظایف در آن با بن‌بست مواجه می‌شود.',
      },
      {
        id: 'iss-4',
        title: 'فرآیند خرید متوقف‌شده به دلیل نقص تاییدیه',
        section: 'فرآیندها',
        problemType: 'توقف گردش کار',
        duration: '۶ روز',
        priority: 'بالا' as const,
        actionLabel: 'رفع مانع',
        targetPage: 'requests',
        description: 'درخواست PR-1404-098 به علت عدم وجود کارشناس فنی مجاز متوقف مانده است.',
      },
      {
        id: 'iss-5',
        title: 'دسترسی‌های ناسازگار با تفکیک وظایف مالی',
        section: 'دسترسی‌ها',
        problemType: 'سطح دسترسی',
        duration: '—',
        priority: 'بالا' as const,
        actionLabel: 'بررسی',
        targetPage: 'users',
        description: 'نقش تدارکات دارای دسترسی همزمان تایید و صدور اسناد بودجه است.',
      },
      {
        id: 'iss-6',
        title: 'موجودی با شماره سریال و پلاک ثبت‌نشده',
        section: 'موجودی',
        problemType: 'اطلاعات ناقص',
        duration: '۵ روز',
        priority: 'متوسط' as const,
        actionLabel: 'تکمیل',
        targetPage: 'inventory',
        description: '۵ دستگاه وارداتی فاقد شماره سریال کارخانه‌ای در شناسه اموال هستند.',
      },
      {
        id: 'iss-7',
        title: 'کاربران بدون سرپرست مستقیم ثبت‌شده',
        section: 'کاربران',
        problemType: 'ساختار سازمانی',
        duration: '۳ روز',
        priority: 'متوسط' as const,
        actionLabel: 'اصلاح',
        targetPage: 'users',
        description: 'پرسنل جدید واحد اورژانس سرپرست تاییدکننده شیفت و درخواست ندارند.',
      },
      {
        id: 'iss-8',
        title: 'کارگروه پاتولوژی با تعداد اعضای ناکافی',
        section: 'کارگروه‌ها',
        problemType: 'ساختار ناقص',
        duration: '۱۵ روز',
        priority: 'پایین' as const,
        actionLabel: 'تکمیل',
        targetPage: 'my_workgroup',
        description: 'حداقل استاندارد اعضای کارگروه ۲ نفر است در حالی که فقط ۱ کاربر عضو است.',
      },
    ];
  }, []);

  const totalUnresolvedCount = unresolvedIssues.length;

  const filteredIssues = useMemo(() => {
    return unresolvedIssues.filter((item) => {
      if (report1Filter !== 'all' && item.priority !== report1Filter) {
        if (report1Filter === 'high' && item.priority !== 'بالا') return false;
        if (report1Filter === 'medium' && item.priority !== 'متوسط') return false;
        if (report1Filter === 'low' && item.priority !== 'پایین') return false;
      }
      if (report1Search.trim()) {
        const q = report1Search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.section.toLowerCase().includes(q) ||
          item.problemType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [unresolvedIssues, report1Filter, report1Search]);

  // =========================================================================
  // REPORT 2: کیفیت و کامل بودن داده‌های سیستم
  // =========================================================================
  const dataQualityKPIs = {
    incompleteInfo: 18,
    incompleteDrafts: 3,
    incompleteInventory: 5,
    unlinkedRecords: 6,
  };

  const dataQualityTableData = useMemo(() => {
    return [
      {
        id: 'dq-1',
        problemType: 'موجودی بدون اطلاعات ضروری (سریال، مدل، شرکت پشتیبان)',
        count: 5,
        relatedSection: 'موجودی و انبار',
        lastUpdated: '۱۴۰۴/۰۲/۱۵',
        status: 'نیازمند تکمیل اطلاعات',
        actionLabel: 'تکمیل',
        targetPage: 'inventory',
      },
      {
        id: 'dq-2',
        problemType: 'Draft تکمیل‌نشده و رها شده',
        count: 3,
        relatedSection: 'موجودی',
        lastUpdated: '۱۴۰۴/۰۲/۱۲',
        status: 'در انتظار تکمیل و ثبت قطعی',
        actionLabel: 'مشاهده',
        targetPage: 'inventory',
      },
      {
        id: 'dq-3',
        problemType: 'کاربر با اطلاعات ناقص (کد پرسنلی / تلفن تماس)',
        count: 4,
        relatedSection: 'مدیریت کاربران',
        lastUpdated: '۱۴۰۴/۰۲/۱۰',
        status: 'پروفایل ناقص',
        actionLabel: 'اصلاح',
        targetPage: 'users',
      },
      {
        id: 'dq-4',
        problemType: 'رکورد بدون ارتباط لازم (تجهیز بدون کارگروه / بخش)',
        count: 6,
        relatedSection: 'ساختار اموال',
        lastUpdated: '۱۴۰۴/۰۲/۱۴',
        status: 'فاقد تخصیص سازمانی',
        actionLabel: 'بررسی',
        targetPage: 'inventory',
      },
      {
        id: 'dq-5',
        problemType: 'اطلاعات ضروری فرآیند ثبت نشده (سرفصل استهلاک مالی)',
        count: 7,
        relatedSection: 'اموال و حسابداری',
        lastUpdated: '۱۴۰۴/۰۲/۰۸',
        status: 'عدم ثبت سرفصل مالی',
        actionLabel: 'تکمیل',
        targetPage: 'inventory',
      },
    ];
  }, []);

  // =========================================================================
  // REPORT 3: وضعیت ساختار کاربران و کارگروه‌ها
  // =========================================================================
  const structuralProblemsCount = 4;

  const orgStructureTableData = useMemo(() => {
    return [
      {
        id: 'org-1',
        itemType: 'کارگروه تخصصی',
        name: 'تصویربرداری و ام‌آر‌آی',
        supervisor: 'تعیین نشده (خالی)',
        membersCount: 4,
        structureStatus: 'کارگروه بدون سرپرست (نیازمند اصلاح فوری)',
        isError: true,
        actionLabel: 'اصلاح',
        targetPage: 'my_workgroup',
      },
      {
        id: 'org-2',
        itemType: 'کاربر سازمانی',
        name: 'دکتر مهدی ابراهیمی (پزشک مقیم)',
        supervisor: 'ندارد',
        membersCount: 0,
        structureStatus: 'کاربر بدون کارگروه تخصیص‌یافته',
        isError: true,
        actionLabel: 'بررسی',
        targetPage: 'users',
      },
      {
        id: 'org-3',
        itemType: 'کارگروه تخصصی',
        name: 'آزمایشگاه پاتولوژی و بیوشیمی',
        supervisor: 'دکتر سهرابی',
        membersCount: 1,
        structureStatus: 'ساختار ناقص (کمتر از حداقل ۲ نفر عضو)',
        isError: true,
        actionLabel: 'تکمیل',
        targetPage: 'my_workgroup',
      },
      {
        id: 'org-4',
        itemType: 'کاربر سازمانی',
        name: 'مهندس علی رضایی (تکنسین تجهیزات)',
        supervisor: 'نیازمند انتصاب سرپرست',
        membersCount: 0,
        structureStatus: 'کاربر بدون سرپرست مستقیم',
        isError: true,
        actionLabel: 'اصلاح',
        targetPage: 'users',
      },
      {
        id: 'org-5',
        itemType: 'کارگروه تخصصی',
        name: 'بخش مراقبت‌های ویژه (ICU و CCU)',
        supervisor: 'دکتر علیرضا محمدی',
        membersCount: 8,
        structureStatus: 'ساختار کامل و دارای سرپرست',
        isError: false,
        actionLabel: 'مشاهده',
        targetPage: 'my_workgroup',
      },
      {
        id: 'org-6',
        itemType: 'کارگروه تخصصی',
        name: 'تیم مهندسی پزشکی و نگهداشت',
        supervisor: 'مهندس سارا رادمنش',
        membersCount: 5,
        structureStatus: 'ساختار کامل و دارای سرپرست',
        isError: false,
        actionLabel: 'مشاهده',
        targetPage: 'my_workgroup',
      },
    ];
  }, []);

  // =========================================================================
  // REPORT 4: وضعیت دسترسی‌ها
  // =========================================================================
  const accessIssuesCount = 4;

  const accessTableData = useMemo(() => {
    return [
      {
        id: 'acc-1',
        user: 'مهندس نوید صادقی',
        role: 'کارشناس فنی',
        workgroup: 'مهندسی پزشکی',
        accessLevel: 'سطح ۲ (فنی)',
        status: 'نیازمند بررسی',
        issueDescription: 'دسترسی ناقص به ماژول تایید دستورکار PM',
        actionLabel: 'بررسی',
        targetPage: 'users',
      },
      {
        id: 'acc-2',
        user: 'دکتر مینا کاظمی',
        role: 'رئیس بخش',
        workgroup: 'درمانگاه تخصصی',
        accessLevel: 'سطح ۳ (مدیریتی)',
        status: 'عدم انطباق با نقش',
        issueDescription: 'دسترسی ناسازگار با نقش (فاقد دسترسی تایید درخواست)',
        actionLabel: 'اصلاح',
        targetPage: 'users',
      },
      {
        id: 'acc-3',
        user: 'رضا افشار',
        role: 'مسئول خرید',
        workgroup: 'تدارکات',
        accessLevel: 'سطح ۲ (خرید/مالی)',
        status: 'مغایرت تفکیک وظایف',
        issueDescription: 'دسترسی تایید بودجه (مغایر با تفکیک وظایف مالی)',
        actionLabel: 'اصلاح',
        targetPage: 'users',
      },
      {
        id: 'acc-4',
        user: 'کاربر مهمان سیستم',
        role: 'تعریف‌نشده',
        workgroup: 'فاقد کارگروه',
        accessLevel: 'فاقد سطح دسترسی',
        status: 'مسدود / غیرفعال',
        issueDescription: 'کاربر بدون نقش سازمانی در انتظار تعیین نقش',
        actionLabel: 'بررسی',
        targetPage: 'users',
      },
      {
        id: 'acc-5',
        user: 'پرستار نسترن تقوی',
        role: 'اپراتور / پرستار بخش',
        workgroup: 'مراقبت‌های ویژه (ICU)',
        accessLevel: 'سطح ۱ (پایه)',
        status: 'فعال و منطبق',
        issueDescription: 'دسترسی استاندارد و منطبق با اختیارات',
        actionLabel: 'مشاهده',
        targetPage: 'users',
      },
    ];
  }, []);

  // =========================================================================
  // REPORT 5: وضعیت فرآیندهای متوقف‌شده
  // =========================================================================
  const blockedProcessesCount = 4;

  const blockedProcessesTableData = useMemo(() => {
    return [
      {
        id: 'bp-1',
        processName: 'درخواست خرید تجهیزات',
        recordCode: 'PR-1404-098 (فیلتر هپا)',
        currentStage: 'تایید کارشناس فنی مهندسی',
        blockReason: 'نبود کارشناس مجاز در کارگروه مربوطه',
        blockDuration: '۶ روز',
        priority: 'بالا' as const,
        actionLabel: 'رفع مانع',
        targetPage: 'requests',
      },
      {
        id: 'bp-2',
        processName: 'ثبت قطعی موجودی اموال',
        recordCode: 'EQ-DRAFT-042 (مانیتور B9)',
        currentStage: 'تایید مدیریت اموال',
        blockReason: 'عدم تکمیل فیلدهای اجباری ساختار در پیش‌نویس',
        blockDuration: '۵ روز',
        priority: 'بالا' as const,
        actionLabel: 'تکمیل',
        targetPage: 'inventory',
      },
      {
        id: 'bp-3',
        processName: 'فرآیند گردش کارگروه',
        recordCode: 'WG-TASK-104 (کالیبراسیون)',
        currentStage: 'ارجاع به سرپرست کارگروه',
        blockReason: 'کارگروه تصویربرداری فاقد سرپرست فعال است',
        blockDuration: '۸ روز',
        priority: 'بالا' as const,
        actionLabel: 'اصلاح',
        targetPage: 'my_workgroup',
      },
      {
        id: 'bp-4',
        processName: 'صدور سفارش خرید (PO)',
        recordCode: 'PO-1404-082 (ماژول EtCO2)',
        currentStage: 'تایید نهایی سقف اعتبار مالی',
        blockReason: 'سقف دسترسی مالی تدارکات تایید نشده است',
        blockDuration: '۳ روز',
        priority: 'متوسط' as const,
        actionLabel: 'بررسی',
        targetPage: 'requests',
      },
    ];
  }, []);

  // =========================================================================
  // REPORT 6: وضعیت کلی سلامت سیستم
  // =========================================================================
  const systemHealthSections = useMemo(() => {
    return [
      {
        section: 'کاربران',
        status: 'نیازمند بررسی' as const,
        mainProblem: '۴ کاربر با اطلاعات ناقص یا بدون کارگروه',
        itemsCount: 4,
        priority: 'بالا' as const,
        actionLabel: 'مدیریت کاربران',
        targetPage: 'users',
      },
      {
        section: 'کارگروه‌ها',
        status: 'نیازمند اقدام فوری' as const,
        mainProblem: '۱ کارگروه بدون سرپرست و ۱ ساختار ناقص',
        itemsCount: 2,
        priority: 'بالا' as const,
        actionLabel: 'ساختار کارگروه‌ها',
        targetPage: 'my_workgroup',
      },
      {
        section: 'دسترسی‌ها',
        status: 'نیازمند بررسی' as const,
        mainProblem: '۳ مورد ناسازگاری در سطوح دسترسی و تفکیک وظایف',
        itemsCount: 3,
        priority: 'بالا' as const,
        actionLabel: 'ممیزی دسترسی‌ها',
        targetPage: 'users',
      },
      {
        section: 'موجودی',
        status: 'نیازمند بررسی' as const,
        mainProblem: '۳ پیش‌نویس معوق و ۵ قلم فاقد شماره سریال',
        itemsCount: 8,
        priority: 'متوسط' as const,
        actionLabel: 'مدیریت موجودی',
        targetPage: 'inventory',
      },
      {
        section: 'داده‌ها',
        status: 'مناسب' as const,
        mainProblem: 'شاخص جامعیت داده‌ها ۹۴٪ (نیازمند پالایش دوره‌ای)',
        itemsCount: 4,
        priority: 'پایین' as const,
        actionLabel: 'پالایش داده‌ها',
        targetPage: 'inventory',
      },
      {
        section: 'فرآیندها',
        status: 'نیازمند اقدام فوری' as const,
        mainProblem: '۴ فرآیند متوقف‌شده ناشی از موانع ساختار و دسترسی',
        itemsCount: 4,
        priority: 'بالا' as const,
        actionLabel: 'رفع موانع فرآیند',
        targetPage: 'requests',
      },
    ];
  }, []);

  return (
    <div className="space-y-10 pb-16 font-sans text-right dir-rtl max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-black text-slate-900">گزارش‌ها و تحلیل‌ها</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              نمای کلی وضعیت سیستم و موارد نیازمند رسیدگی
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              نقش: مدیر ارشد سیستم (Administrator)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2 & 3. PRIMARY REPORT — موارد نیازمند رسیدگی در سیستم */}
      {/* ========================================================================= */}
      <section id="admin-rep1" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h2 className="text-sm font-extrabold text-slate-800">
              گزارش اصلی — موارد نیازمند رسیدگی در سیستم
            </h2>
          </div>
          <span className="text-xs text-slate-400">اقدامات مدیریتی با اولویت بالا و موانع سیستمی</span>
        </div>

        {/* Primary KPI Card: موارد نیازمند رسیدگی */}
        <div className="bg-gradient-to-l from-rose-500/10 via-rose-50/70 to-white rounded-2xl border border-rose-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div>
            <span className="text-xs font-bold text-rose-800">شاخص اصلی اقدام سیستمی</span>
            <h3 className="text-xl font-black text-slate-900 mt-1">موارد نیازمند رسیدگی</h3>
            <p className="text-xs text-slate-500 mt-1">
              مجموع مشکلات ساختاری، دسترسی، داده‌ای و فرآیندی که مستقیماً نیازمند دخالت ادمین هستند
            </p>
          </div>
          <div className="flex items-baseline gap-2 bg-white px-5 py-3 rounded-2xl border border-rose-200 shadow-xs">
            <span className="text-4xl font-black text-rose-600 font-mono">
              {toPersianNumber(totalUnresolvedCount)}
            </span>
            <span className="text-xs font-bold text-slate-600">مورد حل‌نشده</span>
          </div>
        </div>

        {/* Prioritized Actionable Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Table Controls (Search & Priority Filters) */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجو در موارد، بخش یا نوع مشکل..."
                value={report1Search}
                onChange={(e) => setReport1Search(e.target.value)}
                className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-400"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setReport1Filter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  report1Filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                همه ({toPersianNumber(unresolvedIssues.length)})
              </button>
              <button
                onClick={() => setReport1Filter('high')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  report1Filter === 'high' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                اولویت بالا ({toPersianNumber(unresolvedIssues.filter((i) => i.priority === 'بالا').length)})
              </button>
              <button
                onClick={() => setReport1Filter('medium')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  report1Filter === 'medium' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                اولویت متوسط
              </button>
              <button
                onClick={() => setReport1Filter('low')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  report1Filter === 'low' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                اولویت پایین
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">مورد</th>
                  <th className="py-3.5 px-4 text-center">بخش</th>
                  <th className="py-3.5 px-4 text-center">نوع مشکل</th>
                  <th className="py-3.5 px-4 text-center">مدت زمان</th>
                  <th className="py-3.5 px-4 text-center">اولویت</th>
                  <th className="py-3.5 px-4 text-center">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div>{issue.title}</div>
                      <div className="text-[11px] text-slate-400 font-normal mt-0.5">{issue.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {issue.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600 font-medium">{issue.problemType}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-500">{issue.duration}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          issue.priority === 'بالا'
                            ? 'bg-rose-100 text-rose-800'
                            : issue.priority === 'متوسط'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleActionClick(issue.targetPage, issue.title)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs active:scale-95"
                      >
                        <span>{issue.actionLabel}</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. REPORT 2 — کیفیت و کامل بودن داده‌های سیستم */}
      {/* ========================================================================= */}
      <section id="admin-rep2" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h2 className="text-sm font-extrabold text-slate-800">
              گزارش ۲ — کیفیت و کامل بودن داده‌های سیستم
            </h2>
          </div>
          <span className="text-xs text-slate-400">شناسایی و رفع اطلاعات ناقص، درفت‌های معوق و رکوردهای بی‌پایه</span>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600">اطلاعات ناقص</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {toPersianNumber(dataQualityKPIs.incompleteInfo)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">فیلدهای اجباری پرنشده</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              !
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600">Draftهای ناقص</span>
              <div className="text-2xl font-black text-rose-600 font-mono mt-1">
                {toPersianNumber(dataQualityKPIs.incompleteDrafts)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">پیش‌نویس رها شده</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              ۳
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600">موجودی‌های ناقص</span>
              <div className="text-2xl font-black text-amber-600 font-mono mt-1">
                {toPersianNumber(dataQualityKPIs.incompleteInventory)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">فاقد کد یا پلاک سریال</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              ۵
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600">موارد بدون ارتباط</span>
              <div className="text-2xl font-black text-indigo-600 font-mono mt-1">
                {toPersianNumber(dataQualityKPIs.unlinkedRecords)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">بدون بخش یا کارگروه</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              ۶
            </div>
          </div>
        </div>

        {/* Data Quality Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">نوع مشکل</th>
                  <th className="py-3.5 px-4 text-center">تعداد</th>
                  <th className="py-3.5 px-4 text-center">بخش مرتبط</th>
                  <th className="py-3.5 px-4 text-center">آخرین بروزرسانی</th>
                  <th className="py-3.5 px-4 text-center">وضعیت</th>
                  <th className="py-3.5 px-4 text-center">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataQualityTableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{row.problemType}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {toPersianNumber(row.count)} مورد
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600 font-medium">{row.relatedSection}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-500">{row.lastUpdated}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleActionClick(row.targetPage, row.problemType)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      >
                        <span>{row.actionLabel}</span>
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. REPORT 3 — وضعیت ساختار کاربران و کارگروه‌ها */}
      {/* ========================================================================= */}
      <section id="admin-rep3" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h2 className="text-sm font-extrabold text-slate-800">
              گزارش ۳ — وضعیت ساختار کاربران و کارگروه‌ها
            </h2>
          </div>
          <span className="text-xs text-slate-400">انطباق روابط سازمانی، تعیین سرپرستان و تخصیص صحیح پرسنل</span>
        </div>

        {/* 1 KPI Card: موارد دارای مشکل ساختاری */}
        <div className="bg-gradient-to-l from-indigo-500/10 via-indigo-50/70 to-white rounded-2xl border border-indigo-200 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-indigo-800">پایش ساختار تشکیلات</span>
            <h3 className="text-lg font-black text-slate-900 mt-1">موارد دارای مشکل ساختاری</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              کارگروه‌های بدون سرپرست، کاربران بدون کارگروه و پیوندهای سازمانی ناقص
            </p>
          </div>
          <div className="flex items-baseline gap-2 bg-white px-4 py-2.5 rounded-xl border border-indigo-200 shadow-2xs">
            <span className="text-3xl font-black text-indigo-600 font-mono">
              {toPersianNumber(structuralProblemsCount)}
            </span>
            <span className="text-xs font-bold text-slate-500">مورد نیازمند اصلاح</span>
          </div>
        </div>

        {/* Structured Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">نوع مورد</th>
                  <th className="py-3.5 px-4">نام</th>
                  <th className="py-3.5 px-4 text-center">سرپرست</th>
                  <th className="py-3.5 px-4 text-center">تعداد اعضا</th>
                  <th className="py-3.5 px-4 text-center">وضعیت ساختار</th>
                  <th className="py-3.5 px-4 text-center">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orgStructureTableData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                        {item.itemType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                    <td
                      className={`py-3.5 px-4 text-center font-medium ${
                        item.supervisor.includes('تعیین نشده') || item.supervisor.includes('نیازمند')
                          ? 'text-rose-600 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      {item.supervisor}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                      {item.membersCount > 0 ? `${toPersianNumber(item.membersCount)} نفر` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.isError
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.structureStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleActionClick(item.targetPage, item.name)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          item.isError
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{item.actionLabel}</span>
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. REPORT 4 — وضعیت دسترسی‌ها */}
      {/* ========================================================================= */}
      <section id="admin-rep4" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <h2 className="text-sm font-extrabold text-slate-800">
              گزارش ۴ — وضعیت دسترسی‌ها
            </h2>
          </div>
          <span className="text-xs text-slate-400">انطباق نقش‌ها، تفکیک وظایف سازمانی و اصلاح دسترسی‌های مغایر</span>
        </div>

        {/* 1 KPI Card: موارد دسترسی نیازمند بررسی */}
        <div className="bg-gradient-to-l from-sky-500/10 via-sky-50/70 to-white rounded-2xl border border-sky-200 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-sky-800">امنیت و ممیزی سطوح کاربری</span>
            <h3 className="text-lg font-black text-slate-900 mt-1">موارد دسترسی نیازمند بررسی</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              دسترسی‌های ناسازگار با نقش، کاربران بدون نقش یا فاقد مجوزهای الزامی فرآیند
            </p>
          </div>
          <div className="flex items-baseline gap-2 bg-white px-4 py-2.5 rounded-xl border border-sky-200 shadow-2xs">
            <span className="text-3xl font-black text-sky-600 font-mono">
              {toPersianNumber(accessIssuesCount)}
            </span>
            <span className="text-xs font-bold text-slate-500">مورد دسترسی</span>
          </div>
        </div>

        {/* Access Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">کاربر</th>
                  <th className="py-3.5 px-4">نقش</th>
                  <th className="py-3.5 px-4">کارگروه</th>
                  <th className="py-3.5 px-4 text-center">سطح دسترسی</th>
                  <th className="py-3.5 px-4 text-center">وضعیت</th>
                  <th className="py-3.5 px-4">مورد نیازمند بررسی</th>
                  <th className="py-3.5 px-4 text-center">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accessTableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.user}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{row.role}</td>
                    <td className="py-3.5 px-4 text-slate-600">{row.workgroup}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">{row.accessLevel}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          row.status === 'فعال و منطبق'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-rose-700 font-medium">{row.issueDescription}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleActionClick(row.targetPage, row.user)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <span>{row.actionLabel}</span>
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. REPORT 5 — وضعیت فرآیندهای متوقف‌شده */}
      {/* ========================================================================= */}
      <section id="admin-rep5" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h2 className="text-sm font-extrabold text-slate-800">
              گزارش ۵ — وضعیت فرآیندهای متوقف‌شده
            </h2>
          </div>
          <span className="text-xs text-slate-400">رفع موانع ناشی از نقص نقش، سرپرست، دسترسی یا ساختار سازمانی</span>
        </div>

        {/* 1 KPI Card: فرآیندهای متوقف‌شده */}
        <div className="bg-gradient-to-l from-rose-500/10 via-rose-50/70 to-white rounded-2xl border border-rose-200 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-rose-800">شناسایی بن‌بست‌های گردش کار</span>
            <h3 className="text-lg font-black text-slate-900 mt-1">فرآیندهای متوقف‌شده</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              جریان‌های کاری که به علت نقص در تنظیمات سازمانی امکان ادامه ندارند
            </p>
          </div>
          <div className="flex items-baseline gap-2 bg-white px-4 py-2.5 rounded-xl border border-rose-200 shadow-2xs">
            <span className="text-3xl font-black text-rose-600 font-mono">
              {toPersianNumber(blockedProcessesCount)}
            </span>
            <span className="text-xs font-bold text-slate-500">فرآیند متوقف</span>
          </div>
        </div>

        {/* Process Status Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">فرآیند</th>
                  <th className="py-3.5 px-4">رکورد</th>
                  <th className="py-3.5 px-4">مرحله فعلی</th>
                  <th className="py-3.5 px-4">دلیل توقف</th>
                  <th className="py-3.5 px-4 text-center">مدت توقف</th>
                  <th className="py-3.5 px-4 text-center">اولویت</th>
                  <th className="py-3.5 px-4 text-center">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blockedProcessesTableData.map((proc) => (
                  <tr key={proc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{proc.processName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{proc.recordCode}</td>
                    <td className="py-3.5 px-4 text-slate-600">{proc.currentStage}</td>
                    <td className="py-3.5 px-4 text-rose-700 font-medium">{proc.blockReason}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      {proc.blockDuration}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          proc.priority === 'بالا'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {proc.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleActionClick(proc.targetPage, proc.recordCode)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>{proc.actionLabel}</span>
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. REPORT 6 — وضعیت کلی سلامت سیستم */}
      {/* ========================================================================= */}
      <section id="admin-rep6" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-extrabold text-slate-800">
              گزارش ۶ — وضعیت کلی سلامت سیستم
            </h2>
          </div>
          <span className="text-xs text-slate-400">مرور مدیریتی سلامت بخش‌های شش‌گانه پلتفرم</span>
        </div>

        {/* System Health Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">بخش سیستم</th>
                  <th className="py-3.5 px-4 text-center">وضعیت</th>
                  <th className="py-3.5 px-4">مشکل اصلی</th>
                  <th className="py-3.5 px-4 text-center">تعداد موارد</th>
                  <th className="py-3.5 px-4 text-center">اولویت</th>
                  <th className="py-3.5 px-4 text-center">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {systemHealthSections.map((sec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        <span>{sec.section}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                          sec.status === 'مناسب'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sec.status === 'نیازمند بررسی'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{sec.mainProblem}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {toPersianNumber(sec.itemsCount)} مورد
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          sec.priority === 'بالا'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : sec.priority === 'متوسط'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {sec.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleActionClick(sec.targetPage, sec.section)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>{sec.actionLabel}</span>
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
