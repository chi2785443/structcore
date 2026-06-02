import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStore {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (t) => {
        set({ theme: t });
        document.documentElement.classList.toggle("dark", t === "dark");
      },
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === "light" ? "dark" : "light";
          document.documentElement.classList.toggle("dark", next === "dark");
          return { theme: next };
        }),
    }),
    { name: "structcore-app" },
  ),
);
