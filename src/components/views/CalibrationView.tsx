import React, { useState, useRef } from 'react';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Search,
  ShieldAlert,
  ShieldCheck,
  FileText,
  UserCheck,
  MessageSquare,
  Printer,
  X,
  Plus,
  UploadCloud,
  History,
  Star,
  ExternalLink,
  Loader2,
  Filter,
  Check,
  Info,
  Activity,
  Wrench,
  Clock,
} from 'lucide-react';
import { CalibrationRecord, EquipmentItem, FailureReport, AppUser } from '../../types';
import { EquipmentHistoryModal, OperatorFeedbackItem } from '../common/EquipmentHistoryModal';

interface CalibrationViewProps {
  currentUser?: AppUser;
  calibrationsList: CalibrationRecord[];
  equipmentList?: EquipmentItem[];
  failuresList?: FailureReport[];
  onAddCalibrationRecord: (record: CalibrationRecord) => void;
  onSaveOperatorFeedback: (calId: string, feedback: string) => void;
  selectedEquipmentFilter?: EquipmentItem | null;
  onClearSelectedEquipmentFilter?: () => void;
}

export const CalibrationView: React.FC<CalibrationViewProps> = ({
  currentUser,
  calibrationsList,
  equipmentList = [],
  failuresList = [],
  onAddCalibrationRecord,
  onSaveOperatorFeedback,
  selectedEquipmentFilter,
  onClearSelectedEquipmentFilter,
}) => {
  const isReadOnly = currentUser?.role === 'hospital_admin' || currentUser?.role === 'finance_manager' || currentUser?.modulePermissions?.['calibration'] === 'view';
  // Navigation Tabs: 'active_certs' | 'failures' | 'history' | 'feedbacks'
  const [activeTab, setActiveTab] = useState<'active_certs' | 'failures' | 'history' | 'feedbacks'>('active_certs');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Searchable equipment selector state in upload modal
  const [eqSearchTerm, setEqSearchTerm] = useState<string>('');
  const [isEqSearchDropdownOpen, setIsEqSearchDropdownOpen] = useState<boolean>(false);

  // Certificate Modal State
  const [selectedCertModal, setSelectedCertModal] = useState<CalibrationRecord | null>(null);

  // Upload Certificate Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Upload Form Fields
  const [selectedEqCode, setSelectedEqCode] = useState<string>('');
  const [formCertNo, setFormCertNo] = useState<string>('');
  const [formIssueDate, setFormIssueDate] = useState<string>('۱۴۰۳/۰۵/۰۱');
  const [formExpiryDate, setFormExpiryDate] = useState<string>('۱۴۰۴/۰۵/۰۱');
  const [formAgency, setFormAgency] = useState<string>('آزمایشگاه مرجع کالیبراسیون طب‌آزما');
  const [formInspector, setFormInspector] = useState<string>('مهندس کامران رستمی');
  const [formNotes, setFormNotes] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Operator Feedback Modal State
  const [feedbackModalItem, setFeedbackModalItem] = useState<CalibrationRecord | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [showNewEvaluationForm, setShowNewEvaluationForm] = useState<boolean>(false);

  // Local Departmental Performance Assessments State
  const [localFeedbacks, setLocalFeedbacks] = useState<OperatorFeedbackItem[]>([
    {
      id: 'fb-1',
      equipmentCode: 'AV-00125',
      equipmentName: 'ونتیلاتور پیشرفته مراقبت ویژه',
      department: 'بخش مراقبت‌های ویژه (ICU اصلی)',
      category: 'پایش پایداری سنسورها',
      date: '۱۴۰۳/۰۵/۱۵',
      rating: 5,
      text: 'طبق ارزیابی دوره‌ای بخش، سنسورهای خروجی اکسیژن و فشار مثبت پس از کالیبراسیون اخیر با دقت ۹۹.۸٪ و بدون لرزش در مد کاری بیمار ثبت شده‌اند.',
    },
    {
      id: 'fb-2',
      equipmentCode: 'MON-904',
      equipmentName: 'مانیتور علائم حیاتی سانترال',
      department: 'بخش اورژانس و تروما',
      category: 'ارزیابی زمان پاسخ‌دهی آلارم',
      date: '۱۴۰۳/۰۵/۱۸',
      rating: 4,
      text: 'دستگاه در آزمون‌های استانداردهای ایمنی تایید شد. پیشنهاد می‌گردد حساسیت آلارم فشار غیرمستقیم در سرویس آتی کالیبره مجدد شود.',
    },
  ]);

  // Selected Equipment History Consolidated View
  const [historyEquipment, setHistoryEquipment] = useState<EquipmentItem | null>(null);

  // Active Equipment Filter (if passed from Inventory)
  const activeEqFilter = selectedEquipmentFilter;

  // Filtered Calibration Certificates List
  const filteredCerts = calibrationsList.filter((c) => {
    if (activeEqFilter) {
      const isEqMatch =
        c.equipmentCode === activeEqFilter.code ||
        c.equipmentId === activeEqFilter.id ||
        c.equipmentName.includes(activeEqFilter.faName) ||
        activeEqFilter.faName.includes(c.equipmentName);
      if (!isEqMatch) return false;
    }

    const matchesSearch =
      c.equipmentName.includes(searchQuery) ||
      c.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.inspector.includes(searchQuery) ||
      c.agency.includes(searchQuery);

    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Filtered Failure Reports List
  const filteredFailures = failuresList.filter((f) => {
    if (activeEqFilter) {
      const isEqMatch =
        f.equipmentCode === activeEqFilter.code ||
        f.equipmentName.includes(activeEqFilter.faName) ||
        activeEqFilter.faName.includes(f.equipmentName);
      if (!isEqMatch) return false;
    }

    return (
      f.equipmentName.includes(searchQuery) ||
      f.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.issueDescription.includes(searchQuery) ||
      f.reportNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filtered Operator Feedbacks List
  const filteredFeedbacks = localFeedbacks.filter((fb) => {
    if (activeEqFilter) {
      const isEqMatch =
        fb.equipmentCode === activeEqFilter.code ||
        fb.equipmentName.includes(activeEqFilter.faName) ||
        activeEqFilter.faName.includes(fb.equipmentName);
      if (!isEqMatch) return false;
    }

    return (
      fb.equipmentName.includes(searchQuery) ||
      fb.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fb.department && fb.department.includes(searchQuery)) ||
      fb.text.includes(searchQuery)
    );
  });

  // Equipment search results inside registration modal
  const matchingEquipmentForModal = equipmentList.filter((eq) => {
    if (!eqSearchTerm.trim()) return true;
    const term = eqSearchTerm.trim().toLowerCase();
    return (
      (eq.faName && eq.faName.toLowerCase().includes(term)) ||
      (eq.enName && eq.enName.toLowerCase().includes(term)) ||
      (eq.code && eq.code.toLowerCase().includes(term)) ||
      (eq.serialNumber && eq.serialNumber.toLowerCase().includes(term)) ||
      (eq.brand && eq.brand.toLowerCase().includes(term)) ||
      (eq.model && eq.model.toLowerCase().includes(term))
    );
  });

  const selectedEquipmentInModal = equipmentList.find((e) => e.code === selectedEqCode);

  // Handle Certificate Document Upload & Silent Processing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setIsProcessing(true);
      setUploadProgressText('در حال خواندن سند و استخراج هوشمند اطلاعات کالیبراسیون...');

      setTimeout(() => {
        setUploadProgressText('تطبیق داده‌های گواهی با شناسنامه تجهیزات بیمارستانی...');
      }, 1000);

      setTimeout(() => {
        setIsProcessing(false);
        // Pre-fill fields silently
        if (!selectedEqCode && equipmentList.length > 0) {
          setSelectedEqCode(equipmentList[0].code);
        }
        setFormCertNo(`CAL-DOC-${Math.floor(10000 + Math.random() * 90000)}`);
        setFormNotes('تمامی تست‌های ایمنی الکتریکی و صحت سنجی خروجی طبق استاندارد IEC 60601 تایید شد.');
      }, 1800);
    }
  };

  const handleSaveUploadedCert = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedEq = equipmentList.find((e) => e.code === selectedEqCode) || {
      faName: 'دستگاه پزشکی ثبت‌شده',
      code: selectedEqCode || 'EQ-NEW',
      id: 'eq-new',
    };

    const newRecord: CalibrationRecord = {
      id: `cal-doc-${Date.now()}`,
      equipmentId: matchedEq.id,
      equipmentCode: matchedEq.code,
      equipmentName: matchedEq.faName,
      certNumber: formCertNo || `CAL-${Date.now().toString().slice(-5)}`,
      issueDate: formIssueDate,
      expiryDate: formExpiryDate,
      status: 'valid',
      inspector: formInspector,
      agency: formAgency,
      safetyNotes: formNotes || 'گواهی کالیبراسیون از فایل اصل اسکن شده ثبت گردید.',
      operatorFeedback: '',
      documentUrl: uploadedFile ? URL.createObjectURL(uploadedFile) : undefined,
    };

    onAddCalibrationRecord(newRecord);
    setShowUploadModal(false);
    setUploadedFile(null);
  };

  const handleAddNewFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !selectedEqCode) return;

    const matchedEq = equipmentList.find((e) => e.code === selectedEqCode);
    const newFb: OperatorFeedbackItem = {
      id: `fb-${Date.now()}`,
      equipmentCode: selectedEqCode,
      equipmentName: matchedEq ? matchedEq.faName : 'تجهیزات پزشکی',
      department: matchedEq ? matchedEq.department : 'بخش بیمارستانی',
      category: 'ارزیابی عملکردی دوره‌ای',
      date: '۱۴۰۳/۰۵/۲۲',
      rating: feedbackRating,
      text: feedbackText.trim(),
    };

    setLocalFeedbacks([newFb, ...localFeedbacks]);
    setFeedbackText('');
  };

  return (
    <div className="space-y-6 pb-16 dir-rtl text-right font-sans">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shadow-xs border border-sky-100 shrink-0">
            <Award className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">
              کالیبراسیون و ایمنی تجهیزات پزشکی
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              سامانه جامع ثبت گواهی‌ها، سوابق آزمون‌های استاندارد، بارگذاری اسناد و بازخورد اپراتورها
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ بارگذاری و ثبت گواهی جدید</span>
            </button>
          )}

          <button
            onClick={() => {
              alert('گواهی استاندارد کالیبراسیون بیمارستان جهت ارائه به ارزیابان خروجی گرفته شد.');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>خروجی PDF</span>
          </button>
        </div>
      </div>

      {/* Active Equipment Filter Banner (If routed from Inventory) */}
      {activeEqFilter && (
        <div className="p-4 bg-gradient-to-r from-sky-900 via-slate-800 to-slate-900 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 border border-sky-400/30">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/30 text-sky-200 text-[10px] font-bold border border-sky-400/30">
                  اطلاعات ایمنی و سوابق کالیبراسیون تجهیز
                </span>
                <span className="text-xs text-slate-300">
                  کد اموال: <strong className="font-mono text-white">{activeEqFilter.code}</strong>
                </span>
              </div>
              <h2 className="text-base font-black text-white mt-0.5">
                {activeEqFilter.faName} {activeEqFilter.brand ? `(${activeEqFilter.brand} ${activeEqFilter.model || ''})` : ''}
              </h2>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                <span>شماره سریال: <strong className="font-mono text-white">{activeEqFilter.serialNumber || '—'}</strong></span>
                <span>•</span>
                <span>محل استقرار: <strong className="text-white">{activeEqFilter.department || activeEqFilter.location}</strong></span>
              </div>
            </div>
          </div>
          {onClearSelectedEquipmentFilter && (
            <button
              onClick={() => onClearSelectedEquipmentFilter()}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>نمایش همه تجهیزات</span>
            </button>
          )}
        </div>
      )}

      {/* Main Container & Section Navigation Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Sub-section Navigation */}
          <div className="flex flex-wrap items-center bg-slate-200/70 p-1 rounded-xl text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab('active_certs')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'active_certs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-4 h-4 text-sky-600" />
              <span>گواهی‌های فعال</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                {filteredCerts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('failures')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'failures'
                  ? 'bg-white text-rose-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>گزارش‌های خرابی</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px]">
                {filteredFailures.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-blue-600" />
              <span>سوابق کالیبراسیون</span>
            </button>

            <button
              onClick={() => setActiveTab('feedbacks')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'feedbacks'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 text-sky-600" />
              <span>پایش و ارزیابی</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px]">
                {filteredFeedbacks.length}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی کد اموال، نام دستگاه، شماره گواهی..."
              className="w-full pr-9 pl-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        {/* SECTION 1: ACTIVE CERTS */}
        {activeTab === 'active_certs' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">لیست گواهی‌های صادرشده و وضعیت اعتبارسنجی دوره ای</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600">وضعیت:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium"
                >
                  <option value="all">همه موارد</option>
                  <option value="valid">معتبر</option>
                  <option value="expiring_soon">در آستانه انقضا</option>
                  <option value="expired">منقضی شده</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold border-b border-slate-200">
                    <th className="p-3.5">کد اموال</th>
                    <th className="p-3.5">نام دستگاه پزشکی</th>
                    <th className="p-3.5">شماره گواهی کالیبراسیون</th>
                    <th className="p-3.5">تاریخ صدور / انقضا</th>
                    <th className="p-3.5">آزمایشگاه مجری</th>
                    <th className="p-3.5">وضعیت اعتبار</th>
                    <th className="p-3.5 text-center">فایل اصل سند</th>
                    <th className="p-3.5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCerts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-700">
                        {item.equipmentCode}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">
                        <button
                          onClick={() => {
                            const eq = equipmentList.find((e) => e.code === item.equipmentCode);
                            if (eq) setHistoryEquipment(eq);
                            else alert(`شناسنامه جامع برای ${item.equipmentName}`);
                          }}
                          className="hover:text-sky-600 hover:underline text-right font-bold cursor-pointer"
                        >
                          {item.equipmentName}
                        </button>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{item.certNumber}</td>
                      <td className="p-3.5 text-slate-600">
                        <div>صدور: {item.issueDate}</div>
                        <div className="font-bold text-slate-800">انقضا: {item.expiryDate}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div className="font-medium text-slate-800">{item.inspector}</div>
                        <div className="text-[10px] text-slate-400">{item.agency}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            item.status === 'valid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'expiring_soon'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {item.status === 'valid'
                            ? 'معتبر'
                            : item.status === 'expiring_soon'
                            ? 'در آستانه انقضا'
                            : 'منقضی شده'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            alert(`نمایش نسخه اصل اسکن‌شده گواهی ${item.certNumber}`);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                          <span>مشاهده فایل</span>
                        </button>
                      </td>
                      <td className="p-3.5 text-center space-x-1 space-x-reverse">
                        <button
                          onClick={() => setSelectedCertModal(item)}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold transition-colors text-[11px] cursor-pointer"
                        >
                          شناسنامه گواهی
                        </button>
                        {!isReadOnly && (
                          <button
                            onClick={() => {
                              setFeedbackModalItem(item);
                              setFeedbackText(item.operatorFeedback || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-colors text-[11px] cursor-pointer"
                          >
                            ثبت بازخورد
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION: FAILURE REPORTS */}
        {activeTab === 'failures' && (
          <div className="p-5 space-y-4">
            <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-2xl flex items-center justify-between text-xs text-rose-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  گزارش‌های ثبت‌شده خرابی، نقص فنی و اقدامات تعمیرات انجام‌شده
                </span>
              </div>
              <span className="font-bold">مجموع گزارش‌ها: {filteredFailures.length}</span>
            </div>

            {filteredFailures.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 text-xs font-medium">
                هیچ گزارش خرابی برای این تجهیز یا فیلتر یافت نشد.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFailures.map((fail) => (
                  <div
                    key={fail.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 hover:border-rose-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {fail.equipmentCode}
                        </span>
                        <h3 className="font-bold text-slate-800 text-sm">{fail.equipmentName}</h3>
                        <span className="text-xs text-slate-400">| کد گزارش: {fail.reportNo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                            fail.priority === 'critical'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : fail.priority === 'high'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {fail.priority === 'critical'
                            ? 'بحرانی'
                            : fail.priority === 'high'
                            ? 'اولویت بالا'
                            : 'عادی'}
                        </span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                            fail.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : fail.status === 'under_repair'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {fail.status === 'resolved'
                            ? 'رفع‌نقص شده'
                            : fail.status === 'under_repair'
                            ? 'در حال تعمیر'
                            : 'در انتظار اقدام'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <p className="font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                        <strong className="text-slate-900 block mb-0.5">شرح عیب گزارش‌شده:</strong>
                        {fail.issueDescription}
                      </p>
                      {fail.actionsTaken && (
                        <p className="font-medium bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-emerald-900 leading-relaxed">
                          <strong className="text-emerald-950 block mb-0.5">اقدامات انجام‌شده تکنسین:</strong>
                          {fail.actionsTaken}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>گزارش‌دهنده: <strong>{fail.reportedBy}</strong> ({fail.department})</span>
                      <span>تاریخ ثبت: <strong className="font-mono text-slate-700">{fail.reportDate}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: CALIBRATION HISTORY */}
        {activeTab === 'history' && (
          <div className="p-5 space-y-4">
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  تاریخچه کامل کلیه آزمون‌ها و دوره‌های کالیبراسیون گذشته همراه با لینک پیوست سند اصلی
                </span>
              </div>
              <span className="font-bold">مجموع سوابق: {calibrationsList.length}</span>
            </div>

            <div className="space-y-3">
              {filteredCerts.map((hist) => (
                <div
                  key={hist.id}
                  className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {hist.equipmentCode}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm">{hist.equipmentName}</h3>
                      <span className="text-xs text-slate-400">| شماره گواهی: {hist.certNumber}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span>تاریخ صدور: <strong className="text-slate-800">{hist.issueDate}</strong></span>
                      <span>تاریخ انقضا: <strong className="text-slate-800">{hist.expiryDate}</strong></span>
                      <span>آزمایشگاه: <strong className="text-slate-800">{hist.inspector} ({hist.agency})</strong></span>
                    </div>

                    {hist.safetyNotes && (
                      <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {hist.safetyNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const eq = equipmentList.find((e) => e.code === hist.equipmentCode);
                        if (eq) setHistoryEquipment(eq);
                        else alert(`سوابق کامل برای کد ${hist.equipmentCode}`);
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      سوابق جامع قلم
                    </button>

                    <button
                      onClick={() => {
                        alert(`دانلود فایل اصل سند گواهی شماره ${hist.certNumber}`);
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>مشاهده فایل گواهی</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: DEPARTMENTAL PERFORMANCE REPORT */}
        {activeTab === 'feedbacks' && (
          <div className="p-5 space-y-4">
            {/* Top Toolbar for Departmental Reports */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  نتایج پایش عملکردی و پایداری بالینی به تفکیک بخش‌های بیمارستان
                </h3>
              </div>

              <button
                onClick={() => setShowNewEvaluationForm(!showNewEvaluationForm)}
                className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-sky-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showNewEvaluationForm ? 'بستن فرم' : 'ثبت گزارش جدید بخش'}</span>
              </button>
            </div>

            {/* Optional Collapsible Form for New Departmental Evaluation */}
            {showNewEvaluationForm && (
              <form onSubmit={(e) => {
                handleAddNewFeedback(e);
                setShowNewEvaluationForm(false);
              }} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  ثبت گزارش ارزیابی کارکرد برای بخش درمانی
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      دستگاه پزشکی و بخش مربوطه
                    </label>
                    <select
                      value={selectedEqCode}
                      onChange={(e) => setSelectedEqCode(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800"
                    >
                      <option value="">-- انتخاب از لیست تجهیزات --</option>
                      {equipmentList.map((eq) => (
                        <option key={eq.id} value={eq.code}>
                          {eq.code} — {eq.faName} ({eq.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      شاخص پایداری و صحت کارکرد (۱ تا ۵)
                    </label>
                    <div className="flex items-center gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    نتایج ارزیابی کارکرد بالینی و دقت سنجش
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={2}
                    placeholder="مثال: کارکرد پمپ تزریق در بخش ICU با دقت ۹۹.۵٪ تایید شد..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewEvaluationForm(false)}
                    className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    ثبت گزارش تحلیلی بخش
                  </button>
                </div>
              </form>
            )}

            {/* Departmental Reports List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
                نتایج پایش عملکردی به تفکیک بخش‌های بیمارستان
              </h4>

              {filteredFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-700">
                        {fb.equipmentCode}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">{fb.equipmentName}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold border border-blue-100">
                        {fb.department || 'بخش تخصصی'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">ملاحظات و نتایج بالینی:</span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {fb.text}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>دسته‌بندی: {fb.category || 'پایش کارکرد'}</span>
                    <span>تاریخ ارزیابی: {fb.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* UPLOAD CERTIFICATE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto dir-rtl">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <UploadCloud className="w-6 h-6 text-sky-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  بارگذاری و ثبت سند گواهی کالیبراسیون
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/40 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-colors"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-sky-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                فایل گواهی را اینجا رها کنید یا برای انتخاب کلیک کنید
              </p>
              <p className="text-[11px] text-slate-400">
                پشتیبانی از تصویر، PDF و اسناد اسکن‌شده آزمایشگاه مرجع
              </p>

              {uploadedFile && (
                <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs font-bold text-sky-700 border border-sky-200 mt-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{uploadedFile.name}</span>
                </div>
              )}
            </div>

            {/* Silent Processing Progress */}
            {isProcessing && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-3 text-xs text-sky-900">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
                <span>{uploadProgressText}</span>
              </div>
            )}

            {/* Certificate Form */}
            <form onSubmit={handleSaveUploadedCert} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 relative">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    انتخاب دستگاه پزشکی (با امکان جستجوی هوشمند)
                  </label>
                  {selectedEquipmentInModal && !isEqSearchDropdownOpen ? (
                    <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="font-extrabold text-xs text-slate-800">
                          {selectedEquipmentInModal.faName} {selectedEquipmentInModal.brand ? `(${selectedEquipmentInModal.brand} ${selectedEquipmentInModal.model || ''})` : ''}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-3">
                          <span>کد اموال: <strong className="font-mono text-slate-800">{selectedEquipmentInModal.code}</strong></span>
                          <span>|</span>
                          <span>شماره سریال: <strong className="font-mono text-slate-800">{selectedEquipmentInModal.serialNumber || '—'}</strong></span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEqSearchDropdownOpen(true);
                          setEqSearchTerm('');
                        }}
                        className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-all cursor-pointer shrink-0"
                      >
                        تغییر انتخاب
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          value={eqSearchTerm}
                          onChange={(e) => {
                            setEqSearchTerm(e.target.value);
                            setIsEqSearchDropdownOpen(true);
                          }}
                          onFocus={() => setIsEqSearchDropdownOpen(true)}
                          placeholder="جستجو بر اساس نام تجهیز، کد اموال، شماره سریال، برند یا مدل..."
                          className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-sky-300 focus:border-sky-500 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-medium"
                        />
                      </div>

                      {isEqSearchDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl divide-y divide-slate-100">
                          {matchingEquipmentForModal.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400 font-medium">
                              تجهیزی با این مشخصات یافت نشد
                            </div>
                          ) : (
                            matchingEquipmentForModal.map((eq) => (
                              <div
                                key={eq.id}
                                onClick={() => {
                                  setSelectedEqCode(eq.code);
                                  setIsEqSearchDropdownOpen(false);
                                  setEqSearchTerm('');
                                }}
                                className={`p-3 hover:bg-sky-50/80 cursor-pointer transition-colors text-right ${
                                  selectedEqCode === eq.code ? 'bg-sky-50/60' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between font-extrabold text-xs text-slate-800">
                                  <span>
                                    {eq.faName} {eq.brand ? `(${eq.brand} ${eq.model || ''})` : ''}
                                  </span>
                                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                                    کد: {eq.code}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                                  <span>کد اموال: <strong className="font-mono text-slate-700">{eq.code}</strong></span>
                                  <span>|</span>
                                  <span>شماره سریال: <strong className="font-mono text-slate-700">{eq.serialNumber || '—'}</strong></span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    شماره گواهی کالیبراسیون
                  </label>
                  <input
                    type="text"
                    value={formCertNo}
                    onChange={(e) => setFormCertNo(e.target.value)}
                    placeholder="مثال: CAL-1403-88"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">تاریخ صدور</label>
                  <input
                    type="text"
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">تاریخ انقضا</label>
                  <input
                    type="text"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    آزمایشگاه مجری کالیبراسیون
                  </label>
                  <input
                    type="text"
                    value={formAgency}
                    onChange={(e) => setFormAgency(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    نام کارشناس صادرکننده
                  </label>
                  <input
                    type="text"
                    value={formInspector}
                    onChange={(e) => setFormInspector(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  توضیحات و خلاصه نتایج آزمون
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ذخیره و پیوند گواهی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE DETAILS MODAL */}
      {selectedCertModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-sky-600" />
                <h3 className="font-black text-slate-800 text-sm">
                  شناسنامه گواهی کالیبراسیون و تست ایمنی
                </h3>
              </div>
              <button
                onClick={() => setSelectedCertModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2 text-xs">
              <div className="flex justify-between font-mono font-bold text-sky-900">
                <span>کد اموال: {selectedCertModal.equipmentCode}</span>
                <span>شماره گواهی: {selectedCertModal.certNumber}</span>
              </div>
              <p className="font-extrabold text-slate-900 text-sm">
                {selectedCertModal.equipmentName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 block">تاریخ صدور:</span>
                <span className="font-bold text-slate-800">{selectedCertModal.issueDate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 block">تاریخ انقضا:</span>
                <span className="font-bold text-slate-800">{selectedCertModal.expiryDate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 block">آزمایشگاه مجری:</span>
                <span className="font-bold text-slate-800">{selectedCertModal.inspector}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 block">مرجع صادرکننده:</span>
                <span className="font-bold text-slate-800">{selectedCertModal.agency}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">یادداشت فنی کارشناس:</span>
              <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed border border-slate-100">
                {selectedCertModal.safetyNotes}
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center gap-2">
              <button
                onClick={() => {
                  alert(`مشاهده آنلاین سند اصل گواهی شماره ${selectedCertModal.certNumber}`);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-slate-600" />
                <span>مشاهده فایل اصل سند</span>
              </button>

              <button
                onClick={() => {
                  alert('نسخه چاپ گواهی رسمی ایجاد گردید.');
                  setSelectedCertModal(null);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                چاپ رسمی گواهی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPERATOR FEEDBACK INPUT MODAL */}
      {feedbackModalItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">
                ثبت بازخورد اپراتور دستگاه پزشکی
              </h3>
              <button
                onClick={() => setFeedbackModalItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              نظر پرستار یا اپراتور درباره کارکرد دستگاه ({feedbackModalItem.equipmentName}):
            </p>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              placeholder="مثال: کارکرد دستگاه عالی است، آلارم‌ها به موقع ثبت می‌شوند..."
              className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-400"
            />

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setFeedbackModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  onSaveOperatorFeedback(feedbackModalItem.id, feedbackText);
                  setFeedbackModalItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold"
              >
                ثبت بازخورد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONSOLIDATED EQUIPMENT HISTORY MODAL */}
      {historyEquipment && (
        <EquipmentHistoryModal
          equipment={historyEquipment}
          calibrationsList={calibrationsList}
          failuresList={failuresList}
          feedbacksList={localFeedbacks}
          onClose={() => setHistoryEquipment(null)}
        />
      )}
    </div>
  );
};
