"use client";
import type { PipelineStage } from "@/types";
import { cn } from "@/lib/cn";
import { ProvenanceChip } from "./ProvenanceChip";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { useState } from "react";

interface Props {
  stage: PipelineStage;
  index: number;
}

export function StageRow({ stage, index }: Props) {
  const [open, setOpen] = useState(false);
  const dur =
    stage.endedAt && stage.startedAt
      ? ((stage.endedAt - stage.startedAt) / 1000).toFixed(1)
      : null;

  const iconBg =
    stage.status === "complete"
      ? "bg-pass text-card"
      : stage.status === "failed"
        ? "bg-fail text-card"
        : stage.status === "running"
          ? "bg-blueprint text-card"
          : "bg-paper text-slate border border-rule";

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
        "card overflow-hidden transition-all duration-150 relative",
        stage.status === "running" && "border-blueprint/40",
      )}
    >
      {stage.status === "running" && (
        <span className="absolute left-0 top-0 bottom-0 w-[3px] running-shimmer" />
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-paper/60 text-left transition-colors"
      >
        <span
          className={cn(
            "grid place-items-center h-7 w-7 rounded-full text-[10px] font-mono font-medium shrink-0 transition-colors",
            iconBg,
          )}
        >
          {Icon ? (
            <Icon
              size={13}
              className={stage.status === "running" ? "animate-spin" : ""}
            />
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
          <span className="font-mono text-[11px] text-slate-2 shrink-0">
            {dur}s
          </span>
        )}
        {stage.log.length > 0 && (
          <ChevronDown
            size={13}
            className={cn(
              "text-slate-2 transition-transform shrink-0",
              open && "rotate-180",
            )}
          />
        )}
      </button>
      {open && stage.log.length > 0 && (
        <div className="relative border-t border-rule bg-ink text-card/85 font-mono text-[11px] max-h-[240px] overflow-y-auto">
          <div className="p-3.5 space-y-0.5">
            {stage.log.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap leading-relaxed">
                <span className="text-card/40 mr-2 select-none">
                  {String(i + 1).padStart(3, "0")}
                </span>
                {line}
              </div>
            ))}
          </div>
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-6"
            style={{
              background:
                "linear-gradient(180deg, transparent, var(--ink) 100%)",
            }}
          />
        </div>
      )}
    </div>
  );
}
