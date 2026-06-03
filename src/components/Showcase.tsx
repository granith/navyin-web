import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

import { useSound } from '../sound/SoundProvider';
import './Showcase.css';

/**
 * One showcase column. `align` controls how the card expands on hover:
 *   - `start`  → grows rightward, covering the next column
 *   - `center` → grows both ways, covering half of each neighbour
 *   - `end`    → grows leftward, covering the previous column
 * Photos live under `public/showcase/`; they're greyscale at rest and
 * colourise on hover (see Showcase.css).
 */
type ShowcaseItem = {
  id: string;
  src: string;
  align: 'start' | 'center' | 'end';
  labelKey: ParseKeys;
  altKey: ParseKeys;
};

const ITEMS: readonly ShowcaseItem[] = [
  {
    id: 'consultants',
    src: '/showcase/consultants.jpg',
    align: 'start',
    labelKey: 'showcase.consultants.label',
    altKey: 'showcase.consultants.alt',
  },
  {
    id: 'teams',
    src: '/showcase/teams.jpg',
    align: 'center',
    labelKey: 'showcase.teams.label',
    altKey: 'showcase.teams.alt',
  },
  {
    id: 'delivery',
    src: '/showcase/delivery.jpg',
    align: 'end',
    labelKey: 'showcase.delivery.label',
    altKey: 'showcase.delivery.alt',
  },
];

/** Min gap between hover SFX so sweeping across cards doesn't machine-gun it. */
const HOVER_THROTTLE_MS = 120;

/**
 * Showcase: three greyscale photo columns. Hovering (or focusing) a card
 * expands it to span two columns, fades it into colour, plays a sound, and
 * reveals its label.
 */
export function Showcase() {
  const { t } = useTranslation();
  const { play } = useSound();

  const lastHover = useRef(0);
  const playAppear = useCallback(() => {
    const now = performance.now();
    if (now - lastHover.current < HOVER_THROTTLE_MS) return;
    lastHover.current = now;
    play('appear');
  }, [play]);

  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const onScroll = () => {
      const first = itemRefs.current[0];
      if (!first) return;
      const step = first.offsetWidth + 16; // 16px = CSS gap
      const index = Math.round(list.scrollLeft / step);
      setActiveIndex(Math.max(0, Math.min(index, ITEMS.length - 1)));
    };
    list.addEventListener('scroll', onScroll, { passive: true });
    return () => list.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="showcase" id="services" aria-label={t('showcase.ariaLabel')}>
      <ul className="showcase__list" ref={listRef}>
        {ITEMS.map((item, i) => (
          <li
            key={item.id}
            className={`showcase__item${activeIndex === i ? ' is-active' : ''}`}
            ref={(el) => { itemRefs.current[i] = el; }}
          >
            <button
              type="button"
              className={`showcase__card showcase__card--${item.align}`}
              onMouseEnter={playAppear}
              onFocus={playAppear}
            >
              <span className="showcase__media">
                <img
                  className="showcase__img"
                  src={item.src}
                  alt={t(item.altKey)}
                  loading="lazy"
                />
                <span className="showcase__scrim" aria-hidden="true" />
                <span className="showcase__label">{t(item.labelKey)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
