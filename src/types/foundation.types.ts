import type { DesignResult } from "./results.types";

export interface PadFoundationInputs {
  N: number;
  Mx: number;
  My: number;
  columnB: number;
  columnH: number;
  padB: number;
  padL: number;
  h: number;
  cover: number;
  barDia: number;
  fcu: number;
  fy: number;
  Fb: number;
  concreteGamma: number;
  soilDensity: number;
  soilDepth: number;
}

export interface PadFoundationSummary {
  area: number;
  selfWeight: number;
  soilWeight: number;
  Ntotal: number;
  p_max: number;
  p_min: number;
  p_avg: number;
  pressureOK: boolean;
  d: number;
  lx: number;
  ly: number;
  Mx_cant: number;
  My_cant: number;
  flexX: {
    K: number; z: number; AsReq: number; AsMin: number; AsProvided: number; barDesc: string;
  };
  flexY: {
    K: number; z: number; AsReq: number; AsMin: number; AsProvided: number; barDesc: string;
  };
  wideBeamShear: {
    Vx: number; Vy: number; vx: number; vy: number; vc: number; ok: boolean;
  };
  punchingShear: {
    perimeter: number; V_punching: number; v_punching: number; vc: number; ok: boolean;
  };
}

export type PadFoundationDesignResult = DesignResult<PadFoundationSummary>;
