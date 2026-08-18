import React, { useState } from 'react';
import {
  X,
  History,
  AlertTriangle,
  Award,
  MessageSquare,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Star,
  ExternalLink,
  ShieldCheck,
  Building,
  Activity,
} from 'lucide-react';
import { EquipmentItem, CalibrationRecord, FailureReport } from '../../types';

export interface OperatorFeedbackItem {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  department: string;
  category: string;
  date: string;
  rating: number;
  text: string;
}

interface EquipmentHistoryModalProps {
  equipment: EquipmentItem | null;
  calibrationsList: CalibrationRecord[];
  failuresList: FailureReport[];
  feedbacksList?: OperatorFeedbackItem[];
  onClose: () => void;
}

export const EquipmentHistoryModal: React.FC<EquipmentHistoryModalProps> = ({
  equipment,
  calibrationsList,
  failuresList,
  feedbacksList = [],
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'calibrations' | 'failures' | 'feedbacks'>('calibrations');

  if (!equipment) return null;

  // Filter records specifically for this equipment
  const matchedCalibrations = calibrationsList.filter(
    (c) =>
      c.equipmentCode.toLowerCase() === equipment.code.toLowerCase() ||
      c.equipmentId === equipment.id ||
      c.equipmentName.includes(equipment.faName)
  );

  const matchedFailures = failuresList.filter(
    (f) =>
      f.equipmentCode.toLowerCase() === equipment.code.toLowerCase() ||
      f.equipmentName.includes(equipment.faName)
  );

  const matchedFeedbacks = feedbacksList.filter(
    (fb) =>
      fb.equipmentCode.toLowerCase() === equipment.code.toLowerCase() ||
      fb.equipmentName.includes(equipment.faName)
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl my-8 overflow-hidden dir-rtl">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <History className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                  {equipment.code}
                </span>
                <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                  {equipment.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                شناسنامه و سوابق جامع — {equipment.faName}
              </h2>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                <span>برند: <strong className="text-white">{equipment.brand}</strong></span>
                <span>•</span>
                <span>مدل: <strong className="text-white">{equipment.model}</strong></span>
                <span>•</span>
                <span>محل استقرار: <strong className="text-white">{equipment.location || equipment.department}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calibrations')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'calibrations'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-4 h-4 text-sky-600" />
            <span>سوابق کالیبراسیون و آزمون‌ها</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {matchedCalibrations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('failures')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'failures'
                ? 'bg-white text-rose-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>گزارش‌های خرابی و تعمیرات</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {matchedFailures.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'feedbacks'
                ? 'bg-white text-amber-800 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>نظرات و بازخوردهای کاربران</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {matchedFeedbacks.length}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* TAB 1: CALIBRATIONS */}
          {activeTab === 'calibrations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>تمام آزمون‌های ایمنی، کالیبراسیون و گواهینامه‌های ثبت‌شده برای این قلم</span>
                <span className="font-bold text-slate-700">کل موارد: {matchedCalibrations.length}</span>
              </div>

              {matchedCalibrations.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Award className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">هیچ سابقه کالیبراسیونی برای این دستگاه ثبت نشده است.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedCalibrations.map((cal) => (
                    <div
                      key={cal.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-sky-300 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 bg-sky-50 text-sky-700 rounded-xl font-mono text-xs font-bold border border-sky-100">
                            شماره گواهی: {cal.certNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            صادرکننده: {cal.inspector}
                          </span>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                            cal.status === 'valid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : cal.status === 'expiring_soon'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {cal.status === 'valid' ? 'معتبر' : cal.status === 'expiring_soon' ? 'در آستانه انقضا' : 'منقضی‌شده'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px]">تاریخ صدور:</span>
                          <span className="font-bold text-slate-700">{cal.issueDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">تاریخ انقضا:</span>
                          <span className="font-bold text-slate-700">{cal.expiryDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">مرجع صادرکننده:</span>
                          <span className="font-bold text-slate-700">{cal.agency}</span>
                        </div>
                      </div>

                      {cal.safetyNotes && (
                        <p className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                          <strong className="text-slate-800">توضیحات کارشناس: </strong>
                          {cal.safetyNotes}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 text-xs">
                        {cal.operatorFeedback ? (
                          <div className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-[11px]">
                            بازخورد اپراتور: {cal.operatorFeedback}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">بدون بازخورد اپراتور</span>
                        )}

                        <button
                          onClick={() => {
                            alert(`مشاهده آنلاین نسخه اصل سند گواهی شماره ${cal.certNumber}`);
                          }}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>مشاهده فایل اصل گواهی</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FAILURES */}
          {activeTab === 'failures' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>سوابق خرابی، درخواست‌های تعمیر و اقدامات پشتیبانی انجام‌شده</span>
                <span className="font-bold text-slate-700">کل موارد: {matchedFailures.length}</span>
              </div>

              {matchedFailures.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">هیچ گزارش خرابی برای این قلم ثبت نشده است.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedFailures.map((fail) => (
                    <div
                      key={fail.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold">
                            کد گزارش: {fail.reportNo}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            گزارش‌دهنده: {fail.reporterName} ({fail.reporterRole})
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            fail.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : fail.status === 'in_repair'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {fail.status === 'resolved'
                            ? 'برطرف‌شده'
                            : fail.status === 'in_repair'
                            ? 'در حال تعمیر'
                            : 'در انتظار تعمیر'}
                        </span>
                      </div>

                      <div className="p-3 bg-rose-50/50 border border-rose-100/80 rounded-xl space-y-1">
                        <span className="text-[10px] text-rose-700 font-bold block">شرح اشکال/خرابی:</span>
                        <p className="text-xs text-slate-800 leading-relaxed">{fail.defectDescription}</p>
                      </div>

                      {fail.actionsTaken && (
                        <div className="p-3 bg-emerald-50/50 border border-emerald-100/80 rounded-xl space-y-1 text-xs">
                          <span className="text-[10px] text-emerald-700 font-bold block">اقدامات انجام‌شده توسط تکنسین:</span>
                          <p className="text-slate-800 leading-relaxed">{fail.actionsTaken}</p>
                          {fail.technicianAssigned && (
                            <p className="text-[10px] text-slate-500 pt-1">تکنسین مسئول: {fail.technicianAssigned}</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>تاریخ ثبت: {fail.reportDate}</span>
                        {fail.resolvedDate && <span>تاریخ رفع خرابی: {fail.resolvedDate}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PERFORMANCE ASSESSMENTS */}
          {activeTab === 'feedbacks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>ارزیابی کیفی، پایداری عملکردی و گزارش پایش بالینی بخش‌های بیمارستانی</span>
                <span className="font-bold text-slate-700">کل گزارش‌ها: {matchedFeedbacks.length}</span>
              </div>

              {matchedFeedbacks.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">هیچ گزارش ارزیابی برای این دستگاه ثبت نشده است.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedFeedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-sky-600" />
                          <span className="text-xs font-bold text-slate-800">
                            {fb.department || 'بخش تخصصی مربوطه'}
                          </span>
                          <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-semibold border border-sky-100">
                            {fb.category || 'پایش کارکرد'}
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

                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        {fb.text}
                      </p>

                      <div className="text-[10px] text-slate-400 text-left">
                        تاریخ ثبت ارزیابی: {fb.date}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            بستن شناسنامه
          </button>
        </div>
      </div>
    </div>
  );
};
