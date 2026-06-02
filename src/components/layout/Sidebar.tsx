import { NavLink } from "react-router-dom";
import {
  Layers, RectangleVertical, Grid3x3, Building2, Settings,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem  { label: string; path: string; }
interface NavGroup { label: string; icon: React.ReactNode; basePath: string; children: NavItem[]; }

const NAV: NavGroup[] = [
  {
    label: "Beams",
    icon: <Layers size={15} />,
    basePath: "/beams",
    children: [
      { label: "Simply Supported", path: "/beams/simple" },
      { label: "Continuous",       path: "/beams/continuous" },
    ],
  },
  {
    label: "Columns",
    icon: <RectangleVertical size={15} />,
    basePath: "/columns",
    children: [
      { label: "Single Column", path: "/columns" },
    ],
  },
  {
    label: "Slabs",
    icon: <Grid3x3 size={15} />,
    basePath: "/slabs",
    children: [
      { label: "One-Way",   path: "/slabs/one-way" },
      { label: "Two-Way",   path: "/slabs/two-way" },
      { label: "Flat Slab", path: "/slabs/flat-slab" },
    ],
  },
  {
    label: "Foundations",
    icon: <Building2 size={15} />,
    basePath: "/foundations",
    children: [
      { label: "Pad Foundation", path: "/foundations/pad" },
    ],
  },
];

function NavGroupItem({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold
                   text-slate-400 dark:text-slate-500
                   hover:text-slate-600 dark:hover:text-slate-300
                   hover:bg-slate-100 dark:hover:bg-slate-800/60
                   transition-colors uppercase tracking-widest"
      >
        <span>{group.icon}</span>
        <span className="flex-1 text-left">{group.label}</span>
        {open
          ? <ChevronDown size={11} />
          : <ChevronRight size={11} />}
      </button>

      {open && (
        <div className="ml-3 border-l border-slate-200 dark:border-slate-700/60 pl-3 space-y-0.5 mb-1">
          {group.children.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "block px-3 py-1.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-orange-500 text-white font-semibold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60",
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
    <aside className="w-60 shrink-0 flex flex-col
                      bg-white dark:bg-[#0D1117]
                      border-r border-slate-200 dark:border-slate-800
                      overflow-y-auto">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-black">SC</span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">StructCore</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">BS8110 Design Suite</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {NAV.map((group) => (
          <NavGroupItem key={group.basePath} group={group} />
        ))}
      </nav>

      {/* Settings */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
              isActive
                ? "bg-orange-500 text-white font-semibold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60",
            )
          }
        >
          <Settings size={14} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
