# Project conventions

## Localization — non-negotiable

**Every user-facing string must be localized.** No hardcoded display text in
components — that includes visible copy, tooltips, `aria-label`/`title`, alt
text, placeholders, and button labels.

How it works here:

- Translations live in `src/i18n/locales/*.json`. **`en.json` is the source of
  truth and the fallback**, and it also types the `t()` keys (see
  `src/i18n/i18next.d.ts`) — so a key must exist in `en.json` before `t('...')`
  will compile.
- `de`, `da`, `sv`, and `sq` start empty and fall back to English.
- **Do not translate strings into other languages unless explicitly asked.**
  Add the key to `en.json` only and let the fallback handle the rest — never
  write into `de`/`da`/`sv`/`sq` (or add new locales) on your own initiative.
- Render strings with `useTranslation()` → `t('some.key')`. For lists, store a
  `labelKey` on each item and call `t(item.labelKey)` (see `Navbar` and
  `Footer`).
- Use `{{var}}` interpolation rather than string concatenation
  (e.g. `t('footer.copyright', { year })`).

When adding any new string: add the key to `en.json` only, then reference it
via `t()`. Never inline the literal, and never auto-translate it into the other
locales.

## Component structure

- Components are `.tsx` + `.css` pairs in `src/components/`, BEM-style class
  names (`block__element`, `is-active`).
- Design tokens (colors, fonts, easing) live as CSS custom properties in
  `:root` in `src/styles/global.css` — use `var(--token)`, don't hardcode.
- This is a Vite + React + TypeScript app (not Astro). The UI uses a macOS
  desktop metaphor: `Navbar` = menu bar, `Footer` = Dock.
