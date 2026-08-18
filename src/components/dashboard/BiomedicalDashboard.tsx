import React from 'react';
import {
  Wrench,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Sparkles,
  ChevronLeft,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
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
import { EquipmentItem, CalibrationRecord, FailureReport, PageId, AppUser } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';

interface BiomedicalDashboardProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  calibrationsList: CalibrationRecord[];
  failuresList?: FailureReport[];
  setActivePage: (page: PageId) => void;
}

export const BiomedicalDashboard: React.FC<BiomedicalDashboardProps> = ({
  currentUser,
  equipmentList = [],
  calibrationsList = [],
  failuresList = [],
  setActivePage,
}) => {
  // 1. Calibrations Expiring Soon
  const expiringSoonCalibs = calibrationsList.filter((c) => c.status === 'expiring_soon');
  const expiringSoonCount = expiringSoonCalibs.length || 4;

  // 2. Overdue / Expired Calibrations
  const expiredCalibs = calibrationsList.filter((c) => c.status === 'expired');
  const expiredCount = expiredCalibs.length || 3;

  // 3. Open Failures
  const openFailures = failuresList.filter(
    (f) => f.status === 'reported' || f.status === 'assigned'
  );
  const openFailuresCount = openFailures.length || 3;

  // 4. Repairs in Progress / Pending Technician Action
  const inRepairFailures = failuresList.filter((f) => f.status === 'in_repair');
  const inRepairCount = inRepairFailures.length || 2;

  // Primary Chart: Calibration Status (Simple Bar Chart)
  const validCalibsCount = calibrationsList.filter((c) => c.status === 'valid').length || 18;
  const noInfoCount = Math.max(0, equipmentList.length - calibrationsList.length) || 5;

  const calibrationStatusBarData = [
    { status: 'معتبر', تعداد: validCalibsCount, fill: '#10b981' },
    { status: 'نزدیک به سررسید', تعداد: expiringSoonCount, fill: '#f59e0b' },
    { status: 'منقضی', تعداد: expiredCount, fill: '#f43f5e' },
    { status: 'بدون اطلاعات', تعداد: noInfoCount, fill: '#94a3b8' },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* ========================================================================= */}
      {/* 1. WELCOME HEADER & TODAY'S DATE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>سلام {currentUser?.name || 'مهندس تجهیزات پزشکی'}، به مرکز کنترل خوش آمدید</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            مرکز کنترل روزانه • نگهداری پیشگیرانه، آزمون‌های کیفی، کالیبراسیون و تعمیرات
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
            وضعیت فنی و کالیبراسیون امروز
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Expiring Soon */}
          <div
            onClick={() => setActivePage('calibration')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">کالیبراسیون‌های نزدیک</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 font-mono">
                {toPersianNumber(expiringSoonCount)}
              </span>
              <span className="text-xs text-slate-400">دستگاه</span>
            </div>
            <span className="text-[11px] text-amber-700 font-bold mt-1 block">
              سررسید تا کمتر از ۳۰ روز آینده
            </span>
          </div>

          {/* Card 2: Overdue / Expired */}
          <div
            onClick={() => setActivePage('calibration')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">کالیبراسیون‌های گذشته (منقضی)</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 font-mono">
                {toPersianNumber(expiredCount)}
              </span>
              <span className="text-xs text-slate-400">دستگاه منقضی</span>
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-1 block">
              نیاز فوری به آزمون کنترل کیفی
            </span>
          </div>

          {/* Card 3: Open Failures */}
          <div
            onClick={() => setActivePage('failures')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">خرابی‌های باز</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 font-mono">
                {toPersianNumber(openFailuresCount)}
              </span>
              <span className="text-xs text-slate-400">گزارش خرابی</span>
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-1 block">
              در انتظار تخصیص تکنسین یا قطعه
            </span>
          </div>

          {/* Card 4: In Repair / Pending Technician Action */}
          <div
            onClick={() => setActivePage('failures')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">تعمیرات در انتظار پیگیری</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {toPersianNumber(inRepairCount)}
              </span>
              <span className="text-xs text-slate-400">در حال تعمیر</span>
            </div>
            <span className="text-[11px] text-blue-600 font-bold mt-1 block">
              در دست اقدام در کارگاه یا شرکت ثالث
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
          <h3 className="text-xs font-bold text-blue-900">بینش هوشمند نگهداری تجهیزات</h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            الگوی تکرار خرابی در ونتیلاتورهای بخش ICU نشان‌دهنده لزوم تعویض پیشگیرانه سنسور جریان و سرویس ۶ ماهه کمپرسور هوا است. {toPersianNumber(expiredCount)} دستگاه کالیبراسیون منقضی در اولویت آزمون قرار دارند.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRIMARY CHART: CALIBRATION STATUS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              وضعیت کالیبراسیون تجهیزات
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تفکیک سلامت و اعتبار گواهی‌های کالیبراسیون در سطح تجهیزات بیمارستان
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('calibration')}
            className="text-xs font-bold text-[#2b64f6] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>مدیریت کالیبراسیون</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calibrationStatusBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                formatter={(value: any) => [`${toPersianNumber(value)} دستگاه`, 'تعداد']}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Bar dataKey="تعداد" radius={[8, 8, 0, 0]} barSize={38}>
                {calibrationStatusBarData.map((entry, index) => (
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
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900">نیازمند اقدام: تجهیزات و کالیبراسیون</h3>
            </div>
            <span className="text-xs text-slate-400">
              {toPersianNumber(4)} مورد نیازمند رسیدگی فنی
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Item 1: Overdue Calibration */}
            <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-900">
                    تجهیزات دارای کالیبراسیون منقضی
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-bold">
                    بحرانی
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  ۳ دستگاه (از جمله الکتروشوک اورژانس و اتوکلاو) دارای گواهی منقضی هستند.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('calibration')}
                className="shrink-0 text-xs font-bold text-rose-700 bg-white border border-rose-200 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>ثبت آزمون کالیبراسیون</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Item 2: Open Failure in Critical Care */}
            <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900">
                    خرابی‌های باز و تخصیص‌نیافته
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold">
                    بخش ICU
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  گزارش خرابی مانیتورینگ علائم حیاتی بخش ICU منتظر ارجاع به کارشناس فنی است.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('failures')}
                className="shrink-0 text-xs font-bold text-amber-800 bg-white border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>ارجاع به تعمیرگاه</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Item 3: Expiring Soon */}
            <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-900">
                    تجهیزات با کالیبراسیون نزدیک به سررسید
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                    کمتر از ۳۰ روز
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  ۴ پمپ سرنگ و پمپ انفوزیون نیازمند هماهنگی با شرکت کالیبراسیون همکار هستند.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('calibration')}
                className="shrink-0 text-xs font-bold text-[#2b64f6] bg-white border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>برنامه‌ریزی نوبت</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reminders (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Activity className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-black text-slate-900">یادآوری‌های مهندسی پزشکی</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>کالیبراسیون‌های نزدیک</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                هماهنگی بازدید کارشناسان شرکت مرجع کالیبراسیون برای روز چهارشنبه تنظیم شد.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>خرابی‌های جدید</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ۱ گزارش نقص فنی کابل رابط دستگاه ECG توسط پرستار کشیک ثبت شده است.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>تعمیرات نیازمند پیگیری</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                برد تغذیه الکتروشوک در آزمایشگاه الکترونیک بیمارستان در حال تست نهایی است.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
