/**
 * In-page navigation that scrolls smoothly *without* writing a `#hash` to the
 * URL. Anchor handlers call `e.preventDefault()` and then one of these helpers
 * (the anchors keep their `href` for semantics and no-JS fallback).
 *
 * The scroll is animated here (not via CSS `scroll-behavior`) with a *capped*
 * duration, so jumping past a tall scroll-jacked section (Services, Locations)
 * takes about as long as any other jump instead of feeling "stuck" crawling
 * through its inflated scroll area. Each run is bracketed by `navscroll` /
 * `navscrollend` events so those sections can freeze their scroll reactions
 * (e.g. the Locations globe) while the page travels past them.
 */

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

/** Keys that scroll the page — pressing one mid-animation hands control back. */
const SCROLL_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ',
]);

/** Cancels the scroll currently in flight, if any (rapid clicks / user takeover). */
let cancelActive: (() => void) | null = null;

/** Animate the window to `targetY` (clamped to the document) with a capped duration. */
export function smoothScrollTo(targetY: number): void {
  cancelActive?.();

  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const endY = Math.max(0, Math.min(targetY, maxY));
  const startY = window.scrollY;
  const distance = endY - startY;

  window.dispatchEvent(new CustomEvent('navscroll'));
  const finish = () => window.dispatchEvent(new CustomEvent('navscrollend'));

  if (reducedMotion() || Math.abs(distance) < 2) {
    window.scrollTo({ top: endY, behavior: 'instant' });
    finish();
    return;
  }

  // Long jumps are only slightly longer than short ones — brisk, never crawling.
  const duration = Math.min(700, 280 + Math.abs(distance) * 0.12);
  let startTime = 0;
  let frame = 0;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchmove', stop);
    window.removeEventListener('keydown', onKey);
    cancelActive = null;
    finish();
  };
  const onKey = (e: KeyboardEvent) => {
    if (SCROLL_KEYS.has(e.key)) stop();
  };

  // A real scroll gesture / key cancels the animation so the user stays in control.
  // (Our own scrollTo emits `scroll`, not `wheel`/`touchmove`, so it won't self-cancel.)
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchmove', stop, { passive: true });
  window.addEventListener('keydown', onKey);
  cancelActive = stop;

  const step = (now: number) => {
    if (!startTime) startTime = now;
    const t = Math.min(1, (now - startTime) / duration);
    window.scrollTo({ top: startY + distance * easeInOut(t), behavior: 'instant' });
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  frame = requestAnimationFrame(step);
}

/**
 * Smooth-scroll to a section by id, honouring its `scroll-margin-top` (so it
 * clears the sticky menu bar).
 */
export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const marginTop = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  smoothScrollTo(window.scrollY + el.getBoundingClientRect().top - marginTop);
}

/**
 * Ask the Services section to bring one of its services to the top of its
 * pinned window. Services owns the scroll maths (its track is transformed by
 * scroll), so it listens for `servicescroll` and drives {@link smoothScrollTo}.
 */
export function scrollToService(serviceId: string): void {
  window.dispatchEvent(new CustomEvent('servicescroll', { detail: serviceId }));
}
