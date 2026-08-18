import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Plus,
  Sparkles,
  UserCheck,
  Shield,
  Layers,
  Award,
  AlertTriangle,
  FileCheck2,
  Package,
  Wrench,
  X,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Boxes,
  Archive,
  QrCode,
  ClipboardList,
  Users,
  Check,
  AlertCircle,
  Info,
  Search,
  Activity,
  SlidersHorizontal,
  Eye,
  ExternalLink,
  Zap,
  CheckSquare,
  CalendarDays,
  ListFilter,
  Cpu,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import {
  AppUser,
  TaskEvent,
  PageId,
  EquipmentItem,
  CalibrationRecord,
  FailureReport,
  PurchaseRequest,
} from '../../types';
import {
  getWorkgroupMembers,
  getTaskTypesForRole,
} from '../../utils/workgroupHelpers';

export interface EquipmentCalendarEvent {
  id: string;
  equipmentId?: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentNameEn?: string;
  model?: string;
  brand?: string;
  department: string;
  location?: string;
  eventType: 'calibration' | 'maintenance' | 'pm_service' | 'purchase' | 'safety_test' | 'inspection';
  title: string;
  date: string; // e.g. "1405/05/20"
  dayNumber: number; // 1 to 31
  status: 'pending' | 'in_progress' | 'completed' | 'urgent' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  role?: string;
  technicianOrAgency?: string;
  description?: string;
  actionRequired: string;
  targetPage: PageId;
  safetyScore?: number;
  serialNumber?: string;
}

interface CalendarViewProps {
  currentUser?: AppUser;
  allUsers?: AppUser[];
  eventsList: TaskEvent[];
  equipmentList?: EquipmentItem[];
  calibrationsList?: CalibrationRecord[];
  failuresList?: FailureReport[];
  purchaseRequests?: PurchaseRequest[];
  onAddEvent: (event: TaskEvent) => void;
  onToggleEventStatus: (eventId: string) => boolean | void;
  setActivePage: (page: PageId) => void;
  onSelectEquipment?: (equipment: EquipmentItem) => void;
  onSelectEquipmentForCalibration?: (equipmentCode: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentUser,
  allUsers = [],
  eventsList,
  equipmentList = [],
  calibrationsList = [],
  failuresList = [],
  purchaseRequests = [],
  onAddEvent,
  onToggleEventStatus,
  setActivePage,
  onSelectEquipment,
  onSelectEquipmentForCalibration,
}) => {
  const isBiomedicalEngineer = currentUser?.role === 'biomedical_engineer';
  const isFinanceManager = currentUser?.role === 'finance_manager';
  const isAssetManager = currentUser?.role === 'asset_manager';
  const isProcurementOfficer = currentUser?.role === 'procurement_officer';

  // Sub-calendar Tabs: Equipment Calendar vs Personal Calendar vs Workgroup Calendar
  const [activeCalendarTab, setActiveCalendarTab] = useState<'equipment' | 'personal' | 'workgroup'>(
    isBiomedicalEngineer ? 'equipment' : 'personal'
  );

  // View Modes: Month Grid vs Week Schedule vs Day Agenda
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(20); // Default to today (20 Mordad)
  const [dayModalDate, setDayModalDate] = useState<number | null>(null); // Modal to view events of selected day

  // Filters
  const [filterRoleScope, setFilterRoleScope] = useState<'role_only' | 'all_hospital'>('role_only');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Subordinate filters for role workgroups
  const [selectedBiomedMemberFilter, setSelectedBiomedMemberFilter] = useState<string>('all');
  const [selectedFinanceMemberFilter, setSelectedFinanceMemberFilter] = useState<string>('all');
  const [selectedAssetMemberFilter, setSelectedAssetMemberFilter] = useState<string>('all');
  const [selectedProcurementMemberFilter, setSelectedProcurementMemberFilter] = useState<string>('all');

  const [currentYear] = useState<number>(1405);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(4); // 0-indexed: 4 = Mordad (مرداد)

  const roleDescriptions: Record<string, string> = {
    biomedical_engineer: 'برنامه جامع دوره‌ای کالیبراسیون، سرویس‌های پیشگیرانه PM، تعمیرات و آزمون‌های ایمنی تجهیزات',
    finance_manager: 'تقویم مالی، سررسید فاکتورها، مغایرت‌گیری و برنامه‌ریزی پرداخت‌ها',
    asset_manager: 'برنامه دوره‌ای انبارگردانی، پلاک‌کوبی، تطبیق دارایی‌ها و بازرسی اموال',
    procurement_officer: 'زمان‌بندی استعلام‌ها، تحویل سفارش‌ها، کنترل قراردادها و بازرگانی',
  };

  const currentRoleDesc =
    (currentUser?.role && roleDescriptions[currentUser.role]) ||
    'برنامه‌ریزی، زمان‌بندی و پیگیری وظایف و رویدادهای سازمانی';
  const [selectedTaskEvent, setSelectedTaskEvent] = useState<TaskEvent | null>(null);
  const [selectedEquipmentEvent, setSelectedEquipmentEvent] = useState<EquipmentCalendarEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDayForAdd, setSelectedDayForAdd] = useState<number | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Workgroup helpers
  const workgroupMembers = getWorkgroupMembers(currentUser, allUsers);
  const allowedTaskTypes = getTaskTypesForRole(currentUser?.role);

  // Add Task Modal State
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(
    currentUser ? [currentUser.id] : []
  );
  const [selectedTaskType, setSelectedTaskType] = useState<string>(
    allowedTaskTypes[0]?.id || 'calibration'
  );
  const [assigneeError, setAssigneeError] = useState<string | null>(null);

  const monthNames = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];

  const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

  // 1. Generate comprehensive Equipment Lifecycle Events
  const equipmentEvents: EquipmentCalendarEvent[] = useMemo(() => {
    const events: EquipmentCalendarEvent[] = [];

    // Helper to find matching equipment item
    const getEq = (code?: string) => equipmentList.find((e) => e.code === code || e.name === code);

    // A. Equipment calibration due & inspection events
    equipmentList.forEach((eq, idx) => {
      // Map pseudo-realistic day numbers in Mordad (1405/05)
      const dayForCalib = ((idx * 3 + 4) % 28) + 1;
      const dayForPM = ((idx * 4 + 7) % 28) + 1;
      const dayForSafety = ((idx * 2 + 11) % 28) + 1;

      // Calibration event
      events.push({
        id: `eq-calib-${eq.id || idx}`,
        equipmentId: eq.id,
        equipmentCode: eq.code,
        equipmentName: eq.name,
        equipmentNameEn: eq.nameEn || eq.name,
        model: eq.model,
        brand: eq.brand,
        department: eq.department,
        location: eq.location || eq.department,
        eventType: 'calibration',
        title: `کالیبراسیون و انطباق استاندارد: ${eq.name}`,
        date: `1405/05/${String(dayForCalib).padStart(2, '0')}`,
        dayNumber: dayForCalib,
        status: eq.calibrationStatus === 'expired' ? 'overdue' : eq.calibrationStatus === 'expiring_soon' ? 'urgent' : 'pending',
        priority: eq.calibrationStatus === 'expired' ? 'critical' : eq.riskLevel === 'high' ? 'high' : 'medium',
        assignedTo: 'مهندس نگار احمدی',
        role: 'کارشناس کالیبراسیون',
        technicianOrAgency: eq.vendor || 'آزمایشگاه مرجع کالیبراسیون مهندسی پزشکی',
        description: `انجام آزمون‌های کنترل کیفی سالانه، آزمون کالیبراسیون خروجی و صدور سرتیفیکیت معتبر برای ${eq.name} مستقر در ${eq.department}`,
        actionRequired: 'انجام آزمون مرجع کالیبراسیون و بارگذاری گواهی تایید صلاحیت',
        targetPage: 'calibration',
        safetyScore: eq.safetyScore || 95,
        serialNumber: eq.serialNumber || `SN-${eq.code}-2024`,
      });

      // Preventive Maintenance (PM) event
      events.push({
        id: `eq-pm-${eq.id || idx}`,
        equipmentId: eq.id,
        equipmentCode: eq.code,
        equipmentName: eq.name,
        equipmentNameEn: eq.nameEn || eq.name,
        model: eq.model,
        brand: eq.brand,
        department: eq.department,
        location: eq.location || eq.department,
        eventType: 'pm_service',
        title: `سرویس پیشگیرانه PM دوره‌ای: ${eq.name}`,
        date: `1405/05/${String(dayForPM).padStart(2, '0')}`,
        dayNumber: dayForPM,
        status: 'pending',
        priority: eq.riskLevel === 'high' ? 'high' : 'medium',
        assignedTo: 'مهندس رضا صابری',
        role: 'کارشناس نگهداری پیشگیرانه PM',
        technicianOrAgency: 'تیم فنی مهندسی پزشکی بیمارستان',
        description: `آچارکشی، تعویض فیلترهای هپا/میکرونی، بررسی نشتی مسیرهای فشار، روان‌کاری قطعات مکانیکی و تست سنسورها`,
        actionRequired: 'تکمیل چک‌لیست سرویس PM و ثبت تاییدیه کارکرد در سامانه',
        targetPage: 'inventory',
        safetyScore: eq.safetyScore || 92,
        serialNumber: eq.serialNumber || `SN-${eq.code}-2024`,
      });

      // Electrical safety test (IEC 62353)
      if (eq.riskLevel === 'high' || eq.category?.includes('حیاتی') || idx % 2 === 0) {
        events.push({
          id: `eq-safety-${eq.id || idx}`,
          equipmentId: eq.id,
          equipmentCode: eq.code,
          equipmentName: eq.name,
          equipmentNameEn: eq.nameEn || eq.name,
          model: eq.model,
          brand: eq.brand,
          department: eq.department,
          location: eq.location || eq.department,
          eventType: 'safety_test',
          title: `آزمون ایمنی الکتریکی IEC 62353: ${eq.name}`,
          date: `1405/05/${String(dayForSafety).padStart(2, '0')}`,
          dayNumber: dayForSafety,
          status: 'pending',
          priority: 'high',
          assignedTo: 'مهندس امین رضایی',
          role: 'مهندس تجهیزات پزشکی',
          technicianOrAgency: 'آزمایشگاه ایمنی و بیومدیکال',
          description: `سنجش جریان نشتی محفظه، تست مقاومت ارت حفاظتی (PE) و مقاومت عایقی بر اساس استاندارد IEC 62353`,
          actionRequired: 'تست با آنالایزر ایمنی الکتریکی و ثبت برچسب سبز ایمنی',
          targetPage: 'inventory',
          safetyScore: eq.safetyScore || 98,
          serialNumber: eq.serialNumber || `SN-${eq.code}-2024`,
        });
      }
    });

    // B. Failures & Repair records
    failuresList.forEach((fail, fIdx) => {
      const eq = getEq(fail.equipmentCode);
      const dayForFail = 15 + ((fIdx * 5) % 14);

      events.push({
        id: `eq-fail-${fail.id || fIdx}`,
        equipmentId: eq?.id,
        equipmentCode: fail.equipmentCode,
        equipmentName: fail.equipmentName,
        equipmentNameEn: eq?.nameEn,
        model: eq?.model,
        brand: eq?.brand,
        department: fail.department,
        location: eq?.location || fail.department,
        eventType: 'maintenance',
        title: `رفع خرابی و تعمیر تخصصی: ${fail.equipmentName}`,
        date: `1405/05/${String(dayForFail).padStart(2, '0')}`,
        dayNumber: dayForFail,
        status: fail.status === 'resolved' ? 'completed' : fail.status === 'in_progress' ? 'in_progress' : 'urgent',
        priority: fail.severity === 'critical' ? 'critical' : fail.severity === 'high' ? 'high' : 'medium',
        assignedTo: fail.assignedTechnician || 'مهندس حامد باقری',
        role: 'پشتیبانی و خدمات فنی',
        technicianOrAgency: fail.assignedTechnician || 'تکنسین فنی مهندسی پزشکی',
        description: `شرح اشکال: ${fail.description || 'اشکال در عملکرد سنسور یا برد تغذیه دستگاه'} - اقدام: ${fail.actionsTaken || 'بررسی فنی و تست جایگزینی پارت'}`,
        actionRequired: 'مراجعه حضوری به بخش، عیب‌یابی برد، تست نهایی و ثبت صورت‌جلسه تحویل',
        targetPage: 'failures',
        safetyScore: eq?.safetyScore || 85,
        serialNumber: eq?.serialNumber || `SN-${fail.equipmentCode}`,
      });
    });

    // C. Purchase & Ingestion events
    purchaseRequests.slice(0, 5).forEach((req, rIdx) => {
      const dayForReq = 5 + (rIdx * 4);
      events.push({
        id: `eq-req-${req.id || rIdx}`,
        equipmentCode: req.equipmentCode || `REQ-${1000 + rIdx}`,
        equipmentName: req.equipmentName || req.title,
        department: req.department,
        eventType: 'purchase',
        title: `تحویل و ورود به انبار: ${req.equipmentName || req.title}`,
        date: `1405/05/${String(dayForReq).padStart(2, '0')}`,
        dayNumber: dayForReq,
        status: req.status === 'approved' ? 'completed' : 'pending',
        priority: req.priority === 'urgent' ? 'critical' : req.priority === 'high' ? 'high' : 'medium',
        assignedTo: req.requesterName || 'مهندس سارا ابراهیمی',
        role: 'مسئول خرید و تامین',
        technicianOrAgency: req.vendorName || 'تامین‌کننده تاییدشده IRC',
        description: `بررسی تطبیق فنی شناسنامه کالا، اصالت سریال IRC، تحویل فیزیکی و آماده‌سازی پلاک‌کوبی`,
        actionRequired: 'بازرسی فنی اولیه، دریافت مدارک گارانتی و ارسال به مهندسی پزشکی جهت آزمون پذیرش اولیه',
        targetPage: 'purchase_requests',
        safetyScore: 100,
      });
    });

    return events;
  }, [equipmentList, calibrationsList, failuresList, purchaseRequests]);

  // Unique departments for filter dropdown
  const departmentsList = useMemo(() => {
    const depts = new Set<string>();
    equipmentList.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    failuresList.forEach((f) => {
      if (f.department) depts.add(f.department);
    });
    return Array.from(depts);
  }, [equipmentList, failuresList]);

  // 2. Filter Equipment Events based on search, department, eventType, priority
  const filteredEquipmentEvents = useMemo(() => {
    return equipmentEvents.filter((ev) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = ev.equipmentName.toLowerCase().includes(q);
        const matchCode = ev.equipmentCode.toLowerCase().includes(q);
        const matchBrand = ev.brand?.toLowerCase().includes(q);
        const matchModel = ev.model?.toLowerCase().includes(q);
        const matchTitle = ev.title.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchBrand && !matchModel && !matchTitle) {
          return false;
        }
      }

      // Department filter
      if (filterDepartment !== 'all' && ev.department !== filterDepartment) {
        return false;
      }

      // Event Type filter
      if (filterType !== 'all') {
        if (filterType === 'calibration' && ev.eventType !== 'calibration') return false;
        if (filterType === 'maintenance' && ev.eventType !== 'maintenance') return false;
        if (filterType === 'pm_service' && ev.eventType !== 'pm_service') return false;
        if (filterType === 'purchase' && ev.eventType !== 'purchase') return false;
        if (filterType === 'safety_test' && ev.eventType !== 'safety_test') return false;
      }

      // Priority filter
      if (filterPriority !== 'all') {
        if (filterPriority === 'critical' && ev.priority !== 'critical') return false;
        if (filterPriority === 'high' && ev.priority !== 'high') return false;
        if (filterPriority === 'normal' && ev.priority !== 'medium' && ev.priority !== 'low') return false;
      }

      return true;
    });
  }, [equipmentEvents, searchQuery, filterDepartment, filterType, filterPriority]);

  // Group equipment events by day
  const equipmentEventsByDay = useMemo(() => {
    const map: Record<number, EquipmentCalendarEvent[]> = {};
    filteredEquipmentEvents.forEach((ev) => {
      if (!map[ev.dayNumber]) map[ev.dayNumber] = [];
      map[ev.dayNumber].push(ev);
    });
    return map;
  }, [filteredEquipmentEvents]);

  // 3. Filter Task Events (Personal / Workgroup)
  const filteredTaskEvents = useMemo(() => {
    return eventsList.filter((event) => {
      if (currentUser) {
        const userName = currentUser.name.trim();
        const userRoleFa = currentUser.roleFa.trim();

        if (isBiomedicalEngineer) {
          const isPersonal = event.assignedTo.includes(userName) || userName.includes(event.assignedTo) || event.role.includes('مهندس تجهیزات');
          const isWorkgroupMember =
            event.assignedTo.includes('نگار احمدی') ||
            event.assignedTo.includes('رضا صابری') ||
            event.assignedTo.includes('حامد باقری') ||
            event.role.includes('کالیبراسیون') ||
            event.role.includes('تعمیرات') ||
            event.role.includes('پشتیبانی فنی') ||
            event.role.includes('مهندسی پزشکی');

          if (activeCalendarTab === 'personal' && !isPersonal) {
            return false;
          }

          if (activeCalendarTab === 'workgroup') {
            if (!isPersonal && !isWorkgroupMember) return false;
            if (selectedBiomedMemberFilter === 'me' && !isPersonal) return false;
            if (selectedBiomedMemberFilter === 'negar' && !event.assignedTo.includes('نگار احمدی')) return false;
            if (selectedBiomedMemberFilter === 'reza' && !event.assignedTo.includes('رضا صابری')) return false;
            if (selectedBiomedMemberFilter === 'hamed' && !event.assignedTo.includes('حامد باقری')) return false;
          }
        } else if (isFinanceManager) {
          const isPersonal = event.assignedTo.includes(userName) || userName.includes(event.assignedTo) || event.role.includes(userRoleFa);
          const isWorkgroupMember =
            event.assignedTo.includes('فاطمه محمدی') ||
            event.assignedTo.includes('امیرحسین کاظمی') ||
            event.assignedTo.includes('مینا حسینی') ||
            event.role.includes('مالی') ||
            event.role.includes('حسابدار') ||
            event.role.includes('بودجه') ||
            event.role.includes('حسابرس');

          if (!isPersonal && !isWorkgroupMember) return false;
          if (selectedFinanceMemberFilter === 'me' && !isPersonal) return false;
          if (selectedFinanceMemberFilter === 'fatemeh' && !event.assignedTo.includes('فاطمه محمدی')) return false;
          if (selectedFinanceMemberFilter === 'amir' && !event.assignedTo.includes('امیرحسین کاظمی')) return false;
          if (selectedFinanceMemberFilter === 'mina' && !event.assignedTo.includes('مینا حسینی')) return false;
        } else if (isAssetManager) {
          const isPersonal = event.assignedTo.includes(userName) || userName.includes(event.assignedTo) || event.role.includes('مدیر اموال');
          const isWorkgroupMember =
            event.assignedTo.includes('رضا محمودی') ||
            event.assignedTo.includes('علی رستمی') ||
            event.assignedTo.includes('سمیرا شمس') ||
            event.role.includes('انبار') ||
            event.role.includes('پلاک‌کوبی') ||
            event.role.includes('کنترل موجودی') ||
            event.role.includes('اموال');

          if (!isPersonal && !isWorkgroupMember) return false;
          if (selectedAssetMemberFilter === 'me' && !isPersonal) return false;
          if (selectedAssetMemberFilter === 'reza' && !event.assignedTo.includes('رضا محمودی')) return false;
          if (selectedAssetMemberFilter === 'rostami' && !event.assignedTo.includes('علی رستمی')) return false;
          if (selectedAssetMemberFilter === 'shams' && !event.assignedTo.includes('سمیرا شمس')) return false;
        } else if (isProcurementOfficer) {
          const isPersonal = event.assignedTo.includes(userName) || userName.includes(event.assignedTo) || event.role.includes('مسئول خرید') || event.role.includes('بازرگانی');
          const isWorkgroupMember =
            event.assignedTo.includes('پویا شایان') ||
            event.assignedTo.includes('مهسا نوری') ||
            event.assignedTo.includes('احسان فلاح') ||
            event.role.includes('استعلام') ||
            event.role.includes('تامین') ||
            event.role.includes('قرارداد') ||
            event.role.includes('بازرگانی') ||
            event.type === 'purchase';

          if (!isPersonal && !isWorkgroupMember) return false;
          if (selectedProcurementMemberFilter === 'me' && !isPersonal) return false;
          if (selectedProcurementMemberFilter === 'pouya' && !event.assignedTo.includes('پویا شایان')) return false;
          if (selectedProcurementMemberFilter === 'mahsa' && !event.assignedTo.includes('مهسا نوری')) return false;
          if (selectedProcurementMemberFilter === 'ehsan' && !event.assignedTo.includes('احسان فلاح')) return false;
        } else {
          if (filterRoleScope === 'role_only') {
            const matchRole = event.role.includes(userRoleFa) || userRoleFa.includes(event.role);
            const matchName = event.assignedTo.includes(userName) || userName.includes(event.assignedTo);
            if (!matchRole && !matchName) return false;
          }
        }
      }

      if (filterType !== 'all' && event.type !== filterType) {
        return false;
      }

      return true;
    });
  }, [
    eventsList,
    currentUser,
    isBiomedicalEngineer,
    isFinanceManager,
    isAssetManager,
    isProcurementOfficer,
    activeCalendarTab,
    selectedBiomedMemberFilter,
    selectedFinanceMemberFilter,
    selectedAssetMemberFilter,
    selectedProcurementMemberFilter,
    filterRoleScope,
    filterType,
  ]);

  // Group task events by day
  const taskEventsByDay = useMemo(() => {
    const map: Record<number, TaskEvent[]> = {};
    filteredTaskEvents.forEach((ev) => {
      const parts = ev.dueDate.split('/');
      let dayNum = 15;
      if (parts.length === 3) {
        dayNum = parseInt(parts[2], 10);
      }
      if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) dayNum = 15;
      if (!map[dayNum]) map[dayNum] = [];
      map[dayNum].push(ev);
    });
    return map;
  }, [filteredTaskEvents]);

  // Month grid info for Mordad (31 days, starts on day index 0 = Saturday)
  const totalDaysInMonth = currentMonthIndex <= 5 ? 31 : currentMonthIndex <= 10 ? 30 : 29;
  const startDayOfWeekIndex = 0; // Starts on Saturday for demo

  // Type badge styling helper for Equipment events
  const getEquipmentEventBadge = (type: EquipmentCalendarEvent['eventType']) => {
    switch (type) {
      case 'calibration':
        return {
          label: 'کالیبراسیون و استاندارد',
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
          icon: Award,
        };
      case 'maintenance':
        return {
          label: 'تعمیرات و رفع اشکال',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: Wrench,
        };
      case 'pm_service':
        return {
          label: 'سرویس پیشگیرانه PM',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
          icon: Cpu,
        };
      case 'safety_test':
        return {
          label: 'آزمون ایمنی الکتریکی',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: Zap,
        };
      case 'purchase':
        return {
          label: 'خرید و تحویل تجهیزات',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: Package,
        };
      default:
        return {
          label: 'کنترل و بازرسی فنی',
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          icon: FileCheck2,
        };
    }
  };

  const getTaskTypeBadge = (type: string) => {
    switch (type) {
      case 'calibration':
        return { label: 'کالیبراسیون', bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: Award };
      case 'maintenance':
        return { label: 'تعمیرات', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Wrench };
      case 'inspection':
        return { label: 'بازرسی', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: FileCheck2 };
      case 'purchase':
        return { label: 'خرید', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Package };
      case 'inventory_audit':
        return { label: 'انبارگردانی', bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: Boxes };
      case 'tagging':
        return { label: 'پلاک‌کوبی', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: QrCode };
      default:
        return { label: 'عملیاتی', bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: FileCheck2 };
    }
  };

  // Quick navigation handler from equipment modal
  const handleNavigateFromEquipmentEvent = (ev: EquipmentCalendarEvent) => {
    setSelectedEquipmentEvent(null);
    if (ev.targetPage === 'calibration') {
      if (onSelectEquipmentForCalibration) {
        onSelectEquipmentForCalibration(ev.equipmentCode);
      }
      setActivePage('calibration');
    } else if (ev.targetPage === 'inventory') {
      const matchEq = equipmentList.find((e) => e.code === ev.equipmentCode || e.id === ev.equipmentId);
      if (matchEq && onSelectEquipment) {
        onSelectEquipment(matchEq);
      }
      setActivePage('inventory');
    } else if (ev.targetPage === 'failures') {
      setActivePage('failures');
    } else if (ev.targetPage === 'purchase_requests') {
      setActivePage('purchase_requests');
    } else {
      setActivePage(ev.targetPage);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header & Sub-Calendar Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>تقویم و برنامه زمان‌بندی عملیات بیمارستان</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBiomedicalEngineer
                  ? 'برنامه جامع دوره‌ای کالیبراسیون، سرویس‌های پیشگیرانه PM، تعمیرات و آزمون‌های ایمنی تجهیزات'
                  : currentRoleDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Calendar View Badge & Action */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="flex items-center bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200/80 text-xs font-bold text-sky-800 gap-1.5 shadow-2xs">
            <CalendarDays className="w-4 h-4 text-sky-600" />
            <span>نمای تقویم: ماهانه</span>
          </div>

          <button
            onClick={() => {
              setSelectedDayForAdd(selectedDayNumber);
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت رویداد جدید</span>
          </button>
        </div>
      </div>

      {/* Primary Role Sub-Tabs (Equipment Calendar vs Personal Calendar vs Workgroup Calendar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-sky-50 via-indigo-50/40 to-blue-50 border border-sky-200/80 p-3 rounded-2xl shadow-2xs">
        {/* Sub Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {isBiomedicalEngineer && (
            <button
              onClick={() => setActiveCalendarTab('equipment')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCalendarTab === 'equipment'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-sky-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>تقویم تجهیزات و دستگاه‌ها</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeCalendarTab === 'equipment' ? 'bg-sky-700 text-white' : 'bg-sky-100 text-sky-800'
              }`}>
                {filteredEquipmentEvents.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveCalendarTab('personal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCalendarTab === 'personal'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-700 hover:bg-white border border-sky-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>تقویم شخصی من</span>
          </button>

          {(isBiomedicalEngineer || isFinanceManager || isAssetManager || isProcurementOfficer) && (
            <button
              onClick={() => setActiveCalendarTab('workgroup')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCalendarTab === 'workgroup'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-sky-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {isBiomedicalEngineer
                  ? 'تقویم کارگروه مهندسی پزشکی'
                  : isFinanceManager
                  ? 'تقویم کارگروه مالی'
                  : isAssetManager
                  ? 'تقویم کارگروه اموال'
                  : 'تقویم کارگروه خرید'}
              </span>
            </button>
          )}
        </div>

        {/* Member Sub-Filter when in Workgroup tab */}
        {activeCalendarTab === 'workgroup' && (
          <div className="flex items-center gap-2 bg-white/90 p-1 rounded-xl border border-sky-200">
            <span className="text-[11px] text-slate-500 font-bold px-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-sky-600" />
              <span>عضو کارگروه:</span>
            </span>
            {isBiomedicalEngineer ? (
              <select
                value={selectedBiomedMemberFilter}
                onChange={(e) => setSelectedBiomedMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-lg px-2.5 py-1 outline-none cursor-pointer"
              >
                <option value="all">همه اعضای کارگروه مهندسی پزشکی</option>
                <option value="me">فقط رویدادهای من (مهندس امین رضایی)</option>
                <option value="negar">مهندس نگار احمدی (کالیبراسیون و کنترل کیفی)</option>
                <option value="reza">مهندس رضا صابری (تعمیرات و PM)</option>
                <option value="hamed">مهندس حامد باقری (پشتیبانی فنی)</option>
              </select>
            ) : isFinanceManager ? (
              <select
                value={selectedFinanceMemberFilter}
                onChange={(e) => setSelectedFinanceMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-lg px-2.5 py-1 outline-none cursor-pointer"
              >
                <option value="all">همه رویدادهای کارگروه مالی</option>
                <option value="me">فقط رویدادهای من (استاد صادقی)</option>
                <option value="fatemeh">فاطمه محمدی (حسابداری)</option>
                <option value="amir">امیرحسین کاظمی (بودجه)</option>
                <option value="mina">مینا حسینی (حسابرسی)</option>
              </select>
            ) : isAssetManager ? (
              <select
                value={selectedAssetMemberFilter}
                onChange={(e) => setSelectedAssetMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-lg px-2.5 py-1 outline-none cursor-pointer"
              >
                <option value="all">همه رویدادهای کارگروه اموال</option>
                <option value="me">فقط رویدادهای من (مهندس کامران حسینی)</option>
                <option value="reza">مهندس رضا محمودی (انباردار)</option>
                <option value="rostami">علی رستمی (پلاک‌کوبی)</option>
                <option value="shams">سمیرا شمس (کنترل موجودی)</option>
              </select>
            ) : (
              <select
                value={selectedProcurementMemberFilter}
                onChange={(e) => setSelectedProcurementMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-lg px-2.5 py-1 outline-none cursor-pointer"
              >
                <option value="all">همه رویدادهای کارگروه خرید</option>
                <option value="me">فقط رویدادهای من (مهندس سارا ابراهیمی)</option>
                <option value="pouya">پویا شایان (استعلام قیمت)</option>
                <option value="mahsa">مهسا نوری (تامین و سفارشات)</option>
                <option value="ehsan">احسان فلاح (قراردادها)</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* Equipment Calendar Search & Multi-Filters Toolbar */}
      {activeCalendarTab === 'equipment' && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجوی نام دستگاه، برند، کد اموال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
              />
            </div>

            {/* Department Dropdown */}
            <div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700 focus:bg-white focus:border-sky-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">همه بخش‌های بیمارستان</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    بخش {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700 focus:bg-white focus:border-sky-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">همه انواع رویدادها</option>
                <option value="calibration">کالیبراسیون و انطباق استاندارد</option>
                <option value="pm_service">سرویس دوره‌ای نگهداری پیشگیرانه (PM)</option>
                <option value="maintenance">تعمیرات و رفع خرابی‌های ثبت‌شده</option>
                <option value="safety_test">آزمون ایمنی الکتریکی IEC 62353</option>
                <option value="purchase">خرید، تحویل و ورود دستگاه</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700 focus:bg-white focus:border-sky-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">همه سطوح اولویت</option>
                <option value="critical">بحرانی / منقضی‌شده</option>
                <option value="high">اولویت بالا</option>
                <option value="normal">عادی و برنامه‌ریزی‌شده</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Month / Week Switcher Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 11))}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="ماه قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-sm font-black text-slate-800 tracking-tight min-w-[130px] text-center">
              {monthNames[currentMonthIndex]} {currentYear}
            </span>
            <button
              onClick={() => setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : 0))}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="ماه بعدی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDayNumber(20)}
              className="px-3 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition-all cursor-pointer"
            >
              امروز (۲۰ مرداد)
            </button>
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">
              انتخاب شده: {selectedDayNumber} {monthNames[currentMonthIndex]}
            </span>
          </div>
        </div>

        {/* 1. MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="space-y-3">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-black text-slate-600 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              {daysOfWeek.map((dayName, idx) => (
                <div key={idx} className={idx === 6 ? 'text-rose-600 font-black' : ''}>
                  {dayName}
                </div>
              ))}
            </div>

            {/* Days Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Pre-padding */}
              {Array.from({ length: startDayOfWeekIndex }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[70px] sm:min-h-[88px] bg-slate-50/40 rounded-2xl border border-slate-100/50 p-1 opacity-25"
                />
              ))}

              {/* 1 to 31 Days */}
              {Array.from({ length: totalDaysInMonth }).map((_, dayIdx) => {
                const dayNum = dayIdx + 1;
                const isSelected = dayNum === selectedDayNumber;
                const isToday = dayNum === 20;

                // Events for this day
                const dayEqEvents = equipmentEventsByDay[dayNum] || [];
                const dayTaskEvents = taskEventsByDay[dayNum] || [];
                const currentDayEvents = activeCalendarTab === 'equipment' ? dayEqEvents : dayTaskEvents;

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => {
                      setSelectedDayNumber(dayNum);
                      setDayModalDate(dayNum);
                    }}
                    className={`min-h-[72px] sm:min-h-[92px] p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-300 shadow-xs'
                        : isToday
                        ? 'bg-blue-50/40 border-blue-200'
                        : 'bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-2xs'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between leading-none">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-xs'
                            : isToday
                            ? 'bg-sky-100 text-sky-800'
                            : 'text-slate-700 group-hover:bg-slate-100'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {currentDayEvents.length > 0 && (
                        <span className="text-[10px] font-extrabold text-sky-700 bg-sky-100/80 px-1.5 py-0.2 rounded-md">
                          {currentDayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Event Badges inside Cell - Clicking opens day events list */}
                    <div className="space-y-1 my-1 flex-1 overflow-hidden pointer-events-none">
                      {activeCalendarTab === 'equipment'
                        ? dayEqEvents.slice(0, 2).map((ev) => {
                            const badge = getEquipmentEventBadge(ev.eventType);
                            return (
                              <div
                                key={ev.id}
                                className={`text-right px-1.5 py-0.5 rounded-lg text-[9px] font-bold border transition-all truncate flex items-center gap-1 ${
                                  ev.status === 'completed'
                                    ? 'bg-slate-100 text-slate-500 border-slate-200 line-through opacity-70'
                                    : badge.bg
                                }`}
                                title={ev.title}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                                <span className="truncate">{ev.equipmentName}</span>
                              </div>
                            );
                          })
                        : dayTaskEvents.slice(0, 2).map((ev) => {
                            const badge = getTaskTypeBadge(ev.type);
                            return (
                              <div
                                key={ev.id}
                                className={`text-right px-1.5 py-0.5 rounded-lg text-[9px] font-bold border transition-all truncate flex items-center gap-1 ${
                                  ev.status === 'completed'
                                    ? 'bg-slate-100 text-slate-500 border-slate-200 line-through opacity-70'
                                    : badge.bg
                                }`}
                                title={ev.title}
                              >
                                <span className="truncate">{ev.title}</span>
                              </div>
                            );
                          })}

                      {currentDayEvents.length > 2 && (
                        <div className="text-[9px] font-black text-sky-700 bg-sky-100/80 px-1 py-0.2 rounded text-center truncate">
                          +{currentDayEvents.length - 2} رویداد دیگر
                        </div>
                      )}
                    </div>

                    {/* Urgent indicator */}
                    {currentDayEvents.some((e: any) => e.priority === 'critical' || e.priority === 'high') && (
                      <div className="flex items-center gap-1 text-[9px] text-rose-600 font-bold border-t border-slate-100 pt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                        <span className="truncate">اقدام فوری</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. WEEK VIEW */}
        {viewMode === 'week' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {daysOfWeek.map((dayName, idx) => {
                // Calculate week days around selectedDayNumber
                const dayNum = Math.max(1, Math.min(totalDaysInMonth, selectedDayNumber - (selectedDayNumber % 7) + idx + 1));
                const dayEqEvents = equipmentEventsByDay[dayNum] || [];
                const dayTaskEvents = taskEventsByDay[dayNum] || [];
                const isSelected = dayNum === selectedDayNumber;

                return (
                  <div
                    key={`week-day-${idx}`}
                    onClick={() => {
                      setSelectedDayNumber(dayNum);
                      setDayModalDate(dayNum);
                    }}
                    className={`rounded-2xl border p-3 flex flex-col space-y-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50/70 border-sky-400 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-xs font-black text-slate-800 block">{dayName}</span>
                        <span className="text-[10px] text-slate-500">{dayNum} مرداد</span>
                      </div>
                      <span className="text-[11px] font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                        {activeCalendarTab === 'equipment' ? dayEqEvents.length : dayTaskEvents.length}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[360px] pointer-events-none">
                      {activeCalendarTab === 'equipment' ? (
                        dayEqEvents.length === 0 ? (
                          <p className="text-[10px] text-slate-400 text-center py-4">بدون رویداد</p>
                        ) : (
                          dayEqEvents.map((ev) => {
                            const badge = getEquipmentEventBadge(ev.eventType);
                            return (
                              <div
                                key={ev.id}
                                className={`p-2 rounded-xl border text-right space-y-1 transition-all ${badge.bg}`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-white/80 border border-current">
                                    {ev.equipmentCode}
                                  </span>
                                  <span className="text-[9px] font-extrabold">{ev.department}</span>
                                </div>
                                <h4 className="text-[11px] font-black leading-tight text-slate-800">
                                  {ev.equipmentName}
                                </h4>
                                <p className="text-[10px] text-slate-600 line-clamp-2">{ev.title}</p>
                              </div>
                            );
                          })
                        )
                      ) : dayTaskEvents.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-center py-4">بدون وظیفه</p>
                      ) : (
                        dayTaskEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-right space-y-1 transition-all"
                          >
                            <h4 className="text-[11px] font-black text-slate-800">{ev.title}</h4>
                            <div className="flex items-center justify-between text-[9px] text-slate-500">
                              <span>{ev.assignedTo}</span>
                              <span className={ev.priority === 'high' ? 'text-rose-600 font-black' : ''}>
                                {ev.priority === 'high' ? 'فوری' : 'عادی'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. DAY AGENDA VIEW & SELECTED DAY DETAILS */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>
                دستورکار و رویدادهای روز {selectedDayNumber} {monthNames[currentMonthIndex]} {currentYear}
              </span>
            </h3>

            <span className="text-xs font-bold text-slate-500">
              {activeCalendarTab === 'equipment'
                ? `${(equipmentEventsByDay[selectedDayNumber] || []).length} مورد تجهیزات`
                : `${(taskEventsByDay[selectedDayNumber] || []).length} رویداد سازمانی`}
            </span>
          </div>

          {activeCalendarTab === 'equipment' ? (
            (equipmentEventsByDay[selectedDayNumber] || []).length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200/60 text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold">برای این روز رویداد کالیبراسیون یا سرویس فنی ثبت نشده است.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(equipmentEventsByDay[selectedDayNumber] || []).map((ev) => {
                  const badge = getEquipmentEventBadge(ev.eventType);
                  const Icon = badge.icon;

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEquipmentEvent(ev)}
                      className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                    >
                      <div>
                        {/* Event Category & Code */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${badge.bg}`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{badge.label}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black border border-slate-200 font-mono">
                            {ev.equipmentCode}
                          </span>
                        </div>

                        {/* Title & Equipment */}
                        <h4 className="text-xs font-black text-slate-800 group-hover:text-sky-600 transition-colors leading-snug">
                          {ev.equipmentName}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{ev.title}</p>
                      </div>

                      {/* Meta Footer */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>بخش مستقر:</span>
                          <span className="font-bold text-slate-800">{ev.department}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>کارشناس / مسئول:</span>
                          <span className="font-bold text-slate-800">{ev.assignedTo || ev.technicianOrAgency}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>اقدام فنی:</span>
                          <span className="font-extrabold text-sky-700 flex items-center gap-1">
                            <span>مشاهده جزئیات و اقدام</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (taskEventsByDay[selectedDayNumber] || []).length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200/60 text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold">برای این روز وظیفه کاری تعریف نشده است.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(taskEventsByDay[selectedDayNumber] || []).map((ev) => {
                const badge = getTaskTypeBadge(ev.type);
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedTaskEvent(ev)}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{ev.dueDate}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-800 group-hover:text-sky-600 transition-colors">
                        {ev.title}
                      </h4>
                      {ev.notes && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ev.notes}</p>}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{ev.assignedTo}</span>
                      <span
                        className={`font-black ${
                          ev.priority === 'high'
                            ? 'text-rose-600'
                            : ev.priority === 'medium'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {ev.priority === 'high' ? 'اولویت بالا' : 'عادی'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DAY EVENTS LIST MODAL (Opens when clicking any day cell) */}
      {dayModalDate !== null && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-right max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    رویدادها و برنامه‌های روز {dayModalDate} {monthNames[currentMonthIndex]} {currentYear}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeCalendarTab === 'equipment'
                      ? `${(equipmentEventsByDay[dayModalDate] || []).length} رویداد تجهیزات در این روز ثبت شده است`
                      : `${(taskEventsByDay[dayModalDate] || []).length} وظیفه و رویداد کاری در این روز ثبت شده است`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDayModalDate(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guide hint */}
            <div className="bg-sky-50/70 border border-sky-100 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs text-sky-900 font-bold">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <span>برای مشاهده جزئیات کامل، تغییر وضعیت یا ارجاع به بخش مربوطه، روی هر رویداد کلیک کنید.</span>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 py-1 pr-0.5 pl-1">
              {activeCalendarTab === 'equipment' ? (
                (equipmentEventsByDay[dayModalDate] || []).length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200/60 text-slate-500 space-y-2 my-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="text-sm font-black text-slate-700">
                      برای روز {dayModalDate} {monthNames[currentMonthIndex]} رویداد کالیبراسیون یا سرویس فنی ثبت نشده است.
                    </p>
                    <p className="text-xs text-slate-400">
                      می‌توانید با استفاده از دکمه زیر برای این تاریخ رویداد جدید تعریف کنید.
                    </p>
                  </div>
                ) : (
                  (equipmentEventsByDay[dayModalDate] || []).map((ev) => {
                    const badge = getEquipmentEventBadge(ev.eventType);
                    const Icon = badge.icon;

                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEquipmentEvent(ev)}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-sky-400 hover:bg-sky-50/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${badge.bg}`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg}`}>
                                {badge.label}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black font-mono border border-slate-200">
                                {ev.equipmentCode}
                              </span>
                              <span className="text-[11px] text-slate-500 font-bold">بخش {ev.department}</span>
                              {ev.priority === 'critical' && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black">
                                  بحرانی / فوری
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-black text-slate-800 group-hover:text-sky-700 transition-colors">
                              {ev.equipmentName}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-1">{ev.title}</p>

                            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                              <span>
                                مسئول: <strong className="text-slate-700">{ev.assignedTo || ev.technicianOrAgency}</strong>
                              </span>
                              {ev.brand && (
                                <span>
                                  برند: <strong className="text-slate-700">{ev.brand}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
                          <span className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs">
                            <span>مشاهده جزئیات و اقدام</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (taskEventsByDay[dayModalDate] || []).length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200/60 text-slate-500 space-y-2 my-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-black text-slate-700">برای این روز وظیفه کاری تعریف نشده است.</p>
                  <p className="text-xs text-slate-400">می‌توانید با دکمه زیر وظیفه یا رویداد جدید اضافه کنید.</p>
                </div>
              ) : (
                (taskEventsByDay[dayModalDate] || []).map((ev) => {
                  const badge = getTaskTypeBadge(ev.type);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedTaskEvent(ev)}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-sky-400 hover:bg-sky-50/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{ev.dueDate}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                              ev.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {ev.priority === 'high' ? 'اولویت بالا' : 'عادی'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              ev.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {ev.status === 'completed' ? 'انجام شده' : 'در دست اقدام'}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-slate-800 group-hover:text-sky-700 transition-colors">
                          {ev.title}
                        </h4>
                        {ev.notes && <p className="text-xs text-slate-500 line-clamp-1">{ev.notes}</p>}

                        <div className="text-[11px] text-slate-500 pt-0.5">
                          مسئول: <strong className="text-slate-700">{ev.assignedTo}</strong> ({ev.role})
                        </div>
                      </div>

                      <div className="flex items-center justify-end sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
                        <span className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs">
                          <span>مشاهده جزئیات</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSelectedDayForAdd(dayModalDate);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت رویداد جدید برای این روز</span>
              </button>

              <button
                onClick={() => setDayModalDate(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE EQUIPMENT EVENT DETAIL MODAL */}
      {selectedEquipmentEvent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-right max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${
                      getEquipmentEventBadge(selectedEquipmentEvent.eventType).bg
                    }`}
                  >
                    {getEquipmentEventBadge(selectedEquipmentEvent.eventType).label}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-black border border-slate-200 font-mono">
                    {selectedEquipmentEvent.equipmentCode}
                  </span>
                  {selectedEquipmentEvent.priority === 'critical' && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-200">
                      بحرانی / فوری
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-800 leading-tight">
                  {selectedEquipmentEvent.equipmentName}
                </h3>
                {selectedEquipmentEvent.equipmentNameEn && (
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedEquipmentEvent.equipmentNameEn}</p>
                )}
              </div>

              <button
                onClick={() => setSelectedEquipmentEvent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Equipment Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">بخش و موقعیت:</span>
                <span className="font-bold text-slate-800">{selectedEquipmentEvent.department}</span>
                {selectedEquipmentEvent.location && (
                  <span className="text-[10px] text-slate-500 block">({selectedEquipmentEvent.location})</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">برند و مدل:</span>
                <span className="font-bold text-slate-800">
                  {selectedEquipmentEvent.brand || '---'} {selectedEquipmentEvent.model || ''}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">تاریخ سررسید رویداد:</span>
                <span className="font-black text-slate-800 font-mono">{selectedEquipmentEvent.date}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">کارشناس / آزمایشگاه:</span>
                <span className="font-bold text-slate-800">
                  {selectedEquipmentEvent.assignedTo || selectedEquipmentEvent.technicianOrAgency}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">شاخص ایمنی و سلامت:</span>
                <span className="font-black text-emerald-600">
                  {selectedEquipmentEvent.safetyScore || 95}٪ استاندارد
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">شماره سریال دستگاه:</span>
                <span className="font-bold text-slate-700 font-mono text-[11px]">
                  {selectedEquipmentEvent.serialNumber || 'SN-AVA-2024'}
                </span>
              </div>
            </div>

            {/* Action Required Box */}
            <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-sky-900 font-black">
                <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
                <span>اقدام فنی لازم:</span>
              </div>
              <p className="text-sky-950 font-medium leading-relaxed">{selectedEquipmentEvent.actionRequired}</p>
              {selectedEquipmentEvent.description && (
                <p className="text-slate-600 text-[11px] pt-1 border-t border-sky-100">
                  {selectedEquipmentEvent.description}
                </p>
              )}
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedEquipmentEvent(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                بستن پنجره
              </button>

              <button
                onClick={() => handleNavigateFromEquipmentEvent(selectedEquipmentEvent)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <span>
                  {selectedEquipmentEvent.targetPage === 'calibration'
                    ? 'مشاهده در کالیبراسیون و ایمنی'
                    : selectedEquipmentEvent.targetPage === 'failures'
                    ? 'مشاهده در گزارش خرابی‌ها'
                    : selectedEquipmentEvent.targetPage === 'purchase_requests'
                    ? 'مشاهده در درخواست‌های خرید'
                    : 'مشاهده شناسنامه در انبار'}
                </span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK EVENT MODAL */}
      {selectedTaskEvent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-right">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black border mb-1.5 inline-block ${
                    getTaskTypeBadge(selectedTaskEvent.type).bg
                  }`}
                >
                  {getTaskTypeBadge(selectedTaskEvent.type).label}
                </span>
                <h3 className="text-base font-black text-slate-800 leading-tight">
                  {selectedTaskEvent.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTaskEvent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">مسئول پیگیری:</span>
                <span className="font-bold text-slate-800">{selectedTaskEvent.assignedTo}</span>
                <span className="text-[10px] text-slate-500 block">({selectedTaskEvent.role})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">تاریخ انجام:</span>
                <span className="font-bold text-slate-800 font-mono">{selectedTaskEvent.dueDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">اولویت:</span>
                <span
                  className={`font-black ${
                    selectedTaskEvent.priority === 'high' ? 'text-rose-600' : 'text-slate-700'
                  }`}
                >
                  {selectedTaskEvent.priority === 'high' ? 'فوری' : 'عادی'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">وضعیت:</span>
                <span
                  className={`font-bold ${
                    selectedTaskEvent.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {selectedTaskEvent.status === 'completed' ? 'انجام شده' : 'در دست اقدام'}
                </span>
              </div>
            </div>

            {selectedTaskEvent.notes && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                <span className="font-bold block text-slate-800 mb-1">یادداشت فنی:</span>
                <p>{selectedTaskEvent.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const success = onToggleEventStatus(selectedTaskEvent.id);
                  if (success !== false) {
                    setSelectedTaskEvent(null);
                    setNotificationMsg('وضعیت رویداد با موفقیت تغییر کرد.');
                    setTimeout(() => setNotificationMsg(null), 2500);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>
                  {selectedTaskEvent.status === 'completed' ? 'تغییر به در حال انجام' : 'علامت‌گذاری به عنوان انجام شده'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800">
                ثبت رویداد جدید تقویم - {selectedDayForAdd} {monthNames[currentMonthIndex]}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem('event_title') as HTMLInputElement).value;
                const priority = (form.elements.namedItem('event_priority') as HTMLSelectElement).value as any;
                const notes = (form.elements.namedItem('event_notes') as HTMLTextAreaElement).value;

                if (selectedAssigneeIds.length === 0) {
                  setAssigneeError('لطفا حداقل یک مسئول پیگیری انتخاب کنید.');
                  return;
                }

                const primaryUser = allUsers.find((u) => u.id === selectedAssigneeIds[0]) || currentUser;

                const newEvent: TaskEvent = {
                  id: `event-${Date.now()}`,
                  title,
                  type: selectedTaskType as any,
                  priority,
                  assignedTo: primaryUser?.name || currentUser?.name || 'نامشخص',
                  role: primaryUser?.roleFa || currentUser?.roleFa || 'کارشناس',
                  dueDate: `1405/${String(currentMonthIndex + 1).padStart(2, '0')}/${String(
                    selectedDayForAdd || 20
                  ).padStart(2, '0')}`,
                  status: 'open',
                  autoGenerated: false,
                  notes,
                };

                onAddEvent(newEvent);
                setShowAddModal(false);
                setNotificationMsg('رویداد جدید با موفقیت به تقویم اضافه شد.');
                setTimeout(() => setNotificationMsg(null), 3000);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان رویداد / ماموریت:</label>
                <input
                  name="event_title"
                  type="text"
                  required
                  placeholder="مثلا: کالیبراسیون ونتیلاتور دراگر بخش ICU"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع عملیات:</label>
                  <select
                    value={selectedTaskType}
                    onChange={(e) => setSelectedTaskType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none transition-all font-bold cursor-pointer"
                  >
                    {allowedTaskTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اولویت فوریت:</label>
                  <select
                    name="event_priority"
                    defaultValue="medium"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none transition-all font-bold cursor-pointer"
                  >
                    <option value="low">عادی (پایین)</option>
                    <option value="medium">متوسط</option>
                    <option value="high">فوری / بحرانی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">انتخاب مسئول پیگیری:</label>
                <select
                  value={selectedAssigneeIds[0] || ''}
                  onChange={(e) => setSelectedAssigneeIds([e.target.value])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none transition-all font-bold cursor-pointer"
                >
                  {workgroupMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.roleFa})
                    </option>
                  ))}
                </select>
                {assigneeError && <p className="text-rose-600 text-[10px] mt-1 font-bold">{assigneeError}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">توضیحات و دستورالعمل اجرایی:</label>
                <textarea
                  name="event_notes"
                  rows={3}
                  placeholder="نکات فنی، شماره سریال تجهیزات یا شرح ماموریت..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none transition-all font-medium"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black transition-all shadow-xs cursor-pointer"
                >
                  ثبت رویداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
