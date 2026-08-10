"use client";
import { useEffect, useState } from "react";
import type { PipelineStage } from "@/types";
import { StageRow } from "./StageRow";
import { runPipeline } from "@/mock/api/acquisitions";
import { toast } from "sonner";

interface Props {
  dealId: string;
  onComplete?: () => void;
}

const INITIAL: PipelineStage[] = [
  { id: "s1", name: "Classify asset type", provenance: "ai", status: "pending", log: [] },
  { id: "s2", name: "Extract rent roll and financials", provenance: "deterministic", status: "pending", log: [] },
  { id: "s3", name: "Research the town and market", provenance: "ai", status: "pending", log: [] },
  { id: "s4", name: "Find comparable sales", provenance: "ai", status: "pending", log: [] },
  { id: "s5", name: "Assemble red flags", provenance: "ai", status: "pending", log: [] },
  { id: "s6", name: "Build the financing scenario", provenance: "deterministic", status: "pending", log: [] },
];

export function PipelineRunner({ dealId, onComplete }: Props) {
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setStages(INITIAL);
    for await (const evt of runPipeline(dealId)) {
      setStages((prev) =>
        prev.map((s) =>
          s.id === evt.stageId
            ? {
                ...s,
                status: evt.status ?? s.status,
                summary: evt.summary ?? s.summary,
                log: evt.log ? [...s.log, evt.log] : s.log,
                startedAt: evt.status === "running" ? Date.now() : s.startedAt,
                endedAt:
                  evt.status === "complete" || evt.status === "failed"
                    ? Date.now()
                    : s.endedAt,
              }
            : s,
        ),
      );
    }
    setRunning(false);
    toast.success("Underwriting complete");
    onComplete?.();
  }

  const anyRunning = stages.some((s) => s.status === "running");
  const allDone = stages.every((s) => s.status === "complete");

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={run}
          disabled={running || anyRunning}
          className="h-10 px-5 bg-blueprint text-card rounded-sm text-[13px] font-medium hover:bg-blueprint-hover disabled:opacity-50"
        >
          {allDone ? "Re-run underwriting" : running ? "Running…" : "Run underwriting"}
        </button>
        <span className="text-[11px] text-slate">
          Every step is triggered by you. Nothing runs on its own.
        </span>
      </div>

      <ol className="space-y-2">
        {stages.map((s, i) => (
          <li key={s.id}>
            <StageRow stage={s} index={i} />
          </li>
        ))}
      </ol>
    </div>
  );
}
