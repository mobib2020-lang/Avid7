import React, { useState, useMemo } from 'react';
import {
  Users,
  Activity,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Wrench,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { PurchaseRequest, EquipmentItem, AppUser, TaskEvent, CalibrationRecord } from '../../types';
import { toPersianNumber, formatToman } from '../../utils/taxonomyAnalytics';

interface DeptHeadReportsProps {
  currentUser?: AppUser;
  purchaseRequests: PurchaseRequest[];
  equipmentList: EquipmentItem[];
  tasksList?: TaskEvent[];
  calibrationsList?: CalibrationRecord[];
}

export const DeptHeadReports: React.FC<DeptHeadReportsProps> = ({
  currentUser,
  purchaseRequests,
  equipmentList,
  tasksList = [],
  calibrationsList = [],
}) => {
  const [activeReportAnchor, setActiveReportAnchor] = useState<string>('rep1');

  const deptName = currentUser?.department || 'بخش مراقبت‌های ویژه (ICU)';

  // --- Report 1: Department Performance (عملکرد بخش) ---
  const deptEquipment = useMemo(() => {
    return equipmentList.filter(
      (e) => !e.isDraft && e.status !== 'draft' && (e.department?.includes('ICU') || e.department?.includes('ویژه') || true)
    );
  }, [equipmentList]);

  const readinessPct = 94.2;
  const monthFailuresCount = 3;

  // --- Report 2: Team Attention Needed (نیاز به توجه تیم) ---
  const overdueTasksCount = 4;
  const uncalibratedCount = 2;

  // --- Report 3: Department Equipment Status (وضعیت تجهیزات بخش) ---
  const [equipSearch, setEquipSearch] = useState('');

  const deptEquipTableData = useMemo(() => {
    return [
      {
        id: 'de-1',
        name: 'ونتیلاتور پرتابل Puritan Bennett 840',
        status: 'آماده‌به‌کار',
        statusType: 'active',
        failureCount: 2,
        lastRepair: '۱۴۰۴/۰۱/۲۲',
        calibStatus: 'معتبر',
      },
      {
        id: 'de-2',
        name: 'مانیتورینگ علائم حیاتی Saadat B9',
        status: 'آماده‌به‌کار',
        statusType: 'active',
        failureCount: 1,
        lastRepair: '۱۴۰۳/۱۲/۱۵',
        calibStatus: 'معتبر',
      },
      {
        id: 'de-3',
        name: 'پمپ سرنگ JMS SP-500',
        status: 'در دست تعمیر',
        statusType: 'under_maintenance',
        failureCount: 4,
        lastRepair: '۱۴۰۴/۰۲/۰۸',
        calibStatus: 'نزدیک به سررسید',
      },
      {
        id: 'de-4',
        name: 'دستگاه الکتروشوک دفیبریلاتور Zoll',
        status: 'آماده‌به‌کار',
        statusType: 'active',
        failureCount: 0,
        lastRepair: 'سرویس دوره‌ای',
        calibStatus: 'معتبر',
      },
      {
        id: 'de-5',
        name: 'پالس اکسی‌متر انگشتی Masimo Rad-8',
        status: 'نیاز به کالیبراسیون',
        statusType: 'calib_needed',
        failureCount: 1,
        lastRepair: '۱۴۰۳/۱۱/۱۰',
        calibStatus: 'منقضی',
      },
    ];
  }, []);

  const filteredDeptEquip = useMemo(() => {
    return deptEquipTableData.filter((item) => {
      if (equipSearch.trim()) {
        return item.name.toLowerCase().includes(equipSearch.toLowerCase());
      }
      return true;
    });
  }, [deptEquipTableData, equipSearch]);

  // --- Report 4: Purchase Request Funnel (قیف درخواست‌های خرید بخش) ---
  const funnelStages = useMemo(() => {
    return [
      { id: 1, stageName: 'ثبت‌شده', count: 8, totalAmount: 480_000_000, desc: 'درخواست‌های اولیه کادر بخش' },
      { id: 2, stageName: 'در انتظار تأیید', count: 5, totalAmount: 320_000_000, desc: 'در کارتابل مالی یا مهندسی پزشکی' },
      { id: 3, stageName: 'تأییدشده', count: 3, totalAmount: 210_000_000, desc: 'تأیید نهایی بودجه و مدیریت اموال' },
      { id: 4, stageName: 'در حال خرید', count: 2, totalAmount: 140_000_000, desc: 'سفارش‌گذاری تدارکات با تأمین‌کننده' },
      { id: 5, stageName: 'تحویل‌شده', count: 6, totalAmount: 390_000_000, desc: 'ورود کالا به انبار و استقرار در بخش' },
    ];
  }, []);

  // --- Report 5: Department Costs (هزینه‌های بخش) ---
  const deptCostBreakdown = useMemo(() => {
    const items = [
      { type: 'تعمیرات و نگهداری تخصصی', amount: 85_000_000 },
      { type: 'خرید تجهیزات و ادوات جدید', amount: 240_000_000 },
      { type: 'قطعات و ملزومات مصرفی', amount: 95_000_000 },
      { type: 'کالیبراسیون و آزمون‌های دوره‌ای', amount: 18_000_000 },
    ];
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return {
      totalMonthCost: total,
      rows: items.map((i) => ({
        ...i,
        sharePct: Math.round((i.amount / total) * 100),
      })),
    };
  }, []);

  return (
    <div className="space-y-10 pb-16 font-sans text-right dir-rtl">
      {/* Header & Anchors */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-800">
                گزارش‌ها و تحلیل‌های مدیریتی بخش ({deptName})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              پایش عملکرد تجهیزاتی بخش، توجهات تیم، پیگیری قیف تدارکات و تفکیک مخارج ماهانه
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                setActiveReportAnchor('rep1');
                document.getElementById('rep-perf')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep1'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۱. عملکرد بخش
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep2');
                document.getElementById('rep-attention')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep2'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۲. نیاز به توجه تیم
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep3');
                document.getElementById('rep-eq-status')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep3'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۳. وضعیت تجهیزات
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep4');
                document.getElementById('rep-funnel')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep4'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۴. قیف خرید بخش
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep5');
                document.getElementById('rep-costs')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep5'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۵. هزینه‌های بخش
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* گزارش ۱ — عملکرد بخش */}
      {/* ========================================================================= */}
      <section id="rep-perf" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۱ — شاخص‌های کلیدی عملکرد بخش</h3>
          </div>
          <span className="text-xs text-slate-400">شاخص‌های فوری بهره‌وری و پایداری خدمت‌رسانی</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <span className="text-xs text-emerald-700 font-bold">درصد آمادگی تجهیزات بخش</span>
            <div className="mt-2 text-3xl font-black text-slate-900 font-mono">
              {toPersianNumber(readinessPct)}٪
            </div>
            <p className="text-[11px] text-slate-400 mt-1">نسبت ادوات فعال و آماده ارائه خدمت به کل موجودی بخش</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <span className="text-xs text-rose-700 font-bold">خرابی‌های این ماه بخش</span>
            <div className="mt-2 text-3xl font-black text-rose-600 font-mono">
              {toPersianNumber(monthFailuresCount)} مورد
            </div>
            <p className="text-[11px] text-slate-400 mt-1">گزارش‌های خرابی و توقف فنی ثبت‌شده طی ماه جاری</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۲ — نیاز به توجه تیم */}
      {/* ========================================================================= */}
      <section id="rep-attention" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۲ — نیاز به توجه تیم</h3>
          </div>
          <span className="text-xs text-slate-400">موارد نیازمند پیگیری سرپرست و هماهنگی درون‌بخشی</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-l from-amber-500/10 via-amber-50 to-white rounded-2xl border border-amber-200 p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-800">تسک‌های عملیاتی معوق</span>
              <h4 className="text-base font-black text-slate-900 mt-1">کارهای معوق بخش</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">وظایف و چک‌لیست‌های پرسنل گذشته از موعد</p>
            </div>
            <div className="text-3xl font-black text-amber-600 font-mono bg-white px-3 py-1.5 rounded-xl border border-amber-200">
              {toPersianNumber(overdueTasksCount)}
            </div>
          </div>

          <div className="bg-gradient-to-l from-rose-500/10 via-rose-50 to-white rounded-2xl border border-rose-200 p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-800">انطباق استاندارد و ایمنی</span>
              <h4 className="text-base font-black text-slate-900 mt-1">تجهیزات بدون کالیبراسیون معتبر</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">نیازمند هماهنگی آزمون دوره‌ای با مهندسی پزشکی</p>
            </div>
            <div className="text-3xl font-black text-rose-600 font-mono bg-white px-3 py-1.5 rounded-xl border border-rose-200">
              {toPersianNumber(uncalibratedCount)}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۳ — وضعیت تجهیزات بخش */}
      {/* ========================================================================= */}
      <section id="rep-eq-status" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۳ — وضعیت تجهیزات بخش</h3>
          </div>
          <span className="text-xs text-slate-400">شناسنامه سلامت و نگهداشت اقلام مستقر در بخش</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجوی تجهیزات بخش..."
                value={equipSearch}
                onChange={(e) => setEquipSearch(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
            <span className="text-xs text-slate-400">{toPersianNumber(filteredDeptEquip.length)} دستگاه</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">تجهیز</th>
                  <th className="py-3 px-4 text-center">وضعیت</th>
                  <th className="py-3 px-4 text-center">تعداد خرابی</th>
                  <th className="py-3 px-4 text-center">آخرین تعمیر</th>
                  <th className="py-3 px-4 text-center">وضعیت کالیبراسیون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeptEquip.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{item.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.statusType === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.statusType === 'under_maintenance'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {toPersianNumber(item.failureCount)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">{item.lastRepair}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.calibStatus === 'معتبر'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.calibStatus === 'نزدیک به سررسید'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.calibStatus}
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
      {/* گزارش ۴ — قیف درخواست‌های خرید بخش (Funnel) */}
      {/* ========================================================================= */}
      <section id="rep-funnel" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۴ — قیف درخواست‌های خرید بخش (Funnel)</h3>
          </div>
          <span className="text-xs text-slate-400">پیگیری گردش ۵ مرحله‌ای نیازهای خرید بخش و بار مالی تجمیعی</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {funnelStages.map((st, idx) => (
              <div
                key={st.id}
                className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 flex flex-col justify-between space-y-3 relative"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">مرحله {toPersianNumber(st.id)}</span>
                    <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {toPersianNumber(st.count)} درخواست
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-teal-900 mt-2">{st.stageName}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{st.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="text-[10px] text-slate-400">مبلغ تجمیعی:</div>
                  <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                    {formatToman(st.totalAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۵ — هزینه‌های بخش */}
      {/* ========================================================================= */}
      <section id="rep-costs" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۵ — هزینه‌های بخش</h3>
          </div>
          <span className="text-xs text-slate-400">مجموع و ساختار تفکیکی مخارج ماه جاری بخش</span>
        </div>

        {/* Big KPI Card */}
        <div className="bg-gradient-to-l from-emerald-500/10 via-emerald-50 to-white rounded-2xl border border-emerald-200 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800">بودجه مصرفی ماه جاری</span>
            <h4 className="text-base font-black text-slate-900 mt-1">مجموع هزینه این ماه بخش</h4>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono bg-white px-4 py-2 rounded-xl border border-emerald-100 shadow-2xs">
            {formatToman(deptCostBreakdown.totalMonthCost)}
          </div>
        </div>

        {/* Cost Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">نوع هزینه</th>
                  <th className="py-3 px-4 text-center">مبلغ</th>
                  <th className="py-3 px-4 text-center">سهم از کل مخارج بخش</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptCostBreakdown.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{row.type}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {formatToman(row.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono font-bold text-slate-700">{toPersianNumber(row.sharePct)}٪</span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${row.sharePct}%` }}
                          />
                        </div>
                      </div>
                    </td>
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
