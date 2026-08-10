"use client";
import { create } from "zustand";

export interface RetailerEdit {
  retailerId: string;
  field: string;
  value: string | number;
  at: string;
  by: string;
}

interface EditsState {
  retailerEdits: Record<string, Record<string, RetailerEdit>>;
  editRetailer: (edit: RetailerEdit) => void;
  clearEdits: () => void;
  count: () => number;
}

export const useEditsStore = create<EditsState>((set, get) => ({
  retailerEdits: {},
  editRetailer: (edit) =>
    set((state) => {
      const forRetailer = { ...(state.retailerEdits[edit.retailerId] ?? {}) };
      forRetailer[edit.field] = edit;
      return {
        retailerEdits: {
          ...state.retailerEdits,
          [edit.retailerId]: forRetailer,
        },
      };
    }),
  clearEdits: () => set({ retailerEdits: {} }),
  count: () => {
    const st = get();
    return Object.values(st.retailerEdits).reduce(
      (sum, r) => sum + Object.keys(r).length,
      0,
    );
  },
}));
