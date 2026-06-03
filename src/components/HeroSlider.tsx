import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

import { useSound } from '../sound/SoundProvider';
import './HeroSlider.css';

type TKey = ParseKeys;

type Slide = {
  id: string;
  labelKey: TKey;
  src: string;
  srcLit: string;
};

const SLIDES: readonly Slide[] = [
  {
    id: 'watch',
    labelKey: 'hero.grid.watch',
    src: '/hero/watch.png',
    srcLit: '/hero/watch-lit.png',
  },
  {
    id: 'phone',
    labelKey: 'hero.grid.phone',
    src: '/hero/phone.png',
    srcLit: '/hero/phone-lit.png',
  },
  {
    id: 'web',
    labelKey: 'hero.grid.web',
    src: '/hero/web.png',
    srcLit: '/hero/web-lit.png',
  },
];

/** Delay before lighting up the first slide after the slider scrolls into view. */
const INITIAL_LIT_DELAY = 1500;

/**
 * Delay after navigation before lighting up the incoming slide.
 * Should be >= the track transition duration so the slide is fully in
 * view (and the outgoing slide fully off-screen) before the lit fade starts.
 */
const NAV_LIT_DELAY = 500;

export function HeroSlider() {
  const { t } = useTranslation();
  const { play } = useSound();
  const [activeIndex, setActiveIndex] = useState(0);

  // Tracks which slide is in its lit state. null = all slides dim.
  // Kept separate from activeIndex so navigating dims everything first,
  // then re-lights only after the slide transition completes.
  const [litIndex, setLitIndex] = useState<number | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const litTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Observe when the slider enters the viewport, then light up slide 0 after a delay.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    let visTimer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visTimer = setTimeout(() => setLitIndex(activeRef.current), INITIAL_LIT_DELAY);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => {
      clearTimeout(visTimer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => () => clearTimeout(litTimer.current), []);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      clearTimeout(litTimer.current);
      // Dim everything immediately so neither slide glows during the track transition.
      setLitIndex(null);
      const next = (activeRef.current + dir + SLIDES.length) % SLIDES.length;
      activeRef.current = next;
      setActiveIndex(next);
      play('cell');
      // Light up the incoming slide once it has fully slid into view.
      litTimer.current = setTimeout(() => setLitIndex(next), NAV_LIT_DELAY);
    },
    [play],
  );

  return (
    <div
      className="hero-slider"
      ref={wrapperRef}
      role="group"
      aria-label={t('hero.grid.ariaLabel')}
    >
      <div
        className="hero-slider__track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <div
            className={`hero-slider__slide${litIndex === i ? ' is-active' : ''}`}
            key={slide.id}
          >
            <span className="hero-slider__label">{t(slide.labelKey)}</span>
            <div className="hero-slider__graphic">
              <img
                className="hero-slider__img hero-slider__img--base"
                src={slide.src}
                alt=""
              />
              <img
                className="hero-slider__img hero-slider__img--lit"
                src={slide.srcLit}
                alt=""
              />
            </div>
          </div>
        ))}
      </div>

      <button
        className="hero-slider__nav hero-slider__nav--prev"
        onClick={() => navigate(-1)}
        aria-label={t('hero.slider.prevSlide')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        className="hero-slider__nav hero-slider__nav--next"
        onClick={() => navigate(1)}
        aria-label={t('hero.slider.nextSlide')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
