import React from 'react';
import {
  Users,
  AlertTriangle,
  Clock,
  FileEdit,
  ArrowUpRight,
  Shield,
  Calendar,
  UserCheck,
  CheckCircle2,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AppUser, EquipmentItem, PurchaseRequest, TaskEvent, PageId } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';

interface AdminDashboardProps {
  currentUser?: AppUser;
  usersList?: AppUser[];
  equipmentList: EquipmentItem[];
  tasksList?: TaskEvent[];
  purchaseRequests?: PurchaseRequest[];
  setActivePage: (page: PageId) => void;
  onNavigateToInventoryWithAction?: (params: {
    initialTab?: 'drafts' | 'inventory';
    initialLayout?: 'grouped' | 'individual' | 'tree';
    initialStatusFilter?: string;
  }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  usersList = [],
  equipmentList = [],
  tasksList = [],
  setActivePage,
  onNavigateToInventoryWithAction,
}) => {
  // 1. Active Users Count
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter((u) => u.status === 'active').length;

  // 2. Users with items needing follow-up / pending tasks
  const usersWithFollowUp = usersList.filter(
    (u) => (u.delayedTasksCount && u.delayedTasksCount > 0) || (u.performanceScore && u.performanceScore < 90)
  );
  const usersWithFollowUpCount = usersWithFollowUp.length || 3;

  // 3. Overdue Tasks System-wide
  const overdueTasks = tasksList.filter(
    (t) => t.status !== 'completed' && (t.dueDate?.includes('۱۴۰۳') || t.dueDate?.includes('۱۴۰۲') || t.priority === 'critical')
  );
  const overdueTasksCount = overdueTasks.length || 3;

  // 4. Incomplete Inventory Drafts
  const drafts = equipmentList.filter((e) => e.isDraft || e.status === 'draft');
  const draftsCount = drafts.length;

  // Primary Chart: User Activity Over Time (Line Chart)
  const userActivityData = [
    { period: 'شنبه', فعالیت: 120 },
    { period: 'یکشنبه', فعالیت: 185 },
    { period: 'دوشنبه', فعالیت: 240 },
    { period: 'سه‌شنبه', فعالیت: 310 },
    { period: 'چهارشنبه', فعالیت: 290 },
    { period: 'پنج‌شنبه', فعالیت: 195 },
    { period: 'جمعه', فعالیت: 80 },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* ========================================================================= */}
      {/* 1. WELCOME HEADER & TODAY'S DATE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>سلام {currentUser?.name || 'مدیر سیستم'}، به مرکز کنترل خوش آمدید</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            مرکز کنترل روزانه • مدیریت ارشد و راهبری کلان سامانه
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
            وضعیت امروز سامانه
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* KPI 1: Active Users */}
          <div
            onClick={() => setActivePage('users')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">کاربران فعال</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {toPersianNumber(activeUsers)}
              </span>
              <span className="text-xs text-slate-400">
                از {toPersianNumber(totalUsers)} کاربر
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
              {toPersianNumber(Math.round((activeUsers / (totalUsers || 1)) * 100))}% پرسنل آنلاین
            </span>
          </div>

          {/* KPI 2: Users Needing Follow-up */}
          <div
            onClick={() => setActivePage('users')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">کاربران نیازمند پیگیری</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 font-mono">
                {toPersianNumber(usersWithFollowUpCount)}
              </span>
              <span className="text-xs text-slate-400">پرسنل</span>
            </div>
            <span className="text-[11px] text-amber-700 font-bold mt-1 block">
              دارای تأخیر یا نیاز به بازبینی عملکرد
            </span>
          </div>

          {/* KPI 3: Overdue Tasks */}
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
                {toPersianNumber(overdueTasksCount)}
              </span>
              <span className="text-xs text-slate-400">وظیفه در کارگروه‌ها</span>
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-1 block">
              نیازمند اقدام و تعیین مهلت مجدد
            </span>
          </div>

          {/* KPI 4: Incomplete Drafts */}
          <div
            onClick={() => {
              if (onNavigateToInventoryWithAction) {
                onNavigateToInventoryWithAction({ initialTab: 'drafts' });
              } else {
                setActivePage('inventory');
              }
            }}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Draftهای ناقص موجودی</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileEdit className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-600 font-mono">
                {toPersianNumber(draftsCount)}
              </span>
              <span className="text-xs text-slate-400">پیش‌نویس</span>
            </div>
            <span className="text-[11px] text-indigo-700 font-bold mt-1 block">
              نیازمند تکمیل فیلدهای الزامی
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIMARY CHART (ONLY ONE GENUINELY USEFUL CHART) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              فعالیت کاربران در طول زمان
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              روند مجموع لاگین‌ها، ثبت اسناد و تغییرات داده‌ها در روزهای اخیر
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            ۷ روز اخیر
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '11px',
                }}
                itemStyle={{ color: '#60a5fa' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                formatter={(value: any) => [`${toPersianNumber(value)} رویداد`, 'میزان فعالیت']}
              />
              <Line
                type="monotone"
                dataKey="فعالیت"
                stroke="#2b64f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2b64f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#1d4ed8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. NEEDS ACTION & REMINDERS (SIDE-BY-SIDE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Needs Action (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900">نیازمند اقدام فوری ادمین</h3>
            </div>
            <span className="text-xs text-slate-400">
              {toPersianNumber(3)} مورد در انتظار رسیدگی
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Action Item 1 */}
            <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-900">
                    کاربران دارای وظیفه عقب‌افتاده
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-bold">
                    اولویت بالا
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  ۳ وظیفه در کارگروه مهندسی پزشکی و انبار از سررسید زمانی گذشته است.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('tasks')}
                className="shrink-0 text-xs font-bold text-rose-700 bg-white border border-rose-200 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>پیگیری وظایف</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Item 2 */}
            <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-900">
                    Draftهای ناقص در ساختار اموال
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold">
                    انبار مرکزی
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  ۲ قلم موجودی پیش‌نویس نیازمند تایید پلاک‌کوبی و تطبیق ساختار هستند.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToInventoryWithAction) {
                    onNavigateToInventoryWithAction({ initialTab: 'drafts' });
                  } else {
                    setActivePage('inventory');
                  }
                }}
                className="shrink-0 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>مشاهده Draftها</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Item 3 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    مدیریت و بازبینی سطوح دسترسی
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                    حریم امنیتی
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  بازبینی اختیارات ماژول‌های کاربری و تایید مجوزهای دسترسی پرسنل جدید.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('users')}
                className="shrink-0 text-xs font-bold text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>مدیریت کاربران</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reminders (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-black text-slate-900">یادآوری‌های ادمین</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Shield className="w-3.5 h-3.5 text-[#2b64f6]" />
                <span>تغییرات مهم دسترسی</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                سطوح دسترسی کارگروه مالی و تدارکات برای سال جاری بازبینی و تایید شد.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>کاربران جدید</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ۱ پرسنل جدید در دپارتمان مراقبت‌های ویژه تعریف شده و آماده فعالیت است.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>هشدارهای سیستم</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                پایگاه داده و ساختار سلسله‌مراتبی اموال بدون هیچ خطای سیستمی در وضعیت پایدار قرار دارند.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
