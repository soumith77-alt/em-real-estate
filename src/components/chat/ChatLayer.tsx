"use client";
import { useEffect } from "react";
import { useUiStore } from "@/stores/useUiStore";
import { FloatingChatFAB } from "./FloatingChatFAB";
import { WorkspaceChat } from "./WorkspaceChat";

/**
 * Renders the persistent chat surface: a floating "Ask the agent" button
 * in the bottom-left of the viewport, plus the slide-in chat panel. Both
 * share `chatOpen` state via useUiStore, so the topbar button, the FAB,
 * and the ⌘K shortcut all drive the same panel.
 */
export function ChatLayer() {
  const chatOpen = useUiStore((s) => s.chatOpen);
  const setChatOpen = useUiStore((s) => s.setChatOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setChatOpen(!chatOpen);
      }
      if (e.key === "Escape" && chatOpen) setChatOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen, setChatOpen]);

  return (
    <>
      <FloatingChatFAB />
      <WorkspaceChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
