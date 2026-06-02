import type { CalcStep } from "@/types";
import { BAR_AREAS, STANDARD_BAR_SIZES, SLAB_BAR_TABLE, TABLE_3_8 } from "./constants";

export function step(
  label: string,
  formula: string,
  substitution: string,
  result: string,
  clause?: string,
  warn?: string,
): CalcStep {
  return {
    label,
    formula,
    substitution,
    result,
    clause,
    warn,
    status: warn ? "warn" : "ok",
  };
}

export function failStep(
  label: string,
  formula: string,
  substitution: string,
  result: string,
  clause?: string,
): CalcStep {
  return { label, formula, substitution, result, clause, status: "fail" };
}

export function round(v: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}

export function fmt(v: number, dp = 2): string {
  return round(v, dp).toFixed(dp);
}

/** Effective depth from overall depth */
export function effectiveDepth(h: number, cover: number, linkDia: number, barDia: number): number {
  return h - cover - linkDia - barDia / 2;
}

/** Find vc by interpolating BS8110 Table 3.8 */
export function findVc(As: number, b: number, d: number, fcu: number): number {
  const ratio = Math.min((100 * As) / (b * d), 3.0);

  // Clamp fcu for table lookup
  const fcuClamped = Math.min(Math.max(fcu, 25), 40);
  const fcuFrac = (fcuClamped - 25) / 15; // 0 at fcu=25, 1 at fcu=40

  // Find bracketing rows in Table 3.8
  let lower = TABLE_3_8[0];
  let upper = TABLE_3_8[TABLE_3_8.length - 1];

  for (let i = 0; i < TABLE_3_8.length - 1; i++) {
    if (ratio >= TABLE_3_8[i].ratio && ratio <= TABLE_3_8[i + 1].ratio) {
      lower = TABLE_3_8[i];
      upper = TABLE_3_8[i + 1];
      break;
    }
    if (ratio < TABLE_3_8[0].ratio) { lower = TABLE_3_8[0]; upper = TABLE_3_8[0]; break; }
    if (ratio > TABLE_3_8[TABLE_3_8.length - 1].ratio) {
      lower = TABLE_3_8[TABLE_3_8.length - 1];
      upper = TABLE_3_8[TABLE_3_8.length - 1];
      break;
    }
  }

  const interpRow = (row: typeof lower): number => {
    return row.vc_25 + fcuFrac * (row.vc_40 - row.vc_25) / 1.0 *
      (fcuClamped - 25) / 15;
  };

  // Interpolate between vc_25 and vc_40 first within each row
  const vcLower = lower.vc_25 + (fcuClamped - 25) * (lower.vc_40 - lower.vc_25) / 15;
  const vcUpper = upper.vc_25 + (fcuClamped - 25) * (upper.vc_40 - upper.vc_25) / 15;

  if (lower === upper) return interpRow(lower);

  // Interpolate between rows by ratio
  const t = (ratio - lower.ratio) / (upper.ratio - lower.ratio);
  return vcLower + t * (vcUpper - vcLower);
}

/** Select minimum bars for a given required area */
export function selectBars(
  AsReq: number,
  preferredDia: number,
): { count: number; dia: number; AsProvided: number; desc: string } {
  const dia = STANDARD_BAR_SIZES.includes(preferredDia)
    ? preferredDia
    : 16;
  const areaPerBar = BAR_AREAS[dia];
  const count = Math.ceil(AsReq / areaPerBar);
  const AsProvided = count * areaPerBar;
  return { count, dia, AsProvided, desc: `${count}T${dia}` };
}

/** Select slab bar/spacing for a required As/m */
export function selectSlabBars(
  AsReq: number,
  preferredDia = 12,
): { dia: number; spacing: number; AsProvided: number; desc: string } {
  // Filter by preferred bar dia first, then any dia
  const options = SLAB_BAR_TABLE.filter(
    (r) => r.dia === preferredDia && r.As >= AsReq,
  );
  const all = options.length > 0 ? options : SLAB_BAR_TABLE.filter((r) => r.As >= AsReq);
  if (all.length === 0) {
    // Fall back to maximum available
    const max = SLAB_BAR_TABLE.reduce((a, b) => (b.As > a.As ? b : a));
    return { dia: max.dia, spacing: max.spacing, AsProvided: max.As, desc: `T${max.dia}@${max.spacing}` };
  }
  const chosen = all.reduce((a, b) => (b.As < a.As ? b : a));
  return { dia: chosen.dia, spacing: chosen.spacing, AsProvided: chosen.As, desc: `T${chosen.dia}@${chosen.spacing}` };
}

/** Design modification factor for tension reinforcement (BS8110 Table 3.10) */
export function tensionMF(
  AsReq: number,
  AsProvided: number,
  fy: number,
  M: number,
  b: number,
  d: number,
): number {
  const fs = (5 * fy * AsReq) / (8 * AsProvided);
  const MFval = 0.55 + (477 - fs) / (120 * (0.9 + M / (b * d * d)));
  return Math.min(Math.max(MFval, 0.55), 2.0);
}

/** Minimum nominal cover (mm) — simplified from BS8110 Tables 3.3/3.4 */
export function minCover(exposure: string, fireHours: number): number {
  const exposureMap: Record<string, number> = {
    mild: 20, moderate: 25, severe: 35, "very-severe": 40,
  };
  const fireCover = fireHours >= 2 ? 35 : fireHours >= 1 ? 20 : 15;
  return Math.max(exposureMap[exposure] ?? 25, fireCover);
}
