import type { CalcStep, DeflectionResult } from "@/types";
import { step, fmt, tensionMF } from "../utils";
import { TABLE_3_9 } from "../constants";

export function checkDeflection(
  L: number,        // mm
  d: number,        // mm
  AsReq: number,    // mm²
  AsProvided: number,
  b: number,        // mm
  fy: number,
  M: number,        // N·mm (design moment)
  supportType: "simply-supported" | "continuous" | "cantilever",
  steps: CalcStep[],
): DeflectionResult {
  const ldActual = L / d;

  const basicLd = supportType === "cantilever"
    ? TABLE_3_9.cantilever
    : supportType === "continuous"
      ? TABLE_3_9.continuous
      : TABLE_3_9.simplySup;

  steps.push(step(
    "Span/depth ratio — actual",
    "L/d (actual)",
    `L/d = ${fmt(L, 0)} / ${fmt(d, 0)}`,
    `L/d = ${fmt(ldActual)}`,
    "BS8110-1:1997 Cl. 3.4.6",
  ));

  steps.push(step(
    "Basic span/depth ratio",
    "From BS8110 Table 3.9 based on support condition",
    `Support type: ${supportType}`,
    `Basic L/d = ${basicLd}`,
    "BS8110-1:1997 Table 3.9",
  ));

  const mf = tensionMF(AsReq, AsProvided, fy, M, b, d);

  steps.push(step(
    "Modification factor for tension steel",
    "MF = 0.55 + (477 - fs) / [120 × (0.9 + M/(bd²))]",
    `fs = 5×${fy}×${fmt(AsReq, 0)}/(8×${fmt(AsProvided, 0)}) = ${fmt((5 * fy * AsReq) / (8 * AsProvided), 1)} N/mm²`,
    `MF = ${fmt(mf)} (capped between 0.55 and 2.0)`,
    "BS8110-1:1997 Table 3.10",
  ));

  const ldAllowable = basicLd * mf;

  steps.push(step(
    "Allowable span/depth ratio",
    "L/d_allow = Basic L/d × MF",
    `L/d_allow = ${basicLd} × ${fmt(mf)}`,
    `L/d_allow = ${fmt(ldAllowable)}`,
    "BS8110-1:1997 Cl. 3.4.6.1",
    ldActual > ldAllowable
      ? `Actual L/d = ${fmt(ldActual)} > Allowable ${fmt(ldAllowable)} — deflection likely to exceed L/250`
      : undefined,
  ));

  return {
    ldActual: ldActual,
    ldBasic: basicLd,
    mf,
    ldAllowable,
    ok: ldActual <= ldAllowable,
  };
}
