import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SlabInputs, SlabDesignResult } from "@/types";
import { designSlab } from "@/engine";

const DEFAULT_INPUTS: SlabInputs = {
  type: "two-way",
  lx: 4,
  ly: 6,
  h: 175,
  cover: 20,
  barDia: 12,
  fcu: 30,
  fy: 460,
  gk: 6,
  qk: 3,
  edgeCondition: "4",
};

interface SlabStore {
  inputs: SlabInputs;
  result: SlabDesignResult | null;
  isDirty: boolean;
  updateInput: <K extends keyof SlabInputs>(key: K, value: SlabInputs[K]) => void;
  runDesign: () => void;
  reset: () => void;
}

export const useSlabStore = create<SlabStore>()(
  persist(
    (set, get) => ({
      inputs: DEFAULT_INPUTS,
      result: null,
      isDirty: false,
      updateInput: (key, value) =>
        set((s) => ({ inputs: { ...s.inputs, [key]: value }, isDirty: true })),
      runDesign: () => {
        const result = designSlab(get().inputs);
        set({ result, isDirty: false });
      },
      reset: () => set({ inputs: DEFAULT_INPUTS, result: null, isDirty: false }),
    }),
    { name: "structcore-slab", partialize: (s) => ({ inputs: s.inputs }) },
  ),
);
