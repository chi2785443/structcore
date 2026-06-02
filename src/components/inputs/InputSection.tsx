import { cn } from "@/lib/utils";

interface InputSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function InputSection({ title, children, className }: InputSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
          {title}
        </span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>
      {children}
    </div>
  );
}
