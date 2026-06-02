import type { DesignResult } from "./results.types";

export type ColumnLoadCase = "axial" | "uniaxial" | "biaxial";

export interface ColumnInputs {
  h: number;
  b: number;
  lo: number;
  fcu: number;
  fy: number;
  cover: number;
  barDia: number;
  N: number;
  Mx: number;
  My: number;
  isBraced: boolean;
}

export interface ColumnSummary {
  d: number;
  le: number;
  slendernessRatio: number;
  isShort: boolean;
  Ac: number;
  NCapacity: number;
  AscReq: number;
  AscMin: number;
  AscMax: number;
  AscProvided: number;
  barCount: number;
  barDia: number;
  barDesc: string;
  linkDia: number;
  linkSpacing: number;
  linkDesc: string;
  Madd: number;
  Mtotal: number;
  interactionOK: boolean;
}

export type ColumnDesignResult = DesignResult<ColumnSummary>;

export interface InteractionPoint {
  N: number;
  M: number;
}
