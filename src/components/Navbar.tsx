import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { ParseKeys } from 'i18next';

import { useCountry } from '../i18n/CountryProvider';
import { useSound } from '../sound/SoundProvider';
import './Navbar.css';

/** Primary menu items. Labels resolve through i18n so the bar stays localized. */
const MENU = [
  { id: 'home', labelKey: 'nav.home' },
  { id: 'services', labelKey: 'nav.services' },
  { id: 'technologies', labelKey: 'nav.technologies' },
  { id: 'whyUs', labelKey: 'nav.whyUs' },
  { id: 'contact', labelKey: 'nav.contact' }
] as const;

type MenuId = (typeof MENU)[number]['id'];

/** Endonyms for the language toggle tooltip. */
const LANG_NAMES: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  da: 'Dansk',
  sv: 'Svenska',
  sq: 'Shqip'
};

const MOBILE_SOCIALS = [
  {
    id: 'facebook',
    labelKey: 'footer.social.facebook' as ParseKeys,
    href: '#',
    icon: '/social/fb.svg'
  },
  {
    id: 'instagram',
    labelKey: 'footer.social.instagram' as ParseKeys,
    href: '#',
    icon: '/social/ig.svg'
  },
  {
    id: 'dribbble',
    labelKey: 'footer.social.dribbble' as ParseKeys,
    href: '#',
    icon: '/social/db.svg'
  }
] as const;

/**
 * macOS-style top menu bar. The active menu item is highlighted by a floating
 * pill that slides between items using a shared layout animation.
 */
export function Navbar() {
  const { t } = useTranslation();
  const [active, setActive] = useState<MenuId>('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen]);

  return (
    <>
      <header className="navbar">
        <div className="navbar__left">
          <div className="navbar__brand" aria-label="Navy Innovations">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="154"
              height="24"
              fill="none"
              viewBox="0 0 154 24"
            >
              <path
                fill="#fff"
                d="M32.71 6h1.838l3.357 5.184L41.173 6h1.714v.648l-4.081 6.39v5.31H36.88v-5.31l-4.17-6.39zM21.117 6h1.784l3.233 9.846L29.491 6h1.749v.648l-4.134 11.7H25.18l-4.063-11.7zM19.59 16.206h-5.212l-.725 2.142h-1.731V17.7L16.092 6h1.925l4.028 11.7v.648h-1.75zm-2.545-7.758-2.668 7.758h5.212zM0 6h2.12l5.865 8.892V6H9.84v12.348H8.091L1.855 9.006v9.342H0zM50.195 0H154v24H50.195z"
              />
              <path
                fill="#000"
                d="M57.6 5.652h.881V18h-1.98V6.858zm3.466 3.51h1.206l.397 1.044c.918-.918 1.89-1.386 3.186-1.386 2.231 0 3.221 1.314 3.221 3.582V18h-1.853v-5.526c0-1.296-.558-2.052-1.909-2.052-.971 0-1.691.378-2.393 1.08V18h-1.855zm10.354 0h1.206l.396 1.044c.918-.918 1.89-1.386 3.186-1.386 2.232 0 3.222 1.314 3.222 3.582V18h-1.854v-5.526c0-1.296-.558-2.052-1.908-2.052-.972 0-1.692.378-2.394 1.08V18H71.42zm11.992 3.528v1.782c0 1.458.737 2.286 2.105 2.286s2.124-.846 2.124-2.286v-1.8c0-1.494-.756-2.25-2.124-2.25-1.367 0-2.105.738-2.105 2.268m-1.837 1.764v-1.746c0-2.574 1.495-3.888 3.942-3.888 2.467 0 3.943 1.314 3.943 3.87v1.782c0 2.556-1.476 3.888-3.942 3.888-2.448 0-3.942-1.332-3.942-3.906m8.973-5.292h1.674l2.466 6.912 2.574-6.912H98.9v.522L95.66 18h-1.962l-3.15-8.316zm9.804 2.898v-.144c0-1.962 1.512-3.096 3.744-3.096 2.088 0 3.78 1.008 3.78 3.888V18h-1.188l-.306-.756c-.846.666-2.232 1.044-3.312 1.044-2.07 0-3.006-1.35-3.006-2.898 0-2.124 1.728-2.718 3.492-2.718 1.134 0 1.944.036 2.574.054v-.18c0-1.62-.864-2.178-2.088-2.178-1.17 0-1.998.54-1.998 1.584v.108zm3.132 4.734c.9 0 1.836-.324 2.646-.81V13.95a70 70 0 0 0-2.034-.036c-1.62 0-2.304.27-2.304 1.368 0 .99.54 1.512 1.692 1.512m6.028-6.678.882-.954h.342v-1.89l1.026-1.152h.828v3.042h2.34v1.566h-2.34v3.888c0 1.35.414 1.818 1.656 1.818h.72V18h-.756c-2.592 0-3.474-1.206-3.474-3.384v-3.888h-1.224zm8.127-.954h.828V18h-1.854v-7.686zm-1.026-3.852h1.854v2.268h-1.854zm5.875 7.38v1.782c0 1.458.738 2.286 2.106 2.286s2.124-.846 2.124-2.286v-1.8c0-1.494-.756-2.25-2.124-2.25s-2.106.738-2.106 2.268m-1.836 1.764v-1.746c0-2.574 1.494-3.888 3.942-3.888 2.466 0 3.942 1.314 3.942 3.87v1.782c0 2.556-1.476 3.888-3.942 3.888-2.448 0-3.942-1.332-3.942-3.906m10.059-5.292h1.206l.396 1.044c.918-.918 1.89-1.386 3.186-1.386 2.232 0 3.222 1.314 3.222 3.582V18h-1.854v-5.526c0-1.296-.558-2.052-1.908-2.052-.972 0-1.692.378-2.394 1.08V18h-1.854zm10.012 5.976h1.71v.144c0 1.188.612 1.566 2.052 1.566 1.422 0 2.088-.378 2.088-1.314 0-.63-.288-.936-.99-1.098-.756-.18-2.034-.198-2.952-.432-1.188-.306-1.782-.954-1.782-2.322 0-2.16 1.476-2.844 3.654-2.844 2.25 0 3.582.72 3.582 2.988v.18h-1.656v-.162c0-1.242-.72-1.53-1.962-1.53-1.116 0-1.872.234-1.872 1.314 0 .63.252.9.9 1.062.684.162 2.34.306 3.15.504.954.234 1.638.792 1.638 2.268 0 2.052-1.35 2.844-3.744 2.844s-3.816-.774-3.816-3.024z"
              />
            </svg>
          </div>

          <nav aria-label="Primary">
            <ul className="navbar__menu">
              {MENU.map((item) => {
                const isActive = item.id === active;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`navbar__link${isActive ? ' is-active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setActive(item.id)}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="navbar-pill"
                          className="navbar__pill"
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 32
                          }}
                        />
                      )}
                      <span className="navbar__label">{t(item.labelKey)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="navbar__right">
          <SoundButton />
          <LanguageFlag />
          <MenuBarClock />
          <button
            type="button"
            className="navbar__hamburger"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="navbar-mobile-drawer"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            {menuOpen ? (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.879 21.88L11.0005 11M21.879 11.001L11 21.88L21.879 11.001Z" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6.40039" y="19.2002" width="19.2" height="1.06667" fill="currentColor"/>
                <rect x="6.40039" y="11.7334" width="19.2" height="1.06667" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      <div
        id="navbar-mobile-drawer"
        className={`navbar__drawer${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Mobile navigation">
          <ul className="navbar__drawer-nav">
            {MENU.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="navbar__drawer-link"
                  onClick={() => {
                    setActive(item.id);
                    closeMenu();
                  }}
                >
                  {t(item.labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="navbar__drawer-cta" href="#contact" onClick={closeMenu}>
          <span className="navbar__drawer-cta-label">{t('nav.bookCall')}</span>
          <span className="navbar__drawer-cta-icon" aria-hidden="true">
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

        <div className="navbar__drawer-footer">
          <ul className="navbar__drawer-socials" aria-label={t('footer.social.ariaLabel')}>
            {MOBILE_SOCIALS.map((s) => (
              <li key={s.id}>
                <a
                  className="navbar__drawer-social"
                  href={s.href}
                  aria-label={t(s.labelKey)}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <img src={s.icon} alt="" width={24} height={24} />
                </a>
              </li>
            ))}
          </ul>
          <LanguageFlag />
        </div>
      </div>
    </>
  );
}

/** Speaker icon that mutes/unmutes UI sound (wired to the shared sound engine). */
function SoundButton() {
  const { enabled, toggle, play } = useSound();

  const handleClick = () => {
    toggle(); // updates mute state synchronously
    play('toggle'); // audible only if we just turned sound on
  };

  return (
    <button
      type="button"
      className="navbar__status navbar__sound"
      onClick={handleClick}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute sound' : 'Unmute sound'}
      title={enabled ? 'Mute sound' : 'Unmute sound'}
    >
      {enabled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="19"
          height="14"
          fill="none"
          viewBox="0 0 19 14"
        >
          <path
            fill="currentColor"
            d="M1.492 9.306q-.735 0-1.117-.388Q0 8.525 0 7.75V5.3q0-.774.375-1.168.38-.393 1.117-.393h1.784q.075 0 .133-.051l2.73-2.425q.285-.247.495-.362.21-.12.47-.12.387 0 .64.266a.9.9 0 0 1 .26.654v9.668q0 .375-.253.628a.85.85 0 0 1-.635.26q-.273 0-.495-.114a2.2 2.2 0 0 1-.482-.343l-2.73-2.444a.2.2 0 0 0-.133-.05zm.153-1.264h1.948a.67.67 0 0 1 .457.172L6.47 10.41q.045.05.095.05.09 0 .089-.1V2.678q0-.095-.089-.095a.1.1 0 0 0-.05.012.3.3 0 0 0-.052.032L4.05 4.837a.7.7 0 0 1-.222.14.8.8 0 0 1-.235.031H1.645q-.147 0-.223.076-.07.07-.07.21v2.463q0 .14.07.216.076.07.223.07m8.524 1.372a.64.64 0 0 1-.298-.451q-.037-.286.165-.616.255-.374.387-.844a3.5 3.5 0 0 0 .14-.99 3.5 3.5 0 0 0-.14-.99 2.8 2.8 0 0 0-.387-.845q-.21-.324-.165-.61a.64.64 0 0 1 .298-.456q.235-.153.496-.102a.65.65 0 0 1 .419.273q.399.54.622 1.25.222.705.222 1.48 0 .774-.222 1.485-.223.705-.622 1.238a.65.65 0 0 1-.42.28.7.7 0 0 1-.495-.102m2.68 1.726a.6.6 0 0 1-.3-.444.9.9 0 0 1 .147-.578q.495-.75.768-1.676.28-.933.28-1.93 0-1.002-.274-1.929a6 6 0 0 0-.774-1.682.83.83 0 0 1-.146-.571.6.6 0 0 1 .298-.445.65.65 0 0 1 .502-.095.65.65 0 0 1 .431.298q.635.895.978 2.05a8.3 8.3 0 0 1 .343 2.375q0 1.225-.35 2.374a7.1 7.1 0 0 1-.97 2.05.66.66 0 0 1-.432.292.66.66 0 0 1-.502-.089m2.678 1.746a.62.62 0 0 1-.298-.445.83.83 0 0 1 .14-.565 9.8 9.8 0 0 0 1.364-3.402q.19-.945.19-1.955 0-1.009-.19-1.949a9.752 9.752 0 0 0-1.365-3.402.85.85 0 0 1-.14-.571q.045-.285.299-.445a.65.65 0 0 1 .514-.089.7.7 0 0 1 .438.318q.552.863.959 1.847.406.978.622 2.057.215 1.08.215 2.234a11.4 11.4 0 0 1-.831 4.297 11 11 0 0 1-.965 1.841.7.7 0 0 1-.438.318.65.65 0 0 1-.514-.09"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 13 13"
        >
          <path
            fill="currentColor"
            d="M2.768 8.628q-.737 0-1.118-.387-.374-.394-.374-1.168v-2.45q0-.35.076-.61.082-.267.235-.444l1.04 1.035v2.475q0 .14.07.216.078.07.223.07h1.974q.127 0 .216.031.09.026.19.121l2.603 2.368 1.257 1.25a.8.8 0 0 1-.318.324.85.85 0 0 1-.45.12q-.267 0-.49-.114a2.4 2.4 0 0 1-.482-.342L4.685 8.679a.17.17 0 0 0-.127-.051zM9.28 7.32 7.928 5.962V2q0-.095-.089-.095a.1.1 0 0 0-.05.012.3.3 0 0 0-.051.032l-2 1.822-.895-.901L7.414.585Q7.7.338 7.91.224a.96.96 0 0 1 .476-.121q.387 0 .641.267.255.266.254.653zm2.152 4.837L.146.884A.5.5 0 0 1 0 .522.5.5 0 0 1 .146.154.52.52 0 0 1 .514 0Q.73.001.89.154l11.273 11.273a.5.5 0 0 1 .152.362q0 .216-.152.368a.49.49 0 0 1-.368.153.48.48 0 0 1-.362-.153"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * Country flag on the right of the bar. US/GB are English-only (static flag);
 * every other country can toggle between its native language and English.
 */
function LanguageFlag() {
  const { flag, locked, isEnglish, nativeLang, toggle } = useCountry();
  const { play } = useSound();
  const flagImg = (
    <img className="navbar__flag-img" src={flag} alt="" width={16} height={16} />
  );

  if (locked) {
    return <span className="navbar__status navbar__flag navbar__flag--static">{flagImg}</span>;
  }

  const target = isEnglish ? nativeLang : 'en';
  const label = `Switch to ${LANG_NAMES[target] ?? target.toUpperCase()}`;
  const handleClick = () => {
    toggle();
    play('click');
  };
  return (
    <button
      type="button"
      className="navbar__status navbar__flag"
      onClick={handleClick}
      aria-label={label}
      title={label}
    >
      {flagImg}
    </button>
  );
}

/** Live clock formatted like the macOS menu bar, e.g. "Mon Jun 10 9:41 AM". */
function MenuBarClock() {
  const { i18n } = useTranslation();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const date = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
    .format(now)
    .replace(/,/g, '');
  const time = new Intl.DateTimeFormat(i18n.language, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(now);

  return (
    <time className="navbar__clock" dateTime={now.toISOString()}>
      {date} {time}
    </time>
  );
}
