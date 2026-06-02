import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

import { useSound } from '../sound/SoundProvider';
import './Technologies.css';

/**
 * One technology: a white monochrome brand SVG shown inside a hexagon. Assets
 * live under `public/technologies/` and are already white-filled, so we render
 * them straight through an <img>.
 */
type Tech = {
  id: string;
  icon: string;
  altKey: ParseKeys;
};

const TECHS: readonly Tech[] = [
  { id: 'apple', icon: '/technologies/apple.svg', altKey: 'technologies.apple.alt' },
  { id: 'android', icon: '/technologies/android.svg', altKey: 'technologies.android.alt' },
  { id: 'flutter', icon: '/technologies/flutter.svg', altKey: 'technologies.flutter.alt' },
  { id: 'docker', icon: '/technologies/docker.svg', altKey: 'technologies.docker.alt' },
  { id: 'vue', icon: '/technologies/vue.svg', altKey: 'technologies.vue.alt' },
  { id: 'playwright', icon: '/technologies/playwright.svg', altKey: 'technologies.playwright.alt' },
  { id: 'python', icon: '/technologies/python.svg', altKey: 'technologies.python.alt' },
  { id: 'aws', icon: '/technologies/aws.svg', altKey: 'technologies.aws.alt' },
  { id: 'cypress', icon: '/technologies/cypress.svg', altKey: 'technologies.cypress.alt' },
  { id: 'react', icon: '/technologies/react.svg', altKey: 'technologies.react.alt' },
  { id: 'nodejs', icon: '/technologies/nodejs.svg', altKey: 'technologies.nodejs.alt' },
  { id: 'java', icon: '/technologies/java.svg', altKey: 'technologies.java.alt' },
  { id: 'google-cloud', icon: '/technologies/google-cloud.svg', altKey: 'technologies.googleCloud.alt' },
  { id: 'nextjs', icon: '/technologies/nextjs.svg', altKey: 'technologies.nextjs.alt' },
];

/** Hexagons per row; the screenshot lays the fourteen icons out as 7 + 7. */
const ROW_SIZE = 7;
const ROWS: readonly (readonly Tech[])[] = (() => {
  const rows: Tech[][] = [];
  for (let i = 0; i < TECHS.length; i += ROW_SIZE) {
    rows.push(TECHS.slice(i, i + ROW_SIZE));
  }
  return rows;
})();

/** Min gap between hover SFX so sweeping across hexagons doesn't machine-gun it. */
const HOVER_THROTTLE_MS = 120;

/**
 * Technologies: the same centered title as Partnerships above a honeycomb of
 * pointy-top hexagons (44×48, 2px white border, #1C1C1B fill) holding brand
 * icons. Hovering the grid casts a magic-bento "spotlight" — a soft radial
 * glow that follows the cursor. Each cell paints the same glow in its own
 * local coordinates (`--mx`/`--my` = pointer position relative to that cell),
 * clipped to the hexagon, so the light reads as one continuous beam sweeping
 * across the grid while the 2px gaps stay dark.
 */
export function Technologies() {
  const { t } = useTranslation();
  const { play } = useSound();

  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frame = useRef(0);
  const [active, setActive] = useState(false);

  // The hover SFX fires once when the pointer enters the grid (not per icon),
  // throttled so a quick exit/re-enter sweep doesn't machine-gun it.
  const lastHover = useRef(0);
  const playEquip = useCallback(() => {
    const now = performance.now();
    if (now - lastHover.current < HOVER_THROTTLE_MS) return;
    lastHover.current = now;
    play('equip');
  }, [play]);

  // Write each cell's pointer-relative coords so its spotlight gradient lines
  // up with its neighbours. Reads are batched in one rAF tick to avoid layout
  // thrash from interleaving getBoundingClientRect with style writes.
  const handleMove = useCallback((event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      for (const cell of cellRefs.current) {
        if (!cell) continue;
        const rect = cell.getBoundingClientRect();
        cell.style.setProperty('--mx', `${clientX - rect.left}px`);
        cell.style.setProperty('--my', `${clientY - rect.top}px`);
      }
    });
  }, []);

  return (
    <section className="technologies" aria-label={t('technologies.ariaLabel')}>
      <div className="technologies__inner">
        <h2 className="technologies__title">{t('technologies.title')}</h2>

        <div
          ref={gridRef}
          className={`technologies__grid${active ? ' is-active' : ''}`}
          onMouseMove={handleMove}
          onMouseEnter={() => {
            setActive(true);
            playEquip();
          }}
          onMouseLeave={() => setActive(false)}
        >
          {ROWS.map((row, r) => (
            <div className="technologies__row" key={r}>
              {row.map((tech, i) => (
                <div
                  key={tech.id}
                  ref={(el) => {
                    cellRefs.current[r * ROW_SIZE + i] = el;
                  }}
                  className="technologies__cell"
                >
                  <svg
                    className="technologies__hex"
                    viewBox="0 0 44 48"
                    aria-hidden="true"
                  >
                    {/* Rounded pointy-top hexagon. Keep in sync with the
                        clip-path in Technologies.css. */}
                    <path d="M 18.90 2.62 Q 22.00 1.00 25.10 2.62 L 39.90 10.38 Q 43.00 12.00 43.00 15.50 L 43.00 32.50 Q 43.00 36.00 39.90 37.62 L 25.10 45.38 Q 22.00 47.00 18.90 45.38 L 4.10 37.62 Q 1.00 36.00 1.00 32.50 L 1.00 15.50 Q 1.00 12.00 4.10 10.38 Z" />
                  </svg>

                  <span className="technologies__spotlight" aria-hidden="true" />

                  <img
                    className="technologies__icon"
                    src={tech.icon}
                    alt={t(tech.altKey)}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
