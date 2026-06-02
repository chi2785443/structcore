import type { ColumnInputs, ColumnDesignResult, CalcStep, InteractionPoint } from "@/types";
import { step, fmt, selectBars } from "../utils";
import { MIN_STEEL_PERCENT } from "../constants";

export function designColumn(inputs: ColumnInputs): ColumnDesignResult {
  const steps: CalcStep[] = [];
  const failReasons: string[] = [];

  const { h, b, lo, fcu, fy, cover, barDia, N, Mx, My, isBraced } = inputs;

  // Effective length — for a fixed-pinned condition, le ≈ 0.85·lo (simplified)
  // For simplicity, use le = lo (user provides effective height)
  const le = lo;
  const d = h - cover - 6 - barDia / 2;  // 6mm link assumed

  steps.push(step(
    "Effective length",
    "le = lo (user-specified effective length)",
    `le = ${lo} mm`,
    `le = ${le} mm`,
    "BS8110-1:1997 Cl. 3.8.1.6",
  ));

  // Slenderness ratio
  const slendernessRatio = le / h;
  const shortLimit = isBraced ? 15 : 10;
  const isShort = slendernessRatio < shortLimit;

  steps.push(step(
    "Slenderness ratio",
    "le/h",
    `le/h = ${le} / ${h}`,
    `le/h = ${fmt(slendernessRatio, 2)} ${isShort ? "< " + shortLimit + " → Short column" : "≥ " + shortLimit + " → Slender column"}`,
    "BS8110-1:1997 Cl. 3.8.1.3",
    !isShort ? `Slender column — additional moment required` : undefined,
  ));

  // Additional moment for slender columns
  let Madd = 0;
  let Mtotal = Math.max(Math.abs(Mx), Math.abs(My));

  if (!isShort) {
    // Madd = N·h·(le/h)²/2000  — BS8110 Cl. 3.8.3
    Madd = (N * 1000 * h * slendernessRatio * slendernessRatio) / (2000 * 1000);  // kN·m
    Mtotal = Mtotal + Madd;

    steps.push(step(
      "Additional moment (slender column)",
      "M_add = N·h·(le/h)² / 2000",
      `M_add = ${N}×${h}×${fmt(slendernessRatio, 2)}² / 2000`,
      `M_add = ${fmt(Madd)} kN·m`,
      "BS8110-1:1997 Cl. 3.8.3",
    ));
  }

  steps.push(step(
    "Total design moment",
    "M_total = M_applied + M_add",
    `M_total = ${fmt(Math.max(Math.abs(Mx), Math.abs(My)))} + ${fmt(Madd)}`,
    `M_total = ${fmt(Mtotal)} kN·m`,
    "BS8110-1:1997 Cl. 3.8.3",
  ));

  // Gross area and limits
  const Ac = b * h;
  const AscMin = (MIN_STEEL_PERCENT.columnMain / 100) * Ac;
  const AscMax = (MIN_STEEL_PERCENT.columnMax / 100) * Ac;

  steps.push(step(
    "Gross concrete area",
    "Ac = b × h",
    `Ac = ${b} × ${h}`,
    `Ac = ${fmt(Ac, 0)} mm²`,
    "BS8110-1:1997 Cl. 3.8.4",
  ));

  // Determine required steel — iterate
  // Using short column formula for initial estimate, then refine
  // N = 0.4·fcu·(Ac - Asc) + 0.75·fy·Asc  → for axially loaded
  // For eccentric, use approximate interaction: N + M/d approach
  let AscReq: number;

  const Nnm = N * 1000; // N
  const Mnm = Mtotal * 1e6; // N·mm

  if (Mtotal < 0.05 * N * h / 1000) {
    // Effectively axial — BS8110 Cl. 3.8.4.3
    // N = 0.4·fcu·Ac + 0.75·fy·Asc
    // → Asc = (N - 0.4·fcu·Ac) / (0.75·fy - 0.4·fcu)
    const Ndes = Nnm;
    AscReq = (Ndes - 0.4 * fcu * Ac) / (0.75 * fy - 0.4 * fcu);

    steps.push(step(
      "Axial capacity check",
      "N = 0.4·fcu·Ac + 0.75·fy·Asc → Asc = (N - 0.4·fcu·Ac) / (0.75·fy - 0.4·fcu)",
      `Asc = (${fmt(Nnm, 0)} - 0.4×${fcu}×${fmt(Ac, 0)}) / (0.75×${fy} - 0.4×${fcu})`,
      `Asc_req = ${fmt(Math.max(AscReq, AscMin), 0)} mm²`,
      "BS8110-1:1997 Cl. 3.8.4.3",
    ));
  } else {
    // Eccentric — approximate via design charts (use conservative estimate)
    // Nuz = 0.45·fcu·Ac + 0.87·fy·Asc_total  (squash load)
    // Use interaction: Asc = (N/(0.4·fcu·Ac) + M/(0.4·fcu·b·d²)) × Ac / fy * some factor
    // Conservative linear interpolation
    const e = Mnm / Nnm;  // mm eccentricity
    const eMin = Math.max(h / 20, 20);  // minimum eccentricity mm, BS8110 Cl. 3.8.2.4

    steps.push(step(
      "Eccentricity check",
      "e = M/N; e_min = max(h/20, 20mm)",
      `e = ${fmt(Mnm / 1000, 0)} N·mm / ${fmt(Nnm, 0)} N = ${fmt(e, 1)} mm; e_min = ${fmt(eMin, 1)} mm`,
      `e = ${fmt(Math.max(e, eMin), 1)} mm (governing)`,
      "BS8110-1:1997 Cl. 3.8.2.4",
    ));

    const Nconc = 0.4 * fcu * b * 0.9 * Math.min(h, 0.9 * d);

    AscReq = Math.max(
      (Nnm - Nconc + Mnm / (0.87 * d)) / (0.87 * fy),
      AscMin
    );

    steps.push(step(
      "Eccentric steel estimate",
      "Asc = max([N - 0.4·fcu·b·0.9·x] / (0.87·fy) from M-N interaction, Asc_min)",
      `N_conc ≈ ${fmt(Nconc / 1000, 1)} kN`,
      `Asc_req ≈ ${fmt(AscReq, 0)} mm² (verify against interaction diagram)`,
      "BS8110-1:1997 Cl. 3.8.4",
      "For precise design under biaxial bending, use interaction diagram verification",
    ));
  }

  AscReq = Math.max(AscReq, AscMin);

  steps.push(step(
    "Steel limits check",
    "Asc_min = 0.4%·Ac; Asc_max = 6%·Ac",
    `Asc_min = 0.004×${fmt(Ac, 0)} = ${fmt(AscMin, 0)} mm²; Asc_max = 0.06×${fmt(Ac, 0)} = ${fmt(AscMax, 0)} mm²`,
    `Asc_design = ${fmt(AscReq, 0)} mm² (${AscReq > AscMax ? "EXCEEDS MAX — increase section" : "OK"})`,
    "BS8110-1:1997 Cl. 3.12.6.2",
    AscReq > AscMax ? "Steel exceeds 6% — increase column section size" : undefined,
  ));

  if (AscReq > AscMax) {
    failReasons.push("Required steel exceeds 6% of Ac — increase column dimensions");
  }

  const bars = selectBars(AscReq, barDia);

  steps.push(step(
    "Selected main bars",
    "Arrange bars symmetrically in column",
    `As_req = ${fmt(AscReq, 0)} mm²; selected: ${bars.desc}`,
    `As_prov = ${fmt(bars.AsProvided, 0)} mm² (${bars.desc})`,
    "BS8110-1:1997 Cl. 3.12.6",
  ));

  // Links
  const linkDia = Math.max(6, Math.round(barDia / 4));
  const linkSpacing = Math.min(12 * barDia, Math.min(h, b), 300);
  const linkDesc = `T${linkDia}@${linkSpacing}`;

  steps.push(step(
    "Column links",
    "φ_link ≥ max(6mm, φ_bar/4); spacing ≤ min(12φ_bar, least dim, 300mm)",
    `φ_link = max(6, ${barDia}/4) = ${linkDia}mm; spacing = min(${12 * barDia}, ${Math.min(h, b)}, 300) = ${linkSpacing}mm`,
    linkDesc,
    "BS8110-1:1997 Cl. 3.12.7.1",
  ));

  // Capacity check
  const NCapacity = (0.4 * fcu * (Ac - bars.AsProvided) + 0.75 * fy * bars.AsProvided) / 1000;

  steps.push(step(
    "Axial capacity",
    "N_cap = [0.4·fcu·(Ac - Asc) + 0.75·fy·Asc] / 1000",
    `N_cap = [0.4×${fcu}×(${fmt(Ac, 0)}-${fmt(bars.AsProvided, 0)}) + 0.75×${fy}×${fmt(bars.AsProvided, 0)}] / 1000`,
    `N_cap = ${fmt(NCapacity)} kN ${NCapacity >= N ? "≥ N = " + N + " kN ✓" : "< N — FAIL ✗"}`,
    "BS8110-1:1997 Cl. 3.8.4.3",
    NCapacity < N ? `Capacity ${fmt(NCapacity)} kN < applied ${N} kN — increase steel or section` : undefined,
  ));

  if (NCapacity < N) {
    failReasons.push(`Column capacity ${fmt(NCapacity)} kN < applied load ${N} kN`);
  }

  const interactionOK = NCapacity >= N;

  return {
    summary: {
      d,
      le,
      slendernessRatio,
      isShort,
      Ac,
      NCapacity,
      AscReq,
      AscMin,
      AscMax,
      AscProvided: bars.AsProvided,
      barCount: bars.count,
      barDia,
      barDesc: bars.desc,
      linkDia,
      linkSpacing,
      linkDesc,
      Madd,
      Mtotal,
      interactionOK,
    },
    steps,
    status: failReasons.length > 0 ? "fail" : "ok",
    failReasons,
  };
}

/** Generate N-M interaction diagram points for display */
export function computeInteractionDiagram(
  b: number, h: number, cover: number, barDia: number,
  fcu: number, fy: number, Asc: number,
  pts = 20,
): InteractionPoint[] {
  const d = h - cover - 6 - barDia / 2;
  const dPrime = cover + 6 + barDia / 2;
  const points: InteractionPoint[] = [];

  for (let i = 0; i <= pts; i++) {
    const x = (i / pts) * h;  // neutral axis from 0 to h
    const eps_cu = 0.0035;

    // Strain in steel layers
    const eps_s = eps_cu * (d - x) / x;
    const eps_sc = eps_cu * (x - dPrime) / x;

    const fs = Math.min(eps_s * 200000, 0.87 * fy);
    const fsc = Math.min(Math.max(eps_sc * 200000, 0), 0.87 * fy);

    const AscHalf = Asc / 2;  // simplified: half top, half bottom
    const Fconc = 0.45 * fcu * b * Math.min(0.9 * x, h) / 1000;
    const Fsc_force = AscHalf * fsc / 1000;
    const N = Fconc + Fsc_force - AscHalf * fs / 1000;
    const yc = h / 2 - Math.min(0.9 * x, h) / 2;
    const M = (Fconc * yc + AscHalf * (fsc + fs) / 1000 * (d - dPrime) / 2) / 1000;

    if (N >= 0) points.push({ N, M: Math.abs(M) });
  }

  return points;
}
