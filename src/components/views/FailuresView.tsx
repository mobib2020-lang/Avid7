import React, { useState } from 'react';
import {
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Plus,
  Clock,
  UserCheck,
  Building,
  ShieldAlert,
  FileText,
  X,
} from 'lucide-react';
import { FailureReport, EquipmentItem, AppUser } from '../../types';

interface FailuresViewProps {
  currentUser?: AppUser;
  failuresList: FailureReport[];
  equipmentList: EquipmentItem[];
  onReportFailure: (report: FailureReport) => void;
  onUpdateFailureStatus: (
    id: string,
    status: FailureReport['status'],
    actionsTaken?: string
  ) => void;
}

export const FailuresView: React.FC<FailuresViewProps> = ({
  currentUser,
  failuresList,
  equipmentList,
  onReportFailure,
  onUpdateFailureStatus,
}) => {
  const isReadOnly = currentUser?.role === 'hospital_admin' || currentUser?.role === 'finance_manager' || currentUser?.modulePermissions?.['failures'] === 'view';
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedFailure, setSelectedFailure] = useState<FailureReport | null>(null);
  const [actionNotesInput, setActionNotesInput] = useState('');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>گزارش خرابی‌ها و پیگیری تعمیرات تجهیزات</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ثبت عیوب کارکرد توسط اپراتور بخش، ارجاع هوشمند به تکنسین، پیگیری قطعات و فرآیند رفع نقص
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت گزارش خرابی جدید</span>
          </button>
        )}
      </div>

      {/* Failure Cards List */}
      <div className="space-y-4">
        {failuresList.map((fail) => {
          const isResolved = fail.status === 'resolved';
          return (
            <div
              key={fail.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      fail.priority === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : fail.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {fail.reportNo.slice(-3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-800">
                        {fail.equipmentName} ({fail.equipmentCode})
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          fail.priority === 'critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : fail.priority === 'high'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {fail.priority === 'critical'
                          ? 'بحرانی (اتاق عمل/ICU)'
                          : fail.priority === 'high'
                          ? 'اولویت بالا'
                          : 'عادی'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      بخش: <strong className="text-slate-700">{fail.department}</strong> | گزارش‌دهنده: {fail.reporterName} ({fail.reporterRole}) | تاریخ: {fail.reportDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedFailure(fail);
                      setActionNotesInput(fail.actionsTaken || '');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isReadOnly ? 'مشاهده جزئیات و اقدامات' : 'مدیریت و ثبت اقدامات'}
                  </button>
                </div>
              </div>

              {/* Problem Description */}
              <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 space-y-1 border border-slate-100">
                <span className="font-bold text-slate-900 block">شرح نقص فنی گزارش‌شده:</span>
                <p className="leading-relaxed">{fail.defectDescription}</p>
              </div>

              {/* Maintenance Progress Flow Bar */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  مراحل پیشرفت فنی و تعمیرات:
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  {/* Step 1 */}
                  <div
                    className={`p-2 rounded-xl font-bold border transition-all ${
                      fail.status === 'reported' || fail.status === 'assigned' || fail.status === 'in_repair' || fail.status === 'resolved'
                        ? 'bg-sky-50 border-sky-300 text-sky-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    ۱. ثبت اولیه
                  </div>
                  {/* Step 2 */}
                  <div
                    className={`p-2 rounded-xl font-bold border transition-all ${
                      fail.status === 'assigned' || fail.status === 'in_repair' || fail.status === 'resolved'
                        ? 'bg-sky-50 border-sky-300 text-sky-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    ۲. ارجاع به تکنسین
                  </div>
                  {/* Step 3 */}
                  <div
                    className={`p-2 rounded-xl font-bold border transition-all ${
                      fail.status === 'in_repair' || fail.status === 'resolved'
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    ۳. در حال تعمیر
                  </div>
                  {/* Step 4 */}
                  <div
                    className={`p-2 rounded-xl font-bold border transition-all ${
                      fail.status === 'resolved'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    ۴. برطرف‌شده و تست نهایی
                  </div>
                </div>
              </div>

              {fail.actionsTaken && (
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <span className="font-bold block">اقدامات انجام‌شده توسط تکنسین ({fail.technicianAssigned || 'کادر فنی'}):</span>
                  <p>{fail.actionsTaken}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Failure Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">
                ثبت فرم گزارش خرابی و نقص فنی
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const eqCode = (form.elements.namedItem('equipmentCode') as HTMLSelectElement).value;
                const selectedEq = equipmentList.find((e) => e.code === eqCode);

                const newReport: FailureReport = {
                  id: `fail-${Date.now()}`,
                  reportNo: `REP-1405-${Math.floor(100 + Math.random() * 900)}`,
                  equipmentCode: eqCode,
                  equipmentName: selectedEq?.faName || 'تجهیز بیمارستانی',
                  department: selectedEq?.department || 'اورژانس',
                  priority: (form.elements.namedItem('priority') as HTMLSelectElement).value as any,
                  reporterName: (form.elements.namedItem('reporterName') as HTMLInputElement).value,
                  reporterRole: 'اپراتور دستگاه / پرستار',
                  reportDate: '1405/05/20',
                  defectDescription: (form.elements.namedItem('defectDescription') as HTMLTextAreaElement).value,
                  status: 'reported',
                };

                onReportFailure(newReport);
                setShowReportModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  انتخاب دستگاه پزشکی دچار مشکل:
                </label>
                <select
                  name="equipmentCode"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-400"
                >
                  {equipmentList.map((e) => (
                    <option key={e.id} value={e.code}>
                      {e.code} - {e.faName} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    سطح اولویت و حساسیت:
                  </label>
                  <select
                    name="priority"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-400"
                  >
                    <option value="critical">بحرانی (توقف عمل / خطر حیاتی)</option>
                    <option value="high">اولویت بالا</option>
                    <option value="medium">متوسط</option>
                    <option value="low">کم</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نام گزارش‌دهنده:</label>
                  <input
                    required
                    name="reporterName"
                    defaultValue="پرستار نسرین کریمی"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  شرح دقیق مشکل و آلارم مشاهده شده:
                </label>
                <textarea
                  required
                  name="defectDescription"
                  rows={3}
                  placeholder="مشکل قطع و وصلی، نمایش خطای سنسور، نویز صدا یا خرابی کابل..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  ارسال گزارش خرابی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Failure Modal */}
      {selectedFailure && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">
                تغییر وضعیت و ثبت اقدامات تعمیر ({selectedFailure.reportNo})
              </h3>
              <button
                onClick={() => setSelectedFailure(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  وضعیت گام تعمیرات:
                </label>
                <select
                  id="statusSelect"
                  disabled={isReadOnly}
                  defaultValue={selectedFailure.status}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-400 disabled:opacity-75 disabled:bg-slate-100"
                >
                  <option value="reported">گزارش شده</option>
                  <option value="assigned">ارجاع شده به تکنسین</option>
                  <option value="in_repair">در حال تعمیر در کارگاه</option>
                  <option value="resolved">برطرف شده و تحویل نهایی</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  شرح اقدامات فنی / قطعات تعویض شده:
                </label>
                <textarea
                  readOnly={isReadOnly}
                  value={actionNotesInput}
                  onChange={(e) => setActionNotesInput(e.target.value)}
                  rows={3}
                  placeholder="توضیحات تعویض قطعه یا کالیبراسیون مجدد..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-400 read-only:bg-slate-100 read-only:text-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedFailure(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  {isReadOnly ? 'بستن' : 'انصراف'}
                </button>
                {!isReadOnly && (
                  <button
                    onClick={() => {
                      const statusSelect = (document.getElementById('statusSelect') as HTMLSelectElement)?.value as any;
                      onUpdateFailureStatus(selectedFailure.id, statusSelect, actionNotesInput);
                      setSelectedFailure(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold"
                  >
                    ذخیره وضعیت
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
