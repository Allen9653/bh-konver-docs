import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import bs from './locales/bs.json';
import en from './locales/en.json';
import de from './locales/de.json';
import tr from './locales/tr.json';

const resources = {
  bs: { translation: bs },
  en: { translation: en },
  de: { translation: de },
  tr: { translation: tr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'bs',
    lng: localStorage.getItem('language') || 'bs',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
