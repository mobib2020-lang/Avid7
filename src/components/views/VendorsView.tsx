import React, { useState } from 'react';
import {
  Building2,
  Star,
  ShieldCheck,
  Phone,
  Mail,
  Search,
  Clock,
  Award,
  MapPin,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import { Vendor, AppUser } from '../../types';

interface VendorsViewProps {
  currentUser?: AppUser;
  vendorsList: Vendor[];
}

export const VendorsView: React.FC<VendorsViewProps> = ({ currentUser, vendorsList }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedVendors, setExpandedVendors] = useState<Record<string, boolean>>({});

  const toggleVendorDetails = (vendorId: string) => {
    setExpandedVendors((prev) => ({
      ...prev,
      [vendorId]: !prev[vendorId],
    }));
  };

  const toggleAll = (expand: boolean) => {
    const nextState: Record<string, boolean> = {};
    vendorsList.forEach((v) => {
      nextState[v.id] = expand;
    });
    setExpandedVendors(nextState);
  };

  // Categories list for filtering
  const allCategories = Array.from(
    new Set(vendorsList.flatMap((v) => v.categories || []))
  );

  const filtered = vendorsList.filter((v) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      v.name.toLowerCase().includes(query) ||
      (v.contactPerson && v.contactPerson.toLowerCase().includes(query)) ||
      (v.code && v.code.toLowerCase().includes(query)) ||
      (v.brandRepresentative && v.brandRepresentative.toLowerCase().includes(query)) ||
      (v.specialty && v.specialty.toLowerCase().includes(query)) ||
      (v.city && v.city.toLowerCase().includes(query));

    const matchesCat =
      selectedCategory === 'all' ||
      (v.categories && v.categories.includes(selectedCategory));

    return matchesSearch && matchesCat;
  });

  // Calculate high-level summary metrics
  const totalVendors = vendorsList.length;
  const avgSla = totalVendors > 0
    ? (vendorsList.reduce((acc, v) => acc + (v.slaScore || 0), 0) / totalVendors).toFixed(1)
    : '0';
  const validIrcCount = vendorsList.filter((v) => v.ircStatus === 'valid' || v.ircLicenseNumber).length;

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>شرکت‌های تامین‌کننده و طرف قرارداد</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            فهرست شرکت‌های مجاز، بررسی تعهدات SLA و مجوزهای اداره کل تجهیزات پزشکی
          </p>
        </div>

        {/* Global Expand/Collapse controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleAll(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            باز کردن همه
          </button>
          <button
            onClick={() => toggleAll(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            بستن همه
          </button>
        </div>
      </div>

      {/* Compact KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500">تامین‌کنندگان فعال</span>
            <div className="text-base font-black text-slate-900 mt-0.5">
              {totalVendors.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">شرکت</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500">میانگین امتیاز SLA</span>
            <div className="text-base font-black text-amber-600 mt-0.5 flex items-center gap-1">
              <span>{avgSla}٪</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[11px] text-slate-500">مجوز معتبر IRC</span>
            <div className="text-base font-black text-emerald-600 mt-0.5">
              {validIrcCount.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">شرکت تاییدشده</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام شرکت، کد یا حوزه تخصصی..."
              className="w-full pr-9 pl-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              همه حوزه‌ها
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors List (Clean Card + Accordion Dropdown) */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            تامین‌کننده‌ای مطابق با جستجوی شما یافت نشد.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((vendor) => {
              const isExpanded = !!expandedVendors[vendor.id];
              const isExpiringSoon = vendor.contractStatus === 'expiring_soon';

              return (
                <div
                  key={vendor.id}
                  className={`rounded-2xl border transition-all ${
                    isExpanded
                      ? 'border-blue-300 bg-blue-50/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Compact Header Bar (Always Visible) */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="font-mono text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold shrink-0">
                        {vendor.code}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-sm text-slate-900">
                            {vendor.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            فعال
                          </span>
                        </div>
                        {vendor.brandRepresentative && (
                          <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1 mt-0.5">
                            <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{vendor.brandRepresentative}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side: SLA pill & Toggle dropdown button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-amber-900 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{vendor.slaScore}٪ SLA</span>
                        </div>
                        <div className="text-[11px] text-slate-500 hidden md:block">
                          پاسخ: {vendor.responseTimeHours} ساعته
                        </div>
                      </div>

                      {/* Dropdown Toggle Button */}
                      <button
                        onClick={() => toggleVendorDetails(vendor.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isExpanded
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{isExpanded ? 'بستن مشخصات' : 'مشاهده توضیحات و مشخصات'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Dropdown Details Section */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-blue-100 space-y-3.5 bg-white rounded-b-2xl">
                      {/* Specialty & Categories */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                        <div className="text-xs text-slate-700 leading-relaxed">
                          <strong className="text-slate-900 block mb-1">توضیحات و زمینه تخصصی تامین:</strong>
                          {vendor.specialty}
                        </div>

                        {vendor.categories && vendor.categories.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] text-slate-500 font-medium">حوزه‌ها:</span>
                            {vendor.categories.map((c) => (
                              <span
                                key={c}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-medium"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Performance & Contract Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-0.5">
                          <span className="text-[10px] text-slate-400 block">پاسخگویی اورژانسی</span>
                          <span className="font-bold text-slate-800">
                            {vendor.responseTimeHours ? `${vendor.responseTimeHours} ساعت` : '-'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-0.5">
                          <span className="text-[10px] text-slate-400 block">پشتیبانی و گارانتی</span>
                          <span className="font-bold text-slate-800">
                            {vendor.warrantySupportMonths ? `${vendor.warrantySupportMonths} ماه` : '-'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-0.5">
                          <span className="text-[10px] text-slate-400 block">قراردادهای جاری</span>
                          <span className="font-bold text-slate-800">
                            {vendor.activeContractsCount ? `${vendor.activeContractsCount} فقره` : '-'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-0.5">
                          <span className="text-[10px] text-slate-400 block">سررسید قرارداد</span>
                          <span className={`font-bold text-[11px] ${isExpiringSoon ? 'text-rose-600' : 'text-slate-800'}`}>
                            {vendor.contractExpiry || '-'}
                          </span>
                        </div>
                      </div>

                      {/* Contact & Registration Footer */}
                      <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span>نماینده و رابط: <strong>{vendor.contactPerson}</strong></span>
                            {vendor.contactRole && (
                              <span className="text-[11px] text-slate-500 font-normal">({vendor.contactRole})</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>مجوز IRC: {vendor.ircLicenseNumber}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>تلفن: <strong className="text-slate-700">{vendor.phone}</strong></span>
                            {vendor.mobile && (
                              <span className="mr-2 text-slate-500 font-mono">همراه: {vendor.mobile}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-slate-700">{vendor.email}</span>
                          </div>
                        </div>

                        {vendor.address && (
                          <div className="flex items-start gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{vendor.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
