import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStore {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
}

function applyClass(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      theme: "light",                       // always default to light

      setTheme: (t) => {
        set({ theme: t });
        applyClass(t === "dark");
      },

      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        applyClass(next === "dark");
      },
    }),
    {
      name: "structcore-v2",                // new key clears stale "dark" preference
      onRehydrateStorage: () => (state) => {
        // Sync the DOM class after Zustand rehydrates from storage
        if (state) applyClass(state.theme === "dark");
      },
    },
  ),
);
