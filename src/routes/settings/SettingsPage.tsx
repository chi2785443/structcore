import { TopBar } from "@/components/layout/TopBar";
import { useAppStore } from "@/store/app.store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPage() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Settings" subtitle="Application preferences" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-slate-500">Choose light or dark mode</p>
              </div>
              <div className="flex gap-2">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                      theme === t
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-transparent text-slate-600 border-slate-200 hover:border-orange-300"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Design Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Active standard</span>
              <Badge className="font-mono text-xs">BS8110-1:1997</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Load factors</span>
              <span className="font-mono text-xs">γG = 1.4, γQ = 1.6</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Material safety factors</span>
              <span className="font-mono text-xs">γm_conc = 1.5, γm_steel = 1.05</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Steel grade</span>
              <span className="font-mono text-xs">High yield fy = 460 N/mm² (default)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Concrete stress block</span>
              <span className="font-mono text-xs">Simplified rectangular (0.9x, 0.45fcu)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">About StructCore</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 space-y-1.5">
            <p>StructCore is a professional reinforced concrete design tool based on BS8110-1:1997.</p>
            <p>All calculations follow the limit state design approach. Results should be verified by a qualified structural engineer before use on any project.</p>
            <div className="pt-2 space-y-1 text-[10px] font-mono border-t border-slate-100 dark:border-slate-800">
              <p>Version: 1.0.0</p>
              <p>Design Standard: BS8110-1:1997 Structural use of concrete</p>
              <p>Stack: Tauri 2 · React 19 · TypeScript</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
