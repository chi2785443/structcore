import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-[#0D1117]">
        <Outlet />
      </main>
    </div>
  );
}
