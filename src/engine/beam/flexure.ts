import type { CalcStep, SectionDesignResult } from "@/types";
import { step, fmt, effectiveDepth, selectBars } from "../utils";
import { MIN_STEEL_PERCENT } from "../constants";

/**
 * Design a singly (or doubly if required) reinforced rectangular beam section.
 * M is in kN·m, all dimensions in mm, stresses in N/mm².
 */
export function designSection(
  M: number,       // kN·m (absolute value)
  b: number,
  h: number,
  cover: number,
  linkDia: number,
  barDia: number,
  fcu: number,
  fy: number,
  steps: CalcStep[],
  sectionLabel = "",
): SectionDesignResult {
  const Mnm = M * 1e6;  // N·mm

  const d = effectiveDepth(h, cover, linkDia, barDia);

  steps.push(step(
    `${sectionLabel}Effective depth`,
    "d = h - cover - φ_link - φ_bar/2",
    `d = ${h} - ${cover} - ${linkDia} - ${barDia}/2`,
    `d = ${fmt(d, 0)} mm`,
    "BS8110-1:1997 Cl. 3.3.6",
  ));

  const K = Mnm / (fcu * b * d * d);
  const Kprime = 0.156;  // singly reinforced limit (no redistribution)

  steps.push(step(
    `${sectionLabel}Moment capacity factor K`,
    "K = M / (fcu·b·d²)",
    `K = ${fmt(M)}×10⁶ / (${fcu}×${b}×${fmt(d, 0)}²)`,
    `K = ${fmt(K, 4)}`,
    "BS8110-1:1997 Cl. 3.4.4.4",
    K > Kprime ? `K = ${fmt(K, 4)} > K' = ${Kprime} — doubly reinforced section required` : undefined,
  ));

  let doublyReinforced = false;
  let AsComp: number | undefined;
  let compBarCount: number | undefined;
  let compBarDesc: string | undefined;

  let z: number;
  let AsReq: number;

  if (K <= Kprime) {
    // Singly reinforced
    const sqrtTerm = Math.max(0.25 - K / 0.9, 0);
    z = d * (0.5 + Math.sqrt(sqrtTerm));
    const zCap = 0.95 * d;
    const zLimited = z > zCap;
    z = Math.min(z, zCap);

    steps.push(step(
      `${sectionLabel}Lever arm z`,
      "z = d[0.5 + √(0.25 - K/0.9)] ≤ 0.95d",
      `z = ${fmt(d, 0)}[0.5 + √(0.25 - ${fmt(K, 4)}/0.9)]`,
      `z = ${fmt(z, 0)} mm`,
      "BS8110-1:1997 Cl. 3.4.4.4",
      zLimited ? `z limited to 0.95d = ${fmt(zCap, 0)} mm` : undefined,
    ));

    AsReq = Mnm / (0.87 * fy * z);
  } else {
    // Doubly reinforced — use K' for tension and provide compression steel
    doublyReinforced = true;
    const sqrtTerm = Math.max(0.25 - Kprime / 0.9, 0);
    z = d * (0.5 + Math.sqrt(sqrtTerm));
    z = Math.min(z, 0.95 * d);

    const dPrime = cover + linkDia + barDia / 2;
    const Mcapped = Kprime * fcu * b * d * d;

    AsComp = (Mnm - Mcapped) / (0.87 * fy * (d - dPrime));
    AsReq = Mcapped / (0.87 * fy * z) + AsComp;

    steps.push(step(
      `${sectionLabel}Doubly reinforced — lever arm`,
      "z = d[0.5 + √(0.25 - K'/0.9)]",
      `z = ${fmt(d, 0)}[0.5 + √(0.25 - ${Kprime}/0.9)]`,
      `z = ${fmt(z, 0)} mm`,
      "BS8110-1:1997 Cl. 3.4.4.5",
    ));

    steps.push(step(
      `${sectionLabel}Compression steel area`,
      "As' = (M - K'·fcu·b·d²) / [0.87·fy·(d - d')]",
      `As' = (${fmt(M)}×10⁶ - ${fmt(Mcapped / 1e6)}×10⁶) / [0.87×${fy}×(${fmt(d, 0)}-${fmt(dPrime, 0)})]`,
      `As' = ${fmt(AsComp, 0)} mm²`,
      "BS8110-1:1997 Cl. 3.4.4.5",
    ));

    const compBars = selectBars(AsComp, barDia);
    compBarCount = compBars.count;
    compBarDesc = compBars.desc;
  }

  steps.push(step(
    `${sectionLabel}Required tension steel area`,
    "As = M / (0.87·fy·z)",
    `As = ${fmt(M)}×10⁶ / (0.87×${fy}×${fmt(z, 0)})`,
    `As_req = ${fmt(AsReq, 0)} mm²`,
    "BS8110-1:1997 Cl. 3.4.4.4",
  ));

  // Minimum steel check
  const AsMin = (MIN_STEEL_PERCENT.beamTension / 100) * b * h;

  steps.push(step(
    `${sectionLabel}Minimum steel check`,
    "As_min = 0.13%·b·h (fy=460)",
    `As_min = 0.0013×${b}×${h}`,
    `As_min = ${fmt(AsMin, 0)} mm²`,
    "BS8110-1:1997 Table 3.25",
    AsMin > AsReq ? `Minimum steel governs: use As = ${fmt(AsMin, 0)} mm²` : undefined,
  ));

  const AsDesign = Math.max(AsReq, AsMin);
  const bars = selectBars(AsDesign, barDia);

  steps.push(step(
    `${sectionLabel}Selected tension bars`,
    "Select bars: count × area ≥ As_design",
    `As_design = max(${fmt(AsDesign, 0)}, ${fmt(AsMin, 0)}) = ${fmt(AsDesign, 0)} mm²`,
    `${bars.desc} → As_prov = ${fmt(bars.AsProvided, 0)} mm²`,
    "BS8110-1:1997 Cl. 3.12.6",
  ));

  return {
    d,
    K,
    Kprime,
    z,
    AsReq,
    AsMin,
    barCount: bars.count,
    barDia,
    AsProvided: bars.AsProvided,
    barDesc: bars.desc,
    doublyReinforced,
    AsComp,
    compBarCount,
    compBarDesc,
  };
}
