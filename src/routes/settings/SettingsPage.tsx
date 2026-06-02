import { TopBar } from "@/components/layout/TopBar";
import { useAppStore } from "@/store/app.store";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Sun, Moon, Layers, RectangleVertical, Grid3x3,
  Building2, Info, BookOpen, CheckCircle2, AlertCircle,
} from "lucide-react";

/* ─── Reusable primitives ───────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}

/* ── Doc step card ──────────────────────────────────────────────── */
interface DocStepProps {
  number: number;
  title: string;
  summary: string;
  formula?: string;
  formulaLabel?: string;
  bullets?: string[];
  tip?: string;
  warning?: string;
}

function DocStep({ number, title, summary, formula, formulaLabel, bullets, tip, warning }: DocStepProps) {
  return (
    <div className="flex gap-4">
      {/* Step number bubble */}
      <div className="shrink-0 flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-black flex items-center justify-center shadow-sm">
          {number}
        </div>
        <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 min-h-[24px]" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 space-y-2.5">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{summary}</p>
        </div>

        {formula && (
          <div className="rounded-lg bg-slate-950 dark:bg-black px-4 py-3 space-y-0.5">
            {formulaLabel && (
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">{formulaLabel}</p>
            )}
            <p className="font-mono text-sm text-orange-400 leading-relaxed">{formula}</p>
          </div>
        )}

        {bullets && bullets.length > 0 && (
          <ul className="space-y-1.5">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        )}

        {tip && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-3 py-2.5">
            <CheckCircle2 size={13} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">{tip}</p>
          </div>
        )}

        {warning && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 px-3 py-2.5">
            <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{warning}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DocHeader({ icon, title, subtitle, badge }: {
  icon: React.ReactNode; title: string; subtitle: string; badge: string;
}) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-slate-900 border border-orange-100 dark:border-orange-900/40 mb-6">
      <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <Badge className="text-[10px] font-mono bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
            {badge}
          </Badge>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

/* ─── Documentation content ────────────────────────────────────── */

function BeamDocs() {
  return (
    <div>
      <DocHeader
        icon={<Layers size={20} />}
        title="Beam Design"
        subtitle="How StructCore designs rectangular reinforced concrete beams to resist bending and shear."
        badge="BS8110 Cl. 3.4"
      />
      <DocStep
        number={1}
        title="Calculate the Ultimate Design Load"
        summary="Before designing anything, we must know the worst load the beam will ever see. We apply safety factors to both the dead load (the permanent weight of the structure) and the live load (people, furniture, wind, etc.). The result is the ultimate design load — a load the beam must survive even in the worst case."
        formula="n = 1.4 × gk  +  1.6 × qk"
        formulaLabel="Ultimate design load (kN/m)"
        bullets={[
          "gk = dead (permanent) load in kN/m — the weight that is always there",
          "qk = live (imposed) load in kN/m — the variable load from use",
          "1.4 and 1.6 are safety factors — they account for uncertainty in loading",
        ]}
        tip="A factor of 1.4 on dead load means the beam is designed to carry 40% more than the expected permanent weight. This provides a safety margin."
      />
      <DocStep
        number={2}
        title="Find the Maximum Bending Moment"
        summary="The bending moment tells us how much the beam is trying to bend. For a simply supported beam under a uniform load, the worst bending happens right at the centre. For a continuous beam, significant bending occurs at the supports too — those hogging moments are just as important to design for."
        formula={"Simply supported:  M = n × L² / 8\nContinuous spans:   M = β × n × L²"}
        formulaLabel="Design bending moment (kN·m)"
        bullets={[
          "L = span of the beam in metres",
          "β = moment coefficient from BS8110 Table 3.5 (depends on span position)",
          "The midspan moment tries to sag the beam downward — needs bottom steel",
          "The support moment tries to hog the beam upward — needs top steel",
        ]}
        tip="For a 6m simply supported beam under 20 kN/m design load: M = 20 × 6² / 8 = 90 kN·m."
      />
      <DocStep
        number={3}
        title="Check the Moment Capacity (K Factor)"
        summary="The K factor tells us how hard the concrete compression zone is working. Concrete is excellent in compression but weak in tension — so we need it to stay well within its limits. If K stays below 0.156, the concrete alone handles the compression and we only need tension steel at the bottom. If K exceeds 0.156, we need compression steel at the top too."
        formula="K = M / (fcu × b × d²)"
        formulaLabel="Moment redistribution factor"
        bullets={[
          "fcu = characteristic compressive strength of concrete (e.g. 30 N/mm²)",
          "b = width of the beam cross-section in mm",
          "d = effective depth — measured from the top of the beam to the centre of the tension steel",
          "K ≤ 0.156 → singly reinforced section (tension steel only)",
          "K > 0.156 → doubly reinforced section needed (steel top and bottom)",
        ]}
        warning="If K exceeds 0.156, either increase the beam depth (most efficient fix) or add compression steel at the top."
      />
      <DocStep
        number={4}
        title="Calculate the Lever Arm (z)"
        summary="The lever arm is the distance between the tension force in the steel and the compression force in the concrete. A larger lever arm means the beam resists the moment more efficiently, requiring less steel. The lever arm is always less than the effective depth and is capped at 95% of it."
        formula={"z = d × [ 0.5 + √(0.25 − K / 0.9) ]\n\nMaximum:  z ≤ 0.95 × d"}
        formulaLabel="Lever arm (mm)"
        tip="For a typical beam, z is around 85–90% of the effective depth d. If the formula gives a value above 0.95d, it is capped there — this prevents overestimating efficiency."
      />
      <DocStep
        number={5}
        title="Calculate the Tension Steel Required"
        summary="Now we have everything needed to find how much steel to put in the bottom of the beam. The steel has to carry the entire tensile force. We divide the moment by the lever arm to get the tensile force, then divide by the steel stress to get the area of steel bars needed."
        formula="As = M / (0.87 × fy × z)"
        formulaLabel="Tension steel area (mm²)"
        bullets={[
          "fy = yield strength of the reinforcement steel (typically 460 N/mm²)",
          "0.87 = 1/1.15 — the material safety factor for steel",
          "The result is the minimum area of steel bars needed at the bottom",
          "We then select real bars (e.g. 3T16 = 603 mm²) that exceed this value",
        ]}
        tip="BS8110 also sets a minimum steel area of 0.13% of the beam cross-section to prevent brittle failure even in lightly loaded beams."
      />
      <DocStep
        number={6}
        title="Design the Shear Reinforcement (Links)"
        summary="Shear is a sliding force that tries to split the beam vertically near the supports, where the load is transferred. We first check whether the concrete alone can handle it. If not, we add vertical steel links (stirrups) at a calculated spacing. The links stitch the concrete together and prevent diagonal cracking."
        formula={"v = V / (b × d)       ← shear stress in concrete\n\nIf v > vc:\n  Asv/sv = (v − vc) × b / (0.87 × fyv)"}
        formulaLabel="Shear design"
        bullets={[
          "V = maximum shear force near the supports",
          "vc = concrete shear capacity — depends on steel ratio and concrete grade (Table 3.8)",
          "Asv = total cross-sectional area of link legs at one position",
          "sv = spacing between successive links along the beam",
          "fyv = yield strength of the link steel (usually 250 N/mm²)",
        ]}
        warning="The maximum shear stress must never exceed 0.8√fcu or 5 N/mm². If it does, the section is too small and must be enlarged."
      />
      <DocStep
        number={7}
        title="Deflection Check (Span-to-Depth Ratio)"
        summary="Even if a beam is strong enough, it must not sag too much in service — excessive deflection looks bad and can damage finishes. Instead of calculating deflection directly, BS8110 uses a simple span-to-depth ratio check. We apply a modification factor based on how much steel we have provided versus what was needed."
        formula={"Basic L/d ratio (Table 3.9): 20 for simply supported, 26 for continuous\n\nModification Factor MF = 0.55 + (477 − fs) / [120 × (0.9 + M/bd²)]\n\nAllowable L/d = Basic ratio × MF"}
        formulaLabel="Deflection check"
        bullets={[
          "fs = service stress in the tension steel ≈ (5/8) × fy × As_required / As_provided",
          "Providing more steel than required reduces service stress and allows a higher MF",
          "If the actual L/d is less than the allowable L/d → deflection is acceptable",
        ]}
        tip="Providing slightly more steel than required is often the cheapest way to satisfy deflection without increasing the beam depth."
      />
    </div>
  );
}

function ColumnDocs() {
  return (
    <div>
      <DocHeader
        icon={<RectangleVertical size={20} />}
        title="Column Design"
        subtitle="How StructCore designs reinforced concrete columns to carry axial load and bending moment."
        badge="BS8110 Cl. 3.8"
      />
      <DocStep
        number={1}
        title="Classify: Short or Slender Column?"
        summary="The first thing we must determine is whether the column is 'short' or 'slender'. A short column fails by crushing of the material. A slender column can buckle sideways before it crushes — like a ruler bending when you push on its ends. The slenderness ratio (le/h) tells us which we're dealing with."
        formula={"Braced column:    Short if  le/h < 15\nUnbraced column:  Short if  le/h < 10\n\nle = effective height,  h = column depth"}
        formulaLabel="Slenderness classification"
        bullets={[
          "le = effective height — depends on how the column is restrained at top and bottom",
          "A braced column has its sway restrained by walls or other stiff elements",
          "An unbraced column is free to sway at the top (e.g. a cantilevered post)",
          "Most columns in buildings are braced",
        ]}
        tip="If your column is slender, StructCore automatically calculates an additional bending moment (Madd) to account for the extra eccentricity caused by the column deflecting sideways."
      />
      <DocStep
        number={2}
        title="Additional Moment for Slender Columns"
        summary="When a slender column bends slightly under load, the axial force acting at the displaced position creates an extra bending moment. This is called the P-delta effect. BS8110 handles this by adding a calculated additional moment to whatever moment the column already carries."
        formula={"Madd = N × h × (le/h)² / 2000\n\nTotal moment = M_applied + Madd"}
        formulaLabel="Additional moment (kN·m)"
        bullets={[
          "N = applied axial load in kN",
          "The additional moment grows rapidly with slenderness — a reason to keep columns stocky",
          "Short columns skip this step entirely (Madd = 0)",
        ]}
        warning="For highly slender columns (le/h > 25), the additional moment can be very large. Consider increasing the column size or reducing the storey height."
      />
      <DocStep
        number={3}
        title="Check Minimum Eccentricity"
        summary="No column is ever perfectly loaded at its exact centre. There is always some accidental eccentricity from construction tolerances, load asymmetry, or minor misalignment. BS8110 requires a minimum eccentricity of at least h/20 or 20 mm, whichever is larger, so the column is never designed for pure axial load alone."
        formula={"e_min = max( h/20,  20 mm )"}
        formulaLabel="Minimum eccentricity"
        tip="Even a column that appears axially loaded must be designed for at least this minimum moment. StructCore applies this automatically."
      />
      <DocStep
        number={4}
        title="Design the Main Steel Area"
        summary="For a short column under axial load and bending, the required steel area is found using the column's load-moment interaction. The concrete carries most of the axial load; the steel supplements it and resists bending. For a purely axially loaded short column, BS8110 gives a direct formula."
        formula={"Axial only:  N = 0.4 × fcu × Ac  +  0.75 × fy × Asc\n\nWith moment: Use interaction diagram (N vs M)"}
        formulaLabel="Column capacity / steel area"
        bullets={[
          "Ac = gross concrete area = b × h",
          "Asc = area of all main reinforcement bars",
          "For eccentric loading, the design must satisfy both the axial load AND the bending moment simultaneously",
          "The interaction diagram plots all combinations of N and M the column can carry",
        ]}
        tip="Think of the interaction diagram like a boundary. Any (N, M) point inside the boundary is safe. Points outside mean the column needs more steel or a bigger section."
      />
      <DocStep
        number={5}
        title="Steel Limits"
        summary="BS8110 sets both a minimum and maximum steel percentage for columns. Too little steel and the column could fail suddenly without warning. Too much steel makes it difficult to place and compact the concrete properly."
        formula={"Minimum:  Asc ≥ 0.4% × Ac\nMaximum:  Asc ≤ 6% × Ac"}
        formulaLabel="Reinforcement limits"
        bullets={[
          "0.4% minimum — ensures the column has some ductility before failure",
          "6% maximum — in practice, 4% is preferred to allow concrete to be properly placed",
          "Laps (where bars are joined) count as double at that location, so stay below 4% away from laps",
        ]}
      />
      <DocStep
        number={6}
        title="Design the Column Links"
        summary="Column links (lateral ties) hold the main bars in position, prevent them from buckling outward, and confine the concrete. They must be spaced closely enough to be effective but are not structural shear reinforcement in the same way as beam links."
        formula={"Link diameter ≥ max( 6mm,  φ_main / 4 )\nLink spacing   ≤ min( 12 × φ_main,  least dimension,  300mm )"}
        formulaLabel="Column link requirements"
        tip="For 20mm main bars: link diameter ≥ max(6, 5) = 6mm. Link spacing ≤ min(240, column width, 300). A common result is T6@200."
      />
    </div>
  );
}

function SlabDocs() {
  return (
    <div>
      <DocHeader
        icon={<Grid3x3 size={20} />}
        title="Slab Design"
        subtitle="How StructCore designs one-way, two-way, and flat slabs for bending, shear, and deflection."
        badge="BS8110 Cl. 3.5 / 3.7"
      />
      <DocStep
        number={1}
        title="Determine the Design Load"
        summary="Just like beams, slabs carry dead load (self-weight, screed, finishes) and live load (people, furniture). The design load is calculated per square metre of slab area, with the same safety factors applied."
        formula={"n = 1.4 × gk  +  1.6 × qk   (kN/m²)"}
        formulaLabel="Ultimate design load per m²"
        bullets={[
          "gk = dead load per m² — includes self-weight (25 × thickness in m = kN/m²), screed, finishes",
          "qk = imposed load per m² — typically 1.5 kN/m² for residential, 5 kN/m² for offices",
          "A 175mm slab: self-weight = 25 × 0.175 = 4.375 kN/m²",
        ]}
      />
      <DocStep
        number={2}
        title="Decide How the Slab Spans"
        summary="The most important question is: which direction (or directions) does the slab span? A one-way slab bends mainly in one direction, like a plank. A two-way slab is supported on all four edges and shares load in both directions. A flat slab spans in two directions but transfers load directly to columns with no beams."
        formula={"One-way: spans mainly in the short direction\nTwo-way: ly/lx ≤ 2.0  (load shared both ways)\nFlat slab: column grid, no downstand beams"}
        formulaLabel="Slab classification"
        bullets={[
          "If the long side is more than twice the short side (ly/lx > 2), treat it as one-way",
          "Two-way slabs are more efficient — load spreads in both directions, so thinner slabs are possible",
          "Flat slabs are efficient for large open areas (offices, car parks) with a regular column grid",
        ]}
      />
      <DocStep
        number={3}
        title="Find the Design Moments (Two-Way Slab)"
        summary="For a two-way slab, the bending moment in each direction depends on the span ratio and how the edges are supported. BS8110 Table 3.14 provides moment coefficients for nine different edge conditions — ranging from all edges continuous (interior panel) to all edges simply supported."
        formula={"Short span:  msx = αsx × n × lx²\nLong span:   msy = αsy × n × lx²\n\nαsx, αsy from BS8110 Table 3.14"}
        formulaLabel="Two-way slab moments (kN·m/m)"
        bullets={[
          "lx = length of the shorter span",
          "The coefficients αsx and αsy account for the ratio ly/lx and the edge conditions",
          "Negative (hogging) moments occur at continuous edges — need top steel",
          "Positive (sagging) moments occur at midspan — need bottom steel",
          "You must design for all four moment values if the slab has continuous edges",
        ]}
        tip="Edge condition 4 (two adjacent edges discontinuous) is a commonly used starting point for interior floor panels with one free corner."
      />
      <DocStep
        number={4}
        title="Design the Reinforcement (Flexure)"
        summary="Once we have the design moments, each direction is designed like a narrow beam strip, 1 metre wide. The same K-factor, lever arm, and steel area formulas apply, but the answer gives steel area per metre width (mm²/m)."
        formula={"K = m / (fcu × 1000 × d²)\nz = d × [0.5 + √(0.25 − K/0.9)]  ≤ 0.95d\nAs = m / (0.87 × fy × z)   mm²/m"}
        formulaLabel="Slab flexure (per metre width)"
        bullets={[
          "m = design moment in kN·m per metre width",
          "The 1000 in the K formula is the assumed strip width of 1000mm (1 metre)",
          "The short span bars run in the short direction and are placed in the lower layer (more effective)",
          "The long span bars run in the long direction and sit on top of the short span bars",
          "The effective depth d is slightly less for the long span bars because they sit higher",
        ]}
        tip="Minimum steel in slabs is 0.13% of the cross-sectional area for high-yield bars. Never go below this, even if the moment calculation says you need less."
      />
      <DocStep
        number={5}
        title="Flat Slab — Column and Middle Strips"
        summary="Flat slabs don't use beams, so the slab itself must carry moments in two directions. The load concentrates near the columns, so the slab is divided into 'column strips' (the heavily loaded zone near columns) and 'middle strips' (the less loaded zone between columns). Each strip is designed separately."
        formula={"Column strip width = 0.5 × span (each side of column centreline)\nColumn strip carries:  75% of negative (support) moment\n                       55% of positive (span) moment"}
        formulaLabel="Flat slab strip design"
        bullets={[
          "The column strip is the most critical region — most of the load funnels through here",
          "Middle strips carry the remaining 25% (negative) and 45% (positive) of the moment",
          "Provide heavier reinforcement in the column strip, lighter in the middle strip",
        ]}
      />
      <DocStep
        number={6}
        title="Punching Shear Check (Flat Slabs)"
        summary="In a flat slab, the column punches upward through the slab. This punching action can cause a sudden conical failure around the column. We check the shear stress on a critical perimeter at 1.5 times the effective depth from the column face."
        formula={"Critical perimeter u = 2(cx + cy) + 4π × 1.5d\nPunching shear stress v = V / (u × d)"}
        formulaLabel="Punching shear"
        bullets={[
          "cx, cy = column dimensions in mm",
          "If v ≤ vc (concrete capacity), no shear reinforcement is needed",
          "If v > vc, provide shear studs or bent-up bars, or use a column head/drop panel",
        ]}
        warning="Punching shear is one of the most dangerous failure modes in flat slabs — it is sudden and without warning. Always check this carefully and consider drop panels at heavily loaded columns."
      />
    </div>
  );
}

function FoundationDocs() {
  return (
    <div>
      <DocHeader
        icon={<Building2 size={20} />}
        title="Pad Foundation Design"
        subtitle="How StructCore designs reinforced concrete pad foundations to transfer column loads safely to the ground."
        badge="BS8110 Cl. 3.11"
      />
      <DocStep
        number={1}
        title="Calculate the Total Load on the Foundation"
        summary="The foundation must carry the column load plus its own self-weight plus the weight of the soil sitting on top of it. All of this presses down on the ground beneath. We use service (unfactored) loads here to check against the soil's bearing capacity."
        formula={"N_total = N_column + W_foundation + W_soil\n\nW_foundation = A × h × 24  (kN)\nW_soil = A × depth × γ_soil  (kN)"}
        formulaLabel="Total vertical load on soil (kN)"
        bullets={[
          "N_column = the axial load from the column above (unfactored, service load)",
          "24 kN/m³ = unit weight of reinforced concrete",
          "γ_soil = unit weight of soil — typically 18–20 kN/m³",
          "A = plan area of the pad (m²)",
        ]}
        tip="For checking bearing pressure, use the actual (service) loads. For structural design of the concrete, use factored ultimate loads (1.4 × dead + 1.6 × live)."
      />
      <DocStep
        number={2}
        title="Check the Bearing Pressure"
        summary="The pressure the foundation exerts on the ground must not exceed the allowable bearing capacity of the soil. If there is also a moment (from horizontal loads or eccentric column), the pressure distribution becomes non-uniform — greater on one side, less on the other."
        formula={"p = N_total / A  ±  Mx / Zx  ±  My / Zy\n\nwhere Zx = B × L² / 6  and  Zy = L × B² / 6"}
        formulaLabel="Bearing pressure (kN/m²)"
        bullets={[
          "p_max must be ≤ allowable bearing pressure Fb",
          "p_min must be ≥ 0 (no tension under the foundation — soil cannot pull)",
          "If p_min < 0, the foundation is lifting off the ground — increase the base size or change the geometry",
          "Zx and Zy are the section moduli of the pad plan area",
        ]}
        warning="If p_max exceeds the allowable bearing pressure, increase the pad size. A larger area spreads the load over more soil."
      />
      <DocStep
        number={3}
        title="Design the Pad as a Cantilever (Bending)"
        summary="The upward soil pressure is like a distributed load acting upward on the pad. The pad projects out from the column face on all sides, bending upward like a cantilever. We design for the bending moment at the column face — the critical location."
        formula={"Upward pressure (ultimate): p_ult = 1.4 × N_column / A\n\nCantilever moment per metre:\n  Mx = p_ult × B × lx² / 2 / B  =  p_ult × lx² / 2\n\nwhere lx = (L − column depth) / 2"}
        formulaLabel="Cantilever bending moment (kN·m/m)"
        bullets={[
          "lx = projection of pad beyond the column face in the x-direction",
          "The critical section for bending is at the face of the column, not the centre of the pad",
          "We design reinforcement in both x and y directions",
          "The same K, z, As procedure as for beams applies, treating each strip as 1m wide",
        ]}
        tip="The pad is designed using factored (ultimate) loads for the structural calculations, even though we used service loads to check the bearing pressure."
      />
      <DocStep
        number={4}
        title="Wide Beam Shear Check"
        summary="The soil pressure also creates shear across the full width of the pad. The critical section for wide beam shear is at a distance d (the effective depth) from the column face. If the shear stress there exceeds what the concrete can carry, more depth is needed."
        formula={"V = p_ult × B × (lx − d)      ← shear force over critical width\nv = V / (B × d × 1000)        ← shear stress (N/mm²)\n\nCheck:  v ≤ vc  (from Table 3.8)"}
        formulaLabel="Wide beam shear at d from column face"
        bullets={[
          "B = full width of the pad perpendicular to the direction being checked",
          "d = effective depth of the pad reinforcement",
          "vc is obtained from BS8110 Table 3.8 based on the reinforcement percentage and concrete grade",
          "If v > vc, increase the pad thickness — shear links are rarely used in pad foundations",
        ]}
      />
      <DocStep
        number={5}
        title="Punching Shear Check"
        summary="Like flat slabs, pad foundations are also vulnerable to punching shear around the column. The column tries to punch down through the pad. We check on a critical perimeter at 1.5d from the column face — if the stress is too high, we need a deeper pad."
        formula={"Critical perimeter: u = 2(cx + cy) + 4π × 1.5d\nPunching load: V_p = N_ult − p_ult × (cx + 3d)(cy + 3d)\nPunching stress: v_p = V_p / (u × d)"}
        formulaLabel="Punching shear at 1.5d from column face"
        bullets={[
          "The punching load subtracts the upward soil pressure within the critical zone",
          "cx, cy = column cross-section dimensions",
          "If v_p ≤ vc → no punching reinforcement needed — this is the usual case for pad foundations",
          "If v_p > vc → increase the pad depth or provide punching shear reinforcement",
        ]}
        tip="Increasing the pad thickness is usually the simplest and most economical solution if punching shear is critical."
      />
    </div>
  );
}

/* ─── Preferences tab ──────────────────────────────────────────── */

function PreferencesTab() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="space-y-8 max-w-xl">
      {/* Appearance */}
      <Section title="Appearance">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Theme</p>
              <p className="text-xs text-slate-500 mt-0.5">Choose your preferred colour mode</p>
            </div>
            <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    theme === t
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                  )}
                >
                  {t === "light" ? <Sun size={12} /> : <Moon size={12} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Design code */}
      <Section title="Active Design Code">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-1 divide-y divide-slate-100 dark:divide-slate-800">
          <InfoRow label="Standard" value="BS8110-1:1997" />
          <InfoRow label="Dead load factor (γG)" value="1.4" />
          <InfoRow label="Live load factor (γQ)" value="1.6" />
          <InfoRow label="Concrete safety factor (γm)" value="1.5" />
          <InfoRow label="Steel safety factor (γm)" value="1.05 → 0.87fy" />
          <InfoRow label="Default concrete grade" value="fcu = 30 N/mm²" />
          <InfoRow label="Default steel grade" value="fy = 460 N/mm² (high yield)" />
          <InfoRow label="Stress block depth" value="0.9 × neutral axis depth" />
          <InfoRow label="Stress block stress" value="0.45 × fcu" />
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <span className="text-white text-sm font-black">SC</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">StructCore</p>
              <p className="text-xs text-slate-500">Version 1.0.0 · BS8110-1:1997</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
            StructCore is a professional reinforced concrete design tool. All results must be verified by a
            qualified structural engineer before use on any project. This software is provided for
            educational and preliminary design purposes only.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[["Tauri 2", "Desktop"], ["React 19", "Frontend"], ["TypeScript", "Language"]].map(([name, role]) => (
              <div key={name} className="rounded-lg bg-slate-50 dark:bg-slate-800 px-2.5 py-2 text-center">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */

const TABS = [
  { id: "preferences", label: "Preferences", icon: <Info size={13} /> },
  { id: "beams",       label: "Beams",       icon: <Layers size={13} /> },
  { id: "columns",     label: "Columns",     icon: <RectangleVertical size={13} /> },
  { id: "slabs",       label: "Slabs",       icon: <Grid3x3 size={13} /> },
  { id: "foundations", label: "Foundations", icon: <Building2 size={13} /> },
];

export function SettingsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Settings & Documentation" subtitle="Preferences · BS8110 calculation guide" />

      <Tabs defaultValue="preferences" className="flex flex-col flex-1 overflow-hidden">
        {/* Tab bar */}
        <div className="shrink-0 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22]">
          <TabsList className="h-9 gap-0.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400"
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Doc tab banner */}
          <div className="flex items-center gap-1.5 mt-2 pb-3">
            <BookOpen size={11} className="text-slate-400" />
            <p className="text-[10px] text-slate-400">
              The Beams, Columns, Slabs, and Foundations tabs explain exactly how each calculation is performed — in plain English, step by step.
            </p>
          </div>
        </div>

        {/* Preferences */}
        <TabsContent value="preferences" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="px-6 py-6">
              <PreferencesTab />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Documentation tabs */}
        {[
          { id: "beams",       Component: BeamDocs },
          { id: "columns",     Component: ColumnDocs },
          { id: "slabs",       Component: SlabDocs },
          { id: "foundations", Component: FoundationDocs },
        ].map(({ id, Component }) => (
          <TabsContent key={id} value={id} className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="px-6 py-6 max-w-2xl">
                <Component />
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
