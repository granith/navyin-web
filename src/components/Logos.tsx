import { useTranslation } from 'react-i18next';

import './Logos.css';

const LOGOS = [
  { id: 'logo1', src: '/logos/logo-1.png' },
  { id: 'logo2', src: '/logos/logo-2.png' },
  { id: 'logo3', src: '/logos/logo-3.png' },
  { id: 'logo4', src: '/logos/logo-4.png' },
  { id: 'logo5', src: '/logos/logo-5.png' }
] as const;

export function Logos() {
  const { t } = useTranslation();

  return (
    <section className="logos" aria-label={t('logos.ariaLabel')}>
      <div className="logos__track-wrap">
        <ul className="logos__track">
          {([false, true] as const).flatMap((isDup) =>
            LOGOS.map((logo, i) => (
              <li
                key={isDup ? `${logo.id}-dup` : logo.id}
                className="logos__item"
                aria-hidden={isDup ? 'true' : undefined}
              >
                <img
                  className="logos__img"
                  src={logo.src}
                  alt={isDup ? '' : t('logos.alt', { index: i + 1 })}
                  loading="lazy"
                />
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
