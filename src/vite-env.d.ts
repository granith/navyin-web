/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Dev override for the detected country, e.g. "de", "gb", "at". See src/i18n/countries.ts. */
  readonly VITE_COUNTRY?: string;
}
