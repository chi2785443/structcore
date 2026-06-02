export interface CalcStep {
  label: string;
  formula: string;
  substitution: string;
  result: string;
  clause?: string;
  warn?: string;
  status: "ok" | "warn" | "fail";
}

export interface DesignResult<TSummary> {
  summary: TSummary;
  steps: CalcStep[];
  status: "ok" | "warn" | "fail";
  failReasons: string[];
}

export interface SFDPoint {
  x: number;
  V: number;
}

export interface BMDPoint {
  x: number;
  M: number;
}
