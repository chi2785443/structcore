import { Moon, Sun, FileDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app.store";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  title: string;
  subtitle?: string;
  standard?: string;
  onExport?: () => void;
  onReset?: () => void;
}

export function TopBar({ title, subtitle, standard = "BS8110-1:1997", onExport, onReset }: TopBarProps) {
  const { theme, toggleTheme } = useAppStore();

  return (
    <header className="h-14 shrink-0 flex items-center gap-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{title}</h1>
          <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
            {standard}
          </Badge>
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-500 hover:text-slate-700">
            <RefreshCw size={14} />
            <span className="hidden sm:inline ml-1.5">Reset</span>
          </Button>
        )}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
            <FileDown size={14} />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </Button>
      </div>
    </header>
  );
}
