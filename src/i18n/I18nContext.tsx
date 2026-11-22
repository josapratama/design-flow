import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Locale, TranslationDictionary } from './types';
import id from './locales/id.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

const LOCALES: Record<Locale, TranslationDictionary> = {
  id: id as unknown as TranslationDictionary,
  en: en as unknown as TranslationDictionary,
  ja: ja as unknown as TranslationDictionary,
};

export interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (keyPath: string, vars?: Record<string, string | number>) => string;
  dict: TranslationDictionary;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'designflow_locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'id' || saved === 'en' || saved === 'ja') return saved;
    } catch {}
    return 'id';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {}
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState(prev => {
      const order: Locale[] = ['id', 'en', 'ja'];
      const nextIdx = (order.indexOf(prev) + 1) % order.length;
      const next = order[nextIdx];
      try {
        localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.lang = next;
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const dict = LOCALES[locale] || LOCALES.id;

  const t = useCallback(
    (keyPath: string, vars?: Record<string, string | number>): string => {
      const keys = keyPath.split('.');
      let val: any = dict;
      for (const k of keys) {
        if (val && typeof val === 'object' && k in val) {
          val = val[k];
        } else {
          // Fallback to Indonesian if key is missing in target locale
          let fallbackVal: any = LOCALES.id;
          for (const fk of keys) {
            if (fallbackVal && typeof fallbackVal === 'object' && fk in fallbackVal) {
              fallbackVal = fallbackVal[fk];
            } else {
              return keyPath;
            }
          }
          val = fallbackVal;
          break;
        }
      }

      if (typeof val !== 'string') return keyPath;

      if (vars) {
        let result = val;
        for (const [k, v] of Object.entries(vars)) {
          result = result.replace(new RegExp(`{${k}}`, 'g'), String(v));
        }
        return result;
      }

      return val;
    },
    [dict]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale, t, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}

/**
 * Modern Language Switcher UI component
 * Supports ID, EN, and JA
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: 'id', label: 'ID', flag: '🇮🇩' },
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'ja', label: 'JA', flag: '🇯🇵' },
  ];

  return (
    <div className={`inline-flex items-center gap-0.5 bg-slate-900/60 p-0.5 rounded-lg border border-slate-800 ${className}`}>
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          className={`px-2 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
            locale === l.code
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title={l.label}
        >
          <span className="text-[11px]">{l.flag}</span>
          <span>{l.label}</span>
        </button>
      ))}
    </div>
  );
}
