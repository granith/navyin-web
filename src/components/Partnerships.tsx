import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

import { useSound } from '../sound/SoundProvider';
import './Partnerships.css';

/**
 * One partnership card: a brand image with its label beneath. Assets live under
 * `public/partnerships/`.
 */
type Partner = {
  id: string;
  image: string;
  labelKey: ParseKeys;
  altKey: ParseKeys;
};

const PARTNERS: readonly Partner[] = [
  {
    id: 'aws',
    image: '/partnerships/aws.png',
    labelKey: 'partnerships.aws.label',
    altKey: 'partnerships.aws.alt',
  },
  {
    id: 'google',
    image: '/partnerships/google-cloud.png',
    labelKey: 'partnerships.google.label',
    altKey: 'partnerships.google.alt',
  },
  {
    id: 'microsoft',
    image: '/partnerships/microsoft.png',
    labelKey: 'partnerships.microsoft.label',
    altKey: 'partnerships.microsoft.alt',
  },
];

/** Min gap between hover SFX so sweeping across cards doesn't machine-gun it. */
const HOVER_THROTTLE_MS = 120;

/**
 * Partnerships: a centered 600px grid of three brand cards. Each card is an
 * image with a border that fades toward the bottom (the image itself stays
 * fully visible), and a dim label below. Cards rest at half opacity and rise
 * to full on hover, playing a sound.
 */
export function Partnerships() {
  const { t } = useTranslation();
  const { play } = useSound();

  const lastHover = useRef(0);
  const playClick = useCallback(() => {
    const now = performance.now();
    if (now - lastHover.current < HOVER_THROTTLE_MS) return;
    lastHover.current = now;
    play('click');
  }, [play]);

  return (
    <section className="partnerships" aria-label={t('partnerships.ariaLabel')}>
      <div className="partnerships__inner">
        <h2 className="partnerships__title" data-reveal data-reveal-late>
          {t('partnerships.title')}
        </h2>

        <ul className="partnerships__grid" data-reveal-fade data-reveal-late>
          {PARTNERS.map((partner, i) => (
            <li
              key={partner.id}
              className="partnerships__card"
              style={{ '--i': i } as React.CSSProperties}
              onMouseEnter={playClick}
            >
              <div className="partnerships__media">
                <img
                  className="partnerships__img"
                  src={partner.image}
                  alt={t(partner.altKey)}
                  loading="lazy"
                />
              </div>
              <p className="partnerships__label">{t(partner.labelKey)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
