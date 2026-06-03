import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import createGlobe from 'cobe';

import { useSound } from '../sound/SoundProvider';
import './Locations.css';

/**
 * One location: a country plotted on the globe. `coords` is [latitude,
 * longitude] in degrees (the capital) — used for the cobe marker and to focus
 * the globe on it.
 */
type LocationItem = {
  id: string;
  labelKey: ParseKeys;
  coords: [number, number];
};

// Client-provided order (not geographic) — the globe eases along the shorter arc.
const LOCATIONS: readonly LocationItem[] = [
  { id: 'sweden', labelKey: 'locations.sweden', coords: [59.3293, 18.0686] },
  { id: 'denmark', labelKey: 'locations.denmark', coords: [55.6761, 12.5683] },
  { id: 'unitedKingdom', labelKey: 'locations.unitedKingdom', coords: [51.5074, -0.1278] },
  { id: 'canada', labelKey: 'locations.canada', coords: [45.4215, -75.6972] },
  { id: 'unitedStates', labelKey: 'locations.unitedStates', coords: [38.9072, -77.0369] },
  { id: 'kosovo', labelKey: 'locations.kosovo', coords: [42.6629, 21.1655] },
];

/** Height of the sticky Navbar — the section pins just beneath it (see Services). */
const NAV_OFFSET = 34;
/** Below this width we drop the pin/hijack and lay the columns out as a stack. */
const MOBILE = 768;
const TWO_PI = Math.PI * 2;
/** Resting size of every globe marker (the active one gets a pulsating CSS ring). */
const MARKER_BASE = 0.05;
/**
 * Scroll needed to advance one country = `STEP_VH` × viewport height, floored at
 * `STEP_MIN` px so it stays substantial on short windows. Bigger = more scroll
 * per country (total section scroll = step × (countries − 1)).
 */
const STEP_VH = 0.5;
const STEP_MIN = 500;
/** Min gap between hover SFX so sweeping the list doesn't machine-gun it. */
const HOVER_THROTTLE_MS = 120;

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/** cobe rotation [phi, theta] that brings a lat/long (degrees) to face the camera. */
const locationToAngles = (lat: number, long: number): [number, number] => [
  Math.PI - ((long * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];

/**
 * Locations: a pinned three-column section — title / cobe globe / location list.
 *
 * Like {@link Services}, the effect is driven by native scroll position (no
 * wheel hijacking): the section is stretched taller than the viewport so that
 * scrolling through it maps to an "active" index. The right-hand list slides so
 * the active item stays centred, and the globe eases round to face it. Clicking
 * an item scrolls to the position that activates it, so click and scroll stay in
 * sync. With reduced motion (or on narrow screens) the pin is disabled and the
 * columns stack as a normal list.
 */
export function Locations() {
  const { t } = useTranslation();
  const { play } = useSound();

  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  // Globe focus + scroll geometry live in refs so the rAF loops can read the
  // latest values without re-rendering on every frame.
  const focusRef = useRef<[number, number]>(
    locationToAngles(LOCATIONS[0].coords[0], LOCATIONS[0].coords[1]),
  );
  const activeRef = useRef(0);
  const stepRef = useRef(0); // px of scroll per location
  const travelRef = useRef(0); // total scroll room = step * (n - 1)
  const centersRef = useRef<number[]>([]); // translateY that centres each item
  // Set by a list click: the index the smooth scroll is heading to. While set,
  // apply() ignores the countries scrolled past so the globe goes straight to
  // the target instead of easing through every one in between.
  const pendingRef = useRef<number | null>(null);
  const playRef = useRef(play);
  playRef.current = play;
  // Rate-limits the scroll-driven country chime so a fast scroll-through (e.g.
  // tapping a nav link that scrolls past this section) doesn't machine-gun it.
  const lastScrollSoundRef = useRef(0);
  // True while the navbar is scrolling the page past this section: the globe and
  // list freeze instead of whipping through every country (released on arrival).
  const suppressScrollRef = useRef(false);

  // ── Pin + scroll-driven active index ──────────────────────────────────────
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const list = listRef.current;
    const track = trackRef.current;
    if (!section || !sticky || !list || !track) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const isStatic = () =>
      motionQuery.matches || window.innerWidth < MOBILE;

    /** Map scroll position → active index. The list itself only moves when the
     *  active index changes (it then eases to centre it via a CSS transition);
     *  raw scrolling does not drag the list. */
    const apply = () => {
      frame = 0;
      if (isStatic() || travelRef.current <= 0) {
        track.style.transform = '';
        return;
      }
      // section.top runs from NAV_OFFSET (pin start) down to NAV_OFFSET - travel.
      const scrolled = clamp(
        NAV_OFFSET - section.getBoundingClientRect().top,
        0,
        travelRef.current,
      );
      // While the navbar scrolls past: keep the globe still and the chime silent,
      // but let the list glide with the scroll (continuous, no centre-snap — the
      // transition is disabled in onNavScroll so it tracks 1:1).
      if (suppressScrollRef.current) {
        const span = LOCATIONS.length - 1;
        const frac = clamp(scrolled / stepRef.current, 0, span);
        const i0 = Math.floor(frac);
        const i1 = Math.min(i0 + 1, span);
        const centers = centersRef.current;
        const y =
          (centers[i0] ?? 0) + ((centers[i1] ?? 0) - (centers[i0] ?? 0)) * (frac - i0);
        track.style.transform = `translate3d(0, ${y}px, 0)`;
        return;
      }
      const next = Math.round(scrolled / stepRef.current);
      // A click set a destination: skip the countries the smooth scroll passes
      // through, only resuming once we land on (or the user scrolls past) it.
      if (pendingRef.current !== null) {
        if (next !== pendingRef.current) return;
        pendingRef.current = null;
      }
      if (next === activeRef.current) return;

      activeRef.current = next;
      setActive(next);
      const now = performance.now();
      if (now - lastScrollSoundRef.current > HOVER_THROTTLE_MS * 2) {
        lastScrollSoundRef.current = now;
        playRef.current('hover');
      }
      const [lat, long] = LOCATIONS[next].coords;
      focusRef.current = locationToAngles(lat, long);
      track.style.transform = `translate3d(0, ${centersRef.current[next] ?? 0}px, 0)`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    /** Re-measure item centres + scroll room, and stretch the section to fit. */
    const measure = () => {
      if (isStatic()) {
        section.style.height = '';
        track.style.transform = '';
        travelRef.current = 0;
        return;
      }
      const viewport = list.clientHeight;
      centersRef.current = LOCATIONS.map((_, i) => {
        const el = itemRefs.current[i];
        if (!el) return 0;
        return viewport / 2 - (el.offsetTop + el.offsetHeight / 2);
      });
      stepRef.current = Math.max(STEP_MIN, window.innerHeight * STEP_VH);
      travelRef.current = stepRef.current * (LOCATIONS.length - 1);
      section.style.height = `${sticky.offsetHeight + travelRef.current}px`;
      // Keep the active item centred after a re-measure; apply() then reconciles
      // the active index if the new geometry shifted the thresholds.
      track.style.transform = `translate3d(0, ${centersRef.current[activeRef.current] ?? 0}px, 0)`;
      apply();
    };

    // Fonts/layout shift the list height as they settle, so observe it.
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    ro.observe(track);

    // Leave loose-glide mode: re-enable the list's centre-snap transition.
    const resume = () => {
      suppressScrollRef.current = false;
      track.style.transition = '';
    };

    // If the user grabs the scroll mid-animation, abandon the click target and
    // any nav-scroll freeze, resuming normal tracking from wherever they end up.
    const cancelPending = () => {
      pendingRef.current = null;
      resume();
    };

    // A programmatic in-page scroll brackets itself with `navscroll` /
    // `navscrollend` (see lib/scroll): glide loosely for its duration (globe
    // frozen, list tracking scroll 1:1 via a disabled transition), with a
    // timeout backstop in case the end event is missed.
    let suppressTimer = 0;
    const onNavScroll = () => {
      suppressScrollRef.current = true;
      track.style.transition = 'none';
      window.clearTimeout(suppressTimer);
      suppressTimer = window.setTimeout(resume, 1500);
    };
    const onNavScrollEnd = () => {
      window.clearTimeout(suppressTimer);
      resume();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('wheel', cancelPending, { passive: true });
    window.addEventListener('touchstart', cancelPending, { passive: true });
    window.addEventListener('navscroll', onNavScroll);
    window.addEventListener('navscrollend', onNavScrollEnd);
    motionQuery.addEventListener('change', measure);

    measure();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      window.clearTimeout(suppressTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      window.removeEventListener('wheel', cancelPending);
      window.removeEventListener('touchstart', cancelPending);
      window.removeEventListener('navscroll', onNavScroll);
      window.removeEventListener('navscrollend', onNavScrollEnd);
      motionQuery.removeEventListener('change', measure);
      section.style.height = '';
      track.style.transform = '';
    };
  }, []);

  // ── cobe globe ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let size = canvas.offsetWidth || 1;
    let phi = focusRef.current[0];
    let theta = focusRef.current[1];

    // cobe v2 has no render loop of its own: globe.update() draws one frame and
    // merges the partial onto retained state. We drive it from our own rAF.
    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi,
      theta,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.26, 0.26, 0.26],
      markerColor: [1, 0.34, 0.0],
      glowColor: [0.12, 0.12, 0.12],
      markers: LOCATIONS.map((l) => ({ location: l.coords, size: MARKER_BASE })),
    });

    const onResize = () => {
      size = canvas.offsetWidth || size;
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    let raf = 0;
    let destroyed = false;
    const tick = () => {
      if (destroyed) return;
      const [focusPhi, focusTheta] = focusRef.current;
      if (motionQuery.matches) {
        phi = focusPhi;
        theta = focusTheta;
      } else {
        // Ease toward the focused longitude along the shorter arc.
        const distPos = (focusPhi - phi + TWO_PI) % TWO_PI;
        const distNeg = (phi - focusPhi + TWO_PI) % TWO_PI;
        phi += distPos < distNeg ? distPos * 0.08 : -distNeg * 0.08;
        theta = theta * 0.92 + focusTheta * 0.08;
      }
      globe.update({ phi, theta, width: size * dpr, height: size * dpr });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const reveal = requestAnimationFrame(() => setReady(true));

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(reveal);
      ro.disconnect();
      globe.destroy();
      // cobe v2 destroy() deletes buffers but never disables vertex attributes.
      // The enabled-attribute state is global per WebGL context — on React 18
      // Strict Mode's remount, createGlobe gets the same context, finds
      // attributes still enabled but pointing to deleted buffers, and the first
      // drawArrays throws INVALID_OPERATION. Disable them all to reset the slate.
      const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      if (gl) {
        const count = gl.getParameter(gl.MAX_VERTEX_ATTRIBS) as number;
        for (let i = 0; i < count; i++) gl.disableVertexAttribArray(i);
      }
    };
  }, []);

  const lastHover = useRef(0);
  const onItemHover = () => {
    const now = performance.now();
    if (now - lastHover.current < HOVER_THROTTLE_MS) return;
    lastHover.current = now;
    play('hover');
  };

  /** Activate a location — scroll to its index while pinned, else set directly. */
  const goTo = (i: number) => {
    const section = sectionRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!section || reduced || travelRef.current <= 0) {
      activeRef.current = i;
      setActive(i);
      const [lat, long] = LOCATIONS[i].coords;
      focusRef.current = locationToAngles(lat, long);
      return;
    }
    const scrolled = clamp(
      NAV_OFFSET - section.getBoundingClientRect().top,
      0,
      travelRef.current,
    );
    const delta = i * stepRef.current - scrolled;

    // Move the list + globe straight to the target now; apply() then ignores
    // the countries the smooth scroll passes over until it settles here.
    pendingRef.current = i;
    activeRef.current = i;
    setActive(i);
    const [lat, long] = LOCATIONS[i].coords;
    focusRef.current = locationToAngles(lat, long);
    trackRef.current?.style.setProperty(
      'transform',
      `translate3d(0, ${centersRef.current[i] ?? 0}px, 0)`,
    );

    window.scrollTo({ top: window.scrollY + delta, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="locations"
      aria-label={t('locations.ariaLabel')}
    >
      <div ref={stickyRef} className="locations__sticky">
        <div className={`locations__inner${ready ? ' is-ready' : ''}`}>
          <div className="locations__intro">
            <h2 className="locations__title" data-reveal>{t('locations.title')}</h2>
          </div>

          <div className="locations__globe">
            {/* cobe mutates this subtree (it wraps the canvas), so keep it
                isolated from the React-managed siblings below it. */}
            <div className="locations__stage">
              <canvas ref={canvasRef} className="locations__canvas" aria-hidden="true" />
            </div>
            <span className="locations__ping" aria-hidden="true" />
          </div>

          <div ref={listRef} className="locations__list" data-reveal-fade>
            <ul ref={trackRef} className="locations__track">
              {LOCATIONS.map((loc, i) => (
                <li
                  key={loc.id}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className="locations__item"
                >
                  <button
                    type="button"
                    className={`locations__btn${i === active ? ' is-active' : ''}`}
                    aria-current={i === active ? 'true' : undefined}
                    onClick={() => goTo(i)}
                    onMouseEnter={onItemHover}
                  >
                    {t(loc.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
