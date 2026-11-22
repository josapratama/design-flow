/**
 * Polyglot Hub Integration Bridge
 * Re-exports the enterprise I18n engine powered by Polyglot Hub
 */
export { I18nProvider, I18nProvider as PolyglotProvider, useI18n, useI18n as useTranslation, LanguageSwitcher } from './I18nContext';
export type { Locale, TranslationDictionary } from './types';
