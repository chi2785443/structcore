import { NavLink } from "react-router-dom";
import {
  Layers, RectangleVertical, Grid3x3, Building2, Settings,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  basePath: string;
  children: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Beams",
    icon: <Layers size={16} />,
    basePath: "/beams",
    children: [
      { label: "Simply Supported", path: "/beams/simple" },
      { label: "Continuous", path: "/beams/continuous" },
    ],
  },
  {
    label: "Columns",
    icon: <RectangleVertical size={16} />,
    basePath: "/columns",
    children: [
      { label: "Single Column", path: "/columns" },
    ],
  },
  {
    label: "Slabs",
    icon: <Grid3x3 size={16} />,
    basePath: "/slabs",
    children: [
      { label: "One-Way", path: "/slabs/one-way" },
      { label: "Two-Way", path: "/slabs/two-way" },
      { label: "Flat Slab", path: "/slabs/flat-slab" },
    ],
  },
  {
    label: "Foundations",
    icon: <Building2 size={16} />,
    basePath: "/foundations",
    children: [
      { label: "Pad Foundation", path: "/foundations/pad" },
    ],
  },
];

function NavGroup({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <span className="text-slate-500">{group.icon}</span>
        <span className="flex-1 text-left">{group.label}</span>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && (
        <div className="ml-3 border-l border-slate-700 pl-3 space-y-0.5 mb-1">
          {group.children.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "block px-3 py-1.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-orange-500 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[#0D1117] border-r border-slate-800 overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center">
            <span className="text-white text-xs font-black">SC</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-none">StructCore</div>
            <div className="text-[10px] text-slate-500 mt-0.5">BS8110 Design Suite</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-1 px-1">
        {NAV.map((group) => (
          <NavGroup key={group.basePath} group={group} />
        ))}
      </nav>

      {/* Settings */}
      <div className="border-t border-slate-800 p-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
              isActive
                ? "bg-orange-500 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50",
            )
          }
        >
          <Settings size={15} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
