import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

import { useSound } from '../sound/SoundProvider';
import './Testimonials.css';

type Testimonial = {
  id: string;
  color: 'blue' | 'green' | 'orange';
  titleKey: ParseKeys;
  textKey: ParseKeys;
  flagSrc: string;
  flagAltKey: ParseKeys;
  authorKey: ParseKeys;
};

const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: 'healthcare',
    color: 'blue',
    titleKey: 'testimonials.healthcare.title',
    textKey: 'testimonials.healthcare.text',
    flagSrc: '/flags/us.svg',
    flagAltKey: 'testimonials.healthcare.flagAlt',
    authorKey: 'testimonials.healthcare.author',
  },
  {
    id: 'fintech',
    color: 'green',
    titleKey: 'testimonials.fintech.title',
    textKey: 'testimonials.fintech.text',
    flagSrc: '/flags/gb.svg',
    flagAltKey: 'testimonials.fintech.flagAlt',
    authorKey: 'testimonials.fintech.author',
  },
  {
    id: 'ecommerce',
    color: 'orange',
    titleKey: 'testimonials.ecommerce.title',
    textKey: 'testimonials.ecommerce.text',
    flagSrc: '/flags/se.svg',
    flagAltKey: 'testimonials.ecommerce.flagAlt',
    authorKey: 'testimonials.ecommerce.author',
  },
];

export function Testimonials() {
  const { t } = useTranslation();
  const { play } = useSound();

  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const frame = useRef(0);
  const [active, setActive] = useState(false);
  const lastHover = useRef(0);

  const playClick = useCallback(() => {
    const now = performance.now();
    if (now - lastHover.current < 120) return;
    lastHover.current = now;
    play('click');
  }, [play]);

  const handleMove = useCallback((event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      for (const card of cardRefs.current) {
        if (!card) continue;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${clientX - rect.left}px`);
        card.style.setProperty('--my', `${clientY - rect.top}px`);
      }
    });
  }, []);

  return (
    <section className="testimonials" id="testimonials" aria-label={t('testimonials.ariaLabel')}>
      <div className="testimonials__inner">
        <h2 className="testimonials__heading" data-reveal data-reveal-late>
          {t('testimonials.title')}
        </h2>

        <ul
          className={`testimonials__grid${active ? ' is-active' : ''}`}
          data-reveal-fade
          data-reveal-late
          onMouseMove={handleMove}
          onMouseEnter={() => setActive(true)}
          onMouseLeave={() => setActive(false)}
        >
          {TESTIMONIALS.map((item, i) => (
            <li
              key={item.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`testimonials__card testimonials__card--${item.color}`}
              style={{ '--i': i } as React.CSSProperties}
              onMouseEnter={playClick}
            >
              <span className="testimonials__spotlight" aria-hidden="true" />
              <p className="testimonials__title">{t(item.titleKey)}</p>
              <p className="testimonials__text">{t(item.textKey)}</p>
              <div className="testimonials__author">
                <img
                  className="testimonials__flag"
                  src={item.flagSrc}
                  alt={t(item.flagAltKey)}
                  width={32}
                  height={32}
                />
                <span className="testimonials__author-label">
                  {t(item.authorKey)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
