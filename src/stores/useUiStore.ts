"use client";
import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  density: "cozy" | "compact";
  commandOpen: boolean;
  toggleSidebar: () => void;
  setDensity: (d: "cozy" | "compact") => void;
  setCommandOpen: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  density: "cozy",
  commandOpen: false,
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setDensity: (density) => set({ density }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
}));
