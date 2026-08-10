"use client";
import type { PipelineStage } from "@/types";
import { cn } from "@/lib/cn";
import { ProvenanceChip } from "./ProvenanceChip";
import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";

interface Props {
  stage: PipelineStage;
  index: number;
}

export function StageRow({ stage, index }: Props) {
  const [open, setOpen] = useState(false);
  const dur = stage.endedAt && stage.startedAt
    ? ((stage.endedAt - stage.startedAt) / 1000).toFixed(1)
    : null;

  const iconColor =
    stage.status === "complete"
      ? "bg-pass text-card"
      : stage.status === "failed"
        ? "bg-fail text-card"
        : stage.status === "running"
          ? "bg-blueprint text-card"
          : "bg-rule text-slate";

  const Icon =
    stage.status === "complete"
      ? Check
      : stage.status === "failed"
        ? X
        : stage.status === "running"
          ? Loader2
          : null;

  return (
    <div
      className={cn(
        "border border-rule rounded-sm bg-card overflow-hidden transition-colors",
        stage.status === "running" && "border-blueprint/40",
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-paper text-left"
      >
        <span
          className={cn(
            "grid place-items-center h-6 w-6 rounded-full text-[10px] font-mono font-medium",
            iconColor,
          )}
        >
          {Icon ? (
            <Icon size={12} className={stage.status === "running" ? "animate-spin" : ""} />
          ) : (
            index + 1
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-[13px] text-ink font-medium">
              {stage.name}
            </div>
            <ProvenanceChip provenance={stage.provenance} />
          </div>
          {stage.summary && (
            <div className="text-[11px] text-slate mt-0.5 truncate">
              {stage.summary}
            </div>
          )}
        </div>
        {dur && (
          <span className="font-mono text-[11px] text-slate-2">{dur}s</span>
        )}
      </button>
      {open && stage.log.length > 0 && (
        <div className="border-t border-rule bg-ink text-card/80 font-mono text-[11px] p-3 max-h-[220px] overflow-y-auto">
          {stage.log.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap leading-relaxed">
              <span className="text-slate mr-2">
                {String(i + 1).padStart(3, "0")}
              </span>
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
