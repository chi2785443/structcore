import type { SlabInputs } from "@/types";

interface SlabDiagramProps {
  inputs: SlabInputs;
  result?: { shortPos?: { barDesc: string }; longPos?: { barDesc: string } } | null;
}

const VB_W = 700;
const VB_H = 280;

export function SlabDiagram({ inputs, result }: SlabDiagramProps) {
  const { lx, ly, h, type, gk, qk } = inputs;
  const n = 1.4 * gk + 1.6 * qk;
  const cx = VB_W / 2;
  const cy = VB_H / 2;

  const maxDim = Math.max(lx, ly, 1);
  const scale = Math.min(200 / maxDim, 60);

  const slabW = lx * scale;
  const slabH = ly * scale;
  const slabX = cx - slabW / 2;
  const slabY = cy - slabH / 2;

  const isOneWay = type === "one-way";
  const isFlatSlab = type === "flat-slab";

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto" style={{ maxHeight: 260 }}>
      <defs>
        <pattern id="rebar-x" patternUnits="userSpaceOnUse" width={10} height={10}>
          <line x1="0" y1="5" x2="10" y2="5" stroke="#f97316" strokeWidth="1.5" />
        </pattern>
        <pattern id="rebar-xy" patternUnits="userSpaceOnUse" width={10} height={10}>
          <line x1="0" y1="5" x2="10" y2="5" stroke="#f97316" strokeWidth="1" />
          <line x1="5" y1="0" x2="5" y2="10" stroke="#6366f1" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Slab plan */}
      <rect
        x={slabX} y={slabY} width={slabW} height={slabH}
        fill={isOneWay ? "url(#rebar-x)" : "url(#rebar-xy)"}
        stroke="#475569" strokeWidth="2"
      />

      {/* Column heads for flat slab */}
      {isFlatSlab && (
        <>
          {[[slabX, slabY], [slabX + slabW, slabY], [slabX, slabY + slabH], [slabX + slabW, slabY + slabH]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={8} fill="#475569" />
          ))}
        </>
      )}

      {/* Load arrows */}
      {Array.from({ length: 4 }).map((_, i) =>
        Array.from({ length: 3 }).map((_, j) => (
          <line
            key={`${i}-${j}`}
            x1={slabX + (i + 1) * slabW / 5}
            y1={slabY - 20}
            x2={slabX + (i + 1) * slabW / 5}
            y2={slabY - 4}
            stroke="#6366f1" strokeWidth="1.5"
          />
        ))
      )}
      <text x={cx} y={slabY - 24} textAnchor="middle" fontSize="10" fill="#4f46e5" fontWeight="600">
        n = {n.toFixed(1)} kN/m²
      </text>

      {/* Dimension lines */}
      {/* lx */}
      <line x1={slabX} y1={slabY + slabH + 18} x2={slabX + slabW} y2={slabY + slabH + 18}
        stroke="#94a3b8" strokeWidth="1" />
      <line x1={slabX} y1={slabY + slabH + 13} x2={slabX} y2={slabY + slabH + 23} stroke="#94a3b8" strokeWidth="1" />
      <line x1={slabX + slabW} y1={slabY + slabH + 13} x2={slabX + slabW} y2={slabY + slabH + 23} stroke="#94a3b8" strokeWidth="1" />
      <text x={cx} y={slabY + slabH + 33} textAnchor="middle" fontSize="10" fill="#64748b">
        lx = {lx}m {isOneWay ? "(spanning direction)" : "(short span)"}
      </text>

      {/* ly */}
      <line x1={slabX - 18} y1={slabY} x2={slabX - 18} y2={slabY + slabH} stroke="#94a3b8" strokeWidth="1" />
      <text x={slabX - 35} y={cy + 4} fontSize="10" fill="#64748b"
        transform={`rotate(-90 ${slabX - 35} ${cy + 4})`} textAnchor="middle">
        ly = {ly}m
      </text>

      {/* Thickness annotation */}
      <text x={slabX + slabW + 12} y={cy} fontSize="10" fill="#64748b">
        h = {h}mm
      </text>

      {/* Rebar info */}
      {result?.shortPos && (
        <text x={cx} y={VB_H - 10} textAnchor="middle" fontSize="9" fill="#f97316">
          Short span: {result.shortPos.barDesc}
          {result?.longPos ? `   Long span: ${result.longPos.barDesc}` : ""}
        </text>
      )}

      {/* Legend */}
      <line x1={slabX + 5} y1={VB_H - 30} x2={slabX + 20} y2={VB_H - 30} stroke="#f97316" strokeWidth="2" />
      <text x={slabX + 24} y={VB_H - 27} fontSize="9" fill="#f97316">Short span bars</text>
      {!isOneWay && (
        <>
          <line x1={slabX + 80} y1={VB_H - 30} x2={slabX + 95} y2={VB_H - 30} stroke="#6366f1" strokeWidth="2" />
          <text x={slabX + 99} y={VB_H - 27} fontSize="9" fill="#6366f1">Long span bars</text>
        </>
      )}
    </svg>
  );
}
