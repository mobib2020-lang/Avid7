import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  Building,
  Mail,
  Key,
  Plus,
  Lock,
  Check,
  Search,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  UserPlus,
  ArrowUpDown,
  Bell,
  CheckSquare,
  Square,
  Layers,
  Settings,
  MoreVertical,
  Eye,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
} from 'lucide-react';
import {
  AppUser,
  RoleDefinition,
  UserRole,
  SupervisorResponsibilities,
  PageId,
} from '../../types';
import { CreateUserModal } from '../modals/CreateUserModal';

interface UsersViewProps {
  usersList: AppUser[];
  currentUser: AppUser;
  onSwitchCurrentUser: (user: AppUser) => void;
  onAddUser: (user: AppUser) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser?: (userId: string) => void;
}

// System pages definition for page permissions module
const SYSTEM_PAGES: { id: PageId; titleFa: string; category: string }[] = [
  { id: 'dashboard', titleFa: 'داشبورد اصلی', category: 'عمومی' },
  { id: 'inventory', titleFa: 'انبار و تجهیزات پزشکی', category: 'اموال و انبار' },
  { id: 'asset_structure', titleFa: 'ساختار دارایی‌ها و شناسنامه', category: 'اموال و انبار' },
  { id: 'calendar', titleFa: 'تقویم رویدادها و برنامه زمان‌بندی', category: 'برنامه‌ریزی' },
  { id: 'tasks', titleFa: 'چک‌لیست و مدیریت وظایف', category: 'برنامه‌ریزی' },
  { id: 'calibration', titleFa: 'مدیریت کالیبراسیون و ایمنی', category: 'نگهداشت و تعمیرات' },
  { id: 'failures', titleFa: 'گزارش‌ها و تیکت‌های خرابی', category: 'نگهداشت و تعمیرات' },
  { id: 'purchase_requests', titleFa: 'درخواست‌های خرید و تامین', category: 'تدارکات' },
  { id: 'smart_cart', titleFa: 'سبد خرید هوشمند AI', category: 'تدارکات' },
  { id: 'vendors', titleFa: 'تامین‌کنندگان و شرکا', category: 'تدارکات' },
  { id: 'reports', titleFa: 'گزارش‌ها و تحلیل‌ها', category: 'مدیریت و مالی' },
  { id: 'my_workgroup', titleFa: 'کارگروه من', category: 'مدیریت' },
  { id: 'users', titleFa: 'مدیریت کاربران و دسترسی‌ها', category: 'سیستم' },
  { id: 'settings', titleFa: 'تنظیمات سامانه', category: 'سیستم' },
];

// System permissions taxonomy
const ALL_PERMISSIONS = [
  { key: 'view_all', label: 'مشاهده تمامی بخش‌ها و گزارش‌ها', cat: 'دسترسی عمومی' },
  { key: 'edit_inventory', label: 'افزودن و ویرایش شناسنامه فنی تجهیزات', cat: 'مدیریت تجهیزات' },
  { key: 'delete_equipment', label: 'حذف تجهیز از سامانه', cat: 'مدیریت تجهیزات' },
  { key: 'approve_requests', label: 'تایید اولیه درخواست‌های خرید تجهیزات', cat: 'تدارکات و خرید' },
  { key: 'final_approval', label: 'تایید نهایی و تخصیص بودجه', cat: 'تدارکات و خرید' },
  { key: 'manage_calibrations', label: 'ثبت و تایید گواهی کالیبراسیون', cat: 'کالیبراسیون و فنی' },
  { key: 'report_failures', label: 'اعلام خرابی و ثبت تیکت تعمیرات', cat: 'نگهداری و تعمیر' },
  { key: 'resolve_failures', label: 'بستن تیکت تعمیر و رفع خرابی', cat: 'نگهداری و تعمیر' },
  { key: 'manage_users', label: 'مدیریت کاربران، نقش‌ها و دسترسی‌ها', cat: 'مدیریت سامانه' },
  { key: 'financial_reports', label: 'دسترسی به گزارش‌های مالی و استهلاک', cat: 'امور مالی' },
  { key: 'ai_full_access', label: 'دسترسی به تحلیل‌های پیشرفته هوش مصنوعی', cat: 'هوش مصنوعی' },
  { key: 'inventory_stock', label: 'مدیریت موجودی انبار قطعات یدکی', cat: 'انبارداری' },
];

// Initial 9 Default Roles (CHANGE 7)
const DEFAULT_ROLES_LIST: RoleDefinition[] = [
  {
    id: 'r-1',
    code: 'hospital_admin',
    titleFa: 'ادمین بیمارستان',
    description: 'دسترسی کامل مدیریت ارشد، تایید بودجه، کاربران و گزارش‌های مالی',
    permissions: ['view_all', 'final_approval', 'manage_users', 'financial_reports', 'ai_full_access'],
    isCustom: false,
  },
  {
    id: 'r-2',
    code: 'biomedical_engineer',
    titleFa: 'مسئول مهندسی پزشکی',
    description: 'مدیریت تجهیزات پزشکی، کالیبراسیون، شناسنامه فنی و درخواست قطعات',
    supervisorRoleId: 'r-1',
    permissions: ['view_all', 'edit_inventory', 'approve_requests', 'manage_calibrations', 'ai_full_access'],
    isCustom: false,
  },
  {
    id: 'r-3',
    code: 'dept_head',
    titleFa: 'رئیس دپارتمان / سرپرستار بخش',
    description: 'مدیریت تجهیزات اختصاصی بخش، ثبت درخواست خرید و اعلام خرابی',
    supervisorRoleId: 'r-1',
    permissions: ['view_all', 'report_failures', 'approve_requests'],
    isCustom: false,
  },
  {
    id: 'r-4',
    code: 'procurement_officer',
    titleFa: 'مسئول خرید و تدارکات',
    description: 'استعلام قیمت تامین‌کنندگان، استعلام بازرگانی و سبد خرید',
    supervisorRoleId: 'r-1',
    permissions: ['approve_requests', 'financial_reports'],
    isCustom: false,
  },
  {
    id: 'r-5',
    code: 'finance_manager',
    titleFa: 'مسئول مالی و بودجه',
    description: 'بررسی هزینه‌های تعمیرات، استهلاک و تایید مالی فاکتورها',
    supervisorRoleId: 'r-1',
    permissions: ['financial_reports', 'final_approval'],
    isCustom: false,
  },
  {
    id: 'r-6',
    code: 'warehouse_keeper',
    titleFa: 'مسئول انبار تجهیزات',
    description: 'کنترل ورودی/خروجی قطعات، موجودی انبار مصرفی و ثبت پیش‌نویس',
    supervisorRoleId: 'r-2',
    permissions: ['inventory_stock', 'edit_inventory'],
    isCustom: false,
  },
  {
    id: 'r-7',
    code: 'asset_manager',
    titleFa: 'امین اموال و پلاک‌کوبی',
    description: 'ثبت کد اموال، ردیابی فیزیکی دارایی‌ها و استهلاک تجهیزات',
    supervisorRoleId: 'r-1',
    permissions: ['view_all', 'edit_inventory'],
    isCustom: false,
  },
  {
    id: 'r-8',
    code: 'support_tech',
    titleFa: 'پشتیبان و خدمات فنی',
    description: 'رسیدگی به تیکت‌های خرابی، سرویس فنی دوره‌ای و تعمیرات',
    supervisorRoleId: 'r-2',
    permissions: ['report_failures', 'resolve_failures', 'manage_calibrations'],
    isCustom: false,
  },
  {
    id: 'r-9',
    code: 'nurse_operator',
    titleFa: 'اپراتور / کاربر تجهیز',
    description: 'ثبت اعلام اشکال روزمره، تحویل شیفت و گزارش کارکرد',
    supervisorRoleId: 'r-3',
    permissions: ['report_failures'],
    isCustom: false,
  },
];

export const UsersView: React.FC<UsersViewProps> = ({
  usersList,
  currentUser,
  onSwitchCurrentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'hierarchy' | 'roles'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Roles state
  const [rolesList, setRolesList] = useState<RoleDefinition[]>(DEFAULT_ROLES_LIST);

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCreateWorkgroupModal, setShowCreateWorkgroupModal] = useState(false);
  const [editingUserForOverrides, setEditingUserForOverrides] = useState<AppUser | null>(null);
  const [editingUserForSupervisor, setEditingUserForSupervisor] = useState<AppUser | null>(null);
  const [editingUserForPagePermissions, setEditingUserForPagePermissions] = useState<AppUser | null>(null);
  const [editingUserGeneral, setEditingUserGeneral] = useState<AppUser | null>(null);

  // Role Management Modal
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);

  // Filtered Users list
  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      u.name.includes(searchQuery) ||
      u.personnelCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.includes(searchQuery);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchDept = deptFilter === 'all' || u.department === deptFilter;
    return matchSearch && matchRole && matchDept;
  });

  // Unique departments for filter
  const departments = Array.from(new Set(usersList.map((u) => u.department)));

  // Handle Supervisor Assignment (CHANGE 4 & 5)
  const handleSaveSupervisorSettings = (
    userId: string,
    supervisorId: string,
    responsibilities: SupervisorResponsibilities
  ) => {
    const targetUser = usersList.find((u) => u.id === userId);
    const supervisorUser = usersList.find((u) => u.id === supervisorId);
    if (targetUser) {
      onUpdateUser({
        ...targetUser,
        supervisorId: supervisorId || undefined,
        supervisorName: supervisorUser ? supervisorUser.name : undefined,
        supervisorRoleTitle: supervisorUser ? supervisorUser.roleFa : undefined,
      });
    }
    setEditingUserForSupervisor(null);
  };

  // Handle Individual Permission Override Toggle (CHANGE 9)
  const handleToggleIndividualOverride = (userId: string, permKey: string) => {
    const targetUser = usersList.find((u) => u.id === userId);
    if (!targetUser) return;

    const currentOverrides = targetUser.individualOverrides || {};
    const defaultHasPerm = targetUser.permissions.includes(permKey);

    let updatedOverrides = { ...currentOverrides };

    // Toggle logic: if currently overridden, reverse or delete
    if (currentOverrides[permKey] !== undefined) {
      delete updatedOverrides[permKey];
    } else {
      updatedOverrides[permKey] = !defaultHasPerm;
    }

    const updatedUser = {
      ...targetUser,
      individualOverrides: updatedOverrides,
    };

    onUpdateUser(updatedUser);
    setEditingUserForOverrides(updatedUser);
  };

  // Helper to check if permission is effectively granted to user (CHANGE 9)
  const isPermissionEffective = (user: AppUser, permKey: string): boolean => {
    if (user.individualOverrides && user.individualOverrides[permKey] !== undefined) {
      return user.individualOverrides[permKey];
    }
    return user.permissions.includes(permKey);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#2b64f6]" />
            <span>مدیریت کاربران، سرپرستان و نقش‌های سازمانی (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تفکیک دقیق ۴ ساختار: کاربر (User)، نقش (Role)، سرپرست (Supervisor) و دسترسی (Permission)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddRoleModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-200/80"
          >
            <Shield className="w-4 h-4 text-purple-600" />
            <span>افزودن نقش جدید</span>
          </button>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>تعریف کاربر جدید</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs">
        <button
          onClick={() => setActiveTab('table')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'table'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>کاربران</span>
        </button>

        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'hierarchy'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>کارگروه‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>شرح وظایف و نقش‌ها</span>
        </button>
      </div>

      {/* TAB 1: COMPACT TABLE LIST OF USERS (CHANGE 3) */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام، کد پرسنلی، ایمیل..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto text-xs">
              <div className="flex items-center gap-1.5 w-full md:w-auto">
                <span className="text-slate-500 font-bold shrink-0">نقش:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold w-full md:w-48"
                >
                  <option value="all">همه نقش‌ها ({usersList.length})</option>
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.titleFa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto">
                <span className="text-slate-500 font-bold shrink-0">بخش:</span>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold w-full md:w-40"
                >
                  <option value="all">همه بخش‌ها</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* COMPACT TABLE (CHANGE 3) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3.5">عکس و نام کاربر</th>
                    <th className="p-3.5">کد پرسنلی / ایمیل</th>
                    <th className="p-3.5">نقش سازمانی</th>
                    <th className="p-3.5">سرپرست مستقیم (Supervisor)</th>
                    <th className="p-3.5">بخش</th>
                    <th className="p-3.5 text-center">وضعیت</th>
                    <th className="p-3.5 text-center">مدیریت کاربر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUsers.map((user) => {
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Profile Photo & Name */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2b64f6] to-[#1d52d8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs overflow-hidden">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{user.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block">{user.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                آخرین ورود: {user.lastLogin}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Personnel Code & Email */}
                        <td className="p-3.5">
                          <span className="font-mono text-slate-800 font-bold block">{user.personnelCode}</span>
                          <span className="text-[11px] text-slate-500 font-mono block">{user.email}</span>
                        </td>

                        {/* Role */}
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-extrabold border border-sky-100 inline-block">
                            {user.roleFa}
                          </span>
                        </td>

                        {/* Supervisor */}
                        <td className="p-3.5">
                          {user.supervisorName ? (
                            <div className="flex items-center gap-1.5 text-slate-800">
                              <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              <span className="font-bold">{user.supervisorName}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">تعیین‌نشده</span>
                          )}
                        </td>

                        {/* Department */}
                        <td className="p-3.5 text-slate-600 font-bold">{user.department}</td>

                        {/* Status */}
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() =>
                              onUpdateUser({
                                ...user,
                                status: user.status === 'active' ? 'inactive' : 'active',
                              })
                            }
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                              user.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {user.status === 'active' ? 'فعال' : 'غیرفعال'}
                          </button>
                        </td>

                        {/* User Management Column with 2 Modules */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* ماژول 1: تعیین سرپرست */}
                            <button
                              onClick={() => setEditingUserForSupervisor(user)}
                              className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                              title="ماژول تعیین سرپرست: انتخاب سرپرست مستقیم، ارتقا به سرپرست یا ساختار مستقل"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                              <span>تعیین سرپرست</span>
                            </button>

                            {/* ماژول 2: دسترسی‌ها */}
                            <button
                              onClick={() => setEditingUserForPagePermissions(user)}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border shrink-0 ${
                                user.pagePermissions && Object.keys(user.pagePermissions).length > 0
                                  ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200'
                                  : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                              }`}
                              title="ماژول دسترسی‌ها: جدول دسترسی به صفحات پنل (مشاهده و انجام عملیات)"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                              <span>دسترسی‌ها</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKGROUPS & SUPERVISORY STRUCTURE VIEW */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
          {/* Top Header Bar for Workgroups Tab */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">مدیریت کارگروه‌ها و ساختار نظارتی</h3>
                <p className="text-xs text-slate-500 mt-0.5">مشاهده کارگروه‌ها، سرپرستان مستقیم و اعضای تحت نظارت</p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateWorkgroupModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#2b64f6] hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>ایجاد کارگروه جدید</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="divide-y divide-slate-100 text-xs">
              {/* Level 0 Root: Hospital Admin */}
              <div className="p-4 bg-sky-900 text-white font-extrabold flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-sky-900 font-bold flex items-center justify-center text-xs">
                    ادمین
                  </div>
                  <div>
                    <span className="text-sm block">مدیر ارشد سیستم و بیمارستان (Hospital Administrator)</span>
                    <span className="text-[10px] text-sky-200 font-normal">مدیریت عالی کلیه بخش‌ها و سرپرستان</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px]">سطح ارشد مدیریت</span>
              </div>

              {/* Hierarchy Tree of Supervisors */}
              {usersList
                .filter((u) => {
                  const isSupervisor = usersList.some((sub) => sub.supervisorId === u.id);
                  const isNoSubIndependent = !u.supervisorId && !isSupervisor;
                  return isSupervisor || isNoSubIndependent;
                })
                .map((sup) => {
                  const directSubs = usersList.filter((u) => u.supervisorId === sup.id);
                  const isSup = directSubs.length > 0;

                  return (
                    <div key={sup.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                            {sup.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-xs">{sup.name}</span>
                              <span className="px-2 py-0.5 bg-sky-50 text-sky-800 font-bold text-[10px] rounded border border-sky-100">
                                {sup.roleFa}
                              </span>
                              {isSup ? (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-full">
                                  سرپرست کارگروه ({directSubs.length} اعضای تحت نظارت)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                                  کاربر مستقل
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              بخش: {sup.department} | کد: {sup.personnelCode}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingUserForSupervisor(sup)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl transition-colors cursor-pointer"
                          >
                            مدیریت سرپرستی
                          </button>
                        </div>
                      </div>

                      {/* Expandable Children for this supervisor */}
                      {isSup && (
                        <div className="mr-8 mt-3 pl-3 border-r-2 border-sky-300 space-y-2 pt-2 bg-slate-50/60 p-3 rounded-2xl">
                          <span className="text-[10px] font-extrabold text-slate-500 block mb-1">
                            ↳ اعضای کارگروه تحت نظارت ({sup.name}):
                          </span>
                          {directSubs.map((sub) => (
                            <div
                              key={sub.id}
                              className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[10px]">
                                  {sub.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-800 block">{sub.name}</span>
                                  <span className="text-[10px] text-slate-400">{sub.roleFa} — {sub.department}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingUserForPagePermissions(sub)}
                                  className="px-2.5 py-1 bg-purple-50 text-purple-800 font-bold text-[10px] rounded-lg border border-purple-100 hover:bg-purple-100 cursor-pointer"
                                >
                                  دسترسی‌ها
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEFAULT ROLES MANAGEMENT (CHANGE 7 & 8) */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rolesList.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                      <h3 className="font-black text-xs text-slate-800">{role.titleFa}</h3>
                    </div>
                    {role.isCustom && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[9px] font-bold rounded-md">
                        سفارشی
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{role.description}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-400 block mb-1.5">
                      دسترسی‌های پیش‌فرض نقش ({role.permissions.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((pKey) => {
                        const permObj = ALL_PERMISSIONS.find((ap) => ap.key === pKey);
                        return (
                          <span
                            key={pKey}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md"
                          >
                            {permObj ? permObj.label : pKey}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold">
                    کاربران فعال: {usersList.filter((u) => u.role === role.code).length} نفر
                  </span>
                  <button
                    onClick={() => setEditingRole(role)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    ویرایش نقش و دسترسی‌ها
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: INDIVIDUAL PERMISSION OVERRIDES (CHANGE 9) */}
      {editingUserForOverrides && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span>دسترسی‌های اختصاصی (Overrides) — {editingUserForOverrides.name}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  نقش سازمانی: {editingUserForOverrides.roleFa} | تنظیم مستقیم دسترسی فردی
                </p>
              </div>
              <button
                onClick={() => setEditingUserForOverrides(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed bg-purple-50 p-3 rounded-2xl border border-purple-200">
                بر اساس مدل <strong className="text-purple-900">ROLE + OVERRIDES</strong>، در صورت نیاز می‌توانید مجوزهای مشخصی را صرفاً برای همین کاربر فعال یا غیرفعال کنید.
              </p>

              <div className="space-y-2 pt-2">
                {ALL_PERMISSIONS.map((perm) => {
                  const effective = isPermissionEffective(editingUserForOverrides, perm.key);
                  const isOverridden =
                    editingUserForOverrides.individualOverrides &&
                    editingUserForOverrides.individualOverrides[perm.key] !== undefined;

                  return (
                    <div
                      key={perm.key}
                      onClick={() =>
                        handleToggleIndividualOverride(editingUserForOverrides.id, perm.key)
                      }
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                        effective
                          ? 'bg-sky-50/80 border-sky-200 text-sky-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={effective}
                          onChange={() => {}}
                          className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                        />
                        <div>
                          <span className="block text-xs font-bold">{perm.label}</span>
                          <span className="text-[10px] text-slate-400">{perm.cat}</span>
                        </div>
                      </div>

                      {isOverridden && (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-black">
                          تغییر مستقیم
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setEditingUserForOverrides(null)}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                تایید و ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 0: CREATE NEW WORKGROUP MODAL */}
      {showCreateWorkgroupModal && (
        <CreateWorkgroupModal
          usersList={usersList}
          onClose={() => setShowCreateWorkgroupModal(false)}
          onSave={(supervisorId, memberIds) => {
            const supervisorUser = usersList.find((u) => u.id === supervisorId);
            if (!supervisorUser) return;

            // For each member user, update their supervisor
            memberIds.forEach((memberId) => {
              const member = usersList.find((u) => u.id === memberId);
              if (member) {
                onUpdateUser({
                  ...member,
                  supervisorId: supervisorId,
                  supervisorName: supervisorUser.name,
                  supervisorRoleTitle: supervisorUser.roleFa,
                });
              }
            });

            setShowCreateWorkgroupModal(false);
          }}
        />
      )}

      {/* MODAL 1: SUPERVISOR ASSIGNMENT MODULE */}
      {editingUserForSupervisor && (
        <SupervisorModuleModal
          user={editingUserForSupervisor}
          usersList={usersList}
          onClose={() => setEditingUserForSupervisor(null)}
          onSave={(supervisorId, isSupervisor, supervisorLevel, resp) => {
            const supervisorUser = usersList.find((u) => u.id === supervisorId);
            onUpdateUser({
              ...editingUserForSupervisor,
              supervisorId: supervisorId || undefined,
              supervisorName: supervisorUser ? supervisorUser.name : undefined,
              supervisorRoleTitle: supervisorUser ? supervisorUser.roleFa : undefined,
              supervisorLevel: isSupervisor ? supervisorLevel : undefined,
            });
            setEditingUserForSupervisor(null);
          }}
        />
      )}

      {/* MODAL 2: PAGE PERMISSIONS MODULE (مشاهده & انجام عملیات) */}
      {editingUserForPagePermissions && (
        <PagePermissionsModal
          user={editingUserForPagePermissions}
          onClose={() => setEditingUserForPagePermissions(null)}
          onSave={(updatedUser) => {
            onUpdateUser(updatedUser);
            setEditingUserForPagePermissions(null);
          }}
        />
      )}

      {/* MODAL 3: CREATE / ADD NEW USER */}
      <CreateUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onAddUser={onAddUser}
        rolesList={rolesList}
        existingUsers={usersList}
      />

      {/* MODAL 4: ADD CUSTOM ROLE (CHANGE 8) */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">افزودن نقش سازمانی جدید</h3>
              <button onClick={() => setShowAddRoleModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const titleFa = (form.elements.namedItem('titleFa') as HTMLInputElement).value;
                const description = (form.elements.namedItem('description') as HTMLInputElement).value;
                const supervisorRoleId = (form.elements.namedItem('supervisorRoleId') as HTMLSelectElement).value;

                const newRole: RoleDefinition = {
                  id: `role-${Date.now()}`,
                  code: `custom_${Date.now().toString().slice(-4)}`,
                  titleFa,
                  description,
                  supervisorRoleId: supervisorRoleId || undefined,
                  permissions: ['view_all', 'report_failures'],
                  isCustom: true,
                };

                setRolesList((prev) => [...prev, newRole]);
                setShowAddRoleModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان فارسی نقش:</label>
                <input
                  required
                  name="titleFa"
                  placeholder="مثال: سوپروایزر کالیبراسیون و بالینی"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">شرح مسئولیت‌های نقش:</label>
                <input
                  required
                  name="description"
                  placeholder="توضیح خلاصه نقش و وظایف اصلی"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">نقش ارشد / سرپرست این نقش:</label>
                <select name="supervisorRoleId" className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold">
                  <option value="">بدون نقش ارشد مستقیم</option>
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.titleFa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  انصراف
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold shadow-xs">
                  ایجاد نقش
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================================================================
   SUB-COMPONENT: PagePermissionsModal (ماژول دسترسی‌ها)
   ======================================================================== */
interface PagePermissionsModalProps {
  user: AppUser;
  onClose: () => void;
  onSave: (updatedUser: AppUser) => void;
}

const PagePermissionsModal: React.FC<PagePermissionsModalProps> = ({ user, onClose, onSave }) => {
  const [perms, setPerms] = useState<Record<string, { view: boolean; action: boolean }>>(() => {
    const initial: Record<string, { view: boolean; action: boolean }> = {};
    SYSTEM_PAGES.forEach((page) => {
      if (user.pagePermissions && user.pagePermissions[page.id]) {
        initial[page.id] = { ...user.pagePermissions[page.id] };
      } else {
        const isSuperAdmin = user.role === 'hospital_admin';
        const hasView = isSuperAdmin || (user.allowedPages ? user.allowedPages.includes(page.id) : true);
        const hasAction = isSuperAdmin;
        initial[page.id] = { view: hasView, action: hasAction };
      }
    });
    return initial;
  });

  const toggleView = (pageId: string) => {
    setPerms((prev) => {
      const current = prev[pageId] || { view: false, action: false };
      const nextView = !current.view;
      // CRITICAL RULE: "دقت شود که تنها در صورتی می توان دسترسی انجام عملیات درصفحه ای را به کاربر اعطا کرد که دسترسی مشاهده آن فعال باشد."
      // Turning off view automatically forces action off too!
      const nextAction = nextView ? current.action : false;
      return {
        ...prev,
        [pageId]: { view: nextView, action: nextAction },
      };
    });
  };

  const toggleAction = (pageId: string) => {
    setPerms((prev) => {
      const current = prev[pageId] || { view: false, action: false };
      const nextAction = !current.action;
      // Enabling action automatically enables view if it was off
      const nextView = nextAction ? true : current.view;
      return {
        ...prev,
        [pageId]: { view: nextView, action: nextAction },
      };
    });
  };

  const handleSave = () => {
    onSave({
      ...user,
      pagePermissions: perms,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                جدول مدیریت دسترسی به صفحات — {user.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                نقش سازمانی: <span className="font-bold text-slate-700">{user.roleFa}</span> | بخش: <span className="font-bold text-slate-700">{user.department}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rule Banner */}
        <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-3 text-xs text-purple-950 flex items-start gap-2.5 shrink-0">
          <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong>دستورالعمل سطوح دسترسی:</strong> اعطای دسترسی <span className="font-bold">«انجام عملیات»</span> تنها زمانی ممکن است که دسترسی <span className="font-bold">«مشاهده»</span> آن صفحه فعال باشد. با غیرفعال کردن مشاهده، دسترسی انجام عملیات نیز خودکار خاموش خواهد شد.
          </p>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto border border-slate-200 rounded-2xl flex-1 shadow-2xs">
          <table className="w-full text-right text-xs">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs text-slate-700 font-extrabold border-b border-slate-200 z-10">
              <tr>
                <th className="p-3.5">نام صفحات موجود در پنل</th>
                <th className="p-3.5 text-center">مشاهده</th>
                <th className="p-3.5 text-center">انجام عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {SYSTEM_PAGES.map((page) => {
                const pagePerm = perms[page.id] || { view: false, action: false };

                return (
                  <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{page.titleFa}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px]">
                          {page.category}
                        </span>
                      </div>
                    </td>

                    {/* View Cell */}
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleView(page.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          pagePerm.view
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {pagePerm.view ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>مجاز (روشن)</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-slate-400" />
                            <span>محدود (خاموش)</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action Cell */}
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleAction(page.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          pagePerm.action
                            ? 'bg-sky-600 text-white border-sky-700 shadow-2xs'
                            : pagePerm.view
                            ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            : 'bg-slate-100/60 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                        }`}
                        title={
                          !pagePerm.view
                            ? 'جهت اعطای دسترسی انجام عملیات، ابتدا دسترسی مشاهده را روشن کنید'
                            : ''
                        }
                      >
                        {pagePerm.action ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>مجاز (روشن)</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-slate-400" />
                            <span>محدود (خاموش)</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            تعداد صفحات با دسترسی مشاهده: <strong className="text-slate-800">{Object.values(perms).filter((p: { view: boolean; action: boolean }) => p.view).length}</strong> از {SYSTEM_PAGES.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              ذخیره و اعمال دسترسی‌ها
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================
   SUB-COMPONENT: SupervisorModuleModal (ماژول تعیین سرپرست)
   ======================================================================== */
interface SupervisorModuleModalProps {
  user: AppUser;
  usersList: AppUser[];
  onClose: () => void;
  onSave: (
    supervisorId: string,
    isSupervisor: boolean,
    supervisorLevel: 1 | 2 | 3,
    responsibilities: SupervisorResponsibilities
  ) => void;
}

const SupervisorModuleModal: React.FC<SupervisorModuleModalProps> = ({
  user,
  usersList,
  onClose,
  onSave,
}) => {
  const [mode, setMode] = useState<'assigned' | 'independent'>(() => {
    if (user.supervisorId) return 'assigned';
    return 'independent';
  });

  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>(user.supervisorId || '');
  const [resp] = useState<SupervisorResponsibilities>({
    manageSubPermissions: true,
    supervisePerformance: true,
    viewActivityStatus: true,
    receiveSubNotifications: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'assigned') {
      onSave(selectedSupervisorId, false, 1, resp);
    } else {
      onSave('', false, 1, resp);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                ماژول تعیین سرپرست — {user.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تعیین سرپرست مستقیم کاربر یا تنظیم به صورت کاربر مستقل
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setMode('assigned')}
            className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer ${
              mode === 'assigned'
                ? 'bg-white text-sky-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ۱. تعیین سرپرست
          </button>
          <button
            type="button"
            onClick={() => setMode('independent')}
            className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer ${
              mode === 'independent'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ۲. کاربر مستقل
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'assigned' && (
            <div className="space-y-3 bg-sky-50/60 p-4 rounded-2xl border border-sky-100">
              <label className="font-extrabold text-slate-800 block">
                انتخاب سرپرست مستقیم از لیست کاربران:
              </label>
              <select
                value={selectedSupervisorId}
                onChange={(e) => setSelectedSupervisorId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-sky-500"
              >
                <option value="">-- انتخاب کنید --</option>
                {usersList
                  .filter((u) => u.id !== user.id)
                  .map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.roleFa} — {sup.department})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {mode === 'independent' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-600 space-y-1">
              <span className="font-extrabold text-slate-800 block">تعیین به عنوان نقش مستقل:</span>
              <p className="text-[11px] leading-relaxed">
                در این حالت، کاربر فاقد سرپرست مستقیم بالادست بوده و به صورت مستقل فعالیت می‌کند.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              ذخیره تغییرات سرپرست
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ========================================================================
   SUB-COMPONENT: CreateWorkgroupModal (ایجاد کارگروه جدید)
   ======================================================================== */
interface CreateWorkgroupModalProps {
  usersList: AppUser[];
  onClose: () => void;
  onSave: (supervisorId: string, memberIds: string[], workgroupName: string) => void;
}

const CreateWorkgroupModal: React.FC<CreateWorkgroupModalProps> = ({
  usersList,
  onClose,
  onSave,
}) => {
  const [workgroupName, setWorkgroupName] = useState('');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const availableMembers = usersList.filter((u) => u.id !== selectedSupervisorId);

  const filteredMembers = availableMembers.filter(
    (u) =>
      u.name.includes(searchTerm) ||
      u.roleFa.includes(searchTerm) ||
      u.department.includes(searchTerm)
  );

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedMemberIds(filteredMembers.map((m) => m.id));
  };

  const handleClearAll = () => {
    setSelectedMemberIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupervisorId) {
      alert('لطفاً سرپرست کارگروه را انتخاب کنید.');
      return;
    }
    if (selectedMemberIds.length === 0) {
      alert('لطفاً حداقل یک کاربر را به عنوان عضو کارگروه انتخاب کنید.');
      return;
    }
    onSave(selectedSupervisorId, selectedMemberIds, workgroupName);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">ایجاد کارگروه جدید و انتصاب سرپرست</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تعیین سرپرست و انتخاب چند کاربر همزمان به عنوان اعضای کارگروه
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs flex-1 flex flex-col min-h-0">
          {/* Workgroup Name & Supervisor Select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">نام کارگروه (اختیاری):</label>
              <input
                type="text"
                value={workgroupName}
                onChange={(e) => setWorkgroupName(e.target.value)}
                placeholder="مثال: کارگروه بخش اورژانس"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1">انتخاب سرپرست کارگروه: *</label>
              <select
                value={selectedSupervisorId}
                onChange={(e) => {
                  const newSupId = e.target.value;
                  setSelectedSupervisorId(newSupId);
                  setSelectedMemberIds((prev) => prev.filter((id) => id !== newSupId));
                }}
                required
                className="w-full p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 font-bold focus:outline-none focus:border-sky-500"
              >
                <option value="">-- سرپرست را انتخاب کنید --</option>
                {usersList.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} ({sup.roleFa} — {sup.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Members Selection Section */}
          <div className="flex-1 flex flex-col min-h-0 border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <span className="font-extrabold text-slate-800">
                انتخاب اعضای کارگروه ({selectedMemberIds.length} نفر انتخاب شده): *
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                >
                  انتخاب همه
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  پاک کردن
                </button>
              </div>
            </div>

            {/* Search Input for Members */}
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجوی نام یا بخش در اعضا..."
                className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Members Checklist Table */}
            <div className="overflow-y-auto flex-1 bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 min-h-[160px]">
              {filteredMembers.map((member) => {
                const isChecked = selectedMemberIds.includes(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`p-2.5 flex items-center justify-between transition-colors cursor-pointer hover:bg-slate-50 ${
                      isChecked ? 'bg-sky-50/60 font-bold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                      />
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block">{member.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {member.roleFa} — {member.department}
                        </span>
                      </div>
                    </div>

                    {member.supervisorName && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        سرپرست فعلی: {member.supervisorName}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 shrink-0 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2b64f6] hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              ایجاد کارگروه و انتصاب سرپرست
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
