import type { BeamInputs } from "@/types";

interface BeamDiagramProps {
  inputs: BeamInputs;
  result?: { d: number; barCount: number; barDia: number } | null;
}

const VB_W = 800;
const VB_H = 280;
const LEFT_PAD = 60;
const RIGHT_PAD = 60;
const BEAM_Y = 130;
const BEAM_H = 60;
const DRAW_W = VB_W - LEFT_PAD - RIGHT_PAD;

// Support symbols — Fixed support unused but kept for reference
// function FixedSupport ...

function PinSupport({ cx, cy }: { cx: number; cy: number }) {
  const s = 18;
  return (
    <g>
      <polygon
        points={`${cx},${cy} ${cx - s},${cy + s} ${cx + s},${cy + s}`}
        fill="#475569" stroke="#334155" strokeWidth="1.5"
      />
      <line x1={cx - s - 4} y1={cy + s + 3} x2={cx + s + 4} y2={cy + s + 3} stroke="#334155" strokeWidth="1.5" />
    </g>
  );
}

function RollerSupport({ cx, cy }: { cx: number; cy: number }) {
  const s = 16;
  return (
    <g>
      <polygon
        points={`${cx},${cy} ${cx - s},${cy + s} ${cx + s},${cy + s}`}
        fill="#64748b" stroke="#334155" strokeWidth="1.5"
      />
      <circle cx={cx} cy={cy + s + 6} r={4} fill="#94a3b8" stroke="#334155" strokeWidth="1" />
      <line x1={cx - s - 4} y1={cy + s + 12} x2={cx + s + 4} y2={cy + s + 12} stroke="#334155" strokeWidth="1.5" />
    </g>
  );
}

// UDL arrows
function UDLArrows({ x, width, udl }: { x: number; width: number; udl: number }) {
  if (udl <= 0) return null;
  const count = Math.max(3, Math.floor(width / 30));
  const spacing = width / (count - 1);
  const arrowH = 30;

  return (
    <g>
      {/* Horizontal top line */}
      <line x1={x} y1={BEAM_Y - arrowH} x2={x + width} y2={BEAM_Y - arrowH}
        stroke="#6366f1" strokeWidth="2" />
      {/* Arrows */}
      {Array.from({ length: count }).map((_, i) => {
        const ax = x + i * spacing;
        return (
          <g key={i}>
            <line x1={ax} y1={BEAM_Y - arrowH + 2} x2={ax} y2={BEAM_Y - 2}
              stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
          </g>
        );
      })}
      {/* UDL label */}
      <text x={x + width / 2} y={BEAM_Y - arrowH - 6}
        textAnchor="middle" fontSize="11" fontWeight="600" fill="#4f46e5">
        {udl > 0 ? `${udl} kN/m` : ""}
      </text>
    </g>
  );
}

// Dimension line
function DimensionLine({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  const midX = (x1 + x2) / 2;
  return (
    <g>
      <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke="#94a3b8" strokeWidth="1" />
      <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke="#94a3b8" strokeWidth="1" />
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#94a3b8" strokeWidth="1" />
      <text x={midX} y={y + 14} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="500">
        {label}
      </text>
    </g>
  );
}

// Rebar dots in cross section
function RebarLayer({ cx, d, barCount, barDia, beamB }: {
  cx: number; d: number; barCount: number; barDia: number; beamB: number;
}) {
  const dotR = Math.max(2, Math.min(5, barDia / 3));
  const spacing = Math.min((beamB * 0.8) / (barCount + 1), 15);
  const startX = cx - ((barCount - 1) * spacing) / 2;
  const y = BEAM_Y + BEAM_H - (d / beamB) * BEAM_H * 0.3 - 6;

  return (
    <g>
      {Array.from({ length: barCount }).map((_, i) => (
        <circle
          key={i}
          cx={startX + i * spacing}
          cy={y}
          r={dotR}
          fill="#f97316"
          stroke="#ea580c"
          strokeWidth="0.5"
        />
      ))}
    </g>
  );
}

export function BeamDiagram({ inputs, result }: BeamDiagramProps) {
  const { spans, b, h, supportType } = inputs;
  const totalL = spans.reduce((sum, sp) => sum + sp.length, 0);
  const scale = DRAW_W / totalL;
  const isCont = supportType === "continuous";

  // Beam visual scale (visual depth proportional to h, max 60px)
  const maxHmm = 1000;
  const beamH = Math.min(BEAM_H, Math.max(20, (h / maxHmm) * BEAM_H * 1.5));

  // Total design load for display
  const n = 1.4 * inputs.gk + 1.6 * inputs.qk;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="w-full h-auto"
      style={{ maxHeight: 250 }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 Z" fill="#6366f1" />
        </marker>
      </defs>

      {/* UDL Arrows per span */}
      {spans.map((sp, i) => {
        const xStart = LEFT_PAD + spans.slice(0, i).reduce((s, s2) => s + s2.length * scale, 0);
        return (
          <UDLArrows key={sp.id} x={xStart} width={sp.length * scale} udl={n} />
        );
      })}

      {/* Beam body */}
      <rect
        x={LEFT_PAD}
        y={BEAM_Y}
        width={DRAW_W}
        height={beamH}
        rx={2}
        fill="#e2e8f0"
        stroke="#94a3b8"
        strokeWidth="2"
      />

      {/* Beam hatch / cross-section lines for visual depth */}
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={i}
          x1={LEFT_PAD + 4}
          y1={BEAM_Y + (i + 1) * (beamH / 6)}
          x2={LEFT_PAD + DRAW_W - 4}
          y2={BEAM_Y + (i + 1) * (beamH / 6)}
          stroke="#cbd5e1"
          strokeWidth="0.5"
        />
      ))}

      {/* Section label */}
      <text x={LEFT_PAD + 4} y={BEAM_Y + beamH / 2 + 4} fontSize="9" fill="#94a3b8">
        {b}×{h}mm
      </text>

      {/* Supports */}
      {isCont ? (
        // Continuous: pin at left, intermediate rollers, roller at right
        <>
          <PinSupport cx={LEFT_PAD} cy={BEAM_Y + beamH} />
          {spans.slice(0, -1).map((_sp, i) => {
            const cx = LEFT_PAD + spans.slice(0, i + 1).reduce((s, s2) => s + s2.length * scale, 0);
            return <RollerSupport key={i} cx={cx} cy={BEAM_Y + beamH} />;
          })}
          <RollerSupport cx={LEFT_PAD + DRAW_W} cy={BEAM_Y + beamH} />
        </>
      ) : (
        // Simply supported
        <>
          <PinSupport cx={LEFT_PAD} cy={BEAM_Y + beamH} />
          <RollerSupport cx={LEFT_PAD + DRAW_W} cy={BEAM_Y + beamH} />
        </>
      )}

      {/* Span dimension lines */}
      {spans.map((sp, i) => {
        const xStart = LEFT_PAD + spans.slice(0, i).reduce((s, s2) => s + s2.length * scale, 0);
        return (
          <DimensionLine
            key={sp.id}
            x1={xStart}
            x2={xStart + sp.length * scale}
            y={BEAM_Y + beamH + 40}
            label={`${sp.length}m`}
          />
        );
      })}

      {/* Rebar layer if result available */}
      {result && (
        <RebarLayer
          cx={LEFT_PAD + DRAW_W / 2}
          d={result.d}
          barCount={result.barCount}
          barDia={result.barDia}
          beamB={b}
        />
      )}

      {/* Design load label */}
      <text x={VB_W / 2} y={VB_H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
        Design UDL: n = 1.4×{inputs.gk} + 1.6×{inputs.qk} = {n.toFixed(1)} kN/m
      </text>
    </svg>
  );
}
