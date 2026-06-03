import { useCallback, useRef, type CSSProperties, type Ref } from 'react';

import './HeroCell.css';

export type CellAnchorX = 'left' | 'center' | 'right';
export type CellAnchorY = 'top' | 'center' | 'bottom';

export type CellGraphic = {
  src: string;
  srcLit: string;
  width: number;
  height: number;
  x?: CellAnchorX;
  y?: CellAnchorY;
  dx?: number;
  dy?: number;
};

/**
 * An inline-SVG graphic with per-cell animation hooks.
 *
 * `render(svgRef)` — render the SVG element, forwarding svgRef onto <svg>.
 * `onEnter(svg)`  — called on mouse-enter. Fires only once when exitEnabled
 *                   is omitted/false (the default); fires every hover when
 *                   exitEnabled is true.
 * `onExit(svg)`   — called on mouse-leave. Only runs when exitEnabled is true.
 * `exitEnabled`   — opt-in: set to true to allow the animation to reverse on
 *                   mouse-leave. Defaults to false (retain final state).
 */
export type AnimatedGraphicDef = {
  width: number;
  height: number;
  x?: CellAnchorX;
  y?: CellAnchorY;
  dx?: number;
  dy?: number;
  render: (svgRef: Ref<SVGSVGElement>) => React.ReactNode;
  onEnter: (svg: SVGSVGElement) => void;
  onExit?: (svg: SVGSVGElement) => void;
  exitEnabled?: boolean;
};

export type CellLabel = {
  text: string;
  variant?: 'normal' | 'rotated' | 'center';
};

type HeroCellProps = {
  gridArea: string;
  label?: CellLabel;
  onHover: () => void;
} & (
  | { graphic: CellGraphic; animatedGraphic?: never }
  | { graphic?: never; animatedGraphic: AnimatedGraphicDef }
  | { graphic?: never; animatedGraphic?: never }
);

type SizeAndAnchor = Pick<CellGraphic, 'width' | 'height' | 'x' | 'y' | 'dx' | 'dy'>;

function graphicStyle({
  width,
  height,
  x = 'center',
  y = 'center',
  dx = 0,
  dy = 0,
}: SizeAndAnchor): CSSProperties {
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

export function HeroCell({ gridArea, graphic, animatedGraphic, label, onHover }: HeroCellProps) {
  const cellRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const hasEntered = useRef(false);

  const handleMouseEnter = useCallback(() => {
    // Skip the sound if the cell is already in its final lit state.
    if (!cellRef.current?.classList.contains('is-lit')) onHover();
    // Permanently mark the cell as lit (drives CSS for image-based cells).
    cellRef.current?.classList.add('is-lit');

    if (!animatedGraphic || !svgRef.current) return;
    // With exit disabled (default), onEnter fires once and stays.
    if (animatedGraphic.exitEnabled !== true && hasEntered.current) return;
    animatedGraphic.onEnter(svgRef.current);
    hasEntered.current = true;
  }, [onHover, animatedGraphic]);

  const handleMouseLeave = useCallback(() => {
    // Only call onExit when explicitly opted in.
    if (!animatedGraphic?.exitEnabled || !svgRef.current) return;
    animatedGraphic.onExit?.(svgRef.current);
  }, [animatedGraphic]);

  return (
    <div
      ref={cellRef}
      className="hero-cell"
      style={{ gridArea }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {graphic && (
        <div className="hero-cell__graphic" style={graphicStyle(graphic)}>
          <img className="hero-cell__img hero-cell__img--base" src={graphic.src} alt="" />
          <img className="hero-cell__img hero-cell__img--lit" src={graphic.srcLit} alt="" />
        </div>
      )}

      {animatedGraphic && (
        <div className="hero-cell__graphic" style={graphicStyle(animatedGraphic)}>
          {animatedGraphic.render(svgRef)}
        </div>
      )}

      {label && (
        <span className={`hero-cell__label hero-cell__label--${label.variant ?? 'normal'}`}>
          {label.text}
        </span>
      )}
    </div>
  );
}
