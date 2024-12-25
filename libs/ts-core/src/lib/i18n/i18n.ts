import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './en/translation.json';
import translationKR from './kr/translation.json';

console.log(translationEN)

const resources = {
  en: {
    translation: translationEN,
  },
  kr: {
    translation: translationKR,
  },
};

i18n
  // .use(HttpBackend)
  // .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources,
    react: {
      useSuspense: true
    }
    // backend: {
    //   loadPath: '/locales/{{lng}}/{{ns}}.json',
    // },
  });

export default i18n;
