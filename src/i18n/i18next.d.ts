import 'i18next';
import type en from './locales/en.json';

/**
 * Types the `t()` function and `useTranslation` keys against the English
 * locale, so editing content gets autocomplete and compile-time checks.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}
