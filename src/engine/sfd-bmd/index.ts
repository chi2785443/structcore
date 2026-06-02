import type { SFDPoint, BMDPoint } from "@/types";

export interface SFDBMDData {
  sfd: SFDPoint[];
  bmd: BMDPoint[];
  maxV: number;
  minV: number;
  maxM: number;
  minM: number;
}

/** Simply supported beam under UDL and optional point load */
export function computeSSBeam(
  L: number,        // m
  n: number,        // kN/m UDL (design)
  P?: number,       // kN point load
  a?: number,       // m position of point load from left
  pts = 200,
): SFDBMDData {
  const RA_udl = (n * L) / 2;
  const RA_pt = P && a !== undefined ? P * (L - a) / L : 0;
  const RA = RA_udl + RA_pt;

  const sfd: SFDPoint[] = [];
  const bmd: BMDPoint[] = [];

  for (let i = 0; i <= pts; i++) {
    const x = (i / pts) * L;
    const V = RA - n * x - (P && a !== undefined && x > a ? P : 0);
    const M = RA * x - (n * x * x) / 2 - (P && a !== undefined && x > a ? P * (x - a) : 0);
    sfd.push({ x, V });
    bmd.push({ x, M });
  }

  const Vs = sfd.map((p) => p.V);
  const Ms = bmd.map((p) => p.M);

  return {
    sfd,
    bmd,
    maxV: Math.max(...Vs),
    minV: Math.min(...Vs),
    maxM: Math.max(...Ms),
    minM: Math.min(...Ms),
  };
}

/** Continuous beam under UDL — using Table 3.5 reactions */
export function computeContinuousBeam(
  spans: number[],  // m
  n: number,        // kN/m
  pts = 100,
): SFDBMDData {
  const allSFD: SFDPoint[] = [];
  const allBMD: BMDPoint[] = [];
  let xOffset = 0;

  for (let i = 0; i < spans.length; i++) {
    const L = spans[i];
    const nSpans = spans.length;
    // Support moments from Table 3.5
    const Ml = i === 0 ? 0 : 0.10 * n * L * L;
    const Mr = i === nSpans - 1 ? 0 : 0.10 * n * L * L;

    // Reactions from equilibrium: RA + RB = n·L; RA·L = n·L²/2 + Mr - Ml
    const RA = (n * L) / 2 + (Mr - Ml) / L;

    for (let j = 0; j <= pts; j++) {
      const x = (j / pts) * L;
      const V = RA - n * x;
      const M = RA * x - n * x * x / 2 - Ml;
      allSFD.push({ x: xOffset + x, V });
      allBMD.push({ x: xOffset + x, M });
    }

    xOffset += L;
  }

  const Vs = allSFD.map((p) => p.V);
  const Ms = allBMD.map((p) => p.M);

  return {
    sfd: allSFD,
    bmd: allBMD,
    maxV: Math.max(...Vs),
    minV: Math.min(...Vs),
    maxM: Math.max(...Ms),
    minM: Math.min(...Ms),
  };
}
