import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import de from './locales/de.json';
import da from './locales/da.json';
import sv from './locales/sv.json';
import sq from './locales/sq.json';

/**
 * Translation bundles for every language the country model can select (see
 * src/i18n/countries.ts). English is the source of truth and the fallback; the
 * others start empty and fall back to English until translated. Registering a
 * bundle for each supported language (even an empty one) keeps i18next from
 * treating a language as "not ready", so switching re-renders cleanly.
 *
 * To translate a language: fill in its JSON file with the same keys as en.json.
 */
export const resources = {
  en: { translation: en },
  de: { translation: de },
  da: { translation: da },
  sv: { translation: sv },
  sq: { translation: sq }
} as const;

/**
 * Country detection and the active language are driven by <CountryProvider> —
 * there's no auto-detector here.
 */
i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'de', 'da', 'sv', 'sq'],
  nonExplicitSupportedLngs: true,
  interpolation: { escapeValue: false }
});

export default i18n;
