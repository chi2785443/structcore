import type { ColumnInputs } from "@/types";

interface ColumnDiagramProps {
  inputs: ColumnInputs;
  result?: { barCount: number; barDia: number; isShort: boolean; le: number } | null;
}

const VB_W = 600;
const VB_H = 320;

export function ColumnDiagram({ inputs, result }: ColumnDiagramProps) {
  const { h, b, lo, N, Mx } = inputs;
  const scale = Math.min(120 / Math.max(h, b), 0.3);
  const colW = b * scale;
  const colH = Math.min(200, lo * 0.04);
  const cx = VB_W / 2;
  const colTop = 30;

  // Rebar dots
  const barR = 4;
  const dotOffX = colW * 0.15;
  const dotOffY = 10;
  const topY = colTop + dotOffY;
  const botY = colTop + colH - dotOffY;
  const barsPerSide = Math.max(2, Math.floor((result?.barCount ?? 4) / 2));

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto" style={{ maxHeight: 280 }}>
      {/* Axial load arrow */}
      <defs>
        <marker id="col-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 Z" fill="#6366f1" />
        </marker>
      </defs>

      <line
        x1={cx} y1={0}
        x2={cx} y2={colTop}
        stroke="#6366f1" strokeWidth="2.5" markerEnd="url(#col-arrow)"
      />
      <text x={cx + 8} y={18} fontSize="10" fill="#6366f1" fontWeight="600">N = {N} kN</text>

      {/* Moment arrow if any */}
      {Mx > 0 && (
        <>
          <path
            d={`M ${cx - colW / 2 - 25} ${colTop + colH / 2}
                Q ${cx - colW / 2 - 40} ${colTop + colH / 2 - 20}
                  ${cx - colW / 2 - 35} ${colTop + colH / 2 - 40}`}
            fill="none" stroke="#f97316" strokeWidth="2"
          />
          <text x={cx - colW / 2 - 65} y={colTop + colH / 2 - 45}
            fontSize="10" fill="#f97316" fontWeight="600">
            Mx={Mx}kN·m
          </text>
        </>
      )}

      {/* Column body */}
      <rect
        x={cx - colW / 2}
        y={colTop}
        width={colW}
        height={colH}
        rx={2}
        fill="#e2e8f0"
        stroke="#94a3b8"
        strokeWidth="2"
      />

      {/* Rebar dots */}
      {Array.from({ length: barsPerSide }).map((_, i) => {
        const x = cx - colW / 2 + dotOffX + (i * (colW - 2 * dotOffX)) / Math.max(barsPerSide - 1, 1);
        return (
          <g key={`top-${i}`}>
            <circle cx={x} cy={topY} r={barR} fill="#f97316" stroke="#ea580c" strokeWidth="0.5" />
            <circle cx={x} cy={botY} r={barR} fill="#f97316" stroke="#ea580c" strokeWidth="0.5" />
          </g>
        );
      })}

      {/* Links representation */}
      <rect
        x={cx - colW / 2 + 6}
        y={colTop + 15}
        width={colW - 12}
        height={colH - 30}
        rx={1}
        fill="none"
        stroke="#64748b"
        strokeWidth="1"
        strokeDasharray="3,2"
      />

      {/* Dimension annotations */}
      {/* b dimension */}
      <line x1={cx - colW / 2} y1={colTop + colH + 15} x2={cx + colW / 2} y2={colTop + colH + 15}
        stroke="#94a3b8" strokeWidth="1" />
      <line x1={cx - colW / 2} y1={colTop + colH + 10} x2={cx - colW / 2} y2={colTop + colH + 20}
        stroke="#94a3b8" strokeWidth="1" />
      <line x1={cx + colW / 2} y1={colTop + colH + 10} x2={cx + colW / 2} y2={colTop + colH + 20}
        stroke="#94a3b8" strokeWidth="1" />
      <text x={cx} y={colTop + colH + 28} textAnchor="middle" fontSize="10" fill="#64748b">
        b = {b} mm
      </text>

      {/* h dimension (right side) */}
      <line x1={cx + colW / 2 + 15} y1={colTop} x2={cx + colW / 2 + 15} y2={colTop + colH}
        stroke="#94a3b8" strokeWidth="1" />
      <text
        x={cx + colW / 2 + 25}
        y={colTop + colH / 2 + 4}
        fontSize="10" fill="#64748b"
        transform={`rotate(-90 ${cx + colW / 2 + 25} ${colTop + colH / 2 + 4})`}
        textAnchor="middle"
      >
        h = {h} mm
      </text>

      {/* lo label */}
      <text x={cx - colW / 2 - 35} y={colTop + colH / 2}
        fontSize="10" fill="#94a3b8" textAnchor="middle"
        transform={`rotate(-90 ${cx - colW / 2 - 35} ${colTop + colH / 2})`}>
        lo = {(lo / 1000).toFixed(2)}m
      </text>

      {/* Status badge */}
      {result && (
        <text x={cx} y={colTop + colH + 50} textAnchor="middle" fontSize="10" fill="#6366f1" fontWeight="600">
          {result.isShort ? "Short column" : "Slender column"} — {result.barCount}T{result.barDia}
        </text>
      )}
    </svg>
  );
}
