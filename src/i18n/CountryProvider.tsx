import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import i18n from "./config";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  ENGLISH_FLAG,
  detectCountry,
  type CountryCode,
} from "./countries";

/** Where the user's explicit native↔English toggle is remembered. */
const STORAGE_KEY = "navyin:lang";

type CountryContextValue = {
  /** Detected country code — drives which flag is shown. */
  country: CountryCode;
  /** Path to the flag asset, e.g. "/flags/gb.svg". */
  flag: string;
  /** Active language code. */
  lang: string;
  /** This country's native language. */
  nativeLang: string;
  /** US/GB — language switching is disabled. */
  locked: boolean;
  /** Whether English is currently active. */
  isEnglish: boolean;
  /** Toggle between the native language and English (no-op when locked). */
  toggle: () => void;
};

const CountryContext = createContext<CountryContextValue | null>(null);

function readStoredLang(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [lang, setLang] = useState<string>(() => i18n.resolvedLanguage ?? "en");

  // Detect the country once on mount, then pick the starting language.
  useEffect(() => {
    let cancelled = false;
    void detectCountry().then((detected) => {
      if (cancelled) return;
      const info = COUNTRIES[detected];
      const stored = readStoredLang();
      // Locked countries are always English; others honor a saved toggle
      // (but only if it still matches this country's two valid choices).
      const target =
        !info.locked && stored && (stored === "en" || stored === info.lang)
          ? stored
          : info.locked
            ? "en"
            : info.lang;
      setCountry(detected);
      setLang(target);
      void i18n.changeLanguage(target);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CountryContextValue>(() => {
    const info = COUNTRIES[country];
    const isEnglish = lang === "en";
    // The flag follows the active language: the country's own flag normally,
    // but the English flag once a (non-locked) country switches to English.
    // US/GB are locked, so they always keep their own flag.
    const flagCode = info.locked || !isEnglish ? info.flag : ENGLISH_FLAG;
    return {
      country,
      flag: `/flags/${flagCode}.svg`,
      lang,
      nativeLang: info.lang,
      locked: Boolean(info.locked),
      isEnglish,
      toggle: () => {
        if (info.locked) return;
        const next = lang === "en" ? info.lang : "en";
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignore storage failures */
        }
        setLang(next);
        void i18n.changeLanguage(next);
      },
    };
  }, [country, lang]);

  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
}

export function useCountry(): CountryContextValue {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within <CountryProvider>");
  return ctx;
}
