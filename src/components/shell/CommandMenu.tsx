"use client";
import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/stores/useUiStore";
import { search, type SearchResult } from "@/mock/api/search";

export function CommandMenu() {
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const r = await search(q);
      if (!cancel) setResults(r);
    })();
    return () => {
      cancel = true;
    };
  }, [q]);

  if (!open) return null;

  const groups = new Map<string, SearchResult[]>();
  for (const r of results) {
    const arr = groups.get(r.group) ?? [];
    arr.push(r);
    groups.set(r.group, arr);
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-start pt-[15vh] px-4 bg-ink/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <Command
        label="Global search"
        className="w-full max-w-[560px] bg-card border border-rule rounded-sm shadow-lg overflow-hidden"
      >
        <Command.Input
          value={q}
          onValueChange={setQ}
          placeholder="Search properties, tenants, retailers, deals, reports…"
          className="w-full h-11 px-4 border-b border-rule bg-card text-[14px] focus:outline-none placeholder:text-slate-2"
        />
        <Command.List className="max-h-[420px] overflow-y-auto p-1">
          {results.length === 0 && (
            <div className="px-4 py-6 text-[12px] text-slate">
              Nothing matches &ldquo;{q || "…"}&rdquo;.
            </div>
          )}
          {Array.from(groups.entries()).map(([group, items]) => (
            <Command.Group
              key={group}
              heading={group}
              className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1"
            >
              {items.map((r) => (
                <Command.Item
                  key={r.id}
                  value={r.title + r.subtitle}
                  onSelect={() => {
                    router.push(r.href);
                    setOpen(false);
                  }}
                  className="flex items-baseline justify-between gap-3 px-3 py-2 rounded-sm text-[13px] cursor-pointer data-[selected=true]:bg-blueprint/10"
                >
                  <span className="text-ink">{r.title}</span>
                  <span className="text-[11px] text-slate font-mono">
                    {r.subtitle}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
        <div className="px-3 py-2 border-t border-rule text-[10px] text-slate flex items-center justify-between">
          <span>
            <kbd className="font-mono px-1.5 py-0.5 bg-paper border border-rule rounded">
              ↵
            </kbd>{" "}
            to open
          </span>
          <span>
            <kbd className="font-mono px-1.5 py-0.5 bg-paper border border-rule rounded">
              esc
            </kbd>{" "}
            to close
          </span>
        </div>
      </Command>
    </div>
  );
}
