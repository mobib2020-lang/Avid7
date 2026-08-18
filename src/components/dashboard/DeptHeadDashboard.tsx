import React from 'react';
import {
  Users,
  Clock,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  Sparkles,
  ChevronLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  AlertCircle,
  BarChart2,
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
import { EquipmentItem, PurchaseRequest, FailureReport, TaskEvent, PageId, AppUser } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';

interface DeptHeadDashboardProps {
  currentUser?: AppUser;
  usersList?: AppUser[];
  equipmentList: EquipmentItem[];
  purchaseRequests?: PurchaseRequest[];
  failuresList?: FailureReport[];
  tasksList?: TaskEvent[];
  setActivePage: (page: PageId) => void;
}

export const DeptHeadDashboard: React.FC<DeptHeadDashboardProps> = ({
  currentUser,
  usersList = [],
  equipmentList = [],
  purchaseRequests = [],
  failuresList = [],
  tasksList = [],
  setActivePage,
}) => {
  const deptName = currentUser?.department || 'مراقبت‌های ویژه (ICU)';

  // 1. Active Team Members in Department
  const deptMembers = usersList.filter(
    (u) => u.department === deptName || u.department?.includes('ICU') || u.department?.includes('ویژه')
  );
  const activeMembersCount = deptMembers.length || 5;

  // 2. Overdue Tasks in Department
  const deptOverdueTasks = tasksList.filter(
    (t) => (t.assigneeDepartment === deptName || t.department === deptName) && t.status !== 'completed'
  );
  const overdueCount = deptOverdueTasks.length || 2;

  // 3. Department Purchase Requests
  const deptRequests = purchaseRequests.filter(
    (r) => r.department === deptName || r.department?.includes('ICU') || r.department?.includes('ویژه')
  );
  const deptRequestsCount = deptRequests.length || 3;

  // 4. Department Open Failures
  const deptFailures = failuresList.filter(
    (f) => f.department === deptName || f.department?.includes('ICU') || f.department?.includes('ویژه')
  );
  const deptFailuresCount = deptFailures.length || 2;

  // Main Chart: Department Performance (Simple Bar Chart - limited key indicators)
  const performanceData = [
    { شاخص: 'تکمیل وظایف', درصد: 88, fill: '#10b981' },
    { شاخص: 'تکمیل اطلاعات', درصد: 92, fill: '#0284c7' },
    { شاخص: 'رسیدگی به درخواست‌ها', درصد: 78, fill: '#f59e0b' },
    { شاخص: 'رسیدگی به خرابی‌ها', درصد: 84, fill: '#6366f1' },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* ========================================================================= */}
      {/* 1. WELCOME HEADER & TODAY'S DATE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>سلام {currentUser?.name || 'رئیس دپارتمان'}، به مرکز کنترل خوش آمدید</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            مرکز کنترل روزانه • مدیریت و پایش عملکرد دپارتمان {deptName}
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
            وضعیت امروز دپارتمان {deptName}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Active Members */}
          <div
            onClick={() => setActivePage('users')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">اعضای فعال دپارتمان</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {toPersianNumber(activeMembersCount)}
              </span>
              <span className="text-xs text-slate-400">نفر پرسنل فعال</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
              در حال فعالیت در شیفت‌های کاری
            </span>
          </div>

          {/* Card 2: Overdue Tasks */}
          <div
            onClick={() => setActivePage('tasks')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">وظایف عقب‌افتاده</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 font-mono">
                {toPersianNumber(overdueCount)}
              </span>
              <span className="text-xs text-slate-400">وظیفه تأخیردار</span>
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-1 block">
              نیازمند پیگیری از اعضای بخش
            </span>
          </div>

          {/* Card 3: Purchase Requests */}
          <div
            onClick={() => setActivePage('purchase_requests')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">درخواست‌های خرید بخش</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 font-mono">
                {toPersianNumber(deptRequestsCount)}
              </span>
              <span className="text-xs text-slate-400">درخواست فعال</span>
            </div>
            <span className="text-[11px] text-amber-700 font-bold mt-1 block">
              در جریان تایید مالی و تامین
            </span>
          </div>

          {/* Card 4: Open Failures */}
          <div
            onClick={() => setActivePage('failures')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">خرابی‌های باز دپارتمان</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 font-mono">
                {toPersianNumber(deptFailuresCount)}
              </span>
              <span className="text-xs text-slate-400">دستگاه در تعمیر</span>
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-1 block">
              تحت اقدام مهندسی پزشکی
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIMARY CHART: DEPARTMENT PERFORMANCE (SIMPLE BAR CHART) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              عملکرد دپارتمان {deptName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              شاخص‌های کلیدی انطباق، سرعت رسیدگی و تکمیل فرایندهای دپارتمان
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            میانگین عملکرد کلی: ۸۶٪
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="شاخص" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '11px',
                }}
                formatter={(value: any) => [`${toPersianNumber(value)}٪`, 'نرخ انطباق']}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Bar dataKey="درصد" radius={[8, 8, 0, 0]} barSize={40}>
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. NEEDS ATTENTION & OVERALL SUMMARY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Needs Attention (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900">نیازمند توجه رئیس دپارتمان</h3>
            </div>
            <span className="text-xs text-slate-400">
              {toPersianNumber(3)} مورد مهم
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Attention Item 1: Overdue member task */}
            <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-900">
                    اعضای دارای وظیفه عقب‌افتاده در بخش
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-bold">
                    پیگیری پرسنل
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  ۲ چک‌لیست ثبت عملکرد هفتگی دستگاه‌ها توسط پرسنل شیفت عصر ثبت نشده است.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('tasks')}
                className="shrink-0 text-xs font-bold text-rose-700 bg-white border border-rose-200 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>مشاهده وظایف</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Attention Item 2: Prolonged Failure */}
            <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900">
                    خرابی طولانی‌مدت دستگاه حیاتی
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold">
                    تخت ۳ ICU
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  ونتیلاتور تخت ۳ بیش از ۴ روز است که در انتظار دریافت قطعه در مهندسی پزشکی است.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('failures')}
                className="shrink-0 text-xs font-bold text-amber-800 bg-white border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>پیگیری خرابی</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Attention Item 3: In progress purchase requests */}
            <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-900">
                    درخواست‌های خرید در جریان دپارتمان
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                    تدارکات
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  درخواست خرید پدهای الکترود اکسترنال در سبد تدارکات تایید شده و فردا تحویل می‌شود.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('purchase_requests')}
                className="shrink-0 text-xs font-bold text-[#2b64f6] bg-white border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>پیگیری خریدها</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Overall Department Status Summary (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-black text-slate-900">وضعیت کلی دپارتمان</h3>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>خلاصه پایش هفتگی</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              دپارتمان با ۹۲٪ آمادگی تجهیزات در وضعیت پایدار قرار دارد. ظرفیت تخت‌های بخش تحت پوشش کامل دستگاه‌های پایش علائم حیاتی است.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">پوشش کالیبراسیون تجهیزات</span>
              <span className="font-bold text-slate-800 font-mono">۹۴٪</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">سرعت رسیدگی به خرابی‌ها</span>
              <span className="font-bold text-slate-800 font-mono">۱.۸ روز</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500">تطابق موجودی مصرفی انبار</span>
              <span className="font-bold text-emerald-600 font-mono">۱۰۰٪</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
