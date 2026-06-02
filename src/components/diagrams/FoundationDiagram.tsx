import type { PadFoundationInputs } from "@/types";

interface FoundationDiagramProps {
  inputs: PadFoundationInputs;
  result?: {
    p_max: number; p_min: number; pressureOK: boolean;
    punchingShear?: { ok: boolean };
  } | null;
}

const VB_W = 700;
const VB_H = 300;

export function FoundationDiagram({ inputs, result }: FoundationDiagramProps) {
  const { padB, padL, h, columnB, columnH, N } = inputs;
  const cx = VB_W / 2;

  const maxDim = Math.max(padB, padL, 1);
  const scale = Math.min(160 / maxDim, 50);

  const padW = padL * scale;
  const padThick = Math.min(60, h * 0.08);
  const colW = (columnB / 1000) * scale;
  const colH = 50;

  const padX = cx - padW / 2;
  const padY = 160;

  // Bearing pressure gradient
  const pMax = result?.p_max ?? inputs.N / (padB * padL);
  const pMin = result?.p_min ?? pMax * 0.6;
  const pressureH = 25;
  const pMaxH = pressureH;
  const pMinH = (pMin / pMax) * pressureH;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto" style={{ maxHeight: 270 }}>
      <defs>
        <marker id="fn-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 Z" fill="#6366f1" />
        </marker>
      </defs>

      {/* Column */}
      <rect
        x={cx - colW / 2} y={padY - colH}
        width={colW} height={colH}
        fill="#94a3b8" stroke="#475569" strokeWidth="2"
      />

      {/* Axial load */}
      <line x1={cx} y1={padY - colH - 35} x2={cx} y2={padY - colH - 5}
        stroke="#6366f1" strokeWidth="2.5" markerEnd="url(#fn-arrow)" />
      <text x={cx + 8} y={padY - colH - 20} fontSize="10" fill="#6366f1" fontWeight="600">
        N = {N} kN
      </text>

      {/* Pad foundation */}
      <rect
        x={padX} y={padY}
        width={padW} height={padThick}
        fill="#cbd5e1" stroke="#475569" strokeWidth="2"
      />

      {/* Rebar (horizontal lines inside pad) */}
      <line x1={padX + 6} y1={padY + padThick - 8} x2={padX + padW - 6} y2={padY + padThick - 8}
        stroke="#f97316" strokeWidth="1.5" />
      <line x1={padX + 6} y1={padY + padThick - 14} x2={padX + padW - 6} y2={padY + padThick - 14}
        stroke="#6366f1" strokeWidth="1.5" />

      {/* Bearing pressure */}
      <polygon
        points={`${padX},${padY + padThick} ${padX},${padY + padThick + pMaxH} ${padX + padW},${padY + padThick + pMinH} ${padX + padW},${padY + padThick}`}
        fill="rgba(249,115,22,0.2)" stroke="#f97316" strokeWidth="1.5"
      />
      <text x={padX - 4} y={padY + padThick + pMaxH + 14}
        textAnchor="end" fontSize="9" fill={result?.pressureOK === false ? "#ef4444" : "#f97316"}>
        {pMax.toFixed(0)} kN/m²
      </text>
      <text x={padX + padW + 4} y={padY + padThick + pMinH + 14}
        fontSize="9" fill="#f97316">
        {pMin.toFixed(0)} kN/m²
      </text>

      {/* Punching shear perimeter (1.5d) indication */}
      {result?.punchingShear && (
        <rect
          x={cx - colW / 2 - 20} y={padY - 15}
          width={colW + 40} height={padThick + 30}
          rx={4} fill="none"
          stroke={result.punchingShear.ok ? "#22c55e" : "#ef4444"}
          strokeWidth="1" strokeDasharray="4,2"
        />
      )}
      <text x={cx} y={padY - 20} textAnchor="middle" fontSize="9" fill="#94a3b8">
        1.5d perimeter
      </text>

      {/* Dimensions */}
      <line x1={padX} y1={padY + padThick + 50} x2={padX + padW} y2={padY + padThick + 50}
        stroke="#94a3b8" strokeWidth="1" />
      <line x1={padX} y1={padY + padThick + 45} x2={padX} y2={padY + padThick + 55} stroke="#94a3b8" strokeWidth="1" />
      <line x1={padX + padW} y1={padY + padThick + 45} x2={padX + padW} y2={padY + padThick + 55} stroke="#94a3b8" strokeWidth="1" />
      <text x={cx} y={padY + padThick + 65} textAnchor="middle" fontSize="10" fill="#64748b">
        {padL}m × {padB}m (pad); h = {h}mm
      </text>

      {/* Column size */}
      <text x={cx} y={padY - colH - 45} textAnchor="middle" fontSize="9" fill="#64748b">
        Column: {columnH}×{columnB}mm
      </text>

      {/* Rebar legend */}
      <line x1={padX} y1={VB_H - 12} x2={padX + 15} y2={VB_H - 12} stroke="#f97316" strokeWidth="2" />
      <text x={padX + 19} y={VB_H - 9} fontSize="9" fill="#f97316">x-bars</text>
      <line x1={padX + 55} y1={VB_H - 12} x2={padX + 70} y2={VB_H - 12} stroke="#6366f1" strokeWidth="2" />
      <text x={padX + 74} y={VB_H - 9} fontSize="9" fill="#6366f1">y-bars</text>
    </svg>
  );
}
