import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Key,
  Copy,
  Check,
  RefreshCw,
  Share2,
  ShieldCheck,
  Send,
  Building,
  Phone,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { AppUser, RoleDefinition } from '../../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: AppUser) => void;
  rolesList?: RoleDefinition[];
  existingUsers?: AppUser[];
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser,
  rolesList = [],
  existingUsers = [],
}) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [personnelCode, setPersonnelCode] = useState('');
  const [username, setUsername] = useState('');
  const [roleCode, setRoleCode] = useState('biomedical_engineer');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [password, setPassword] = useState('');

  // UI helpers
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedFullCredentials, setCopiedFullCredentials] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate random safe password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const num = Math.floor(1000 + Math.random() * 9000);
    const newPass = `Avid@${rand}${num}`;
    setPassword(newPass);
    setCopiedPassword(false);
  };

  // Copy password only
  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  // Copy full user credentials formatted text
  const handleCopyFullCredentials = () => {
    const roleTitle = rolesList.find((r) => r.code === roleCode)?.titleFa || 'کاربر سیستم';
    const text = `🏥 سامانه مدیریت تجهیزات پزشکی آوید
👤 مشخصات ورود به حساب کاربری:
───────────────
• نام کاربر: ${fullName || 'تعریف‌نشده'}
• کد پرسنلی: ${personnelCode || 'تعریف‌نشده'}
• نام کاربری / ایمیل: ${username || 'تعریف‌نشده'}
• رمز عبور اولیه: ${password || 'تعریف‌نشده'}
• نقش سازمانی: ${roleTitle}
• بخش / دپارتمان: ${department || 'بدون بخش (شناور)'}
───────────────
🔗 نشانی سامانه: https://avidmed.ir/login`;

    navigator.clipboard.writeText(text);
    setCopiedFullCredentials(true);
    setTimeout(() => setCopiedFullCredentials(false), 3000);
  };

  // Auto-generate username from full name when username is empty
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullName(val);
    if (!username || username.startsWith('user_')) {
      const pinyin = val
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-zA-Z0-9.]/g, '');
      if (pinyin) {
        setUsername(`${pinyin}@aimedic.ir`);
      }
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی کاربر را وارد کنید.');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('لطفاً نام کاربری یا ایمیل سازمانی را وارد کنید.');
      return;
    }

    const effectivePassword = password.trim() || '123456';
    const roleObj = rolesList.find((r) => r.code === roleCode);
    const supervisorUser = existingUsers.find((u) => u.id === supervisorId);

    const newUser: AppUser = {
      id: `usr-${Date.now()}`,
      username: username.trim(),
      password: effectivePassword,
      personnelCode: personnelCode.trim() || 'تعریف‌نشده',
      name: fullName.trim(),
      role: roleCode,
      roleFa: roleObj ? roleObj.titleFa : 'کاربر بیمارستان',
      department: department.trim() || 'بدون بخش (شناور)',
      email: username.includes('@') ? username.trim() : `${username.trim()}@aimedic.ir`,
      phone: phone.trim() || '۰۹۱۲۰۰۰۰۰۰۰',
      supervisorId: supervisorId || undefined,
      supervisorName: supervisorUser ? supervisorUser.name : undefined,
      supervisorRoleTitle: supervisorUser ? supervisorUser.roleFa : undefined,
      status: 'active',
      lastLogin: 'هم‌اکنون (کاربر جدید)',
      permissions: roleObj ? roleObj.permissions : ['view_all'],
      allowedPages: [
        'dashboard',
        'inventory',
        'calendar',
        'tasks',
        'calibration',
        'failures',
        'purchase_requests',
        'smart_cart',
        'vendors',
        'reports',
        'my_workgroup',
        'settings',
      ],
      description: 'کاربر ایجادشده در سامانه مدیریت تجهیزات پزشکی آوید',
    };

    onAddUser(newUser);
    onClose();

    // Reset fields for next time
    setFullName('');
    setUsername('');
    setPassword('');
    setPhone('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 z-50 text-right dir-rtl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer"
                title="بستن"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-base sm:text-lg font-black text-slate-900">
                ایجاد کاربر جدید
              </h2>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
                <X className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Full Name & Personnel Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    نام کامل
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={handleFullNameChange}
                    placeholder="نام و نام خانوادگی"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200/90 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    کد پرسنلی
                  </label>
                  <input
                    type="text"
                    required
                    value={personnelCode}
                    onChange={(e) => setPersonnelCode(e.target.value)}
                    placeholder="مثال: 10006"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200/90 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right font-mono placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Row 2: Username & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    نام کاربری / ایمیل سازمانی
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="user@aimedic.ir"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200/90 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right font-mono placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    نقش سازمانی
                  </label>
                  <select
                    value={roleCode}
                    onChange={(e) => setRoleCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200/90 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right cursor-pointer"
                  >
                    {rolesList.length > 0 ? (
                      rolesList.map((r) => (
                        <option key={r.id} value={r.code}>
                          {r.titleFa}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="hospital_admin">ادمین بیمارستان</option>
                        <option value="biomedical_engineer">مسئول مهندسی پزشکی</option>
                        <option value="finance_manager">مسئول مالی و بودجه</option>
                        <option value="procurement_officer">مسئول خرید و تدارکات</option>
                        <option value="warehouse_keeper">مسئول انبار تجهیزات</option>
                        <option value="asset_manager">امین اموال و پلاک‌کوبی</option>
                        <option value="support_tech">پشتیبان و خدمات فنی</option>
                        <option value="dept_head">رئیس دپارتمان / سرپرستار بخش</option>
                        <option value="nurse_operator">اپراتور / کاربر تجهیز</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Row 3: Department & Contact Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    بخش / دپارتمان (اختیاری)
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200/90 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right cursor-pointer"
                  >
                    <option value="">-- بدون بخش مشخص (شناور / سراسری) --</option>
                    <option value="واحد مهندسی پزشکی">واحد مهندسی پزشکی</option>
                    <option value="ICU مرکزی و مراقبت ویژه">ICU مرکزی و مراقبت ویژه</option>
                    <option value="بخش اورژانس">بخش اورژانس</option>
                    <option value="امور مالی و بودجه">امور مالی و بودجه</option>
                    <option value="انبار مرکزی تجهیزات">انبار مرکزی تجهیزات</option>
                    <option value="اتاق عمل جنرال">اتاق عمل جنرال</option>
                    <option value="تصویربرداری و رادیولوژی">تصویربرداری و رادیولوژی</option>
                    <option value="مدیریت ارشد بیمارستان">مدیریت ارشد بیمارستان</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    سرپرست مستقیم (اختیاری)
                  </label>
                  <select
                    value={supervisorId}
                    onChange={(e) => setSupervisorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200/90 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right cursor-pointer"
                  >
                    <option value="">-- بدون سرپرست مستقیم / مستقل --</option>
                    {existingUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.roleFa})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION: Initial Password (رمز عبور اولیه) */}
              <div className="pt-2">
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  رمز عبور اولیه
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ورود کلمه عبور یا تولید خودکار"
                    className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200/90 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right font-mono placeholder:text-slate-400 placeholder:font-normal"
                  />

                  {/* Generate Button */}
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>تولید رمز</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    disabled={!password}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      copiedPassword
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : password
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 mt-1.5">
                  رمز پیشنهادی بعد از کلیک «تولید رمز» نمایش داده می‌شود.
                </p>
              </div>

              {/* Extra Utility: Copy full credentials summary for user */}
              <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-sky-900 text-xs font-bold">
                  <Share2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>ارسال مشخصات ورود به کاربر</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyFullCredentials}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      copiedFullCredentials
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs'
                    }`}
                  >
                    {copiedFullCredentials ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>متن کامل کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی مشخصات کامل اکانت</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons: Create Account (Blue) & Cancel */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 rounded-2xl bg-[#2563eb] hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ایجاد حساب</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-6 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 active:bg-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <span>انصراف</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
