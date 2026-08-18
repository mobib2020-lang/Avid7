import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  AlertTriangle,
  FileEdit,
  ArrowLeft,
  Filter,
  UserCheck,
  Sparkles,
  Calendar as CalendarIcon,
  X,
  Shield,
  Layers,
  ArrowUpRight,
  CheckSquare,
  FileCheck2,
  Award,
  Wrench,
  Users,
  Check,
  Info,
} from 'lucide-react';
import { AppUser, TaskEvent, PageId, EquipmentItem } from '../../types';
import {
  getWorkgroupMembers,
  getTaskTypesForRole,
} from '../../utils/workgroupHelpers';

interface TasksCalendarViewProps {
  currentUser?: AppUser;
  allUsers?: AppUser[];
  tasksList: TaskEvent[];
  equipmentList?: EquipmentItem[];
  onAddTask: (task: TaskEvent) => void;
  onToggleTaskStatus: (taskId: string) => boolean | void;
  setActivePage?: (page: PageId) => void;
  onNavigateToInventoryWithAction?: (state: {
    initialTab?: 'inventory' | 'drafts' | 'add_manual' | 'grouped_products';
    initialLayout?: 'table' | 'cards' | 'grouped';
    initialStatusFilter?: string;
    actionGuidance?: {
      type: 'draft_tagging' | 'transfer' | 'restock' | 'calibration';
      targetDraftId?: string;
      message: string;
    };
    openAssetTransferModal?: boolean;
    openQuickRestockModal?: boolean;
  }) => void;
}

export const TasksCalendarView: React.FC<TasksCalendarViewProps> = ({
  currentUser,
  allUsers = [],
  tasksList,
  equipmentList = [],
  onAddTask,
  onToggleTaskStatus,
  setActivePage,
  onNavigateToInventoryWithAction,
}) => {
  const [filterRoleScope, setFilterRoleScope] = useState<'role_only' | 'all_hospital'>('role_only');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskEvent | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [warningDraftAlert, setWarningDraftAlert] = useState<{
    task: TaskEvent;
    draft: EquipmentItem;
  } | null>(null);

  // Workgroup members & allowed task types for the active user/role
  const workgroupMembers = getWorkgroupMembers(currentUser, allUsers);
  const allowedTaskTypes = getTaskTypesForRole(currentUser?.role);

  const handleValidateAndToggleTask = (task: TaskEvent) => {
    // If attempting to complete a draft completion task
    if (task.status !== 'completed') {
      const isDraftTask =
        task.type === 'draft_completion' ||
        task.targetDraftId ||
        task.title.includes('پیش‌نویس') ||
        task.equipmentCode?.toUpperCase().includes('DRAFT');

      if (isDraftTask) {
        const draft = equipmentList.find(
          (e) =>
            (task.targetDraftId && e.id === task.targetDraftId) ||
            (task.equipmentCode && (e.code === task.equipmentCode || e.id === task.equipmentCode)) ||
            (e.isDraft &&
              (task.title.includes(e.faName) ||
                task.title.includes(e.name) ||
                (task.equipmentName && (e.faName.includes(task.equipmentName) || task.equipmentName.includes(e.faName)))))
        );

        if (draft && (draft.isDraft || draft.status === 'draft')) {
          setWarningDraftAlert({
            task,
            draft,
          });
          setToastMsg('⚠️ پیش‌نویس هنوز در انبار ناقص است. تا تکمیل نهایی در انبار، امکان بستن تسک وجود ندارد.');
          setTimeout(() => setToastMsg(null), 5000);
          return false;
        }
      }
    }

    const result = onToggleTaskStatus(task.id);
    if (result === false) {
      return false;
    }
    return true;
  };

  // Modal State for new task
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(
    currentUser ? [currentUser.id] : []
  );
  const [selectedTaskType, setSelectedTaskType] = useState<string>(
    allowedTaskTypes[0]?.id || 'tagging'
  );
  const [assigneeError, setAssigneeError] = useState<string | null>(null);

  // Filter states
  const isBiomedicalEngineer = currentUser?.role === 'biomedical_engineer';
  const isFinanceManager = currentUser?.role === 'finance_manager';
  const isAssetManager = currentUser?.role === 'asset_manager';
  const isProcurementOfficer = currentUser?.role === 'procurement_officer';
  const [selectedBiomedMemberFilter, setSelectedBiomedMemberFilter] = useState<string>('all');
  const [selectedFinanceMemberFilter, setSelectedFinanceMemberFilter] = useState<string>('all');
  const [selectedAssetMemberFilter, setSelectedAssetMemberFilter] = useState<string>('all');
  const [selectedProcurementMemberFilter, setSelectedProcurementMemberFilter] = useState<string>('all');

  // Role-Aware Task Filtering
  const filteredTasks = tasksList.filter((task) => {
    if (currentUser) {
      const userName = currentUser.name.trim();
      const userRoleFa = currentUser.roleFa.trim();

      if (isBiomedicalEngineer) {
        // Strict scope: Biomedical Engineer personal tasks + Biomedical Workgroup members tasks
        const isPersonal = task.assignedTo.includes(userName) || userName.includes(task.assignedTo) || task.role.includes('مهندس تجهیزات');
        const isWorkgroupMember =
          task.assignedTo.includes('نگار احمدی') ||
          task.assignedTo.includes('رضا صابری') ||
          task.assignedTo.includes('حامد باقری') ||
          task.role.includes('کالیبراسیون') ||
          task.role.includes('تعمیرات') ||
          task.role.includes('پشتیبانی فنی') ||
          task.role.includes('مهندسی پزشکی');

        if (!isPersonal && !isWorkgroupMember) {
          return false;
        }

        // Sub-filter by specific member
        if (selectedBiomedMemberFilter === 'me' && !isPersonal) {
          return false;
        }
        if (selectedBiomedMemberFilter === 'negar' && !task.assignedTo.includes('نگار احمدی')) {
          return false;
        }
        if (selectedBiomedMemberFilter === 'reza' && !task.assignedTo.includes('رضا صابری')) {
          return false;
        }
        if (selectedBiomedMemberFilter === 'hamed' && !task.assignedTo.includes('حامد باقری')) {
          return false;
        }
      } else if (isFinanceManager) {
        // Strict scope: ONLY Finance Officer personal tasks + Finance Workgroup members tasks
        const isPersonal = task.assignedTo.includes(userName) || userName.includes(task.assignedTo) || task.role.includes(userRoleFa);
        const isWorkgroupMember = 
          task.assignedTo.includes('فاطمه محمدی') ||
          task.assignedTo.includes('امیرحسین کاظمی') ||
          task.assignedTo.includes('مینا حسینی') ||
          task.role.includes('مالی') ||
          task.role.includes('حسابدار') ||
          task.role.includes('بودجه') ||
          task.role.includes('حسابرس');

        if (!isPersonal && !isWorkgroupMember) {
          return false;
        }

        // Sub-filter by specific member
        if (selectedFinanceMemberFilter === 'me' && !isPersonal) {
          return false;
        }
        if (selectedFinanceMemberFilter === 'fatemeh' && !task.assignedTo.includes('فاطمه محمدی')) {
          return false;
        }
        if (selectedFinanceMemberFilter === 'amir' && !task.assignedTo.includes('امیرحسین کاظمی')) {
          return false;
        }
        if (selectedFinanceMemberFilter === 'mina' && !task.assignedTo.includes('مینا حسینی')) {
          return false;
        }
      } else if (isAssetManager) {
        // Strict scope for Property & Inventory Manager: personal tasks + asset/inventory workgroup members
        const isPersonal = task.assignedTo.includes(userName) || userName.includes(task.assignedTo) || task.role.includes('مدیر اموال');
        const isWorkgroupMember =
          task.assignedTo.includes('رضا محمودی') ||
          task.assignedTo.includes('علی رستمی') ||
          task.assignedTo.includes('سمیرا شمس') ||
          task.role.includes('انبار') ||
          task.role.includes('پلاک‌کوبی') ||
          task.role.includes('کنترل موجودی') ||
          task.role.includes('اموال');

        if (!isPersonal && !isWorkgroupMember) {
          return false;
        }

        // Sub-filter by specific member
        if (selectedAssetMemberFilter === 'me' && !isPersonal) {
          return false;
        }
        if (selectedAssetMemberFilter === 'reza' && !task.assignedTo.includes('رضا محمودی')) {
          return false;
        }
        if (selectedAssetMemberFilter === 'rostami' && !task.assignedTo.includes('علی رستمی')) {
          return false;
        }
        if (selectedAssetMemberFilter === 'shams' && !task.assignedTo.includes('سمیرا شمس')) {
          return false;
        }
      } else if (isProcurementOfficer) {
        // Strict scope for Procurement Officer: personal tasks + procurement workgroup members
        const isPersonal = task.assignedTo.includes(userName) || userName.includes(task.assignedTo) || task.role.includes('مسئول خرید') || task.role.includes('بازرگانی');
        const isWorkgroupMember =
          task.assignedTo.includes('پویا شایان') ||
          task.assignedTo.includes('مهسا نوری') ||
          task.assignedTo.includes('احسان فلاح') ||
          task.role.includes('استعلام') ||
          task.role.includes('تامین') ||
          task.role.includes('قرارداد') ||
          task.role.includes('بازرگانی') ||
          task.type === 'purchase';

        if (!isPersonal && !isWorkgroupMember) {
          return false;
        }

        // Sub-filter by specific member
        if (selectedProcurementMemberFilter === 'me' && !isPersonal) {
          return false;
        }
        if (selectedProcurementMemberFilter === 'pouya' && !task.assignedTo.includes('پویا شایان')) {
          return false;
        }
        if (selectedProcurementMemberFilter === 'mahsa' && !task.assignedTo.includes('مهسا نوری')) {
          return false;
        }
        if (selectedProcurementMemberFilter === 'ehsan' && !task.assignedTo.includes('احسان فلاح')) {
          return false;
        }
      } else if (currentUser.role === 'hospital_admin') {
        // Admin personal checklist: tasks assigned to admin or admin role
        const isAssignedToUser = task.assignedTo.includes(userName) || userName.includes(task.assignedTo);
        const isMatchingRole = task.role.includes(userRoleFa) || userRoleFa.includes(task.role) || task.role.includes('مدیر') || task.role.includes('ادمین');
        if (!isAssignedToUser && !isMatchingRole) {
          return false;
        }
      } else if (filterRoleScope === 'role_only') {
        const isAssignedToUser = task.assignedTo.includes(userName) || userName.includes(task.assignedTo);
        const isMatchingRole = task.role.includes(userRoleFa) || userRoleFa.includes(task.role);

        let isRoleDomainMatch = false;
        if (currentUser.role === 'procurement_officer' && task.type === 'purchase') isRoleDomainMatch = true;
        if (currentUser.role === 'biomedical_engineer' && (task.type === 'calibration' || task.type === 'inspection')) isRoleDomainMatch = true;
        if (currentUser.role === 'support_tech' && task.type === 'maintenance') isRoleDomainMatch = true;
        if (currentUser.role === 'warehouse_keeper' && task.type === 'inspection') isRoleDomainMatch = true;
        if (currentUser.role === 'nurse_operator' && task.type === 'inspection') isRoleDomainMatch = true;

        if (!isAssignedToUser && !isMatchingRole && !isRoleDomainMatch) {
          return false;
        }
      }
    }

    const matchesType = filterType === 'all' || task.type === filterType;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    return matchesType && matchesPriority;
  });

  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length;
  const progressPercent = filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 0;

  const navigateToPageForTask = (type: string) => {
    if (!setActivePage) return;
    setSelectedTask(null);
    if (currentUser?.role === 'asset_manager') {
      setActivePage('inventory');
      return;
    }
    if (type === 'calibration' || type === 'expiry') setActivePage('calibration');
    else if (type === 'purchase') setActivePage('purchase_requests');
    else if (type === 'maintenance') setActivePage('failures');
    else setActivePage('inventory');
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-sky-600" />
            <span>چک‌لیست و وظایف عملیاتی</span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-sky-600" />
            <span>ثبت وظیفه جدید</span>
          </button>
        </div>
      </div>

      {/* Filter & Progress Bar */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50/50 to-blue-50 border border-sky-200/80 p-5 rounded-3xl space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <Filter className="w-4 h-4 text-sky-600" />
            <span>مدیریت و پایش وظایف عملیاتی</span>
          </div>

          {/* Scope Toggle */}
          {isBiomedicalEngineer ? (
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-sky-200 shrink-0 self-start md:self-auto">
              <span className="text-[11px] text-slate-500 font-bold px-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>فیلتر کارگروه مهندسی پزشکی:</span>
              </span>
              <select
                value={selectedBiomedMemberFilter}
                onChange={(e) => setSelectedBiomedMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">همه وظایف کارگروه مهندسی پزشکی ({filteredTasks.length})</option>
                <option value="me">فقط وظایف من (مهندس امین رضایی)</option>
                <option value="negar">مهندس نگار احمدی (کالیبراسیون و کنترل کیفی)</option>
                <option value="reza">مهندس رضا صابری (تعمیرات و PM)</option>
                <option value="hamed">مهندس حامد باقری (پشتیبانی فنی)</option>
              </select>
            </div>
          ) : isFinanceManager ? (
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-sky-200 shrink-0 self-start md:self-auto">
              <span className="text-[11px] text-slate-500 font-bold px-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>فیلتر نمایش:</span>
              </span>
              <select
                value={selectedFinanceMemberFilter}
                onChange={(e) => setSelectedFinanceMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">همه وظایف کارگروه مالی ({filteredTasks.length})</option>
                <option value="me">فقط وظایف من (استاد صادقی)</option>
                <option value="fatemeh">فاطمه محمدی (حسابداری)</option>
                <option value="amir">امیرحسین کاظمی (بودجه)</option>
                <option value="mina">مینا حسینی (حسابرسی)</option>
              </select>
            </div>
          ) : isAssetManager ? (
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-sky-200 shrink-0 self-start md:self-auto">
              <span className="text-[11px] text-slate-500 font-bold px-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>فیلتر کارگروه اموال:</span>
              </span>
              <select
                value={selectedAssetMemberFilter}
                onChange={(e) => setSelectedAssetMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">همه وظایف کارگروه اموال و انبار ({filteredTasks.length})</option>
                <option value="me">فقط وظایف من (مهندس کامران حسینی)</option>
                <option value="reza">مهندس رضا محمودی (انباردار)</option>
                <option value="rostami">علی رستمی (کارشناس پلاک‌کوبی)</option>
                <option value="shams">سمیرا شمس (کنترل موجودی)</option>
              </select>
            </div>
          ) : isProcurementOfficer ? (
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-sky-200 shrink-0 self-start md:self-auto">
              <span className="text-[11px] text-slate-500 font-bold px-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>فیلتر کارگروه خرید:</span>
              </span>
              <select
                value={selectedProcurementMemberFilter}
                onChange={(e) => setSelectedProcurementMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">همه وظایف کارگروه خرید ({filteredTasks.length})</option>
                <option value="me">فقط وظایف من (مهندس سارا ابراهیمی)</option>
                <option value="pouya">پویا شایان (استعلام قیمت)</option>
                <option value="mahsa">مهسا نوری (تامین و سفارشات)</option>
                <option value="ehsan">احسان فلاح (قراردادها و SLA)</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/80 p-1 rounded-2xl border border-sky-200 shrink-0 self-start md:self-auto">
              <button
                onClick={() => setFilterRoleScope('role_only')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterRoleScope === 'role_only'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>وظایف نقش من</span>
              </button>
              <button
                onClick={() => setFilterRoleScope('all_hospital')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterRoleScope === 'all_hospital'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>کل بیمارستان</span>
              </button>
            </div>
          )}
        </div>

        {/* Completion Progress Bar */}
        <div className="bg-white/90 p-3 rounded-2xl border border-sky-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>پیشرفت انجام چک‌لیست:</span>
            </span>
            <span className="text-sky-700">
              {completedCount} از {filteredTasks.length} مورد ({progressPercent}٪)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Selectors */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              همه موارد ({filteredTasks.length})
            </button>
            <button
              onClick={() => setFilterType('calibration')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'calibration'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              کالیبراسیون و انقضا
            </button>
            <button
              onClick={() => setFilterType('maintenance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'maintenance'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              تعمیر و نگهداری
            </button>
            <button
              onClick={() => setFilterType('purchase')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'purchase'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              خرید و تاییدات
            </button>
            <button
              onClick={() => setFilterType('inspection')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'inspection'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              بازرسی و اموال
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">اولویت:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">همه اولویت‌ها</option>
              <option value="high">اولویت بالا / حیاتی</option>
              <option value="medium">اولویت متوسط</option>
              <option value="low">اولویت معمولی</option>
            </select>
          </div>
        </div>

        {/* Tasks List Stream */}
        <div className="space-y-3 pt-2">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group ${
                  task.status === 'completed'
                    ? 'bg-slate-50/80 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:border-sky-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleValidateAndToggleTask(task);
                    }}
                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      task.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'bg-white border-slate-300 text-transparent hover:border-sky-500'
                    }`}
                    title={task.status === 'completed' ? 'غیرتکمیل' : 'تکمیل'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-bold text-xs group-hover:text-sky-700 transition-colors ${
                          task.status === 'completed'
                            ? 'line-through text-slate-500'
                            : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </span>

                      {task.autoGenerated ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>تولید هوشمند AI</span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          ثبت مستقیم
                        </span>
                      )}

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          task.priority === 'high'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {task.priority === 'high'
                          ? 'فوری'
                          : task.priority === 'medium'
                          ? 'متوسط'
                          : 'عادی'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      مسئول اجرا: <strong className="text-slate-700">{task.assignedTo}</strong> ({task.role})
                    </p>

                    {task.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100/80 mt-1">
                        توضیحات: {task.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-left md:text-right text-[11px] text-slate-500">
                    <span className="block font-bold text-slate-700 dir-ltr text-right">
                      مهلت: {task.dueDate}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {task.equipmentCode || 'عملیات عمومی بیمارستان'}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      task.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.status === 'in_progress'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.status === 'completed'
                      ? 'تکمیل‌شده'
                      : task.status === 'in_progress'
                      ? 'در حال انجام'
                      : 'در انتظار اقدام'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                موردی در چک‌لیست برای این فیلتر یا نقش یافت نشد.
              </p>
              <p className="text-[11px] text-slate-400">
                می‌توانید دامنه نمایش را به «کل بیمارستان» تغییر دهید یا آیتم جدیدی به چک‌لیست اضافه کنید.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Detail Action Modal for Task */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-right">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                    آیتم چک‌لیست
                  </span>
                  {selectedTask.autoGenerated ? (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>تولید هوشمند AI</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                      ثبت‌شده توسط کاربر
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-800 leading-tight">
                  {selectedTask.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">مسئول اجرا:</span>
                <span className="font-bold text-slate-800">{selectedTask.assignedTo}</span>
                <span className="text-[10px] text-slate-500 block">({selectedTask.role})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">مهلت سررسید:</span>
                <span className="font-bold text-slate-800 dir-ltr text-right">{selectedTask.dueDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">اولویت:</span>
                <span
                  className={`font-black ${
                    selectedTask.priority === 'high' ? 'text-rose-600' : 'text-slate-800'
                  }`}
                >
                  {selectedTask.priority === 'high' ? 'فوری / حیاتی' : 'معمولی'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">وضعیت:</span>
                <span className="font-bold text-sky-700">
                  {selectedTask.status === 'completed' ? 'تکمیل شده' : 'در انتظار اقدام'}
                </span>
              </div>
            </div>

            {selectedTask.equipmentName && (
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 text-xs">
                <span className="font-bold text-sky-900 block mb-1">دستگاه مرتبط:</span>
                <p className="text-sky-800 font-medium">
                  {selectedTask.equipmentName} ({selectedTask.equipmentCode})
                </p>
              </div>
            )}

            {selectedTask.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">توضیحات و دستورالعمل:</span>
                <p className="leading-relaxed">{selectedTask.notes}</p>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const success = handleValidateAndToggleTask(selectedTask);
                  if (success) {
                    setSelectedTask((prev) =>
                      prev ? { ...prev, status: prev.status === 'completed' ? 'open' : 'completed' } : null
                    );
                  }
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedTask.status === 'completed'
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {selectedTask.status === 'completed'
                    ? 'تغییر وضعیت به غیرتکمیل (باز)'
                    : 'علامت‌گذاری به‌عنوان تکمیل‌شده'}
                </span>
              </button>

              {setActivePage && (
                <button
                  onClick={() => navigateToPageForTask(selectedTask.type)}
                  className="w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>اقدام و مشاهده در بخش تخصصی</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Task */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">ثبت وظیفه جدید در چک‌لیست</h3>
                  <p className="text-[11px] text-slate-500 font-medium">ارجاع کار به ۱ یا چند نفر از اعضای کارگروه</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAssigneeError(null);

                if (selectedAssigneeIds.length === 0) {
                  setAssigneeError('لطفاً حداقل ۱ نفر از اعضای کارگروه را برای انجام وظیفه انتخاب فرمایید.');
                  return;
                }

                const form = e.target as HTMLFormElement;
                const selectedMembers = workgroupMembers.filter((m) =>
                  selectedAssigneeIds.includes(m.id)
                );
                const assignedNames = selectedMembers.map((m) => m.name).join('، ');
                const primaryRole = selectedMembers.map((m) => m.roleFa).filter((v, i, a) => a.indexOf(v) === i).join(' / ');

                const newTask: TaskEvent = {
                  id: `task-${Date.now()}`,
                  title: (form.elements.namedItem('title') as HTMLInputElement).value,
                  type: selectedTaskType as any,
                  priority: (form.elements.namedItem('priority') as HTMLSelectElement).value as any,
                  assignedTo: assignedNames || currentUser?.name || 'کارشناس اموال',
                  role: primaryRole || currentUser?.roleFa || 'کارشناس تجهیزات',
                  dueDate: (form.elements.namedItem('dueDate') as HTMLInputElement).value || '1405/05/30',
                  status: 'open',
                  autoGenerated: false,
                  notes: (form.elements.namedItem('notes') as HTMLInputElement).value,
                };
                onAddTask(newTask);
                setShowAddModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  عنوان آیتم چک‌لیست: <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  name="title"
                  placeholder={
                    isAssetManager
                      ? 'مثال: پلاک‌کوبی و الصاق بارکد QR به مانیتورهای جدید ICU'
                      : 'مثال: بررسی و اقدام در کارگروه'
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    نوع کار (مجاز برای کارگروه شما): <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={selectedTaskType}
                    onChange={(e) => setSelectedTaskType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 font-bold text-xs"
                  >
                    {allowedTaskTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اولویت اقدام:</label>
                  <select
                    name="priority"
                    defaultValue="high"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 text-xs"
                  >
                    <option value="high">🔴 فوری / نیازمند اقدام سریع</option>
                    <option value="medium">🟡 اولویت متوسط</option>
                    <option value="low">🟢 اولویت عادی / روتین</option>
                  </select>
                </div>
              </div>

              {/* Task Type Description Helper */}
              {allowedTaskTypes.find((t) => t.id === selectedTaskType)?.description && (
                <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex items-start gap-2 text-[11px] text-sky-900 leading-relaxed">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{allowedTaskTypes.find((t) => t.id === selectedTaskType)?.description}</span>
                </div>
              )}

              {/* Workgroup Assignee Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    <span>ارجاع به اعضای کارگروه (انتخاب ۱ تا چند نفر):</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentUser) {
                          setSelectedAssigneeIds([currentUser.id]);
                          setAssigneeError(null);
                        }
                      }}
                      className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                    >
                      ارجاع به خودم
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssigneeIds(workgroupMembers.map((m) => m.id));
                        setAssigneeError(null);
                      }}
                      className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                    >
                      انتخاب همه اعضا
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 max-h-48 overflow-y-auto">
                  {workgroupMembers.map((member) => {
                    const isSelected = selectedAssigneeIds.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAssigneeIds(selectedAssigneeIds.filter((id) => id !== member.id));
                          } else {
                            setSelectedAssigneeIds([...selectedAssigneeIds, member.id]);
                            setAssigneeError(null);
                          }
                        }}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-sky-50/90 border-sky-300 text-sky-950 shadow-xs'
                            : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
                              isSelected
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'bg-white border-slate-300 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <div>
                            <span className="font-bold text-xs block leading-tight">{member.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {member.roleFa} {member.personnelCode ? `(${member.personnelCode})` : ''}
                            </span>
                          </div>
                        </div>
                        {member.id === currentUser?.id && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-200/80 text-sky-800 font-bold">
                            شما
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {assigneeError ? (
                  <p className="text-rose-600 text-[11px] font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{assigneeError}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {selectedAssigneeIds.length.toLocaleString('fa-IR')} نفر انتخاب شده‌اند
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاریخ سررسید مهلت:</label>
                  <input
                    name="dueDate"
                    defaultValue="1405/05/28"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 dir-ltr text-right text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">دستورالعمل / یادداشت تکمیلی:</label>
                  <input
                    name="notes"
                    placeholder="مثال: الصاق برچسب فلزی و ثبت سریال شاسی"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-colors shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت و ابلاغ به کارگروه</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* INCOMPLETE DRAFT WARNING MODAL */}
      {warningDraftAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-amber-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-right">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">عدم امکان تکمیل تسک</h3>
                  <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block mt-0.5">
                    پیش‌نویس هنوز در سامانه ناقص است
                  </span>
                </div>
              </div>
              <button
                onClick={() => setWarningDraftAlert(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              تسک «<strong>{warningDraftAlert.task.title}</strong>» مربوط به پیش‌نویس ناقص است. تا زمانی که این قلم در بخش انبار و پیش‌نویس‌ها تکمیل، پلاک‌کوبی و نهایی‌سازی نشود، امکان بستن این تسک وجود ندارد.
            </p>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{warningDraftAlert.draft.faName}</span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-900 font-bold">
                  {warningDraftAlert.draft.code}
                </span>
              </div>
              {warningDraftAlert.draft.missingFields && warningDraftAlert.draft.missingFields.length > 0 && (
                <div className="text-[11px] text-amber-800">
                  <span className="font-bold">فیلدهای ناقص: </span>
                  <span>{warningDraftAlert.draft.missingFields.join('، ')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setWarningDraftAlert(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                متوجه شدم
              </button>

              <button
                onClick={() => {
                  const draftId = warningDraftAlert.draft.id;
                  setWarningDraftAlert(null);
                  setSelectedTask(null);
                  if (onNavigateToInventoryWithAction) {
                    onNavigateToInventoryWithAction({
                      initialTab: 'drafts',
                      actionGuidance: {
                        type: 'draft_tagging',
                        targetDraftId: draftId,
                        message: 'شناسنامه این پیش‌نویس را تکمیل فرمایید تا تسک به طور خودکار تکمیل شود.',
                      },
                    });
                  } else if (setActivePage) {
                    setActivePage('inventory');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <FileEdit className="w-4 h-4" />
                <span>ورود به فرم تکمیل در انبار</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
