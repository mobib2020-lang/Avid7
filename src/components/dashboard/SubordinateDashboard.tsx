import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  ChevronLeft,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Package,
  Wrench,
  DollarSign,
  ShoppingCart,
  Building,
} from 'lucide-react';
import { EquipmentItem, PurchaseRequest, FailureReport, TaskEvent, PageId, AppUser } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';

interface SubordinateDashboardProps {
  currentUser?: AppUser;
  equipmentList?: EquipmentItem[];
  purchaseRequests?: PurchaseRequest[];
  failuresList?: FailureReport[];
  tasksList?: TaskEvent[];
  setActivePage: (page: PageId) => void;
  onNavigateToInventoryWithAction?: (params: {
    initialTab?: 'drafts' | 'inventory';
    initialLayout?: 'grouped' | 'individual' | 'tree';
    initialStatusFilter?: string;
  }) => void;
}

export const SubordinateDashboard: React.FC<SubordinateDashboardProps> = ({
  currentUser,
  equipmentList = [],
  purchaseRequests = [],
  failuresList = [],
  tasksList = [],
  setActivePage,
  onNavigateToInventoryWithAction,
}) => {
  // Determine supervisor domain
  const supervisorRole = currentUser?.supervisorId || currentUser?.role;
  const isAssetDomain =
    currentUser?.role?.includes('asset') ||
    currentUser?.role?.includes('warehouse') ||
    currentUser?.role?.includes('inventory') ||
    currentUser?.supervisorId === 'asset_manager';
  const isFinanceDomain =
    currentUser?.role?.includes('finance') ||
    currentUser?.role?.includes('budget') ||
    currentUser?.role?.includes('auditor') ||
    currentUser?.supervisorId === 'finance_manager';
  const isProcurementDomain =
    currentUser?.role?.includes('procurement') ||
    currentUser?.supervisorId === 'procurement_officer';
  const isBiomedicalDomain =
    currentUser?.role?.includes('biomedical') ||
    currentUser?.role?.includes('tech') ||
    currentUser?.supervisorId === 'biomedical_engineer';

  // Role subtitle & domain label
  const domainLabel = isAssetDomain
    ? 'کارگروه مدیریت اموال و انبار'
    : isFinanceDomain
    ? 'کارگروه امور مالی و اعتبارات'
    : isProcurementDomain
    ? 'کارگروه تدارکات و خرید'
    : isBiomedicalDomain
    ? 'کارگروه مهندسی پزشکی و فنی'
    : 'کارگروه تخصصی دپارتمان';

  // Domain specific checklist
  const initialChecklist = isAssetDomain
    ? [
        { id: '1', title: 'تطبیق و پلاک‌کوبی ۲ قلم پیش‌نویس ورودی انبار مرکزی', done: false, priority: 'high' },
        { id: '2', title: 'شمارش موجودی قفسه B3 انبار مصرفی و ثبت کسری', done: true, priority: 'normal' },
        { id: '3', title: 'تکمیل فیلدهای مدل و شماره سریال دستگاه‌های بخش اطفال', done: false, priority: 'normal' },
      ]
    : isFinanceDomain
    ? [
        { id: '1', title: 'بررسی فاکتورهای تایید شده خرید تجهیزات ICU', done: false, priority: 'high' },
        { id: '2', title: 'تطبیق ردیف بودجه ارتقای هتلینگ با اسناد حسابداری', done: true, priority: 'normal' },
        { id: '3', title: 'تنظیم گزارش تفکیکی پرداختی‌های ماه گذشته به تامین‌کنندگان', done: false, priority: 'normal' },
      ]
    : isProcurementDomain
    ? [
        { id: '1', title: 'استعلام قیمت ۳ تامین‌کننده برای پدهای الکتروشوک', done: false, priority: 'high' },
        { id: '2', title: 'پیگیری ارسال بارنامه دستکش‌های جراحی استریل', done: true, priority: 'normal' },
        { id: '3', title: 'بررسی و تایید پیش‌فاکتور لوازم مصرفی آزمایشگاه', done: false, priority: 'normal' },
      ]
    : isBiomedicalDomain
    ? [
        { id: '1', title: 'آزمون کنترل کیفی و PM ونتیلاتور تخت ۲ بخش ICU', done: false, priority: 'high' },
        { id: '2', title: 'ثبت گواهی کالیبراسیون دستگاه‌های فشارسنج اورژانس', done: true, priority: 'normal' },
        { id: '3', title: 'تعویض سنسور اکسیژن الکتروشوک بخش جراحی', done: false, priority: 'normal' },
      ]
    : [
        { id: '1', title: 'بررسی وضعیت روزانه تجهیزات تحویلی', done: true, priority: 'normal' },
        { id: '2', title: 'ثبت چک‌لیست عملکرد صبحگاهی', done: false, priority: 'high' },
        { id: '3', title: 'پیگیری اقلام مصرفی مورد نیاز شیفت', done: false, priority: 'normal' },
      ];

  const [checklist, setChecklist] = useState(initialChecklist);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const completedCount = checklist.filter((c) => c.done).length;
  const totalChecklist = checklist.length;

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* ========================================================================= */}
      {/* 1. WELCOME HEADER & TODAY'S DATE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>سلام {currentUser?.name || 'همکار گرامی'}، به مرکز کنترل خوش آمدید</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            میز کار تخصصی • {domainLabel}
            {currentUser?.supervisorName && ` (سرپرست: ${currentUser.supervisorName})`}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-[#2b64f6]" />
            <span>امروز سه‌شنبه، ۲۸ مرداد ۱۴۰۵</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TODAY'S STATUS (3-4 CARDS FIT FOR SUBORDINATE ROLE) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-slate-700 tracking-wide">
            وضعیت کار امروز من
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Active Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">وظایف فعال من</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {toPersianNumber(totalChecklist - completedCount)}
              </span>
              <span className="text-xs text-slate-400">وظیفه در دست اقدام</span>
            </div>
            <span className="text-[11px] text-blue-600 font-bold mt-1 block">
              اختصاص‌یافته توسط سرپرست کارگروه
            </span>
          </div>

          {/* Card 2: Completed this week */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">تکمیل‌شده این هفته</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {toPersianNumber(8)}
              </span>
              <span className="text-xs text-slate-400">مورد موفق</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
              عملکرد ۹۴٪ در مهلت تعیین‌شده
            </span>
          </div>

          {/* Card 3: Action items in specialized domain */}
          <div
            onClick={() => {
              if (isAssetDomain) {
                if (onNavigateToInventoryWithAction) {
                  onNavigateToInventoryWithAction({ initialTab: 'drafts' });
                } else {
                  setActivePage('inventory');
                }
              } else if (isFinanceDomain || isProcurementDomain) {
                setActivePage('purchase_requests');
              } else if (isBiomedicalDomain) {
                setActivePage('failures');
              } else {
                setActivePage('tasks');
              }
            }}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">اقدام منتظر من در حوزه</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                {isAssetDomain ? (
                  <Package className="w-4 h-4" />
                ) : isFinanceDomain ? (
                  <DollarSign className="w-4 h-4" />
                ) : isProcurementDomain ? (
                  <ShoppingCart className="w-4 h-4" />
                ) : (
                  <Wrench className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 font-mono">
                {toPersianNumber(2)}
              </span>
              <span className="text-xs text-slate-400">سند منتظر</span>
            </div>
            <span className="text-[11px] text-amber-700 font-bold mt-1 block">
              نیازمند اقدام مستقیم شما
            </span>
          </div>

          {/* Card 4: Overdue / Urgent */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">موارد فوری شخصی</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 font-mono">
                {toPersianNumber(1)}
              </span>
              <span className="text-xs text-slate-400">مورد فوری</span>
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-1 block">
              سررسید تا پایان شیفت امروز
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TODAY'S TASKS & WORKGROUP SUMMARY (NO HEAVY CHARTS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Checklist & Assigned Tasks (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#2b64f6]" />
              <h3 className="text-sm font-black text-slate-900">کارهای امروز من در {domainLabel}</h3>
            </div>
            <span className="text-xs text-slate-400">
              {toPersianNumber(completedCount)} از {toPersianNumber(totalChecklist)} تکمیل شده
            </span>
          </div>

          <div className="space-y-2.5">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.done
                    ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through'
                    : 'bg-white border-slate-200/90 hover:border-blue-300 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      item.done
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {item.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-bold">{item.title}</span>
                </div>
                {item.priority === 'high' && !item.done && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-bold shrink-0 no-underline">
                    اولویت بالا
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Action guidance button */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              برای مدیریت و پیگیری جزئیات بیشتر به ماژول تخصصی مراجعه کنید.
            </span>
            <button
              type="button"
              onClick={() => {
                if (isAssetDomain) {
                  setActivePage('inventory');
                } else if (isFinanceDomain || isProcurementDomain) {
                  setActivePage('purchase_requests');
                } else if (isBiomedicalDomain) {
                  setActivePage('failures');
                } else {
                  setActivePage('tasks');
                }
              }}
              className="text-xs font-bold text-[#2b64f6] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>ورود به ماژول تخصصی</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Workgroup Summary & Reminders (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Layers className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-black text-slate-900">خلاصه وضعیت کارگروه</h3>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>هماهنگی با سرپرست</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              کلیه اسناد و وظایف ثبت‌شده توسط شما مستقیماً در کارتابل سرپرست کارگروه منعکس می‌شود.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs font-bold text-slate-800 block">یادآوری شیفت کاری</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                قبل از اتمام شیفت، چک‌لیست روزانه را نهایی و ذخیره نمایید.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
              <span className="text-xs font-bold text-blue-900 block">پشتیبانی و راهنمایی</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                در صورت بروز ابهام در تکمیل فیلدهای ساختار اموال با سرپرست هماهنگ فرمایید.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
