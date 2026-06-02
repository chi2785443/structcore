import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BeamInputs, BeamDesignResult, ContinuousBeamDesignResult } from "@/types";
import { designSimplySupported } from "@/engine";
import { designContinuousBeam } from "@/engine";

const DEFAULT_INPUTS: BeamInputs = {
  supportType: "simply-supported",
  spans: [{ id: "span-1", length: 6, udl: 0 }],
  b: 250,
  h: 450,
  cover: 25,
  barDia: 16,
  linkDia: 8,
  fcu: 30,
  fy: 460,
  fyv: 250,
  gk: 15,
  qk: 10,
  exposureClass: "mild",
  fireResistance: 1,
};

interface BeamStore {
  inputs: BeamInputs;
  ssResult: BeamDesignResult | null;
  contResult: ContinuousBeamDesignResult | null;
  isDirty: boolean;

  updateInput: <K extends keyof BeamInputs>(key: K, value: BeamInputs[K]) => void;
  addSpan: () => void;
  removeSpan: (id: string) => void;
  updateSpan: (id: string, field: keyof import("@/types").BeamSpan, value: number) => void;
  runDesign: () => void;
  reset: () => void;
}

export const useBeamStore = create<BeamStore>()(
  persist(
    (set, get) => ({
      inputs: DEFAULT_INPUTS,
      ssResult: null,
      contResult: null,
      isDirty: false,

      updateInput: (key, value) =>
        set((s) => ({ inputs: { ...s.inputs, [key]: value }, isDirty: true })),

      addSpan: () =>
        set((s) => ({
          inputs: {
            ...s.inputs,
            spans: [
              ...s.inputs.spans,
              { id: `span-${Date.now()}`, length: 6, udl: 0 },
            ],
          },
          isDirty: true,
        })),

      removeSpan: (id) =>
        set((s) => ({
          inputs: {
            ...s.inputs,
            spans: s.inputs.spans.filter((sp) => sp.id !== id),
          },
          isDirty: true,
        })),

      updateSpan: (id, field, value) =>
        set((s) => ({
          inputs: {
            ...s.inputs,
            spans: s.inputs.spans.map((sp) =>
              sp.id === id ? { ...sp, [field]: value } : sp,
            ),
          },
          isDirty: true,
        })),

      runDesign: () => {
        const { inputs } = get();
        if (inputs.supportType === "simply-supported") {
          const ssResult = designSimplySupported(inputs);
          set({ ssResult, contResult: null, isDirty: false });
        } else {
          const contResult = designContinuousBeam(inputs);
          set({ contResult, ssResult: null, isDirty: false });
        }
      },

      reset: () => set({ inputs: DEFAULT_INPUTS, ssResult: null, contResult: null, isDirty: false }),
    }),
    { name: "structcore-beam", partialize: (s) => ({ inputs: s.inputs }) },
  ),
);
