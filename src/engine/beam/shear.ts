import type { CalcStep, ShearDesignResult } from "@/types";
import { step, fmt, findVc, round } from "../utils";
import { BAR_AREAS } from "../constants";

export function designShear(
  V: number,       // kN
  b: number,       // mm
  d: number,       // mm
  As: number,      // mm² provided tension steel
  fcu: number,
  fyv: number,
  linkDia: number,
  steps: CalcStep[],
): ShearDesignResult {
  const v = (V * 1000) / (b * d);  // N/mm²
  const vc = findVc(As, b, d, fcu);
  const vmax = Math.min(0.8 * Math.sqrt(fcu), 5.0);

  steps.push(step(
    "Design shear stress",
    "v = V / (b·d)",
    `v = (${fmt(V, 1)}×10³) / (${b}×${fmt(d, 0)})`,
    `v = ${fmt(v)} N/mm²`,
    "BS8110-1:1997 Cl. 3.4.5.2",
    v > vmax ? `v = ${fmt(v)} N/mm² EXCEEDS maximum vmax = ${fmt(vmax)} N/mm² — increase section size` : undefined,
  ));

  steps.push(step(
    "Maximum shear stress check",
    "v_max = min(0.8√fcu, 5.0) N/mm²",
    `v_max = min(0.8×√${fcu}, 5.0) = min(${fmt(0.8 * Math.sqrt(fcu))}, 5.0)`,
    `v_max = ${fmt(vmax)} N/mm² — ${v <= vmax ? "OK ✓" : "FAIL ✗"}`,
    "BS8110-1:1997 Cl. 3.4.5.2",
  ));

  steps.push(step(
    "Concrete shear capacity",
    "vc from BS8110 Table 3.8 (interpolated by 100As/bd and fcu)",
    `100As/(bd) = 100×${fmt(As, 0)}/(${b}×${fmt(d, 0)}) = ${fmt((100 * As) / (b * d))}`,
    `vc = ${fmt(vc)} N/mm²`,
    "BS8110-1:1997 Table 3.8",
  ));

  const linksRequired = v > 0.5 * vc;
  let AsvSv = 0;
  let linkSpacing = 0;
  let linkDesc = "Not required (v ≤ 0.5vc)";
  const svMax = round(0.75 * d);

  if (!linksRequired) {
    steps.push(step(
      "Shear links check",
      "v ≤ 0.5vc — no links required",
      `${fmt(v)} ≤ ${fmt(0.5 * vc)}`,
      "Nominal links only — provide T8@300 minimum",
      "BS8110-1:1997 Cl. 3.4.5.3",
    ));
    // Nominal links
    AsvSv = 0;
    linkSpacing = 300;
    linkDesc = `T${linkDia}@300 (nominal)`;
  } else {
    // Links required
    AsvSv = Math.max((v - vc) * b / (0.87 * fyv), 0.4 * b / (0.87 * fyv));

    steps.push(step(
      "Shear reinforcement requirement",
      "Asv/sv = (v - vc)·b / (0.87·fyv)",
      `Asv/sv = (${fmt(v)} - ${fmt(vc)})×${b} / (0.87×${fyv})`,
      `Asv/sv = ${fmt(AsvSv, 3)} mm²/mm`,
      "BS8110-1:1997 Cl. 3.4.5.3",
    ));

    // Max link spacing
    steps.push(step(
      "Maximum link spacing",
      "sv_max = 0.75d",
      `sv_max = 0.75×${fmt(d, 0)} = ${svMax} mm (also ≤ 300mm)`,
      `sv_max = ${Math.min(svMax, 300)} mm`,
      "BS8110-1:1997 Cl. 3.4.5.5",
    ));

    // Select link spacing
    const sv = Math.min(svMax, 300);
    const areaPerLeg = BAR_AREAS[linkDia] ?? 50.3;
    const legsRequired = Math.ceil(AsvSv * sv / areaPerLeg);
    const legsProvided = Math.max(legsRequired, 2);
    linkSpacing = Math.floor((legsProvided * areaPerLeg) / AsvSv);
    linkSpacing = Math.min(linkSpacing, sv);
    linkDesc = `T${linkDia}@${linkSpacing} (${legsProvided} legs)`;

    steps.push(step(
      "Selected shear links",
      "Provide links: T[dia]@[spacing]",
      `Asv/sv provided = ${fmt((legsProvided * areaPerLeg) / linkSpacing, 3)} mm²/mm ≥ ${fmt(AsvSv, 3)} mm²/mm`,
      linkDesc,
      "BS8110-1:1997 Cl. 3.4.5",
    ));
  }

  return {
    v,
    vc,
    vmax,
    linksRequired,
    svMax,
    AsvSv,
    linkDia,
    linkSpacing,
    linkDesc,
  };
}
