import type { DesignResult } from "./results.types";

export type SlabType = "one-way" | "two-way" | "flat-slab";

export type SlabEdgeCondition =
  | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export const EDGE_CONDITION_LABELS: Record<SlabEdgeCondition, string> = {
  "1": "Interior panel (4 edges continuous)",
  "2": "One short edge discontinuous",
  "3": "One long edge discontinuous",
  "4": "Two adjacent edges discontinuous",
  "5": "Two short edges discontinuous",
  "6": "Two long edges discontinuous",
  "7": "Three edges discontinuous (one long edge continuous)",
  "8": "Three edges discontinuous (one short edge continuous)",
  "9": "Four edges discontinuous (simply supported)",
};

export interface SlabInputs {
  type: SlabType;
  lx: number;
  ly: number;
  h: number;
  cover: number;
  barDia: number;
  fcu: number;
  fy: number;
  gk: number;
  qk: number;
  edgeCondition: SlabEdgeCondition;
  columnH?: number;
  columnB?: number;
  lx_col?: number;
  ly_col?: number;
}

export interface SlabSectionResult {
  d: number;
  M: number;
  K: number;
  z: number;
  AsReq: number;
  AsMin: number;
  AsProvided: number;
  barDesc: string;
  ok: boolean;
}

export interface SlabSummary {
  n: number;
  d: number;
  msx_neg?: number;
  msx_pos?: number;
  msy_neg?: number;
  msy_pos?: number;
  shortNeg?: SlabSectionResult;
  shortPos?: SlabSectionResult;
  longNeg?: SlabSectionResult;
  longPos?: SlabSectionResult;
  vmax: number;
  vc: number;
  shearOK: boolean;
  punchingStress?: number;
  punchingOK?: boolean;
  deflectionOK: boolean;
  ldActual: number;
  ldAllowable: number;
}

export type SlabDesignResult = DesignResult<SlabSummary>;
