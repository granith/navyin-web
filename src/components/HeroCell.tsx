import type { CSSProperties } from 'react';

import './HeroCell.css';

export type CellAnchorX = 'left' | 'center' | 'right';
export type CellAnchorY = 'top' | 'center' | 'bottom';

export type CellGraphic = {
  /** Base (dim) graphic. */
  src: string;
  /** "Lit" graphic, cross-faded over the base on hover. */
  srcLit: string;
  /** Intrinsic render size in px. */
  width: number;
  height: number;
  /** Anchor within the cell (default: center / center). */
  x?: CellAnchorX;
  y?: CellAnchorY;
  /** Offset in px from the anchored edge(s). */
  dx?: number;
  dy?: number;
};

export type CellLabel = {
  /** Already-localized text (resolved by the parent). */
  text: string;
  /**
   * `normal` = top-left; `rotated` = right edge, -90°; `center` = centered
   * (same size as `rotated`, not rotated). Default `normal`.
   */
  variant?: 'normal' | 'rotated' | 'center';
};

type HeroCellProps = {
  /** Named grid area this cell occupies (see Hero.css grid-template-areas). */
  gridArea: string;
  graphic?: CellGraphic;
  label?: CellLabel;
  /** Fires on mouse-enter so the parent can play the (throttled) hover SFX. */
  onHover: () => void;
};

/**
 * Resolve a graphic's anchor + offset into absolute-position styles. Edge
 * anchors map straight to the matching inset; `center` uses a 50% inset with a
 * translate that folds in the offset, so every anchor/offset combo composes.
 */
function graphicStyle({
  width,
  height,
  x = 'center',
  y = 'center',
  dx = 0,
  dy = 0
}: CellGraphic): CSSProperties {
  const style: CSSProperties = { width, height };
  const transforms: string[] = [];

  if (x === 'left') style.left = dx;
  else if (x === 'right') style.right = dx;
  else {
    style.left = '50%';
    transforms.push(`translateX(calc(-50% + ${dx}px))`);
  }

  if (y === 'top') style.top = dy;
  else if (y === 'bottom') style.bottom = dy;
  else {
    style.top = '50%';
    transforms.push(`translateY(calc(-50% + ${dy}px))`);
  }

  if (transforms.length) style.transform = transforms.join(' ');
  return style;
}

/**
 * One tile of the hero bento — a hover-only showcase (no click action). It
 * composes from two optional slots: a positioned, fixed-size graphic that
 * cross-fades to its lit version on hover, and a label. Graphics are
 * decorative (`alt=""`); the label carries the meaning for assistive tech.
 */
export function HeroCell({ gridArea, graphic, label, onHover }: HeroCellProps) {
  return (
    <div className="hero-cell" style={{ gridArea }} onMouseEnter={onHover}>
      {graphic && (
        <div className="hero-cell__graphic" style={graphicStyle(graphic)}>
          <img
            className="hero-cell__img hero-cell__img--base"
            src={graphic.src}
            alt=""
          />
          <img
            className="hero-cell__img hero-cell__img--lit"
            src={graphic.srcLit}
            alt=""
          />
        </div>
      )}

      {label && (
        <span
          className={`hero-cell__label hero-cell__label--${label.variant ?? 'normal'}`}
        >
          {label.text}
        </span>
      )}
    </div>
  );
}
