import type { SlabInputs, SlabDesignResult, CalcStep, SlabSectionResult } from "@/types";
import { step, fmt, effectiveDepth, selectSlabBars, findVc } from "../utils";
import { TABLE_3_14, TABLE_3_9, MIN_STEEL_PERCENT } from "../constants";

function designSlabSection(
  M: number,        // kN·m/m
  b: number,        // 1000 mm (per metre)
  d: number,
  fcu: number,
  fy: number,
  barDia: number,
  label: string,
  steps: CalcStep[],
): SlabSectionResult {
  const Mnm = M * 1e6;
  const K = Mnm / (fcu * b * d * d);
  const sqrtTerm = Math.max(0.25 - K / 0.9, 0);
  const zRaw = d * (0.5 + Math.sqrt(sqrtTerm));
  const z = Math.min(zRaw, 0.95 * d);
  const AsReq = Mnm / (0.87 * fy * z);
  const AsMin = (MIN_STEEL_PERCENT.slabTension / 100) * b * 1000; // per metre (b=1m)
  const { AsProvided, desc } = selectSlabBars(Math.max(AsReq, AsMin), barDia);

  steps.push(step(
    label,
    "K=M/(fcu·b·d²); z=d[0.5+√(0.25-K/0.9)]; As=M/(0.87·fy·z)",
    `K=${fmt(K, 4)}, z=${fmt(z, 0)}mm, As_req=${fmt(AsReq, 0)}mm²/m, As_min=${fmt(AsMin, 0)}mm²/m`,
    `${desc} (As_prov = ${fmt(AsProvided, 0)} mm²/m)`,
    "BS8110-1:1997 Cl. 3.4.4.4",
    AsReq > AsProvided ? "Provided area less than required — check bar selection" : undefined,
  ));

  return { d, M, K, z, AsReq, AsMin, AsProvided, barDesc: desc, ok: AsProvided >= Math.max(AsReq, AsMin) };
}

export function designSlab(inputs: SlabInputs): SlabDesignResult {
  const steps: CalcStep[] = [];
  const failReasons: string[] = [];

  const { lx, ly, h, cover, barDia, fcu, fy, gk, qk, type, edgeCondition } = inputs;
  const n = 1.4 * gk + 1.6 * qk;
  const b = 1000;  // per metre width

  steps.push(step(
    "Ultimate design load",
    "n = 1.4·gk + 1.6·qk",
    `n = 1.4×${gk} + 1.6×${qk}`,
    `n = ${fmt(n)} kN/m²`,
    "BS8110-1:1997 Cl. 2.4.3.2",
  ));

  const d = effectiveDepth(h, cover, 0, barDia);  // no links in slabs

  steps.push(step(
    "Effective depth",
    "d = h - cover - φ_bar/2",
    `d = ${h} - ${cover} - ${barDia}/2`,
    `d = ${fmt(d, 0)} mm`,
    "BS8110-1:1997 Cl. 3.3.6",
  ));

  let shortNeg: SlabSectionResult | undefined;
  let shortPos: SlabSectionResult | undefined;
  let longNeg: SlabSectionResult | undefined;
  let longPos: SlabSectionResult | undefined;
  let msx_neg = 0, msx_pos = 0, msy_neg = 0, msy_pos = 0;

  if (type === "one-way") {
    // One-way slab — design as beam strip per metre width
    // Table 3.12 coefficients: end span +ve = 0.086, continuous support -ve = -0.086
    // Simply supported: 0.125·n·L²
    const Mpos = 0.086 * n * lx * lx;
    const Mneg = 0.086 * n * lx * lx;

    steps.push(step(
      "One-way slab — design moments",
      "M_pos = 0.086·n·L² (Table 3.12 end span); M_neg = 0.086·n·L²",
      `M_pos = 0.086×${fmt(n)}×${lx}² = ${fmt(Mpos)} kN·m/m`,
      `M_neg = ${fmt(Mneg)} kN·m/m (at support)`,
      "BS8110-1:1997 Table 3.12",
    ));

    shortPos = designSlabSection(Mpos, b, d, fcu, fy, barDia, "Span reinforcement (short direction)", steps);
    shortNeg = designSlabSection(Mneg, b, d, fcu, fy, barDia, "Support reinforcement (short direction)", steps);
    msx_pos = Mpos;
    msx_neg = Mneg;

    // Secondary reinforcement (transverse)
    const AsSecondary = Math.max((MIN_STEEL_PERCENT.slabTension / 100) * b * h, 200);
    steps.push(step(
      "Secondary (transverse) reinforcement",
      "As_sec = max(0.13%·b·h, 200 mm²/m)",
      `As_sec = max(0.0013×1000×${h}, 200) = ${fmt(AsSecondary, 0)} mm²/m`,
      `Provide T${barDia}@${Math.floor(1000 * (Math.PI * barDia * barDia / 4) / AsSecondary)} (secondary)`,
      "BS8110-1:1997 Cl. 3.5.2.3",
    ));

  } else if (type === "two-way") {
    const ratio = Math.min(ly / lx, 2.0);
    const table = TABLE_3_14[edgeCondition];

    if (!table) {
      failReasons.push("Invalid edge condition");
    } else {
      // Interpolate for ratio
      let coeffs = table[0];
      for (let i = 0; i < table.length - 1; i++) {
        if (ratio >= table[i].ratio && ratio <= table[i + 1].ratio) {
          const t = (ratio - table[i].ratio) / (table[i + 1].ratio - table[i].ratio);
          coeffs = {
            ratio,
            neg_sx: table[i].neg_sx + t * (table[i + 1].neg_sx - table[i].neg_sx),
            pos_sx: table[i].pos_sx + t * (table[i + 1].pos_sx - table[i].pos_sx),
            neg_sy: table[i].neg_sy + t * (table[i + 1].neg_sy - table[i].neg_sy),
            pos_sy: table[i].pos_sy + t * (table[i + 1].pos_sy - table[i].pos_sy),
          };
          break;
        }
        if (ratio <= table[0].ratio) { coeffs = table[0]; break; }
        if (ratio >= table[table.length - 1].ratio) { coeffs = table[table.length - 1]; break; }
      }

      steps.push(step(
        "Two-way slab — moment coefficients (Table 3.14)",
        "αsx, αsy from BS8110 Table 3.14 (ly/lx ratio & edge condition)",
        `ly/lx = ${fmt(ratio, 2)}, edge condition ${edgeCondition}: αsx_neg=${coeffs.neg_sx}, αsx_pos=${coeffs.pos_sx}, αsy_neg=${coeffs.neg_sy}, αsy_pos=${coeffs.pos_sy}`,
        `Interpolated from Table 3.14`,
        "BS8110-1:1997 Table 3.14",
      ));

      msx_neg = coeffs.neg_sx * n * lx * lx;
      msx_pos = coeffs.pos_sx * n * lx * lx;
      msy_neg = coeffs.neg_sy * n * lx * lx;
      msy_pos = coeffs.pos_sy * n * lx * lx;

      steps.push(step(
        "Two-way slab — design moments",
        "msx = αsx·n·lx²; msy = αsy·n·lx²",
        `msx_neg=${fmt(msx_neg)}kN·m/m, msx_pos=${fmt(msx_pos)}kN·m/m, msy_neg=${fmt(msy_neg)}kN·m/m, msy_pos=${fmt(msy_pos)}kN·m/m`,
        "See section designs below",
        "BS8110-1:1997 Cl. 3.5.3",
      ));

      shortNeg = designSlabSection(msx_neg, b, d, fcu, fy, barDia, "Short span — support reinforcement", steps);
      shortPos = designSlabSection(msx_pos, b, d, fcu, fy, barDia, "Short span — span reinforcement", steps);

      const d2 = d - barDia;  // reduced for long span (second layer)
      if (msy_neg > 0) longNeg = designSlabSection(msy_neg, b, d2, fcu, fy, barDia, "Long span — support reinforcement", steps);
      if (msy_pos > 0) longPos = designSlabSection(msy_pos, b, d2, fcu, fy, barDia, "Long span — span reinforcement", steps);
    }

  } else if (type === "flat-slab") {
    // Flat slab — equivalent frame method
    const lx_col = inputs.lx_col ?? lx;
    const ly_col = inputs.ly_col ?? ly;

    const Mtotal_x = n * lx * ly_col * ly_col / 8;  // total panel moment
    const Mtotal_y = n * ly * lx_col * lx_col / 8;

    steps.push(step(
      "Flat slab — total panel moments",
      "M_total = n·L·L_col²/8 (per panel width)",
      `M_x = ${fmt(n)}×${lx}×${ly_col}²/8 = ${fmt(Mtotal_x)}kN·m; M_y = ${fmt(Mtotal_y)}kN·m`,
      "Distributed to column and middle strips below",
      "BS8110-1:1997 Cl. 3.7.2",
    ));

    // Column strip = 0.5·L width, takes 75% of neg (support) moment, 55% of pos
    const colStripWidth = 0.5 * lx;  // m
    const M_col_neg_x = 0.75 * Mtotal_x / colStripWidth;
    const M_col_pos_x = 0.55 * Mtotal_x / colStripWidth;

    steps.push(step(
      "Column strip moments",
      "Col. strip width = 0.5·L; neg share = 75%, pos share = 55%",
      `Width = ${fmt(colStripWidth)}m; M_neg = 75%×${fmt(Mtotal_x)}/${fmt(colStripWidth)} = ${fmt(M_col_neg_x)}kN·m/m`,
      `M_neg = ${fmt(M_col_neg_x)}kN·m/m; M_pos = ${fmt(M_col_pos_x)}kN·m/m`,
      "BS8110-1:1997 Cl. 3.7.3",
    ));

    shortNeg = designSlabSection(M_col_neg_x, b, d, fcu, fy, barDia, "Column strip — support (x-direction)", steps);
    shortPos = designSlabSection(M_col_pos_x, b, d, fcu, fy, barDia, "Column strip — span (x-direction)", steps);
    msx_neg = M_col_neg_x;
    msx_pos = M_col_pos_x;
  }

  // Shear check (one-way at critical section = d from face of support)
  const criticalLoad = n * Math.min(lx, ly);
  const vmax = criticalLoad / (b * d / 1000);  // simplified N/mm²
  const As_for_vc = shortPos?.AsProvided ?? 500;
  const vc = findVc(As_for_vc, b, d, fcu);

  steps.push(step(
    "One-way shear check",
    "v = V/(b·d) vs vc (Table 3.8)",
    `v ≈ ${fmt(vmax)} N/mm²; vc = ${fmt(vc)} N/mm²`,
    vmax <= vc ? `v ≤ vc — OK ✓` : `v > vc — provide shear links or thicken slab`,
    "BS8110-1:1997 Cl. 3.5.5",
    vmax > vc ? "Shear stress exceeds vc — increase slab thickness or provide links" : undefined,
  ));

  const shearOK = vmax <= vc;
  if (!shearOK) {
    failReasons.push(`One-way shear v = ${fmt(vmax)} N/mm² > vc = ${fmt(vc)} N/mm²`);
  }

  // Punching shear for flat slab
  let punchingStress: number | undefined;
  let punchingOK: boolean | undefined;

  if (type === "flat-slab" && inputs.columnH && inputs.columnB) {
    const cx = inputs.columnH;
    const cy = inputs.columnB;
    const u = 2 * (cx + cy) + 4 * Math.PI * 1.5 * d;  // perimeter at 1.5d
    const V_p = n * lx * ly;  // approximate total column load
    const v_p = (V_p * 1000) / (u * d);
    const vc_p = findVc(As_for_vc, b, d, fcu);

    punchingStress = v_p;
    punchingOK = v_p <= vc_p;

    steps.push(step(
      "Punching shear check (flat slab)",
      "v = V / (u·d); u = perimeter at 1.5d from column face",
      `u = 2×(${cx}+${cy})+4π×1.5×${fmt(d, 0)} = ${fmt(u, 0)}mm; v = ${fmt(V_p)}×10³/(${fmt(u, 0)}×${fmt(d, 0)})`,
      `v_punching = ${fmt(v_p)} N/mm² vs vc = ${fmt(vc_p)} N/mm² — ${punchingOK ? "OK ✓" : "FAIL ✗"}`,
      "BS8110-1:1997 Cl. 3.7.7",
      !punchingOK ? "Punching shear exceeds vc — provide shear reinforcement or column head" : undefined,
    ));

    if (!punchingOK) {
      failReasons.push(`Punching shear ${fmt(v_p)} N/mm² exceeds vc = ${fmt(vc_p)} N/mm²`);
    }
  }

  // Deflection
  const ldActual = (lx * 1000) / d;
  const ldBasic = type === "one-way" ? TABLE_3_9.continuous : TABLE_3_9.continuous;
  const ldAllowable = ldBasic * 1.2;  // MF ≈ 1.2 typical for slabs
  const deflectionOK = ldActual <= ldAllowable;

  steps.push(step(
    "Deflection check (span/depth)",
    "L/d_actual vs L/d_allowable = Basic × MF",
    `L/d = ${fmt(lx * 1000, 0)}/${fmt(d, 0)} = ${fmt(ldActual)}; L/d_allow = ${ldBasic}×1.2 = ${fmt(ldAllowable)}`,
    deflectionOK ? `L/d = ${fmt(ldActual)} ≤ ${fmt(ldAllowable)} — OK ✓` : `L/d = ${fmt(ldActual)} > ${fmt(ldAllowable)} — increase depth`,
    "BS8110-1:1997 Cl. 3.4.6",
    !deflectionOK ? "Slab may deflect excessively — increase thickness" : undefined,
  ));

  if (!deflectionOK) {
    failReasons.push(`L/d = ${fmt(ldActual)} exceeds allowable ${fmt(ldAllowable)}`);
  }

  return {
    summary: {
      n, d,
      msx_neg, msx_pos, msy_neg, msy_pos,
      shortNeg, shortPos, longNeg, longPos,
      vmax, vc, shearOK,
      punchingStress, punchingOK,
      deflectionOK,
      ldActual, ldAllowable,
    },
    steps,
    status: failReasons.length > 0 ? "fail" : "ok",
    failReasons,
  };
}
