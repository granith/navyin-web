import { useEffect, useRef, useState } from 'react';

import './GlassCursor.css';

// Pill size. Mirrors the width/height in GlassCursor.css — the JS needs the
// numbers to centre the pill on the pointer. Keep the two in sync.
const WIDTH = 50;
const HEIGHT = 25;

// Motion tuning. FOLLOW is the per-frame easing toward the pointer (lower =
// more trail). The pill stretches along whichever axis it's travelling — up to
// STRETCH — and thins on the other by SQUASH, reaching full deformation at
// MAX_GAP px of lag.
const FOLLOW = 0.2;
const MAX_GAP = 80;
const STRETCH = 0.5;
const SQUASH = 0.32;

// Elements the pill collapses to a circle over (CSS `.is-active`).
const INTERACTIVE =
  'a, button, [role="button"], label, summary, input, select, textarea, [data-cursor="active"]';

// Elements we can't paint over: cross-origin iframes (and the like) swallow
// pointer events, so the pill would otherwise freeze at the boundary. Hide it
// while the pointer is over these. Add `data-cursor="hidden"` to opt anything
// else out.
const NON_TRACKABLE = 'iframe, embed, object, [data-cursor="hidden"]';

/**
 * A liquid-glass pointer: a frosted, refractive rounded rectangle that trails
 * the cursor and stretches in the direction of travel. Inspired by the
 * reactbits "fluid glass" lens, but built from CSS `backdrop-filter` + an SVG
 * displacement map (refraction) rather than WebGL, so it stays cheap.
 *
 * Only mounts on devices with a fine pointer and hover (no touch). Under
 * reduced-motion it still renders but follows the pointer 1:1 with no
 * stretch/trail.
 */
export function GlassCursor() {
  const [enabled, setEnabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );
  const elRef = useRef<HTMLDivElement>(null);

  // Re-evaluate if the pointer capability changes (e.g. a tablet docking a
  // mouse, or DevTools device emulation toggling).
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const apply = () => setEnabled(mq.matches);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!enabled || !el) return;

    const root = document.documentElement;
    root.classList.add('has-glass-cursor');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pointer target (tx/ty) vs. rendered position (px/py); the lag between
    // them drives both the trail and the stretch.
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let px = tx;
    let py = ty;
    let stretchX = 0;
    let stretchY = 0;
    let visible = false;
    let raf = 0;

    const place = (x: number, y: number) =>
      `translate(${x - WIDTH / 2}px, ${y - HEIGHT / 2}px)`;

    const show = () => {
      if (visible) return;
      visible = true;
      // Reappear at the pointer rather than sliding back in from wherever it
      // was parked (an iframe edge, the window border).
      px = tx;
      py = ty;
      el.classList.add('is-visible');
    };
    const hide = () => {
      if (!visible) return;
      visible = false;
      el.classList.remove('is-visible');
    };

    const onMove = (e: PointerEvent) => {
      const target = e.target as Element | null;
      // Over an iframe/embed the pointer events stop coming, so hide rather
      // than freeze at the boundary.
      if (target?.closest?.(NON_TRACKABLE)) {
        hide();
        return;
      }
      tx = e.clientX;
      ty = e.clientY;
      el.classList.toggle('is-active', !!target?.closest?.(INTERACTIVE));
      show();
      // No animation loop under reduced motion — just track the pointer.
      if (reduced) el.style.transform = place(tx, ty);
    };

    // Crossing onto an iframe fires `pointerover` on it — the last event before
    // moves stop — so that's our cue to hide.
    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.(NON_TRACKABLE)) hide();
    };

    const onDown = () => el.classList.add('is-pressed');
    const onUp = () => el.classList.remove('is-pressed');

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    root.addEventListener('mouseleave', hide);

    if (reduced) {
      el.style.transform = place(tx, ty);
    } else {
      const tick = () => {
        const dx = tx - px;
        const dy = ty - py;
        px += dx * FOLLOW;
        py += dy * FOLLOW;

        // Per-axis lag → per-axis intensity (0..1), eased so the deformation
        // ramps and settles smoothly rather than snapping each frame.
        const ax = Math.min(Math.abs(dx) / MAX_GAP, 1);
        const ay = Math.min(Math.abs(dy) / MAX_GAP, 1);
        stretchX += (ax - stretchX) * 0.18;
        stretchY += (ay - stretchY) * 0.18;

        // Elongate along the axis of travel and thin on the other: horizontal
        // moves widen the pill, vertical moves make it taller — like a blob of
        // liquid. No rotation, so it never settles on a tilt.
        const sx = Math.max(1 + stretchX * STRETCH - stretchY * SQUASH, 0.5);
        const sy = Math.max(1 + stretchY * STRETCH - stretchX * SQUASH, 0.5);
        el.style.transform = `${place(px, py)} scale(${sx}, ${sy})`;

        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      root.removeEventListener('mouseleave', hide);
      root.classList.remove('has-glass-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={elRef} className="glass-cursor" aria-hidden="true">
        <div className="glass-cursor__shape">
          <span className="glass-cursor__refract" />
        </div>
      </div>

      {/* Refraction map: turbulence displaces the blurred backdrop to fake the
          liquid-glass lensing. Only takes effect where url() backdrop filters
          are supported (Chromium); elsewhere the pill is plain frosted glass. */}
      <svg className="glass-cursor__defs" aria-hidden="true" width="0" height="0">
        <filter
          id="glass-cursor-refract"
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.012"
            numOctaves={2}
            seed={12}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.4" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale={18}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </>
  );
}
