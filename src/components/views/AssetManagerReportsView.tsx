import React, { useState, useMemo } from 'react';
import {
  Package,
  Layers,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  FileSpreadsheet,
  Download,
  Search,
  PieChart as PieIcon,
  BarChart3,
  Archive,
  Boxes,
  Activity,
  Calendar,
  Sparkles,
  Printer,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { EquipmentItem, AppUser, AssetClassification } from '../../types';

interface AssetManagerReportsViewProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  classificationsList?: AssetClassification[];
}

export const AssetManagerReportsView: React.FC<AssetManagerReportsViewProps> = ({
  currentUser,
  equipmentList,
  classificationsList = [],
}) => {
  const [activeReportTab, setActiveReportTab] = useState<
    'inventory_summary' | 'status_distribution' | 'department_assets' | 'stock_alerts'
  >('inventory_summary');

  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedKind, setSelectedKind] = useState<'all' | 'device' | 'consumable'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract departments and categories
  const departments = useMemo(() => {
    const set = new Set<string>();
    equipmentList.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [equipmentList]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    equipmentList.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [equipmentList]);

  // Filtered equipment list based on criteria (no financial filters)
  const filteredList = useMemo(() => {
    return equipmentList.filter((item) => {
      if (selectedDept !== 'all' && item.department !== selectedDept) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedKind !== 'all' && (item.itemKind || 'device') !== selectedKind) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = item.code.toLowerCase().includes(q);
        const matchesFa = item.faName.toLowerCase().includes(q);
        const matchesBrand = (item.brand || '').toLowerCase().includes(q);
        const matchesSerial = (item.serialNumber || '').toLowerCase().includes(q);
        if (!matchesCode && !matchesFa && !matchesBrand && !matchesSerial) return false;
      }
      return true;
    });
  }, [equipmentList, selectedDept, selectedCategory, selectedKind, searchQuery]);

  // Summary Metrics strictly for Asset/Inventory
  const totalAssetsCount = filteredList.length;
  const devicesCount = filteredList.filter((e) => (e.itemKind || 'device') === 'device').length;
  const consumablesCount = filteredList.filter((e) => e.itemKind === 'consumable').length;
  const inUseCount = filteredList.filter((e) => e.status === 'in_use' || e.status === 'active').length;
  const inStockCount = filteredList.filter((e) => e.status === 'in_stock').length;
  const lowStockOrAlertCount = filteredList.filter(
    (e) =>
      e.status === 'low_stock' ||
      e.status === 'out_of_stock' ||
      e.status === 'expired' ||
      e.status === 'near_expiry' ||
      e.status === 'idle'
  ).length;

  // Chart: Department Asset Count
  const deptCountData = useMemo(() => {
    const map: Record<string, { devices: number; consumables: number }> = {};
    filteredList.forEach((item) => {
      const dept = item.department || 'نامشخص';
      if (!map[dept]) map[dept] = { devices: 0, consumables: 0 };
      if (item.itemKind === 'consumable') {
        map[dept].consumables += item.quantity || 1;
      } else {
        map[dept].devices += 1;
      }
    });
    return Object.entries(map).map(([dept, counts]) => ({
      name: dept,
      'تجهیزات ثابت': counts.devices,
      'اقلام مصرفی': counts.consumables,
    }));
  }, [filteredList]);

  // Chart: Status Breakdown
  const statusPieData = useMemo(() => {
    const map: Record<string, number> = {
      'در حال استفاده': 0,
      'موجود در انبار': 0,
      'آماده به کار': 0,
      'کمبود موجودی': 0,
      'راکد / بلااستفاده': 0,
      'اسقاط / خارج از رده': 0,
      'سایر موارد': 0,
    };

    filteredList.forEach((item) => {
      switch (item.status) {
        case 'in_use':
          map['در حال استفاده']++;
          break;
        case 'in_stock':
          map['موجود در انبار']++;
          break;
        case 'active':
          map['آماده به کار']++;
          break;
        case 'low_stock':
        case 'out_of_stock':
          map['کمبود موجودی']++;
          break;
        case 'idle':
          map['راکد / بلااستفاده']++;
          break;
        case 'decommissioned':
          map['اسقاط / خارج از رده']++;
          break;
        default:
          map['سایر موارد']++;
          break;
      }
    });

    const colors: Record<string, string> = {
      'در حال استفاده': '#2563eb',
      'موجود در انبار': '#10b981',
      'آماده به کار': '#06b6d4',
      'کمبود موجودی': '#f43f5e',
      'راکد / بلااستفاده': '#f59e0b',
      'اسقاط / خارج از رده': '#64748b',
      'سایر موارد': '#94a3b8',
    };

    return Object.entries(map)
      .filter(([_, val]) => val > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[name] || '#64748b',
      }));
  }, [filteredList]);

  // Chart: Category Distribution
  const categoryCountData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredList.forEach((item) => {
      const cat = item.category || 'دسته‌بندی نشده';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, تعداد: count }))
      .sort((a, b) => b.تعداد - a.تعداد)
      .slice(0, 8);
  }, [filteredList]);

  // Stock and inventory alerts
  const stockAlerts = useMemo(() => {
    return filteredList.filter((item) => {
      return (
        item.status === 'low_stock' ||
        item.status === 'out_of_stock' ||
        item.status === 'expired' ||
        item.status === 'near_expiry' ||
        item.status === 'idle' ||
        (item.quantity !== undefined && item.quantity < 5)
      );
    });
  }, [filteredList]);

  const handleExportCSV = () => {
    const headers = ['کد اموال', 'نام کالا / دستگاه', 'دسته‌بندی', 'نوع قلم', 'بخش / واحد', 'موقعیت دقیق', 'وضعیت', 'موجودی', 'شماره سریال'];
    const rows = filteredList.map((item) => [
      item.code,
      item.faName,
      item.category,
      item.itemKind === 'consumable' ? 'مصرفی' : 'دستگاه ثابت',
      item.department,
      item.location,
      item.status,
      item.quantity || 1,
      item.serialNumber || '-',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Asset_Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 dir-rtl">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-xs px-3 py-1 rounded-full border border-blue-200 font-bold mb-2">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            <span>سامانه گزارشات اموال و موجودی کالا</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>گزارشات و آمارهای تخصصی اموال و انبارداری</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            آمار دقیق استقرار تجهیزات در بخش‌ها، توزیع وضعیت بهره‌برداری، موجودی اقلام مصرفی و پایش کالاهای راکد و کم‌موجودی
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="دریافت فایل اکسل / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>خروجی اکسل</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ گزارش</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Strictly Asset & Inventory - No Finance/Calibration) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">کل اقلام ثبت‌شده</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-800">{totalAssetsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">مجموع شناسنامه‌های فعال</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">تجهیزات و دستگاه‌ها</span>
            <Boxes className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-700">{devicesCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">اموال سرمایه‌ای و ثابت</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">اقلام مصرفی انبار</span>
            <Archive className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700">{consumablesCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">کالاهای پرگردش</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">در حال استفاده</span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-sky-700">{inUseCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">مستقر در بخش‌ها</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold">موجود در انبار مرکزی</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-700">{inStockCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">آماده تخصیص و تحویل</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs bg-rose-50/20">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold text-rose-800">هشدار موجودی/انقضا</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-600">{lowStockOrAlertCount}</div>
          <div className="text-[10px] text-rose-500 mt-1">نیازمند بازبینی انبار</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>فیلترهای گزارش اموال و موجودی</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">بخش / بخش استقرار</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">همه بخش‌ها و واحدها</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">دسته‌بندی اموال</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">همه دسته‌بندی‌ها</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع ماهیت قلم</label>
            <select
              value={selectedKind}
              onChange={(e) => setSelectedKind(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">همه اقلام (دستگاه و مصرفی)</option>
              <option value="device">فقط دستگاه‌ها و اموال ثابت</option>
              <option value="consumable">فقط اقلام مصرفی انبار</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">جستجوی سریع در گزارش</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="کد، نام کالا، برند، سریال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit text-xs font-extrabold">
        <button
          onClick={() => setActiveReportTab('inventory_summary')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'inventory_summary' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span>توزیع اموال در بخش‌ها</span>
        </button>

        <button
          onClick={() => setActiveReportTab('status_distribution')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'status_distribution' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PieIcon className="w-4 h-4 text-indigo-600" />
          <span>وضعیت بهره‌برداری و انبارداری</span>
        </button>

        <button
          onClick={() => setActiveReportTab('department_assets')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'department_assets' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>آمار بر اساس دسته‌بندی ساختار اموال</span>
        </button>

        <button
          onClick={() => setActiveReportTab('stock_alerts')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'stock_alerts' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>هشدارهای انبار ({stockAlerts.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeReportTab === 'inventory_summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>تعداد اموال و تجهیزات مستقر در بخش‌های بیمارستان</span>
              </h3>
              <span className="text-xs text-slate-400">واحد: تعداد قلم کالا</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptCountData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="تجهیزات ثابت" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="اقلام مصرفی" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>خلاصه آماری انبارداری</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                بیشترین تراکم دستگاه‌های سرمایه‌ای در بخش‌های <strong>ICU</strong> و <strong>اتاق عمل</strong> ثبت شده است. 
                میزان گردش اقلام مصرفی در بخش <strong>اورژانس</strong> بالاترین نرخ ثبت حواله خروج را به خود اختصاص داده است.
              </p>

              <div className="mt-4 space-y-2">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                  <span className="text-blue-900 font-bold">بخش با بیشترین اموال:</span>
                  <span className="font-extrabold text-blue-700">اتاق عمل مرکزی</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-bold">آمادگی عملیاتی تجهیزات:</span>
                  <span className="font-extrabold text-emerald-700">۹۲٪ فعال</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between text-xs">
                  <span className="text-amber-900 font-bold">اقلام نیازمند جابجایی:</span>
                  <span className="font-extrabold text-amber-700">۳ قلم راکد</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
              این گزارش بر مبنای آخرین وضعیت انبار و تغییرات مکان فیزیکی اموال محاسبه شده است.
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'status_distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <span>تفکیک وضعیت بهره‌برداری و آمادگی فیزیکی اموال</span>
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-800">جدول فراوانی وضعیت اموال</h3>
            <div className="divide-y divide-slate-100">
              {statusPieData.map((s) => (
                <div key={s.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-bold text-slate-700">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800">{s.value} قلم</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {Math.round((s.value / (totalAssetsCount || 1)) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'department_assets' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>توزیع فراوانی اموال بر اساس دسته‌بندی‌های ساختار اموال</span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryCountData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="تعداد" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeReportTab === 'stock_alerts' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>فهرست کالاهای کم‌موجودی، در شرف انقضا یا راکد در انبار</span>
            </h3>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              {stockAlerts.length} قلم نیازمند اقدام
            </span>
          </div>

          {stockAlerts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">هیچ کالایی با هشدار موجودی یا انقضا یافت نشد.</p>
              <p className="text-[11px] text-slate-400 mt-1">تمام اقلام انبار در حد مجاز و وضعیت مطلوب می‌باشند.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                    <th className="py-3 px-4 font-bold">کد اموال</th>
                    <th className="py-3 px-4 font-bold">نام کالا / دستگاه</th>
                    <th className="py-3 px-4 font-bold">دسته‌بندی</th>
                    <th className="py-3 px-4 font-bold">بخش / انبار</th>
                    <th className="py-3 px-4 font-bold">نوع وضعیت</th>
                    <th className="py-3 px-4 font-bold">موجودی فعلی</th>
                    <th className="py-3 px-4 font-bold">نوع هشدار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockAlerts.map((item) => {
                    const isLowStock = item.status === 'low_stock' || (item.quantity !== undefined && item.quantity < 5);
                    const isExpired = item.status === 'expired';
                    const isIdle = item.status === 'idle';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.code}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{item.faName}</td>
                        <td className="py-3 px-4 text-slate-600">{item.category}</td>
                        <td className="py-3 px-4 text-slate-600">{item.department}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-black font-mono text-slate-800">
                          {item.quantity !== undefined ? `${item.quantity} ${item.unit || 'عدد'}` : '۱ دستگاه'}
                        </td>
                        <td className="py-3 px-4">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-extrabold border border-rose-200">
                              <AlertTriangle className="w-3 h-3" /> تاریخ مصرف منقضی
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-extrabold border border-amber-200">
                              <Clock className="w-3 h-3" /> آستانه سفارش مجدد
                            </span>
                          ) : isIdle ? (
                            <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px] font-extrabold border border-purple-200">
                              <Archive className="w-3 h-3" /> کالای بدون استفاده / راکد
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">نیازمند بازبینی</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
