import { useId } from "react";
import type { Figure } from "../../api/lib/exercises";

const BOX = 100;

function starPoints(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = (-90 + i * 36) * (Math.PI / 180);
    const rad = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${(cx + rad * Math.cos(ang)).toFixed(2)},${(cy + rad * Math.sin(ang)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function hexPoints(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const ang = (-90 + i * 60) * (Math.PI / 180);
    pts.push(`${(cx + r * Math.cos(ang)).toFixed(2)},${(cy + r * Math.sin(ang)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function triPoints(cx: number, cy: number, r: number) {
  return [
    `${cx},${(cy - r).toFixed(2)}`,
    `${(cx + r * 0.92).toFixed(2)},${(cy + r * 0.72).toFixed(2)}`,
    `${(cx - r * 0.92).toFixed(2)},${(cy + r * 0.72).toFixed(2)}`,
  ].join(" ");
}

export function FigureView({ figure, size = 96, tone = "#E6EDF7" }: { figure: Figure; size?: number; tone?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const n = Math.max(1, figure.count);
  const cols = n <= 1 ? 1 : n === 2 ? 2 : n === 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const cw = BOX / cols;
  const ch = BOX / rows;
  const r = Math.min(cw, ch) * 0.32;

  const fillProps =
    figure.fill === "solid"
      ? { fill: tone }
      : figure.fill === "striped"
        ? { fill: `url(#s${id})`, stroke: tone, strokeWidth: 1.6 }
        : { fill: "none", stroke: tone, strokeWidth: 2.6 };

  return (
    <svg viewBox={`0 0 ${BOX} ${BOX}`} width={size} height={size} className="shrink-0">
      <defs>
        <pattern id={`s${id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill={tone} fillOpacity="0.08" />
          <line x1="0" y1="0" x2="0" y2="6" stroke={tone} strokeWidth="1.8" />
        </pattern>
      </defs>
      {Array.from({ length: n }, (_, i) => {
        const cx = ((i % cols) + 0.5) * cw;
        const cy = (Math.floor(i / cols) + 0.5) * ch;
        const common = { ...fillProps, transform: `rotate(${figure.rotation} ${cx} ${cy})` } as const;
        switch (figure.shape) {
          case "circle":
            return <circle key={i} cx={cx} cy={cy} r={r} {...common} />;
          case "square":
            return <rect key={i} x={cx - r} y={cy - r} width={r * 2} height={r * 2} {...common} />;
          case "triangle":
            return <polygon key={i} points={triPoints(cx, cy, r * 1.1)} {...common} />;
          case "diamond":
            return <polygon key={i} points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} {...common} />;
          case "hexagon":
            return <polygon key={i} points={hexPoints(cx, cy, r)} {...common} />;
          case "star":
            return <polygon key={i} points={starPoints(cx, cy, r * 1.05)} {...common} />;
        }
      })}
    </svg>
  );
}
