import { useColumnStore } from "@/store/column.store";
import { TopBar } from "@/components/layout/TopBar";
import { InputField } from "@/components/inputs/InputField";
import { InputSection } from "@/components/inputs/InputSection";
import { ColumnDiagram } from "@/components/diagrams/ColumnDiagram";
import { StepList } from "@/components/results/StepList";
import { SummaryCard } from "@/components/results/SummaryCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, XCircle } from "lucide-react";

export function ColumnPage() {
  const { inputs, result, updateInput, runDesign, reset } = useColumnStore();

  const r = result?.summary;
  const summaryItems = r ? [
    { label: "Slenderness le/h", value: r.slendernessRatio.toFixed(2),
      subtext: r.isShort ? "Short column" : "Slender column",
      status: r.isShort ? "ok" as const : "warn" as const },
    { label: "Design moment M", value: `${r.Mtotal.toFixed(1)} kN·m`,
      subtext: r.Madd > 0 ? `Includes M_add = ${r.Madd.toFixed(1)} kN·m` : undefined,
      status: "ok" as const },
    { label: "Asc required", value: `${r.AscReq.toFixed(0)} mm²`, status: "ok" as const },
    { label: "Asc provided", value: `${r.AscProvided.toFixed(0)} mm²`,
      subtext: r.barDesc, status: r.AscProvided >= r.AscReq ? "ok" as const : "fail" as const },
    { label: "N capacity", value: `${r.NCapacity.toFixed(0)} kN`,
      status: r.interactionOK ? "ok" as const : "fail" as const },
    { label: "Links", value: r.linkDesc, status: "ok" as const },
  ] : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Column Design" subtitle="Short & Slender — BS8110 Cl. 3.8" onReset={reset} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-5">
              <InputSection title="Section">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Width b" unit="mm" value={inputs.b} min={150} step={25} onChange={(v) => updateInput("b", v)} />
                  <InputField label="Depth h" unit="mm" value={inputs.h} min={150} step={25} onChange={(v) => updateInput("h", v)} />
                  <InputField label="Cover" unit="mm" value={inputs.cover} min={20} step={5} onChange={(v) => updateInput("cover", v)} />
                  <InputField label="Bar dia φ" unit="mm" value={inputs.barDia} min={12} onChange={(v) => updateInput("barDia", v)} />
                </div>
              </InputSection>

              <InputSection title="Column Height">
                <InputField label="Effective height lo" unit="mm" value={inputs.lo} min={500} step={100} onChange={(v) => updateInput("lo", v)} />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateInput("isBraced", !inputs.isBraced)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${
                      inputs.isBraced
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}
                  >
                    {inputs.isBraced ? "✓" : "○"} Braced column
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Short limit: le/h &lt; {inputs.isBraced ? 15 : 10}
                </p>
              </InputSection>

              <InputSection title="Applied Loads">
                <InputField label="Axial load N" unit="kN" value={inputs.N} min={0} step={10} onChange={(v) => updateInput("N", v)} />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <InputField label="Moment Mx" unit="kN·m" value={inputs.Mx} min={0} step={1} onChange={(v) => updateInput("Mx", v)} />
                  <InputField label="Moment My" unit="kN·m" value={inputs.My} min={0} step={1} onChange={(v) => updateInput("My", v)} />
                </div>
              </InputSection>

              <InputSection title="Materials">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="fcu" unit="N/mm²" value={inputs.fcu} min={20} step={5} onChange={(v) => updateInput("fcu", v)} />
                  <InputField label="fy" unit="N/mm²" value={inputs.fy} min={250} step={10} onChange={(v) => updateInput("fy", v)} />
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
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Column Diagram</span>
              {result && (
                <Badge variant={result.status === "ok" ? "default" : "destructive"} className="text-[10px]">
                  {result.status.toUpperCase()}
                </Badge>
              )}
            </div>
            <ColumnDiagram inputs={inputs} result={result ? {
              barCount: result.summary.barCount,
              barDia: result.summary.barDia,
              isShort: result.summary.isShort,
              le: result.summary.le,
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
                  <SummaryCard title="Column Design Results" items={summaryItems} />
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
