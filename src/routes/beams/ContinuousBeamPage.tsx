import { useBeamStore } from "@/store/beam.store";
import { TopBar } from "@/components/layout/TopBar";
import { InputField } from "@/components/inputs/InputField";
import { InputSection } from "@/components/inputs/InputSection";
import { BeamDiagram } from "@/components/diagrams/BeamDiagram";
import { SFDBMDChart } from "@/components/charts/SFDBMDChart";
import { StepList } from "@/components/results/StepList";
import { SummaryCard } from "@/components/results/SummaryCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Trash2 } from "lucide-react";
import { computeContinuousBeam } from "@/engine";
import { useEffect } from "react";

export function ContinuousBeamPage() {
  const { inputs, contResult, updateInput, updateSpan, addSpan, removeSpan, runDesign, reset } = useBeamStore();

  useEffect(() => {
    if (inputs.supportType !== "continuous") updateInput("supportType", "continuous");
    if (inputs.spans.length < 3) {
      addSpan(); addSpan();
    }
  }, []);

  const chartData = contResult
    ? computeContinuousBeam(inputs.spans.map((s) => s.length), contResult.summary.n)
    : null;

  const totalL = inputs.spans.reduce((s, sp) => s + sp.length, 0);

  const summaryItems = contResult?.summary.spans.flatMap((span, i) => [
    { label: `Span ${i + 1} — Mid As`, value: `${span.flexureMid.AsProvided.toFixed(0)} mm²`,
      subtext: span.flexureMid.barDesc, status: "ok" as const },
    { label: `Span ${i + 1} — Shear v`, value: `${span.shear.v.toFixed(3)} N/mm²`,
      status: span.shear.v <= span.shear.vc ? "ok" as const : "warn" as const },
  ]) ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Continuous Beam Design" subtitle="Multi-span — BS8110 Table 3.5" onReset={reset} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-5">
              <InputSection title="Spans">
                <div className="space-y-2">
                  {inputs.spans.map((sp, i) => (
                    <div key={sp.id} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-8 shrink-0">S{i + 1}</span>
                      <InputField
                        label=""
                        unit="m"
                        value={sp.length}
                        min={1}
                        step={0.5}
                        onChange={(v) => updateSpan(sp.id, "length", v)}
                        className="flex-1"
                      />
                      {inputs.spans.length > 3 && (
                        <button
                          onClick={() => removeSpan(sp.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={addSpan}>
                    <Plus size={12} /> Add Span
                  </Button>
                </div>
              </InputSection>

              <InputSection title="Section">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Width b" unit="mm" value={inputs.b} min={100} step={25} onChange={(v) => updateInput("b", v)} />
                  <InputField label="Depth h" unit="mm" value={inputs.h} min={100} step={25} onChange={(v) => updateInput("h", v)} />
                  <InputField label="Cover" unit="mm" value={inputs.cover} min={15} step={5} onChange={(v) => updateInput("cover", v)} />
                  <InputField label="Bar dia" unit="mm" value={inputs.barDia} min={6} onChange={(v) => updateInput("barDia", v)} />
                </div>
              </InputSection>

              <InputSection title="Loads">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Dead gk" unit="kN/m" value={inputs.gk} min={0} step={0.5} onChange={(v) => updateInput("gk", v)} />
                  <InputField label="Live qk" unit="kN/m" value={inputs.qk} min={0} step={0.5} onChange={(v) => updateInput("qk", v)} />
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
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Structural Diagram</span>
              {contResult && (
                <Badge variant={contResult.status === "ok" ? "default" : "destructive"} className="text-[10px]">
                  {contResult.status.toUpperCase()}
                </Badge>
              )}
            </div>
            <BeamDiagram inputs={inputs} result={contResult ? {
              d: contResult.summary.d,
              barCount: contResult.summary.spans[0]?.flexureMid.barCount ?? 2,
              barDia: inputs.barDia,
            } : null} />
          </div>

          {contResult ? (
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="summary" className="flex flex-col h-full">
                <div className="px-4 pt-3 pb-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22]">
                  <TabsList className="h-8">
                    <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
                    <TabsTrigger value="steps" className="text-xs">Calc Steps ({contResult.steps.length})</TabsTrigger>
                    <TabsTrigger value="charts" className="text-xs">SFD / BMD</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="summary" className="flex-1 overflow-auto m-0 p-4">
                  <SummaryCard title="Span Results" items={summaryItems} />
                </TabsContent>
                <TabsContent value="steps" className="flex-1 overflow-hidden m-0 p-4">
                  <StepList steps={contResult.steps} />
                </TabsContent>
                <TabsContent value="charts" className="flex-1 overflow-hidden m-0 p-4">
                  {chartData && (
                    <SFDBMDChart sfd={chartData.sfd} bmd={chartData.bmd} totalLength={totalL} />
                  )}
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
