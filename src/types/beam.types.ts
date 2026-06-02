import type { DesignResult } from "./results.types";

export type BeamSupportType = "simply-supported" | "continuous";
export type ExposureClass = "mild" | "moderate" | "severe" | "very-severe";
export type FireResistance = 0.5 | 1 | 1.5 | 2 | 3 | 4;

export interface BeamSpan {
  id: string;
  length: number;
  udl: number;
  pointLoad?: number;
  pointLoadPos?: number;
}

export interface BeamInputs {
  supportType: BeamSupportType;
  spans: BeamSpan[];
  b: number;
  h: number;
  cover: number;
  barDia: number;
  linkDia: number;
  fcu: number;
  fy: number;
  fyv: number;
  gk: number;
  qk: number;
  exposureClass: ExposureClass;
  fireResistance: FireResistance;
}

export interface SectionDesignResult {
  d: number;
  K: number;
  Kprime: number;
  z: number;
  AsReq: number;
  AsMin: number;
  barCount: number;
  barDia: number;
  AsProvided: number;
  barDesc: string;
  doublyReinforced: boolean;
  AsComp?: number;
  compBarCount?: number;
  compBarDesc?: string;
}

export interface ShearDesignResult {
  v: number;
  vc: number;
  vmax: number;
  linksRequired: boolean;
  svMax: number;
  AsvSv: number;
  linkDia: number;
  linkSpacing: number;
  linkDesc: string;
}

export interface DeflectionResult {
  ldActual: number;
  ldBasic: number;
  mf: number;
  ldAllowable: number;
  ok: boolean;
}

export interface BeamSummary {
  d: number;
  Mmax: number;
  Vmax: number;
  flexure: SectionDesignResult;
  shear: ShearDesignResult;
  deflection: DeflectionResult;
  n: number;
}

export type BeamDesignResult = DesignResult<BeamSummary>;

export interface ContinuousBeamSpanResult {
  spanIndex: number;
  length: number;
  Mmid: number;
  Mleft: number;
  Mright: number;
  flexureMid: SectionDesignResult;
  flexureLeft: SectionDesignResult;
  flexureRight: SectionDesignResult;
  shear: ShearDesignResult;
  deflection: DeflectionResult;
}

export interface ContinuousBeamSummary {
  spans: ContinuousBeamSpanResult[];
  n: number;
  d: number;
}

export type ContinuousBeamDesignResult = DesignResult<ContinuousBeamSummary>;
