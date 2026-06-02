import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PadFoundationInputs, PadFoundationDesignResult } from "@/types";
import { designPadFoundation } from "@/engine";

const DEFAULT_INPUTS: PadFoundationInputs = {
  N: 800,
  Mx: 20,
  My: 0,
  columnB: 300,
  columnH: 300,
  padB: 2.0,
  padL: 2.0,
  h: 400,
  cover: 40,
  barDia: 16,
  fcu: 30,
  fy: 460,
  Fb: 150,
  concreteGamma: 24,
  soilDensity: 18,
  soilDepth: 0.5,
};

interface FoundationStore {
  inputs: PadFoundationInputs;
  result: PadFoundationDesignResult | null;
  isDirty: boolean;
  updateInput: <K extends keyof PadFoundationInputs>(key: K, value: PadFoundationInputs[K]) => void;
  runDesign: () => void;
  reset: () => void;
}

export const useFoundationStore = create<FoundationStore>()(
  persist(
    (set, get) => ({
      inputs: DEFAULT_INPUTS,
      result: null,
      isDirty: false,
      updateInput: (key, value) =>
        set((s) => ({ inputs: { ...s.inputs, [key]: value }, isDirty: true })),
      runDesign: () => {
        const result = designPadFoundation(get().inputs);
        set({ result, isDirty: false });
      },
      reset: () => set({ inputs: DEFAULT_INPUTS, result: null, isDirty: false }),
    }),
    { name: "structcore-foundation", partialize: (s) => ({ inputs: s.inputs }) },
  ),
);
