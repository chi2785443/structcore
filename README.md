# StructCore

A professional reinforced concrete structural design desktop application built to **BS8110-1:1997**. Design beams, columns, slabs, and pad foundations with step-by-step calculations, live structural diagrams, and shear force / bending moment charts — all offline, as a native Windows app.

![BS8110](https://img.shields.io/badge/BS8110--1%3A1997-Compliant-orange?style=flat-square)
![Tauri](https://img.shields.io/badge/Tauri_2-Desktop-blue?style=flat-square)
![React](https://img.shields.io/badge/React_19-Frontend-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript)

---

## Features

### Structural Modules

| Module          | Type                                       | Standard                        |
| --------------- | ------------------------------------------ | ------------------------------- |
| **Beams**       | Simply supported & continuous (multi-span) | BS8110 Cl. 3.4, Table 3.5       |
| **Columns**     | Short & slender, braced & unbraced         | BS8110 Cl. 3.8                  |
| **Slabs**       | One-way, two-way, flat slab                | BS8110 Cl. 3.5, 3.7, Table 3.14 |
| **Foundations** | Pad foundation                             | BS8110 Cl. 3.11                 |

### Design Checks Performed

- Flexural design — K factor, lever arm z, tension steel As
- Doubly reinforced sections when K > K' = 0.156
- Shear — concrete capacity vc (Table 3.8), link design
- Deflection — span/depth ratio with modification factors (Tables 3.9, 3.10)
- Column slenderness — additional moment Madd for slender columns
- Two-way slab — all 9 BS8110 Table 3.14 edge conditions
- Flat slab — equivalent frame, column strips, punching shear at 1.5d
- Pad foundation — bearing pressure, wide beam shear, punching shear

### UI Features

- **Live SVG diagrams** — structural diagram updates as you type (spans, loads, support conditions, rebar overlay)
- **D3.js SFD/BMD charts** — analytically exact shear force and bending moment diagrams
- **Step-by-step working** — every BS8110 clause referenced, formula shown with full substitution
- **Status indicators** — OK / WARN / FAIL on every design check
- Dark and light theme
- Inputs persist between sessions

---

## Tech Stack

| Layer           | Technology                                             |
| --------------- | ------------------------------------------------------ |
| Desktop         | **Tauri 2** — native Windows `.msi` / `.exe` installer |
| Frontend        | **React 19** + **Vite 8** + **TypeScript 6**           |
| Styling         | **Tailwind CSS v4** + **shadcn/ui**                    |
| State           | **Zustand 5**                                          |
| Charts          | **D3.js 7**                                            |
| Routing         | **react-router-dom v7**                                |
| Package manager | **pnpm**                                               |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- [Rust](https://rustup.rs/) stable
- [MSYS2](https://www.msys2.org/) with MinGW-w64 GCC (Windows only)

### Install

```bash
git clone https://github.com/chi2785443/structcore.git
cd structcore
pnpm install
```

### Run in Development

```bash
# Browser dev server (fastest iteration)
pnpm dev

# Desktop window with hot-reload
pnpm tauri dev
```

### Build Windows Installer

```bash
pnpm tauri build
```

Outputs:

```
src-tauri/target/release/bundle/
  ├── msi/StructCore_1.0.0_x64_en-US.msi    (~7.6 MB)
  └── nsis/StructCore_1.0.0_x64-setup.exe   (~5.5 MB)
```

---

## Project Structure

```
StructCore/
├── src/
│   ├── engine/          # Pure TypeScript BS8110 calculation engines (no React)
│   │   ├── constants.ts # BS8110 table values (3.5, 3.8, 3.9–3.11, 3.14, 3.25)
│   │   ├── utils.ts     # findVc, selectBars, step() factory, tensionMF
│   │   ├── beam/        # Flexure, shear, deflection, continuous beam
│   │   ├── column/      # Short, slender, interaction diagram
│   │   ├── slab/        # One-way, two-way, flat slab
│   │   ├── foundation/  # Pad foundation
│   │   └── sfd-bmd/     # Analytical SFD/BMD point arrays
│   │
│   ├── store/           # Zustand stores — beam, column, slab, foundation, app
│   ├── types/           # TypeScript interfaces (CalcStep, DesignResult<T>)
│   ├── components/
│   │   ├── diagrams/    # Reactive SVG structural diagrams
│   │   ├── charts/      # D3.js SFD/BMD chart
│   │   ├── results/     # StepItem, StepList, SummaryCard
│   │   └── ui/          # shadcn/ui components
│   └── routes/          # Page components per structural module
│
└── src-tauri/           # Tauri Rust shell + window/bundle config
```

---

## BS8110 Design Methodology

All calculations follow the **limit state design** approach from BS8110-1:1997.

**Load factors:** γG = 1.4 (dead), γQ = 1.6 (imposed)  
**Material factors:** γm = 1.5 (concrete), γm = 1.05 (steel)  
**Concrete stress block:** Simplified rectangular (depth = 0.9x, stress = 0.45fcu)

### Beam Design Flow

```
n = 1.4·gk + 1.6·qk
→ Mmax = n·L²/8  (simply supported)
   or  M = β·n·L²  (continuous, BS8110 Table 3.5)
→ K = M / (fcu·b·d²)   [K ≤ 0.156 → singly reinforced]
→ z = d[0.5 + √(0.25 - K/0.9)]   [capped at 0.95d]
→ As = M / (0.87·fy·z)
→ Shear: v = V/(b·d), compare vc (Table 3.8)
         Links: Asv/sv = (v - vc)·b / (0.87·fyv)
→ Deflection: L/d × MF (Tables 3.9, 3.10)
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## Disclaimer

Results produced by StructCore must be verified by a qualified structural engineer before use on any project. This software is provided for educational and preliminary design purposes only.

---

## License

MIT © 2025 StructCore

USE DESIGN LOAD OR MOMENT OF IT
