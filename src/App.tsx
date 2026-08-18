import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Sparkles, AlertTriangle, ArrowLeft, X, FileEdit, CheckCircle2 } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AIChatDrawer } from './components/AIChatDrawer';
import { LoginView } from './components/LoginView';

// Views
import { DashboardView } from './components/views/DashboardView';
import { InventoryView } from './components/views/InventoryView';
import { AssetStructureView } from './components/views/AssetStructureView';
import { CalendarView } from './components/views/CalendarView';
import { TasksCalendarView } from './components/views/TasksCalendarView';
import { CalibrationView } from './components/views/CalibrationView';
import { FailuresView } from './components/views/FailuresView';
import { PurchaseRequestsView } from './components/views/PurchaseRequestsView';
import { SmartCartView } from './components/views/SmartCartView';
import { VendorsView } from './components/views/VendorsView';
import { ReportsView } from './components/views/ReportsView';
import { AssetManagerReportsView } from './components/views/AssetManagerReportsView';
import { UsersView } from './components/views/UsersView';
import { MyWorkgroupView } from './components/views/MyWorkgroupView';
import { SettingsView } from './components/views/SettingsView';

// Mock Data & Types
import {
  MOCK_EQUIPMENT,
  MOCK_CLASSIFICATIONS,
  MOCK_TASKS,
  MOCK_CALIBRATIONS,
  MOCK_FAILURES,
  MOCK_PURCHASE_REQUESTS,
  MOCK_SMART_CART,
  STRATEGY_CARTS,
  INITIAL_CLOSED_BATCHES,
  MOCK_VENDORS,
  MOCK_USERS,
  INITIAL_CUSTOM_FILTERS,
} from './data/mockData';

import {
  PageId,
  EquipmentItem,
  AssetClassification,
  TaskEvent,
  CalibrationRecord,
  FailureReport,
  PurchaseRequest,
  SmartCartItem,
  ClosedCartBatch,
  CartStrategy,
  AppUser,
  CustomEquipmentFilter,
} from './types';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Users State
  const [usersList, setUsersList] = useState<AppUser[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<AppUser>(MOCK_USERS[0]);

  // Data State
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(MOCK_EQUIPMENT);
  const [classificationsList, setClassificationsList] =
    useState<AssetClassification[]>(MOCK_CLASSIFICATIONS);
  const [tasksList, setTasksList] = useState<TaskEvent[]>(MOCK_TASKS);
  const [calibrationsList, setCalibrationsList] =
    useState<CalibrationRecord[]>(MOCK_CALIBRATIONS);
  const [failuresList, setFailuresList] = useState<FailureReport[]>(MOCK_FAILURES);
  const [requestsList, setRequestsList] =
    useState<PurchaseRequest[]>(MOCK_PURCHASE_REQUESTS);
  const [strategyCarts, setStrategyCarts] = useState<Record<CartStrategy, SmartCartItem[]>>(
    STRATEGY_CARTS as Record<CartStrategy, SmartCartItem[]>
  );
  const [closedBatches, setClosedBatches] = useState<ClosedCartBatch[]>(INITIAL_CLOSED_BATCHES);
  const [selectedEquipmentParam, setSelectedEquipmentParam] =
    useState<EquipmentItem | null>(null);
  const [selectedEquipmentForCalibration, setSelectedEquipmentForCalibration] =
    useState<EquipmentItem | null>(null);
  const [inventoryNavState, setInventoryNavState] = useState<{
    initialTab?: 'drafts' | 'inventory';
    initialLayout?: 'grouped' | 'individual' | 'tree';
    initialStatusFilter?: string;
    actionGuidance?: {
      type: 'draft_tagging' | 'low_stock' | 'asset_transfer' | 'purchase_approval' | string;
      title?: string;
      description?: string;
      message?: string;
      targetDraftId?: string;
    } | null;
    openAssetTransferModal?: boolean;
    openQuickRestockModal?: boolean;
  } | null>(null);

  const handleNavigateToInventoryWithAction = (params: {
    initialTab?: 'drafts' | 'inventory';
    initialLayout?: 'grouped' | 'individual' | 'tree';
    initialStatusFilter?: string;
    actionGuidance?: {
      type: 'draft_tagging' | 'low_stock' | 'asset_transfer' | 'purchase_approval' | string;
      title?: string;
      description?: string;
      message?: string;
      targetDraftId?: string;
    } | null;
    openAssetTransferModal?: boolean;
    openQuickRestockModal?: boolean;
  }) => {
    setInventoryNavState(params);
    setActivePage('inventory');
  };

  const handleNavigateToCalibration = (equipment: EquipmentItem) => {
    if (currentUser?.role === 'asset_manager') {
      return;
    }
    setSelectedEquipmentForCalibration(equipment);
    setActivePage('calibration');
  };

  // Asset Classification Handlers
  const handleAddClassification = (
    newCat: Omit<AssetClassification, 'id' | 'createdAt' | 'updatedAt' | 'itemsCount'>
  ) => {
    const parentCat = classificationsList.find((c) => c.id === newCat.parentId);
    const category: AssetClassification = {
      ...newCat,
      id: `cls-${Date.now()}`,
      parentName: parentCat ? parentCat.name : undefined,
      itemsCount: 0,
      createdAt: '۱۴۰۳/۰۵/۲۱',
      updatedAt: '۱۴۰۳/۰۵/۲۱',
    };
    setClassificationsList((prev) => [category, ...prev]);
    return { id: category.id };
  };

  const handleUpdateClassification = (updated: AssetClassification) => {
    setClassificationsList((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleToggleClassificationActive = (id: string) => {
    setClassificationsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDeleteClassification = (id: string): boolean => {
    const target = classificationsList.find((c) => c.id === id);
    if (target && target.itemsCount > 0) {
      return false;
    }
    setClassificationsList((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // Handle Login
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActivePage('dashboard');
  };

  // Handle User Switch from Header / Users View
  const handleSwitchUser = (user: AppUser) => {
    setCurrentUser(user);
    if (user.allowedPages && !user.allowedPages.includes(activePage)) {
      setActivePage('dashboard');
    }
  };

  // Handlers
  const handleAddEquipment = (item: EquipmentItem) => {
    setEquipmentList((prev) => [item, ...prev]);
  };

  const [taskAlertModal, setTaskAlertModal] = useState<{
    title: string;
    message: string;
    draftItem?: EquipmentItem;
  } | null>(null);

  const handleUpdateEquipment = (item: EquipmentItem) => {
    setEquipmentList((prev) => prev.map((e) => (e.id === item.id ? item : e)));

    // If an item was finalized (no longer draft), automatically mark corresponding draft completion tasks as completed!
    if (!item.isDraft && item.status !== 'draft') {
      setTasksList((prevTasks) =>
        prevTasks.map((t) => {
          const isAssociated =
            (t.targetDraftId && t.targetDraftId === item.id) ||
            (t.equipmentCode && (t.equipmentCode === item.code || t.equipmentCode === item.id || item.code?.includes(t.equipmentCode))) ||
            (t.type === 'draft_completion' && (item.faName.includes(t.equipmentName || '') || t.title.includes(item.faName)));

          if (isAssociated) {
            return { ...t, status: 'completed' as const };
          }
          return t;
        })
      );
    }
  };

  const handleAddTask = (task: TaskEvent) => {
    setTasksList((prev) => [task, ...prev]);
  };

  const handleToggleTaskStatus = (taskId: string): boolean => {
    const task = tasksList.find((t) => t.id === taskId);
    if (!task) return false;

    // If attempting to mark an uncompleted task as completed
    if (task.status !== 'completed') {
      const isDraftTask =
        task.type === 'draft_completion' ||
        task.targetDraftId ||
        task.title.includes('پیش‌نویس') ||
        task.equipmentCode?.toUpperCase().includes('DRAFT');

      if (isDraftTask) {
        // Find if the corresponding draft equipment is still in draft state
        const matchingDraft = equipmentList.find(
          (e) =>
            (task.targetDraftId && e.id === task.targetDraftId) ||
            (task.equipmentCode && (e.code === task.equipmentCode || e.id === task.equipmentCode)) ||
            (e.isDraft &&
              (task.title.includes(e.faName) ||
                task.title.includes(e.name) ||
                (task.equipmentName && (e.faName.includes(task.equipmentName) || task.equipmentName.includes(e.faName)))))
        );

        if (matchingDraft && (matchingDraft.isDraft || matchingDraft.status === 'draft')) {
          setTaskAlertModal({
            title: 'هشدار عدم تکمیل تسک در سامانه',
            message: `قلم پیش‌نویس «${matchingDraft.faName}» (${matchingDraft.code}) هنوز در انبار ناقص است. تا زمانی که شناسنامه این کالا در تب «پیش‌نویس‌ها» تکمیل و نهایی نشود، امکان بستن یا تغییر وضعیت این تسک به «تکمیل‌شده» وجود ندارد.`,
            draftItem: matchingDraft,
          });
          return false;
        }
      }
    }

    setTasksList((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: t.status === 'completed' ? 'open' : 'completed',
            }
          : t
      )
    );
    return true;
  };

  const handleAddCalibrationRecord = (record: CalibrationRecord) => {
    setCalibrationsList((prev) => [record, ...prev]);
  };

  const handleSaveOperatorFeedback = (calId: string, feedback: string) => {
    setCalibrationsList((prev) =>
      prev.map((c) => (c.id === calId ? { ...c, operatorFeedback: feedback } : c))
    );
  };

  const handleReportFailure = (report: FailureReport) => {
    setFailuresList((prev) => [report, ...prev]);

    // Also auto-generate an urgent task for maintenance
    const newTask: TaskEvent = {
      id: `task-auto-${Date.now()}`,
      title: `تعمیر اضطراری ${report.equipmentName}`,
      type: 'maintenance',
      priority: report.priority === 'critical' ? 'high' : 'medium',
      assignedTo: 'مهندس امین رضایی',
      role: 'کارشناس تجهیزات',
      dueDate: '1405/05/22',
      status: 'open',
      equipmentCode: report.equipmentCode,
      autoGenerated: true,
      notes: `گزارش شده توسط ${report.reporterName}: ${report.defectDescription}`,
    };

    setTasksList((prev) => [newTask, ...prev]);
  };

  const handleUpdateFailureStatus = (
    id: string,
    status: FailureReport['status'],
    actionsTaken?: string
  ) => {
    setFailuresList((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status,
              actionsTaken: actionsTaken || f.actionsTaken,
            }
          : f
      )
    );
  };

  const handleCreatePurchaseRequest = (request: PurchaseRequest) => {
    setRequestsList((prev) => [request, ...prev]);
  };

  const handleApprovePurchaseStage = (requestId: string, userComment: string) => {
    setRequestsList((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;

        let nextStage = r.approvalStage + 1;
        let nextStatus = r.status;
        let actionTitle = `تأیید مرحله ${r.approvalStage}`;

        if (r.status === 'pending_asset_manager') {
          nextStatus = 'pending_finance';
          nextStage = 2;
          actionTitle = 'تأیید مدیر اموال و موجودی';
        } else if (r.status === 'pending_finance') {
          nextStatus = 'pending_procurement';
          nextStage = 3;
          actionTitle = 'تأیید مسئول مالی و بودجه';
        } else if (r.status === 'pending_procurement') {
          nextStatus = 'approved';
          nextStage = r.totalStages || 4;
          actionTitle = 'تعیین سبد هوشمند و تصویب نهایی خرید';
        } else {
          nextStatus = 'approved';
          actionTitle = 'تأیید نهایی';
        }

        const newComment = {
          user: currentUser.name,
          role: currentUser.roleFa || currentUser.role,
          text: userComment,
          date: 'امروز - هم‌اکنون',
          action: actionTitle,
        };

        return {
          ...r,
          approvalStage: nextStage,
          status: nextStatus,
          comments: [...r.comments, newComment],
        };
      })
    );
  };

  const handleRejectPurchaseRequest = (requestId: string, reason: string) => {
    setRequestsList((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status: 'rejected',
          comments: [
            ...r.comments,
            {
              user: currentUser.name,
              role: currentUser.roleFa || currentUser.role,
              text: `رد درخواست: ${reason}`,
              date: 'امروز - هم‌اکنون',
              action: 'رد درخواست',
            },
          ],
        };
      })
    );
  };

  const handleUpdateStrategyCartItem = (
    strategy: CartStrategy,
    id: string,
    newQty: number
  ) => {
    setStrategyCarts((prev) => ({
      ...prev,
      [strategy]: prev[strategy].map((ci) =>
        ci.id === id ? { ...ci, quantity: newQty } : ci
      ),
    }));
  };

  const handleRemoveStrategyCartItem = (strategy: CartStrategy, id: string) => {
    setStrategyCarts((prev) => ({
      ...prev,
      [strategy]: prev[strategy].filter((ci) => ci.id !== id),
    }));
  };

  const handleCloseCartBatch = (strategy: CartStrategy, items: SmartCartItem[]) => {
    const gross = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    const discount = items.reduce(
      (acc, it) => acc + (it.unitPrice * it.quantity * it.discountPercentage) / 100,
      0
    );
    const shipping = items.reduce((acc, it) => acc + it.shippingCost, 0);
    const net = gross - discount + shipping;

    const strategyTitles: Record<CartStrategy, string> = {
      optimized: 'سبد استراتژی بهینه‌شده کل (پیشنهاد هوشمند)',
      discount: 'سبد استراتژی حداکثر تخفیف و خرید تجمیعی',
      urgent: 'سبد استراتژی تحویل فوری اورژانسی',
      low_shipping: 'سبد استراتژی ارسال رایگان و بدون هزینه حمل',
    };

    const newBatch: ClosedCartBatch = {
      id: `batch-${Date.now()}`,
      batchCode: `CART-1405-${Math.floor(100 + Math.random() * 900)}`,
      strategy,
      strategyTitle: strategyTitles[strategy] || 'سبد خرید بسته شده',
      createdAt: 'امروز - همین الان',
      closedBy: currentUser.name,
      closedByRole: currentUser.roleFa || currentUser.role,
      totalGross: gross,
      totalDiscount: discount,
      totalShipping: shipping,
      netTotal: net,
      itemsCount: items.length,
      financialStatus: 'pending_review',
      items: [...items],
    };

    setClosedBatches((prev) => [newBatch, ...prev]);
    // Clear items in that strategy cart
    setStrategyCarts((prev) => ({
      ...prev,
      [strategy]: [],
    }));

    alert(
      `سبد خرید «${strategyTitles[strategy]}» با موفقیت بسته شد و به سبد تجمیعی و کارتابل تایید مالی ارسال گردید.`
    );
  };

  const handleReviewClosedBatch = (
    batchId: string,
    status: ClosedCartBatch['financialStatus'],
    note?: string,
    itemDecisions?: Record<string, { approved: boolean; note?: string }>
  ) => {
    setClosedBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              financialStatus: status,
              financeReviewer: `${currentUser.name} (${currentUser.roleFa || currentUser.role})`,
              financeReviewDate: 'امروز',
              financeNote: note || b.financeNote,
              itemDecisions: itemDecisions || b.itemDecisions,
            }
          : b
      )
    );
  };

  const handleSelectEquipmentFromDashboard = (item: EquipmentItem) => {
    setSelectedEquipmentParam(item);
    setActivePage('inventory');
  };

  const handleAddUser = (newUser: AppUser) => {
    setUsersList((prev) => [...prev, newUser]);
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  // If user is not authenticated, render Login Page
  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} allUsers={usersList} />;
  }

  return (
    <div dir="rtl" style={{ backgroundColor: '#f0f9ff' }} className="min-h-screen font-farsi text-slate-900 flex flex-col">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        allUsers={usersList}
        onSwitchUser={handleSwitchUser}
        onLogout={() => setIsAuthenticated(false)}
        collapsed={sidebarCollapsed}
        onOpenAIChat={() => setIsAiOpen(true)}
        equipmentList={equipmentList}
        tasksList={tasksList}
        setActivePage={setActivePage}
        onSelectEquipment={handleSelectEquipmentFromDashboard}
        onNavigateToInventoryWithAction={handleNavigateToInventoryWithAction}
        onUpdateUser={handleUpdateUser}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar Navigation */}
        <Sidebar
          currentUser={currentUser}
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          pendingRequestsCount={
            requestsList.filter((r) => r.status !== 'approved' && r.status !== 'rejected').length
          }
          criticalAlertsCount={
            failuresList.filter((f) => f.status !== 'resolved').length
          }
          draftsCount={equipmentList.filter((e) => e.isDraft).length}
          onOpenAIChat={() => setIsAiOpen(true)}
          onUpdateUser={handleUpdateUser}
        />

        {/* Main Content View Container */}
        <main
          className={`flex-1 overflow-y-auto ${
            activePage === 'dashboard' ? 'pt-[68px]' : 'pt-[80px]'
          } px-4 sm:px-6 lg:px-8 pb-8 transition-all duration-200 ${
            sidebarCollapsed ? 'mr-20' : 'mr-72'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{
                  opacity: 0,
                  scale: 0.94,
                  x: 40,
                  y: -15,
                  transformOrigin: 'top right',
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  x: 20,
                  y: -5,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 25,
                  mass: 0.8,
                }}
                className="w-full origin-top-right"
              >
                {activePage === 'dashboard' && (
                  <DashboardView
                    currentUser={currentUser}
                    equipmentList={equipmentList}
                    tasksList={tasksList}
                    calibrationsList={calibrationsList}
                    failuresList={failuresList}
                    purchaseRequests={requestsList}
                    usersList={usersList}
                    setActivePage={setActivePage}
                    onSelectEquipment={handleSelectEquipmentFromDashboard}
                    onNavigateToInventoryWithAction={handleNavigateToInventoryWithAction}
                    onToggleTaskStatus={handleToggleTaskStatus}
                    onApproveRequest={(id) =>
                      handleApprovePurchaseStage(id, 'تایید از طریق داشبورد مدیریتی')
                    }
                    onOpenAIChat={() => setIsAiOpen(true)}
                  />
                )}

                {activePage === 'inventory' && (
                  <InventoryView
                    currentUser={currentUser}
                    equipmentList={equipmentList}
                    classificationsList={classificationsList}
                    onAddEquipment={handleAddEquipment}
                    onUpdateEquipment={handleUpdateEquipment}
                    onAddClassification={handleAddClassification}
                    selectedEquipmentParam={selectedEquipmentParam}
                    onNavigateToCalibration={handleNavigateToCalibration}
                    setActivePage={setActivePage}
                    initialTab={inventoryNavState?.initialTab}
                    initialLayout={inventoryNavState?.initialLayout}
                    initialStatusFilter={inventoryNavState?.initialStatusFilter}
                    actionGuidance={inventoryNavState?.actionGuidance}
                    openAssetTransferModal={inventoryNavState?.openAssetTransferModal}
                    openQuickRestockModal={inventoryNavState?.openQuickRestockModal}
                    onClearActionGuidance={() => setInventoryNavState(null)}
                  />
                )}

                {activePage === 'asset_structure' && (
                  <SettingsView
                    currentUser={currentUser}
                    classificationsList={classificationsList}
                    onAddClassification={handleAddClassification}
                    onUpdateClassification={handleUpdateClassification}
                    onToggleActive={handleToggleClassificationActive}
                    onDeleteClassification={handleDeleteClassification}
                    defaultTab="structure"
                  />
                )}

                {activePage === 'calendar' && (
                  <CalendarView
                    currentUser={currentUser}
                    allUsers={usersList}
                    eventsList={tasksList}
                    equipmentList={equipmentList}
                    calibrationsList={calibrationsList}
                    failuresList={failuresList}
                    purchaseRequests={requestsList}
                    onAddEvent={handleAddTask}
                    onToggleEventStatus={handleToggleTaskStatus}
                    setActivePage={setActivePage}
                    onSelectEquipment={(eq) => {
                      setSelectedEquipmentParam(eq);
                      setActivePage('inventory');
                    }}
                    onSelectEquipmentForCalibration={(code) => {
                      setSelectedEquipmentForCalibration(code);
                      setActivePage('calibration');
                    }}
                  />
                )}

                {activePage === 'tasks' && (
                  <TasksCalendarView
                    currentUser={currentUser}
                    allUsers={usersList}
                    tasksList={tasksList}
                    equipmentList={equipmentList}
                    onAddTask={handleAddTask}
                    onToggleTaskStatus={handleToggleTaskStatus}
                    setActivePage={setActivePage}
                    onNavigateToInventoryWithAction={handleNavigateToInventoryWithAction}
                  />
                )}

                {activePage === 'calibration' && (
                  currentUser?.role === 'asset_manager' || currentUser?.role === 'procurement_officer' || currentUser?.role === 'nurse_operator' ? (
                    <div className="p-8 bg-white rounded-3xl border border-rose-100 shadow-xs text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-black text-lg">!</div>
                      <h2 className="text-base font-extrabold text-slate-800">عدم دسترسی به بخش کالیبراسیون و ایمنی</h2>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">نقش شما ({currentUser?.roleFa}) مجاز به دسترسی به ماژول مدیریت آزمون‌های کالیبراسیون نمی‌باشد.</p>
                      <button onClick={() => setActivePage(currentUser?.role === 'asset_manager' ? 'inventory' : 'dashboard')} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer">بازگشت</button>
                    </div>
                  ) : (
                    <CalibrationView
                      currentUser={currentUser}
                      calibrationsList={calibrationsList}
                      equipmentList={equipmentList}
                      failuresList={failuresList}
                      onAddCalibrationRecord={handleAddCalibrationRecord}
                      onSaveOperatorFeedback={handleSaveOperatorFeedback}
                      selectedEquipmentFilter={selectedEquipmentForCalibration}
                      onClearSelectedEquipmentFilter={() => setSelectedEquipmentForCalibration(null)}
                    />
                  )
                )}

                {activePage === 'failures' && (
                  currentUser?.role === 'asset_manager' || currentUser?.role === 'procurement_officer' ? (
                    <div className="p-8 bg-white rounded-3xl border border-rose-100 shadow-xs text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-black text-lg">!</div>
                      <h2 className="text-base font-extrabold text-slate-800">عدم دسترسی به بخش خرابی‌ها و تعمیرات</h2>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">نقش شما ({currentUser?.roleFa}) مجاز به دسترسی به این بخش نمی‌باشد.</p>
                      <button onClick={() => setActivePage(currentUser?.role === 'asset_manager' ? 'inventory' : 'dashboard')} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer">بازگشت</button>
                    </div>
                  ) : (
                    <FailuresView
                      currentUser={currentUser}
                      failuresList={failuresList}
                      equipmentList={equipmentList}
                      onReportFailure={handleReportFailure}
                      onUpdateFailureStatus={handleUpdateFailureStatus}
                    />
                  )
                )}

                {activePage === 'purchase_requests' && (
                  <PurchaseRequestsView
                    currentUser={currentUser}
                    requestsList={requestsList}
                    onCreateRequest={handleCreatePurchaseRequest}
                    onApproveStage={handleApprovePurchaseStage}
                    onRejectRequest={handleRejectPurchaseRequest}
                    setActivePage={setActivePage}
                  />
                )}

                {activePage === 'smart_cart' && (
                  currentUser?.role === 'asset_manager' || currentUser?.role === 'nurse_operator' ? (
                    <div className="p-8 bg-white rounded-3xl border border-rose-100 shadow-xs text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-black text-lg">!</div>
                      <h2 className="text-base font-extrabold text-slate-800">عدم دسترسی به سبد هوشمند خرید</h2>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">سبد هوشمند خرید تنها برای کارشناسان تدارکات و مدیران مالی در دسترس است.</p>
                      <button onClick={() => setActivePage('dashboard')} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer">بازگشت به داشبورد</button>
                    </div>
                  ) : (
                    <SmartCartView
                      currentUser={currentUser}
                      strategyCarts={strategyCarts}
                      closedBatches={closedBatches}
                      vendors={MOCK_VENDORS}
                      onUpdateStrategyCartItem={handleUpdateStrategyCartItem}
                      onRemoveStrategyCartItem={handleRemoveStrategyCartItem}
                      onCloseCartBatch={handleCloseCartBatch}
                      onReviewClosedBatch={handleReviewClosedBatch}
                    />
                  )
                )}

                {activePage === 'vendors' && (
                  currentUser?.role === 'asset_manager' || currentUser?.role === 'nurse_operator' ? (
                    <div className="p-8 bg-white rounded-3xl border border-rose-100 shadow-xs text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-black text-lg">!</div>
                      <h2 className="text-base font-extrabold text-slate-800">عدم دسترسی به تامین‌کنندگان</h2>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">مشاهده و مدیریت تامین‌کنندگان در حوزه اختیارات نقش شما نمی‌باشد.</p>
                      <button onClick={() => setActivePage('dashboard')} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer">بازگشت به داشبورد</button>
                    </div>
                  ) : (
                    <VendorsView currentUser={currentUser} vendorsList={MOCK_VENDORS} />
                  )
                )}

                {activePage === 'reports' && (
                  <ReportsView
                    currentUser={currentUser}
                    equipmentList={equipmentList}
                    purchaseRequests={requestsList}
                    tasksList={tasksList}
                    calibrationsList={calibrationsList}
                    failuresList={failuresList}
                    classificationsList={classificationsList}
                    vendors={MOCK_VENDORS}
                    usersList={usersList}
                    onSelectEquipment={handleSelectEquipmentFromDashboard}
                  />
                )}

                {activePage === 'my_workgroup' && (
                  <MyWorkgroupView
                    currentUser={currentUser}
                    usersList={usersList}
                    equipmentList={equipmentList}
                    tasksList={tasksList}
                    onUpdateUser={handleUpdateUser}
                    onSelectEquipment={(eq) => setSelectedEquipmentForCalibration(eq.code)}
                    onNavigateToPage={setActivePage}
                  />
                )}

                {activePage === 'users' && (
                  currentUser?.role === 'hospital_admin' ? (
                    <UsersView
                      usersList={usersList}
                      currentUser={currentUser}
                      onSwitchCurrentUser={setCurrentUser}
                      onAddUser={handleAddUser}
                      onUpdateUser={handleUpdateUser}
                    />
                  ) : (
                    <div className="p-8 bg-white rounded-3xl border border-rose-100 shadow-sm text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-black text-lg">
                        !
                      </div>
                      <h2 className="text-base font-extrabold text-slate-800">عدم داشتن سطح دسترسی</h2>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        صفحه مدیریت کاربران و دسترسی‌ها منحصر به مدیر سیستم / ادمین بیمارستان است.
                      </p>
                      <button
                        onClick={() => setActivePage(currentUser?.role === 'asset_manager' ? 'inventory' : 'dashboard')}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        {currentUser?.role === 'asset_manager' ? 'بازگشت به انبار و تجهیزات' : 'بازگشت به داشبورد'}
                      </button>
                    </div>
                  )
                )}

                {activePage === 'settings' && (
                  currentUser?.role === 'procurement_officer' || currentUser?.role === 'finance_manager' || currentUser?.role === 'biomedical_engineer' || currentUser?.role === 'nurse_operator' ? (
                    <div className="p-8 bg-white rounded-3xl border border-rose-100 shadow-xs text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-black text-lg">!</div>
                      <h2 className="text-base font-extrabold text-slate-800">عدم دسترسی به بخش تنظیمات</h2>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">نقش شما ({currentUser?.roleFa}) مجاز به دسترسی به تنظیمات سیستمی نمی‌باشد.</p>
                      <button onClick={() => setActivePage('dashboard')} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer">بازگشت به داشبورد</button>
                    </div>
                  ) : (
                    <SettingsView
                      currentUser={currentUser}
                      classificationsList={classificationsList}
                      onAddClassification={handleAddClassification}
                      onUpdateClassification={handleUpdateClassification}
                      onToggleActive={handleToggleClassificationActive}
                      onDeleteClassification={handleDeleteClassification}
                      defaultTab={currentUser?.role === 'biomedical_engineer' ? 'general' : 'structure'}
                    />
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Floating AI Assistant Trigger Button (Circular Corner Widget) */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-xl hover:shadow-sky-500/30 ring-4 ring-white transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center group cursor-pointer"
        title="دستیار هوشمند AI"
        aria-label="گفتگو با دستیار هوشمند AI"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse"></span>
        <Bot className="w-7 h-7 text-white transition-transform group-hover:rotate-12" />
        
        {/* Tooltip Label on Hover */}
        <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>دستیار هوشمند AI</span>
        </span>
      </button>

      {/* Gemini AI Assistant Drawer */}
      <AIChatDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        currentUser={currentUser}
        setActivePage={setActivePage}
        equipmentList={equipmentList}
      />

      {/* INCOMPLETE DRAFT TASK WARNING MODAL */}
      {taskAlertModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-amber-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-right">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">{taskAlertModal.title}</h3>
                  <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block mt-0.5">
                    نیازمند اقدام اولیه در سیستم
                  </span>
                </div>
              </div>
              <button
                onClick={() => setTaskAlertModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {taskAlertModal.message}
            </p>

            {taskAlertModal.draftItem && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{taskAlertModal.draftItem.faName}</span>
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-900 font-bold">
                    {taskAlertModal.draftItem.code}
                  </span>
                </div>
                {taskAlertModal.draftItem.missingFields && taskAlertModal.draftItem.missingFields.length > 0 && (
                  <div className="text-[11px] text-amber-800">
                    <span className="font-bold">فیلدهای ناقص: </span>
                    <span>{taskAlertModal.draftItem.missingFields.join('، ')}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTaskAlertModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                متوجه شدم
              </button>

              {taskAlertModal.draftItem && (
                <button
                  onClick={() => {
                    const draftId = taskAlertModal.draftItem?.id;
                    setTaskAlertModal(null);
                    handleNavigateToInventoryWithAction({
                      initialTab: 'drafts',
                      actionGuidance: {
                        type: 'draft_tagging',
                        targetDraftId: draftId,
                        message: 'لطفاً شناسنامه این پیش‌نویس را تکمیل و پلاک‌کوبی نمایید تا تسک مربوطه تکمیل شود.',
                      },
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <FileEdit className="w-4 h-4" />
                  <span>تکمیل پیش‌نویس در انبار</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
