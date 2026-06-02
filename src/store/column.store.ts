import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ColumnInputs, ColumnDesignResult } from "@/types";
import { designColumn } from "@/engine";

const DEFAULT_INPUTS: ColumnInputs = {
  h: 300,
  b: 300,
  lo: 3500,
  fcu: 30,
  fy: 460,
  cover: 25,
  barDia: 20,
  N: 1000,
  Mx: 50,
  My: 0,
  isBraced: true,
};

interface ColumnStore {
  inputs: ColumnInputs;
  result: ColumnDesignResult | null;
  isDirty: boolean;
  updateInput: <K extends keyof ColumnInputs>(key: K, value: ColumnInputs[K]) => void;
  runDesign: () => void;
  reset: () => void;
}

export const useColumnStore = create<ColumnStore>()(
  persist(
    (set, get) => ({
      inputs: DEFAULT_INPUTS,
      result: null,
      isDirty: false,
      updateInput: (key, value) =>
        set((s) => ({ inputs: { ...s.inputs, [key]: value }, isDirty: true })),
      runDesign: () => {
        const result = designColumn(get().inputs);
        set({ result, isDirty: false });
      },
      reset: () => set({ inputs: DEFAULT_INPUTS, result: null, isDirty: false }),
    }),
    { name: "structcore-column", partialize: (s) => ({ inputs: s.inputs }) },
  ),
);
