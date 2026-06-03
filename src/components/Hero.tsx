import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { animate, stagger } from 'motion';

import { useSound } from '../sound/SoundProvider';
import { scrollToSection } from '../lib/scroll';
import { HeroCell, type CellGraphic, type AnimatedGraphicDef } from './HeroCell';
import { EngineSvg } from './EngineSvg';
import { ApiSvg } from './ApiSvg';
import { ToggleSvg } from './ToggleSvg';
import { HeroSlider } from './HeroSlider';
import './Hero.css';

type TKey = ParseKeys;
type LabelVariant = 'normal' | 'rotated' | 'center';

type CellConfig = {
  id: string;
  gridArea: string;
  graphic?: CellGraphic;
  animatedGraphic?: AnimatedGraphicDef;
  label?: { key: TKey; variant?: LabelVariant };
};

// ---------------------------------------------------------------------------
// Per-cell animation definitions
// ---------------------------------------------------------------------------

const engineAnimation: AnimatedGraphicDef = {
  width: 334,
  height: 64,
  x: 'right',
  y: 'center',
  render: (svgRef) => <EngineSvg svgRef={svgRef} />,
  onEnter: (svg) => {
    // Phase 1: background box — fade in orange glow overlay
    const bgGlow = svg.querySelector<SVGElement>('[data-role="bg-glow"]');
    if (bgGlow) {
      animate(bgGlow, { opacity: 1 }, { duration: 0.5, ease: 'easeOut' });
    }

    // Phase 2: ENGINE text lights up
    const engineText = svg.querySelector<SVGElement>('[data-role="engine-text"]');
    if (engineText) {
      animate(engineText, { fill: '#fff' }, { duration: 0.2, delay: 0.15 });
    }

    // Phase 3: long horizontal line fires right after the text
    const longLine = svg.querySelector<SVGElement>('[data-role="long-line"]');
    if (longLine) {
      animate(longLine, { stroke: '#fff' }, { duration: 0.2, delay: 0.35 });
    }

    // Phase 4: battery rect (stroke) + indicator (fill)
    const batteryRect = svg.querySelector<SVGElement>('[data-role="battery-rect"]');
    const batteryIndicator = svg.querySelector<SVGElement>('[data-role="battery-indicator"]');
    if (batteryRect) {
      animate(batteryRect, { stroke: '#fff' }, { duration: 0.25, delay: 0.55 });
    }
    if (batteryIndicator) {
      animate(batteryIndicator, { fill: '#fff' }, { duration: 0.25, delay: 0.55 });
    }

    // Phase 5: short side lines stagger from dark → white, top to bottom
    const sideLines = Array.from(svg.querySelectorAll<SVGElement>('line:not([data-role])'));
    animate(
      sideLines,
      { stroke: '#fff' },
      { delay: stagger(0.04, { startDelay: 0.7 }), duration: 0.15, ease: 'easeOut' },
    );
  },
  // onExit omitted — engine stays lit after first hover
};

const apiAnimation: AnimatedGraphicDef = {
  width: 75,
  height: 61,
  render: (svgRef) => <ApiSvg svgRef={svgRef} />,
  onEnter: (svg) => {
    // Phase 1: label text
    const text = svg.querySelector<SVGElement>('[data-role="api-text"]');
    if (text) {
      animate(text, { fill: '#fff' }, { duration: 0.2 });
    }

    // Phase 2: circles sweep left-to-right; top-to-bottom cascade within each column
    const circles = Array.from(svg.querySelectorAll<SVGElement>('circle'));
    const columns = new Map<number, SVGElement[]>();
    for (const c of circles) {
      const cx = parseFloat(c.getAttribute('cx') ?? '0');
      if (!columns.has(cx)) columns.set(cx, []);
      columns.get(cx)!.push(c);
    }
    const sortedColumns = [...columns.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, els]) =>
        els.sort(
          (a, b) =>
            parseFloat(a.getAttribute('cy') ?? '0') - parseFloat(b.getAttribute('cy') ?? '0'),
        ),
      );

    sortedColumns.forEach((col, ci) => {
      col.forEach((circle, ri) => {
        animate(
          circle,
          { fill: 'rgba(255,255,255,0.25)', stroke: '#fff' },
          { delay: 0.2 + ci * 0.06 + ri * 0.02, duration: 0.2, ease: 'easeOut' },
        );
      });
    });
  },
};

const toggleAnimation: AnimatedGraphicDef = {
  width: 193,
  height: 147,
  render: (svgRef) => <ToggleSvg svgRef={svgRef} />,
  onEnter: (svg) => {
    const lines = Array.from(svg.querySelectorAll<SVGElement>('line')).sort(
      (a, b) => parseFloat(a.getAttribute('x1') ?? '0') - parseFloat(b.getAttribute('x1') ?? '0'),
    );
    animate(
      lines,
      { stroke: '#fff' },
      { delay: stagger(0.02), duration: 0.15, ease: 'easeOut' },
    );
  },
};

// ---------------------------------------------------------------------------

const CELLS: readonly CellConfig[] = [
  {
    id: 'engine',
    gridArea: 'engine',
    animatedGraphic: engineAnimation,
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
    animatedGraphic: apiAnimation,
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
    animatedGraphic: toggleAnimation,
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
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero__container">
        <div className="hero__content" data-reveal>
          <p className="hero__subtitle">{t('hero.subtitle')}</p>
          <h1 className="hero__title" id="hero-title">
            {t('hero.title')}
          </h1>
          <p className="hero__text">{t('hero.text')}</p>

          <div className="hero__ctas">
            <a
              className="hero__cta"
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
            >
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
            <a
              className="hero__cta"
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('services');
              }}
            >
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

        <div
          className="hero__grid-wrapper"
          data-reveal
          style={{ '--reveal-delay': '0.1s' } as React.CSSProperties}
        >
          <div
            className="hero__grid"
            role="group"
            aria-label={t('hero.grid.ariaLabel')}
          >
            {CELLS.map((cell) => {
              const graphicProps = cell.animatedGraphic
                ? { animatedGraphic: cell.animatedGraphic }
                : { graphic: cell.graphic };
              return (
                <HeroCell
                  key={cell.id}
                  gridArea={cell.gridArea}
                  {...graphicProps}
                  label={
                    cell.label && {
                      text: t(cell.label.key),
                      variant: cell.label.variant,
                    }
                  }
                  onHover={playCell}
                />
              );
            })}
          </div>
        </div>

        <div
          className="hero__slider-wrapper"
          data-reveal
          style={{ '--reveal-delay': '0.1s' } as React.CSSProperties}
        >
          <HeroSlider />
        </div>
      </div>
    </section>
  );
}
