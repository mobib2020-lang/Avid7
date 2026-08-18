import React from 'react';
import {
  EquipmentItem,
  PurchaseRequest,
  TaskEvent,
  CalibrationRecord,
  FailureReport,
  AppUser,
  AssetClassification,
  Vendor,
} from '../../types';
import { AssetManagerReports } from '../reports/AssetManagerReports';
import { FinanceManagerReports } from '../reports/FinanceManagerReports';
import { ProcurementReports } from '../reports/ProcurementReports';
import { BiomedicalReports } from '../reports/BiomedicalReports';
import { OperatorReports } from '../reports/OperatorReports';
import { DeptHeadReports } from '../reports/DeptHeadReports';
import { AdminReports } from '../reports/AdminReports';

interface ReportsViewProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  purchaseRequests?: PurchaseRequest[];
  tasksList?: TaskEvent[];
  calibrationsList?: CalibrationRecord[];
  failuresList?: FailureReport[];
  classificationsList?: AssetClassification[];
  vendors?: Vendor[];
  usersList?: AppUser[];
  onSelectEquipment?: (item: EquipmentItem) => void;
  onNavigateToPage?: (page: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentUser,
  equipmentList,
  purchaseRequests = [],
  tasksList = [],
  calibrationsList = [],
  failuresList = [],
  classificationsList = [],
  vendors = [],
  usersList = [],
  onSelectEquipment,
  onNavigateToPage,
}) => {
  const role = currentUser?.role || 'asset_manager';

  // 1. Asset Manager & Warehouse Keeper
  if (role === 'asset_manager' || role === 'warehouse_keeper') {
    return (
      <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
        <AssetManagerReports
          currentUser={currentUser}
          equipmentList={equipmentList}
          classificationsList={classificationsList}
          onSelectEquipment={onSelectEquipment}
        />
      </div>
    );
  }

  // 2. Finance Manager
  if (role === 'finance_manager' || role === 'financial_approver') {
    return (
      <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
        <FinanceManagerReports
          currentUser={currentUser}
          purchaseRequests={purchaseRequests}
          equipmentList={equipmentList}
        />
      </div>
    );
  }

  // 3. Procurement Officer
  if (role === 'procurement_officer') {
    return (
      <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
        <ProcurementReports
          currentUser={currentUser}
          purchaseRequests={purchaseRequests}
          equipmentList={equipmentList}
          vendors={vendors}
        />
      </div>
    );
  }

  // 4. Biomedical Engineer & Technical Specialist
  if (role === 'biomedical_engineer' || role === 'support_tech') {
    return (
      <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
        <BiomedicalReports
          currentUser={currentUser}
          equipmentList={equipmentList}
          calibrationsList={calibrationsList}
          failuresList={failuresList}
        />
      </div>
    );
  }

  // 5. Clinical Staff / Nurse / Operator
  if (role === 'nurse_operator' || role === 'clinical_staff' || role === 'operator') {
    return (
      <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
        <OperatorReports
          currentUser={currentUser}
          equipmentList={equipmentList}
          purchaseRequests={purchaseRequests}
          failuresList={failuresList}
        />
      </div>
    );
  }

  // 6. Department Head
  if (role === 'dept_head') {
    return (
      <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
        <DeptHeadReports
          currentUser={currentUser}
          equipmentList={equipmentList}
          tasksList={tasksList}
          calibrationsList={calibrationsList}
          failuresList={failuresList}
          purchaseRequests={purchaseRequests}
          usersList={usersList}
        />
      </div>
    );
  }

  // 7. Hospital Admin
  if (role === 'hospital_admin' || role === 'admin') {
    return (
      <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
        <AdminReports
          currentUser={currentUser}
          usersList={usersList}
          equipmentList={equipmentList}
          purchaseRequests={purchaseRequests}
          tasksList={tasksList}
          onNavigateToPage={onNavigateToPage}
          onSelectEquipment={onSelectEquipment}
        />
      </div>
    );
  }

  // Default fallback
  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      <AssetManagerReports
        currentUser={currentUser}
        equipmentList={equipmentList}
        classificationsList={classificationsList}
        onSelectEquipment={onSelectEquipment}
      />
    </div>
  );
};
