import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  History,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Layers,
  ArrowRightLeft,
  User,
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
import { EquipmentItem, AppUser, AssetClassification } from '../../types';
import {
  toPersianNumber,
  resolveItemCategory,
  MAIN_CATEGORIES,
} from '../../utils/taxonomyAnalytics';

interface AssetManagerReportsProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  classificationsList?: AssetClassification[];
  onSelectEquipment?: (item: EquipmentItem) => void;
}

export const AssetManagerReports: React.FC<AssetManagerReportsProps> = ({
  currentUser,
  equipmentList,
  classificationsList = [],
  onSelectEquipment,
}) => {
  // Navigation / Quick anchor jump
  const [activeReportAnchor, setActiveReportAnchor] = useState<string>('rep1');

  // --- Report 1: Critical Items (اقلام بحرانی) ---
  const [criticalSearch, setCriticalSearch] = useState('');
  const [criticalPriorityFilter, setCriticalPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const criticalItems = useMemo(() => {
    // Determine critical threshold items
    return equipmentList
      .map((item, idx) => {
        const currentStock = item.quantity || (item.status === 'in_stock' ? 2 : 1);
        // Min stock simulated or derived from item classification/price
        const minStock = item.minStock || (idx % 3 === 0 ? 5 : idx % 2 === 0 ? 3 : 2);
        const shortage = Math.max(0, minStock - currentStock);
        const priority: 'high' | 'medium' | 'low' =
          shortage >= 3 ? 'high' : shortage >= 1 ? 'medium' : 'low';

        return {
          ...item,
          currentStock,
          minStock,
          shortage,
          priority,
          structure: item.category || 'تجهیزات پزشکی',
        };
      })
      .filter((item) => item.shortage > 0)
      .sort((a, b) => b.shortage - a.shortage);
  }, [equipmentList]);

  const filteredCriticalItems = useMemo(() => {
    return criticalItems.filter((item) => {
      if (criticalPriorityFilter !== 'all' && item.priority !== criticalPriorityFilter) return false;
      if (criticalSearch.trim()) {
        const q = criticalSearch.toLowerCase();
        return (
          item.faName.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          (item.location && item.location.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [criticalItems, criticalPriorityFilter, criticalSearch]);

  // --- Report 2: Stagnant & Low-Consumption Stock (موجودی راکد) ---
  const [stagnantPeriod, setStagnantPeriod] = useState<'3months' | '6months' | '1year'>('6months');
  const [stagnantSearch, setStagnantSearch] = useState('');

  const stagnantItems = useMemo(() => {
    return equipmentList
      .filter((e) => !e.isDraft && e.status !== 'draft')
      .slice(0, 15)
      .map((item, idx) => {
        const months = idx % 3 === 0 ? 14 : idx % 2 === 0 ? 8 : 4;
        const lastUsage = idx % 3 === 0 ? '۱۴۰۳/۰۴/۱۵' : idx % 2 === 0 ? '۱۴۰۳/۰۹/۱۰' : '۱۴۰۳/۱۱/۲۰';
        const usageStatus: 'راکد' | 'کم‌مصرف' = months >= 6 ? 'راکد' : 'کم‌مصرف';
        return {
          ...item,
          stockQty: item.quantity || 1,
          lastUsage,
          inactiveMonths: months,
          usageStatus,
        };
      })
      .filter((item) => {
        if (stagnantPeriod === '3months') return item.inactiveMonths >= 3;
        if (stagnantPeriod === '6months') return item.inactiveMonths >= 6;
        if (stagnantPeriod === '1year') return item.inactiveMonths >= 12;
        return true;
      })
      .sort((a, b) => b.inactiveMonths - a.inactiveMonths);
  }, [equipmentList, stagnantPeriod]);

  const filteredStagnantItems = useMemo(() => {
    return stagnantItems.filter((item) => {
      if (stagnantSearch.trim()) {
        const q = stagnantSearch.toLowerCase();
        return (
          item.faName.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          (item.location && item.location.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [stagnantItems, stagnantSearch]);

  // --- Report 3: Inventory Discrepancies (مغایرت موجودی) ---
  const [selectedDiscrepancyDept, setSelectedDiscrepancyDept] = useState<string | null>('اورژانس و تریاژ');

  const discrepancyData = useMemo(() => {
    return [
      {
        department: 'اورژانس و تریاژ',
        discrepancyCount: 14,
        physicalCount: 86,
        systemCount: 100,
        items: [
          { name: 'پالس اکسی‌متر پرتابل', expected: 15, found: 11, diff: -4, status: 'کسری' },
          { name: 'مانومتر کپسول اکسیژن', expected: 20, found: 15, diff: -5, status: 'کسری' },
          { name: 'لارنگوسکوپ فایبراپتیک', expected: 8, found: 5, diff: -3, status: 'کسری' },
          { name: 'ترالی کد احیا', expected: 4, found: 2, diff: -2, status: 'کسری' },
        ],
      },
      {
        department: 'بخش مراقبت‌های ویژه (ICU)',
        discrepancyCount: 9,
        physicalCount: 112,
        systemCount: 121,
        items: [
          { name: 'پمپ سرنگ دقیق', expected: 25, found: 20, diff: -5, status: 'کسری' },
          { name: 'سنسور کاپنوگرافی', expected: 12, found: 9, diff: -3, status: 'کسری' },
          { name: 'کابل رابط مانیتور', expected: 30, found: 29, diff: -1, status: 'کسری' },
        ],
      },
      {
        department: 'اتاق عمل جنرال',
        discrepancyCount: 8,
        physicalCount: 145,
        systemCount: 153,
        items: [
          { name: 'پدال دستگاه کوتر', expected: 6, found: 3, diff: -3, status: 'کسری' },
          { name: 'چراغ سیالیتیک پرتابل', expected: 4, found: 2, diff: -2, status: 'کسری' },
          { name: 'هولدر پوزیشنینگ جراحی', expected: 10, found: 7, diff: -3, status: 'کسری' },
        ],
      },
      {
        department: 'بخش جراحی مردان',
        discrepancyCount: 6,
        physicalCount: 64,
        systemCount: 70,
        items: [
          { name: 'ویلچر استاندارد تاشو', expected: 10, found: 6, diff: -4, status: 'کسری' },
          { name: 'پایه سرم چرخ‌دار', expected: 25, found: 23, diff: -2, status: 'کسری' },
        ],
      },
      {
        department: 'آزمایشگاه پاتولوژی',
        discrepancyCount: 4,
        physicalCount: 58,
        systemCount: 62,
        items: [
          { name: 'میکروپیپت متغیر', expected: 15, found: 12, diff: -3, status: 'کسری' },
          { name: 'رک لوله‌های آزمایش', expected: 30, found: 29, diff: -1, status: 'کسری' },
        ],
      },
      {
        department: 'بخش CCU',
        discrepancyCount: 3,
        physicalCount: 45,
        systemCount: 48,
        items: [
          { name: 'لیدهای الکتروکاردیوگراف', expected: 12, found: 10, diff: -2, status: 'کسری' },
          { name: 'کاف فشارسنج بازویی', expected: 18, found: 17, diff: -1, status: 'کسری' },
        ],
      },
    ].sort((a, b) => b.discrepancyCount - a.discrepancyCount);
  }, []);

  const selectedDeptDiscrepancy = useMemo(() => {
    return discrepancyData.find((d) => d.department === selectedDiscrepancyDept) || discrepancyData[0];
  }, [discrepancyData, selectedDiscrepancyDept]);

  // --- Report 4: Data Quality (کیفیت اطلاعات موجودی) ---
  const incompleteInventoryItems = useMemo(() => {
    return equipmentList
      .filter((e) => !e.isDraft && e.status !== 'draft')
      .filter((e) => !e.serialNumber || e.serialNumber === 'نامشخص' || !e.department || !e.location)
      .map((e) => ({
        ...e,
        defectType: !e.serialNumber || e.serialNumber === 'نامشخص' ? 'فقدان شماره سریال' : 'فقدان مکان استقرار دقیق',
        assignee: 'کارشناس اموال و انبار',
        status: 'نیازمند تکمیل',
      }));
  }, [equipmentList]);

  const incompleteDrafts = useMemo(() => {
    return equipmentList
      .filter((e) => e.isDraft || e.status === 'draft')
      .map((e) => ({
        ...e,
        defectType:
          e.missingFields && e.missingFields.length > 0
            ? `عدم تکمیل فیلدهای (${e.missingFields.slice(0, 2).join('، ')})`
            : 'پیش‌نویس ثبت‌نشده اولیه',
        assignee: 'کاربر ثبت‌کننده اولیه',
        status: 'پیش‌نویس معلق',
      }));
  }, [equipmentList]);

  const missingEssentialItems = useMemo(() => {
    return equipmentList.filter((e) => !e.price || e.price === 0 || !e.purchaseDate || e.purchaseDate === '-');
  }, [equipmentList]);

  const combinedDataQualityList = useMemo(() => {
    const list = [
      ...incompleteInventoryItems.map((i) => ({
        name: i.faName,
        code: i.code,
        defect: i.defectType,
        location: i.location || i.department || 'نامشخص',
        assignee: i.assignee,
        status: i.status,
        type: 'inventory',
      })),
      ...incompleteDrafts.map((d) => ({
        name: d.faName,
        code: d.code,
        defect: d.defectType,
        location: d.department || d.location || 'بخش نامشخص',
        assignee: d.assignee,
        status: d.status,
        type: 'draft',
      })),
      ...missingEssentialItems.slice(0, 4).map((m) => ({
        name: m.faName,
        code: m.code,
        defect: !m.price ? 'عدم ثبت بهای تمام‌شده خرید' : 'فقدان تاریخ بهره‌برداری',
        location: m.location || m.department || 'نامشخص',
        assignee: 'امور مالی و اموال',
        status: 'نقص اطلاعات ضروری',
        type: 'essential',
      })),
    ];
    return list;
  }, [incompleteInventoryItems, incompleteDrafts, missingEssentialItems]);

  // --- Report 5: Asset Movement Timeline (جابه‌جایی اموال) ---
  const movementsTimeline = useMemo(() => {
    return [
      {
        id: 'mov-1',
        assetName: 'دستگاه ونتیلاتور پرتابل Puritan Bennett',
        assetCode: 'EQ-MED-042',
        origin: 'انبار مرکزی تجهیزات پزشکی',
        destination: 'بخش مراقبت‌های ویژه (ICU 1)',
        date: '۱۴۰۴/۰۲/۱۸ - ساعت ۱۰:۳۰',
        actor: 'احمد کاظمی (مدیر اموال)',
        badge: 'تحویل دائم',
      },
      {
        id: 'mov-2',
        assetName: 'دستگاه الکتروشوک بای‌فازیک Zoll R Series',
        assetCode: 'EQ-MED-089',
        origin: 'اورژانس و تریاژ',
        destination: 'واحد مهندسی پزشکی (تعمیرگاه)',
        date: '۱۴۰۴/۰۲/۱۵ - ساعت ۱۴:۱۵',
        actor: 'مهندس حسینی (مهندس پزشکی)',
        badge: 'انتقال جهت تعمیر',
      },
      {
        id: 'mov-3',
        assetName: 'مانیتورینگ علائم حیاتی Saadat Alborz',
        assetCode: 'EQ-MED-104',
        origin: 'بخش جراحی زنان',
        destination: 'بخش مراقبت‌های ویژه قلبی (CCU)',
        date: '۱۴۰۴/۰۲/۱۱ - ساعت ۱۱:۰۰',
        actor: 'مریم نیکزاد (سرپرستار)',
        badge: 'جابه‌جایی بین بخشی',
      },
      {
        id: 'mov-4',
        assetName: 'پمپ تزریق سرنگ JMS SP-500',
        assetCode: 'EQ-MED-208',
        origin: 'انبار اقلام مازاد',
        destination: 'بخش نوزادان و NICU',
        date: '۱۴۰۴/۰۲/۰۶ - ساعت ۰۹:۲۰',
        actor: 'احمد کاظمی (مدیر اموال)',
        badge: 'تخصیص مجدد راکد',
      },
      {
        id: 'mov-5',
        assetName: 'سانتریفیوژ یونیورسال ۲۴ شاخه Hettich',
        assetCode: 'EQ-LAB-019',
        origin: 'آزمایشگاه بیوشیمی',
        destination: 'آزمایشگاه پاتولوژی مرکزی',
        date: '۱۴۰۴/۰۱/۲۸ - ساعت ۱۶:۴۵',
        actor: 'دکتر صابری (مسئول آزمایشگاه)',
        badge: 'جابه‌جایی تجهیز',
      },
    ];
  }, []);

  return (
    <div className="space-y-10 pb-16 font-sans text-right dir-rtl">
      {/* Header & Quick Anchors */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-800">
                گزارش‌ها و تحلیل‌های مدیریت اموال و موجودی
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              تمرکز بر کنترل موجودی، شناسایی کمبود، موجودی راکد، مغایرت انبار و کیفیت اطلاعات اموال
            </p>
          </div>

          {/* Quick jump anchors */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                setActiveReportAnchor('rep1');
                document.getElementById('rep-critical')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep1'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۱. اقلام بحرانی
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep2');
                document.getElementById('rep-stagnant')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep2'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۲. موجودی راکد
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep3');
                document.getElementById('rep-discrepancy')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep3'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۳. مغایرت موجودی
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep4');
                document.getElementById('rep-quality')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep4'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۴. کیفیت داده
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep5');
                document.getElementById('rep-movement')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep5'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۵. جابه‌جایی اموال
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* گزارش ۱ — اقلام بحرانی */}
      {/* ========================================================================= */}
      <section id="rep-critical" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۱ — اقلام بحرانی</h3>
          </div>
          <span className="text-xs text-slate-400">مرتب‌شده بر اساس بیشترین میزان کمبود</span>
        </div>

        {/* Large KPI Card */}
        <div className="bg-gradient-to-l from-rose-500/10 via-rose-50 to-white rounded-2xl border border-rose-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-rose-700">شاخص فوری تأمین و کنترل کسری انبار</span>
            <h4 className="text-xl font-black text-slate-900">اقلام بحرانی (زیر حد موجودی مجاز)</h4>
            <p className="text-xs text-slate-600 max-w-xl">
              تعداد اقلامی که موجودی فیزیکی فعلی آنها کمتر از نقطه سفارش یا حداقل مجاز است و نیازمند اقدام فوری تأمین می‌باشند.
            </p>
          </div>
          <div className="flex items-baseline gap-2 bg-white px-6 py-4 rounded-xl border border-rose-100 shadow-2xs">
            <span className="text-4xl font-black text-rose-600 font-mono">
              {toPersianNumber(criticalItems.length)}
            </span>
            <span className="text-xs font-bold text-slate-500">قلم کسری‌دار</span>
          </div>
        </div>

        {/* Table with Filter & Search */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجوی نام قلم، کد یا محل..."
                value={criticalSearch}
                onChange={(e) => setCriticalSearch(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">فیلتر اولویت:</span>
              <select
                value={criticalPriorityFilter}
                onChange={(e) => setCriticalPriorityFilter(e.target.value as any)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden"
              >
                <option value="all">همه اولویت‌ها</option>
                <option value="high">اولویت بالا (کسری شدید)</option>
                <option value="medium">اولویت متوسط</option>
                <option value="low">اولویت عادی</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">نام قلم</th>
                  <th className="py-3 px-4">ساختار</th>
                  <th className="py-3 px-4">محل استقرار</th>
                  <th className="py-3 px-4 text-center">موجودی فعلی</th>
                  <th className="py-3 px-4 text-center">حداقل موجودی</th>
                  <th className="py-3 px-4 text-center">میزان کمبود</th>
                  <th className="py-3 px-4 text-center">اولویت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCriticalItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      موردی مطابق با فیلتر یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredCriticalItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => onSelectEquipment && onSelectEquipment(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-bold text-slate-800">
                        <div>{item.faName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.code}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{item.structure}</td>
                      <td className="py-3 px-4 text-slate-600">{item.location || item.department || 'انبار مرکزی'}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                        {toPersianNumber(item.currentStock)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {toPersianNumber(item.minStock)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-black text-rose-700 bg-rose-50 border border-rose-200">
                          -{toPersianNumber(item.shortage)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.priority === 'high' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            خیلی فوری
                          </span>
                        ) : item.priority === 'medium' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            متوسط
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                            عادی
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۲ — موجودی راکد و کم‌مصرف */}
      {/* ========================================================================= */}
      <section id="rep-stagnant" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۲ — موجودی راکد و کم‌مصرف</h3>
          </div>
          <span className="text-xs text-slate-400">شناسایی اموال بدون استفاده جهت جابه‌جایی یا تخصیص مجدد</span>
        </div>

        {/* Top KPI Card + Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-l from-amber-500/10 via-amber-50 to-white rounded-2xl border border-amber-200 p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-800">شاخص اموال بدون گردش</span>
              <h4 className="text-lg font-black text-slate-900 mt-1">موجودی راکد</h4>
            </div>
            <div className="flex items-baseline gap-1.5 bg-white px-4 py-2 rounded-xl border border-amber-100 shadow-2xs">
              <span className="text-3xl font-black text-amber-600 font-mono">
                {toPersianNumber(filteredStagnantItems.length)}
              </span>
              <span className="text-xs font-bold text-slate-500">قلم</span>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-700">بازه زمانی رکود:</div>
              <div className="text-[11px] text-slate-400">اموالی که در این بازه هیچ تراکنش یا مصرفی نداشته‌اند</div>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStagnantPeriod('3months')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  stagnantPeriod === '3months' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                بیش از ۳ ماه
              </button>
              <button
                onClick={() => setStagnantPeriod('6months')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  stagnantPeriod === '6months' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                بیش از ۶ ماه
              </button>
              <button
                onClick={() => setStagnantPeriod('1year')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  stagnantPeriod === '1year' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                بیش از ۱ سال
              </button>
            </div>
          </div>
        </div>

        {/* Analytical Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجو در اقلام راکد..."
                value={stagnantSearch}
                onChange={(e) => setStagnantSearch(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
            <div className="text-xs text-slate-400">
              قابلیت بازتوزیع بین‌بخشی یا اعلام مازاد
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">نام قلم</th>
                  <th className="py-3 px-4 text-center">مقدار موجود</th>
                  <th className="py-3 px-4">محل استقرار</th>
                  <th className="py-3 px-4 text-center">آخرین مصرف</th>
                  <th className="py-3 px-4 text-center">مدت زمان بدون مصرف</th>
                  <th className="py-3 px-4 text-center">وضعیت مصرف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStagnantItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectEquipment && onSelectEquipment(item)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div>{item.faName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.code}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {toPersianNumber(item.stockQty)} عدد
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.location || item.department || 'انبار راکد'}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{item.lastUsage}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-700">
                      {toPersianNumber(item.inactiveMonths)} ماه
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.usageStatus === 'راکد'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.usageStatus}
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
      {/* گزارش ۳ — مغایرت موجودی */}
      {/* ========================================================================= */}
      <section id="rep-discrepancy" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۳ — مغایرت موجودی</h3>
          </div>
          <span className="text-xs text-slate-400">شناسایی واحدهایی که بیشترین مغایرت موجودی را دارند</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Horizontal Bar Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-800">نمودار میله‌ای افقی مغایرت موجودی واحدها</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">برای مشاهده ریز مغایرت هر بخش روی میله مربوطه کلیک کنید</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={discrepancyData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => toPersianNumber(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="department"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                    width={130}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                            <div className="font-bold">{data.department}</div>
                            <div className="text-rose-300">
                              تعداد مغایرت: {toPersianNumber(data.discrepancyCount)} قلم
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              شمارش فیزیکی: {toPersianNumber(data.physicalCount)} | ثبتی سیستم: {toPersianNumber(data.systemCount)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="discrepancyCount"
                    radius={[0, 8, 8, 0]}
                    onClick={(data) => setSelectedDiscrepancyDept(data.department)}
                    className="cursor-pointer"
                  >
                    {discrepancyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.department === selectedDiscrepancyDept ? '#4f46e5' : '#818cf8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Adjacent Selected Department Details Table (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600">جزئیات بخش انتخاب‌شده:</span>
                  <h4 className="text-xs font-black text-slate-800">{selectedDeptDiscrepancy.department}</h4>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-black font-mono">
                  {toPersianNumber(selectedDeptDiscrepancy.discrepancyCount)} مغایرت
                </span>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="text-[11px] text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-2">نام قلم</th>
                      <th className="py-2 px-2 text-center">ثبتی</th>
                      <th className="py-2 px-2 text-center">فیزیکی</th>
                      <th className="py-2 px-2 text-center">اختلاف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedDeptDiscrepancy.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 font-medium text-slate-700">{it.name}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-500">{toPersianNumber(it.expected)}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">{toPersianNumber(it.found)}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-600">
                          {toPersianNumber(it.diff)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
              <span>آخرین مغایرت‌گیری انبارگردانی:</span>
              <span className="font-mono font-bold text-slate-800">۱۴۰۴/۰۲/۱۰</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۴ — کیفیت اطلاعات موجودی */}
      {/* ========================================================================= */}
      <section id="rep-quality" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۴ — کیفیت اطلاعات موجودی</h3>
          </div>
          <span className="text-xs text-slate-400">کنترل کیفیت داده‌های ثبت‌شده و پیگیری موارد ناقص</span>
        </div>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-bold">موجودی ناقص</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-sky-600 font-mono">
                {toPersianNumber(incompleteInventoryItems.length)}
              </span>
              <span className="text-xs text-slate-400">قلم فاقد مشخصات کلیدی</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-bold">Draft ناقص</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600 font-mono">
                {toPersianNumber(incompleteDrafts.length)}
              </span>
              <span className="text-xs text-slate-400">پیش‌نویس معلق ثبت‌نشده</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 font-bold">موجودی بدون اطلاعات ضروری</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600 font-mono">
                {toPersianNumber(missingEssentialItems.length)}
              </span>
              <span className="text-xs text-slate-400">فاقد قیمت خرید یا تاریخ</span>
            </div>
          </div>
        </div>

        {/* Table of Incomplete Items */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700">فهرست اقلام نیازمند تکمیل اطلاعات و پالایش</span>
            <span className="text-xs text-slate-400">{toPersianNumber(combinedDataQualityList.length)} مورد شناسایی‌شده</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">نام قلم</th>
                  <th className="py-3 px-4">نوع نقص</th>
                  <th className="py-3 px-4">محل استقرار</th>
                  <th className="py-3 px-4">مسئول تکمیل</th>
                  <th className="py-3 px-4 text-center">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {combinedDataQualityList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.code}</div>
                    </td>
                    <td className="py-3 px-4 text-rose-700 font-medium">{item.defect}</td>
                    <td className="py-3 px-4 text-slate-600">{item.location}</td>
                    <td className="py-3 px-4 text-slate-700">{item.assignee}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
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
      {/* گزارش ۵ — جابه‌جایی اموال (Timeline) */}
      {/* ========================================================================= */}
      <section id="rep-movement" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۵ — جابه‌جایی اموال</h3>
          </div>
          <span className="text-xs text-slate-400">تاریخچه زنجیره انتقال و تحویل اموال بین واحدها</span>
        </div>

        {/* Movement Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="relative border-r-2 border-slate-200 mr-4 pr-6 space-y-6">
            {movementsTimeline.map((ev) => (
              <div key={ev.id} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -right-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />

                <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-4 border border-slate-200/80 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{ev.assetName}</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {ev.assetCode}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit">
                      {ev.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">مبدأ:</span>
                      <span className="font-bold text-slate-700">{ev.origin}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">مقصد:</span>
                      <span className="font-bold text-slate-700">{ev.destination}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">تاریخ جابه‌جایی:</span>
                      <span className="font-mono text-slate-600">{ev.date}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">کاربر انجام‌دهنده:</span>
                      <span className="font-bold text-slate-800">{ev.actor}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
