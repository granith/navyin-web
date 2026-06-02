import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

import './Benefits.css';

/**
 * One reason to choose us: a laurel icon above a short label. All three share
 * the same decorative icon for now (`public/benefits/icon.svg`), so it carries
 * no alt text — the label is the accessible name.
 */
type Benefit = {
  id: string;
  labelKey: ParseKeys;
};

const BENEFITS: readonly Benefit[] = [
  { id: 'senior', labelKey: 'benefits.senior.label' },
  { id: 'partnership', labelKey: 'benefits.partnership.label' },
  { id: 'delivery', labelKey: 'benefits.delivery.label' },
];

const ICON = '/benefits/icon.svg';

/**
 * Benefits: the same centered title and three-up layout as Partnerships, pared
 * down to a shared laurel icon over a label. Each item rests at half opacity
 * and rises to full on hover.
 */
export function Benefits() {
  const { t } = useTranslation();

  return (
    <section className="benefits" aria-label={t('benefits.ariaLabel')}>
      <div className="benefits__inner">
        <h2 className="benefits__title">{t('benefits.title')}</h2>

        <ul className="benefits__grid">
          {BENEFITS.map((benefit) => (
            <li key={benefit.id} className="benefits__card">
              <img className="benefits__icon" src={ICON} alt="" aria-hidden="true" />
              <p className="benefits__label">{t(benefit.labelKey)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
