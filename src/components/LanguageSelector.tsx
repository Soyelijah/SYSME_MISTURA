import React, { useState, useRef, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { Language } from '../types';
import { AVAILABLE_LANGUAGES, LanguageMeta } from '../utils/language';
import { sound } from '../utils/sound';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'login' | 'menu' | 'compact';
  onLanguageChange?: (lang: Language) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'navbar',
  onLanguageChange,
  className = ''
}) => {
  const { language, setLanguage, themeMode } = usePOS();
  const isLight = themeMode === 'vibrant-light';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = AVAILABLE_LANGUAGES.find(l => l.code === language) || AVAILABLE_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectLanguage = (lang: Language) => {
    sound.playTap();
    setLanguage(lang);
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  if (variant === 'menu') {
    return (
      <div className={`flex items-center gap-1 p-1 rounded-xl backdrop-blur-md bg-black/40 border border-white/20 shadow-lg ${className}`}>
        {AVAILABLE_LANGUAGES.map((item: LanguageMeta) => {
          const isActive = language === item.code;
          return (
            <button
              key={item.code}
              id={`lang-menu-btn-${item.code}`}
              onClick={() => handleSelectLanguage(item.code)}
              title={`${item.nativeName} (${item.name})`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-sm leading-none">{item.flag}</span>
              <span className="tracking-wide uppercase font-mono">{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Responsive Login / Navbar Selector (Compact Dropdown on Mobile, Pill Bar on Desktop)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Mobile view: Compact Trigger Button */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            setIsOpen(prev => !prev);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-black/25 dark:bg-slate-800 text-white rounded-xl border border-white/20 text-xs font-bold shadow-xs cursor-pointer"
        >
          <span className="text-sm leading-none">{currentLang.flag}</span>
          <span className="font-mono text-[11px] font-black">{currentLang.shortLabel}</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[150px] p-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {AVAILABLE_LANGUAGES.map((item: LanguageMeta) => {
              const isActive = language === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{item.flag}</span>
                    <span>{item.nativeName}</span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop view: Clean Horizontal Badges */}
      <div className="hidden sm:flex items-center gap-1 bg-black/20 dark:bg-slate-800/80 p-0.5 rounded-xl border border-white/20 dark:border-slate-700 shadow-inner">
        {AVAILABLE_LANGUAGES.map((item: LanguageMeta) => {
          const isActive = language === item.code;
          return (
            <button
              key={item.code}
              id={`lang-btn-${item.code}`}
              onClick={() => handleSelectLanguage(item.code)}
              title={`${item.nativeName} (${item.name})`}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-md font-extrabold scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-xs leading-none">{item.flag}</span>
              <span className="tracking-wider uppercase font-mono text-[10px] sm:text-xs">{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
