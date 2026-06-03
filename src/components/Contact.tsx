import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';

import { useSound } from '../sound/SoundProvider';
import './Contact.css';

type Option = {
  key: string;
  labelKey: ParseKeys;
  color: string;
};

const OPTIONS: readonly Option[] = [
  {
    key: 'consultants',
    labelKey: 'contact.options.consultants',
    color: 'var(--blue)',
  },
  { key: 'teams', labelKey: 'contact.options.teams', color: 'var(--green)' },
  { key: 'webApp', labelKey: 'contact.options.webApp', color: 'var(--orange)' },
];

// Workaround for https://github.com/calcom/cal.com/issues/21015 —
// skeleton inside the embed's shadow DOM doesn't hide after load/resize.
function useHideCalSkeleton() {
  useEffect(() => {
    const hide = () => {
      document.querySelectorAll('*').forEach((el) => {
        const root = (el as Element & { shadowRoot?: ShadowRoot }).shadowRoot;
        if (root) {
          const skeleton = root.getElementById('skeleton');
          if (skeleton) skeleton.style.display = 'none';

          const skeletonContainer = root.getElementById('skeleton-container');
          if (skeletonContainer) skeletonContainer.style.display = 'none';
        }
      });
    };
    const id = setInterval(hide, 200);
    return () => clearInterval(id);
  }, []);
}

export function Contact() {
  const { t } = useTranslation();
  const { play } = useSound();
  const [activeIdx, setActiveIdx] = useState(0);
  const [glitching, setGlitching] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const glitchRef = useRef<HTMLDivElement>(null);

  useHideCalSkeleton();

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: '15min' });
      cal('ui', {
        theme: 'dark',
        cssVarsPerTheme: {
          light: { 'cal-brand': '#272727' },
          dark: { 'cal-brand': '#fff' },
        },
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, []);

  // After the frame finishes sliding, fire the glitch overlay
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'top') return;
      play('glitch');
      setGlitching(true);
    };
    frame.addEventListener('transitionend', onTransitionEnd);
    return () => frame.removeEventListener('transitionend', onTransitionEnd);
  }, [play]);

  // Tear down glitch state once the animation finishes
  useEffect(() => {
    const el = glitchRef.current;
    if (!el || !glitching) return;
    const onAnimEnd = () => setGlitching(false);
    el.addEventListener('animationend', onAnimEnd, { once: true });
    return () => el.removeEventListener('animationend', onAnimEnd);
  }, [glitching]);

  function selectOption(idx: number) {
    if (idx === activeIdx) return;
    setGlitching(false);
    setActiveIdx(idx);
  }

  return (
    <section className="contact" aria-label={t('contact.ariaLabel')}>
      <div className="contact__inner">
        <h2 className="contact__title">
          <svg
            width="36"
            height="8"
            viewBox="0 0 36 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="14" width="22" height="8" fill="white" />
            <rect x="0.5" y="0.5" width="11" height="7" stroke="white" />
          </svg>

          <span>{t('contact.title')}</span>
        </h2>

        <div
          className="contact__options"
          style={{ '--active-idx': activeIdx } as React.CSSProperties}
        >
          {/* Sliding selection frame */}
          <div ref={frameRef} className="contact__frame" aria-hidden="true">
            <span className="contact__frame-dot contact__frame-dot--tl" />
            <span className="contact__frame-dot contact__frame-dot--tr" />
            <span className="contact__frame-dot contact__frame-dot--bl" />
            <span className="contact__frame-dot contact__frame-dot--br" />
          </div>

          {/* Glitch overlay — clip-path shimmy, fires after slide completes */}
          <div
            ref={glitchRef}
            className={`contact__glitch${glitching ? ' is-active' : ''}`}
            style={
              {
                '--glitch-color': OPTIONS[activeIdx].color,
              } as React.CSSProperties
            }
            aria-hidden="true"
          >
            <span className="contact__glitch-prefix">
              {t('contact.options.prefix')}
            </span>
            <span className="contact__glitch-label">
              {t(OPTIONS[activeIdx].labelKey)}
            </span>
          </div>

          {OPTIONS.map((opt, i) => (
            <button
              key={opt.key}
              className={`contact__option${i === activeIdx ? ' is-active' : ''}`}
              onClick={() => selectOption(i)}
              onMouseEnter={() => i !== activeIdx && play('hover')}
            >
              <span className="contact__option-prefix">
                {t('contact.options.prefix')}
              </span>
              <span className="contact__option-label">{t(opt.labelKey)}</span>
            </button>
          ))}
        </div>

        <div className="contact__cal">
          <Cal
            namespace="15min"
            calLink="administrator-qxpmle/15min"
            style={{ width: '100%', height: '100%', overflow: 'scroll' }}
            config={{
              layout: 'month_view',
              useSlotsViewOnSmallScreen: 'true',
              theme: 'dark',
            }}
          />
        </div>

        <div className="contact__emails">
          <a className="contact__email" href={`mailto:${t('contact.emailSales')}`}>
            {t('contact.emailSales')}
          </a>
          <a className="contact__email" href={`mailto:${t('contact.emailPartner')}`}>
            {t('contact.emailPartner')}
          </a>
        </div>
      </div>
    </section>
  );
}
