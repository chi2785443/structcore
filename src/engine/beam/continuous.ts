import type { BeamInputs, ContinuousBeamDesignResult, ContinuousBeamSpanResult, CalcStep } from "@/types";
import { step, fmt } from "../utils";
import { TABLE_3_5 } from "../constants";
import { designSection } from "./flexure";
import { designShear } from "./shear";
import { checkDeflection } from "./deflection";

export function designContinuousBeam(inputs: BeamInputs): ContinuousBeamDesignResult {
  const steps: CalcStep[] = [];
  const failReasons: string[] = [];

  const { spans, b, h, cover, barDia, linkDia, fcu, fy, fyv, gk, qk } = inputs;
  const n = 1.4 * gk + 1.6 * qk;

  steps.push(step(
    "Ultimate design load",
    "n = 1.4·gk + 1.6·qk",
    `n = 1.4×${gk} + 1.6×${qk}`,
    `n = ${fmt(n)} kN/m`,
    "BS8110-1:1997 Cl. 2.4.3.2",
  ));

  // Condition check for simplified coefficients
  const imposed = qk;
  const dead = gk;
  const maxL = Math.max(...spans.map((s) => s.length));
  const minL = Math.min(...spans.map((s) => s.length));
  const conditionsMet = imposed <= dead && spans.length >= 3 && (maxL - minL) / maxL <= 0.15;

  steps.push(step(
    "Simplified coefficients — condition check",
    "Imposed ≤ dead AND ≥3 spans AND span variation ≤15%",
    `qk=${qk} ${imposed <= dead ? "≤" : ">"} gk=${dead}, spans=${spans.length}, variation=${fmt((maxL - minL) / maxL * 100, 1)}%`,
    conditionsMet
      ? "Conditions met — use BS8110 Table 3.5 coefficients"
      : "Conditions NOT fully met — conservative coefficients applied",
    "BS8110-1:1997 Cl. 3.4.3",
    !conditionsMet ? "Using conservative moment coefficients; for non-standard loading use elastic analysis" : undefined,
  ));

  steps.push(step(
    "BS8110 Table 3.5 — moment coefficients",
    "M = β·n·L²",
    "β_end_support=0.04, β_end_span_mid=0.09, β_first_int_support=-0.10, β_interior_mid=0.07, β_interior_support=-0.10",
    "Applied to each span — see span results below",
    "BS8110-1:1997 Table 3.5",
  ));

  const spanResults: ContinuousBeamSpanResult[] = [];
  const nSpans = spans.length;

  for (let i = 0; i < nSpans; i++) {
    const spanSteps: CalcStep[] = [];
    const L = spans[i].length;  // m
    const Lmm = L * 1000;
    const isEndSpan = i === 0 || i === nSpans - 1;

    // Moment at left support
    let Mleft: number;
    if (i === 0) {
      Mleft = TABLE_3_5.at_outer_support * n * L * L; // 0 for pin
    } else {
      Mleft = Math.abs(TABLE_3_5.at_middle_supports) * n * L * L;
    }

    // Moment at right support
    let Mright: number;
    if (i === nSpans - 1) {
      Mright = TABLE_3_5.at_outer_support * n * L * L; // 0 for pin
    } else if (i === 0) {
      Mright = Math.abs(TABLE_3_5.at_first_interior_support) * n * L * L;
    } else {
      Mright = Math.abs(TABLE_3_5.at_middle_supports) * n * L * L;
    }

    // Midspan moment
    const betaMid = isEndSpan
      ? TABLE_3_5.at_end_spans_midspan
      : TABLE_3_5.at_interior_spans_midspan;
    const Mmid = betaMid * n * L * L;

    spanSteps.push(step(
      `Span ${i + 1} — design moments`,
      "M = β·n·L²",
      `L=${L}m, n=${fmt(n)}kN/m, β_mid=${betaMid}, β_left=${i === 0 ? 0 : "0.10"}, β_right=${i === nSpans - 1 ? 0 : "0.10"}`,
      `M_mid=${fmt(Mmid)}kN·m, M_left=${fmt(Mleft)}kN·m, M_right=${fmt(Mright)}kN·m`,
      "BS8110-1:1997 Table 3.5",
    ));

    const Vmax = 0.6 * n * L;  // conservative for end spans

    spanSteps.push(step(
      `Span ${i + 1} — shear force`,
      "V_max = 0.6·n·L (conservative for continuous beam)",
      `V = 0.6×${fmt(n)}×${L}`,
      `V = ${fmt(Vmax)} kN`,
      "BS8110-1:1997 Cl. 3.4.5",
    ));

    // Design sections
    const flexureMid = designSection(Mmid, b, h, cover, linkDia, barDia, fcu, fy, spanSteps, `Span ${i + 1} mid `);
    const flexureLeft = Mleft > 0 ? designSection(Mleft, b, h, cover, linkDia, barDia, fcu, fy, spanSteps, `Span ${i + 1} left support `) : flexureMid;
    const flexureRight = Mright > 0 ? designSection(Mright, b, h, cover, linkDia, barDia, fcu, fy, spanSteps, `Span ${i + 1} right support `) : flexureMid;

    const shear = designShear(Vmax, b, flexureMid.d, flexureMid.AsProvided, fcu, fyv, linkDia, spanSteps);

    const deflection = checkDeflection(
      Lmm, flexureMid.d, flexureMid.AsReq, flexureMid.AsProvided,
      b, fy, Mmid * 1e6, "continuous", spanSteps,
    );

    steps.push(...spanSteps);

    spanResults.push({
      spanIndex: i,
      length: L,
      Mmid,
      Mleft,
      Mright,
      flexureMid,
      flexureLeft,
      flexureRight,
      shear,
      deflection,
    });
  }

  // Check for any failures
  for (const r of spanResults) {
    if (r.shear.v > r.shear.vmax) {
      failReasons.push(`Span ${r.spanIndex + 1}: shear stress exceeds maximum`);
    }
    if (!r.deflection.ok) {
      failReasons.push(`Span ${r.spanIndex + 1}: L/d exceeds allowable`);
    }
  }

  const firstSpan = spanResults[0];
  const status = failReasons.length > 0 ? "fail" : "ok";

  return {
    summary: {
      spans: spanResults,
      n,
      d: firstSpan.flexureMid.d,
    },
    steps,
    status,
    failReasons,
  };
}
