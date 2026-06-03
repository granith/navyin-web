import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { scrollToSection, scrollToService } from '../lib/scroll';
import './Footer.css';

/**
 * Center Dock items — assets live in `public/dock/`. The three service icons
 * deep-link to their service inside the Services section (handled on click via
 * scrollToService); the home icon returns to the top. `href` is a sensible
 * no-JS fallback only — the click handler does the real scroll.
 */
const DOCK = [
  { id: 'consultants', src: '/dock/consultants.svg', labelKey: 'footer.dock.consultants', href: '#services', separatorBefore: false },
  { id: 'teams', src: '/dock/teams.svg', labelKey: 'footer.dock.teams', href: '#services', separatorBefore: false },
  { id: 'delivery', src: '/dock/delivery.svg', labelKey: 'footer.dock.delivery', href: '#services', separatorBefore: false },
  { id: 'home', src: '/dock/home.svg', labelKey: 'footer.dock.home', href: '#home', separatorBefore: true }
] as const;

/**
 * Social links. Each shows the plain (grey) icon and swaps to the colored
 * version on hover — both assets already live in `public/social/`.
 * TODO: set the real profile URLs.
 */
const SOCIALS = [
  {
    id: 'facebook',
    labelKey: 'footer.social.facebook',
    href: '#',
    icon: '/social/fb.svg',
    iconColor: '/social/fb-color.svg'
  },
  {
    id: 'instagram',
    labelKey: 'footer.social.instagram',
    href: '#',
    icon: '/social/ig.svg',
    iconColor: '/social/ig-color.svg'
  },
  {
    id: 'dribbble',
    labelKey: 'footer.social.dribbble',
    href: '#',
    icon: '/social/db.svg',
    iconColor: '/social/db-color.svg'
  }
] as const;

/**
 * Footer: copyright (left), macOS-style Dock (center), and social links
 * (right). Mirrors the Navbar's desktop metaphor at the bottom of the page.
 */
export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <p className="footer__copyright">{t('footer.copyright', { year })}</p>

      <ul className="footer__dock" aria-label={t('footer.dock.ariaLabel')}>
        {DOCK.map((item) => (
          <Fragment key={item.id}>
            {item.separatorBefore && (
              <li className="footer__dock-sep" aria-hidden="true" />
            )}
            <li>
              <a
                className="footer__dock-item"
                href={item.href}
                aria-label={t(item.labelKey)}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.id === 'home') scrollToSection('home');
                  else scrollToService(item.id);
                }}
              >
                <span className="footer__dock-tooltip" aria-hidden="true">
                  {t(item.labelKey)}
                </span>
                <img
                  className="footer__dock-icon"
                  src={item.src}
                  alt=""
                  width={36}
                  height={36}
                />
                <span className="footer__dock-dot" aria-hidden="true" />
              </a>
            </li>
          </Fragment>
        ))}
      </ul>

      <ul className="footer__socials" aria-label={t('footer.social.ariaLabel')}>
        {SOCIALS.map((s) => (
          <li key={s.id}>
            <a
              className="footer__social"
              href={s.href}
              aria-label={t(s.labelKey)}
              title={t(s.labelKey)}
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                className="footer__social-icon footer__social-icon--plain"
                src={s.icon}
                alt=""
                width={24}
                height={24}
              />
              <img
                className="footer__social-icon footer__social-icon--color"
                src={s.iconColor}
                alt=""
                width={24}
                height={24}
              />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
