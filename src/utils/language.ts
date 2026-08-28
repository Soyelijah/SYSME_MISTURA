import { Language } from '../types';

export interface LanguageMeta {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  shortLabel: string;
}

export const AVAILABLE_LANGUAGES: LanguageMeta[] = [
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    shortLabel: 'ES'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    shortLabel: 'EN'
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    shortLabel: 'NL'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    shortLabel: 'FR'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    shortLabel: 'DE'
  }
];

export const getLanguageMeta = (code: Language): LanguageMeta => {
  return AVAILABLE_LANGUAGES.find(l => l.code === code) || AVAILABLE_LANGUAGES[0];
};
