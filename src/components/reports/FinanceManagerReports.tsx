import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpDown,
  TrendingDown,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { PurchaseRequest, EquipmentItem, AppUser } from '../../types';
import { formatToman, toPersianNumber } from '../../utils/taxonomyAnalytics';

interface FinanceManagerReportsProps {
  currentUser?: AppUser;
  purchaseRequests: PurchaseRequest[];
  equipmentList: EquipmentItem[];
}

export const FinanceManagerReports: React.FC<FinanceManagerReportsProps> = ({
  currentUser,
  purchaseRequests,
  equipmentList,
}) => {
  const [activeReportAnchor, setActiveReportAnchor] = useState<string>('rep1');

  // --- Report 1: Purchase Cost Trend (روند هزینه خرید) ---
  const [trendTimeRange, setTrendTimeRange] = useState<'3months' | '6months' | '12months'>('12months');

  const purchaseCostTrendDataAll = useMemo(() => {
    return [
      { month: 'فروردین', monthCode: '01', amount: 480_000_000, label: '۴۸۰ م.ت' },
      { month: 'اردیبهشت', monthCode: '02', amount: 620_000_000, label: '۶۲۰ م.ت' },
      { month: 'خرداد', monthCode: '03', amount: 540_000_000, label: '۵۴۰ م.ت' },
      { month: 'تیر', monthCode: '04', amount: 790_000_000, label: '۷۹۰ م.ت' },
      { month: 'مرداد', monthCode: '05', amount: 910_000_000, label: '۹۱۰ م.ت' },
      { month: 'شهریور', monthCode: '06', amount: 680_000_000, label: '۶۸۰ م.ت' },
      { month: 'مهر', monthCode: '07', amount: 840_000_000, label: '۸۴۰ م.ت' },
      { month: 'آبان', monthCode: '08', amount: 1_020_000_000, label: '۱,۰۲۰ م.ت' },
      { month: 'آذر', monthCode: '09', amount: 950_000_000, label: '۹۵۰ م.ت' },
      { month: 'دی', monthCode: '10', amount: 1_180_000_000, label: '۱,۱۸۰ م.ت' },
      { month: 'بهمن', monthCode: '11', amount: 870_000_000, label: '۸۷۰ م.ت' },
      { month: 'اسفند', monthCode: '12', amount: 1_250_000_000, label: '۱,۲۵۰ م.ت' },
    ];
  }, []);

  const purchaseCostTrendData = useMemo(() => {
    if (trendTimeRange === '3months') return purchaseCostTrendDataAll.slice(-3);
    if (trendTimeRange === '6months') return purchaseCostTrendDataAll.slice(-6);
    return purchaseCostTrendDataAll;
  }, [purchaseCostTrendDataAll, trendTimeRange]);

  const totalPurchaseCost = useMemo(() => {
    return purchaseCostTrendData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [purchaseCostTrendData]);

  // --- Report 2: Purchase Price Comparison (مقایسه قیمت خرید) ---
  const [priceCompSearch, setPriceCompSearch] = useState('');

  const priceComparisonList = useMemo(() => {
    return [
      {
        id: 'pc-1',
        itemName: 'سنسور اکسیژن ونتیلاتور Puritan Bennett',
        vendor: 'شرکت مهندسی فرازطب آریان',
        purchaseDate: '۱۴۰۴/۰۲/۱۴',
        currentUnitPrice: 42_000_000,
        lastUnitPrice: 31_000_000,
        changePct: 35.5,
        isWarning: true,
      },
      {
        id: 'pc-2',
        itemName: 'ست لید و کابل مانیتورینگ علائم حیاتی ۱۰ لید',
        vendor: 'تجهیزات پزشکی بهین طب پارس',
        purchaseDate: '۱۴۰۴/۰۲/۱۰',
        currentUnitPrice: 18_500_000,
        lastUnitPrice: 14_000_000,
        changePct: 32.1,
        isWarning: true,
      },
      {
        id: 'pc-3',
        itemName: 'تیوب اشعه ایکس رادیولوژی دیجیتال Varian',
        vendor: 'شرکت پرتو نگار سلامت',
        purchaseDate: '۱۴۰۴/۰۱/۲۸',
        currentUnitPrice: 850_000_000,
        lastUnitPrice: 690_000_000,
        changePct: 23.2,
        isWarning: true,
      },
      {
        id: 'pc-4',
        itemName: 'پد الکترود بای‌فازیک بزرگسال دفیبریلاتور',
        vendor: 'طب و درمان نوین کاران',
        purchaseDate: '۱۴۰۴/۰۱/۲۲',
        currentUnitPrice: 4_800_000,
        lastUnitPrice: 4_200_000,
        changePct: 14.3,
        isWarning: false,
      },
      {
        id: 'pc-5',
        itemName: 'فیلتر هپا اتاق عمل کلاس ۱۰۰',
        vendor: 'مهندسی پاک‌زیست البرز',
        purchaseDate: '۱۴۰۴/۰۱/۱۵',
        currentUnitPrice: 28_000_000,
        lastUnitPrice: 26_500_000,
        changePct: 5.6,
        isWarning: false,
      },
      {
        id: 'pc-6',
        itemName: 'محلول شوینده آنزیمی اتوکلاو بیمارستانی',
        vendor: 'شیمی دارویی کیمیا طب',
        purchaseDate: '۱۴۰۳/۱۲/۲۴',
        currentUnitPrice: 6_200_000,
        lastUnitPrice: 6_400_000,
        changePct: -3.1,
        isWarning: false,
      },
    ];
  }, []);

  const warningPriceDiffCount = useMemo(() => {
    return priceComparisonList.filter((p) => p.isWarning).length;
  }, [priceComparisonList]);

  const filteredPriceComparison = useMemo(() => {
    return priceComparisonList.filter((item) => {
      if (priceCompSearch.trim()) {
        const q = priceCompSearch.toLowerCase();
        return item.itemName.toLowerCase().includes(q) || item.vendor.toLowerCase().includes(q);
      }
      return true;
    });
  }, [priceComparisonList, priceCompSearch]);

  // --- Report 3: Purchase Financial Commitments (تعهدات مالی خرید) ---
  const approvedRequests = useMemo(() => {
    return purchaseRequests.filter((r) => r.status === 'approved' || r.status === 'purchased');
  }, [purchaseRequests]);

  const pendingRequests = useMemo(() => {
    return purchaseRequests.filter(
      (r) =>
        r.status.includes('pending') ||
        r.status === 'pending_finance' ||
        r.status === 'pending_procurement' ||
        r.status === 'pending_asset_manager'
    );
  }, [purchaseRequests]);

  const approvedRequestsTotal = useMemo(() => {
    return approvedRequests.reduce((sum, r) => sum + (r.totalEstimate || 0), 0) || 1_450_000_000;
  }, [approvedRequests]);

  const pendingRequestsTotal = useMemo(() => {
    return pendingRequests.reduce((sum, r) => sum + (r.totalEstimate || 0), 0) || 820_000_000;
  }, [pendingRequests]);

  const commitmentsTableList = useMemo(() => {
    return purchaseRequests.map((r, idx) => {
      const stageMap: Record<string, string> = {
        pending_asset_manager: 'بررسی مدیریت اموال',
        pending_finance: 'تأییدیه واحد مالی',
        pending_procurement: 'سبد خرید و تدارکات',
        approved: 'تأیید نهایی مالی - آماده خرید',
        purchased: 'خریداری و تسویه شده',
        rejected: 'رد شده مالی/اموال',
      };
      return {
        id: r.id,
        requestNo: r.requestNo || `PR-1404-${toPersianNumber(100 + idx)}`,
        department: r.department || 'بخش مراقبت‌های ویژه (ICU)',
        amount: r.totalEstimate || 85_000_000,
        status: r.status,
        statusFa:
          r.status === 'approved'
            ? 'تأیید شده'
            : r.status === 'purchased'
            ? 'تکمیل خرید'
            : r.status.includes('pending')
            ? 'در انتظار تأیید'
            : 'رد شده',
        date: r.date || '۱۴۰۴/۰۲/۱۰',
        currentStage: stageMap[r.status] || 'در حال گردش کار',
      };
    });
  }, [purchaseRequests]);

  // --- Report 4: Equipment Total Cost of Ownership - TCO (هزینه مالکیت تجهیزات) ---
  const [selectedTcoId, setSelectedTcoId] = useState<string>('eq-tco-1');

  const tcoData = useMemo(() => {
    return [
      {
        id: 'eq-tco-1',
        name: 'دستگاه ام‌آر‌آی ۱.۵ تسلا Siemens Magnetom',
        purchaseCost: 42_000_000_000,
        repairCost: 3_800_000_000,
        maintenanceCost: 1_900_000_000,
        calibrationCost: 450_000_000,
        totalTCO: 48_150_000_000,
        department: 'بخش تصویربرداری مرکزی',
        ageYears: 5,
      },
      {
        id: 'eq-tco-2',
        name: 'سی‌تی اسکن ۱۲۸ اسلایس GE Revolution',
        purchaseCost: 28_000_000_000,
        repairCost: 4_200_000_000,
        maintenanceCost: 1_600_000_000,
        calibrationCost: 600_000_000,
        totalTCO: 34_400_000_000,
        department: 'رادیولوژی و اورژانس',
        ageYears: 4,
      },
      {
        id: 'eq-tco-3',
        name: 'سیستم آنژیوگرافی عروقی Philips Allura',
        purchaseCost: 22_000_000_000,
        repairCost: 2_600_000_000,
        maintenanceCost: 1_200_000_000,
        calibrationCost: 350_000_000,
        totalTCO: 26_150_000_000,
        department: 'بخش کات‌لب و قلب',
        ageYears: 6,
      },
      {
        id: 'eq-tco-4',
        name: 'اتوکلاو بیمارستانی ۶۰۰ لیتری Tuttnauer',
        purchaseCost: 3_500_000_000,
        repairCost: 850_000_000,
        maintenanceCost: 420_000_000,
        calibrationCost: 180_000_000,
        totalTCO: 4_950_000_000,
        department: 'واحد استریلیزاسیون CSSD',
        ageYears: 7,
      },
      {
        id: 'eq-tco-5',
        name: 'ونتیلاتور مراقبت ویژه Drager Evita V500',
        purchaseCost: 2_400_000_000,
        repairCost: 620_000_000,
        maintenanceCost: 310_000_000,
        calibrationCost: 120_000_000,
        totalTCO: 3_450_000_000,
        department: 'بخش مراقبت‌های ویژه (ICU 1)',
        ageYears: 3,
      },
    ].sort((a, b) => b.totalTCO - a.totalTCO);
  }, []);

  const selectedTcoItem = useMemo(() => {
    return tcoData.find((t) => t.id === selectedTcoId) || tcoData[0];
  }, [tcoData, selectedTcoId]);

  // --- Report 5: Abnormal Purchases (خریدهای غیرعادی) ---
  const abnormalPurchases = useMemo(() => {
    return [
      {
        id: 'ab-1',
        item: 'ماژول پردازش سیگنال دستگاه نوار قلب',
        currentPrice: 94_000_000,
        normalPrice: 52_000_000,
        diffAmount: 42_000_000,
        diffPct: '+۸۰٪',
        vendor: 'بازرگانی سینا طب آرمان',
        purchaseDate: '۱۴۰۴/۰۲/۰۵',
        warningReason: 'اختلاف قیمت ۸۰ درصدی نسبت به نرخ میانگین و استعلام قبلی',
        severity: 'بحرانی',
      },
      {
        id: 'ab-2',
        item: 'باطری بک‌آپ داخلی دستگاه ونتیلاتور',
        currentPrice: 38_000_000,
        normalPrice: 24_000_000,
        diffAmount: 14_000_000,
        diffPct: '+۵۸٪',
        vendor: 'مهندسی نیکان تجهیز',
        purchaseDate: '۱۴۰۴/۰۱/۲۵',
        warningReason: 'افزایش ناگهانی بدون مجوز تغییر تعرفه تامین‌کننده رسمی',
        severity: 'بالا',
      },
      {
        id: 'ab-3',
        item: 'پروب اولتراسوند آرایه‌ای فازی قلب',
        currentPrice: 340_000_000,
        normalPrice: 280_000_000,
        diffAmount: 60_000_000,
        diffPct: '+۲۱٪',
        vendor: 'پرتو گستران درمان',
        purchaseDate: '۱۴۰۴/۰۱/۱۴',
        warningReason: 'خرید بدون تطابق کامل استعلام سه فقره‌ای بازار',
        severity: 'متوسط',
      },
      {
        id: 'ab-4',
        item: 'روغن وکیوم پمپ ساکشن سانترال',
        currentPrice: 16_000_000,
        normalPrice: 13_500_000,
        diffAmount: 2_500_000,
        diffPct: '+۱۸٪',
        vendor: 'پالایش شیمی آریا',
        purchaseDate: '۱۴۰۳/۱۲/۲۸',
        warningReason: 'تغییر قیمت خارج از دوره بازنگری قرارداد سالانه',
        severity: 'متوسط',
      },
    ];
  }, []);

  return (
    <div className="space-y-10 pb-16 font-sans text-right dir-rtl">
      {/* Header & Quick Jump Anchors */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-800">
                گزارش‌ها و تحلیل‌های مدیریت مالی و حسابداری
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              تمرکز بر روند هزینه‌ها، تعهدات مالی خرید، مقایسه قیمت، هزینه واقعی مالکیت و خریدهای غیرعادی
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                setActiveReportAnchor('rep1');
                document.getElementById('rep-cost-trend')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep1'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۱. روند هزینه خرید
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep2');
                document.getElementById('rep-price-comp')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep2'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۲. مقایسه قیمت خرید
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep3');
                document.getElementById('rep-commitments')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep3'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۳. تعهدات مالی
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep4');
                document.getElementById('rep-tco')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep4'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۴. هزینه مالکیت (TCO)
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep5');
                document.getElementById('rep-abnormal')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep5'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۵. خریدهای غیرعادی
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* گزارش ۱ — روند هزینه خرید */}
      {/* ========================================================================= */}
      <section id="rep-cost-trend" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۱ — روند هزینه خرید</h3>
          </div>
          <span className="text-xs text-slate-400">تحلیل نوسانات مخارج خرید در طول زمان</span>
        </div>

        {/* Top KPI Card + Time range selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-l from-emerald-500/10 via-emerald-50 to-white rounded-2xl border border-emerald-200 p-5 flex flex-col justify-between">
            <span className="text-xs font-bold text-emerald-800">شاخص تجمیعی کل مخارج</span>
            <div className="mt-2">
              <h4 className="text-xs text-slate-500">مجموع هزینه خرید در بازه انتخابی</h4>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {formatToman(totalPurchaseCost)}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-700">بازه زمانی تحلیل روند:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">امکان مقایسه نوسانات دوره‌ای بودجه خرید تجهیزات</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setTrendTimeRange('3months')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  trendTimeRange === '3months' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ۳ ماه اخیر
              </button>
              <button
                onClick={() => setTrendTimeRange('6months')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  trendTimeRange === '6months' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ۶ ماه اخیر
              </button>
              <button
                onClick={() => setTrendTimeRange('12months')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  trendTimeRange === '12months' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ۱۲ ماه اخیر (پیش‌فرض)
              </button>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800">نمودار خطی تغییرات مبلغ خرید</h4>
            <span className="text-[11px] text-slate-400">محور افقی: زمان | محور عمودی: مبلغ خرید (میلیون تومان)</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={purchaseCostTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => toPersianNumber(Math.round(v / 1_000_000))}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-lg space-y-1">
                          <div className="font-bold text-slate-200">{data.month}</div>
                          <div className="text-emerald-400 font-bold font-mono">
                            مبلغ خرید: {formatToman(data.amount)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۲ — مقایسه قیمت خرید */}
      {/* ========================================================================= */}
      <section id="rep-price-comp" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۲ — مقایسه قیمت خرید</h3>
          </div>
          <span className="text-xs text-slate-400">شناسایی خریدهای با تغییر قیمت غیرعادی نسبت به دوره‌های قبل</span>
        </div>

        {/* Top KPI Card */}
        <div className="bg-gradient-to-l from-amber-500/10 via-amber-50 to-white rounded-2xl border border-amber-200 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800">پایش انحراف نرخ خرید</span>
            <h4 className="text-lg font-black text-slate-900 mt-1">خریدهای دارای اختلاف قیمت</h4>
          </div>
          <div className="flex items-baseline gap-1.5 bg-white px-4 py-2 rounded-xl border border-amber-100 shadow-2xs">
            <span className="text-3xl font-black text-amber-600 font-mono">
              {toPersianNumber(warningPriceDiffCount)}
            </span>
            <span className="text-xs font-bold text-slate-500">خرید با انحراف بالا</span>
          </div>
        </div>

        {/* Analytical Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجوی قلم یا تأمین‌کننده..."
                value={priceCompSearch}
                onChange={(e) => setPriceCompSearch(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
            <span className="text-xs text-slate-400">ردیف‌های با افزایش بیش از ۲۰٪ در وضعیت هشدار هستند</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">نام قلم</th>
                  <th className="py-3 px-4">تأمین‌کننده</th>
                  <th className="py-3 px-4 text-center">تاریخ خرید</th>
                  <th className="py-3 px-4 text-center">قیمت واحد فعلی</th>
                  <th className="py-3 px-4 text-center">آخرین قیمت قبلی</th>
                  <th className="py-3 px-4 text-center">درصد تغییر قیمت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPriceComparison.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        {item.isWarning && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                        <span>{item.itemName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.vendor}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{item.purchaseDate}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {formatToman(item.currentUnitPrice)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {formatToman(item.lastUnitPrice)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                          item.changePct > 20
                            ? 'bg-rose-100 text-rose-800'
                            : item.changePct > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.changePct > 0 ? '+' : ''}
                        {toPersianNumber(item.changePct)}٪
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۳ — تعهدات مالی خرید */}
      {/* ========================================================================= */}
      <section id="rep-commitments" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۳ — تعهدات مالی خرید</h3>
          </div>
          <span className="text-xs text-slate-400">شفافیت تعهدات ایجادشده و مبالغ در گردش فرآیند تأیید</span>
        </div>

        {/* 2 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <span className="text-xs text-emerald-700 font-bold">مبلغ درخواست‌های تأییدشده</span>
            <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
              {formatToman(approvedRequestsTotal)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">تعهد قطعی نیازمند تخصیص نقدینگی و صدور حواله</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <span className="text-xs text-amber-700 font-bold">مبلغ درخواست‌های در انتظار تأیید</span>
            <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
              {formatToman(pendingRequestsTotal)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">برآورد بار مالی بالقوه در دست بررسی مدیریت و کمیته‌ها</p>
          </div>
        </div>

        {/* Commitments Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700">فهرست درخواست‌های دارای تعهد مالی</span>
            <span className="text-xs text-slate-400">{toPersianNumber(commitmentsTableList.length)} درخواست</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">شماره درخواست</th>
                  <th className="py-3 px-4">واحد</th>
                  <th className="py-3 px-4 text-center">مبلغ</th>
                  <th className="py-3 px-4 text-center">وضعیت</th>
                  <th className="py-3 px-4 text-center">تاریخ ثبت</th>
                  <th className="py-3 px-4">مرحله فعلی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commitmentsTableList.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{req.requestNo}</td>
                    <td className="py-3 px-4 text-slate-600">{req.department}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {formatToman(req.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          req.status === 'approved' || req.status === 'purchased'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {req.statusFa}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{req.date}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{req.currentStage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۴ — هزینه مالکیت تجهیزات (TCO) */}
      {/* ========================================================================= */}
      <section id="rep-tco" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۴ — هزینه مالکیت تجهیزات (TCO)</h3>
          </div>
          <span className="text-xs text-slate-400">
            مجموع هزینه خرید + تعمیرات + نگهداری + کالیبراسیون در طول چرخه عمر
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Horizontal Bar Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div>
              <h4 className="text-xs font-black text-slate-800">نمودار میله‌ای افقی بهای تمام‌شده مالکیت (TCO)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">برای مشاهده ریز اجزای هزینه، روی میله هر تجهیز کلیک کنید</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tcoData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => `${toPersianNumber(Math.round(v / 1_000_000_000))} م.م.ت`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                    width={140}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-lg space-y-1">
                            <div className="font-bold">{data.name}</div>
                            <div className="text-indigo-300 font-mono">
                              مجموع TCO: {formatToman(data.totalTCO)}
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              خرید: {formatToman(data.purchaseCost)} | تعمیرات: {formatToman(data.repairCost)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="totalTCO"
                    radius={[0, 8, 8, 0]}
                    onClick={(data) => setSelectedTcoId(data.id)}
                    className="cursor-pointer"
                  >
                    {tcoData.map((entry) => (
                      <Cell
                        key={entry.id}
                        fill={entry.id === selectedTcoId ? '#4f46e5' : '#818cf8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Adjacent Selected Equipment Details Table (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-indigo-600">تفکیک هزینه‌های تجهیز انتخاب‌شده:</span>
                <h4 className="text-xs font-black text-slate-800 mt-1">{selectedTcoItem.name}</h4>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {selectedTcoItem.department} | عمر کاری: {toPersianNumber(selectedTcoItem.ageYears)} سال
                </div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="text-[11px] text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-2">نوع هزینه</th>
                      <th className="py-2 px-2 text-center">مبلغ</th>
                      <th className="py-2 px-2 text-center">سهم از کل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr>
                      <td className="py-2 px-2 font-medium text-slate-700">بهای اولیه خرید</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-800">
                        {formatToman(selectedTcoItem.purchaseCost)}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">
                        {toPersianNumber(Math.round((selectedTcoItem.purchaseCost / selectedTcoItem.totalTCO) * 100))}٪
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-medium text-slate-700">مجموع تعمیرات و قطعات</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-rose-700">
                        {formatToman(selectedTcoItem.repairCost)}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">
                        {toPersianNumber(Math.round((selectedTcoItem.repairCost / selectedTcoItem.totalTCO) * 100))}٪
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-medium text-slate-700">سرویس دوره‌ای (PM)</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-800">
                        {formatToman(selectedTcoItem.maintenanceCost)}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">
                        {toPersianNumber(Math.round((selectedTcoItem.maintenanceCost / selectedTcoItem.totalTCO) * 100))}٪
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-medium text-slate-700">کالیبراسیون و ایمنی</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-800">
                        {formatToman(selectedTcoItem.calibrationCost)}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">
                        {toPersianNumber(Math.round((selectedTcoItem.calibrationCost / selectedTcoItem.totalTCO) * 100))}٪
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-900">مجموع بهای کل مالکیت (TCO):</span>
              <span className="font-black text-indigo-700 font-mono">{formatToman(selectedTcoItem.totalTCO)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۵ — خریدهای غیرعادی */}
      {/* ========================================================================= */}
      <section id="rep-abnormal" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۵ — خریدهای غیرعادی</h3>
          </div>
          <span className="text-xs text-slate-400">جدول هشدار تحلیلی مرتب‌شده بر اساس شدت انحراف و ضرورت بازرسی</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700">فهرست اقلام با انحراف قیمت شدید نیازمند حسابرسی</span>
            <span className="text-xs text-slate-400">{toPersianNumber(abnormalPurchases.length)} مورد هشدار</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">قلم</th>
                  <th className="py-3 px-4 text-center">قیمت فعلی</th>
                  <th className="py-3 px-4 text-center">قیمت معمول/قبلی</th>
                  <th className="py-3 px-4 text-center">میزان اختلاف</th>
                  <th className="py-3 px-4">تأمین‌کننده</th>
                  <th className="py-3 px-4 text-center">تاریخ خرید</th>
                  <th className="py-3 px-4">دلیل هشدار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {abnormalPurchases.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            row.severity === 'بحرانی' ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'
                          }`}
                        />
                        <span>{row.item}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {formatToman(row.currentPrice)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {formatToman(row.normalPrice)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {row.diffPct} ({formatToman(row.diffAmount)})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.vendor}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{row.purchaseDate}</td>
                    <td className="py-3 px-4 text-rose-700 font-medium">{row.warningReason}</td>
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
