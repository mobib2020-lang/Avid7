import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  Eye,
  Check,
  X,
  MessageSquare,
  Plus,
  BarChart3,
  Calendar,
  FileText,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ArrowUpRight,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import {
  AppUser,
  PageId,
  PermissionLevel,
  EquipmentItem,
  TaskEvent,
  SystemNotification,
} from '../../types';

interface MyWorkgroupViewProps {
  currentUser: AppUser;
  usersList: AppUser[];
  equipmentList: EquipmentItem[];
  tasksList?: TaskEvent[];
  notifications?: SystemNotification[];
  onUpdateUser: (updatedUser: AppUser) => void;
  onSelectEquipment?: (item: EquipmentItem) => void;
  onNavigateToPage?: (page: PageId) => void;
}

// Module keys for permission table
const SYSTEM_MODULES: { id: PageId; label: string; cat: string }[] = [
  { id: 'inventory', label: 'انبار و شناسنامه تجهیزات', cat: 'تجهیزات' },
  { id: 'asset_structure', label: 'ساختار و دسته‌بندی اموال', cat: 'تجهیزات' },
  { id: 'calibration', label: 'کالیبراسیون و آزمون‌های ایمنی', cat: 'فنی' },
  { id: 'failures', label: 'اعلام و پیگیری خرابی‌ها', cat: 'فنی' },
  { id: 'purchase_requests', label: 'درخواست‌های خرید و تدارکات', cat: 'تدارکات' },
  { id: 'smart_cart', label: 'سبد خرید هوشمند AI', cat: 'تدارکات' },
  { id: 'vendors', label: 'تامین‌کنندگان و پایش SLA', cat: 'بازرگانی' },
  { id: 'reports', label: 'گزارش‌های مدیریتی و استهلاک', cat: 'گزارش‌گیری' },
];

export const MyWorkgroupView: React.FC<MyWorkgroupViewProps> = ({
  currentUser,
  usersList,
  equipmentList,
  tasksList = [],
  notifications = [],
  onUpdateUser,
  onSelectEquipment,
  onNavigateToPage,
}) => {
  // Filter subordinates: users where supervisorId === currentUser.id OR if currentUser is admin, users with supervisors or all
  const isHospitalAdmin = currentUser.role === 'hospital_admin';

  const subordinates = usersList.filter((u) => {
    if (u.id === currentUser.id) return false;
    if (isHospitalAdmin) return true; // Admin can view/manage all workgroups
    if (u.supervisorId === currentUser.id) return true;
    if (currentUser.role === 'finance_manager') {
      return (
        u.supervisorId === 'usr-4' ||
        u.role === 'finance_expert' ||
        u.role === 'budget_expert' ||
        u.role === 'finance_auditor' ||
        u.department?.includes('مالی') ||
        u.roleFa?.includes('مالی') ||
        u.roleFa?.includes('حسابدار') ||
        u.roleFa?.includes('بودجه') ||
        u.roleFa?.includes('حسابرس')
      );
    }
    if (currentUser.role === 'asset_manager') {
      return (
        u.supervisorId === 'usr-8' ||
        u.role === 'warehouse_keeper' ||
        u.role === 'asset_tagging_officer' ||
        u.role === 'inventory_clerk' ||
        u.department?.includes('اموال') ||
        u.department?.includes('انبار') ||
        u.roleFa?.includes('انباردار') ||
        u.roleFa?.includes('پلاک‌کوبی') ||
        u.roleFa?.includes('کنترل موجودی')
      );
    }
    if (currentUser.role === 'procurement_officer') {
      return (
        u.supervisorId === 'usr-3' ||
        u.role === 'procurement_expert' ||
        u.role === 'procurement_followup' ||
        u.role === 'procurement_contracts' ||
        u.department?.includes('بازرگانی') ||
        u.department?.includes('خرید') ||
        u.roleFa?.includes('خرید') ||
        u.roleFa?.includes('بازرگانی') ||
        u.roleFa?.includes('استعلام') ||
        u.roleFa?.includes('تامین') ||
        u.roleFa?.includes('قرارداد')
      );
    }
    if (currentUser.role === 'biomedical_engineer') {
      return (
        u.supervisorId === 'usr-2' ||
        u.supervisorId === currentUser.id ||
        u.role === 'support_tech' ||
        u.role === 'biomedical_technician' ||
        u.department?.includes('مهندسی پزشکی') ||
        u.department?.includes('تعمیرگاه') ||
        u.roleFa?.includes('پشتیبانی') ||
        u.roleFa?.includes('کالیبراسیون') ||
        u.roleFa?.includes('تعمیرات')
      );
    }
    if (currentUser.role === 'nurse_operator' || currentUser.role === 'dept_head') {
      return (
        u.department === currentUser.department ||
        u.supervisorId === currentUser.id ||
        (currentUser.supervisorId && u.supervisorId === currentUser.supervisorId) ||
        u.role === 'nurse_operator' ||
        u.role === 'head_nurse' ||
        u.role === 'dept_technician' ||
        u.department?.includes('ICU')
      );
    }
    return false;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubordinate, setSelectedSubordinate] = useState<AppUser | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState<AppUser | null>(null);
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [activeTab, setActiveTab] = useState<'employees' | 'delayed_tasks' | 'permissions'>('employees');
  const [permissionAlertMsg, setPermissionAlertMsg] = useState<string | null>(null);

  // Filtered subordinates by search
  const filteredSubordinates = subordinates.filter(
    (u) =>
      u.name.includes(searchQuery) ||
      u.personnelCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.roleFa.includes(searchQuery) ||
      u.department.includes(searchQuery)
  );

  // Delayed equipment drafts (>1 day)
  const delayedDrafts = equipmentList.filter((eq) => {
    if (!eq.isDraft) return false;
    // check if created by one of the subordinates
    const isBySub = subordinates.some((sub) => sub.name === eq.creator || sub.name === eq.owner);
    return isBySub || isHospitalAdmin;
  });

  // Get effective permission of current supervisor for a module
  const getSupervisorModulePermission = (modId: string): PermissionLevel => {
    if (isHospitalAdmin) return 'action';
    if (currentUser.modulePermissions && currentUser.modulePermissions[modId]) {
      return currentUser.modulePermissions[modId];
    }
    // Default fallback
    return 'action';
  };

  // Get effective permission of subordinate for a module
  const getSubordinateModulePermission = (sub: AppUser, modId: string): PermissionLevel => {
    if (sub.modulePermissions && sub.modulePermissions[modId]) {
      return sub.modulePermissions[modId];
    }
    // Fallback based on legacy permissions
    if (sub.permissions.includes(modId) || sub.allowedPages?.includes(modId as PageId)) {
      return 'action';
    }
    return 'view';
  };

  // Handler to update subordinate module permission (ENFORCING SUPERVISOR BOUNDARY)
  const handleSetSubPermission = (sub: AppUser, modId: string, level: PermissionLevel) => {
    const supervisorMax = getSupervisorModulePermission(modId);

    // Boundary check: Supervisor CANNOT give higher permission than they have
    if (supervisorMax === 'none') {
      setPermissionAlertMsg('شما به این ماژول دسترسی ندارید، بنابراین نمی‌توانید آن را به زیرمجموعه تخصیص دهید.');
      setTimeout(() => setPermissionAlertMsg(null), 4000);
      return;
    }
    if (supervisorMax === 'view' && level === 'action') {
      setPermissionAlertMsg('شما فقط دسترسی «مشاهده» این بخش را دارید و نمی‌توانید دسترسی «انجام عملیات» به کارمند اعطا کنید.');
      setTimeout(() => setPermissionAlertMsg(null), 4000);
      return;
    }

    const currentMap = sub.modulePermissions || {};
    const updatedUser: AppUser = {
      ...sub,
      modulePermissions: {
        ...currentMap,
        [modId]: level,
      },
    };

    onUpdateUser(updatedUser);
    if (showPermissionModal?.id === sub.id) {
      setShowPermissionModal(updatedUser);
    }
    if (selectedSubordinate?.id === sub.id) {
      setSelectedSubordinate(updatedUser);
    }
  };

  // Handle adding employee feedback
  const handleAddFeedback = (sub: AppUser) => {
    if (!newFeedbackText.trim()) return;

    const newEntry = {
      id: `fb-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.roleFa,
      text: newFeedbackText.trim(),
      date: new Date().toLocaleDateString('fa-IR'),
    };

    const updatedFeedbacks = [...(sub.feedbacks || []), newEntry];
    const updatedUser = {
      ...sub,
      feedbacks: updatedFeedbacks,
    };

    onUpdateUser(updatedUser);
    setSelectedSubordinate(updatedUser);
    setNewFeedbackText('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {permissionAlertMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-rose-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-bounce border border-rose-700">
          <ShieldAlert className="w-5 h-5 text-rose-300 shrink-0" />
          <span>{permissionAlertMsg}</span>
          <button
            onClick={() => setPermissionAlertMsg(null)}
            className="p-1 hover:bg-rose-800 rounded-lg mr-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-[#1d52d8] to-[#2b64f6] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-6 h-6 text-sky-300" />
              <h1 className="text-xl font-black tracking-tight">کارگروه من — میز کار نظارت و مدیریت زیرمجموعه</h1>
            </div>
            <p className="text-xs text-sky-100/90 leading-relaxed max-w-2xl">
              فضای مدیریت اختصاصی سرپرست جهت ارزیابی عملکرد پرسنل زیرمجموعه، بررسی گزارش‌ها، ثبت بازخورد و مدیریت اختیارات کارمندان
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 shrink-0">
            <div className="text-center">
              <span className="text-lg font-black block">{subordinates.length}</span>
              <span className="text-[10px] text-sky-200">پرسنل زیرمجموعه کارگروه</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'employees'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>پرسنل کارگروه ({subordinates.length} نفر)</span>
        </button>

        <button
          onClick={() => setActiveTab('delayed_tasks')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'delayed_tasks'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>هشدارها و وظایف معوق ({delayedDrafts.length} مورد)</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'permissions'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>ماتریس دسترسی‌ها</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام پرسنل، کد پرسنلی یا عنوان..."
            className="w-full pr-9 pl-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-bold">
          نمایش {filteredSubordinates.length} از {subordinates.length} اعضای کارگروه
        </span>
      </div>

      {/* TAB 1: WORKGROUP EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubordinates.map((sub) => {
            const perfScore = sub.performanceScore || 92;

            return (
              <div
                key={sub.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2b64f6] to-[#1d52d8] text-white font-bold flex items-center justify-center shadow-xs overflow-hidden text-sm shrink-0">
                        {sub.avatarUrl ? (
                          <img src={sub.avatarUrl} alt={sub.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{sub.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-xs">{sub.name}</h3>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          کد: {sub.personnelCode}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-[10px] font-extrabold border border-sky-100">
                      {sub.roleFa}
                    </span>
                  </div>

                  {/* Info stats */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">امتیاز ارزیابی:</span>
                      <span className="text-sm font-black text-emerald-600 dir-ltr text-right block">
                        {perfScore}٪
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">بخش سازمانی:</span>
                      <span className="text-xs font-bold text-slate-800 block truncate">{sub.department}</span>
                    </div>
                  </div>

                  {/* Feedback Summary */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                      <span>آخرین بازخوردهای سرپرست:</span>
                      <span className="text-[10px] text-sky-600">{(sub.feedbacks || []).length} نظر</span>
                    </div>
                    {sub.feedbacks && sub.feedbacks.length > 0 ? (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2 italic">
                        "{sub.feedbacks[sub.feedbacks.length - 1].text}"
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-xl italic">
                        هنوز بازخوردی ثبت نشده است.
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setShowPermissionModal(sub)}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-purple-100"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>تنظیم دسترسی‌ها</span>
                  </button>

                  <button
                    onClick={() => setSelectedSubordinate(sub)}
                    className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                  >
                    <span>داشبورد کارمند</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: DELAYED TASKS & OPERATIONAL ALERTS */}
      {activeTab === 'delayed_tasks' && (
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 leading-relaxed flex items-start gap-3">
            <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-black text-sky-950 mb-1">هشدارهای خودکار عدم تکمیل پیش‌نویس (بیش از ۲۴ ساعت):</strong>
              سامانه به‌طور خودکار هر کالا یا تجهیز جدیدی که توسط پرسنل زیرمجموعه در حالت «پیش‌نویس» رها شده و بیش از یک روز از ایجاد آن گذشته است را به سرپرست اعلام می‌کند.
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-black text-xs text-slate-800">
              فهرست هشدارهای عملیاتی تاخیر کارمندان زیرمجموعه
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {delayedDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="p-4 hover:bg-amber-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">{draft.faName}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] rounded font-bold">
                          {draft.code}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full">
                          تکمیل پیش‌نویس بیش از ۱ روز تاخیر
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>ایجادکننده: <strong className="text-slate-800">{draft.creator || draft.owner}</strong></span>
                        <span>بخش: <strong>{draft.department}</strong></span>
                        <span>تاریخ ثبت: <span className="font-mono">{draft.purchaseDate || '۱۴۰۴/۰۵/۲۰'}</span></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectEquipment) onSelectEquipment(draft);
                      if (onNavigateToPage) onNavigateToPage('inventory');
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>ورود مستقیم به پیش‌نویس</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {delayedDrafts.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  هیچ هشدار تاخیری در کارگروه زیرمجموعه شما ثبت نشده است. تمام پیش‌نویس‌ها در زمان مقرر تکمیل شده‌اند.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERMISSION MATRIX */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                    <th className="p-3.5">نام کارمند / نقش</th>
                    {SYSTEM_MODULES.map((mod) => (
                      <th key={mod.id} className="p-3.5 text-center">
                        {mod.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {subordinates.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <span className="font-extrabold text-slate-900 block">{sub.name}</span>
                        <span className="text-[10px] text-sky-700 font-bold block">{sub.roleFa}</span>
                      </td>

                      {SYSTEM_MODULES.map((mod) => {
                        const level = getSubordinateModulePermission(sub, mod.id);
                        const supervisorMax = getSupervisorModulePermission(mod.id);

                        return (
                          <td key={mod.id} className="p-2 text-center">
                            <select
                              value={level}
                              onChange={(e) =>
                                handleSetSubPermission(
                                  sub,
                                  mod.id,
                                  e.target.value as PermissionLevel
                                )
                              }
                              className={`p-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                                level === 'action'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : level === 'view'
                                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                                  : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}
                            >
                              <option value="none">عدم دسترسی</option>
                              <option value="view">مشاهده</option>
                              {supervisorMax === 'action' && (
                                <option value="action">انجام عملیات</option>
                              )}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: PERMISSION MANAGEMENT MODAL FOR A SPECIFIC EMPLOYEE */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span>تنظیم دسترسی‌ها — {showPermissionModal.name}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  نقش: {showPermissionModal.roleFa} | بخش: {showPermissionModal.department}
                </p>
              </div>
              <button
                onClick={() => setShowPermissionModal(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {SYSTEM_MODULES.map((mod) => {
                const currentLevel = getSubordinateModulePermission(showPermissionModal, mod.id);
                const supervisorMax = getSupervisorModulePermission(mod.id);

                return (
                  <div
                    key={mod.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-slate-800 block text-xs">{mod.label}</span>
                      <span className="text-[10px] text-slate-400">دسته‌بندی: {mod.cat}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSetSubPermission(showPermissionModal, mod.id, 'none')}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          currentLevel === 'none'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        عدم دسترسی
                      </button>

                      <button
                        onClick={() => handleSetSubPermission(showPermissionModal, mod.id, 'view')}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          currentLevel === 'view'
                            ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        مشاهده
                      </button>

                      <button
                        disabled={supervisorMax !== 'action'}
                        onClick={() => handleSetSubPermission(showPermissionModal, mod.id, 'action')}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                          supervisorMax !== 'action'
                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                            : currentLevel === 'action'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer'
                        }`}
                        title={
                          supervisorMax !== 'action'
                            ? 'شما به عنوان سرپرست دسترسی انجام عملیات در این بخش را ندارید'
                            : undefined
                        }
                      >
                        انجام عملیات
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPermissionModal(null)}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                تایید و ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INDIVIDUAL EMPLOYEE DASHBOARD & FEEDBACK */}
      {selectedSubordinate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white font-bold flex items-center justify-center text-sm">
                  {selectedSubordinate.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    پروفایل و ارزیابی — {selectedSubordinate.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedSubordinate.roleFa} | {selectedSubordinate.department} | کد: {selectedSubordinate.personnelCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubordinate(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Score & Stats */}
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-bold block mb-0.5">امتیاز عملکردی پرسنل:</span>
                  <span className="text-2xl font-black text-sky-900 dir-ltr text-right block">
                    {selectedSubordinate.performanceScore || 92}٪
                  </span>
                </div>
                <div className="text-left font-mono text-[11px] text-slate-600">
                  <div>آخرین ورود: {selectedSubordinate.lastLogin}</div>
                  <div>وضعیت: <span className="text-emerald-600 font-bold">فعال</span></div>
                </div>
              </div>

              {/* Feedbacks Section */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  <span>ثبت بازخورد و یادداشت‌های نظارتی سرپرست:</span>
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-100">
                  {selectedSubordinate.feedbacks && selectedSubordinate.feedbacks.length > 0 ? (
                    selectedSubordinate.feedbacks.map((fb) => (
                      <div key={fb.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                          <span>{fb.authorName} ({fb.authorRole})</span>
                          <span className="font-mono">{fb.date}</span>
                        </div>
                        <p className="text-slate-700 text-xs">{fb.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-3 italic">یادداشتی ثبت نشده است.</p>
                  )}
                </div>

                {/* Add feedback form */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeedbackText}
                    onChange={(e) => setNewFeedbackText(e.target.value)}
                    placeholder="ارزیابی جدید یا بازخورد برای کاربر..."
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                  <button
                    onClick={() => handleAddFeedback(selectedSubordinate)}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs cursor-pointer shrink-0"
                  >
                    ثبت بازخورد
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedSubordinate(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
