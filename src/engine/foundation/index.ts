import type { PadFoundationInputs, PadFoundationDesignResult, CalcStep } from "@/types";
import { step, fmt, effectiveDepth, selectBars, findVc } from "../utils";
import { MIN_STEEL_PERCENT } from "../constants";

export function designPadFoundation(inputs: PadFoundationInputs): PadFoundationDesignResult {
  const steps: CalcStep[] = [];
  const failReasons: string[] = [];

  const {
    N, Mx, My, columnB, columnH, padB, padL, h, cover, barDia,
    fcu, fy, Fb, concreteGamma, soilDensity, soilDepth,
  } = inputs;

  // Effective depth
  const d = effectiveDepth(h, cover, 0, barDia);

  steps.push(step(
    "Effective depth",
    "d = h - cover - φ_bar/2",
    `d = ${h} - ${cover} - ${barDia}/2`,
    `d = ${fmt(d, 0)} mm`,
    "BS8110-1:1997 Cl. 3.3.6",
  ));

  // Self weight of foundation and soil surcharge
  const area = padB * padL;
  const selfWeight = area * (h / 1000) * concreteGamma;  // kN
  const soilWeight = area * soilDepth * soilDensity;       // kN (overburden)
  const Ntotal = N + selfWeight + soilWeight;

  steps.push(step(
    "Foundation self weight & soil",
    "W_f = A·h·γ_conc; W_soil = A·d_soil·γ_soil",
    `W_f = ${padB}×${padL}×${h / 1000}×${concreteGamma} = ${fmt(selfWeight, 1)}kN; W_soil = ${padB}×${padL}×${soilDepth}×${soilDensity} = ${fmt(soilWeight, 1)}kN`,
    `Total vertical load N_total = ${N} + ${fmt(selfWeight, 1)} + ${fmt(soilWeight, 1)} = ${fmt(Ntotal, 1)} kN`,
    "BS8110-1:1997 Cl. 3.11.2.1",
  ));

  // Bearing pressures (service loads)
  const Zx = padB * padL * padL / 6;  // m³
  const Zy = padL * padB * padB / 6;
  const p_avg = Ntotal / area;
  const p_max = p_avg + Mx / Zx + My / Zy;
  const p_min = p_avg - Mx / Zx - My / Zy;
  const pressureOK = p_max <= Fb && p_min >= 0;

  steps.push(step(
    "Bearing pressures",
    "p = N/A ± Mx/Zx ± My/Zy",
    `p_avg = ${fmt(Ntotal, 1)}/${fmt(area, 2)} = ${fmt(p_avg, 1)}kN/m²; Zx=${fmt(Zx, 3)}m³; Zy=${fmt(Zy, 3)}m³`,
    `p_max = ${fmt(p_max, 1)} kN/m²; p_min = ${fmt(p_min, 1)} kN/m² (allowable Fb = ${Fb} kN/m²)`,
    "BS8110-1:1997 Cl. 3.11.2.2",
    !pressureOK ? `p_max ${fmt(p_max, 1)} > Fb ${Fb} kN/m² — increase pad size` : undefined,
  ));

  if (!pressureOK) {
    failReasons.push(`Max bearing pressure ${fmt(p_max, 1)} kN/m² exceeds allowable ${Fb} kN/m²`);
  }
  if (p_min < 0) {
    failReasons.push("Tension developing under foundation — eccentric loading too large");
  }

  // Ultimate bearing pressure for structural design (use factored loads)
  const p_ult = (1.4 * N) / area;  // simplified — ignore moments for structural design

  steps.push(step(
    "Ultimate bearing pressure (structural design)",
    "p_ult = 1.4·N / A (factored, without foundation weight)",
    `p_ult = 1.4×${N} / ${fmt(area, 2)}`,
    `p_ult = ${fmt(p_ult, 1)} kN/m²`,
    "BS8110-1:1997 Cl. 3.11.3",
  ));

  // Cantilever projections from column face
  const lx = (padL - columnH / 1000) / 2;  // m (projection in x direction)
  const ly = (padB - columnB / 1000) / 2;  // m (projection in y direction)

  // Bending moments (cantilever from column face)
  const Mx_cant = p_ult * padB * lx * lx / 2;  // kN·m (total, over full pad width)
  const My_cant = p_ult * padL * ly * ly / 2;

  const Mx_per_m = Mx_cant / padB;
  const My_per_m = My_cant / padL;

  steps.push(step(
    "Cantilever moments",
    "M = p_ult · B · lx² / 2 (total); M/m = M/B",
    `lx = (${padL} - ${columnH / 1000}) / 2 = ${fmt(lx, 3)}m; ly = ${fmt(ly, 3)}m`,
    `Mx = ${fmt(Mx_cant, 1)}kN·m → ${fmt(Mx_per_m, 1)}kN·m/m; My = ${fmt(My_cant, 1)}kN·m → ${fmt(My_per_m, 1)}kN·m/m`,
    "BS8110-1:1997 Cl. 3.11.3.1",
  ));

  // Flexural design — x direction (per metre width)
  function flexDesign(M_per_m: number, label: string) {
    const Mnm = M_per_m * 1e6;
    const b = 1000;
    const K = Mnm / (fcu * b * d * d);
    const z = Math.min(d * (0.5 + Math.sqrt(Math.max(0.25 - K / 0.9, 0))), 0.95 * d);
    const AsReq = Mnm / (0.87 * fy * z);
    const AsMin = (MIN_STEEL_PERCENT.slabTension / 100) * b * h;
    const bars = selectBars(Math.max(AsReq, AsMin), barDia);

    steps.push(step(
      label,
      "K=M/(fcu·b·d²); z; As=M/(0.87·fy·z)",
      `K=${fmt(K, 4)}, z=${fmt(z, 0)}mm, As_req=${fmt(AsReq, 0)}mm²/m, As_min=${fmt(AsMin, 0)}mm²/m`,
      `${bars.desc} (As_prov = ${fmt(bars.AsProvided, 0)} mm²/m)`,
      "BS8110-1:1997 Cl. 3.4.4.4",
    ));

    return { K, z, AsReq, AsMin: AsMin, AsProvided: bars.AsProvided, barDesc: bars.desc };
  }

  const flexX = flexDesign(Mx_per_m, "Flexure — x direction (parallel to padL)");
  const flexY = flexDesign(My_per_m, "Flexure — y direction (parallel to padB)");

  // Wide beam shear — critical at d from column face
  const Vx = p_ult * padB * Math.max(lx - d / 1000, 0);   // kN (over full width)
  const Vy = p_ult * padL * Math.max(ly - d / 1000, 0);
  const vx = (Vx * 1000) / (padB * 1000 * d);
  const vy = (Vy * 1000) / (padL * 1000 * d);
  const vc_w = findVc(flexX.AsProvided, 1000, d, fcu);
  const wideBeamOK = vx <= vc_w && vy <= vc_w;

  steps.push(step(
    "Wide beam shear (at d from column face)",
    "v = V_shear / (B·d); B·critical = d from column face",
    `Vx = ${fmt(Vx, 1)}kN → vx = ${fmt(vx)} N/mm²; Vy = ${fmt(Vy, 1)}kN → vy = ${fmt(vy)} N/mm²; vc = ${fmt(vc_w)} N/mm²`,
    wideBeamOK ? "Wide beam shear OK ✓" : `Wide beam shear FAIL — vx=${fmt(vx)}, vy=${fmt(vy)} > vc=${fmt(vc_w)}`,
    "BS8110-1:1997 Cl. 3.11.3.3",
    !wideBeamOK ? "Increase pad thickness" : undefined,
  ));

  if (!wideBeamOK) failReasons.push("Wide beam shear failure — increase pad thickness");

  // Punching shear — critical at 1.5d from column face
  const cx = columnH;  // mm
  const cy = columnB;  // mm
  const perimeter = 2 * (cx + cy) + 4 * Math.PI * 1.5 * d;  // mm
  const V_p = 1.4 * N - p_ult * ((cx / 1000 + 3 * d / 1000) * (cy / 1000 + 3 * d / 1000));  // kN
  const v_p = (Math.max(V_p, 0) * 1000) / (perimeter * d);
  const vc_p = findVc(flexX.AsProvided, 1000, d, fcu);
  const punchingOK = v_p <= vc_p;

  steps.push(step(
    "Punching shear (at 1.5d from column face)",
    "u = 2(cx+cy) + 4π×1.5d; v = V_punch / (u·d)",
    `u = 2×(${cx}+${cy})+4π×1.5×${fmt(d, 0)} = ${fmt(perimeter, 0)}mm; V_p = ${fmt(V_p, 1)}kN`,
    `v_punching = ${fmt(v_p)} N/mm² vs vc = ${fmt(vc_p)} N/mm² — ${punchingOK ? "OK ✓" : "FAIL ✗"}`,
    "BS8110-1:1997 Cl. 3.11.3.3",
    !punchingOK ? "Punching shear failure — increase pad depth or provide shear reinforcement" : undefined,
  ));

  if (!punchingOK) failReasons.push(`Punching shear ${fmt(v_p)} N/mm² > vc = ${fmt(vc_p)} N/mm²`);

  return {
    summary: {
      area, selfWeight, soilWeight, Ntotal,
      p_max, p_min, p_avg, pressureOK,
      d, lx, ly,
      Mx_cant, My_cant,
      flexX, flexY,
      wideBeamShear: { Vx, Vy, vx, vy, vc: vc_w, ok: wideBeamOK },
      punchingShear: { perimeter, V_punching: V_p, v_punching: v_p, vc: vc_p, ok: punchingOK },
    },
    steps,
    status: failReasons.length > 0 ? "fail" : "ok",
    failReasons,
  };
}
