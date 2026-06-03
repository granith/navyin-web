import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

import { smoothScrollTo } from '../lib/scroll';
import './Services.css';

/**
 * One service shown inside the browser window. `icon` + `image` live under
 * `public/services/`; the icons carry their own brand colour, the photos are
 * full-bleed. Each service ends with its own "How it works?" block.
 */
type ServiceItem = {
  id: string;
  icon: string;
  image: string;
  titleKey: ParseKeys;
  descKey: ParseKeys;
  altKey: ParseKeys;
  howDescKey: ParseKeys;
  steps: readonly { titleKey: ParseKeys }[];
};

const ITEMS: readonly ServiceItem[] = [
  {
    id: 'consultants',
    icon: '/services/icon-consultants.svg',
    image: '/services/consultants.jpg',
    titleKey: 'services.consultants.title',
    descKey: 'services.consultants.desc',
    altKey: 'services.consultants.alt',
    howDescKey: 'services.consultants.howDesc',
    steps: [
      { titleKey: 'services.consultants.steps.one.title' },
      { titleKey: 'services.consultants.steps.two.title' },
      { titleKey: 'services.consultants.steps.three.title' },
    ],
  },
  {
    id: 'teams',
    icon: '/services/icon-teams.svg',
    image: '/services/teams.jpg',
    titleKey: 'services.teams.title',
    descKey: 'services.teams.desc',
    altKey: 'services.teams.alt',
    howDescKey: 'services.teams.howDesc',
    steps: [
      { titleKey: 'services.teams.steps.one.title' },
      { titleKey: 'services.teams.steps.two.title' },
      { titleKey: 'services.teams.steps.three.title' },
    ],
  },
  {
    id: 'delivery',
    icon: '/services/icon-delivery.svg',
    image: '/services/delivery.jpg',
    titleKey: 'services.delivery.title',
    descKey: 'services.delivery.desc',
    altKey: 'services.delivery.alt',
    howDescKey: 'services.delivery.howDesc',
    steps: [
      { titleKey: 'services.delivery.steps.one.title' },
      { titleKey: 'services.delivery.steps.two.title' },
      { titleKey: 'services.delivery.steps.three.title' },
    ],
  },
];

/** Height of the sticky Navbar — the window pins just beneath it. */
const NAV_OFFSET = 34;

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/**
 * Services: a pinned macOS browser-window mockup. As the page scrolls through
 * this section, the window stays put (via `position: sticky`) while its inner
 * content track is translated upward — so the content scrolls *inside* the
 * window. Once the track reaches its end, the page resumes scrolling normally.
 *
 * The whole effect is driven by native scroll position (no wheel hijacking),
 * so trackpad, keyboard and momentum all keep working. With reduced motion the
 * pin is disabled and the content lays out as a normal vertical stack.
 */
export function Services() {
  const { t } = useTranslation();

  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const screen = screenRef.current;
    const track = trackRef.current;
    if (!section || !sticky || !screen || !track) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // How far the track can travel inside the window (px of overflow).
    let overflow = 0;
    let frame = 0;

    /** Map current scroll position → upward translate of the inner track. */
    const apply = () => {
      frame = 0;
      if (motionQuery.matches || overflow <= 0) {
        track.style.transform = '';
        return;
      }
      // section.top runs from NAV_OFFSET (pin start) down to NAV_OFFSET - overflow.
      const scrolled = NAV_OFFSET - section.getBoundingClientRect().top;
      const y = clamp(scrolled, 0, overflow);
      track.style.transform = `translate3d(0, ${-y}px, 0)`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    /** Re-measure overflow and stretch the section to create the scroll room. */
    const measure = () => {
      if (motionQuery.matches) {
        section.style.height = '';
        track.style.transform = '';
        overflow = 0;
        return;
      }
      overflow = Math.max(0, track.scrollHeight - screen.clientHeight);
      section.style.height = `${sticky.offsetHeight + overflow}px`;
      apply();
    };

    // Images change the track height as they load, so observe it.
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(screen);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    motionQuery.addEventListener('change', measure);

    measure();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      motionQuery.removeEventListener('change', measure);
      section.style.height = '';
      track.style.transform = '';
    };
  }, []);

  // The Dock deep-links into a service by dispatching `servicescroll` (see
  // lib/scroll). A native anchor jump can't reach it — the track is translated
  // by scroll — so we derive the target spot from the same geometry as the pin
  // above and drive the shared (capped-duration) scroll.
  useEffect(() => {
    const onServiceScroll = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const section = sectionRef.current;
      const screen = screenRef.current;
      const track = trackRef.current;
      if (!id || !section || !screen || !track) return;

      const article = track.querySelector<HTMLElement>(`.services__item--${id}`);
      if (!article) return;

      // Static layout (reduced motion): the track is laid out in full, so a
      // plain scroll-into-view lands correctly.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        article.scrollIntoView({ block: 'start' });
        return;
      }

      const overflow = Math.max(0, track.scrollHeight - screen.clientHeight);
      // Track travel that brings the article to the top of the window (with a
      // little headroom), bounded by how far the track can actually move.
      const y = clamp(article.offsetTop - 24, 0, overflow);
      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      smoothScrollTo(sectionTop - NAV_OFFSET + y);
    };

    window.addEventListener('servicescroll', onServiceScroll as EventListener);
    return () =>
      window.removeEventListener('servicescroll', onServiceScroll as EventListener);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="services"
      aria-label={t('services.ariaLabel')}
    >
      <div ref={stickyRef} className="services__sticky">
        <div className="services__window" data-reveal-fade>
          <div className="services__bar">
            <span className="services__lights" aria-hidden="true">
              <span className="services__light services__light--close" />
              <span className="services__light services__light--min" />
              <span className="services__light services__light--max" />
            </span>
          </div>

          <div ref={screenRef} className="services__screen">
            <div ref={trackRef} className="services__track">
              {ITEMS.map((item) => (
                <article
                  key={item.id}
                  className={`services__item services__item--${item.id}`}
                >
                  <header className="services__head">
                    <h3 className="services__title">
                      <img
                        className="services__icon"
                        src={item.icon}
                        alt=""
                        aria-hidden="true"
                      />
                      {t(item.titleKey)}
                    </h3>
                    <p className="services__desc">{t(item.descKey)}</p>
                  </header>

                  <img
                    className="services__photo"
                    src={item.image}
                    alt={t(item.altKey)}
                    loading="lazy"
                  />

                  <div className="services__how">
                    <h4 className="services__how-heading">
                      {t('services.howItWorksHeading')}
                    </h4>
                    <p className="services__how-desc">{t(item.howDescKey)}</p>
                    <ol className="services__steps">
                      {item.steps.map((step, i) => (
                        <li key={i} className="services__step">
                          <span className="services__step-num" aria-hidden="true">
                            {i + 1}
                          </span>
                          <span className="services__step-body">
                            <span className="services__step-title">
                              {t(step.titleKey)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
