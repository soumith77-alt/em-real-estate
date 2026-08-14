"use client";
import { Sparkles } from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { cn } from "@/lib/cn";

export function FloatingChatFAB() {
  const chatOpen = useUiStore((s) => s.chatOpen);
  const setChatOpen = useUiStore((s) => s.setChatOpen);

  if (chatOpen) return null;

  return (
    <button
      onClick={() => setChatOpen(true)}
      aria-label="Ask the workspace agent"
      title="Ask the workspace agent (⌘K)"
      className={cn(
        "fixed bottom-6 right-6 z-40 group inline-flex items-center gap-2 h-12 pl-3 pr-4",
        "rounded-full bg-blueprint text-card shadow-lg hover:bg-blueprint-hover",
        "transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5",
      )}
    >
      <span className="grid place-items-center h-8 w-8 rounded-full bg-card/15">
        <Sparkles size={15} />
      </span>
      <span className="text-[12.5px] font-medium">Ask the agent</span>
      <kbd className="ml-1 font-mono text-[10px] px-1.5 py-0.5 bg-blueprint-hover/70 border border-card/20 rounded text-card/90">
        ⌘K
      </kbd>
    </button>
  );
}
