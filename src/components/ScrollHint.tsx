import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import './ScrollHint.css';

/**
 * "Scroll down" affordance that floats just above the Dock and fades out the
 * moment the user starts scrolling. Fixed to the viewport bottom so it sits
 * over the Dock's resting position (see `--scroll-hint-bottom` in the CSS).
 */
export function ScrollHint() {
  const { t } = useTranslation();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) setHidden(true);
    };
    // Cover the case where the page is already scrolled on mount.
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <img
      className={`scroll-hint${hidden ? ' is-hidden' : ''}`}
      src="/scroll-down.svg"
      alt={t('scrollHint.label')}
      width={28}
      height={28}
      aria-hidden={hidden}
    />
  );
}
