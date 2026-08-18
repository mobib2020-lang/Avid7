import React, { useState, useMemo } from 'react';
import {
  User,
  Activity,
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  FileText,
  Layers,
  Wrench,
} from 'lucide-react';
import { EquipmentItem, PurchaseRequest, AppUser, FailureReport } from '../../types';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';

interface OperatorReportsProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  purchaseRequests: PurchaseRequest[];
  failuresList?: FailureReport[];
}

export const OperatorReports: React.FC<OperatorReportsProps> = ({
  currentUser,
  equipmentList,
  purchaseRequests,
  failuresList = [],
}) => {
  const [activeReportAnchor, setActiveReportAnchor] = useState<string>('rep1');

  // --- Report 1: My Equipment (تجهیزات من) ---
  const myEquipmentList = useMemo(() => {
    return [
      {
        id: 'op-eq-1',
        name: 'ونتیلاتور پرتابل Puritan Bennett 840',
        code: 'MED-VENT-1402-09',
        status: 'آماده‌به‌کار',
        lastFailureDate: '۱۴۰۴/۰۱/۲۲',
        calibStatus: 'معتبر (تا ۱۴۰۴/۰۹/۲۰)',
        calibType: 'valid',
      },
      {
        id: 'op-eq-2',
        name: 'مانیتورینگ علائم حیاتی Saadat Alborz B9',
        code: 'MED-MON-1403-12',
        status: 'آماده‌به‌کار',
        lastFailureDate: 'ثبت نشده',
        calibStatus: 'معتبر (تا ۱۴۰۴/۱۱/۱۰)',
        calibType: 'valid',
      },
      {
        id: 'op-eq-3',
        name: 'پمپ سرنگ JMS SP-500',
        code: 'MED-PUMP-1401-44',
        status: 'در دست تعمیر',
        lastFailureDate: '۱۴۰۴/۰۲/۰۸',
        calibStatus: 'نزدیک به سررسید (۱۵ روز)',
        calibType: 'expiring',
      },
      {
        id: 'op-eq-4',
        name: 'پالس اکسی‌متر انگشتی Masimo Rad-8',
        code: 'MED-PULSE-1403-01',
        status: 'نیاز به کالیبراسیون',
        lastFailureDate: '۱۴۰۳/۱۱/۱۰',
        calibStatus: 'منقضی شده',
        calibType: 'expired',
      },
    ];
  }, []);

  // --- Report 2: My Requests (درخواست‌های من) ---
  const myRequestsList = useMemo(() => {
    return [
      {
        id: 'op-req-1',
        requestTitle: 'درخواست خرید فیلتر هپا و لوله‌های سیلیکونی بیهوشی',
        requestNo: 'PR-1404-098',
        date: '۱۴۰۴/۰۲/۱۲',
        status: 'در انتظار تأیید',
        currentStage: 'کارتابل بررسی مهندسی پزشکی',
      },
      {
        id: 'op-req-2',
        requestTitle: 'تعمیر برد تغذیه مانیتورینگ علائم حیاتی تخت ۴',
        requestNo: 'WR-1404-041',
        date: '۱۴۰۴/۰۲/۰۸',
        status: 'در دست اقدام',
        currentStage: 'ارجاع به شرکت پشتیبان و تعمیرگاه',
      },
      {
        id: 'op-req-3',
        requestTitle: 'کالیبراسیون سالانه دستگاه الکتروشوک',
        requestNo: 'CAL-1404-019',
        date: '۱۴۰۴/۰۱/۲۵',
        status: 'تأیید و تکمیل‌شده',
        currentStage: 'صدور برچسب کالیبراسیون',
      },
      {
        id: 'op-req-4',
        requestTitle: 'درخواست سنسور یدکی SpO2 بزرگسال (۲ عدد)',
        requestNo: 'PR-1404-072',
        date: '۱۴۰۴/۰۱/۱۵',
        status: 'تحویل داده شده',
        currentStage: 'رسید انبار و تحویل به کاربر',
      },
    ];
  }, []);

  return (
    <div className="space-y-10 pb-16 font-sans text-right dir-rtl">
      {/* Header & Anchors */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-800">
                گزارش‌ها و سوابق اپراتور و کادر بخش
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              پیگیری تجهیزات تحویل‌شده، وضعیت سلامت، کالیبراسیون و رهگیری درخواست‌های ثبت‌شده
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                setActiveReportAnchor('rep1');
                document.getElementById('rep-my-eq')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep1'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۱. تجهیزات من
            </button>
            <button
              onClick={() => {
                setActiveReportAnchor('rep2');
                document.getElementById('rep-my-req')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeReportAnchor === 'rep2'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ۲. درخواست‌های من
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* گزارش ۱ — تجهیزات من */}
      {/* ========================================================================= */}
      <section id="rep-my-eq" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۱ — تجهیزات من</h3>
          </div>
          <span className="text-xs text-slate-400">تجهیزات تخصیص‌یافته به بخش/ایستگاه کاری شما</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">تجهیز</th>
                  <th className="py-3 px-4 text-center">وضعیت</th>
                  <th className="py-3 px-4 text-center">آخرین ثبت خرابی</th>
                  <th className="py-3 px-4 text-center">وضعیت کالیبراسیون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myEquipmentList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.code}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'آماده‌به‌کار'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'در دست تعمیر'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">{item.lastFailureDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.calibType === 'valid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.calibType === 'expiring'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.calibStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* گزارش ۲ — درخواست‌های من */}
      {/* ========================================================================= */}
      <section id="rep-my-req" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h3 className="text-sm font-extrabold text-slate-800">گزارش ۲ — درخواست‌های من</h3>
          </div>
          <span className="text-xs text-slate-400">رهگیری آخرین وضعیت درخواست‌های خرید و تعمیرات ثبت‌شده</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">درخواست</th>
                  <th className="py-3 px-4 text-center">تاریخ</th>
                  <th className="py-3 px-4 text-center">وضعیت</th>
                  <th className="py-3 px-4">مرحله فعلی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequestsList.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div>{req.requestTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{req.requestNo}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">{req.date}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          req.status.includes('تکمیل') || req.status.includes('تحویل')
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{req.currentStage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
