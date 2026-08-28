import React from 'react';
import { usePOS } from '../context/POSContext';
import { Language } from '../types';
import { AVAILABLE_LANGUAGES, LanguageMeta } from '../utils/language';
import { sound } from '../utils/sound';
import { Globe, Check } from 'lucide-react';

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

  const handleSelectLanguage = (lang: Language) => {
    sound.playTap();
    setLanguage(lang);
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95 ${
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

  if (variant === 'login') {
    return (
      <div className={`flex items-center gap-1 bg-black/25 dark:bg-slate-800/90 p-1 rounded-xl border border-white/20 dark:border-slate-700 shadow-inner ${className}`}>
        {AVAILABLE_LANGUAGES.map((item: LanguageMeta) => {
          const isActive = language === item.code;
          return (
            <button
              key={item.code}
              id={`lang-login-btn-${item.code}`}
              onClick={() => handleSelectLanguage(item.code)}
              title={`${item.nativeName} (${item.name})`}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all active:scale-95 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-sm leading-none">{item.flag}</span>
              <span className="tracking-wider uppercase font-mono">{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default 'navbar' & 'compact'
  return (
    <div
      className={`flex items-center gap-0.5 bg-black/25 p-0.5 rounded-xl border border-white/20 shadow-inner ${className}`}
      title="Cambiar idioma del sistema"
    >
      {AVAILABLE_LANGUAGES.map((item: LanguageMeta) => {
        const isActive = language === item.code;
        return (
          <button
            key={item.code}
            id={`lang-nav-btn-${item.code}`}
            onClick={() => handleSelectLanguage(item.code)}
            title={`${item.nativeName} - ${item.name}`}
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-black rounded-lg uppercase transition-all active:scale-95 ${
              isActive
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'text-white/80 hover:text-white hover:bg-white/15'
            }`}
          >
            <span className="text-xs leading-none">{item.flag}</span>
            <span className="tracking-wider font-mono">{item.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
};
