import { AppUser, EquipmentItem, TaskEvent, UserRole } from '../types';

export interface WorkgroupTaskType {
  id: TaskEvent['type'];
  label: string;
  description: string;
  badgeColor?: string;
}

/**
 * Returns strictly the authorized members of the active user's workgroup.
 * If the user is hospital_admin, all users are returned.
 */
export function getWorkgroupMembers(
  currentUser: AppUser | undefined,
  allUsers: AppUser[] = []
): AppUser[] {
  if (!currentUser) return allUsers;

  // Hospital Admin can manage/assign across all workgroup members
  if (currentUser.role === 'hospital_admin') {
    return allUsers;
  }

  // Property & Inventory Workgroup
  if (
    currentUser.role === 'asset_manager' ||
    currentUser.role === 'warehouse_keeper' ||
    currentUser.role === 'asset_tagging_officer' ||
    currentUser.role === 'inventory_clerk' ||
    currentUser.department?.includes('اموال') ||
    currentUser.department?.includes('انبار')
  ) {
    return allUsers.filter((u) => {
      return (
        u.id === currentUser.id ||
        u.supervisorId === 'usr-8' ||
        u.id === 'usr-8' ||
        u.supervisorId === currentUser.id ||
        u.role === 'asset_manager' ||
        u.role === 'warehouse_keeper' ||
        u.role === 'asset_tagging_officer' ||
        u.role === 'inventory_clerk' ||
        u.department?.includes('اموال') ||
        u.department?.includes('انبار') ||
        u.roleFa?.includes('انباردار') ||
        u.roleFa?.includes('پلاک‌کوبی') ||
        u.roleFa?.includes('کنترل موجودی') ||
        u.roleFa?.includes('مدیر اموال')
      );
    });
  }

  // Finance & Budget Workgroup
  if (
    currentUser.role === 'finance_manager' ||
    currentUser.role === 'finance_expert' ||
    currentUser.role === 'budget_expert' ||
    currentUser.role === 'finance_auditor' ||
    currentUser.department?.includes('مالی') ||
    currentUser.department?.includes('بودجه')
  ) {
    return allUsers.filter((u) => {
      return (
        u.id === currentUser.id ||
        u.supervisorId === 'usr-4' ||
        u.id === 'usr-4' ||
        u.supervisorId === currentUser.id ||
        u.role === 'finance_manager' ||
        u.role === 'finance_expert' ||
        u.role === 'budget_expert' ||
        u.role === 'finance_auditor' ||
        u.department?.includes('مالی') ||
        u.department?.includes('بودجه') ||
        u.roleFa?.includes('مالی') ||
        u.roleFa?.includes('حسابدار') ||
        u.roleFa?.includes('بودجه') ||
        u.roleFa?.includes('حسابرس')
      );
    });
  }

  // Biomedical & Technical Maintenance Workgroup
  if (
    currentUser.role === 'biomedical_engineer' ||
    currentUser.role === 'support_tech' ||
    currentUser.role === 'biomedical_technician' ||
    currentUser.department?.includes('مهندسی پزشکی') ||
    currentUser.department?.includes('فنی') ||
    currentUser.department?.includes('تعمیرگاه')
  ) {
    return allUsers.filter((u) => {
      return (
        u.id === currentUser.id ||
        u.supervisorId === currentUser.id ||
        u.supervisorId === 'usr-2' ||
        u.id === 'usr-2' ||
        u.role === 'biomedical_engineer' ||
        u.role === 'support_tech' ||
        u.role === 'biomedical_technician' ||
        u.department?.includes('مهندسی پزشکی') ||
        u.department?.includes('تعمیرگاه') ||
        u.department?.includes('فنی')
      );
    });
  }

  // Procurement & Purchasing Workgroup
  if (
    currentUser.role === 'procurement_officer' ||
    currentUser.role === 'procurement_expert' ||
    currentUser.role === 'procurement_followup' ||
    currentUser.role === 'procurement_contracts' ||
    currentUser.department?.includes('بازرگانی') ||
    currentUser.department?.includes('خرید')
  ) {
    return allUsers.filter((u) => {
      return (
        u.id === currentUser.id ||
        u.supervisorId === 'usr-3' ||
        u.id === 'usr-3' ||
        u.supervisorId === currentUser.id ||
        u.role === 'procurement_officer' ||
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
    });
  }

  // Clinical & Nursing Workgroup
  if (
    currentUser.role === 'dept_head' ||
    currentUser.role === 'nurse_operator' ||
    currentUser.department?.includes('درمان') ||
    currentUser.department?.includes('پرستاری')
  ) {
    return allUsers.filter((u) => {
      return (
        u.id === currentUser.id ||
        u.role === 'dept_head' ||
        u.role === 'nurse_operator' ||
        u.department?.includes('ICU') ||
        u.department?.includes('اورژانس') ||
        u.department?.includes('جراحی') ||
        u.department?.includes('درمان')
      );
    });
  }

  // Default fallback: users sharing the same supervisor or same department
  const shared = allUsers.filter(
    (u) =>
      u.id === currentUser.id ||
      (currentUser.supervisorId && u.supervisorId === currentUser.supervisorId) ||
      u.supervisorId === currentUser.id ||
      u.department === currentUser.department
  );

  return shared.length > 0 ? shared : [currentUser];
}

/**
 * Returns strictly the task types suitable for the active role/workgroup.
 * E.g., for Asset Manager, calibration/PM are disallowed; only asset tagging, physical inventory audit,
 * stock checking, and asset transfer are allowed.
 */
export function getTaskTypesForRole(role?: UserRole): WorkgroupTaskType[] {
  // Asset Manager & Property Workgroup
  if (
    role === 'asset_manager' ||
    role === 'warehouse_keeper' ||
    role === 'asset_tagging_officer' ||
    role === 'inventory_clerk'
  ) {
    return [
      {
        id: 'draft_completion',
        label: 'تکمیل پیش‌نویس ناقص شناسنامه اقلام انبار',
        description: 'تکمیل فیلدهای باقیمانده، شماره سریال و نهایی‌سازی اقلام پیش‌نویس در انبار',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      },
      {
        id: 'tagging',
        label: 'پلاک‌کوبی، تخصیص کد اموال و صدور بارکد QR فلزی',
        description: 'الصاق پلاک اموال، بارکدگذاری فیزیکی و تطبیق اطلاعات شاسی تجهیزات',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      {
        id: 'inventory_audit',
        label: 'انبارگردانی و شمارش فیزیکی دوره‌ای اموال',
        description: 'تطبیق موجودی عینی انبارها با دفاتر کاردکس و بررسی ساختار درختی اموال',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      },
      {
        id: 'stock_check',
        label: 'کنترل و پایش نقطه سفارش موجودی انبار',
        description: 'پایش کسری موجودی قطعات/کالاهای مصرفی و ترخیص اقلام از قرنطینه',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      },
      {
        id: 'inspection',
        label: 'ممیزی فیزیکی محل استقرار و حسابرسی اسقاط',
        description: 'بررسی فیزیکی موقعیت قرارگیری تجهیزات در بخش‌ها و تعیین وضعیت استهلاک/اسقاط',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      },
    ];
  }

  // Finance & Budget Workgroup
  if (
    role === 'finance_manager' ||
    role === 'finance_expert' ||
    role === 'budget_expert' ||
    role === 'finance_auditor'
  ) {
    return [
      {
        id: 'purchase',
        label: 'رسیدگی مالی و تایید پیش‌فاکتورهای خرید',
        description: 'بررسی پیش‌فاکتورها، تخصیص اعتبار خرید و تایید حواله‌های پرداخت تامین‌کنندگان',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      },
      {
        id: 'inspection',
        label: 'ممیزی بودجه، کسورات قانونی و ضمانت‌نامه‌ها',
        description: 'تطبیق فاکتورهای رسمی با سامانه مودیان، استعلام ضمانت‌نامه‌ها و کنترل قراردادها',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      {
        id: 'stock_check',
        label: 'ارزیابی ارزش ریالی انبار و استهلاک دارایی‌ها',
        description: 'محاسبه استهلاک ماهانه تجهیزات سرمایه‌ای و ارزش‌گذاری موجودی انبار',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      },
    ];
  }

  // Biomedical Engineer & Tech Support Workgroup
  if (role === 'biomedical_engineer' || role === 'support_tech') {
    return [
      {
        id: 'calibration',
        label: 'کالیبراسیون دوره‌ای و آزمون دقت اندازه‌گیری',
        description: 'آزمون‌های استاندارد صحت عملکرد، صدور گواهی و کالیبراسیون دوره‌ای دستگاه‌ها',
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      },
      {
        id: 'maintenance',
        label: 'سرویس پیشگیرانه (PM) و تعمیرات تخصصی',
        description: 'تعویض قطعات مصرفی، رفع عیب اضطراری و اجرای برنامه‌های نگهداری پیشگیرانه',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      },
      {
        id: 'inspection',
        label: 'آزمون ایمنی الکتریکی و کنترل کیفی',
        description: 'تست جریان نشتی بر اساس استاندارد IEC 62353 و بازرسی ایمنی بیمار',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      },
      {
        id: 'expiry',
        label: 'سررسید انقضای گواهی کالیبراسیون و پروانه',
        description: 'پیگیری تمدید گواهی‌نامه‌های رو به اتمام آزمایشگاه‌های مرجع',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      },
    ];
  }

  // Procurement Workgroup
  if (
    role === 'procurement_officer' ||
    role === 'procurement_expert' ||
    role === 'procurement_followup' ||
    role === 'procurement_contracts'
  ) {
    return [
      {
        id: 'purchase',
        label: 'استعلام قیمت و سبد خرید هوشمند',
        description: 'استعلام قیمت از فروشندگان معتبر، مقایسه پیشنهادها و صدور سفارش خرید رسمی',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      },
      {
        id: 'inspection',
        label: 'پیگیری سفارشات، تامین‌کنندگان و پایش SLA',
        description: 'کنترل زمان‌بندی تحویل بار، تضامین تامین‌کننده و انطباق با پیش‌فاکتور',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      },
    ];
  }

  // Clinical & Operator Roles
  if (role === 'dept_head' || role === 'nurse_operator') {
    return [
      {
        id: 'inspection',
        label: 'چک‌لیست روزانه تحویل شیفت و تست ترالی کد',
        description: 'بررسی آمادگی عملکردی الکتروشوک، ساکشن و مانیتورینگ علائم حیاتی بخش',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      },
      {
        id: 'asset_transfer',
        label: 'درخواست جابجایی و تحویل تجهیزات بین بخش‌ها',
        description: 'ثبت درخواست انتقال موقت یا دائم دستگاه به سایر بخش‌های درمانی',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      },
    ];
  }

  // Hospital Admin (Supervisory All)
  return [
    {
      id: 'tagging',
      label: 'پلاک‌کوبی و بارکدگذاری اموال',
      description: 'نظارت بر صدور کد دائم و الصاق پلاک QR فلزی',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'inventory_audit',
      label: 'انبارگردانی و ممیزی دارایی‌ها',
      description: 'حسابرسی جامع موجودی انبارها و ساختار درختی اموال',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'stock_check',
      label: 'کنترل موجودی و ورود و خروج',
      description: 'نظارت بر کاردکس انبار مرکزی و پایش کسری موجودی اقلام',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'asset_transfer',
      label: 'تحویل، تحول و انتقال اموال',
      description: 'نظارت بر صورت‌جلسات جابجایی تجهیزات بین بخش‌ها',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: 'purchase',
      label: 'تاییدات خرید و بودجه',
      description: 'بررسی و تایید درخواست‌های خرید و تخصیص بودجه',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'calibration',
      label: 'کالیبراسیون و آزمون‌های دوره‌ای',
      description: 'پایش گواهی‌های کالیبراسیون و استاندارد تجهیزات',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      id: 'inspection',
      label: 'ممیزی اعتباربخشی و بازرسی',
      description: 'چک‌لیست‌های ارزیابی عملکرد و سنجه‌های ایمنی بیمار',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  ];
}

/**
 * Returns dynamic notifications derived strictly from real Tasks and Events!
 */
export interface TaskNotificationItem {
  id: string;
  taskId: string;
  title: string;
  desc: string;
  time: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  priority: 'high' | 'medium' | 'low';
  sourceType?: 'draft' | 'task' | 'event';
  targetEquipmentId?: string;
  task?: TaskEvent;
  taskData?: TaskEvent;
  isDraftTagging?: boolean;
  draftId?: string;
}

export function getNotificationsFromTasksAndEvents(
  currentUser: AppUser | undefined,
  tasksList: TaskEvent[] = [],
  equipmentList: EquipmentItem[] = []
): TaskNotificationItem[] {
  if (!currentUser) return [];

  const userName = currentUser.name.trim();
  const userRole = currentUser.role;

  // Filter tasks relevant to this user / workgroup
  const relevantTasks = tasksList.filter((task) => {
    // If assigned to user directly
    if (task.assignedTo.includes(userName) || userName.includes(task.assignedTo)) {
      return true;
    }

    // Role match
    if (userRole === 'hospital_admin') return true;

    if (
      userRole === 'asset_manager' ||
      userRole === 'warehouse_keeper' ||
      userRole === 'asset_tagging_officer' ||
      userRole === 'inventory_clerk'
    ) {
      return (
        task.assignedTo.includes('کامران حسینی') ||
        task.assignedTo.includes('رضا محمودی') ||
        task.assignedTo.includes('علی رستمی') ||
        task.assignedTo.includes('سمیرا شمس') ||
        task.type === 'tagging' ||
        task.type === 'inventory_audit' ||
        task.type === 'stock_check' ||
        task.type === 'asset_transfer'
      );
    }

    if (
      userRole === 'finance_manager' ||
      userRole === 'finance_expert' ||
      userRole === 'budget_expert' ||
      userRole === 'finance_auditor'
    ) {
      return (
        task.assignedTo.includes('علیرضا صادقی') ||
        task.assignedTo.includes('فاطمه محمدی') ||
        task.assignedTo.includes('امیرحسین کاظمی') ||
        task.assignedTo.includes('مینا حسینی') ||
        task.role.includes('مالی') ||
        task.role.includes('حسابدار') ||
        task.role.includes('بودجه')
      );
    }

    if (userRole === 'biomedical_engineer' || userRole === 'support_tech') {
      return (
        task.assignedTo.includes('امین رضایی') ||
        task.assignedTo.includes('حامد باقری') ||
        task.type === 'calibration' ||
        task.type === 'maintenance' ||
        task.type === 'expiry'
      );
    }

    if (userRole === 'procurement_officer') {
      return task.assignedTo.includes('سارا ابراهیمی') || task.type === 'purchase';
    }

    return task.role.includes(currentUser.roleFa);
  });

  // Sort: open/in_progress first, then high priority, then by dueDate
  const sortedTasks = [...relevantTasks].sort((a, b) => {
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const notifs: TaskNotificationItem[] = [];

  // 1. Add draft equipment items that require completion for Asset Manager / Hospital Admin
  if (userRole === 'asset_manager' || userRole === 'warehouse_keeper' || userRole === 'hospital_admin') {
    const draftItems = equipmentList.filter((e) => e.isDraft || e.status === 'draft');
    if (draftItems.length > 0) {
      const firstDraft = draftItems[0];
      const draftTask: TaskEvent = {
        id: `task-draft-${firstDraft.id}`,
        title: `تکمیل پیش‌نویس ناقص شناسنامه تجهیزات انبار (${firstDraft.code})`,
        type: 'draft_completion',
        priority: 'high',
        assignedTo: currentUser.name,
        role: currentUser.roleFa,
        dueDate: '1405/05/25',
        status: 'open',
        autoGenerated: true,
        equipmentCode: firstDraft.code,
        equipmentName: firstDraft.faName,
        notes: `تکمیل فیلدهای ناقص و نهایی‌سازی پیش‌نویس «${firstDraft.faName}» در کارتابل پیش‌نویس‌های انبار`,
      };

      notifs.push({
        id: `notif-draft-completion-${firstDraft.id}`,
        taskId: `draft-${firstDraft.id}`,
        sourceType: 'draft',
        targetEquipmentId: firstDraft.id,
        title: `تکمیل پیش‌نویس ناقص ${draftItems.length} قلم کالا در انبار`,
        desc: `قلم پیش‌نویس «${firstDraft.faName}» (${firstDraft.category}) نیازمند تکمیل اطلاعات و نهایی‌سازی است.`,
        time: 'مهلت اقدام: فوری',
        type: 'warning',
        priority: 'high',
        isDraftTagging: false,
        draftId: firstDraft.id,
        task: draftTask,
        taskData: draftTask,
      });
    }
  }

  // 2. Add real tasks as notifications (excluding asset_transfer until transfer module exists)
  for (const task of sortedTasks) {
    if (task.type === 'asset_transfer') continue; // Hide transfer notifications since asset transfer section is not active

    let notifType: 'warning' | 'info' | 'success' | 'danger' = 'info';
    if (task.status === 'completed') {
      notifType = 'success';
    } else if (task.priority === 'high') {
      notifType = 'warning';
    }

    const priorityLabel = task.priority === 'high' ? 'فوری' : task.priority === 'medium' ? 'متوسط' : 'عادی';
    const statusLabel = task.status === 'completed' ? 'تکمیل شده' : task.status === 'in_progress' ? 'در جریان' : 'در انتظار اقدام';

    notifs.push({
      id: `notif-task-${task.id}`,
      taskId: task.id,
      sourceType: 'task',
      task: task,
      taskData: task,
      title: task.title,
      desc: task.notes || `مسئول اجرا: ${task.assignedTo} | وضعیت: ${statusLabel}`,
      time: `سررسید: ${task.dueDate} (${priorityLabel})`,
      type: notifType,
      priority: task.priority,
    });
  }

  return notifs;
}
