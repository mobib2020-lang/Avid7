import React from 'react';
import {
  EquipmentItem,
  TaskEvent,
  CalibrationRecord,
  FailureReport,
  PurchaseRequest,
  PageId,
  AppUser,
  Vendor,
} from '../../types';
import { AssetManagerDashboard } from '../dashboard/AssetManagerDashboard';
import { FinanceManagerDashboard } from '../dashboard/FinanceManagerDashboard';
import { ProcurementDashboard } from '../dashboard/ProcurementDashboard';
import { BiomedicalDashboard } from '../dashboard/BiomedicalDashboard';
import { OperatorDashboard } from '../dashboard/OperatorDashboard';
import { DeptHeadDashboard } from '../dashboard/DeptHeadDashboard';
import { AdminDashboard } from '../dashboard/AdminDashboard';
import { SubordinateDashboard } from '../dashboard/SubordinateDashboard';
import { IndependentDashboard } from '../dashboard/IndependentDashboard';

interface DashboardViewProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  tasksList: TaskEvent[];
  calibrationsList: CalibrationRecord[];
  failuresList?: FailureReport[];
  purchaseRequests: PurchaseRequest[];
  usersList?: AppUser[];
  vendors?: Vendor[];
  setActivePage: (page: PageId) => void;
  onSelectEquipment?: (item: EquipmentItem) => void;
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
  onToggleTaskStatus?: (taskId: string) => void;
  onApproveRequest?: (id: string) => void;
  onOpenAIChat?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  equipmentList = [],
  tasksList = [],
  calibrationsList = [],
  failuresList = [],
  purchaseRequests = [],
  usersList = [],
  vendors = [],
  setActivePage,
  onNavigateToInventoryWithAction,
  onApproveRequest,
}) => {
  const role = currentUser?.role || 'asset_manager';

  // 1. Admin & Top Hospital Management
  if (role === 'hospital_admin' || role === 'admin') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        usersList={usersList}
        equipmentList={equipmentList}
        tasksList={tasksList}
        purchaseRequests={purchaseRequests}
        setActivePage={setActivePage}
        onNavigateToInventoryWithAction={onNavigateToInventoryWithAction}
      />
    );
  }

  // 2. Finance Manager (Supervisor of Finance)
  if (role === 'finance_manager' || role === 'financial_approver') {
    return (
      <FinanceManagerDashboard
        currentUser={currentUser}
        purchaseRequests={purchaseRequests}
        equipmentList={equipmentList}
        setActivePage={setActivePage}
        onApproveRequest={onApproveRequest}
      />
    );
  }

  // 3. Asset Manager (Supervisor of Asset & Inventory)
  if (role === 'asset_manager') {
    return (
      <AssetManagerDashboard
        currentUser={currentUser}
        equipmentList={equipmentList}
        tasksList={tasksList}
        setActivePage={setActivePage}
        onNavigateToInventoryWithAction={onNavigateToInventoryWithAction}
      />
    );
  }

  // 4. Procurement Officer (Supervisor of Procurement)
  if (role === 'procurement_officer') {
    return (
      <ProcurementDashboard
        currentUser={currentUser}
        purchaseRequests={purchaseRequests}
        equipmentList={equipmentList}
        vendors={vendors}
        setActivePage={setActivePage}
      />
    );
  }

  // 5. Biomedical Engineer (Supervisor of Biomedical)
  if (role === 'biomedical_engineer') {
    return (
      <BiomedicalDashboard
        currentUser={currentUser}
        equipmentList={equipmentList}
        calibrationsList={calibrationsList}
        failuresList={failuresList}
        setActivePage={setActivePage}
      />
    );
  }

  // 6. Department Head (Supervisor of Department)
  if (role === 'dept_head') {
    return (
      <DeptHeadDashboard
        currentUser={currentUser}
        usersList={usersList}
        equipmentList={equipmentList}
        tasksList={tasksList}
        calibrationsList={calibrationsList}
        failuresList={failuresList}
        purchaseRequests={purchaseRequests}
        setActivePage={setActivePage}
      />
    );
  }

  // 7. Operator / Nurse / Clinical Staff
  if (role === 'nurse_operator' || role === 'clinical_staff' || role === 'operator') {
    return (
      <OperatorDashboard
        currentUser={currentUser}
        equipmentList={equipmentList}
        purchaseRequests={purchaseRequests}
        failuresList={failuresList}
        setActivePage={setActivePage}
      />
    );
  }

  // 8. Subordinates of Supervisors (e.g. Warehouse keeper, tagging officer, finance expert, biomedical tech, etc.)
  const isSubordinate =
    currentUser?.supervisorId ||
    currentUser?.supervisorName ||
    role === 'warehouse_keeper' ||
    role === 'support_tech' ||
    role.includes('tech') ||
    role.includes('clerk') ||
    role.includes('expert') ||
    role.includes('officer');

  if (isSubordinate) {
    return (
      <SubordinateDashboard
        currentUser={currentUser}
        equipmentList={equipmentList}
        purchaseRequests={purchaseRequests}
        failuresList={failuresList}
        tasksList={tasksList}
        setActivePage={setActivePage}
        onNavigateToInventoryWithAction={onNavigateToInventoryWithAction}
      />
    );
  }

  // 9. Independent User without Supervisor
  return (
    <IndependentDashboard
      currentUser={currentUser}
      purchaseRequests={purchaseRequests}
      tasksList={tasksList}
      failuresList={failuresList}
      setActivePage={setActivePage}
    />
  );
};
