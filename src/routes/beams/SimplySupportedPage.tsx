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
import { Play, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { computeSSBeam } from "@/engine";

export function SimplySupportedPage() {
  const { inputs, ssResult, isDirty, updateInput, runDesign, reset } = useBeamStore();

  // Force simply-supported mode
  if (inputs.supportType !== "simply-supported") {
    updateInput("supportType", "simply-supported");
  }

  const span = inputs.spans[0];

  const chartData = ssResult
    ? computeSSBeam(span.length, ssResult.summary.n)
    : null;

  const r = ssResult?.summary;

  const summaryItems = r ? [
    { label: "Effective depth d", value: `${r.d.toFixed(0)} mm`, status: "ok" as const },
    { label: "Max bending moment", value: `${r.Mmax.toFixed(1)} kN·m`, status: "ok" as const },
    { label: "Max shear force", value: `${r.Vmax.toFixed(1)} kN`, status: "ok" as const },
    { label: "K factor", value: r.flexure.K.toFixed(4),
      status: r.flexure.K <= 0.156 ? "ok" as const : "fail" as const,
      subtext: r.flexure.K <= 0.156 ? "≤ 0.156 — singly reinforced OK" : "> 0.156 — doubly reinforced" },
    { label: "Lever arm z", value: `${r.flexure.z.toFixed(0)} mm`, status: "ok" as const },
    { label: "As required", value: `${r.flexure.AsReq.toFixed(0)} mm²`, status: "ok" as const },
    { label: "As provided", value: `${r.flexure.AsProvided.toFixed(0)} mm²`,
      subtext: r.flexure.barDesc,
      status: r.flexure.AsProvided >= r.flexure.AsReq ? "ok" as const : "fail" as const },
    { label: "Shear stress v", value: `${r.shear.v.toFixed(3)} N/mm²`,
      status: r.shear.v <= r.shear.vc ? "ok" as const : "warn" as const },
    { label: "Concrete vc", value: `${r.shear.vc.toFixed(3)} N/mm²`, status: "ok" as const },
    { label: "Shear links", value: r.shear.linkDesc,
      status: r.shear.linksRequired ? "warn" as const : "ok" as const },
    { label: "L/d ratio", value: `${r.deflection.ldActual.toFixed(1)}`,
      subtext: `Allowable: ${r.deflection.ldAllowable.toFixed(1)}`,
      status: r.deflection.ok ? "ok" as const : "warn" as const },
  ] : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Simply Supported Beam Design"
        subtitle="Rectangular section — BS8110"
        onReset={reset}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Input Panel */}
        <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-5">
              <InputSection title="Geometry">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Span L" unit="m" value={span.length} min={0.5} step={0.5}
                    onChange={(v) => useBeamStore.getState().updateSpan(span.id, "length", v)} />
                  <InputField label="Width b" unit="mm" value={inputs.b} min={100} step={25}
                    onChange={(v) => updateInput("b", v)} />
                  <InputField label="Depth h" unit="mm" value={inputs.h} min={100} step={25}
                    onChange={(v) => updateInput("h", v)} />
                  <InputField label="Cover" unit="mm" value={inputs.cover} min={15} step={5}
                    onChange={(v) => updateInput("cover", v)} />
                  <InputField label="Bar dia φ" unit="mm" value={inputs.barDia} min={6}
                    onChange={(v) => updateInput("barDia", v)} />
                  <InputField label="Link dia φ" unit="mm" value={inputs.linkDia} min={6}
                    onChange={(v) => updateInput("linkDia", v)} />
                </div>
              </InputSection>

              <InputSection title="Loads (Characteristic)">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Dead gk" unit="kN/m" value={inputs.gk} min={0} step={0.5}
                    onChange={(v) => updateInput("gk", v)} />
                  <InputField label="Live qk" unit="kN/m" value={inputs.qk} min={0} step={0.5}
                    onChange={(v) => updateInput("qk", v)} />
                </div>
                <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-3 py-2 text-xs font-mono text-indigo-700 dark:text-indigo-300">
                  n = 1.4×{inputs.gk} + 1.6×{inputs.qk} = <strong>{(1.4 * inputs.gk + 1.6 * inputs.qk).toFixed(2)} kN/m</strong>
                </div>
              </InputSection>

              <InputSection title="Materials">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="fcu" unit="N/mm²" value={inputs.fcu} min={20} max={60} step={5}
                    onChange={(v) => updateInput("fcu", v)} />
                  <InputField label="fy" unit="N/mm²" value={inputs.fy} min={250} max={500} step={10}
                    onChange={(v) => updateInput("fy", v)} />
                  <InputField label="fyv (links)" unit="N/mm²" value={inputs.fyv} min={250} max={500}
                    onChange={(v) => updateInput("fyv", v)} />
                </div>
              </InputSection>
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
              onClick={runDesign}
            >
              <Play size={14} />
              Run BS8110 Design
            </Button>
            {isDirty && ssResult && (
              <p className="text-center text-[10px] text-amber-600 mt-1.5">
                Inputs changed — re-run to update results
              </p>
            )}
          </div>
        </aside>

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Diagram */}
          <div className="shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Structural Diagram</span>
              {ssResult && (
                <Badge
                  variant={ssResult.status === "ok" ? "default" : "destructive"}
                  className="gap-1 text-[10px]"
                >
                  {ssResult.status === "ok" && <CheckCircle2 size={10} />}
                  {ssResult.status === "warn" && <AlertTriangle size={10} />}
                  {ssResult.status === "fail" && <XCircle size={10} />}
                  {ssResult.status.toUpperCase()}
                </Badge>
              )}
            </div>
            <BeamDiagram
              inputs={inputs}
              result={ssResult ? {
                d: ssResult.summary.d,
                barCount: ssResult.summary.flexure.barCount,
                barDia: ssResult.summary.flexure.barDia,
              } : null}
            />
          </div>

          {/* Results tabs */}
          {ssResult ? (
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="summary" className="flex flex-col h-full">
                <div className="px-4 pt-3 pb-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22]">
                  <TabsList className="h-8">
                    <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
                    <TabsTrigger value="steps" className="text-xs">Calc Steps ({ssResult.steps.length})</TabsTrigger>
                    <TabsTrigger value="charts" className="text-xs">SFD / BMD</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="summary" className="flex-1 overflow-auto m-0">
                  <div className="p-4 space-y-3">
                    {ssResult.failReasons.length > 0 && (
                      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-400 space-y-1">
                        <div className="font-bold flex items-center gap-1.5"><XCircle size={12} /> Design Failures</div>
                        {ssResult.failReasons.map((r, i) => <div key={i}>• {r}</div>)}
                      </div>
                    )}
                    <SummaryCard title="Design Results" items={summaryItems} />
                  </div>
                </TabsContent>

                <TabsContent value="steps" className="flex-1 overflow-hidden m-0 p-4">
                  <StepList steps={ssResult.steps} />
                </TabsContent>

                <TabsContent value="charts" className="flex-1 overflow-hidden m-0">
                  <div className="h-full p-4">
                    {chartData ? (
                      <SFDBMDChart
                        sfd={chartData.sfd}
                        bmd={chartData.bmd}
                        totalLength={span.length}
                      />
                    ) : null}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Play size={32} className="text-slate-300" />
              <p className="text-sm font-medium">Enter values and click "Run BS8110 Design"</p>
              <p className="text-xs">Results, calculation steps, and SFD/BMD will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
