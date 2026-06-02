import { Moon, Sun, FileDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app.store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  subtitle?: string;
  standard?: string;
  onExport?: () => void;
  onReset?: () => void;
}

export function TopBar({ title, subtitle, standard = "BS8110-1:1997", onExport, onReset }: TopBarProps) {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === "dark";

  return (
    <header className="h-14 shrink-0 flex items-center gap-4 px-6
                       border-b border-slate-200 dark:border-slate-800
                       bg-white dark:bg-slate-900">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {title}
          </h1>
          <Badge
            variant="secondary"
            className="text-[10px] font-mono shrink-0 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
          >
            {standard}
          </Badge>
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline ml-1.5 text-xs">Reset</span>
          </Button>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5 text-xs">
            <FileDown size={13} />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        )}

        {/* Visible theme toggle pill */}
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            "border transition-all duration-200",
            isDark
              ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
              : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200",
          )}
          title="Toggle light / dark mode"
        >
          {isDark ? <Sun size={12} /> : <Moon size={12} />}
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>
      </div>
    </header>
  );
}
