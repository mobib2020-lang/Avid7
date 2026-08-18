import React, { useState } from 'react';
import {
  Search,
  Bell,
  User,
  Bot,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Building,
  LogOut,
  UserCheck,
  Package,
  Info,
  CalendarCheck,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { AppUser, EquipmentItem, PageId, TaskEvent } from '../types';
import { getNotificationsFromTasksAndEvents } from '../utils/workgroupHelpers';

interface HeaderProps {
  currentUser: AppUser;
  allUsers: AppUser[];
  onSwitchUser: (user: AppUser) => void;
  onLogout?: () => void;
  collapsed: boolean;
  onOpenAIChat: () => void;
  equipmentList: EquipmentItem[];
  tasksList?: TaskEvent[];
  setActivePage: (page: PageId) => void;
  onSelectEquipment: (equipment: EquipmentItem) => void;
  onNavigateToInventoryWithAction?: (params: {
    initialTab?: 'drafts' | 'inventory';
    initialLayout?: 'grouped' | 'individual' | 'tree';
    initialStatusFilter?: string;
    actionGuidance?: {
      type: 'draft_tagging' | 'low_stock' | 'asset_transfer' | 'purchase_approval';
      title: string;
      description: string;
      targetDraftId?: string;
    } | null;
    openAssetTransferModal?: boolean;
    openQuickRestockModal?: boolean;
  }) => void;
  onUpdateUser?: (updatedUser: AppUser) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers = [],
  onSwitchUser,
  onLogout,
  collapsed = false,
  onOpenAIChat,
  equipmentList = [],
  tasksList = [],
  setActivePage,
  onSelectEquipment,
  onNavigateToInventoryWithAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const userName = currentUser?.name || 'کاربر';
  const roleFa = currentUser?.roleFa || 'کاربر';
  const role = currentUser?.role;

  // Search filter
  const searchResults = searchQuery.trim()
    ? equipmentList.filter(
        (eq) =>
          eq.faName.includes(searchQuery) ||
          eq.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.department.includes(searchQuery)
      )
    : [];

  // Notifications dynamically derived 100% from real Tasks, Events, and Draft Actions
  const notificationsList = getNotificationsFromTasksAndEvents(
    currentUser,
    tasksList,
    equipmentList
  );

  const notifHeaderTitle =
    role === 'asset_manager'
      ? 'اعلان‌ها و رویدادهای کارگروه اموال و انبار'
      : role === 'finance_manager'
      ? 'اعلان‌ها و رویدادهای کارگروه مالی و بودجه'
      : role === 'procurement_officer'
      ? 'اعلان‌ها و رویدادهای بازرگانی و خرید'
      : role === 'biomedical_engineer' || role === 'support_tech'
      ? 'اعلان‌ها و رویدادهای مهندسی پزشکی'
      : 'اعلان‌ها و رویدادهای کاری بیمارستان';

  return (
    <header
      style={{
        paddingLeft: '24px',
        paddingRight: '24px',
        height: '68px',
      }}
      className={`fixed top-0 left-0 bg-[#f0f4fd]/90 backdrop-blur-md z-20 transition-all duration-300 flex items-center justify-between ${
        collapsed ? 'right-20' : 'right-72'
      }`}
    >
      {/* Search Input & Quick Results */}
      <div className="relative w-72 sm:w-96">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#2b64f6] absolute right-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی همه‌چیز (تجهیزات، بخش‌ها، کد اموال)..."
            className="w-full pr-10 pl-4 py-2.5 text-xs font-semibold rounded-full bg-white text-slate-800 shadow-sm border border-transparent focus:border-[#2b64f6] focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>

        {/* Search Results Popover */}
        {searchQuery.trim() && (
          <div className="absolute right-0 top-12 w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 max-h-80 overflow-y-auto">
            <div className="text-[11px] font-semibold text-slate-400 px-3 py-1.5 border-b border-slate-100 flex justify-between">
              <span>نتایج جستجو</span>
              <span>{searchResults.length} مورد</span>
            </div>
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectEquipment(item);
                    setActivePage('inventory');
                    setSearchQuery('');
                  }}
                  className="w-full text-right p-2.5 rounded-xl hover:bg-sky-50 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-none cursor-pointer"
                >
                  <div className="p-2 bg-sky-100 text-sky-700 rounded-lg shrink-0 mt-0.5">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-xs text-slate-800 truncate">
                        {item.faName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                        {item.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.brand} | {item.department}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center py-4 text-xs text-slate-400">
                تجهیزی با این مشخصات یافت نشد.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right User Actions & Simple Status Display */}
      <div className="flex items-center gap-3">
        {/* AI Assistant Quick Trigger */}
        <button
          onClick={onOpenAIChat}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2b64f6] to-[#1d52d8] hover:from-[#1d52d8] hover:to-[#1e40af] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer border border-blue-400/30"
          title="دستیار هوشمند AI آوید"
        >
          <Bot className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">دستیار هوشمند AI</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2.5 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 bg-white/70 border border-slate-200/80 shadow-xs transition-all cursor-pointer flex items-center justify-center"
            title={notifHeaderTitle}
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {notificationsList.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-rose-500 text-white rounded-full ring-2 ring-white text-[10px] font-black flex items-center justify-center shadow-xs pointer-events-none">
                {notificationsList.length > 9 ? '+۹' : notificationsList.length.toLocaleString('fa-IR')}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifDropdown(false)}
              />
              <div className="absolute left-0 top-12 w-88 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-800 block">
                        {notifHeaderTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        مشتق‌شده از وظایف و رویدادهای زنده سیستم
                      </span>
                    </div>
                  </div>
                  <span
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-700 font-semibold cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100"
                  >
                    بستن
                  </span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {notificationsList.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">تمامی وظایف و رویدادها انجام شده‌اند</p>
                      <p className="text-[11px] text-slate-400">هیچ اعلان یا وظیفه بازی برای کارگروه شما وجود ندارد.</p>
                    </div>
                  ) : (
                    notificationsList.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setShowNotifDropdown(false);
                          if (n.sourceType === 'draft') {
                            if (onNavigateToInventoryWithAction) {
                              onNavigateToInventoryWithAction({
                                initialTab: 'drafts',
                                actionGuidance: {
                                  type: 'draft_tagging',
                                  title: 'تکمیل پیش‌نویس ناقص اقلام انبار',
                                  description: 'این قلم فاقد اطلاعات کامل یا سریال است. لطفاً فرم پیش‌نویس را تکمیل و نهایی فرمایید.',
                                  targetDraftId: n.targetEquipmentId || n.draftId,
                                },
                              });
                            } else {
                              setActivePage('inventory');
                            }
                          } else if (n.sourceType === 'task') {
                            const taskType = n.task?.type;
                            if (taskType === 'draft_completion' || taskType === 'tagging') {
                              if (onNavigateToInventoryWithAction) {
                                onNavigateToInventoryWithAction({
                                  initialTab: 'drafts',
                                  actionGuidance: {
                                    type: 'draft_tagging',
                                    title: n.title,
                                    description: n.desc,
                                    targetDraftId: n.task?.equipmentCode,
                                  },
                                });
                              } else {
                                setActivePage('inventory');
                              }
                            } else if (taskType === 'stock_check' || taskType === 'inventory_audit') {
                              if (onNavigateToInventoryWithAction) {
                                onNavigateToInventoryWithAction({
                                  initialTab: 'inventory',
                                  initialLayout: 'grouped',
                                });
                              } else {
                                setActivePage('inventory');
                              }
                            } else if (taskType === 'purchase') {
                              setActivePage('purchase_requests');
                            } else if (taskType === 'calibration') {
                              setActivePage('calibration');
                            } else {
                              setActivePage('tasks');
                            }
                          } else {
                            setActivePage('tasks');
                          }
                        }}
                        className={`w-full text-right p-3 rounded-2xl border transition-all flex items-start gap-2.5 cursor-pointer group ${
                          n.sourceType === 'draft'
                            ? 'bg-amber-50/80 border-amber-200/90 hover:bg-amber-100/90'
                            : n.type === 'danger'
                            ? 'bg-rose-50/60 border-rose-200/80 hover:bg-rose-100/70'
                            : n.type === 'warning'
                            ? 'bg-amber-50/50 border-amber-200/70 hover:bg-amber-100/60'
                            : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100/80'
                        }`}
                      >
                        {n.sourceType === 'draft' ? (
                          <Package className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        ) : n.type === 'danger' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : n.type === 'warning' ? (
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckSquare className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800 line-clamp-1">
                              {n.title}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                n.sourceType === 'draft'
                                  ? 'bg-amber-200 text-amber-900'
                                  : n.sourceType === 'task'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {n.sourceType === 'draft'
                                ? 'پیش‌نویس اموال'
                                : n.sourceType === 'task'
                                ? 'وظیفه باز'
                                : 'رویداد'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            {n.desc}
                          </p>

                          <div className="mt-2 flex items-center justify-between text-[10px]">
                            <span className="text-blue-600 font-bold group-hover:underline flex items-center gap-1">
                              <span>انجام اقدام</span>
                              <span className="dir-ltr font-mono">❮</span>
                            </span>
                            <span className="text-slate-400 font-medium">{n.time}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(false);
                      setActivePage('tasks');
                    }}
                    className="text-sky-600 hover:text-sky-800 font-bold cursor-pointer"
                  >
                    مشاهده تقویم و فهرست کامل وظایف ❯
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Role Indicator & Switcher in Top Bar */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-slate-100 transition-all border border-slate-200/80 shadow-xs cursor-pointer"
            title="تغییر نقش کاربری / وضعیت حساب"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2b64f6] to-[#1d52d8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs overflow-hidden ring-2 ring-sky-100">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span>{userName.charAt(0)}</span>
              )}
            </div>
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-black text-slate-800 leading-tight">
                {userName}
              </span>
              <span className="text-[10px] text-[#2b64f6] font-bold">
                {roleFa}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Quick Role Switch Dropdown */}
          {showRoleDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowRoleDropdown(false)}
              />
              <div className="absolute left-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-right dir-rtl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-800">نقش‌های کاربری</span>
                  <span className="text-[10px] text-slate-400">تغییر حساب</span>
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        u.id === currentUser.id
                          ? 'bg-sky-600 text-white font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{u.name}</span>
                        <span className="text-[10px] opacity-80">{u.roleFa}</span>
                      </div>
                      {u.id === currentUser.id && (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {onLogout && (
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onLogout();
                      }}
                      className="w-full p-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>خروج از حساب</span>
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Direct Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold transition-all cursor-pointer"
            title="خروج از حساب کاربری"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">خروج</span>
          </button>
        )}
      </div>
    </header>
  );
};
