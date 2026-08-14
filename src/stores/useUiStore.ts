"use client";
import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  density: "cozy" | "compact";
  chatOpen: boolean;
  toggleSidebar: () => void;
  setDensity: (d: "cozy" | "compact") => void;
  setChatOpen: (v: boolean) => void;
  toggleChat: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  density: "cozy",
  chatOpen: false,
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setDensity: (density) => set({ density }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
}));
