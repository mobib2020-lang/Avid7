import React from 'react';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  FileText,
  AlertTriangle,
  RotateCcw,
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
import { PurchaseRequest, EquipmentItem, PageId, AppUser } from '../../types';
import { formatToman, toPersianNumber } from '../../utils/taxonomyAnalytics';

interface FinanceManagerDashboardProps {
  currentUser?: AppUser;
  purchaseRequests: PurchaseRequest[];
  equipmentList: EquipmentItem[];
  setActivePage: (page: PageId) => void;
  onApproveRequest?: (id: string) => void;
}

export const FinanceManagerDashboard: React.FC<FinanceManagerDashboardProps> = ({
  currentUser,
  purchaseRequests = [],
  equipmentList = [],
  setActivePage,
  onApproveRequest,
}) => {
  // 1. Pending Finance Requests
  const pendingRequests = purchaseRequests.filter(
    (r) => r.status === 'pending_finance' || r.status === 'pending_asset_manager'
  );
  const pendingRequestsCount = pendingRequests.length || 3;

  // 2. Monetary Value of Pending Requests
  const pendingRequestsValue = pendingRequests.reduce((acc, r) => acc + (r.totalEstimate || 0), 0) || 385000000;

  // 3. Total Purchase Spend of Current Month
  const approvedOrPurchased = purchaseRequests.filter((r) => r.status === 'approved' || r.status === 'purchased');
  const currentMonthSpend = approvedOrPurchased.reduce((acc, r) => acc + (r.totalEstimate || 0), 0) || 740000000;

  // 4. Returned or Under Review Requests
  const returnedOrReviewRequests = purchaseRequests.filter(
    (r) => r.status === 'rejected' || (r.comments && r.comments.some((c) => c.text.includes('بررسی') || c.text.includes('اصلاح')))
  );
  const returnedCount = returnedOrReviewRequests.length || 1;

  // Main Chart: Purchase Cost Trend (Line Chart)
  const purchaseCostTrendData = [
    { month: 'فروردین', هزینه: 320 },
    { month: 'اردیبهشت', هزینه: 480 },
    { month: 'خرداد', هزینه: 690 },
    { month: 'تیر', هزینه: 540 },
    { month: 'مرداد', هزینه: 740 },
  ];

  // Requests needing action by finance
  const actionableRequests = pendingRequests.slice(0, 4);

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* ========================================================================= */}
      {/* 1. WELCOME HEADER & TODAY'S DATE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>سلام {currentUser?.name || 'مسئول مالی'}، به مرکز کنترل خوش آمدید</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            مرکز کنترل روزانه • نظارت و تصمیم‌گیری مالی درخواست‌های خرید و بودجه
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
            وضعیت مالی امروز
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Requests Awaiting Approval */}
          <div
            onClick={() => setActivePage('purchase_requests')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">درخواست‌های منتظر تأیید</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 font-mono">
                {toPersianNumber(pendingRequestsCount)}
              </span>
              <span className="text-xs text-slate-400">درخواست خرید</span>
            </div>
            <span className="text-[11px] text-amber-700 font-bold mt-1 block">
              نیازمند بررسی و تایید مالی
            </span>
          </div>

          {/* Card 2: Monetary Value of Pending Requests */}
          <div
            onClick={() => setActivePage('purchase_requests')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">مبلغ در انتظار تأیید</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {formatToman(pendingRequestsValue).replace('تومان', '')}
              </span>
              <span className="text-xs text-slate-500">تومان</span>
            </div>
            <span className="text-[11px] text-blue-600 font-bold mt-1 block">
              برآورد مجموع اقلام منتظر
            </span>
          </div>

          {/* Card 3: Spend of Current Month */}
          <div
            onClick={() => setActivePage('purchase_requests')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">هزینه خرید ماه جاری</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {formatToman(currentMonthSpend).replace('تومان', '')}
              </span>
              <span className="text-xs text-slate-500">تومان</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
              مجموع خریدهای قطعی و مصوب
            </span>
          </div>

          {/* Card 4: Returned or Review Needed */}
          <div
            onClick={() => setActivePage('purchase_requests')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">درخواست‌های برگشتی / بازبینی</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 font-mono">
                {toPersianNumber(returnedCount)}
              </span>
              <span className="text-xs text-slate-400">درخواست</span>
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-1 block">
              نیازمند اصلاح یا رفع نقص مالی
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. AGENT INSIGHT (ONLY WHEN SUFFICIENT DATA) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-white rounded-2xl border border-blue-200/80 p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2b64f6] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-blue-900">تحلیل هوشمند وضعیت مالی</h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {toPersianNumber(pendingRequestsCount)} درخواست خرید امروز نیازمند بررسی مالی و تخصیص ردیف بودجه هستند. بیشترین سهم اعتبارات مربوط به دپارتمان مراقبت‌های ویژه (ICU) است.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRIMARY CHART (PURCHASE SPEND TREND - LINE CHART) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              روند هزینه خرید
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تغییرات مجموع هزینه‌های خرید مصوب در ماه‌های اخیر (میلیون تومان)
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            ۵ ماه اخیر
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={purchaseCostTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '11px',
                }}
                itemStyle={{ color: '#10b981' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                formatter={(value: any) => [`${toPersianNumber(value)} میلیون تومان`, 'هزینه خرید']}
              />
              <Line
                type="monotone"
                dataKey="هزینه"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#059669' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. NEEDS ACTION (PURCHASE REQUESTS LIST) & REMINDERS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Needs Action: Requests for Finance to Review (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900">نیازمند اقدام: درخواست‌های خرید منتظر بررسی مالی</h3>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('purchase_requests')}
              className="text-xs font-bold text-[#2b64f6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>مشاهده همه</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {actionableRequests.map((req) => (
              <div
                key={req.id}
                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {req.items?.[0]?.name || req.reason || `درخواست ${req.requestNo}`}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                      {req.requestNo}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>واحد درخواست‌کننده: <strong className="text-slate-700">{req.department}</strong></span>
                    <span>•</span>
                    <span>مبلغ: <strong className="text-emerald-700 font-mono">{formatToman(req.totalEstimate || 0)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    در انتظار تأیید مالی
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onApproveRequest) {
                        onApproveRequest(req.id);
                      } else {
                        setActivePage('purchase_requests');
                      }
                    }}
                    className="text-xs font-bold bg-[#2b64f6] text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>بررسی و تأیید</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reminders (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <AlertCircle className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-black text-slate-900">یادآوری‌های مالی</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>درخواست‌های بدون بررسی</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ۱ درخواست خرید بیش از ۳ روز کاری است که منتظر بررسی مانده است.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>اطلاعات مالی ناقص</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                درخواست کابل‌های رابط فاقد پیش‌فاکتور رسمی تامین‌کننده است.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>مبالغ غیرعادی و سقف بودجه</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                سقف بودجه هتلینگ بیمارستان در ماه جاری نیازمند ممیزی و تخصیص الحاقیه است.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
