import { AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import type { CalcStep } from "@/types";
import { cn } from "@/lib/utils";

interface StepItemProps {
  step: CalcStep;
  index: number;
}

export function StepItem({ step, index }: StepItemProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-2 text-sm",
        step.status === "fail" && "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
        step.status === "warn" && "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
        step.status === "ok" && "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/50",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
            Step {index + 1}
          </span>
          {step.status === "ok" && <CheckCircle2 size={12} className="text-green-500 shrink-0" />}
          {step.status === "warn" && <AlertTriangle size={12} className="text-amber-500 shrink-0" />}
          {step.status === "fail" && <XCircle size={12} className="text-red-500 shrink-0" />}
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">
            {step.label}
          </span>
        </div>
        {step.clause && (
          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold tracking-wide">
            {step.clause}
          </span>
        )}
      </div>

      {/* Formula */}
      <div className="bg-blue-50 dark:bg-blue-950/40 rounded-md px-3 py-2 font-mono text-xs text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
        {step.formula}
      </div>

      {/* Substitution */}
      <div className="font-mono text-xs text-slate-500 dark:text-slate-400 pl-1">
        = {step.substitution}
      </div>

      {/* Result */}
      <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 pl-1">
        ∴ {step.result}
      </div>

      {/* Warning */}
      {step.warn && (
        <div className={cn(
          "flex items-start gap-1.5 text-xs font-medium rounded-md px-2 py-1.5",
          step.status === "fail"
            ? "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/50"
            : "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50",
        )}>
          <AlertTriangle size={11} className="mt-0.5 shrink-0" />
          {step.warn}
        </div>
      )}
    </div>
  );
}
