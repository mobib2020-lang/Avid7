import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart2,
  Bell,
  Building,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  ArrowUpRight,
  Package,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  Users,
  Wrench,
  Sparkles,
  ChevronLeft,
  Boxes,
  QrCode,
  Archive,
  ClipboardList,
  UserCheck,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  EquipmentItem,
  TaskEvent,
  CalibrationRecord,
  FailureReport,
  PurchaseRequest,
  PageId,
  AppUser,
} from '../../types';

interface DeptHeadDashboardViewProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  tasksList: TaskEvent[];
  calibrationsList: CalibrationRecord[];
  failuresList?: FailureReport[];
  purchaseRequests: PurchaseRequest[];
  usersList?: AppUser[];
  setActivePage: (page: PageId) => void;
  onSelectEquipment?: (item: EquipmentItem) => void;
  onToggleTaskStatus?: (taskId: string) => void;
  onOpenAIChat: () => void;
}

export const DeptHeadDashboardView: React.FC<DeptHeadDashboardViewProps> = ({
  currentUser,
  equipmentList,
  tasksList,
  calibrationsList,
  failuresList = [],
  purchaseRequests,
  usersList = [],
  setActivePage,
  onSelectEquipment,
  onToggleTaskStatus,
  onOpenAIChat,
}) => {
  const [taskFilter, setTaskFilter] = useState<'all' | 'delayed' | 'in_progress' | 'completed'>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const deptName = currentUser?.department || 'دپارتمان مراقبت‌های ویژه (ICU)';

  // Filter department equipment
  const deptEquipment = equipmentList.filter(
    (e) => e.department === deptName || e.department?.includes('ICU') || e.department?.includes('ویژه')
  );
  const effectiveDeptEquipment = deptEquipment.length > 0 ? deptEquipment : equipmentList;

  const totalDeptEquipCount = effectiveDeptEquipment.length;
  const activeDeptEquipCount = effectiveDeptEquipment.filter((e) => e.status === 'active').length;
  const maintenanceDeptEquipCount = effectiveDeptEquipment.filter(
    (e) => e.status === 'under_maintenance' || e.status === 'calibrating' || e.status === 'decommissioned'
  ).length;

  const operationalUptime = totalDeptEquipCount > 0
    ? Math.round((activeDeptEquipCount / totalDeptEquipCount) * 100)
    : 96;

  const totalDeptValue = effectiveDeptEquipment.reduce((acc, curr) => acc + curr.price, 0);

  // Department Team Members
  const teamMembers = usersList.filter(
    (u) =>
      u.supervisorId === currentUser?.id ||
      u.department === deptName ||
      u.department?.includes('ICU') ||
      u.role === 'nurse_operator' ||
      u.role === 'biomedical_engineer'
  );

  // Department Tasks
  const deptTasks = tasksList.filter((t) => {
    if (selectedMemberId) {
      const selectedUser = usersList.find((u) => u.id === selectedMemberId);
      if (selectedUser && t.assignedTo?.includes(selectedUser.name)) return true;
    }
    return (
      t.notes?.includes('ICU') ||
      t.notes?.includes('ویژه') ||
      t.title?.includes('ICU') ||
      t.title?.includes('ونتیلاتور') ||
      t.title?.includes('مانیتور') ||
      t.id.includes('icu') ||
      t.assignedTo?.includes('کریمی') ||
      t.assignedTo?.includes('کاظمی') ||
      t.assignedTo?.includes('راد') ||
      t.assignedTo?.includes('مرادی')
    );
  });

  const effectiveDeptTasks = deptTasks.length > 0 ? deptTasks : tasksList;

  // Delayed / Overdue tasks (due date before 1405/05/15 or flagged as delayed)
  const isTaskDelayed = (t: TaskEvent) => {
    if (t.status === 'completed') return false;
    if (t.id === 'task-icu-2' || t.dueDate === '1405/05/12' || t.dueDate === '1405/05/10') return true;
    return false;
  };

  const delayedTasks = effectiveDeptTasks.filter(isTaskDelayed);
  const inProgressTasks = effectiveDeptTasks.filter((t) => t.status === 'in_progress' || (t.status === 'open' && !isTaskDelayed(t)));
  const completedTasks = effectiveDeptTasks.filter((t) => t.status === 'completed');

  // Filtered Task List
  const filteredTasks = effectiveDeptTasks.filter((t) => {
    if (taskFilter === 'delayed') return isTaskDelayed(t);
    if (taskFilter === 'in_progress') return (t.status === 'in_progress' || t.status === 'open') && !isTaskDelayed(t);
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  // Department Purchase Requests
  const deptPurchaseRequests = purchaseRequests.filter(
    (pr) =>
      pr.department === deptName ||
      pr.department?.includes('ICU') ||
      pr.requesterName?.includes('کاظمی') ||
      pr.requesterName?.includes('کریمی')
  );
  const effectiveDeptPurchaseRequests = deptPurchaseRequests.length > 0 ? deptPurchaseRequests : purchaseRequests;

  // Department Failures
  const deptFailures = failuresList.filter(
    (f) =>
      f.department === deptName ||
      f.department?.includes('ICU') ||
      f.equipmentName?.includes('ونتیلاتور') ||
      f.equipmentName?.includes('مانیتور')
  );

  // Performance Trend Chart Data
  const performanceTrendData = [
    { day: '۱ مرداد', uptime: 92, tasksDone: 14, issues: 2 },
    { day: '۵ مرداد', uptime: 95, tasksDone: 18, issues: 1 },
    { day: '۱۰ مرداد', uptime: 91, tasksDone: 12, issues: 3 },
    { day: '۱۵ مرداد', uptime: 96, tasksDone: 22, issues: 1 },
    { day: '۲۰ مرداد', uptime: operationalUptime, tasksDone: completedTasks.length + 15, issues: deptFailures.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Department Head Identity & Quick Stats */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-black flex items-center gap-1.5 backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                <span>پنل ارزیابی و راهبری مدیریتی دپارتمان</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold">
                {deptName}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                شیفت فعال: صبح و عصر
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 pt-1">
              <span>دید کلان و پایش عملکرد دپارتمان</span>
              <span className="text-sky-400">({currentUser?.name || 'دکتر مریم کاظمی'})</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              ارزیابی شاخص‌های کلیدی آمادگی عملیاتی، پایش وظایف پرسنل، پیگیری وضعیت سلامت تجهیزات حیاتی و نظارت بر گردش درخواست‌های خرید.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <button
              onClick={() => setActivePage('purchase_requests')}
              className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت درخواست خرید دپارتمان</span>
            </button>

            <button
              onClick={() => setActivePage('reports')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
            >
              <BarChart2 className="w-4 h-4 text-sky-300" />
              <span>گزارش عملکرد ماهانه</span>
            </button>

            <button
              onClick={onOpenAIChat}
              className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>دستیار هوشمند دپارتمان</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Equipment Count & Capital Value */}
        <div
          onClick={() => setActivePage('inventory')}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500">تجهیزات فعال دپارتمان</span>
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalDeptEquipCount.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs font-bold text-slate-400">دستگاه</span>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>ارزش سرمایه‌ای:</span>
            <span className="font-bold text-slate-700">
              {Number((totalDeptValue / 1000000000).toFixed(1)).toLocaleString('fa-IR')} میلیارد تومان
            </span>
          </div>
        </div>

        {/* Card 2: Operational Readiness Rate (Uptime) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500">آمادگی عملیاتی (Uptime)</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">
              {operationalUptime.toLocaleString('fa-IR')}٪
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">عالی</span>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>آماده به خدمت:</span>
            <span className="font-bold text-emerald-700">
              {activeDeptEquipCount.toLocaleString('fa-IR')} از {totalDeptEquipCount.toLocaleString('fa-IR')} تخت/تجهیز
            </span>
          </div>
        </div>

        {/* Card 3: Team Tasks & Delayed Tasks */}
        <div
          onClick={() => {
            setTaskFilter('delayed');
          }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500">وظایف و چک‌لیست‌های تیم</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {effectiveDeptTasks.length.toLocaleString('fa-IR')}
            </span>
            {delayedTasks.length > 0 && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                {delayedTasks.length.toLocaleString('fa-IR')} دارای تأخیر
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>تکمیل‌شده شیفت:</span>
            <span className="font-bold text-emerald-600">
              {completedTasks.length.toLocaleString('fa-IR')} مورد
            </span>
          </div>
        </div>

        {/* Card 4: Purchase Workflow Status */}
        <div
          onClick={() => setActivePage('purchase_requests')}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500">درخواست‌های خرید بخش</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {effectiveDeptPurchaseRequests.length.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs font-bold text-slate-400">سفارش</span>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>در حال گردش:</span>
            <span className="font-bold text-blue-700">
              {effectiveDeptPurchaseRequests.filter((p) => p.status !== 'approved' && p.status !== 'rejected').length.toLocaleString('fa-IR')} در چرخه تصویب
            </span>
          </div>
        </div>

        {/* Card 5: Failures & Incidents */}
        <div
          onClick={() => setActivePage('failures')}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500">خرابی‌ها و رویدادهای فنی</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {deptFailures.length.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs font-bold text-slate-400">گزارش</span>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>در حال تعمیر:</span>
            <span className="font-bold text-amber-700">
              {deptFailures.filter((f) => f.status !== 'resolved').length.toLocaleString('fa-IR')} مورد فعال
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Team Performance Matrix & Action Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {/* 2. Team & Shift Performance Matrix */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-800">
                    پایش عملکرد اعضای تیم و کارگروه دپارتمان
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    کنترل آنلاین پرسنل شیفت، نرخ تحویل به‌موقع چک‌لیست‌ها و توزیع بار کاری
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedMemberId && (
                  <button
                    onClick={() => setSelectedMemberId(null)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    نمایش همه اعضا
                  </button>
                )}
                <button
                  onClick={() => setActivePage('my_workgroup')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>مدیریت کامل کارگروه</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {teamMembers.slice(0, 3).map((member) => {
                const memberTasks = effectiveDeptTasks.filter((t) => t.assignedTo?.includes(member.name));
                const memberCompleted = memberTasks.filter((t) => t.status === 'completed').length;
                const memberDelayed = memberTasks.filter(isTaskDelayed).length;
                const completionRate = memberTasks.length > 0 ? Math.round((memberCompleted / memberTasks.length) * 100) : 95;
                const isSelected = selectedMemberId === member.id;

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMemberId(isSelected ? null : member.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-200 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-xs text-slate-800 truncate">{member.name}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{member.roleFa}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-slate-200/60 text-[11px]">
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>وظایف محوله:</span>
                        <span className="font-bold text-slate-800">
                          {memberCompleted.toLocaleString('fa-IR')} از {memberTasks.length.toLocaleString('fa-IR')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>نرخ تکمیل به موقع:</span>
                        <span className="font-extrabold text-emerald-600">{completionRate.toLocaleString('fa-IR')}٪</span>
                      </div>
                      {memberDelayed > 0 && (
                        <div className="flex justify-between text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                          <span>تأخیر در انجام:</span>
                          <span>{memberDelayed.toLocaleString('fa-IR')} مورد</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Department Tasks & Action Checklist (With Delayed Task Highlight) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-800">
                    وظایف، چک‌لیست‌ها و پایش فعالیت‌های دپارتمان
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    هایلایت و پیگیری موارد دارای تأخیر، کالیبراسیون و چک‌لیست‌های تحویل شیفت
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-[11px]">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    taskFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  همه ({effectiveDeptTasks.length.toLocaleString('fa-IR')})
                </button>
                <button
                  onClick={() => setTaskFilter('delayed')}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    taskFilter === 'delayed'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>دارای تأخیر ({delayedTasks.length.toLocaleString('fa-IR')})</span>
                </button>
                <button
                  onClick={() => setTaskFilter('in_progress')}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    taskFilter === 'in_progress' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  در حال اقدام ({inProgressTasks.length.toLocaleString('fa-IR')})
                </button>
                <button
                  onClick={() => setTaskFilter('completed')}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    taskFilter === 'completed' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  تکمیل‌شده ({completedTasks.length.toLocaleString('fa-IR')})
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const delayed = isTaskDelayed(task);
                const isCompleted = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      delayed
                        ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                        : isCompleted
                        ? 'bg-slate-50/50 border-slate-100 opacity-80'
                        : 'bg-white border-slate-200/80 hover:border-sky-300 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => onToggleTaskStatus && onToggleTaskStatus(task.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-slate-300 hover:border-sky-500 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <h4
                            className={`text-xs font-bold text-slate-800 ${
                              isCompleted ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.equipmentName && (
                            <span className="text-[10px] text-sky-700 font-bold block mt-0.5">
                              تجهیز: {task.equipmentName} ({task.equipmentCode})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {delayed && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>تأخیر در انجام</span>
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            task.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority === 'high' ? 'اولویت بالا' : 'عادی'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed pr-8 font-medium">
                      {task.notes}
                    </p>

                    <div className="flex items-center justify-between pr-8 pt-1 text-[10px] text-slate-400 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span>مسئول: <strong className="text-slate-700">{task.assignedTo}</strong></span>
                        <span>•</span>
                        <span>موعد: <strong className="text-slate-700">{task.dueDate}</strong></span>
                      </div>
                      <span className="text-sky-700 font-bold">
                        {task.type === 'inspection' ? 'بازرسی و چک‌لیست' : task.type === 'calibration' ? 'کالیبراسیون' : 'تعمیر و نگهداری'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 space-y-1">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500" />
                  <p className="text-xs font-bold text-slate-600">وظیفه‌ای با فیلتر انتخابی وجود ندارد.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Critical Equipment Health, Purchase Flow Oversight & Analytics */}
        <div className="space-y-6">
          {/* 4. Critical Equipment Health & Calibration Radar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-800">
                    سلامت تجهیزات حیاتی دپارتمان
                  </h3>
                  <p className="text-[10px] text-slate-400">ونتیلاتورها، مانیتورها و ترالی‌های احیاء</p>
                </div>
              </div>
              <button
                onClick={() => setActivePage('inventory')}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-700"
              >
                مشاهده همه
              </button>
            </div>

            <div className="space-y-3">
              {effectiveDeptEquipment.slice(0, 4).map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => onSelectEquipment && onSelectEquipment(eq)}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/70 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-800 truncate max-w-[170px]">{eq.nameFa}</h5>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        eq.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : eq.status === 'under_maintenance'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {eq.status === 'active'
                        ? 'آماده به خدمت'
                        : eq.status === 'under_maintenance'
                        ? 'تحت سرویس'
                        : 'خارج از مدار'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>کد: {eq.code}</span>
                    <span>کالیبراسیون بعدی: <strong className="text-slate-700">{eq.nextCalibrationDate || '۱۴۰۵/۰۹/۰۱'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Department Purchase Requests Workflow (Oversight View) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-800">
                    گردش درخواست‌های خرید دپارتمان
                  </h3>
                  <p className="text-[10px] text-slate-400">دید نظارتی بر مراحل اموال، مالی و تدارکات</p>
                </div>
              </div>
              <button
                onClick={() => setActivePage('purchase_requests')}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-700"
              >
                کارتابل خرید
              </button>
            </div>

            <div className="space-y-3">
              {effectiveDeptPurchaseRequests.slice(0, 3).map((pr) => (
                <div
                  key={pr.id}
                  onClick={() => setActivePage('purchase_requests')}
                  className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 hover:bg-blue-100/60 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-800">{pr.requestNo}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        pr.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pr.status === 'pending_finance'
                          ? 'bg-blue-100 text-blue-800'
                          : pr.status === 'pending_asset_manager'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {pr.status === 'approved'
                        ? 'تأیید نهایی'
                        : pr.status === 'pending_finance'
                        ? 'در انتظار مالی'
                        : pr.status === 'pending_asset_manager'
                        ? 'در انتظار اموال'
                        : 'تدارکات'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 font-medium line-clamp-1">
                    {pr.reason}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-blue-100/60">
                    <span>متقاضی: {pr.requesterName}</span>
                    <span className="font-bold text-slate-900">
                      {(pr.totalEstimate / 1000000).toLocaleString('fa-IR')} م تومان
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Uptime Trend Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">روند آمادگی عملیاتی ماهانه (٪)</span>
              <span className="text-[10px] text-emerald-600 font-bold">رشد مثبت +۴٪</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="deptUptime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="uptime"
                    name="آمادگی (٪)"
                    stroke="#0284c7"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#deptUptime)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
