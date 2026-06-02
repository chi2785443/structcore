import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryItem {
  label: string;
  value: string;
  status?: "ok" | "warn" | "fail";
  subtext?: string;
}

interface SummaryCardProps {
  title: string;
  items: SummaryItem[];
  className?: string;
}

export function SummaryCard({ title, items, className }: SummaryCardProps) {
  return (
    <div className={cn("rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden", className)}>
      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50">
        <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5">
            <div>
              <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
              {item.subtext && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.subtext}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-sm font-bold font-mono",
                item.status === "fail" ? "text-red-600" :
                item.status === "warn" ? "text-amber-600" :
                "text-slate-900 dark:text-slate-100",
              )}>
                {item.value}
              </span>
              {item.status === "ok" && <CheckCircle2 size={13} className="text-green-500" />}
              {item.status === "warn" && <AlertTriangle size={13} className="text-amber-500" />}
              {item.status === "fail" && <XCircle size={13} className="text-red-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
