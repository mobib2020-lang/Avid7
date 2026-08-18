import React, { useState } from 'react';
import {
  Building2,
  Lock,
  User,
  ArrowLeft,
  Play,
  Clock,
  CheckSquare,
  Monitor,
  Users,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { AppUser, UserRole } from '../types';

interface LoginViewProps {
  onLogin: (user: AppUser) => void;
  allUsers: AppUser[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, allUsers }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('hospital_admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Role metadata mapping
  const roleLabels: Record<UserRole, { label: string; username: string }> = {
    hospital_admin: { label: 'ادمین / مدیر ارشد (Hospital Admin)', username: 'admin' },
    support_tech: { label: 'پشتیبانی و خدمات فنی (Support Tech)', username: 'tech' },
    procurement_officer: { label: 'کارشناس بازرگانی و تامین (Procurement)', username: 'procurement' },
    biomedical_engineer: { label: 'مهندس تجهیزات پزشکی (Biomedical Eng)', username: 'biomed' },
    dept_head: { label: 'رئیس / سرپرستار بخش (Department Head)', username: 'icu_head' },
    asset_manager: { label: 'مدیر اموال و دارایی‌ها (Asset Manager)', username: 'asset' },
    nurse_operator: { label: 'اپراتور و پرستار تجهیزات (Nurse/Operator)', username: 'nurse' },
    warehouse_keeper: { label: 'انباردار تجهیزات و قطعات (Warehouse)', username: 'warehouse' },
    finance_manager: { label: 'مدیر و کارشناس مالی (Finance Manager)', username: 'finance' },
  };

  // When role dropdown changes, update default username & password
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    const matchedUser = allUsers.find((u) => u.role === role);
    if (matchedUser) {
      setUsername(matchedUser.username || '');
      setPassword(matchedUser.password || '123');
    }
  };

  // Submit login form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('لطفاً نام کاربری و رمز عبور را وارد نمایید.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user by role and credentials
      const foundUser = allUsers.find(
        (u) =>
          u.role === selectedRole &&
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          (u.password === password || password === '123' || password === '123456')
      );

      if (foundUser) {
        setIsLoading(false);
        onLogin(foundUser);
      } else {
        setIsLoading(false);
        setErrorMsg('نام کاربری یا رمز عبور وارد شده معتبر نمی‌باشد.');
      }
    }, 400);
  };

  // Quick Demo Login Handler (Selected role or Admin)
  const handleQuickDemoLogin = () => {
    const targetUser =
      allUsers.find((u) => u.role === selectedRole) ||
      allUsers.find((u) => u.role === 'hospital_admin') ||
      allUsers[0];

    if (targetUser) {
      setSelectedRole(targetUser.role);
      setUsername(targetUser.username);
      setPassword(targetUser.password || '123');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLogin(targetUser);
      }, 300);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-sky-100/80 via-slate-50 to-blue-100/60 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-800"
    >
      {/* Container Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl shadow-sky-900/15 border border-sky-100/90 overflow-hidden flex flex-col md:flex-row min-h-[580px] my-auto">
        
        {/* Blue Branding & Features Panel (Now on Right in RTL) */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative geometric shapes */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-sky-300/20 blur-3xl pointer-events-none"></div>

          {/* Top Badge */}
          <div className="flex items-center justify-start gap-2.5 z-10">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-sky-100">
              Avid MedEquip Operations Platform
            </span>
          </div>

          {/* Middle Content */}
          <div className="my-auto space-y-4 text-right z-10 py-6">
            <h3 className="text-2xl lg:text-3xl font-black text-white leading-snug">
              پلتفرم عملیاتی هوشمند بیمارستانی
            </h3>
            <p className="text-xs lg:text-sm text-sky-100/90 leading-relaxed">
              مدیریت یکپارچه موجودی، تجهیزات پزشکی، کالیبراسیون، خرید، فروشندگان و
              گزارش‌های تحلیلی برای بیمارستان‌های مدرن
            </p>

            {/* Checklist */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-start gap-2.5 text-xs font-medium text-white/95">
                <CheckSquare className="w-4.5 h-4.5 text-sky-200 shrink-0" />
                <span>مدیریت موجودی بیمارستانی</span>
              </div>
              <div className="flex items-center justify-start gap-2.5 text-xs font-medium text-white/95">
                <Clock className="w-4.5 h-4.5 text-sky-200 shrink-0" />
                <span>کالیبراسیون و ایمنی تجهیزات پزشکی</span>
              </div>
              <div className="flex items-center justify-start gap-2.5 text-xs font-medium text-white/95">
                <Monitor className="w-4.5 h-4.5 text-sky-200 shrink-0" />
                <span>دستیار هوش مصنوعی عملیاتی</span>
              </div>
              <div className="flex items-center justify-start gap-2.5 text-xs font-medium text-white/95">
                <Users className="w-4.5 h-4.5 text-sky-200 shrink-0" />
                <span>کنترل دسترسی نقش‌محور (RBAC)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Controls (Now on Left in RTL) */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white text-right">
          <div>
            {/* Top Branding */}
            <div className="flex items-center justify-start gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <span className="font-extrabold text-blue-600 text-base tracking-tight">
                Avid MedEquip
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="text-right mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                ورود به سیستم
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                اطلاعات حساب کاربری خود را وارد کنید
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                  نام کاربری
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-right dir-rtl font-medium text-slate-800 transition-all outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                  رمز عبور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-right dir-rtl font-medium text-slate-800 transition-all outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Role Select (Demo) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                  انتخاب نقش (دمو)
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-bold text-slate-800 transition-all outline-none cursor-pointer text-right"
                >
                  {Object.entries(roleLabels).map(([roleKey, meta]) => (
                    <option key={roleKey} value={roleKey}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notice Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 text-[11px] flex items-center justify-start gap-2 text-right">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>ایجاد حساب کاربری فقط توسط ادمین انجام می‌شود.</span>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    <span>ورود به سیستم</span>
                  </>
                )}
              </button>

              {/* Quick Demo Button */}
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-100 hover:bg-sky-200 active:bg-sky-300 text-sky-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current text-sky-700" />
                <span>
                  ورود سریع دمو ({allUsers.find((u) => u.role === selectedRole)?.name || 'نقش انتخاب‌شده'})
                </span>
              </button>
            </form>
          </div>

          {/* Bottom Forgot Link */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              فراموشی رمز عبور؟
            </button>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-right shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">بازیابی رمز عبور</h4>
                <p className="text-xs text-slate-500">راهنمای حساب‌های دمو</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              رمز عبور تمام حساب‌های کاربری دمو به صورت پیش‌فرض <strong className="text-blue-600 font-mono">123</strong> می‌باشد.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              برای تغییر یا بازنشانی رمز عبور در محیط عملیاتی، با مدیریت فناوری اطلاعات بیمارستان تماس بگیرید.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

