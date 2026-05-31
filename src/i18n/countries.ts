/**
 * Country-driven locale model. Each supported country maps to a flag asset
 * (public/flags/<code>.svg) and the language shown by default. `locked`
 * countries (US/GB) only ever see English and cannot switch language; everyone
 * else can toggle between their native language and English.
 */
export type CountryCode = 'us' | 'gb' | 'de' | 'ch' | 'dk' | 'se' | 'xk';

type CountryInfo = {
  /** File name (without extension) under public/flags. */
  flag: CountryCode;
  /** i18next language code shown for this country. */
  lang: string;
  /** US/GB share one English locale and can't switch languages. */
  locked?: boolean;
};

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  us: { flag: 'us', lang: 'en', locked: true },
  gb: { flag: 'gb', lang: 'en', locked: true },
  de: { flag: 'de', lang: 'de' },
  ch: { flag: 'ch', lang: 'de' },
  dk: { flag: 'dk', lang: 'da' },
  se: { flag: 'se', lang: 'sv' },
  xk: { flag: 'xk', lang: 'sq' },
};

/**
 * Extra ISO-3166 countries that share a supported entry's flag + language.
 * Codes already in COUNTRIES resolve to themselves — only add the rest here.
 */
const COUNTRY_ALIASES: Record<string, CountryCode> = {
  at: 'de', // Austria → German
  li: 'de', // Liechtenstein → German
  al: 'xk', // Albania → Albanian (Kosovo entry/flag)
};

/** Unknown / unlisted country → English with the US flag, locked. */
export const DEFAULT_COUNTRY: CountryCode = 'us';

/** Flag shown when a non-locked country switches to English. */
export const ENGLISH_FLAG: CountryCode = 'gb';

function toCountryCode(raw?: string | null): CountryCode | undefined {
  if (!raw) return undefined;
  const code = raw.toLowerCase();
  if (code in COUNTRIES) return code as CountryCode;
  return COUNTRY_ALIASES[code];
}

/** Region subtag from the browser locale, e.g. "en-GB" → "gb". */
function localeCountry(): CountryCode | undefined {
  const tags = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const tag of tags) {
    const code = toCountryCode(tag.split('-')[1]);
    if (code) return code;
  }
  return undefined;
}

/** Where the resolved country is cached for the rest of the browser session. */
const COUNTRY_CACHE_KEY = 'navyin:country';

function readCachedCountry(): CountryCode | undefined {
  try {
    return toCountryCode(window.sessionStorage.getItem(COUNTRY_CACHE_KEY));
  } catch {
    return undefined;
  }
}

function cacheCountry(code: CountryCode): void {
  try {
    window.sessionStorage.setItem(COUNTRY_CACHE_KEY, code);
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

/** Vercel edge geo first (first-party), then the browser locale, then default. */
async function fetchCountry(): Promise<CountryCode> {
  try {
    const res = await fetch('/api/geo', {
      headers: { accept: 'application/json' },
    });
    if (res.ok) {
      const data = (await res.json()) as { country?: string };
      // Geo succeeded: trust it. Supported → that country; otherwise default.
      if (data.country) return toCountryCode(data.country) ?? DEFAULT_COUNTRY;
    }
  } catch {
    // Edge function unavailable (e.g. local `vite dev`) — fall through.
  }
  return localeCountry() ?? DEFAULT_COUNTRY;
}

/**
 * Resolve the visitor's country, in priority order:
 *   1. VITE_COUNTRY override — for local testing (e.g. `VITE_COUNTRY=de`).
 *   2. The country cached earlier this session (avoids re-fetching every load).
 *   3. A fresh lookup (edge geo → locale → default), which is then cached.
 */
export async function detectCountry(): Promise<CountryCode> {
  const override = toCountryCode(import.meta.env.VITE_COUNTRY);
  if (override) return override;

  const cached = readCachedCountry();
  if (cached) return cached;

  const country = await fetchCountry();
  cacheCountry(country);
  return country;
}
