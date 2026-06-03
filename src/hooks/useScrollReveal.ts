import { useEffect } from 'react';

/**
 * One-shot scroll reveal. Finds every `[data-reveal]` / `[data-reveal-fade]`
 * element in the document and marks it `data-in` as it scrolls into view, then
 * stops watching it. The hidden base state lives behind
 * `prefers-reduced-motion: no-preference` in CSS, so here we simply reveal
 * everything immediately when the user prefers reduced motion (or when
 * IntersectionObserver is unavailable) — content is never left hidden.
 *
 * We toggle a `data-in` *attribute* (not a class) on purpose: some targets also
 * carry a React-controlled `className` that changes on hover (e.g. the
 * Technologies / Testimonials grids gain `is-active`). React rewrites
 * `className` on those re-renders and would wipe an imperatively-added class —
 * but it never touches attributes it doesn't render, so `data-in` survives.
 *
 * Call once, high in the tree (see App). All sections render before this
 * effect runs, so a single query picks them all up.
 */
export function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-fade]'),
    );
    if (!els.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.setAttribute('data-in', ''));
      return;
    }

    // Reveal once an element has risen well into view: a negative bottom margin
    // makes the lower part of the viewport a dead zone, so content reveals as
    // the user reaches it rather than the moment it peeks over the edge.
    //   - default          → bottom 25% dead zone
    //   - data-reveal-late → bottom 40% (short sections, so they fire nearer the
    //                        middle of the screen rather than too early)
    const makeObserver = (rootMargin: string) =>
      new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.setAttribute('data-in', '');
              obs.unobserve(entry.target);
            }
          }
        },
        { threshold: 0, rootMargin },
      );

    const near = makeObserver('0px 0px -25% 0px');
    const far = makeObserver('0px 0px -40% 0px');
    els.forEach((el) =>
      (el.hasAttribute('data-reveal-late') ? far : near).observe(el),
    );
    return () => {
      near.disconnect();
      far.disconnect();
    };
  }, []);
}
