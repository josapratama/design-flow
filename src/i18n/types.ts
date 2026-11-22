export type Locale = 'id' | 'en' | 'ja';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}
