import type { BeamInputs, BeamDesignResult, CalcStep } from "@/types";
import { step, fmt } from "../utils";
import { designSection } from "./flexure";
import { designShear } from "./shear";
import { checkDeflection } from "./deflection";

export function designSimplySupported(inputs: BeamInputs): BeamDesignResult {
  const steps: CalcStep[] = [];
  const failReasons: string[] = [];

  const { spans, b, h, cover, barDia, linkDia, fcu, fy, fyv, gk, qk } = inputs;
  const span = spans[0];
  const L = span.length;    // m
  const Lmm = L * 1000;

  // Step 1: Design load
  const n = 1.4 * gk + 1.6 * qk;
  steps.push(step(
    "Ultimate design load",
    "n = 1.4·gk + 1.6·qk",
    `n = 1.4×${gk} + 1.6×${qk}`,
    `n = ${fmt(n)} kN/m`,
    "BS8110-1:1997 Cl. 2.4.3.2 (Table 2.1)",
  ));

  // Step 2: Maximum bending moment and shear
  const Mmax = n * L * L / 8;  // kN·m
  const Vmax = n * L / 2;       // kN

  steps.push(step(
    "Maximum bending moment",
    "M_max = n·L² / 8",
    `M_max = ${fmt(n)}×${L}² / 8`,
    `M_max = ${fmt(Mmax)} kN·m`,
    "BS8110-1:1997 Cl. 3.4.1.2 (simply supported)",
  ));

  steps.push(step(
    "Maximum shear force",
    "V_max = n·L / 2",
    `V_max = ${fmt(n)}×${L} / 2`,
    `V_max = ${fmt(Vmax)} kN`,
    "BS8110-1:1997 Cl. 3.4.5.1",
  ));

  // Step 3: Flexural design
  const flexure = designSection(
    Mmax, b, h, cover, linkDia, barDia, fcu, fy, steps,
  );

  if (flexure.K > flexure.Kprime && !flexure.doublyReinforced) {
    failReasons.push("K > K' = 0.156: section must be doubly reinforced or enlarged");
  }

  // Step 4: Shear design
  const shear = designShear(
    Vmax, b, flexure.d, flexure.AsProvided, fcu, fyv, linkDia, steps,
  );

  if (shear.v > shear.vmax) {
    failReasons.push(`Shear stress v = ${fmt(shear.v)} N/mm² exceeds vmax = ${fmt(shear.vmax)} N/mm²`);
  }

  // Step 5: Deflection check
  const deflection = checkDeflection(
    Lmm, flexure.d, flexure.AsReq, flexure.AsProvided,
    b, fy, Mmax * 1e6, "simply-supported", steps,
  );

  if (!deflection.ok) {
    failReasons.push(`L/d = ${fmt(deflection.ldActual)} exceeds allowable ${fmt(deflection.ldAllowable)} — increase depth`);
  }

  const status = failReasons.length > 0 ? "fail"
    : (shear.linksRequired || !deflection.ok) ? "warn"
    : "ok";

  return {
    summary: {
      d: flexure.d,
      Mmax,
      Vmax,
      flexure,
      shear,
      deflection,
      n,
    },
    steps,
    status,
    failReasons,
  };
}
