import React, { useState } from 'react';
import {
  ShoppingCart,
  Sparkles,
  Zap,
  TrendingDown,
  Truck,
  Trash2,
  CheckCircle2,
  Archive,
  Check,
  X,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { SmartCartItem, ClosedCartBatch, CartStrategy, Vendor, AppUser } from '../../types';

interface SmartCartViewProps {
  currentUser?: AppUser;
  strategyCarts: Record<CartStrategy, SmartCartItem[]>;
  closedBatches: ClosedCartBatch[];
  vendors: Vendor[];
  onUpdateStrategyCartItem: (strategy: CartStrategy, id: string, newQty: number) => void;
  onRemoveStrategyCartItem: (strategy: CartStrategy, id: string) => void;
  onCloseCartBatch: (strategy: CartStrategy, items: SmartCartItem[]) => void;
  onReviewClosedBatch: (
    batchId: string,
    status: ClosedCartBatch['financialStatus'],
    note?: string,
    itemDecisions?: Record<string, { approved: boolean; note?: string }>
  ) => void;
}

export const SmartCartView: React.FC<SmartCartViewProps> = ({
  currentUser,
  strategyCarts,
  closedBatches,
  onUpdateStrategyCartItem,
  onRemoveStrategyCartItem,
  onCloseCartBatch,
  onReviewClosedBatch,
}) => {
  const [activeTab, setActiveTab] = useState<'strategies' | 'review'>('strategies');
  const [selectedStrategy, setSelectedStrategy] = useState<CartStrategy>('optimized');
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});
  const [filterBatchStatus, setFilterBatchStatus] = useState<
    'all' | 'pending_review' | 'approved' | 'rejected' | 'partially_approved'
  >('all');

  const [selectedBatch, setSelectedBatch] = useState<ClosedCartBatch | null>(null);
  const [itemApprovals, setItemApprovals] = useState<Record<string, { approved: boolean; note?: string }>>({});
  const [financeNote, setFinanceNote] = useState('');

  const strategies: { id: CartStrategy; label: string; icon: React.ElementType; shortDesc: string }[] = [
    {
      id: 'optimized',
      label: 'پیشنهاد هوشمند (کیفیت و قیمت)',
      icon: Sparkles,
      shortDesc: 'تعادل هوشمند میان بالاترین کیفیت، قیمت مناسب و تحویل مطمئن',
    },
    {
      id: 'discount',
      label: 'بیشترین تخفیف (خرید عمده)',
      icon: TrendingDown,
      shortDesc: 'پکیج‌های خرید حجمی با بیشترین درصد تخفیف ریالی',
    },
    {
      id: 'urgent',
      label: 'تحویل فوری اورژانس',
      icon: Zap,
      shortDesc: 'تامین سریع اقلام حیاتی و اورژانسی با تحویل اکسپرس',
    },
    {
      id: 'low_shipping',
      label: 'ارسال رایگان',
      icon: Truck,
      shortDesc: 'حذف کامل هزینه‌های باربری و حمل برای تجهیزات سنگین',
    },
  ];

  const toggleReason = (itemId: string) => {
    setExpandedReasons((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const currentItems = strategyCarts[selectedStrategy] || [];

  const totalGross = currentItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalDiscount = currentItems.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity * item.discountPercentage) / 100,
    0
  );
  const totalShipping = currentItems.reduce((sum, item) => sum + item.shippingCost, 0);
  const finalPrice = totalGross - totalDiscount + totalShipping;

  const openReviewModal = (batch: ClosedCartBatch) => {
    setSelectedBatch(batch);
    setFinanceNote(batch.financeNote || '');
    const initial: Record<string, { approved: boolean; note?: string }> = {};
    batch.items.forEach((it) => {
      initial[it.id] = batch.itemDecisions?.[it.id] || { approved: true, note: '' };
    });
    setItemApprovals(initial);
  };

  const handleDecision = (status: 'approved' | 'rejected' | 'partially_approved') => {
    if (!selectedBatch) return;
    onReviewClosedBatch(selectedBatch.id, status, financeNote, itemApprovals);
    setSelectedBatch(null);
  };

  // Counts for status tabs
  const allCount = closedBatches.length;
  const pendingCount = closedBatches.filter((b) => b.financialStatus === 'pending_review').length;
  const approvedCount = closedBatches.filter((b) => b.financialStatus === 'approved').length;
  const partialCount = closedBatches.filter((b) => b.financialStatus === 'partially_approved').length;
  const rejectedCount = closedBatches.filter((b) => b.financialStatus === 'rejected').length;

  const filteredBatches = closedBatches.filter((b) => {
    if (filterBatchStatus === 'all') return true;
    return b.financialStatus === filterBatchStatus;
  });

  const activeStrategyObj = strategies.find((s) => s.id === selectedStrategy);

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* Header & Main Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span>سبد خرید</span>
          </h1>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('strategies')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'strategies'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            سبدهای استراتژیک
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'review'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>سبدهای بسته‌شده (کارتابل مالی)</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {pendingCount.toLocaleString('fa-IR')}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: STRATEGIC CARTS */}
      {activeTab === 'strategies' && (
        <div className="space-y-5">
          {/* Strategy Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {strategies.map((strat) => {
              const Icon = strat.icon;
              const isSelected = selectedStrategy === strat.id;
              const count = (strategyCarts[strat.id] || []).length;

              return (
                <button
                  key={strat.id}
                  onClick={() => setSelectedStrategy(strat.id)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 text-blue-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-xs">{strat.label}</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-600">
                    {count.toLocaleString('fa-IR')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Short explanation of the selected strategy */}
          {activeStrategyObj && (
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs text-slate-600">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>هدف این استراتژی:</strong> {activeStrategyObj.shortDesc}
              </span>
            </div>
          )}

          {/* Cart Table & Checkout Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Items Table */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              {currentItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  این سبد خرید خالی است.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 font-bold">
                        <th className="pb-3 px-2">نام کالا / تامین‌کننده</th>
                        <th className="pb-3 px-2 text-center">تعداد</th>
                        <th className="pb-3 px-2">قیمت واحد</th>
                        <th className="pb-3 px-2">تخفیف</th>
                        <th className="pb-3 px-2">مبلغ کل</th>
                        <th className="pb-3 px-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentItems.map((item) => {
                        const isExpanded = !!expandedReasons[item.id];

                        return (
                          <React.Fragment key={item.id}>
                            <tr className="hover:bg-slate-50/70">
                              <td className="py-3 px-2">
                                <div className="font-bold text-slate-900">{item.equipmentName}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {item.vendorName} ({item.brand})
                                </div>

                                {/* Collapsible Dropdown for Recommendation Reason */}
                                {item.recommendationReason && (
                                  <button
                                    onClick={() => toggleReason(item.id)}
                                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer py-0.5 transition-colors"
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    <span>{isExpanded ? 'بستن دلیل پیشنهاد' : 'مشاهده دلیل پیشنهاد'}</span>
                                    {isExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </td>
                              <td className="py-3 px-2 text-center">
                                <div className="inline-flex items-center gap-1.5 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                                  <button
                                    onClick={() =>
                                      onUpdateStrategyCartItem(
                                        selectedStrategy,
                                        item.id,
                                        Math.max(1, item.quantity - 1)
                                      )
                                    }
                                    className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="w-6 text-center font-bold text-slate-800">
                                    {item.quantity.toLocaleString('fa-IR')}
                                  </span>
                                  <button
                                    onClick={() =>
                                      onUpdateStrategyCartItem(
                                        selectedStrategy,
                                        item.id,
                                        item.quantity + 1
                                      )
                                    }
                                    className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-slate-600">
                                {(item.unitPrice / 1000000).toLocaleString('fa-IR')} م.ت
                              </td>
                              <td className="py-3 px-2 text-emerald-600 font-bold">
                                {item.discountPercentage}%
                              </td>
                              <td className="py-3 px-2 font-bold text-slate-900">
                                {((item.unitPrice * item.quantity * (1 - item.discountPercentage / 100)) / 1000000).toLocaleString('fa-IR')} م.ت
                              </td>
                              <td className="py-3 px-2 text-left">
                                <button
                                  onClick={() => onRemoveStrategyCartItem(selectedStrategy, item.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>

                            {/* Dropdown Content Area */}
                            {isExpanded && (
                              <tr className="bg-blue-50/50">
                                <td colSpan={6} className="px-4 py-2.5 border-b border-blue-100">
                                  <div className="flex items-start gap-2 text-xs text-blue-900 leading-relaxed">
                                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                      <strong>علت پیشنهاد این کالا:</strong> {item.recommendationReason}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Simple Summary Box */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                صورت‌حساب سبد
              </h2>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>جمع اقلام:</span>
                  <span className="font-bold text-slate-800">
                    {(totalGross / 1000000).toLocaleString('fa-IR')} میلیون تومان
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>تخفیف:</span>
                  <span>- {(totalDiscount / 1000000).toLocaleString('fa-IR')} میلیون تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>هزینه ارسال:</span>
                  <span>{totalShipping === 0 ? 'رایگان' : (totalShipping / 1000).toLocaleString('fa-IR') + ' تومان'}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-blue-600 font-bold">
                    {(finalPrice / 1000000).toLocaleString('fa-IR')} میلیون تومان
                  </span>
                </div>
              </div>

              <button
                onClick={() => onCloseCartBatch(selectedStrategy, currentItems)}
                disabled={currentItems.length === 0}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                بستن سبد و ارسال به بخش مالی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLOSED BATCHES / FINANCIAL REVIEW */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          {/* Status Filter Cards / Tabs with Counts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterBatchStatus('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                filterBatchStatus === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>همه سبدها</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                  filterBatchStatus === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {allCount.toLocaleString('fa-IR')}
              </span>
            </button>

            <button
              onClick={() => setFilterBatchStatus('pending_review')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                filterBatchStatus === 'pending_review'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>در انتظار بررسی</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                  filterBatchStatus === 'pending_review' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {pendingCount.toLocaleString('fa-IR')}
              </span>
            </button>

            <button
              onClick={() => setFilterBatchStatus('approved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                filterBatchStatus === 'approved'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تایید شده</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                  filterBatchStatus === 'approved' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {approvedCount.toLocaleString('fa-IR')}
              </span>
            </button>

            <button
              onClick={() => setFilterBatchStatus('partially_approved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                filterBatchStatus === 'partially_approved'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-indigo-800 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <span>تایید مشروط</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                  filterBatchStatus === 'partially_approved' ? 'bg-indigo-800 text-white' : 'bg-indigo-100 text-indigo-900'
                }`}
              >
                {partialCount.toLocaleString('fa-IR')}
              </span>
            </button>

            <button
              onClick={() => setFilterBatchStatus('rejected')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                filterBatchStatus === 'rejected'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>رد شده</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                  filterBatchStatus === 'rejected' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-900'
                }`}
              >
                {rejectedCount.toLocaleString('fa-IR')}
              </span>
            </button>
          </div>

          {/* Batches Table */}
          {filteredBatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              هیچ سبد خریدی در این وضعیت وجود ندارد.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">کد رهگیری</th>
                    <th className="py-3 px-4">استراتژی</th>
                    <th className="py-3 px-4">ثبت‌کننده</th>
                    <th className="py-3 px-4">تعداد اقلام</th>
                    <th className="py-3 px-4">مبلغ کل</th>
                    <th className="py-3 px-4">وضعیت مالی</th>
                    <th className="py-3 px-4 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBatches.map((batch) => {
                    const isPending = batch.financialStatus === 'pending_review';
                    const isApproved = batch.financialStatus === 'approved';
                    const isRejected = batch.financialStatus === 'rejected';

                    return (
                      <tr key={batch.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{batch.batchCode}</td>
                        <td className="py-3 px-4 text-slate-700">{batch.strategyTitle}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {batch.closedBy}
                          <span className="block text-[10px] text-slate-400">{batch.createdAt}</span>
                        </td>
                        <td className="py-3 px-4 font-bold">{batch.itemsCount.toLocaleString('fa-IR')} قلم</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {(batch.netTotal / 1000000).toLocaleString('fa-IR')} م.ت
                        </td>
                        <td className="py-3 px-4">
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                              در انتظار بررسی
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              تایید شده
                            </span>
                          )}
                          {batch.financialStatus === 'partially_approved' && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                              تایید مشروط
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                              رد شده
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-left">
                          <button
                            onClick={() => openReviewModal(batch)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            بررسی و تایید
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REVIEW MODAL */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  بررسی سبد خرید ({selectedBatch.batchCode})
                </h3>
                <span className="text-xs text-slate-500">{selectedBatch.strategyTitle}</span>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist of Items */}
            <div className="space-y-2">
              {selectedBatch.items.map((it) => {
                const decision = itemApprovals[it.id] || { approved: true, note: '' };
                return (
                  <div
                    key={it.id}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{it.equipmentName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {it.quantity.toLocaleString('fa-IR')} عدد | {(it.unitPrice / 1000000).toLocaleString('fa-IR')} م.ت | {it.vendorName}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setItemApprovals((prev) => ({
                            ...prev,
                            [it.id]: { ...prev[it.id], approved: true },
                          }))
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          decision.approved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        تایید
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setItemApprovals((prev) => ({
                            ...prev,
                            [it.id]: { ...prev[it.id], approved: false },
                          }))
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          !decision.approved
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        رد
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Note Input */}
            <div>
              <input
                type="text"
                placeholder="یادداشت مسئول مالی (اختیاری)..."
                value={financeNote}
                onChange={(e) => setFinanceNote(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDecision('rejected')}
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold cursor-pointer"
              >
                رد کل سبد
              </button>
              <button
                onClick={() => {
                  const approvalsList = Object.values(itemApprovals) as { approved: boolean; note?: string }[];
                  const allApproved = approvalsList.length > 0 && approvalsList.every((d) => d.approved);
                  const anyApproved = approvalsList.some((d) => d.approved);
                  const finalStatus = allApproved
                    ? 'approved'
                    : anyApproved
                    ? 'partially_approved'
                    : 'rejected';
                  handleDecision(finalStatus);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                ثبت تایید نهایی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
