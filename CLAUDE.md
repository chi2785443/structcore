# StructCore — CLAUDE.md

## Project Overview

StructCore is a professional reinforced concrete structural design desktop application built with Tauri 2 + React 19 + TypeScript. It performs BS8110-1:1997 compliant design calculations for beams, columns, slabs, and pad foundations.

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri 2 (produces Windows `.msi` / `.exe` installer) |
| Frontend | React 19 + Vite 8 + TypeScript 6 |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) |
| State | Zustand 5 (persist middleware) |
| Charts | D3.js 7 (SFD/BMD diagrams) |
| Diagrams | React SVG components (live structural diagrams) |
| Routing | react-router-dom v7 (client-side SPA) |
| Package manager | pnpm |

## Project Structure

```
StructCore/
├── src/
│   ├── engine/               # Pure TS BS8110 calculation engines — NO React imports
│   │   ├── constants.ts      # BS8110 Tables 3.5, 3.8, 3.9–3.11, 3.14, 3.25
│   │   ├── utils.ts          # findVc, selectBars, step() factory, tensionMF
│   │   ├── beam/             # simply-supported.ts, continuous.ts, shear.ts, deflection.ts, flexure.ts
│   │   ├── column/           # index.ts (short + slender + interaction diagram)
│   │   ├── slab/             # index.ts (one-way, two-way, flat slab)
│   │   ├── foundation/       # index.ts (pad foundation)
│   │   └── sfd-bmd/          # index.ts (analytical SFD/BMD computation)
│   │
│   ├── store/                # Zustand stores — one per module
│   │   ├── beam.store.ts     # useBeamStore
│   │   ├── column.store.ts   # useColumnStore
│   │   ├── slab.store.ts     # useSlabStore
│   │   ├── foundation.store.ts # useFoundationStore
│   │   └── app.store.ts      # useAppStore (theme)
│   │
│   ├── types/                # TypeScript interfaces
│   │   ├── results.types.ts  # CalcStep, DesignResult<T>, SFDPoint, BMDPoint
│   │   ├── beam.types.ts
│   │   ├── column.types.ts
│   │   ├── slab.types.ts
│   │   └── foundation.types.ts
│   │
│   ├── components/
│   │   ├── layout/           # AppShell, Sidebar, TopBar
│   │   ├── inputs/           # InputField, InputSection
│   │   ├── diagrams/         # BeamDiagram, ColumnDiagram, SlabDiagram, FoundationDiagram (SVG)
│   │   ├── charts/           # SFDBMDChart (D3.js)
│   │   ├── results/          # StepItem, StepList, SummaryCard
│   │   └── ui/               # shadcn generated components
│   │
│   ├── routes/               # Page components
│   │   ├── beams/            # SimplySupportedPage, ContinuousBeamPage
│   │   ├── columns/          # ColumnPage
│   │   ├── slabs/            # SlabPage (type prop: one-way | two-way | flat-slab)
│   │   ├── foundations/      # PadFoundationPage
│   │   └── settings/         # SettingsPage
│   │
│   ├── lib/utils.ts          # cn() helper (clsx + tailwind-merge)
│   ├── App.tsx               # BrowserRouter + Routes
│   ├── main.tsx              # ReactDOM.createRoot
│   └── index.css             # Tailwind v4 + shadcn CSS variables
│
└── src-tauri/                # Tauri Rust shell
    ├── tauri.conf.json       # Window size, bundle targets (msi + nsis)
    └── src/                  # main.rs, lib.rs
```

## Core Architecture Patterns

### Engine Pattern
Every engine function signature:
```ts
export function designX(inputs: XInputs): DesignResult<XSummary>
```
- Receives typed inputs, returns `{ summary, steps, status, failReasons }`
- Builds `CalcStep[]` by pushing step objects as each sub-calculation runs
- Sub-functions (shear, deflection) receive the `steps` array and push into it
- **No React imports — ever**

### Step Factory
```ts
import { step } from "@/engine/utils";
steps.push(step("label", "formula", "substitution", "result", "BS8110 Cl. X.X.X", "optional warn"));
```

### Store Pattern
```ts
const { inputs, result, updateInput, runDesign, reset } = useBeamStore();
// runDesign() calls engine synchronously, sets result
// updateInput() sets isDirty = true
```

### Page Layout
All calculator pages follow the same two-column pattern:
```
TopBar (full width)
├── Sidebar (240px, from AppShell)
├── Input Panel (288px, w-72, fixed, scrollable)
└── Right Panel (flex-1)
    ├── Diagram (SVG, shrink-0, ~250px h)
    └── Results Tabs (flex-1, overflow-hidden)
        ├── Summary tab → SummaryCard[]
        ├── Calc Steps tab → StepList → StepItem[]
        └── SFD/BMD tab → SFDBMDChart (D3)
```

### Live SVG Diagrams
- Subscribe directly to Zustand store (no props)
- Scale factor: `scale = DRAW_WIDTH / totalSpan_m`
- Render structural diagram from inputs alone; rebar overlay from result
- All in `src/components/diagrams/`

## BS8110 Design Code — Key References

| Element | Clause | Key Formula |
|---|---|---|
| Design loads | Cl. 2.4.3.2 | `n = 1.4·gk + 1.6·qk` |
| Effective depth | Cl. 3.3.6 | `d = h - cover - φlink - φbar/2` |
| Flexure K | Cl. 3.4.4.4 | `K = M/(fcu·b·d²) ≤ 0.156` |
| Lever arm z | Cl. 3.4.4.4 | `z = d[0.5 + √(0.25 - K/0.9)] ≤ 0.95d` |
| Tension steel | Cl. 3.4.4.4 | `As = M/(0.87·fy·z)` |
| Min steel | Table 3.25 | `As_min = 0.13%·b·h` |
| Shear stress | Cl. 3.4.5.2 | `v = V/(b·d); vmax = min(0.8√fcu, 5)` |
| Concrete shear vc | Table 3.8 | Interpolated by 100As/bd and fcu |
| Shear links | Cl. 3.4.5.3 | `Asv/sv = (v-vc)·b/(0.87·fyv)` |
| Deflection | Cl. 3.4.6 | L/d × MF (Tables 3.9, 3.10) |
| Continuous beam | Table 3.5 | `M = β·n·L²` |
| Column slender | Cl. 3.8.1.3 | `le/h < 15` (braced) |
| Column Madd | Cl. 3.8.3 | `Madd = N·h·(le/h)²/2000` |
| Column axial | Cl. 3.8.4.3 | `N = 0.4·fcu·Ac + 0.75·fy·Asc` |
| Two-way slab | Table 3.14 | `msx = αsx·n·lx²` |
| Flat slab | Cl. 3.7.3 | Column strip: 75% neg, 55% pos |
| Punching shear | Cl. 3.7.7 / 3.11.3 | Perimeter at 1.5d from column face |
| Pad bearing | Cl. 3.11.2.2 | `p = N/A ± M/Z` |

## Commands

```bash
# Development
pnpm dev                  # Vite dev server (http://localhost:5173)
pnpm tauri dev            # Tauri desktop window with hot-reload

# Build
pnpm build                # Vite production build → dist/
pnpm tauri build          # Full Windows installer → src-tauri/target/release/bundle/

# Type check
pnpm exec tsc --noEmit

# Add shadcn component
pnpm dlx shadcn@latest add <component-name>
```

## Adding a New Structural Module

1. Add types to `src/types/<module>.types.ts` and export from `src/types/index.ts`
2. Write engine in `src/engine/<module>/index.ts` — returns `DesignResult<Summary>`
3. Export from `src/engine/index.ts`
4. Create Zustand store in `src/store/<module>.store.ts`
5. Create SVG diagram in `src/components/diagrams/<Module>Diagram.tsx`
6. Create page in `src/routes/<module>/<Module>Page.tsx` using the standard layout
7. Add route to `src/App.tsx`
8. Add nav item to `src/components/layout/Sidebar.tsx`

## Environment Requirements (Windows)

- Node.js 20+
- pnpm 10+
- Rust (stable, `x86_64-pc-windows-gnu`)
- MSYS2 MinGW-w64 GCC 15+ (at `C:\msys64\mingw64\bin`)
- PATH must include: `C:\msys64\mingw64\bin` and `%USERPROFILE%\.cargo\bin`

PATH is set permanently via user environment variables — open a **new** PowerShell terminal after any PATH changes.
