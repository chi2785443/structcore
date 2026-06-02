import { useSlabStore } from "@/store/slab.store";
import { TopBar } from "@/components/layout/TopBar";
import { InputField } from "@/components/inputs/InputField";
import { InputSection } from "@/components/inputs/InputSection";
import { SlabDiagram } from "@/components/diagrams/SlabDiagram";
import { StepList } from "@/components/results/StepList";
import { SummaryCard } from "@/components/results/SummaryCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, XCircle } from "lucide-react";
import type { SlabType, SlabEdgeCondition } from "@/types";
import { EDGE_CONDITION_LABELS } from "@/types";

interface SlabPageProps {
  type: SlabType;
}

export function SlabPage({ type }: SlabPageProps) {
  const { inputs, result, updateInput, runDesign, reset } = useSlabStore();

  // Sync type
  if (inputs.type !== type) updateInput("type", type);

  const r = result?.summary;
  const summaryItems = r ? [
    { label: "Design load n", value: `${r.n.toFixed(2)} kN/m²`, status: "ok" as const },
    { label: "Effective depth d", value: `${r.d.toFixed(0)} mm`, status: "ok" as const },
    ...(r.shortPos ? [
      { label: "Short span — span As", value: `${r.shortPos.AsProvided.toFixed(0)} mm²/m`,
        subtext: r.shortPos.barDesc, status: r.shortPos.ok ? "ok" as const : "fail" as const },
    ] : []),
    ...(r.longPos ? [
      { label: "Long span — span As", value: `${r.longPos.AsProvided.toFixed(0)} mm²/m`,
        subtext: r.longPos.barDesc, status: r.longPos.ok ? "ok" as const : "fail" as const },
    ] : []),
    { label: "Shear check", value: `v = ${r.vmax.toFixed(3)} N/mm²`,
      subtext: `vc = ${r.vc.toFixed(3)} N/mm²`,
      status: r.shearOK ? "ok" as const : "fail" as const },
    { label: "Deflection L/d", value: `${r.ldActual.toFixed(1)}`,
      subtext: `Allowable: ${r.ldAllowable.toFixed(1)}`,
      status: r.deflectionOK ? "ok" as const : "warn" as const },
  ] : [];

  const titleMap: Record<SlabType, string> = {
    "one-way": "One-Way Slab Design",
    "two-way": "Two-Way Slab Design",
    "flat-slab": "Flat Slab Design",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={titleMap[type]} subtitle="BS8110 Cl. 3.5 / 3.7" onReset={reset} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-5">
              <InputSection title="Dimensions">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label={type === "one-way" ? "Span lx" : "Short span lx"} unit="m"
                    value={inputs.lx} min={1} step={0.5} onChange={(v) => updateInput("lx", v)} />
                  {type !== "one-way" && (
                    <InputField label="Long span ly" unit="m"
                      value={inputs.ly} min={1} step={0.5} onChange={(v) => updateInput("ly", v)} />
                  )}
                  <InputField label="Thickness h" unit="mm"
                    value={inputs.h} min={80} step={25} onChange={(v) => updateInput("h", v)} />
                  <InputField label="Cover" unit="mm"
                    value={inputs.cover} min={15} step={5} onChange={(v) => updateInput("cover", v)} />
                  <InputField label="Bar dia φ" unit="mm"
                    value={inputs.barDia} min={8} onChange={(v) => updateInput("barDia", v)} />
                </div>
              </InputSection>

              {type === "two-way" && (
                <InputSection title="Edge Condition">
                  <Select
                    value={inputs.edgeCondition}
                    onValueChange={(v) => updateInput("edgeCondition", v as SlabEdgeCondition)}
                  >
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EDGE_CONDITION_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {key}. {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-400">BS8110 Table 3.14</p>
                </InputSection>
              )}

              {type === "flat-slab" && (
                <InputSection title="Column Details">
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="Col. width cy" unit="mm"
                      value={inputs.columnB ?? 300} min={150} step={50}
                      onChange={(v) => updateInput("columnB", v)} />
                    <InputField label="Col. depth cx" unit="mm"
                      value={inputs.columnH ?? 300} min={150} step={50}
                      onChange={(v) => updateInput("columnH", v)} />
                    <InputField label="Panel span x" unit="m"
                      value={inputs.lx_col ?? inputs.lx} min={1} step={0.5}
                      onChange={(v) => updateInput("lx_col", v)} />
                    <InputField label="Panel span y" unit="m"
                      value={inputs.ly_col ?? inputs.ly} min={1} step={0.5}
                      onChange={(v) => updateInput("ly_col", v)} />
                  </div>
                </InputSection>
              )}

              <InputSection title="Loads">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Dead gk" unit="kN/m²" value={inputs.gk} min={0} step={0.5}
                    onChange={(v) => updateInput("gk", v)} />
                  <InputField label="Live qk" unit="kN/m²" value={inputs.qk} min={0} step={0.5}
                    onChange={(v) => updateInput("qk", v)} />
                </div>
              </InputSection>

              <InputSection title="Materials">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="fcu" unit="N/mm²" value={inputs.fcu} min={20} step={5}
                    onChange={(v) => updateInput("fcu", v)} />
                  <InputField label="fy" unit="N/mm²" value={inputs.fy} min={250} step={10}
                    onChange={(v) => updateInput("fy", v)} />
                </div>
              </InputSection>
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2" onClick={runDesign}>
              <Play size={14} /> Run BS8110 Design
            </Button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan View Diagram</span>
              {result && (
                <Badge variant={result.status === "ok" ? "default" : "destructive"} className="text-[10px]">
                  {result.status.toUpperCase()}
                </Badge>
              )}
            </div>
            <SlabDiagram inputs={inputs} result={result ? {
              shortPos: result.summary.shortPos,
              longPos: result.summary.longPos,
            } : null} />
          </div>

          {result ? (
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="summary" className="flex flex-col h-full">
                <div className="px-4 pt-3 pb-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22]">
                  <TabsList className="h-8">
                    <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
                    <TabsTrigger value="steps" className="text-xs">Calc Steps ({result.steps.length})</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="summary" className="flex-1 overflow-auto m-0 p-4 space-y-3">
                  {result.failReasons.length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 space-y-1">
                      <div className="font-bold flex items-center gap-1.5"><XCircle size={12} /> Failures</div>
                      {result.failReasons.map((r, i) => <div key={i}>• {r}</div>)}
                    </div>
                  )}
                  <SummaryCard title="Slab Design Results" items={summaryItems} />
                </TabsContent>
                <TabsContent value="steps" className="flex-1 overflow-hidden m-0 p-4">
                  <StepList steps={result.steps} />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Run design to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
