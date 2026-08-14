"use client";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useUiStore } from "@/stores/useUiStore";
import { useSession } from "@/stores/useSession";
import { NewDialog } from "./NewDialog";
import { WorkspaceChat } from "@/components/chat/WorkspaceChat";

function crumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((p, i) => ({
    label: p
      .replace(/-/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase()),
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSession((s) => s.user);
  const density = useUiStore((s) => s.density);
  const setDensity = useUiStore((s) => s.setDensity);
  const [newOpen, setNewOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const c = crumbs(pathname);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setChatOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setChatOpen(false);
        setNewOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="h-[60px] border-b border-rule bg-card flex items-center px-6">
        <div className="flex items-center gap-1.5 text-[12px] text-slate">
          {c.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-rule">/</span>}
              <span className={i === c.length - 1 ? "text-ink font-medium" : ""}>
                {crumb.label}
              </span>
            </span>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3 border border-rule bg-card rounded-md text-[12px] text-ink hover:border-blueprint hover:bg-paper transition-all duration-150"
          >
            <Plus size={13} /> New
          </button>

          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2.5 h-9 pl-3 pr-2 bg-blueprint text-card rounded-md text-[12px] font-medium min-w-[300px] hover:bg-blueprint-hover shadow-sm transition-all duration-150"
          >
            <Sparkles size={13} />
            <span className="flex-1 text-left">
              Ask the workspace agent
            </span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-blueprint-hover/70 border border-card/20 rounded text-card/90">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() =>
              setDensity(density === "cozy" ? "compact" : "cozy")
            }
            className="h-9 px-3 border border-rule bg-paper rounded-md text-[11px] uppercase tracking-wide text-slate hover:border-blueprint/60 hover:bg-card transition-all duration-150"
            title="Toggle table density"
          >
            {density === "cozy" ? "Cozy" : "Compact"}
          </button>

          <div className="ml-2 flex items-center gap-2.5 pl-3 border-l border-rule">
            <div className="h-8 w-8 rounded-full grid place-items-center text-[11px] font-medium bg-blueprint text-card shadow-sm">
              {user?.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="text-[12px] leading-tight">
              <div className="text-ink font-medium">
                {user?.name.split(" ")[0]}
              </div>
              <div className="text-slate-2 text-[10px] capitalize">
                {user?.role}
              </div>
            </div>
          </div>
        </div>
      </header>
      <NewDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onNavigate={(href) => {
          setNewOpen(false);
          router.push(href);
        }}
      />
      <WorkspaceChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
