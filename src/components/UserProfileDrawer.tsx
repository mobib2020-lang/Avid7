import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Check,
  AlertCircle,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { AppUser } from '../types';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onUpdateUser: (updatedUser: AppUser) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813566-88855779080b?w=150&auto=format&fit=crop&q=80',
];

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  // Form states
  const [displayName, setDisplayName] = useState(currentUser.name || '');
  const [username, setUsername] = useState(currentUser.username || currentUser.email || '');
  const [personnelCode, setPersonnelCode] = useState(currentUser.personnelCode || '10001');
  const [roleTitle] = useState(currentUser.roleFa || 'کاربر');

  // Photo management
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Feedback notifications
  const [infoSaveMsg, setInfoSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passSaveMsg, setPassSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [photoMsg, setPhotoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state with currentUser changes
  useEffect(() => {
    setDisplayName(currentUser.name || '');
    setUsername(currentUser.username || currentUser.email || '');
    setPersonnelCode(currentUser.personnelCode || '10001');
  }, [currentUser]);

  // Handle Save User Info
  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setInfoSaveMsg({ type: 'error', text: 'لطفاً نام نمایشی را وارد کنید.' });
      return;
    }

    onUpdateUser({
      ...currentUser,
      name: displayName.trim(),
      username: username.trim(),
      personnelCode: personnelCode.trim(),
    });

    setInfoSaveMsg({ type: 'success', text: 'اطلاعات حساب کاربری با موفقیت ذخیره شد.' });
    setTimeout(() => setInfoSaveMsg(null), 3000);
  };

  // Handle Save Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassSaveMsg(null);

    if (!currentPassword) {
      setPassSaveMsg({ type: 'error', text: 'لطفاً رمز عبور فعلی خود را وارد کنید.' });
      return;
    }
    if (newPassword.length < 6) {
      setPassSaveMsg({ type: 'error', text: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassSaveMsg({ type: 'error', text: 'تکرار رمز با رمز جدید همخوانی ندارد.' });
      return;
    }

    onUpdateUser({
      ...currentUser,
      password: newPassword,
    });

    setPassSaveMsg({ type: 'success', text: 'رمز عبور با موفقیت تغییر یافت.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPassSaveMsg(null), 3000);
  };

  // Handle file selection from local device storage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedImageFile(file);
    }
    // reset value so same file can be re-selected if desired
    if (e.target) {
      e.target.value = '';
    }
  };

  const processSelectedImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPhotoMsg({ type: 'error', text: 'فایل انتخاب شده باید از نوع تصویر (JPG، PNG، WEBP) باشد.' });
      setTimeout(() => setPhotoMsg(null), 3500);
      return;
    }

    // Limit to ~5MB for performant localStorage/state handling
    if (file.size > 5 * 1024 * 1024) {
      setPhotoMsg({ type: 'error', text: 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.' });
      setTimeout(() => setPhotoMsg(null), 3500);
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      if (dataUrl) {
        onUpdateUser({
          ...currentUser,
          avatarUrl: dataUrl,
        });
        setPhotoMsg({ type: 'success', text: 'عکس پرسنلی از حافظه با موفقیت بارگذاری شد.' });
        setTimeout(() => setPhotoMsg(null), 3000);
      }
    };
    reader.onerror = () => {
      setPhotoMsg({ type: 'error', text: 'خطا در بارگذاری تصویر از حافظه سیستم.' });
      setTimeout(() => setPhotoMsg(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedImageFile(file);
    }
  };

  // Handle Select Preset Avatar
  const handleSelectAvatar = (url: string) => {
    onUpdateUser({
      ...currentUser,
      avatarUrl: url,
    });
    setPhotoMsg({ type: 'success', text: 'تصویر پرسنلی تغییر یافت.' });
    setTimeout(() => setPhotoMsg(null), 3000);
  };

  // Handle Delete/Remove Avatar
  const handleDeleteAvatar = () => {
    onUpdateUser({
      ...currentUser,
      avatarUrl: '',
    });
    setPhotoMsg({ type: 'success', text: 'عکس پرسنلی با موفقیت حذف شد و به آواتار پیش‌فرض برگشت.' });
    setTimeout(() => setPhotoMsg(null), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs cursor-pointer will-change-opacity"
            onClick={onClose}
          />

          {/* Drawer Panel Container with Fluid Smooth Slide */}
          <motion.div
            initial={{ x: '100%', opacity: 0.96 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.96 }}
            transition={{
              type: 'spring',
              damping: 34,
              stiffness: 380,
              mass: 0.75,
            }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50 text-right dir-rtl overflow-hidden will-change-transform"
          >
            {/* Hidden native file input for local system selection */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp, image/gif"
              onChange={handleFileChange}
              className="hidden"
              id="user-avatar-file-input"
            />

            {/* Top Blue Header Banner */}
            <div className="bg-gradient-to-b from-[#1d52d8] to-[#2563eb] text-white p-6 relative flex flex-col items-center shrink-0">
              {/* Close Button (top left in RTL) */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-xs"
                title="بستن"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Avatar Ring */}
              <div className="relative mt-2 mb-3">
                <div className="w-24 h-24 rounded-full border-2 border-white/60 p-1 flex items-center justify-center shadow-lg bg-white/10 backdrop-blur-xs">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white/20 text-white font-black text-2xl">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Title / User Label with Underline */}
              <div className="flex flex-col items-center mb-3">
                <span className="text-base font-extrabold text-white tracking-wide">
                  {currentUser.name || 'کاربر'}
                </span>
                <div className="w-8 h-1 bg-white/80 rounded-full mt-1" />
              </div>

              {/* Photo Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs backdrop-blur-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>{showPhotoPicker ? 'بستن منوی عکس' : 'تغییر عکس پرسنلی'}</span>
                </button>

                {currentUser.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="px-3 py-2 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs backdrop-blur-xs"
                    title="حذف عکس پرسنلی و بازگشت به آیکون پیش‌فرض"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف عکس</span>
                  </button>
                )}
              </div>

              {/* Photo Toast Message */}
              {photoMsg && (
                <div
                  className={`mt-3 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                    photoMsg.type === 'success'
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-rose-500/90 text-white'
                  }`}
                >
                  {photoMsg.type === 'success' ? (
                    <Check className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{photoMsg.text}</span>
                </div>
              )}

              {/* Photo Picker Subpanel: Upload from device memory + presets */}
              {showPhotoPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-white text-slate-800 rounded-2xl p-4 mt-4 shadow-xl border border-sky-100 text-right space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                      بارگذاری عکس پرسنلی از حافظه
                    </span>
                    <button
                      onClick={() => setShowPhotoPicker(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* System Storage File Upload Dropzone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
                        : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-slate-800">
                      انتخاب عکس از حافظه سیستم یا دستگاه
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      کلیک کنید یا فایل تصویر را اینجا رها نمایید (JPG، PNG، WEBP)
                    </p>
                    <button
                      type="button"
                      className="mt-2.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>مرور فایل‌های سیستم</span>
                    </button>
                  </div>

                  {/* Delete Option inside panel if active */}
                  {currentUser.avatarUrl && (
                    <div className="flex justify-between items-center bg-rose-50/70 border border-rose-100 p-2 rounded-xl">
                      <span className="text-[11px] text-rose-800 font-medium">عکس پرسنلی فعال است</span>
                      <button
                        type="button"
                        onClick={handleDeleteAvatar}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>حذف عکس فعلی</span>
                      </button>
                    </div>
                  )}

                  {/* Quick Preset Avatars */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block mb-2">
                      یا انتخاب از آواتارهای پیشنهادی:
                    </span>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATAR_PRESETS.map((pUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectAvatar(pUrl)}
                          className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            currentUser.avatarUrl === pUrl
                              ? 'border-blue-600 ring-2 ring-blue-300 scale-105'
                              : 'border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          <img src={pUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
              {/* SECTION 1: Account Information */}
              <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-100 space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs sm:text-sm font-black text-sky-950">
                    اطلاعات حساب کاربری
                  </h3>
                </div>

                <form onSubmit={handleSaveInfo} className="space-y-3.5">
                  {/* Row 1: Display Name & Username */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        نام نمایشی
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right"
                        placeholder="نام نمایشی"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        نام کاربری
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right font-mono"
                        placeholder="user@aimedic.ir"
                      />
                    </div>
                  </div>

                  {/* Row 2: Role & Personnel Code */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        نقش
                      </label>
                      <input
                        type="text"
                        value={roleTitle}
                        readOnly
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-600 cursor-not-allowed text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        کد پرسنلی
                      </label>
                      <input
                        type="text"
                        value={personnelCode}
                        onChange={(e) => setPersonnelCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right font-mono"
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {infoSaveMsg && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        infoSaveMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {infoSaveMsg.type === 'success' ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{infoSaveMsg.text}</span>
                    </div>
                  )}

                  {/* Save Info Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>ذخیره اطلاعات</span>
                  </button>
                </form>
              </div>

              {/* SECTION 2: Change Password */}
              <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-100 space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs sm:text-sm font-black text-sky-950">
                    تغییر رمز عبور
                  </h3>
                </div>

                <form onSubmit={handleSavePassword} className="space-y-3.5">
                  {/* Current Password */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      رمز فعلی
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right"
                      placeholder="رمز فعلی خود را وارد کنید"
                    />
                  </div>

                  {/* New Password & Confirm Password */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        رمز جدید
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right"
                        placeholder="حداقل ۶ کاراکتر"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        تکرار رمز
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-right"
                        placeholder="تکرار رمز جدید"
                      />
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {passSaveMsg && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        passSaveMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {passSaveMsg.type === 'success' ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{passSaveMsg.text}</span>
                    </div>
                  )}

                  {/* Save Password Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>تغییر رمز عبور</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom Close Button (Outlined) */}
            <div className="p-4 border-t border-slate-200/80 bg-white shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-sky-300 text-[#2563eb] hover:bg-sky-50 active:bg-sky-100 font-bold text-xs sm:text-sm transition-all cursor-pointer text-center"
              >
                بستن
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
