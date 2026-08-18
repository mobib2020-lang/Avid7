import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  ShoppingCart,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ArrowUpRight,
  FileText,
  User,
  Plus,
} from 'lucide-react';
import { EquipmentItem, PurchaseRequest, FailureReport, TaskEvent, PageId, AppUser } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';

interface IndependentDashboardProps {
  currentUser?: AppUser;
  purchaseRequests?: PurchaseRequest[];
  tasksList?: TaskEvent[];
  failuresList?: FailureReport[];
  setActivePage: (page: PageId) => void;
}

export const IndependentDashboard: React.FC<IndependentDashboardProps> = ({
  currentUser,
  purchaseRequests = [],
  tasksList = [],
  failuresList = [],
  setActivePage,
}) => {
  // Checklist interactive state
  const [checklist, setChecklist] = useState([
    { id: '1', title: 'بررسی کارتابل شخصی و وظایف ارجاع‌شده', done: true, time: '۰۹:۰۰' },
    { id: '2', title: 'ثبت و پیگیری درخواست‌های باز در سامانه', done: false, time: '۱۰:۳۰' },
    { id: '3', title: 'رسیدگی به هشدارهای سیستمی و پیام‌های دریافتی', done: false, time: '۱۲:۰۰' },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const completedChecklistCount = checklist.filter((c) => c.done).length;
  const totalChecklistCount = checklist.length;

  // Requests by this independent user
  const myRequests = purchaseRequests.filter(
    (r) => r.requesterId === currentUser?.id || r.department === currentUser?.department
  );
  const myRequestsCount = myRequests.length || 2;

  // Completed actions
  const completedActionsCount = 6;

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* ========================================================================= */}
      {/* 1. WELCOME HEADER & TODAY'S DATE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>سلام {currentUser?.name || 'کاربر گرامی'}، به مرکز کنترل شخصی خوش آمدید</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            میز کار فردی • پیگیری وظایف، چک‌لیست و درخواست‌های شخصی
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
      {/* 2. TODAY'S STATUS (4 KPI CARDS - PERSONAL FOCUS - NO COMPLEX CHARTS) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-slate-700 tracking-wide">
            وضعیت کار امروز من
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Today's Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">وظایف امروز</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {toPersianNumber(3)}
              </span>
              <span className="text-xs text-slate-400">وظیفه روزانه</span>
            </div>
            <span className="text-[11px] text-blue-600 font-bold mt-1 block">
              برنامه‌ریزی شده برای شیفت امروز
            </span>
          </div>

          {/* Card 2: Open Checklist Items */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">چک‌لیست باز</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 font-mono">
                {toPersianNumber(totalChecklistCount - completedChecklistCount)}
              </span>
              <span className="text-xs text-slate-400">مورد باقی‌مانده</span>
            </div>
            <span className="text-[11px] text-amber-700 font-bold mt-1 block">
              {toPersianNumber(completedChecklistCount)} مورد با موفقیت انجام شد
            </span>
          </div>

          {/* Card 3: My Requests */}
          <div
            onClick={() => setActivePage('purchase_requests')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">درخواست‌های من</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {toPersianNumber(myRequestsCount)}
              </span>
              <span className="text-xs text-slate-400">درخواست ثبت‌شده</span>
            </div>
            <span className="text-[11px] text-blue-600 font-bold mt-1 block">
              در حال پیگیری در چرخه اداری
            </span>
          </div>

          {/* Card 4: Actions Completed */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">اقدامات انجام‌شده</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {toPersianNumber(completedActionsCount)}
              </span>
              <span className="text-xs text-slate-400">اقدام در این ماه</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
              پایش عملکرد منظم
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TODAY'S TASKS & PERSONAL REMINDERS (SIDE-BY-SIDE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily Checklist (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#2b64f6]" />
              <h3 className="text-sm font-black text-slate-900">برنامه و وظایف امروز من</h3>
            </div>
            <span className="text-xs text-slate-400">
              {toPersianNumber(completedChecklistCount)} از {toPersianNumber(totalChecklistCount)} تکمیل شده
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

          {/* Quick Actions */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              برای ثبت درخواست جدید یا اعلام نقص فنی از دکمه‌های زیر استفاده کنید:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePage('purchase_requests')}
                className="text-xs font-bold text-[#2b64f6] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ثبت درخواست خرید</span>
              </button>
            </div>
          </div>
        </div>

        {/* Personal Reminders (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-black text-slate-900">یادآوری‌های من</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs font-bold text-slate-800 block">بررسی درخواست‌های باز</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                آخرین وضعیت تایید پیش‌فاکتورها را در ماژول درخواست‌های خرید پیگیری نمایید.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs font-bold text-slate-800 block">ثبت به‌موقع فعالیت‌ها</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                اقدامات انجام‌شده در طول روز را پیش از خروج از سامانه تایید و ثبت کنید.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
              <span className="text-xs font-bold text-emerald-900 block">وضعیت اتصال پایدار</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                دسترسی شما به ماژول‌های مجاز سامانه فعال است.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
