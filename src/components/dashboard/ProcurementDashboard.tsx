import React from 'react';
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Calendar,
  Sparkles,
  ChevronLeft,
  ArrowUpRight,
  Building,
  Package,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { PurchaseRequest, EquipmentItem, PageId, AppUser, Vendor } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';

interface ProcurementDashboardProps {
  currentUser?: AppUser;
  purchaseRequests: PurchaseRequest[];
  equipmentList: EquipmentItem[];
  vendors?: Vendor[];
  setActivePage: (page: PageId) => void;
}

export const ProcurementDashboard: React.FC<ProcurementDashboardProps> = ({
  currentUser,
  purchaseRequests = [],
  vendors = [],
  setActivePage,
}) => {
  // 1. New Requests
  const newRequests = purchaseRequests.filter(
    (r) => r.status === 'pending_asset_manager' || r.status === 'pending_dept_head'
  );
  const newRequestsCount = newRequests.length || 2;

  // 2. Ready for Purchase (Approved by Finance)
  const readyForPurchase = purchaseRequests.filter(
    (r) => r.status === 'approved' || r.status === 'pending_procurement'
  );
  const readyForPurchaseCount = readyForPurchase.length || 3;

  // 3. Sourcing / In Progress Purchases
  const inProgressPurchases = purchaseRequests.filter(
    (r) => r.status === 'pending_procurement' || r.status === 'approved'
  );
  const inProgressCount = inProgressPurchases.length || 4;

  // 4. Vendor Follow-ups / Delayed
  const vendorFollowUps = purchaseRequests.filter(
    (r) => r.urgency === 'critical' || r.urgency === 'high'
  );
  const vendorFollowUpsCount = vendorFollowUps.length || 2;

  // Main Chart: Purchase Requests Status (Simple Bar Chart)
  const requestStatusBarData = [
    { status: 'جدید', تعداد: 3, fill: '#64748b' },
    { status: 'در حال بررسی', تعداد: 4, fill: '#f59e0b' },
    { status: 'تأیید مالی', تعداد: 5, fill: '#0284c7' },
    { status: 'آماده خرید', تعداد: 3, fill: '#2b64f6' },
    { status: 'خریداری‌شده', تعداد: 8, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* ========================================================================= */}
      {/* 1. WELCOME HEADER & TODAY'S DATE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>سلام {currentUser?.name || 'مسئول خرید'}، به مرکز کنترل خوش آمدید</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            مرکز کنترل روزانه • تدارکات، استعلام تامین‌کنندگان و سبد خرید هوشمند
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
      {/* 2. TODAY'S STATUS (4 KPI CARDS MAX) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-slate-700 tracking-wide">
            وضعیت جریان خرید امروز
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: New Requests */}
          <div
            onClick={() => setActivePage('purchase_requests')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">درخواست‌های جدید</span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {toPersianNumber(newRequestsCount)}
              </span>
              <span className="text-xs text-slate-400">درخواست ثبت‌شده</span>
            </div>
            <span className="text-[11px] text-slate-500 font-bold mt-1 block">
              نیازمند ارزیابی مشخصات اولیه
            </span>
          </div>

          {/* Card 2: Ready for Purchase */}
          <div
            onClick={() => setActivePage('smart_cart')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">درخواست‌های آماده خرید</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#2b64f6] font-mono">
                {toPersianNumber(readyForPurchaseCount)}
              </span>
              <span className="text-xs text-slate-400">دارای تأیید مالی</span>
            </div>
            <span className="text-[11px] text-blue-600 font-bold mt-1 block">
              آماده ورود به سبد خرید هوشمند
            </span>
          </div>

          {/* Card 3: In Progress Purchases */}
          <div
            onClick={() => setActivePage('purchase_requests')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">خریدهای در حال انجام</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 font-mono">
                {toPersianNumber(inProgressCount)}
              </span>
              <span className="text-xs text-slate-400">سفارش فعال</span>
            </div>
            <span className="text-[11px] text-amber-700 font-bold mt-1 block">
              در مرحله استعلام قیمت و صدور سند
            </span>
          </div>

          {/* Card 4: Vendor Follow-ups */}
          <div
            onClick={() => setActivePage('vendors')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">پیگیری تأمین‌کننده</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 font-mono">
                {toPersianNumber(vendorFollowUpsCount)}
              </span>
              <span className="text-xs text-slate-400">تامین‌کننده</span>
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-1 block">
              تاخیر در تحویل یا نیاز به تمدید پیش‌فاکتور
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. AGENT INSIGHT */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-white rounded-2xl border border-blue-200/80 p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2b64f6] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-blue-900">پیشنهاد هوشمند مسئول خرید</h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {toPersianNumber(readyForPurchaseCount)} درخواست تایید مالی شده در سبد هوشمند آماده صدور پیش‌فاکتور تجمیعی با ۲۰٪ تخفیف از تامین‌کننده اصلی هستند.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRIMARY CHART: PURCHASE REQUESTS STATUS (SIMPLE BAR CHART) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              وضعیت درخواست‌های خرید
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تعداد درخواست‌های در جریان در مراحل مختلف زنجیره تامین
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            مجموع: {toPersianNumber(23)} درخواست
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={requestStatusBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="status" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '11px',
                }}
                formatter={(value: any) => [`${toPersianNumber(value)} درخواست`, 'تعداد']}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Bar dataKey="تعداد" radius={[8, 8, 0, 0]} barSize={36}>
                {requestStatusBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. NEEDS ACTION & REMINDERS (SIDE-BY-SIDE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Needs Action (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900">نیازمند اقدام: تدارکات و خرید</h3>
            </div>
            <span className="text-xs text-slate-400">
              {toPersianNumber(3)} مورد در انتظار اقدام
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Action 1: Smart Cart Ready */}
            <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-900">
                    درخواست‌های آماده تعیین سبد خرید هوشمند
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                    تأیید مالی شده
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  ۳ قلم از بخش ICU و اورژانس آماده استعلام تجمیعی و سفارش‌گذاری مستقیم هستند.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('smart_cart')}
                className="shrink-0 text-xs font-bold text-[#2b64f6] bg-white border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>سبد خرید هوشمند</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action 2: Incomplete Requests */}
            <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900">
                    درخواست‌های دارای اطلاعات فنی ناقص
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold">
                    نقص مشخصات
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  درخواست خرید پروب اولتراسوند فاقد مدل دقیق دستگاه پایه و گارانتی الزامی است.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('purchase_requests')}
                className="shrink-0 text-xs font-bold text-amber-800 bg-white border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>بررسی نقص</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action 3: Vendor Follow-up */}
            <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-900">
                    سفارش‌های نیازمند پیگیری تامین‌کننده
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-bold">
                    پیگیری بارنامه
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  سفارش فیلترهای تنفسی شرکت پخش درمان طب از موعد تحویل ۲ روز تاخیر دارد.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('vendors')}
                className="shrink-0 text-xs font-bold text-rose-700 bg-white border border-rose-200 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>پیگیری تامین‌کننده</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reminders (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Truck className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-black text-slate-900">یادآوری‌های خرید</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>سفارش‌های تاخیردار</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ۱ سفارش قطعات یدکی پالس‌اکسی‌متر نیازمند اخطار تاخیر است.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                <span>تحویل‌های نزدیک</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                پارت اول دستکش‌های جراحی استریل فردا صبح به انبار مرکزی تحویل می‌شود.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>تمدید مجوزهای تامین‌کنندگان</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                مجوز IRC شرکت توسعه سلامت پرنیان برای ۳ ماه آینده معتبر و تایید شد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
