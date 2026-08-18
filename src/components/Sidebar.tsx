import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  CalendarDays,
  ListTodo,
  Award,
  AlertTriangle,
  FileCheck2,
  ShoppingCart,
  Building2,
  BarChart3,
  Users,
  UserCheck,
  Settings,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Activity,
  Bot,
  Sparkles,
  User,
  UserCog,
} from 'lucide-react';
import { AppUser, PageId } from '../types';
import { UserProfileDrawer } from './UserProfileDrawer';

interface SidebarProps {
  currentUser?: AppUser;
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  pendingRequestsCount: number;
  criticalAlertsCount: number;
  draftsCount: number;
  onOpenAIChat: () => void;
  onUpdateUser?: (updatedUser: AppUser) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activePage,
  setActivePage,
  collapsed,
  setCollapsed,
  pendingRequestsCount,
  criticalAlertsCount,
  draftsCount,
  onOpenAIChat,
  onUpdateUser = () => {},
}) => {
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  const allowedPages = currentUser?.allowedPages || [
    'dashboard',
    'inventory',
    'asset_structure',
    'calendar',
    'tasks',
    'calibration',
    'failures',
    'purchase_requests',
    'smart_cart',
    'vendors',
    'reports',
    'users',
    'my_workgroup',
    'settings',
  ];

  // Helper to check 3-state permission
  const isPageVisible = (pageId: PageId): boolean => {
    // 'asset_structure' page is strictly for asset_manager role in sidebar
    // Other privileged users (like hospital_admin) manage it inside the 'settings' page tabs
    if (pageId === 'asset_structure') {
      return currentUser?.role === 'asset_manager';
    }
    // 'users' page is strictly for hospital_admin only
    if (pageId === 'users' && currentUser?.role !== 'hospital_admin') {
      return false;
    }
    // Strict permissions for asset_manager (مدیر اموال و موجودی)
    if (currentUser?.role === 'asset_manager') {
      const allowedForAssetManager: PageId[] = [
        'dashboard',
        'inventory',
        'purchase_requests',
        'my_workgroup',
        'asset_structure',
        'reports',
        'calendar',
        'tasks',
      ];
      return allowedForAssetManager.includes(pageId);
    }
    // Strict permissions for procurement_officer (مسئول خرید)
    if (currentUser?.role === 'procurement_officer') {
      const allowedForProcurement: PageId[] = [
        'dashboard',
        'inventory',
        'purchase_requests',
        'smart_cart',
        'vendors',
        'reports',
        'my_workgroup',
        'calendar',
        'tasks',
      ];
      return allowedForProcurement.includes(pageId);
    }
    // Strict permissions for dept_head (رئیس دپارتمان)
    if (currentUser?.role === 'dept_head') {
      const allowedForDeptHead: PageId[] = [
        'dashboard',
        'inventory',
        'purchase_requests',
        'smart_cart',
        'vendors',
        'calibration',
        'failures',
        'reports',
        'my_workgroup',
        'calendar',
        'tasks',
        'settings',
      ];
      return allowedForDeptHead.includes(pageId);
    }
    // Strict permissions for biomedical_engineer (مهندس تجهیزات پزشکی)
    if (currentUser?.role === 'biomedical_engineer') {
      const allowedForBiomedical: PageId[] = [
        'dashboard',
        'inventory',
        'purchase_requests',
        'vendors',
        'calibration',
        'failures',
        'reports',
        'my_workgroup',
        'calendar',
        'tasks',
      ];
      if ((pageId as string) === 'settings' || (pageId as string) === 'smart_cart' || (pageId as string) === 'asset_structure' || (pageId as string) === 'users') {
        return false;
      }
      return allowedForBiomedical.includes(pageId);
    }
    // Strict permissions for nurse_operator (اپراتور / پرستار)
    if (currentUser?.role === 'nurse_operator') {
      const allowedForOperator: PageId[] = [
        'dashboard',
        'calendar',
        'tasks',
        'purchase_requests',
        'my_workgroup',
        'inventory',
        'failures',
        'reports',
      ];
      return allowedForOperator.includes(pageId);
    }
    // 'settings' page is strictly hidden for finance_manager, biomedical_engineer, and users with 'none'
    if (pageId === 'settings' && (currentUser?.role === 'finance_manager' || currentUser?.role === 'biomedical_engineer' || currentUser?.role === 'nurse_operator' || currentUser?.modulePermissions?.['settings'] === 'none')) {
      return false;
    }
    // If modulePermissions has 'none' for this page, hide it
    if (currentUser?.modulePermissions?.[pageId] === 'none') {
      return false;
    }
    // Check allowedPages list
    return allowedPages.includes(pageId);
  };

  const menuGroups: {
    title: string;
    items: {
      id: PageId;
      label: string;
      icon: React.ElementType;
      badge?: number;
      badgeColor?: string;
    }[];
  }[] = [
    {
      title: 'اصلی',
      items: [
        {
          id: 'dashboard',
          label: 'داشبورد مدیریتی',
          icon: LayoutDashboard,
        },
        {
          id: 'my_workgroup',
          label: 'کارگروه من',
          icon: UserCheck,
        },
        {
          id: 'calendar',
          label: 'تقویم ماهانه عملیات',
          icon: CalendarDays,
        },
        {
          id: 'tasks',
          label: 'چک‌لیست و وظایف',
          icon: ListTodo,
        },
      ],
    },
    {
      title: 'اموال و انبار',
      items: [
        {
          id: 'inventory',
          label: 'انبار و تجهیزات',
          icon: Package,
          badge: draftsCount > 0 ? draftsCount : undefined,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        },
        {
          id: 'asset_structure',
          label: 'ساختار اموال',
          icon: FolderTree,
        },
        {
          id: 'purchase_requests',
          label: 'درخواست‌های خرید',
          icon: FileCheck2,
          badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
        },
        {
          id: 'smart_cart',
          label: 'سبد خرید',
          icon: ShoppingCart,
          badge: 4,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        },
        {
          id: 'vendors',
          label: 'تامین‌کنندگان و SLA',
          icon: Building2,
        },
      ],
    },
    {
      title: 'ایمنی',
      items: [
        {
          id: 'calibration',
          label: 'کالیبراسیون و ایمنی',
          icon: Award,
        },
        {
          id: 'failures',
          label: 'گزارش خرابی',
          icon: AlertTriangle,
          badge: criticalAlertsCount > 0 ? criticalAlertsCount : undefined,
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        },
      ],
    },
    {
      title: 'مدیریت و تنظیمات',
      items: [
        {
          id: 'reports',
          label: 'گزارش‌ها و تحلیل‌ها',
          icon: BarChart3,
        },
        {
          id: 'users',
          label: 'کاربران و دسترسی‌ها',
          icon: Users,
        },
        {
          id: 'settings',
          label: 'تنظیمات',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 right-0 h-screen bg-gradient-to-b from-[#2b64f6] to-[#1d52d8] text-white z-30 transition-all duration-300 flex flex-col shadow-xl ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Logo Header */}
      <div className={`h-20 border-b border-white/10 flex items-center shrink-0 ${
        collapsed ? 'flex-col justify-center gap-1 px-1 relative' : 'justify-between px-5'
      }`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-11 h-11 rounded-2xl bg-white text-[#2b64f6] flex items-center justify-center shadow-lg shrink-0 font-black text-lg hover:scale-105 transition-transform cursor-pointer"
            title={collapsed ? 'گسترش منو' : undefined}
          >
            <Activity className="w-6 h-6 text-[#2b64f6]" />
          </button>
          {!collapsed && (
            <div className="flex flex-col text-right">
              <span className="font-extrabold text-white text-lg leading-tight tracking-tight flex items-center gap-1">
                آوید مد<span className="text-sky-200 font-bold text-sm">+</span>
              </span>
              <span className="text-[11px] text-sky-200/90 font-medium dir-ltr text-right">
                Avid MedEquip+
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="جمع کردن منو"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav
        className={`flex-1 overflow-y-auto px-2 py-4 space-y-4 ${
          collapsed ? 'no-scrollbar' : 'sidebar-scrollbar'
        }`}
      >
        {menuGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter((item) => isPageVisible(item.id));
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-4 py-1 text-[10px] font-black tracking-wider text-sky-200/70 uppercase">
                  {group.title}
                </div>
              )}
              {collapsed && groupIdx > 0 && (
                <div className="my-2 mx-2 border-t border-white/10" />
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const label = item.label;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`relative w-full flex items-center rounded-2xl transition-all duration-200 group cursor-pointer ${
                      collapsed
                        ? 'justify-center h-12 w-12 mx-auto p-0'
                        : 'justify-between px-4 py-2.5 rounded-full text-xs sm:text-sm'
                    } ${
                      isActive
                        ? 'text-[#2b64f6] font-extrabold shadow-md'
                        : 'text-white/85 hover:bg-white/10 hover:text-white font-bold'
                    }`}
                    title={collapsed ? label : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBg"
                        className={`absolute inset-0 bg-white shadow-lg z-0 ${
                          collapsed ? 'rounded-2xl' : 'rounded-full -left-2'
                        }`}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}

                    <div className={`relative z-10 flex items-center ${collapsed ? 'justify-center' : 'gap-3 overflow-hidden'}`}>
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          isActive ? 'text-[#2b64f6]' : 'text-white/80 group-hover:text-white'
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate text-right font-extrabold">{label}</span>
                      )}
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`relative z-10 font-black border ${
                          isActive
                            ? 'bg-blue-100 text-[#2b64f6] border-blue-200'
                            : 'bg-white/20 text-white border-white/20'
                        } ${
                          collapsed
                            ? 'absolute -top-1 -right-1 text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs'
                            : 'px-2 py-0.5 text-[10px] rounded-full'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Profile Module at Sidebar Bottom */}
      {currentUser && (
        <div className="p-2.5 border-t border-white/10 shrink-0 bg-white/5">
          <button
            type="button"
            onClick={() => setIsProfileDrawerOpen(true)}
            className={`w-full flex items-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-white cursor-pointer group border border-white/15 shadow-xs ${
              collapsed
                ? 'justify-center h-12 w-12 mx-auto p-0'
                : 'justify-between p-2.5 gap-3'
            }`}
            title="اطلاعات کاربری"
          >
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 overflow-hidden'}`}>
              <div className="w-9 h-9 rounded-xl bg-white text-[#2b64f6] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ring-2 ring-white/30 shadow-xs">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-[#2b64f6]" />
                )}
              </div>
              {!collapsed && (
                <div className="flex flex-col text-right min-w-0">
                  <span className="text-xs font-black text-white truncate group-hover:text-sky-200 transition-colors">
                    {currentUser.name || 'کاربر'}
                  </span>
                  <span className="text-[10px] text-sky-200 truncate font-medium">
                    اطلاعات کاربری
                  </span>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="p-1.5 rounded-xl bg-white/10 group-hover:bg-white/25 text-white transition-colors">
                <UserCog className="w-4 h-4 text-sky-200 group-hover:text-white" />
              </div>
            )}
          </button>
        </div>
      )}

      {/* User Profile Slide-over Drawer */}
      {currentUser && (
        <UserProfileDrawer
          isOpen={isProfileDrawerOpen}
          onClose={() => setIsProfileDrawerOpen(false)}
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
        />
      )}
    </aside>
  );
};
