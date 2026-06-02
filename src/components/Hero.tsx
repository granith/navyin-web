import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

import { useSound } from '../sound/SoundProvider';
import { HeroCell, type CellGraphic } from './HeroCell';
import './Hero.css';

type TKey = ParseKeys;
type LabelVariant = 'normal' | 'rotated' | 'center';

/**
 * One bento tile's data. `gridArea` maps onto the named areas in Hero.css.
 * A cell can carry a positioned graphic, a label, or both:
 *   - graphic: intrinsic `width`/`height` in px, anchored by `x`/`y`
 *     (default center/center) with optional `dx`/`dy` px offsets from the
 *     anchored edge.
 *   - label: `normal` (top-left) or `rotated` (right edge, -90°).
 */
type CellConfig = {
  id: string;
  gridArea: string;
  graphic?: CellGraphic;
  label?: { key: TKey; variant?: LabelVariant };
};

/**
 * Real per-cell artwork lands under `public/hero/`; until then every graphic
 * points at the shared placeholder. The sizes/anchors below are examples that
 * exercise each capability (edge + center anchors, an offset, a rotated label,
 * and a graphic-only cell) — swap in the real values per asset.
 */
const CELLS: readonly CellConfig[] = [
  {
    id: 'engine',
    gridArea: 'engine',
    graphic: {
      width: 334,
      height: 64,
      x: 'right',
      y: 'center',
      src: '/hero/engine.svg',
      srcLit: '/hero/engine-lit.svg',
    },
  },
  {
    id: 'global',
    gridArea: 'global',
    graphic: {
      width: 76,
      height: 76,
      src: '/hero/global.png',
      srcLit: '/hero/global-lit.png',
    },
    label: { key: 'hero.grid.global', variant: 'center' },
  },
  {
    id: 'api',
    gridArea: 'api',
    graphic: {
      width: 75,
      height: 61,
      src: '/hero/api.svg',
      srcLit: '/hero/api-lit.svg',
    },
  },
  {
    id: 'ai',
    gridArea: 'ai',
    graphic: {
      width: 76,
      height: 76,
      src: '/hero/ai.png',
      srcLit: '/hero/ai-lit.png',
    },
    label: { key: 'hero.grid.ai', variant: 'rotated' },
  },
  {
    id: 'toggle',
    gridArea: 'toggle',
    graphic: {
      width: 196,
      height: 148,
      src: '/hero/toggle.svg',
      srcLit: '/hero/toggle-lit.svg',
    },
  },
  {
    id: 'watch',
    gridArea: 'watch',
    graphic: {
      width: 134,
      height: 212,
      x: 'center',
      y: 'bottom',
      dy: 27,
      src: '/hero/watch.png',
      srcLit: '/hero/watch-lit.png',
    },
    label: { key: 'hero.grid.watch' },
  },
  {
    id: 'phone',
    gridArea: 'phone',
    graphic: {
      width: 156,
      height: 320,
      x: 'center',
      y: 'bottom',
      dy: 27,
      src: '/hero/phone.png',
      srcLit: '/hero/phone-lit.png',
    },
    label: { key: 'hero.grid.phone' },
  },
  {
    id: 'web',
    gridArea: 'web',
    graphic: {
      width: 213,
      height: 408,
      x: 'left',
      y: 'bottom',
      dy: 27,
      src: '/hero/web.png',
      srcLit: '/hero/web-lit.png',
    },
    label: { key: 'hero.grid.web' },
  },
];

/** Min gap between hover SFX so sweeping across tiles doesn't machine-gun it. */
const HOVER_THROTTLE_MS = 90;

/**
 * Hero: content on the left (subtitle / title / text / two CTAs), the bento
 * "behemoth" on the right. Each tile lights up and plays a sound on hover.
 */
export function Hero() {
  const { t } = useTranslation();
  const { play } = useSound();

  const lastHover = useRef(0);
  const playCell = useCallback(() => {
    const now = performance.now();
    if (now - lastHover.current < HOVER_THROTTLE_MS) return;
    lastHover.current = now;
    play('cell');
  }, [play]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__container">
        <div className="hero__content">
          <p className="hero__subtitle">{t('hero.subtitle')}</p>
          <h1 className="hero__title" id="hero-title">
            {t('hero.title')}
          </h1>
          <p className="hero__text">{t('hero.text')}</p>

          <div className="hero__ctas">
            <a className="hero__cta" href="#services">
              <span className="hero__cta-label">{t('hero.ctaPrimary')}</span>
              <span className="hero__cta-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
            <a className="hero__cta" href="#contact">
              <span className="hero__cta-label">{t('hero.ctaSecondary')}</span>
              <span className="hero__cta-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>

        <div className="hero__grid-wrapper">
          <div
            className="hero__grid"
            role="group"
            aria-label={t('hero.grid.ariaLabel')}
          >
            {CELLS.map((cell) => (
              <HeroCell
                key={cell.id}
                gridArea={cell.gridArea}
                graphic={
                  cell.graphic && {
                    ...cell.graphic,
                  }
                }
                label={
                  cell.label && {
                    text: t(cell.label.key),
                    variant: cell.label.variant,
                  }
                }
                onHover={playCell}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
