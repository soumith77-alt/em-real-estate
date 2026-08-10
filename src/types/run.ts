import type { Provenance } from "./criteria";

export type StageStatus = "pending" | "running" | "complete" | "failed";

export interface PipelineStage {
  id: string;
  name: string;
  provenance: Provenance;
  status: StageStatus;
  startedAt?: number;
  endedAt?: number;
  log: string[];
  summary?: string;
}

export interface PipelineRun {
  id: string;
  dealId: string;
  startedAt: number;
  stages: PipelineStage[];
  finishedAt?: number;
}

export type SearchStatus = "draft" | "running" | "complete";

export interface SavedSearch {
  id: string;
  unitId: string;
  criteriaSetId: string;
  createdAt: string;
  status: SearchStatus;
  weights?: Record<string, number>; // criterionId → weight
}
