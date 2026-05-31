# Navyin

Boilerplate for a fast, animated, multilingual **one-page** static site.
Vite + React + TypeScript, animated with [Motion](https://motion.dev), localized
with [react-i18next](https://react.i18next.com), deployable as pure static
assets (Vercel-ready).

## Stack

| Concern   | Choice                                      |
| --------- | ------------------------------------------- |
| Build     | Vite 6                                       |
| UI        | React 19 + TypeScript                        |
| Animation | Motion (`motion/react`)                      |
| i18n      | i18next + react-i18next + language detector  |
| Sound     | Web Audio API (no deps, synth or file-based) |
| Content   | JSON locale files (CMS-ready)                |
| Hosting   | Static build → Vercel / Netlify / any CDN    |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to /dist
npm run preview  # serve the production build locally
```

## What's wired up

```
src/
├── main.tsx                 # entry: mounts <App>, loads i18n + styles
├── App.tsx                  # placeholder page (one Motion example)
├── i18n/
│   ├── config.ts            # i18next setup + supported-locale list
│   ├── i18next.d.ts         # types t() against en.json
│   └── locales/             # ← all copy lives here, one file per language
│       ├── en.json
│       ├── es.json
│       └── fr.json
├── components/
│   └── LanguageSwitcher.tsx # animated segmented control
├── sound/
│   ├── sounds.ts            # sound registry (synth specs or file URLs)
│   ├── engine.ts            # Web Audio engine (autoplay-policy safe)
│   ├── SoundProvider.tsx    # context + useSound() / useUiSound() hooks
│   └── SoundToggle.tsx      # persisted mute button
└── styles/global.css        # tokens + minimal layout
```

This is intentionally bare — `App.tsx` just renders a title/tagline pulled from
the locale files with a small Motion fade-in, plus the language switcher. Build
your actual page out from there.

## Editing content

All visible text lives in `src/i18n/locales/*.json`, mirrored per language.
Components read it via `t("app.title")`, so updating copy never touches JSX.

### Add a language

1. Copy `en.json` → e.g. `de.json` and translate the values.
2. In `src/i18n/config.ts`, import it and add an entry to `locales` and
   `resources`.

The switcher and `<html lang>` sync pick it up automatically.

## Sound effects (hover / click)

A small Web Audio system lives in `src/sound/`. It works out of the box with
**synthesized** UI ticks — no asset files required — and respects the browser
autoplay policy (the audio context unlocks on the first user gesture).

Add sound to any element with the `useUiSound()` handlers:

```tsx
import { useUiSound } from "./sound/SoundProvider";

function Buy() {
  return <button {...useUiSound()}>Buy</button>; // hover + click sounds
}
```

Or fire a specific sound imperatively:

```tsx
const { play } = useSound();
play("click");
```

**Mute / preference:** `<SoundToggle>` persists the choice to `localStorage`
and defaults to off when the user has `prefers-reduced-motion` set.

**Use real audio files instead of synth:** drop files in `public/sounds/` and
point a sound at them in `src/sound/sounds.ts`:

```ts
click: { kind: "file", src: "/sounds/click.mp3" },
```

Add new named sounds by extending the `sounds` map and the `SoundName` union in
the same file.

## Adding a CMS later

Content is already structured as data, so swapping the static JSON imports in
`config.ts` for fetched content (Sanity, Contentful, Storyblok, …) is a
localized change — components stay the same.

## Deploying to Vercel

`vercel.json` sets the framework, build command, and output dir. Push to a Git
repo and import it in Vercel (or run `vercel`). Ships as fully static assets, no
config needed.
