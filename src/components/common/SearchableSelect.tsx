import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Plus, Check, X } from 'lucide-react';

export interface SelectOption {
  id: string;
  name: string;
  description?: string;
  code?: string;
}

interface SearchableSelectProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  selectedValueId: string | null;
  onSelect: (id: string) => void;
  onCreateNew?: () => void;
  createNewText?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder = 'انتخاب کنید...',
  options,
  selectedValueId,
  onSelect,
  onCreateNew,
  createNewText,
  disabled = false,
  required = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === selectedValueId);

  const filteredOptions = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="block text-xs font-bold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-right text-xs transition-all ${
          disabled
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : isOpen
            ? 'border-[#2b64f6] ring-2 ring-blue-500/20 bg-white shadow-xs'
            : error
            ? 'border-rose-300 bg-rose-50/30 text-slate-800'
            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
        }`}
      >
        <span className={`truncate font-medium ${selectedOption ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#2b64f6]' : ''
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو..."
              className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-72 sm:max-h-80 overflow-y-auto p-1 divide-y divide-slate-100">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.id === selectedValueId;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSelect(opt.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-right text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-[#2b64f6] font-extrabold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="overflow-hidden pr-1">
                      <div className="font-bold truncate">{opt.name}</div>
                      {opt.description && (
                        <div className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                          {opt.description}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#2b64f6] shrink-0 mr-2" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                موردی با این عنوان پیدا نشد
              </div>
            )}
          </div>

          {/* Create New Action Option */}
          {onCreateNew && createNewText && (
            <div className="p-1 border-t border-slate-100 bg-blue-50/40">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm('');
                  onCreateNew();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#2b64f6] hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>{createNewText}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[10px] text-rose-500 font-medium pt-0.5">{error}</p>}
    </div>
  );
};
