import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Save,
  CheckCircle2,
  Bell,
  FolderTree,
  Sliders,
  ShieldCheck,
  Building,
  Plus,
} from 'lucide-react';
import { AssetClassification, AppUser, EquipmentItem } from '../../types';
import { AssetStructureView } from './AssetStructureView';

interface SettingsViewProps {
  currentUser?: AppUser;
  classificationsList?: AssetClassification[];
  equipmentList?: EquipmentItem[];
  onAddClassification?: (
    newCategory: Omit<AssetClassification, 'id' | 'createdAt' | 'updatedAt' | 'itemsCount'>
  ) => { id: string } | void;
  onUpdateClassification?: (updated: AssetClassification) => void;
  onToggleActive?: (id: string) => void;
  onDeleteClassification?: (id: string) => boolean;
  defaultTab?: 'structure' | 'general';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  classificationsList = [],
  equipmentList = [],
  onAddClassification = () => {},
  onUpdateClassification = () => {},
  onToggleActive = () => {},
  onDeleteClassification = () => true,
  defaultTab = 'structure',
}) => {
  const isAssetManager = currentUser?.role === 'asset_manager';
  const isBiomedicalEngineer = currentUser?.role === 'biomedical_engineer';

  const [activeTab, setActiveTab] = useState<'structure' | 'general'>(
    isBiomedicalEngineer
      ? 'general'
      : isAssetManager
      ? 'structure'
      : defaultTab
  );
  const [createStructureTrigger, setCreateStructureTrigger] = useState(0);
  const [saved, setSaved] = useState(false);
  const [aiCreativity, setAiCreativity] = useState('0.2');
  const [autoTaskGen, setAutoTaskGen] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [calibrationThresholdDays, setCalibrationThresholdDays] = useState('30');
  const [autoStockAlert, setAutoStockAlert] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isShowingStructureTab = !isBiomedicalEngineer && (activeTab === 'structure' || isAssetManager);

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* Header & Sub-Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {isBiomedicalEngineer ? (
                <>
                  <Settings className="w-6 h-6 text-sky-600" />
                  <span>تنظیمات فنی و آستانه‌های مهندسی پزشکی</span>
                </>
              ) : isAssetManager ? (
                <>
                  <FolderTree className="w-6 h-6 text-sky-600" />
                  <span>ساختار اموال و دسته‌بندی تجهیزات</span>
                </>
              ) : (
                <>
                  <Settings className="w-6 h-6 text-sky-600" />
                  <span>تنظیمات جامع سیستم و پارامترهای عملیاتی</span>
                </>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isBiomedicalEngineer
                ? 'پیکربندی آستانه‌های خودکار کالیبراسیون، هشدارهای فوری خرابی و تنظیمات هوش مصنوعی'
                : isAssetManager
                ? 'مدیریت و تعریف سطوح ساختار اموال و فیلدهای اختصاصی اطلاعات اموال'
                : 'مدیریت دسته‌بندی و کدگذاری اموال، الگوریتم‌های هوش مصنوعی و هشدارهای اتوماتیک'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isShowingStructureTab ? (
              <button
                type="button"
                onClick={() => setCreateStructureTrigger((prev) => prev + 1)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-600/20 active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>ایجاد ساختار سفارشی</span>
              </button>
            ) : !isAssetManager ? (
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saved ? 'تنظیمات ذخیره شد' : 'ذخیره تغییرات'}</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Tab Navigation buttons - ONLY show multi-tab switch for Admin */}
        {!isAssetManager && !isBiomedicalEngineer && (
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit text-xs font-extrabold flex-wrap">
            <button
              onClick={() => setActiveTab('structure')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'structure'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-4 h-4 text-sky-600" />
              <span>ساختار اموال</span>
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>تنظیمات هوش مصنوعی و پارامترها</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: ASSET STRUCTURE (Hidden for biomedical_engineer) */}
      {isShowingStructureTab && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-2 sm:p-4 shadow-2xs">
          <AssetStructureView
            classificationsList={classificationsList}
            onAddClassification={onAddClassification}
            onUpdateClassification={onUpdateClassification}
            onToggleActive={onToggleActive}
            onDeleteClassification={onDeleteClassification}
            createStructureTrigger={createStructureTrigger}
          />
        </div>
      )}

      {/* TAB 2: GENERAL & TECHNICAL CONFIG */}
      {(isBiomedicalEngineer || activeTab === 'general') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Model Config */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>تنظیمات موتور هوش مصنوعی و پردازش اسناد</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  مدل هوش مصنوعی فعال:
                </label>
                <input
                  disabled
                  value="Gemini 2.5 Flash (Google GenAI)"
                  className="w-full p-2.5 rounded-xl bg-slate-100 font-mono text-slate-600 border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  سطح دقت الگوریتم (Temperature):
                </label>
                <select
                  value={aiCreativity}
                  onChange={(e) => setAiCreativity(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option value="0.1">۰.۱ - حداکثر دقت فنی بیمارستانی (پیش‌فرض)</option>
                  <option value="0.5">۰.۵ - تحلیل متعادل</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">
                    ایجاد خودکار وظیفه کالیبراسیون
                  </span>
                  <span className="text-[11px] text-slate-500">
                    تولید اتوماتیک Task هنگام رسیدن به موعد انقضا
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoTaskGen}
                  onChange={(e) => setAutoTaskGen(e.target.checked)}
                  className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">
                    هشدار خودکار کسری موجودی انبار
                  </span>
                  <span className="text-[11px] text-slate-500">
                    اعلان فوری در صورت رسیدن موجودی به زیر نقطه سفارش
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoStockAlert}
                  onChange={(e) => setAutoStockAlert(e.target.checked)}
                  className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Notifications & Operational Thresholds */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>آستانه‌های عملیاتی و هشدارهای پیامکی</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  آستانه هشدار پیش‌ازموعد کالیبراسیون (روز):
                </label>
                <select
                  value={calibrationThresholdDays}
                  onChange={(e) => setCalibrationThresholdDays(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option value="15">۱۵ روز قبل از سررسید</option>
                  <option value="30">۳۰ روز قبل از سررسید (استاندارد)</option>
                  <option value="60">۶۰ روز قبل از سررسید</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">نام مرکز درمانی:</label>
                <input
                  defaultValue="بیمارستان تخصصی آوید (Avid MedEquip)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">ارسال پیامک اضطراری به مسئول فنی</span>
                  <span className="text-[11px] text-slate-500">
                    پیامک فوری هنگام ثبت خرابی‌های بحرانی و خارج از سرویس شدن تجهیزات حیاتی
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
