import type { MarketTier } from "./property";

export type CriterionGroup =
  | "legal"
  | "physical"
  | "size"
  | "market"
  | "momentum"
  | "mix"
  | "likelihood";

export type Provenance = "deterministic" | "ai";

export interface Criterion {
  id: string;
  number: number;
  name: string;
  group: CriterionGroup;
  provenance: Provenance;
  tiers: MarketTier[];
  rule?: string; // deterministic: the check, in plain words
  guidance?: string; // ai: what the score means
  weight?: number; // default weight in soft ranking (soft only)
}

export interface CriteriaSet {
  id: string;
  name: string;
  tier: MarketTier;
  criteria: Criterion[];
}

export type CriterionResult =
  | {
      kind: "deterministic";
      outcome: "pass" | "fail" | "not-applicable";
      evidence: string;
      sourceDocId?: string;
      sourcePage?: number;
    }
  | {
      kind: "ai";
      score: 1 | 2 | 3 | 4 | 5;
      reasoning: string;
    };

export interface CandidateAssessment {
  retailerId: string;
  results: Record<string, CriterionResult>;
  hardFilterPassed: boolean;
  compositeScore: number;
  rank: number | null;
  headline: string;
}
