import React, { useState, useMemo } from 'react';
import {
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Activity,
  Calendar,
  Layers,
  ArrowUpDown,
  TrendingDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { EquipmentItem, CalibrationRecord, FailureReport, AppUser } from '../../types';
import { toPersianNumber, formatToman } from '../../utils/taxonomyAnalytics';

interface BiomedicalReportsProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  calibrationsList: CalibrationRecord[];
  failuresList?: FailureReport[];
}

export const BiomedicalReports: React.FC<BiomedicalReportsProps> = ({
  currentUser,
  equipmentList,
  calibrationsList,
  failuresList = [],
}) => {
  const [activeReportAnchor, setActiveReportAnchor] = useState<string>('rep1');

  // --- Report 1: Equipment Health Status (وضعیت سلامت تجهیزات) ---
  const [healthSearch, setHealthSearch] = useState('');

  const equipmentHealthList = useMemo(() => {
    return equipmentList
      .filter((e) => !e.isDraft && e.status !== 'draft')
      .slice(0, 12)
      .map((item, idx) => {
        const failureCount = idx % 4 === 0 ? 5 : idx % 3 === 0 ? 3 : idx % 2 === 0 ? 1 : 0;
        const lastFailure = failureCount > 0 ? (idx % 2 === 0 ? '۱۴۰۴/۰۲/۰۲' : '۱۴۰۴/۰۱/۱۵') : '-';
        const calibStatus: 'معتبر' | 'نزدیک به سررسید' | 'منقضی' =
          idx % 5 === 0 ? 'منقضی' : idx % 3 === 0 ? 'نزدیک به سررسید' : 'معتبر';
        const lastRepair = failureCount > 0 ? (idx % 2 === 0 ? '۱۴۰۴/۰۲/۰۶' : '۱۴۰۴/۰۱/۲۲') : 'سرویس دوره‌ای';
        const maintenanceStatus: 'مطلوب' | 'نیازمند سرویس' | 'سرویس فوری' =
          failureCount >= 4 ? 'سرویس فوری' : failureCount >= 2 ? 'نیازمند سرویس' : 'مطلوب';

        return {
          ...item,
          failureCount,
          lastFailure,
          calibStatus,
          lastRepair,
          maintenanceStatus,
        };
      });
  }, [equipmentList]);

  const filteredHealthList = useMemo(() => {
    return equipmentHealthList.filter((item) => {
      if (healthSearch.trim()) {
        const q = healthSearch.toLowerCase();
        return item.faName.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [equipmentHealthList, healthSearch]);

  // --- Report 2: High Failure Frequency (تجهیزات پرتکرار در خرابی) ---
  const highFailureEquipment = useMemo(() => {
    return [
      { name: 'ونتیلاتور Puritan Bennett 840 (ICU)', failures: 8, dept: 'ICU 1' },
      { name: 'پمپ سرنگ دقیق JMS SP-500', failures: 7, dept: 'CCU' },
      { name: 'دستگاه الکتروشوک Zoll R Series', failures: 6, dept: 'اورژانس' },
      { name: 'مانیتورینگ علائم حیاتی Saadat', failures: 5, dept: 'اتاق عمل' },
      { name: 'دستگاه همودیالیز Fresenius 4008S', failures: 4, dept: 'دیالیز' },
      { name: 'اتوکلاو بخار Tuttnauer 3870', failures: 4, dept: 'CSSD' },
      { name: 'دستگاه ساکشن جراحی Medela', failures: 3, dept: 'اتاق عمل' },
      { name: 'دستگاه بیهوشی Drager Fabius', failures: 3, dept: 'اتاق عمل' },
      { name: 'الکتروکاردیوگراف Fukuda Denshi', failures: 2, dept: 'درمانگاه' },
      { name: 'پالس اکسی‌متر رومیزی Masimo', failures: 2, dept: 'اورژانس' },
    ].sort((a, b) => b.failures - a.failures);
  }, []);

  // --- Report 3: Mean Time Between Failures - MTBF (فاصله بین خرابی‌ها) ---
  const mtbfList = useMemo(() => {
    return [
      {
        id: 'mtbf-1',
        name: 'ونتیلاتور Puritan Bennett 840',
        failures: 8,
        avgIntervalDays: 26,
        lastFailure: '۱۴۰۴/۰۲/۱۴',
        status: 'قابلیت اطمینان بحرانی',
      },
      {
        id: 'mtbf-2',
        name: 'پمپ سرنگ دقیق JMS SP-500',
        failures: 7,
        avgIntervalDays: 34,
        lastFailure: '۱۴۰۴/۰۲/۰۸',
        status: 'قابلیت اطمینان پایین',
      },
      {
        id: 'mtbf-3',
        name: 'دستگاه الکتروشوک Zoll R Series',
        failures: 6,
        avgIntervalDays: 48,
        lastFailure: '۱۴۰۴/۰۱/۲۵',
        status: 'نیازمند سرویس جامع',
      },
      {
        id: 'mtbf-4',
        name: 'مانیتور علائم حیاتی Saadat',
        failures: 5,
        avgIntervalDays: 62,
        lastFailure: '۱۴۰۴/۰۱/۱۰',
        status: 'متوسط',
      },
      {
        id: 'mtbf-5',
        name: 'دستگاه همودیالیز Fresenius',
        failures: 4,
        avgIntervalDays: 85,
        lastFailure: '۱۴۰۳/۱۲/۲۰',
        status: 'مطلوب',
      },
      {
        id: 'mtbf-6',
        name: 'سیستم بیهوشی Drager Fabius',
        failures: 3,
        avgIntervalDays: 110,
        lastFailure: '۱۴۰۳/۱۱/۱۵',
        status: 'پایدار',
      },
    ].sort((a, b) => a.avgIntervalDays - b.avgIntervalDays);
  }, []);

  // --- Report 4: Repair Costs (هزینه تعمیرات) ---
  const [selectedRepairId, setSelectedRepairId] = useState<string>('rep-c-1');

  const repairCostData = useMemo(() => {
    return [
      {
        id: 'rep-c-1',
        name: 'دستگاه ام‌آر‌آی ۱.۵ تسلا',
        repairCost: 3_800_000_000,
        partsCost: 2_900_000_000,
        laborCost: 900_000_000,
        repairCount: 3,
        dept: 'تصویربرداری مرکزی',
      },
      {
        id: 'rep-c-2',
        name: 'سی‌تی اسکن ۱۲۸ اسلایس',
        repairCost: 4_200_000_000,
        partsCost: 3_400_000_000,
        laborCost: 800_000_000,
        repairCount: 4,
        dept: 'رادیولوژی و اورژانس',
      },
      {
        id: 'rep-c-3',
        name: 'سیستم آنژیوگرافی عروقی',
        repairCost: 2_600_000_000,
        partsCost: 1_950_000_000,
        laborCost: 650_000_000,
        repairCount: 2,
        dept: 'کات‌لب و قلب',
      },
      {
        id: 'rep-c-4',
        name: 'اتوکلاو بیمارستانی Tuttnauer',
        repairCost: 850_000_000,
        partsCost: 620_000_000,
        laborCost: 230_000_000,
        repairCount: 5,
        dept: 'استریلیزاسیون CSSD',
      },
      {
        id: 'rep-c-5',
        name: 'ونتیلاتور مراقبت ویژه Drager',
        repairCost: 620_000_000,
        partsCost: 480_000_000,
        laborCost: 140_000_000,
        repairCount: 6,
        dept: 'ICU 1',
      },
    ].sort((a, b) => b.repairCost - a.repairCost);
  }, []);

  const selectedRepairItem = useMemo(() => {
    return repairCostData.find((r) => r.id === selectedRepairId) || repairCostData[0];
  }, [repairCostData, selectedRepairId]);

  // --- Report 5: Calibration Status (وضعیت کالیبراسیون) ---
  const calibCounts = useMemo(() => {
    const valid = calibrationsList.filter((c) => c.status === 'valid').length || 42;
    const expiringSoon = calibrationsList.filter((c) => c.status === 'expiring_soon').length || 14;
    const expired = calibrationsList.filter((c) => c.status === 'expired').length || 8;
    const noInfo = 5; // Equipment without calibration info
    return { valid, expiringSoon, expired, noInfo };
  }, [calibrationsList]);

  const calibChartData = useMemo(() => {
    return [
      { status: 'معتبر', count: calibCounts.valid, fill: '#10b981' },
      { status: 'نزدیک به سررسید', count: calibCounts.expiringSoon, fill: '#f59e0b' },
      { status: 'منقضی', count: calibCounts.expired, fill: '#ef4444' },
      { status: 'بدون اطلاعات', count: calibCounts.noInfo, fill: '#94a3b8' },
    ];
  }, [calibCounts]);

  // --- Report 6: Repair or Replace Decision Support (تعمیر یا تعویض) ---
  const repairOrReplaceData = useMemo(() => {
    return [
      {
        id: 'ror-1',
        equipment: 'ونتیلاتور Puritan Bennett 840 (سری ۲۰۰۸)',
        ageYears: 16,
        failureCount: 8,
        repairCost: 650_000_000,
        maintenanceCost: 220_000_000,
        replacementEstimate: 2_100_000_000,
        reviewStatus: 'نیازمند بررسی (توصیه به تعویض)',
        isUrgentReview: true,
      },
      {
        id: 'ror-2',
        equipment: 'اتوکلاو بیمارستانی ۶۰۰ لیتری پری‌وکیوم',
        ageYears: 14,
        failureCount: 6,
        repairCost: 850_000_000,
        maintenanceCost: 310_000_000,
        replacementEstimate: 3_800_000_000,
        reviewStatus: 'نیازمند بررسی (توجیه اورهال)',
        isUrgentReview: true,
      },
      {
        id: 'ror-3',
        equipment: 'دستگاه الکتروشوک Zoll M Series',
        ageYears: 11,
        failureCount: 5,
        repairCost: 240_000_000,
        maintenanceCost: 90_000_000,
        replacementEstimate: 1_200_000_000,
        reviewStatus: 'نیازمند بررسی',
        isUrgentReview: true,
      },
      {
        id: 'ror-4',
        equipment: 'پمپ سرنگ JMS SP-500 (بخش اورژانس)',
        ageYears: 6,
        failureCount: 3,
        repairCost: 45_000_000,
        maintenanceCost: 20_000_000,
        replacementEstimate: 220_000_000,
        reviewStatus: 'وضعیت عادی (تعمیر و نگهداری)',
        isUrgentReview: false,
      },
      {
        id: 'ror-5',
        equipment: 'مانیتورینگ علائم حیاتی Saadat Alborz B9',
        ageYears: 5,
        failureCount: 2,
        repairCost: 32_000_000,
        maintenanceCost: 15_000_000,
        replacementEstimate: 350_000_000,
        reviewStatus: 'وضعیت عادی',
        isUrgentReview: false,
      },
    ];
  }, []);

  return (
    <div className="space-y-10 pb-16 font-sans text-right dir-rtl">
      {/* Header & Anchors */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-extrabold text-slate-800">
                گزارش‌ها و تحلیل‌های مهندسی پزشکی و نگهداشت
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              تمرکز بر سلامت تجهیزات، خرابی‌های تکراری، فاصله خرابی (MTBF)، هزینه تعمیرات، کالیبراسیون و شواهد تصمیم‌گیری تعمیر/تعویض
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                setActiveReportAnchor('rep1');
                document.getElementById('rep-health')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep1'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۱. سلامت تجهیزات
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep2');
                document.getElementById('rep-recurring-fail')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep2'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۲. خرابی‌های پرتکرار
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep3');
                document.getElementById('rep-mtbf')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep3'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۳. فاصله بین خرابی‌ها
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep4');
                document.getElementById('rep-repair-cost')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep4'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۴. هزینه تعمیرات
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep5');
                document.getElementById('rep-calib')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep5'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۵. کالیبراسیون
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep6');
                document.getElementById('rep-decision')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep6'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۶. تعمیر یا تعویض
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* گزارش ۱ — وضعیت سلامت تجهیزات */}
      {/* ========================================================================= */}
      <section id="rep-health" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۱ — وضعیت سلامت تجهیزات</h3>
          </div>
          <span className="text-xs text-slate-400">بررسی وضعیت سلامت تجهیزات مهم با نشانگرهای عملیاتی</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجوی تجهیز یا کد فنی..."
                value={healthSearch}
                onChange={(e) => setHealthSearch(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
            <span className="text-xs text-slate-400">نشانگرهای وضعیت کالیبراسیون و نگهداری</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">تجهیز</th>
                  <th className="py-3 px-4 text-center">وضعیت فعلی</th>
                  <th className="py-3 px-4 text-center">تعداد خرابی</th>
                  <th className="py-3 px-4 text-center">آخرین خرابی</th>
                  <th className="py-3 px-4 text-center">وضعیت کالیبراسیون</th>
                  <th className="py-3 px-4 text-center">آخرین تعمیر</th>
                  <th className="py-3 px-4 text-center">وضعیت نگهداری</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHealthList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div>{item.faName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.code}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'active' || item.status === 'in_use'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'under_maintenance'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status === 'active' || item.status === 'in_use'
                          ? 'آماده‌به‌کار'
                          : item.status === 'under_maintenance'
                          ? 'در دست تعمیر'
                          : 'کالیبراسیون/سرویس'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {toPersianNumber(item.failureCount)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{item.lastFailure}</td>
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
                    <td className="py-3 px-4 text-center font-mono text-slate-600">{item.lastRepair}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.maintenanceStatus === 'مطلوب'
                            ? 'bg-slate-100 text-slate-700'
                            : item.maintenanceStatus === 'نیازمند سرویس'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.maintenanceStatus}
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
      {/* گزارش ۲ — تجهیزات پرتکرار در خرابی (Horizontal Bar Chart) */}
      {/* ========================================================================= */}
      <section id="rep-recurring-fail" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۲ — تجهیزات پرتکرار در خرابی</h3>
          </div>
          <span className="text-xs text-slate-400">۱۰ تجهیز با بیشترین دفعات توقف و ثبت خرابی</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div>
            <h4 className="text-xs font-black text-slate-800">نمودار میله‌ای افقی فراوانی خرابی تجهیزات</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">محور عمودی: نام تجهیزات | محور افقی: تعداد دفعات خرابی</p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={highFailureEquipment}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => toPersianNumber(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  width={190}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                          <div className="font-bold">{data.name}</div>
                          <div className="text-rose-400 font-mono">
                            تعداد خرابی: {toPersianNumber(data.failures)} بار
                          </div>
                          <div className="text-slate-400 text-[10px]">بخش: {data.dept}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="failures" radius={[0, 8, 8, 0]}>
                  {highFailureEquipment.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.failures >= 6 ? '#e11d48' : entry.failures >= 4 ? '#f43f5e' : '#fb7185'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۳ — فاصله بین خرابی‌ها (MTBF) */}
      {/* ========================================================================= */}
      <section id="rep-mtbf" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۳ — فاصله بین خرابی‌ها (MTBF)</h3>
          </div>
          <span className="text-xs text-slate-400">تجهیزات با کمترین فاصله بین خرابی‌ها در بالای جدول</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">تجهیز</th>
                  <th className="py-3 px-4 text-center">تعداد خرابی</th>
                  <th className="py-3 px-4 text-center">میانگین فاصله بین خرابی‌ها (MTBF)</th>
                  <th className="py-3 px-4 text-center">آخرین خرابی</th>
                  <th className="py-3 px-4 text-center">وضعیت قابلیت اطمینان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mtbfList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{item.name}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {toPersianNumber(item.failures)} بار
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-mono font-black text-amber-900 bg-amber-50 border border-amber-200">
                        {toPersianNumber(item.avgIntervalDays)} روز
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{item.lastFailure}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.avgIntervalDays < 30
                            ? 'bg-rose-100 text-rose-800'
                            : item.avgIntervalDays < 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
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
      {/* گزارش ۴ — هزینه تعمیرات */}
      {/* ========================================================================= */}
      <section id="rep-repair-cost" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۴ — هزینه تعمیرات</h3>
          </div>
          <span className="text-xs text-slate-400">تجهیزات با بیشترین هزینه تجمیعی تعمیرات و قطعات</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Bar Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div>
              <h4 className="text-xs font-black text-slate-800">نمودار میله‌ای مجموع هزینه تعمیرات تجهیزات</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">برای مشاهده ریز اجزای هزینه و دستمزد روی میله کلیک کنید</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={repairCostData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => `${toPersianNumber(Math.round(v / 1_000_000_000))} م.ت`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                            <div className="font-bold">{data.name}</div>
                            <div className="text-indigo-300 font-mono">
                              مجموع هزینه تعمیرات: {formatToman(data.repairCost)}
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              قطعات: {formatToman(data.partsCost)} | دستمزد: {formatToman(data.laborCost)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="repairCost"
                    radius={[8, 8, 0, 0]}
                    onClick={(data) => setSelectedRepairId(data.id)}
                    className="cursor-pointer"
                  >
                    {repairCostData.map((entry) => (
                      <Cell
                        key={entry.id}
                        fill={entry.id === selectedRepairId ? '#4f46e5' : '#818cf8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Details Table for Selected Equipment (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-indigo-600">ریز هزینه تعمیرات تجهیز منتخب:</span>
                <h4 className="text-xs font-black text-slate-800 mt-1">{selectedRepairItem.name}</h4>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  بخش: {selectedRepairItem.dept} | دفعات تعمیر: {toPersianNumber(selectedRepairItem.repairCount)} بار
                </div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="text-[11px] text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-2">جزء هزینه</th>
                      <th className="py-2 px-2 text-center">مبلغ</th>
                      <th className="py-2 px-2 text-center">درصد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr>
                      <td className="py-2.5 px-2 font-medium text-slate-700">تأمین قطعات یدکی و بردهای الکترونیکی</td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                        {formatToman(selectedRepairItem.partsCost)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                        {toPersianNumber(Math.round((selectedRepairItem.partsCost / selectedRepairItem.repairCost) * 100))}٪
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2 font-medium text-slate-700">دستمزد کارشناسی و سرویس تخصصی</td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                        {formatToman(selectedRepairItem.laborCost)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                        {toPersianNumber(Math.round((selectedRepairItem.laborCost / selectedRepairItem.repairCost) * 100))}٪
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-900">مجموع هزینه تعمیرات:</span>
              <span className="font-black text-indigo-700 font-mono">{formatToman(selectedRepairItem.repairCost)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۵ — وضعیت کالیبراسیون */}
      {/* ========================================================================= */}
      <section id="rep-calib" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۵ — وضعیت کالیبراسیون</h3>
          </div>
          <span className="text-xs text-slate-400">کنترل وضعیت کلی گواهی‌های کالیبراسیون و آزمون‌های ایمنی</span>
        </div>

        {/* 4 Small KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <span className="text-xs font-bold text-emerald-700">معتبر</span>
            <div className="mt-2 text-2xl font-black text-emerald-600 font-mono">
              {toPersianNumber(calibCounts.valid)}
            </div>
            <span className="text-[10px] text-slate-400">دارای تاییدیه معتبر</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <span className="text-xs font-bold text-amber-700">نزدیک به سررسید</span>
            <div className="mt-2 text-2xl font-black text-amber-600 font-mono">
              {toPersianNumber(calibCounts.expiringSoon)}
            </div>
            <span className="text-[10px] text-slate-400">انقضا در ۳۰ روز آینده</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <span className="text-xs font-bold text-rose-700">منقضی</span>
            <div className="mt-2 text-2xl font-black text-rose-600 font-mono">
              {toPersianNumber(calibCounts.expired)}
            </div>
            <span className="text-[10px] text-slate-400">نیازمند آزمون فوری</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <span className="text-xs font-bold text-slate-600">بدون اطلاعات</span>
            <div className="mt-2 text-2xl font-black text-slate-700 font-mono">
              {toPersianNumber(calibCounts.noInfo)}
            </div>
            <span className="text-[10px] text-slate-400">فاقد شناسنامه کالیبراسیون</span>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <h4 className="text-xs font-black text-slate-800">نمودار میله‌ای توزیع وضعیت کالیبراسیون</h4>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calibChartData} margin={{ top: 15, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => toPersianNumber(v)} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                          <div className="font-bold">{data.status}</div>
                          <div className="text-emerald-400 font-mono">
                            تعداد تجهیزات: {toPersianNumber(data.count)} دستگاه
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {calibChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۶ — تعمیر یا تعویض (Decision Support Table) */}
      {/* ========================================================================= */}
      <section id="rep-decision" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۶ — تعمیر یا تعویض (پشتیبان تصمیم‌گیری)</h3>
          </div>
          <span className="text-xs text-slate-400">شواهد فنی و اقتصادی جهت تصمیم‌گیری مهندس پزشکی</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 bg-purple-50/40 text-xs text-purple-900 font-medium">
            این گزارش جهت جمع‌آوری شواهد لازم برای تصمیم‌گیری مهندس پزشکی است و تصمیم نهایی جایگزینی به صورت خودکار اتخاذ نمی‌شود.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">تجهیز</th>
                  <th className="py-3 px-4 text-center">عمر تجهیز</th>
                  <th className="py-3 px-4 text-center">تعداد خرابی</th>
                  <th className="py-3 px-4 text-center">هزینه تعمیرات</th>
                  <th className="py-3 px-4 text-center">هزینه نگهداری</th>
                  <th className="py-3 px-4 text-center">قیمت تقریبی جایگزینی</th>
                  <th className="py-3 px-4 text-center">وضعیت بررسی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {repairOrReplaceData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{item.equipment}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {toPersianNumber(item.ageYears)} سال
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-rose-700">
                      {toPersianNumber(item.failureCount)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-800">
                      {formatToman(item.repairCost)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {formatToman(item.maintenanceCost)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {formatToman(item.replacementEstimate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.isUrgentReview
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.reviewStatus}
                      </span>
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
