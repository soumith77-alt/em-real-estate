"use client";
import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  density: "cozy" | "compact";
  toggleSidebar: () => void;
  setDensity: (d: "cozy" | "compact") => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  density: "cozy",
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setDensity: (density) => set({ density }),
}));
