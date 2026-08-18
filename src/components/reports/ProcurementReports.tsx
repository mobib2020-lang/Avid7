import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Truck,
  ArrowUpDown,
  Building,
  Timer,
  AlertCircle,
  TrendingDown,
  Repeat,
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
import { PurchaseRequest, EquipmentItem, AppUser, Vendor } from '../../types';
import { toPersianNumber, formatToman } from '../../utils/taxonomyAnalytics';

interface ProcurementReportsProps {
  currentUser?: AppUser;
  purchaseRequests: PurchaseRequest[];
  equipmentList: EquipmentItem[];
  vendors?: Vendor[];
}

export const ProcurementReports: React.FC<ProcurementReportsProps> = ({
  currentUser,
  purchaseRequests,
  equipmentList,
  vendors = [],
}) => {
  const [activeReportAnchor, setActiveReportAnchor] = useState<string>('rep1');

  // --- Report 1: Purchase Process Lead Time Timeline (زمان طی شدن فرآیند خرید) ---
  const processSteps = useMemo(() => {
    return [
      { id: 1, stepName: 'ثبت درخواست', durationDays: 1, desc: 'توسط بخش متقاضی یا کادر درمانی', isBottleneck: false },
      { id: 2, stepName: 'تأیید مدیریت اموال', durationDays: 2, desc: 'بررسی عدم وجود در انبار راکد', isBottleneck: false },
      { id: 3, stepName: 'تأیید مالی', durationDays: 8.5, desc: 'تخصیص بودجه و بررسی سرفصل', isBottleneck: true },
      { id: 4, stepName: 'تعیین سبد خرید', durationDays: 3, desc: 'استعلام استراتژیک قیمت و سورسینگ', isBottleneck: false },
      { id: 5, stepName: 'خرید و صدور PO', durationDays: 4, desc: 'عقد قرارداد و ثبت سفارش با وندور', isBottleneck: false },
      { id: 6, stepName: 'دریافت و انبارش', durationDays: 2.5, desc: 'کنترل فیزیکی و تحویل به انباردار', isBottleneck: false },
    ];
  }, []);

  const totalLeadTimeDays = useMemo(() => {
    return processSteps.reduce((sum, s) => sum + s.durationDays, 0);
  }, [processSteps]);

  // --- Report 2: Vendor Performance Ranking (عملکرد تأمین‌کنندگان) ---
  const [vendorSearch, setVendorSearch] = useState('');

  const vendorPerformanceData = useMemo(() => {
    return [
      {
        id: 'v-1',
        name: 'شرکت مهندسی فرازطب آریان',
        purchaseCount: 38,
        avgDeliveryDays: 4.2,
        delayCount: 1,
        onTimePct: 97.4,
        problemOrders: 0,
      },
      {
        id: 'v-2',
        name: 'تجهیزات پزشکی بهین طب پارس',
        purchaseCount: 24,
        avgDeliveryDays: 5.1,
        delayCount: 2,
        onTimePct: 91.6,
        problemOrders: 1,
      },
      {
        id: 'v-3',
        name: 'پرتو نگار سلامت تهران',
        purchaseCount: 18,
        avgDeliveryDays: 7.8,
        delayCount: 2,
        onTimePct: 88.9,
        problemOrders: 1,
      },
      {
        id: 'v-4',
        name: 'کیمیا گستر درمان',
        purchaseCount: 15,
        avgDeliveryDays: 9.4,
        delayCount: 4,
        onTimePct: 73.3,
        problemOrders: 2,
      },
      {
        id: 'v-5',
        name: 'بازرگانی سینا طب آرمان',
        purchaseCount: 12,
        avgDeliveryDays: 14.2,
        delayCount: 6,
        onTimePct: 50.0,
        problemOrders: 3,
      },
    ].sort((a, b) => b.onTimePct - a.onTimePct);
  }, []);

  const filteredVendors = useMemo(() => {
    return vendorPerformanceData.filter((v) => {
      if (vendorSearch.trim()) {
        return v.name.toLowerCase().includes(vendorSearch.toLowerCase());
      }
      return true;
    });
  }, [vendorPerformanceData, vendorSearch]);

  // --- Report 3: Delayed Orders (سفارش‌های تأخیردار) ---
  const delayedOrders = useMemo(() => {
    return [
      {
        id: 'do-1',
        orderNo: 'PO-1404-082',
        item: 'ماژول کاپنوگرافی EtCO2 مانیتورینگ',
        vendor: 'بازرگانی سینا طب آرمان',
        promisedDate: '۱۴۰۴/۰۱/۲۵',
        delayDays: 24,
        status: 'پیگیری ارسال - تعلل تأمین‌کننده',
      },
      {
        id: 'do-2',
        orderNo: 'PO-1404-091',
        item: 'باطری لیتیمی پرتابل دفیبریلاتور',
        vendor: 'کیمیا گستر درمان',
        promisedDate: '۱۴۰۴/۰۲/۰۲',
        delayDays: 16,
        status: 'توقیف در گمرک و ترخیص کالا',
      },
      {
        id: 'do-3',
        orderNo: 'PO-1404-105',
        item: 'سنسور فلوسنسور نوزاد ونتیلاتور',
        vendor: 'پرتو نگار سلامت تهران',
        promisedDate: '۱۴۰۴/۰۲/۱۰',
        delayDays: 8,
        status: 'ارسال با پست پیشتاز اختصاصی',
      },
      {
        id: 'do-4',
        orderNo: 'PO-1404-118',
        item: 'کیت کالیبراسیون و تست جریان سنج گاز',
        vendor: 'تجهیزات پزشکی بهین طب',
        promisedDate: '۱۴۰۴/۰۲/۱۴',
        delayDays: 4,
        status: 'صدور بارنامه حمل داخلی',
      },
    ].sort((a, b) => b.delayDays - a.delayDays);
  }, []);

  // --- Report 4: Recurring Purchases (خریدهای تکراری) ---
  const recurringPurchases = useMemo(() => {
    return [
      {
        id: 'rec-1',
        itemName: 'کابل اکسی‌متر انگشتی SpO2 بزرگسال',
        purchaseCount: 6,
        lastPurchaseDate: '۱۴۰۴/۰۲/۱۵',
        avgIntervalDays: '۱۸ روز',
        previousQuantities: '۱۰، ۱۲، ۸، ۱۵، ۱۰، ۱۰ عدد',
        isWarning: true,
        warningNote: 'تکرار خرید غیرعادی در فواصل کوتاه (نشانه اتلاف یا عدم تجمیع)',
      },
      {
        id: 'rec-2',
        itemName: 'ژل اولتراسوند ۵ لیتری هادی سونوگرافی',
        purchaseCount: 5,
        lastPurchaseDate: '۱۴۰۴/۰۲/۰۸',
        avgIntervalDays: '۲۲ روز',
        previousQuantities: '۲۰، ۲۰، ۲۰، ۳۰، ۲۰ عدد',
        isWarning: false,
        warningNote: 'الگوی مصرف پایدار و منطبق با پذیرش درمانگاه',
      },
      {
        id: 'rec-3',
        itemName: 'ست رابط میکروست و فیلتر تزریق خون',
        purchaseCount: 4,
        lastPurchaseDate: '۱۴۰۴/۰۱/۲۹',
        avgIntervalDays: '۱۵ روز',
        previousQuantities: '۱۰۰، ۱۰۰، ۵۰، ۱۰۰ عدد',
        isWarning: true,
        warningNote: 'عدم اعمال تخفیف حجمی ناشی از خریدهای پراکنده خرد',
      },
      {
        id: 'rec-4',
        itemName: 'کاغذ نوار قلب حرارتی ۱۱۰ میلی‌متری',
        purchaseCount: 4,
        lastPurchaseDate: '۱۴۰۴/۰۱/۱۸',
        avgIntervalDays: '۳۵ روز',
        previousQuantities: '۵۰، ۵۰، ۵۰، ۵۰ عدد',
        isWarning: false,
        warningNote: 'سفارش دوره‌ای منظم مطابق سهمیه مصوب',
      },
    ];
  }, []);

  // --- Report 5: Average Lead Time Trend (میانگین زمان تأمین) ---
  const leadTimeTrendData = useMemo(() => {
    return [
      { month: 'آبان', days: 28.5 },
      { month: 'آذر', days: 26.0 },
      { month: 'دی', days: 24.2 },
      { month: 'بهمن', days: 22.8 },
      { month: 'اسفند', days: 21.0 },
      { month: 'فروردین', days: 21.5 },
    ];
  }, []);

  const currentAvgLeadTime = leadTimeTrendData[leadTimeTrendData.length - 1].days;

  return (
    <div className="space-y-10 pb-16 font-sans text-right dir-rtl">
      {/* Header & Anchors */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-extrabold text-slate-800">
                گزارش‌ها و تحلیل‌های واحد خرید و تدارکات
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              تمرکز بر سرعت فرآیند تأمین، گلوگاه‌های گردش کار، عملکرد تأمین‌کنندگان، سفارش‌های معوق و خریدهای تکراری
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                setActiveReportAnchor('rep1');
                document.getElementById('rep-leadtime')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep1'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۱. زمان فرآیند خرید
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep2');
                document.getElementById('rep-vendors')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep2'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۲. عملکرد تأمین‌کنندگان
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep3');
                document.getElementById('rep-delayed')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep3'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۳. سفارش‌های تأخیردار
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep4');
                document.getElementById('rep-recurring')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep4'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۴. خریدهای تکراری
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep5');
                document.getElementById('rep-avgtime')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep5'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۵. میانگین زمان تأمین
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* گزارش ۱ — زمان طی شدن فرآیند خرید (Process Timeline) */}
      {/* ========================================================================= */}
      <section id="rep-leadtime" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۱ — زمان طی شدن فرآیند خرید (Process Timeline)</h3>
          </div>
          <span className="text-xs text-slate-400">شناسایی مرحله گلوگاه گردش کار سفارشات</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-teal-800">تحلیل چرخه عمر سفارش خرید (End-to-End)</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                مجموع میانگین زمان کل فرآیند از نقطه ایجاد نیاز تا تحویل به انباردار
              </p>
            </div>
            <div className="flex items-baseline gap-2 bg-teal-50 px-4 py-2 rounded-xl border border-teal-200 w-fit">
              <span className="text-xs font-bold text-teal-800">میانگین کل چرخه:</span>
              <span className="text-xl font-black text-teal-900 font-mono">
                {toPersianNumber(totalLeadTimeDays)} روز
              </span>
            </div>
          </div>

          {/* Process Timeline Steps */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {processSteps.map((step, idx) => (
              <div
                key={step.id}
                className={`relative rounded-xl p-4 border flex flex-col justify-between space-y-3 transition-all ${
                  step.isBottleneck
                    ? 'bg-rose-50/80 border-rose-300 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                {step.isBottleneck && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white w-fit">
                    <AlertTriangle className="w-3 h-3" />
                    گلوگاه فرآیند
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-mono text-slate-400">مرحله {toPersianNumber(step.id)}</div>
                  <h4 className="text-xs font-black text-slate-900 mt-1">{step.stepName}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-400">مدت زمان:</span>
                  <span
                    className={`font-mono font-black text-sm ${
                      step.isBottleneck ? 'text-rose-700' : 'text-slate-800'
                    }`}
                  >
                    {toPersianNumber(step.durationDays)} روز
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۲ — عملکرد تأمین‌کنندگان (Ranking Table) */}
      {/* ========================================================================= */}
      <section id="rep-vendors" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۲ — عملکرد تأمین‌کنندگان</h3>
          </div>
          <span className="text-xs text-slate-400">جدول رتبه‌بندی مرتب‌شده بر اساس «درصد تحویل به‌موقع»</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجوی نام شرکت یا تأمین‌کننده..."
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
            <span className="text-xs text-slate-400">مبنای انتخاب هوشمند تأمین‌کننده در سبد خرید</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">تأمین‌کننده</th>
                  <th className="py-3 px-4 text-center">تعداد خرید</th>
                  <th className="py-3 px-4 text-center">میانگین زمان تحویل</th>
                  <th className="py-3 px-4 text-center">تعداد تأخیر</th>
                  <th className="py-3 px-4 text-center">درصد تحویل به‌موقع</th>
                  <th className="py-3 px-4 text-center">سفارش‌های مشکل‌دار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVendors.map((vendor, idx) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-[10px] font-bold">
                          {toPersianNumber(idx + 1)}
                        </span>
                        <span>{vendor.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">
                      {toPersianNumber(vendor.purchaseCount)} سفارش
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">
                      {toPersianNumber(vendor.avgDeliveryDays)} روز
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-rose-700">
                      {toPersianNumber(vendor.delayCount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                          vendor.onTimePct >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : vendor.onTimePct >= 75
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {toPersianNumber(vendor.onTimePct)}٪
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {toPersianNumber(vendor.problemOrders)} مورد
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۳ — سفارش‌های تأخیردار */}
      {/* ========================================================================= */}
      <section id="rep-delayed" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۳ — سفارش‌های تأخیردار</h3>
          </div>
          <span className="text-xs text-slate-400">مرتب‌شده بر اساس بیشترین روزهای تأخیر در بالای جدول</span>
        </div>

        {/* Top KPI Card */}
        <div className="bg-gradient-to-l from-rose-500/10 via-rose-50 to-white rounded-2xl border border-rose-200 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-800">هشدار تعهدات معوق تأمین‌کنندگان</span>
            <h4 className="text-lg font-black text-slate-900 mt-1">سفارش‌های تأخیردار</h4>
          </div>
          <div className="flex items-baseline gap-1.5 bg-white px-4 py-2 rounded-xl border border-rose-100 shadow-2xs">
            <span className="text-3xl font-black text-rose-600 font-mono">
              {toPersianNumber(delayedOrders.length)}
            </span>
            <span className="text-xs font-bold text-slate-500">سفارش معوق</span>
          </div>
        </div>

        {/* Delayed Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">سفارش</th>
                  <th className="py-3 px-4">قلم</th>
                  <th className="py-3 px-4">تأمین‌کننده</th>
                  <th className="py-3 px-4 text-center">تاریخ وعده تحویل</th>
                  <th className="py-3 px-4 text-center">روزهای تأخیر</th>
                  <th className="py-3 px-4">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {delayedOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{ord.orderNo}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{ord.item}</td>
                    <td className="py-3 px-4 text-slate-600">{ord.vendor}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{ord.promisedDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-black text-rose-700 bg-rose-50 border border-rose-200">
                        +{toPersianNumber(ord.delayDays)} روز
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{ord.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۴ — خریدهای تکراری */}
      {/* ========================================================================= */}
      <section id="rep-recurring" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۴ — خریدهای تکراری</h3>
          </div>
          <span className="text-xs text-slate-400">شناسایی خریدهای مکرر در فواصل کوتاه جهت اصلاح الگوی سفارش‌گذاری</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">نام قلم</th>
                  <th className="py-3 px-4 text-center">تعداد دفعات خرید</th>
                  <th className="py-3 px-4 text-center">آخرین خرید</th>
                  <th className="py-3 px-4 text-center">فاصله بین خریدها</th>
                  <th className="py-3 px-4">مقدار خریدهای قبلی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recurringPurchases.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        {rec.isWarning && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                        <div>
                          <div>{rec.itemName}</div>
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">{rec.warningNote}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {toPersianNumber(rec.purchaseCount)} بار
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{rec.lastPurchaseDate}</td>
                    <td className="py-3 px-4 text-center font-mono text-amber-800 font-bold">{rec.avgIntervalDays}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{rec.previousQuantities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۵ — میانگین زمان تأمین */}
      {/* ========================================================================= */}
      <section id="rep-avgtime" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۵ — میانگین زمان تأمین</h3>
          </div>
          <span className="text-xs text-slate-400">بررسی روند تسریع یا کندی فرآیند تدارکات در طول ماه‌ها</span>
        </div>

        {/* Top KPI Card */}
        <div className="bg-gradient-to-l from-indigo-500/10 via-indigo-50 to-white rounded-2xl border border-indigo-200 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-800">شاخص کلی سرعت تأمین</span>
            <h4 className="text-lg font-black text-slate-900 mt-1">میانگین زمان تأمین</h4>
          </div>
          <div className="flex items-baseline gap-1.5 bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-2xs">
            <span className="text-3xl font-black text-indigo-600 font-mono">
              {toPersianNumber(currentAvgLeadTime)}
            </span>
            <span className="text-xs font-bold text-slate-500">روز کاری</span>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800">نمودار خطی تغییرات میانگین زمان تأمین در ماه‌های اخیر</h4>
            <span className="text-[11px] text-slate-400">محور افقی: ماه | محور عمودی: میانگین روزهای سپری‌شده</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadTimeTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => toPersianNumber(v)}
                  domain={[15, 32]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                          <div className="font-bold">{data.month}</div>
                          <div className="text-indigo-300 font-mono">
                            میانگین زمان تأمین: {toPersianNumber(data.days)} روز
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="days"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};
