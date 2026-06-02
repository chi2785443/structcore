import { useFoundationStore } from "@/store/foundation.store";
import { TopBar } from "@/components/layout/TopBar";
import { InputField } from "@/components/inputs/InputField";
import { InputSection } from "@/components/inputs/InputSection";
import { FoundationDiagram } from "@/components/diagrams/FoundationDiagram";
import { StepList } from "@/components/results/StepList";
import { SummaryCard } from "@/components/results/SummaryCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, XCircle } from "lucide-react";

export function PadFoundationPage() {
  const { inputs, result, updateInput, runDesign, reset } = useFoundationStore();

  const r = result?.summary;
  const summaryItems = r ? [
    { label: "Bearing pressure (max)", value: `${r.p_max.toFixed(1)} kN/m²`,
      status: r.pressureOK ? "ok" as const : "fail" as const,
      subtext: `Allowable: ${inputs.Fb} kN/m²` },
    { label: "Bearing pressure (min)", value: `${r.p_min.toFixed(1)} kN/m²`,
      status: r.p_min >= 0 ? "ok" as const : "fail" as const },
    { label: "Effective depth d", value: `${r.d.toFixed(0)} mm`, status: "ok" as const },
    { label: "X-bars (bottom)", value: r.flexX.barDesc,
      subtext: `As = ${r.flexX.AsProvided.toFixed(0)} mm²/m`,
      status: r.flexX.AsProvided >= r.flexX.AsReq ? "ok" as const : "fail" as const },
    { label: "Y-bars (bottom)", value: r.flexY.barDesc,
      subtext: `As = ${r.flexY.AsProvided.toFixed(0)} mm²/m`,
      status: r.flexY.AsProvided >= r.flexY.AsReq ? "ok" as const : "fail" as const },
    { label: "Wide beam shear", value: `v_x = ${r.wideBeamShear.vx.toFixed(3)} N/mm²`,
      subtext: `vc = ${r.wideBeamShear.vc.toFixed(3)} N/mm²`,
      status: r.wideBeamShear.ok ? "ok" as const : "fail" as const },
    { label: "Punching shear", value: `v = ${r.punchingShear.v_punching.toFixed(3)} N/mm²`,
      subtext: `vc = ${r.punchingShear.vc.toFixed(3)} N/mm²`,
      status: r.punchingShear.ok ? "ok" as const : "fail" as const },
  ] : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Pad Foundation Design" subtitle="BS8110 Cl. 3.11" onReset={reset} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-5">
              <InputSection title="Applied Loads">
                <InputField label="Axial load N" unit="kN" value={inputs.N} min={0} step={50}
                  onChange={(v) => updateInput("N", v)} />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <InputField label="Moment Mx" unit="kN·m" value={inputs.Mx} min={0} step={5}
                    onChange={(v) => updateInput("Mx", v)} />
                  <InputField label="Moment My" unit="kN·m" value={inputs.My} min={0} step={5}
                    onChange={(v) => updateInput("My", v)} />
                </div>
              </InputSection>

              <InputSection title="Column">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Col. width b" unit="mm" value={inputs.columnB} min={150} step={50}
                    onChange={(v) => updateInput("columnB", v)} />
                  <InputField label="Col. depth h" unit="mm" value={inputs.columnH} min={150} step={50}
                    onChange={(v) => updateInput("columnH", v)} />
                </div>
              </InputSection>

              <InputSection title="Pad Dimensions">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Pad length L" unit="m" value={inputs.padL} min={0.5} step={0.25}
                    onChange={(v) => updateInput("padL", v)} />
                  <InputField label="Pad width B" unit="m" value={inputs.padB} min={0.5} step={0.25}
                    onChange={(v) => updateInput("padB", v)} />
                  <InputField label="Thickness h" unit="mm" value={inputs.h} min={200} step={50}
                    onChange={(v) => updateInput("h", v)} />
                  <InputField label="Cover" unit="mm" value={inputs.cover} min={30} step={5}
                    onChange={(v) => updateInput("cover", v)} />
                  <InputField label="Bar dia φ" unit="mm" value={inputs.barDia} min={10}
                    onChange={(v) => updateInput("barDia", v)} />
                </div>
              </InputSection>

              <InputSection title="Soil & Materials">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Allow. bearing" unit="kN/m²" value={inputs.Fb} min={50} step={25}
                    onChange={(v) => updateInput("Fb", v)} />
                  <InputField label="Soil depth" unit="m" value={inputs.soilDepth} min={0} step={0.25}
                    onChange={(v) => updateInput("soilDepth", v)} />
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
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Foundation Section</span>
              {result && (
                <Badge variant={result.status === "ok" ? "default" : "destructive"} className="text-[10px]">
                  {result.status.toUpperCase()}
                </Badge>
              )}
            </div>
            <FoundationDiagram inputs={inputs} result={result?.summary ? {
              p_max: result.summary.p_max,
              p_min: result.summary.p_min,
              pressureOK: result.summary.pressureOK,
              punchingShear: result.summary.punchingShear,
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
                  <SummaryCard title="Foundation Design Results" items={summaryItems} />
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
