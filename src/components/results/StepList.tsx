import { ScrollArea } from "@/components/ui/scroll-area";
import { StepItem } from "./StepItem";
import type { CalcStep } from "@/types";

interface StepListProps {
  steps: CalcStep[];
}

export function StepList({ steps }: StepListProps) {
  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        No calculation steps yet. Run the design to see working.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-1">
      <div className="space-y-2 pb-4">
        {steps.map((s, i) => (
          <StepItem key={i} step={s} index={i} />
        ))}
      </div>
    </ScrollArea>
  );
}
