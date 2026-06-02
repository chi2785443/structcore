import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  className?: string;
}

export function InputField({
  label, value, onChange, unit, min, max, step = 1, hint, className,
}: InputFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
        <span>{label}</span>
        {unit && (
          <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
            {unit}
          </span>
        )}
      </Label>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        className="h-8 text-sm font-mono"
      />
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}
