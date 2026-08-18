import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  DollarSign,
  MessageSquare,
  Sparkles,
  ChevronRight,
  X,
  FileText,
  ShieldCheck,
  ShoppingCart,
  Send,
  UserCheck,
  HelpCircle,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { PurchaseRequest, PageId, AppUser, UserRole } from '../../types';

interface PurchaseRequestsViewProps {
  currentUser?: AppUser;
  requestsList: PurchaseRequest[];
  onCreateRequest: (request: PurchaseRequest) => void;
  onApproveStage: (requestId: string, userComment: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  setActivePage: (page: PageId) => void;
}

export const PurchaseRequestsView: React.FC<PurchaseRequestsViewProps> = ({
  currentUser,
  requestsList,
  onCreateRequest,
  onApproveStage,
  onRejectRequest,
  setActivePage,
}) => {
  const isHospitalAdmin = currentUser?.role === 'hospital_admin';
  const isAssetManager = currentUser?.role === 'asset_manager';
  const isFinanceManager = currentUser?.role === 'finance_manager';
  const isProcurementOfficer = currentUser?.role === 'procurement_officer';
  const isDeptHead = currentUser?.role === 'dept_head';

  // ثبت درخواست خرید فقط و فقط توسط: کاربر عملیاتی، کارشناس تجهیزات پزشکی، مدیر اموال و اعضای کارگروه مدیریت اموال
  const canCreatePurchaseRequest =
    currentUser?.role === 'nurse_operator' ||
    currentUser?.role === 'support_tech' ||
    currentUser?.role === 'biomedical_engineer' ||
    currentUser?.role === 'biomedical_technician' ||
    currentUser?.role === 'asset_manager' ||
    currentUser?.role === 'warehouse_keeper' ||
    currentUser?.role === 'asset_tagging_officer' ||
    currentUser?.role === 'inventory_clerk' ||
    currentUser?.role === 'hospital_admin';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  // Filter requests
  const filteredRequests = requestsList.filter((req) => {
    if (filterStatus === 'pending') {
      if (req.status === 'approved' || req.status === 'rejected' || req.status === 'purchased') return false;
    } else if (filterStatus === 'approved') {
      if (req.status !== 'approved' && req.status !== 'purchased') return false;
    } else if (filterStatus === 'rejected') {
      if (req.status !== 'rejected') return false;
    }

    if (filterDepartment !== 'all') {
      if (req.department !== filterDepartment) return false;
    }

    return true;
  });

  const getStatusBadge = (status: PurchaseRequest['status']) => {
    switch (status) {
      case 'pending_asset_manager':
        return {
          label: 'در انتظار تأیید مدیر اموال و موجودی',
          className: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'pending_finance':
        return {
          label: 'در انتظار تأیید مسئول مالی',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'pending_procurement':
        return {
          label: 'در انتظار تعیین سبد خرید (تدارکات)',
          className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      case 'approved':
        return {
          label: 'تأیید نهایی شده (آماده خرید)',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'purchased':
        return {
          label: 'خریداری و تحویل انبار شده',
          className: 'bg-teal-100 text-teal-800 border-teal-200',
        };
      case 'rejected':
        return {
          label: 'رد شده',
          className: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      default:
        return {
          label: 'در حال بررسی',
          className: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const isUserEligibleToApprove = (req: PurchaseRequest) => {
    if (!currentUser) return false;
    if (req.status === 'approved' || req.status === 'rejected' || req.status === 'purchased') return false;

    if (req.status === 'pending_asset_manager' && (isAssetManager || currentUser.role === 'hospital_admin')) {
      return true;
    }
    if (req.status === 'pending_finance' && (isFinanceManager || currentUser.role === 'hospital_admin')) {
      return true;
    }
    if (req.status === 'pending_procurement' && (isProcurementOfficer || currentUser.role === 'hospital_admin')) {
      return true;
    }
    return false;
  };

  const handleOpenDetailModal = (req: PurchaseRequest) => {
    setSelectedRequest(req);
    setApprovalComment('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-sky-600" />
            <span>گردش کار و مدیریت درخواست‌های خرید</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            فرآیند هوشمند تصویب درخواست‌های خرید ملزومات و تجهیزات پزشکی بیمارستان
          </p>
        </div>

        {canCreatePurchaseRequest && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت درخواست خرید جدید</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            همه درخواست‌ها ({requestsList.length.toLocaleString('fa-IR')})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'pending' ? 'bg-sky-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            در حال گردش کار (
            {requestsList.filter((r) => r.status !== 'approved' && r.status !== 'rejected' && r.status !== 'purchased').length.toLocaleString('fa-IR')}
            )
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'approved' ? 'bg-sky-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            تأییدشده / خریداری‌شده (
            {requestsList.filter((r) => r.status === 'approved' || r.status === 'purchased').length.toLocaleString('fa-IR')}
            )
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'rejected' ? 'bg-sky-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            رد شده (
            {requestsList.filter((r) => r.status === 'rejected').length.toLocaleString('fa-IR')}
            )
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">فیلتر دپارتمان:</span>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none"
          >
            <option value="all">همه دپارتمان‌ها</option>
            <option value="دپارتمان مراقبت‌های ویژه (ICU)">دپارتمان مراقبت‌های ویژه (ICU)</option>
            <option value="مدیریت اموال و موجودی">مدیریت اموال و موجودی</option>
            <option value="واحد مهندسی پزشکی">واحد مهندسی پزشکی</option>
            <option value="اورژانس">اورژانس</option>
            <option value="دیالیز">دیالیز</option>
          </select>
        </div>
      </div>

      {/* Requests Stream */}
      <div className="space-y-4">
        {filteredRequests.map((req) => {
          const isApproved = req.status === 'approved' || req.status === 'purchased';
          const isRejected = req.status === 'rejected';
          const isDirectFromAssetManager = req.requesterRoleKey === 'asset_manager' || req.totalStages === 3;
          const statusBadge = getStatusBadge(req.status);
          const eligibleToApprove = isUserEligibleToApprove(req);

          return (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5 hover:border-sky-300 transition-all"
            >
              {/* Request Top Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-800 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {req.requestNo.slice(-3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-black text-sm text-slate-900">
                        {req.requestNo} - {req.department}
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusBadge.className}`}
                      >
                        {statusBadge.label}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          req.urgency === 'critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : req.urgency === 'high'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.urgency === 'critical'
                          ? 'اورژانسی / بحرانی'
                          : req.urgency === 'high'
                          ? 'اولویت بالا'
                          : 'عادی'}
                      </span>
                      {isDirectFromAssetManager && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                          ثبت مستقیم مدیر اموال
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      متقاضی: <strong className="text-slate-800">{req.requesterName}</strong> ({req.requesterRole}) | تاریخ ثبت: {req.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">برآورد کل هزینه:</span>
                    <span className="font-black text-sm text-slate-900">
                      {(req.totalEstimate / 1000000).toLocaleString('fa-IR')} میلیون تومان
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenDetailModal(req)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      eligibleToApprove
                        ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {eligibleToApprove ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>اقدام و تأیید درخواست</span>
                      </>
                    ) : (
                      <>
                        <span>مشاهده جزئیات و تاریخچه</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Items Table & Reason */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="text-[11px] font-bold text-slate-700 block mb-2">
                    اقلام مورد نیاز در این درخواست:
                  </span>
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-slate-400 text-[10px] border-b border-slate-200/80 pb-1">
                        <th className="py-1">شرح کالا / قطعه</th>
                        <th className="py-1">تعداد</th>
                        <th className="py-1">قیمت تخمینی واحد (تومان)</th>
                        <th className="py-1">جمع (تومان)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {req.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 font-bold text-slate-800">{it.name}</td>
                          <td className="py-1.5">
                            {it.quantity} {it.unit}
                          </td>
                          <td className="py-1.5">
                            {(it.estimatedPrice / 1000000).toLocaleString('fa-IR')} م
                          </td>
                          <td className="py-1.5 font-bold text-slate-900">
                            {((it.quantity * it.estimatedPrice) / 1000000).toLocaleString('fa-IR')} م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100 space-y-1.5 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-500 block">توجیه و ضرورت خرید:</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {req.reason}
                  </p>
                </div>
              </div>

              {/* Approval Stepper (4 steps for general, 3 steps for direct asset_manager) */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>مراحل گردش تصویب سامانه:</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-600">
                    {isApproved
                      ? 'تکمیل ۱۰۰٪ مراحل'
                      : isRejected
                      ? 'متوقف در مرحله رد'
                      : isDirectFromAssetManager
                      ? `مرحله ${req.approvalStage} از ۳`
                      : `مرحله ${req.approvalStage} از ۴`}
                  </span>
                </div>

                {isDirectFromAssetManager ? (
                  // 3-Stage Stepper for Asset Manager Direct Request
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2.5 rounded-2xl font-bold border bg-emerald-50 border-emerald-200 text-emerald-800 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>۱. ثبت مستقیم مدیر اموال</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl font-bold border flex items-center justify-center gap-1 ${
                        req.status === 'pending_finance'
                          ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                          : req.status === 'pending_procurement' || isApproved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {req.status === 'pending_finance' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      {(req.status === 'pending_procurement' || isApproved) && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>۲. تأیید مسئول مالی</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl font-bold border flex items-center justify-center gap-1 ${
                        req.status === 'pending_procurement'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                          : isApproved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {req.status === 'pending_procurement' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>۳. تعیین سبد هوشمند خرید</span>
                    </div>
                  </div>
                ) : (
                  // 4-Stage Stepper for Standard/Operational Requests
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="p-2.5 rounded-2xl font-bold border bg-emerald-50 border-emerald-200 text-emerald-800 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>۱. ثبت درخواست متقاضی</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl font-bold border flex items-center justify-center gap-1 ${
                        req.status === 'pending_asset_manager'
                          ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                          : req.status === 'pending_finance' || req.status === 'pending_procurement' || isApproved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {req.status === 'pending_asset_manager' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      {(req.status === 'pending_finance' || req.status === 'pending_procurement' || isApproved) && (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>۲. تأیید مدیر اموال و انبار</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl font-bold border flex items-center justify-center gap-1 ${
                        req.status === 'pending_finance'
                          ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                          : req.status === 'pending_procurement' || isApproved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {req.status === 'pending_finance' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      {(req.status === 'pending_procurement' || isApproved) && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>۳. تأیید مسئول مالی</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl font-bold border flex items-center justify-center gap-1 ${
                        req.status === 'pending_procurement'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                          : isApproved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {req.status === 'pending_procurement' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>۴. تعیین سبد هوشمند خرید</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Banner for approved or ready items */}
              {isApproved && (
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>این درخواست مراحل قانونی تصویب را گذرانده و در کارتابل سبد هوشمند خرید آماده تجمیع با سفارشات است.</span>
                  </div>
                  <button
                    onClick={() => setActivePage('smart_cart')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    <span>مشاهده در سبد خرید AI</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredRequests.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">درخواستی با فیلترهای انتخابی یافت نشد.</p>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">
                  ثبت فرم درخواست خرید جدید
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAssetManager ? (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 space-y-1">
                <span className="font-bold block">✨ ایجاد مستقیم به عنوان مدیر اموال و موجودی:</span>
                <p className="leading-relaxed">
                  درخواست شما مستقیماً به مرحله تأیید مالی ارسال خواهد شد و نیازی به بررسی اولیه اموال نخواهد داشت (فرآیند ۳ مرحله‌ای).
                </p>
              </div>
            ) : (
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl text-[11px] text-sky-900 space-y-1">
                <span className="font-bold block">📋 فرآیند درخواست کاربران مجاز:</span>
                <p className="leading-relaxed">
                  ثبت توسط کاربر عملیاتی، کارشناس تجهیزات پزشکی، مدیر اموال یا اعضای کارگروه اموال انجام شده و جهت بررسی کسری انبار به کارتابل مدیر اموال ارسال می‌گردد.
                </p>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const reqDept = (form.elements.namedItem('department') as HTMLSelectElement).value;
                const reqName = (form.elements.namedItem('requesterName') as HTMLInputElement).value;
                const reqReason = (form.elements.namedItem('reason') as HTMLTextAreaElement).value;
                const reqUrgency = (form.elements.namedItem('urgency') as HTMLSelectElement).value as any;
                const itemName = (form.elements.namedItem('itemName') as HTMLInputElement).value;
                const itemQty = Number((form.elements.namedItem('itemQty') as HTMLInputElement).value) || 1;
                const itemPrice = Number((form.elements.namedItem('itemPrice') as HTMLInputElement).value) || 10000000;

                const isDirectAsset = isAssetManager;

                const newReq: PurchaseRequest = {
                  id: `pr-${Date.now()}`,
                  requestNo: `PR-1405-${Math.floor(100 + Math.random() * 900)}`,
                  department: reqDept,
                  requesterName: reqName,
                  requesterRole: isAssetManager ? 'مدیر اموال و موجودی' : currentUser?.roleFa || 'متقاضی بخش',
                  requesterRoleKey: currentUser?.role || 'nurse_operator',
                  urgency: reqUrgency,
                  date: '۱۴۰۵/۰۵/۲۰',
                  reason: reqReason,
                  items: [
                    {
                      name: itemName,
                      quantity: itemQty,
                      unit: 'عدد',
                      estimatedPrice: itemPrice,
                    },
                  ],
                  totalEstimate: itemQty * itemPrice,
                  status: isDirectAsset ? 'pending_finance' : 'pending_asset_manager',
                  approvalStage: isDirectAsset ? 2 : 1,
                  totalStages: isDirectAsset ? 3 : 4,
                  comments: [
                    {
                      user: reqName,
                      role: currentUser?.roleFa || 'متقاضی',
                      text: isDirectAsset
                        ? 'ثبت مستقیم توسط مدیر اموال و ارسال جهت تأمین اعتبار مالی'
                        : 'ثبت اولیه درخواست و ارسال به مدیر اموال و موجودی',
                      date: 'امروز - هم‌اکنون',
                      action: isDirectAsset ? 'ثبت مستقیم مدیر اموال' : 'ثبت درخواست',
                    },
                  ],
                };

                onCreateRequest(newReq);
                setShowCreateModal(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">دپارتمان متقاضی:</label>
                  <select
                    name="department"
                    defaultValue={currentUser?.department || 'دپارتمان مراقبت‌های ویژه (ICU)'}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-400 font-medium"
                  >
                    <option value="دپارتمان مراقبت‌های ویژه (ICU)">دپارتمان مراقبت‌های ویژه (ICU)</option>
                    <option value="مدیریت اموال و موجودی">مدیریت اموال و موجودی</option>
                    <option value="واحد مهندسی پزشکی">واحد مهندسی پزشکی</option>
                    <option value="اورژانس">اورژانس</option>
                    <option value="اتاق عمل ۱">اتاق عمل ۱</option>
                    <option value="دیالیز">دیالیز</option>
                    <option value="بخش قلب">بخش قلب</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">سطح فوریت بالینی/فنی:</label>
                  <select
                    name="urgency"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-400 font-medium"
                  >
                    <option value="critical">بحرانی / فوری</option>
                    <option value="high">اولویت بالا</option>
                    <option value="normal">عادی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">نام ثبت‌کننده درخواست:</label>
                <input
                  required
                  name="requesterName"
                  defaultValue={currentUser?.name || 'نسرین کریمی'}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-400 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">دلیل و ضرورت تامین کالا:</label>
                <textarea
                  required
                  name="reason"
                  rows={2}
                  placeholder="کسری انبار، افزایش ظرفیت بیماران یا تعویض قطعه مستهلک..."
                  defaultValue="تأمین فیلترها و مدار مصرفی ضروری جهت حفظ ظرفیت عملیاتی تخت‌های ویژه"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-400 font-medium"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <span className="font-extrabold text-slate-800 block">مشخصات و قیمت قلم اصلی:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-[10px] text-slate-400 block mb-0.5">نام کالا/قطعه</label>
                    <input
                      required
                      name="itemName"
                      placeholder="نام کالا"
                      defaultValue="فیلتر HME آنتی‌باکتریال"
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">تعداد مورد نیاز</label>
                    <input
                      type="number"
                      required
                      name="itemQty"
                      placeholder="تعداد"
                      defaultValue={100}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">قیمت واحد (تومان)</label>
                    <input
                      type="number"
                      required
                      name="itemPrice"
                      placeholder="قیمت واحد"
                      defaultValue={450000}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ثبت و ارسال به گردش کار</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Request Audit & Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">
                  بررسی جزئیات و تصمیم‌گیری ({selectedRequest.requestNo})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Status Header */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">وضعیت کنونی:</span>
                  <span className="font-bold text-slate-800">{getStatusBadge(selectedRequest.status).label}</span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block font-medium">مجموع برآورد:</span>
                  <span className="font-black text-slate-900 text-sm">
                    {(selectedRequest.totalEstimate / 1000000).toLocaleString('fa-IR')} میلیون تومان
                  </span>
                </div>
              </div>

              {/* History & Comments Audit */}
              <div className="space-y-1.5">
                <span className="font-extrabold text-slate-800 block">سوابق گردش کار و امضاهای دیجیتال:</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedRequest.comments.map((c, i) => (
                    <div key={i} className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex justify-between font-extrabold text-slate-800 text-[11px]">
                        <span>{c.user} <span className="text-slate-500 font-medium">({c.role})</span></span>
                        <span className="text-[10px] text-slate-400 font-normal">{c.date}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium text-[11px]">{c.text}</p>
                      <div className="text-[9px] text-sky-700 font-bold text-left pt-0.5">
                        اقدام: {c.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Box if Eligible */}
              {isUserEligibleToApprove(selectedRequest) ? (
                <div className="p-4 bg-sky-50/80 border border-sky-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-sky-950 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>
                      {selectedRequest.status === 'pending_asset_manager'
                        ? 'بررسی و صدور تأییدیه مدیر اموال و موجودی انبار:'
                        : selectedRequest.status === 'pending_finance'
                        ? 'تأیید ردیف بودجه و صدور مجوز مالی:'
                        : 'تعیین سبد هوشمند خرید توسط کارشناس تدارکات:'}
                    </span>
                  </div>

                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    rows={2}
                    placeholder={
                      selectedRequest.status === 'pending_asset_manager'
                        ? 'عدم وجود موجودی در انبار مرکزی تأیید گردید و جهت تأمین اعتبار ارجاع شد...'
                        : selectedRequest.status === 'pending_finance'
                        ? 'تأمین اعتبار از ردیف بودجه سالانه بیمارستان مصوب گردید...'
                        : 'تخصیص به سبد خرید استعلام قیمت و سفارش‌گذاری...'
                    }
                    className="w-full p-2.5 rounded-xl bg-white border border-sky-200 text-slate-800 text-xs focus:outline-none focus:border-sky-500 font-medium"
                  />

                  <div className="flex justify-between items-center pt-1">
                    <button
                      onClick={() => {
                        onRejectRequest(
                          selectedRequest.id,
                          approvalComment || 'عدم ضرورت فنی، انطباق با موجودی انبار یا محدودیت بودجه'
                        );
                        setSelectedRequest(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold transition-colors cursor-pointer"
                    >
                      رد درخواست
                    </button>

                    <button
                      onClick={() => {
                        const defaultComment =
                          selectedRequest.status === 'pending_asset_manager'
                            ? 'بررسی شد؛ عدم وجود در انبار تأیید گردید و به امور مالی ارسال شد.'
                            : selectedRequest.status === 'pending_finance'
                            ? 'تأمین اعتبار مالی تصویب شد و جهت تعیین سبد به تدارکات ارجاع گردید.'
                            : 'سبد خرید هوشمند مشخص گردید و فرآیند خرید نهایی شد.';

                        onApproveStage(selectedRequest.id, approvalComment || defaultComment);
                        setSelectedRequest(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تأیید و ارجاع به مرحله بعد</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {isDeptHead
                      ? '📌 دید مدیریتی: نظارت کامل بر درخواست‌های خرید دپارتمان بدون نیاز به امضای دستی'
                      : isHospitalAdmin
                      ? 'دسترسی مشاهده نظارتی ادمین بیمارستان'
                      : 'این درخواست در این مرحله نیازمند اقدام شما نیست.'}
                  </span>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    بستن پنجره
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
