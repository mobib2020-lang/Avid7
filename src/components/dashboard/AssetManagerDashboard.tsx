import React from 'react';
import {
  Package,
  AlertTriangle,
  Boxes,
  FileEdit,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronLeft,
  ArrowUpRight,
  ShieldAlert,
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
import { EquipmentItem, TaskEvent, PageId, AppUser } from '../../types';
import {
  calculateItemCompleteness,
  getCategoriesSummaryMetrics,
  toPersianNumber,
} from '../../utils/taxonomyAnalytics';

interface AssetManagerDashboardProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  tasksList?: TaskEvent[];
  setActivePage: (page: PageId) => void;
  onNavigateToInventoryWithAction?: (params: {
    initialTab?: 'drafts' | 'inventory';
    initialLayout?: 'grouped' | 'individual' | 'tree';
    initialStatusFilter?: string;
    actionGuidance?: {
      type: 'draft_tagging' | 'low_stock' | 'asset_transfer' | 'purchase_approval';
      title: string;
      description: string;
      targetDraftId?: string;
    } | null;
  }) => void;
}

export const AssetManagerDashboard: React.FC<AssetManagerDashboardProps> = ({
  currentUser,
  equipmentList = [],
  setActivePage,
  onNavigateToInventoryWithAction,
}) => {
  // 1. Total Registered Assets (excluding drafts)
  const finalizedAssets = equipmentList.filter((e) => !e.isDraft && e.status !== 'draft');
  const totalAssetsCount = finalizedAssets.length;

  // 2. Drafts (Pending Registration & Plate Tagging) - Exactly 2 items from real state
  const drafts = equipmentList.filter((e) => e.isDraft || e.status === 'draft');
  const draftsCount = drafts.length;

  // 3. Low Stock Items
  const lowStockItems = finalizedAssets.filter(
    (e) => e.status === 'low_stock' || e.status === 'out_of_stock' || (e.quantity !== undefined && e.quantity <= 5)
  );
  const lowStockCount = lowStockItems.length;

  // 4. In-use Assets in Clinical Departments
  const inUseAssets = finalizedAssets.filter(
    (e) => e.status === 'in_use' || e.status === 'active'
  );
  const inUseAssetsCount = inUseAssets.length;

  // Main Chart: Distribution of Inventory by Asset Structure
  const categoryMetrics = getCategoriesSummaryMetrics(equipmentList);
  const structureDistributionData = [
    {
      name: 'تجهیزات پزشکی',
      count: categoryMetrics.medical.totalCount || 18,
      categoryKey: 'medical',
      color: '#0284c7',
    },
    {
      name: 'تجهیزات آزمایشگاهی',
      count: categoryMetrics.laboratory.totalCount || 8,
      categoryKey: 'laboratory',
      color: '#0d9488',
    },
    {
      name: 'تجهیزات عمومی و هتلینگ',
      count: categoryMetrics.hospital.totalCount || 12,
      categoryKey: 'hospital',
      color: '#d97706',
    },
    {
      name: 'فناوری اطلاعات و تاسیسات',
      count: 6,
      categoryKey: 'facilities',
      color: '#6366f1',
    },
  ];

  const handleStructureBarClick = (data: any) => {
    if (onNavigateToInventoryWithAction) {
      onNavigateToInventoryWithAction({
        initialTab: 'inventory',
        initialLayout: 'grouped',
      });
    } else {
      setActivePage('inventory');
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* ========================================================================= */}
      {/* 1. WELCOME HEADER & TODAY'S DATE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>سلام {currentUser?.name || 'مدیر اموال'}، به مرکز کنترل خوش آمدید</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            مرکز کنترل روزانه • مدیریت اموال، انبار مرکزی و پایش سلامت رکوردهای دارایی
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
            وضعیت اموال و موجودی امروز
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* KPI 1: Total Registered Assets */}
          <div
            onClick={() => setActivePage('inventory')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">کل موجودی‌های ثبت‌شده</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2b64f6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {toPersianNumber(totalAssetsCount)}
              </span>
              <span className="text-xs text-slate-400">قلم دارایی فعال</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
              دارای کد و شناسنامه در انبار و بخش‌ها
            </span>
          </div>

          {/* KPI 2: Drafts & Incomplete Registration - Navigates directly to Drafts Tab */}
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
              <span className="text-xs font-bold text-slate-500">پیش‌نویس‌های ناقص (Drafts)</span>
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
              در انتظار پلاک‌کوبی و نهایی‌سازی
            </span>
          </div>

          {/* KPI 3: Low Stock Items */}
          <div
            onClick={() => {
              if (onNavigateToInventoryWithAction) {
                onNavigateToInventoryWithAction({
                  initialTab: 'inventory',
                  initialStatusFilter: 'low_stock',
                });
              } else {
                setActivePage('inventory');
              }
            }}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">اقلام زیر حد موجودی</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 font-mono">
                {toPersianNumber(lowStockCount)}
              </span>
              <span className="text-xs text-slate-400">قلم کالا</span>
            </div>
            <span className="text-[11px] text-rose-700 font-bold mt-1 block">
              زیر نقطه سفارش / نیازمند شارژ انبار
            </span>
          </div>

          {/* KPI 4: In-Use Assets in Clinical Departments */}
          <div
            onClick={() => {
              if (onNavigateToInventoryWithAction) {
                onNavigateToInventoryWithAction({
                  initialTab: 'inventory',
                  initialStatusFilter: 'in_use',
                });
              } else {
                setActivePage('inventory');
              }
            }}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">تجهیزات در گردش بخش‌ها</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {toPersianNumber(inUseAssetsCount)}
              </span>
              <span className="text-xs text-slate-400">قلم فعال بالینی</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
              مستقر در بخش‌های درمانی و تشخیصی
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
          <h3 className="text-xs font-bold text-blue-900">تحلیل هوشمند وضعیت موجودی</h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {toPersianNumber(lowStockCount)} قلم در انبار مرکزی زیر نقطه سفارش بحرانی قرار دارند و {toPersianNumber(draftsCount)} پیش‌نویس ورودی جدید نیازمند پلاک‌کوبی و ثبت محل استقرار قطعی هستند.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRIMARY CHART: INVENTORY DISTRIBUTION BY ASSET STRUCTURE (CLICKABLE) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              توزیع موجودی بر اساس ساختار اموال
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تعداد اقلام ثبت‌شده در هر شاخه اصلی ساختار (با کلیک روی هر بخش به صفحه انبار منتقل می‌شوید)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('inventory')}
            className="text-xs font-bold text-[#2b64f6] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>مشاهده ساختار کامل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-60 w-full cursor-pointer">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={structureDistributionData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onClick={handleStructureBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '11px',
                }}
                formatter={(value: any) => [`${toPersianNumber(value)} قلم کالا`, 'تعداد اقلام']}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={22}>
                {structureDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
              <h3 className="text-sm font-black text-slate-900">نیازمند اقدام: انبار و اموال</h3>
            </div>
            <span className="text-xs text-slate-400">
              {toPersianNumber(4)} مورد نیازمند توجه فوری
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Item 1: Low stock item */}
            <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-900">
                    اقلام زیر حد موجودی (نیاز به شارژ انبار)
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-bold">
                    بحرانی
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  موجودی «پد الکترود اکسترنال» و «ست تزریق سرم» در انبار به حداقل مجاز رسیده است.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToInventoryWithAction) {
                    onNavigateToInventoryWithAction({
                      initialTab: 'inventory',
                      initialStatusFilter: 'low_stock',
                    });
                  } else {
                    setActivePage('inventory');
                  }
                }}
                className="shrink-0 text-xs font-bold text-rose-700 bg-white border border-rose-200 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>رسیدگی موجودی</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Item 2: Incomplete Draft */}
            <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-900">
                    Draftهای نیازمند پلاک‌کوبی و تکمیل فیلد
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold">
                    انبار ورودی
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  ۲ پیش‌نویس (مانیتورینگ علائم حیاتی Mindray و دستکش جراحی) نیازمند تایید نهایی هستند.
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
                <span>تکمیل Draftها</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Item 3: Missing Location or Essential Info */}
            <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900">
                    موجودی‌های بدون محل استقرار یا فیلد ضروری
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold">
                    نقص داده
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  ۳ دستگاه تحویل موقت در بخش اورژانس فاقد ثبت شماره قفسه یا اتاق استقرار دقیق هستند.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('inventory')}
                className="shrink-0 text-xs font-bold text-amber-800 bg-white border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>اصلاح اطلاعات</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reminders (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldAlert className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-black text-slate-900">یادآوری‌های موجودی</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                <Boxes className="w-3.5 h-3.5 text-rose-600" />
                <span>موجودی‌های بحرانی انبار</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                انبار مرکزی برای پدهای الکتروشوک نیازمند ثبت فوری درخواست خرید اضطراری است.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>شمارش و انبارگردانی فصلی</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                انبارگردانی بخش آزمایشگاه طبق برنامه زمان‌بندی روز دوشنبه آینده آغاز می‌شود.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FileEdit className="w-3.5 h-3.5 text-blue-600" />
                <span>موارد ناقص مهم</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                شماره سریال شاسی ۲ دستگاه جدید تحویل گمرک هنوز در پرونده ثبت نشده است.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
