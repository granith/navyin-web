import { useTranslation } from 'react-i18next';

import './Logos.css';

/**
 * Client / partner logo strip — assets live in `public/logos/`.
 * Each logo is normalized to a max height (see Logos.css) and sits at its
 * natural width.
 * TODO: replace the generic alt text with the real company names once known.
 */
const LOGOS = [
  { id: 'logo1', src: '/logos/logo-1.png' },
  { id: 'logo2', src: '/logos/logo-2.png' },
  { id: 'logo3', src: '/logos/logo-3.png' },
  { id: 'logo4', src: '/logos/logo-4.png' },
  { id: 'logo5', src: '/logos/logo-5.png' }
] as const;

/**
 * Logos: a centered 980px strip showing up to five logos per row.
 */
export function Logos() {
  const { t } = useTranslation();

  return (
    <section className="logos" aria-label={t('logos.ariaLabel')}>
      <ul className="logos__list">
        {LOGOS.map((logo, i) => (
          <li key={logo.id} className="logos__item">
            <img
              className="logos__img"
              src={logo.src}
              alt={t('logos.alt', { index: i + 1 })}
              loading="lazy"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
