"use client";
import { create } from "zustand";

interface SessionUser {
  name: string;
  email: string;
  role: "owner" | "analyst" | "read-only";
}

interface SessionState {
  user: SessionUser | null;
  signIn: (email: string) => void;
  signOut: () => void;
}

export const useSession = create<SessionState>((set) => ({
  user: {
    name: "Kyle Robitaille",
    email: "kyle@emrealestate.ca",
    role: "owner",
  },
  signIn: (email) =>
    set({
      user: { name: "Kyle Robitaille", email, role: "owner" },
    }),
  signOut: () => set({ user: null }),
}));
