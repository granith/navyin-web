import type { Ref } from 'react';

type Props = { svgRef: Ref<SVGSVGElement> };

// 49 vertical lines: x = 0.5, 4.5, 8.5 … 192.5
const X_POSITIONS = Array.from({ length: 49 }, (_, i) => 0.5 + i * 4);

export function ToggleSvg({ svgRef }: Props) {
  return (
    <svg
      ref={svgRef}
      width="193"
      height="147"
      viewBox="0 0 193 147"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {X_POSITIONS.map((x) => (
        <line
          key={x}
          x1={x}
          y1="147"
          x2={x}
          y2="0"
          stroke="#232323"
        />
      ))}
    </svg>
  );
}
