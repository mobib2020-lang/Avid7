import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  ArrowRightLeft,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { AppUser, ChatMessage, PageId } from '../types';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AppUser;
  setActivePage: (page: PageId) => void;
  contextSummary?: Record<string, any>;
  equipmentList?: any[];
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  setActivePage,
  contextSummary = {},
}) => {
  const userName = currentUser?.name || 'کاربر';

  const defaultGreeting: ChatMessage = {
    id: `m-welcome-${currentUser?.id || 'guest'}`,
    sender: 'assistant',
    text: `سلام ${userName} عزیز! من دستیار هوشمند اختصاصی آوید مد اکویپ هستم. تمام داده‌های بیمارستان (انبار، کالیبراسیون، خرابی‌ها، سفارشات) را زیر نظر دارم. چطور می‌توانم کمکتان کنم؟`,
    timestamp: new Date().toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    suggestedActions: [
      { label: 'بررسی کالیبراسیون‌های فوری', page: 'calibration' },
      { label: 'بهینه‌سازی سبد هوشمند AI', page: 'smart_cart' },
      { label: 'پیگیری خرابی‌های اورژانس', page: 'failures' },
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultGreeting]);

  // When currentUser changes (e.g. switching accounts/roles), update initial greeting
  useEffect(() => {
    setMessages([
      {
        id: `m-welcome-${currentUser?.id || 'guest'}-${Date.now()}`,
        sender: 'assistant',
        text: `سلام ${userName} عزیز! من دستیار هوشمند اختصاصی آوید مد اکویپ هستم. تمام داده‌های بیمارستان (انبار، کالیبراسیون، خرابی‌ها، سفارشات) را زیر نظر دارم. چطور می‌توانم کمکتان کنم؟`,
        timestamp: new Date().toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        suggestedActions: [
          { label: 'بررسی کالیبراسیون‌های فوری', page: 'calibration' },
          { label: 'بهینه‌سازی سبد هوشمند AI', page: 'smart_cart' },
          { label: 'پیگیری خرابی‌های اورژانس', page: 'failures' },
        ],
      },
    ]);
  }, [currentUser?.id, currentUser?.name]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userRole: currentUser?.roleFa || 'کاربر',
          contextSummary,
        }),
      });

      const data = await res.json();

      let actions: { label: string; page: PageId }[] = [];
      if (query.includes('کالیبراسیون') || query.includes('منقضی')) {
        actions.push({ label: 'مشاهده صفحه کالیبراسیون', page: 'calibration' });
      } else if (query.includes('خرید') || query.includes('سبد')) {
        actions.push({ label: 'مشاهده سبد هوشمند AI', page: 'smart_cart' });
      } else if (query.includes('خرابی') || query.includes('تعمیر')) {
        actions.push({ label: 'مشاهده گزارش خرابی‌ها', page: 'failures' });
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'پاسخی از دستیار دریافت نشد.',
        timestamp: new Date().toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        suggestedActions: actions.length > 0 ? actions : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'خطا در برقراری ارتباط با مدل هوشمند. سیستم در حالت بررسی داده‌های محلی است.',
          timestamp: 'لحظاتی قبل',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'کدام دستگاه‌ها نیازمند کالیبراسیون فوری هستند؟',
    'چگونه سبد خرید را از نظر قیمت و تخفیف بهینه‌سازی کنم؟',
    'وضعیت خرابی مانیتورینگ اورژانس در چه مرحله‌ای است؟',
    'لیست بهترین تامین‌کنندگان با بالاترین SLA چیست؟',
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-r border-slate-200 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-[#2b64f6] to-[#1d52d8] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">دستیار هوشمند AI آوید</h3>
              <p className="text-[11px] text-sky-100 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>متصل به پایگاه داده بیمارستان</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <p className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>پرسش‌های پیشنهادی سریع:</span>
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 font-medium transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] ${isBot ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isBot
                        ? 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tr-none'
                        : 'bg-sky-600 text-white font-medium rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Suggested Quick Action Buttons */}
                  {isBot && msg.suggestedActions && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (act.page) setActivePage(act.page);
                            onClose();
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold border border-sky-200 flex items-center gap-1.5 transition-colors"
                        >
                          <span>{act.label}</span>
                          <ArrowRightLeft className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 mt-1 block px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                    {userName.charAt(0)}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tr-none shadow-xs flex items-center gap-2 text-xs text-slate-600">
                <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                <span>در حال تحلیل داده‌های بیمارستان...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="سوال فنی، تحلیل انبار یا کالیبراسیون را بپرسید..."
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 border border-transparent focus:border-sky-400 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            دستیار AI بر اساس داده‌های تحلیلی تجهیزات بیمارستان آوید پاسخ می‌دهد.
          </p>
        </div>
      </div>
    </div>
  );
};
