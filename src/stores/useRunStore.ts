"use client";
import { create } from "zustand";
import type { PipelineRun, PipelineStage } from "@/types";

interface RunState {
  runs: Record<string, PipelineRun>;
  startRun: (dealId: string, stages: PipelineStage[]) => string;
  updateStage: (
    runId: string,
    stageId: string,
    patch: Partial<PipelineStage>,
  ) => void;
  appendLog: (runId: string, stageId: string, line: string) => void;
  finish: (runId: string) => void;
}

let runIdCounter = 1;

export const useRunStore = create<RunState>((set) => ({
  runs: {},
  startRun: (dealId, stages) => {
    const id = `run-${runIdCounter++}`;
    const run: PipelineRun = {
      id,
      dealId,
      startedAt: Date.now(),
      stages: stages.map((s) => ({ ...s, log: [] })),
    };
    set((state) => ({ runs: { ...state.runs, [id]: run } }));
    return id;
  },
  updateStage: (runId, stageId, patch) =>
    set((state) => {
      const run = state.runs[runId];
      if (!run) return state;
      const stages = run.stages.map((s) =>
        s.id === stageId ? { ...s, ...patch } : s,
      );
      return { runs: { ...state.runs, [runId]: { ...run, stages } } };
    }),
  appendLog: (runId, stageId, line) =>
    set((state) => {
      const run = state.runs[runId];
      if (!run) return state;
      const stages = run.stages.map((s) =>
        s.id === stageId ? { ...s, log: [...s.log, line] } : s,
      );
      return { runs: { ...state.runs, [runId]: { ...run, stages } } };
    }),
  finish: (runId) =>
    set((state) => {
      const run = state.runs[runId];
      if (!run) return state;
      return {
        runs: {
          ...state.runs,
          [runId]: { ...run, finishedAt: Date.now() },
        },
      };
    }),
}));
