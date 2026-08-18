import React, { useState } from 'react';
import {
  CheckSquare,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ChevronLeft,
  Activity,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { EquipmentItem, PurchaseRequest, FailureReport, PageId, AppUser } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';

interface OperatorDashboardProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  purchaseRequests?: PurchaseRequest[];
  failuresList?: FailureReport[];
  setActivePage: (page: PageId) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  currentUser,
  equipmentList = [],
  purchaseRequests = [],
  failuresList = [],
  setActivePage,
}) => {
  // Checklist interactive state
  const [checklist, setChecklist] = useState([
    { id: '1', title: 'چک عملکرد و باتری ونتیلاتور تخت ۱ تا ۴ بخش ICU', done: true, time: '۰۸:۳۰' },
    { id: '2', title: 'بررسی سلامت اتصالات و پروب مانیتورینگ علائم حیاتی', done: true, time: '۰۹:۱۵' },
    { id: '3', title: 'ثبت چک‌لیست روزانه تمیزکاری و ضدعفونی پمپ سرنگ', done: false, time: '۱۱:۰۰' },
    { id: '4', title: 'تحویل اقلام مصرفی و ست تزریق از انبار بخش', done: false, time: '۱۳:۰۰' },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  // 1. Today's Tasks
  const todayTasksCount = checklist.length;
  const completedTasksCount = checklist.filter((c) => c.done).length;

  // 2. My Purchase Requests
  const myRequests = purchaseRequests.filter(
    (r) => r.requesterId === currentUser?.id || r.department === (currentUser?.department || 'ICU')
  );
  const myRequestsCount = myRequests.length || 2;

  // 3. My Failure Reports
  const myFailures = failuresList.filter(
    (f) => f.reporterId === currentUser?.id || f.department === (currentUser?.department || 'ICU')
  );
  const myFailuresCount = myFailures.length || 1;

  // Equipment in use by this operator / department
  const userDept = currentUser?.department || 'مراقبت‌های ویژه (ICU)';
  const deptEquipment = equipmentList.filter(
    (e) => !e.isDraft && (e.department?.includes('ICU') || e.department?.includes('ویژه') || e.department === userDept)
  ).slice(0, 4);

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* ========================================================================= */}
      {/* 1. WELCOME HEADER & TODAY'S DATE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>سلام {currentUser?.name || 'همکار گرامی'}، به مرکز کنترل روزانه خوش آمدید</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            میز کار عملیاتی • {userDept}
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
      {/* 2. TODAY'S STATUS (3 MAIN CARDS ONLY - NO COMPLICATED ANALYTICS) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-slate-700 tracking-wide">
            وضعیت کار امروز من
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Today's Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">وظایف و چک‌لیست امروز</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {toPersianNumber(completedTasksCount)} / {toPersianNumber(todayTasksCount)}
              </span>
              <span className="text-xs text-slate-400">مورد انجام‌شده</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
              {toPersianNumber(todayTasksCount - completedTasksCount)} مورد باقی‌مانده برای شیفت امروز
            </span>
          </div>

          {/* Card 2: My Purchase Requests */}
          <div
            onClick={() => setActivePage('purchase_requests')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">درخواست‌های خرید من</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 font-mono">
                {toPersianNumber(myRequestsCount)}
              </span>
              <span className="text-xs text-slate-400">درخواست در جریان</span>
            </div>
            <span className="text-[11px] text-amber-700 font-bold mt-1 block">
              در حال بررسی توسط مسئول خرید و مالی
            </span>
          </div>

          {/* Card 3: My Failure Reports */}
          <div
            onClick={() => setActivePage('failures')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">گزارش‌های خرابی ثبت‌شده</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 font-mono">
                {toPersianNumber(myFailuresCount)}
              </span>
              <span className="text-xs text-slate-400">گزارش فعال</span>
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-1 block">
              ارجاع‌شده به کارشناس مهندسی پزشکی
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TODAY'S WORK & CHECKLIST (MAIN WORK SECTION) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Checklist & Priority Tasks (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#2b64f6]" />
              <h3 className="text-sm font-black text-slate-900">کارهای امروز من و چک‌لیست شیفت</h3>
            </div>
            <span className="text-xs text-slate-400">
              {toPersianNumber(completedTasksCount)} از {toPersianNumber(todayTasksCount)} تکمیل شده
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
                <span className="text-[11px] font-mono text-slate-400 shrink-0 font-normal no-underline">
                  ساعت {toPersianNumber(item.time)}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Action Item */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-xs text-slate-700">
                <strong className="text-amber-900 font-bold block">اقدام فوری امروز:</strong>
                تست و تایید سلامت الکتروشوک سیار بخش ICU پیش از پایان شیفت کاری
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('failures')}
              className="shrink-0 text-xs font-bold bg-white border border-amber-300 text-amber-800 px-3 py-1.5 rounded-xl hover:bg-amber-50 cursor-pointer"
            >
              ثبت وضعیت
            </button>
          </div>
        </div>

        {/* Personal Reminders / Alerts (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <HeartPulse className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-black text-slate-900">هشدارهای بخش من</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>دستگاه‌های آماده به کار</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                کلیه ونتیلاتورهای فعال بخش تست اولیه صبحگاهی را با موفقیت پاس کردند.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>پیگیری خرابی ثبت‌شده</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                تعمیر کابل مانیتورینگ علائم حیاتی توسط کارشناس در حال انجام است.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <ShoppingCart className="w-3.5 h-3.5 text-[#2b64f6]" />
                <span>درخواست مصرفی</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                درخواست دستکش استریل و لوله تراشه در سبد تدارکات تایید شد.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EQUIPMENT & ITEMS IN USE (EQUIPMENT UNDER MY CARE) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-black text-slate-900">
              تجهیزات و اقلام تحت استفاده در {userDept}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePage('failures')}
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ثبت گزارش خرابی</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage('purchase_requests')}
              className="text-xs font-bold text-[#2b64f6] hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ثبت درخواست خرید</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {deptEquipment.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3 hover:bg-white hover:border-slate-300 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {item.code || 'بدون کد'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.status === 'active' || item.status === 'in_use'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.status === 'under_maintenance'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.status === 'active' || item.status === 'in_use'
                      ? 'آماده به کار'
                      : item.status === 'under_maintenance'
                      ? 'در حال تعمیر'
                      : 'موجود در انبار'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-1">
                  {item.faName}
                </h4>
                <p className="text-[11px] text-slate-500">
                  مدل: {item.model || 'استاندارد'} • {item.brand || 'عمومی'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  اتاق: {item.roomNumber || 'تخت ۱'}
                </span>
                <button
                  type="button"
                  onClick={() => setActivePage('failures')}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  اعلام نقص
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
