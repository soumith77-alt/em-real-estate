"use client";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { useSession } from "@/stores/useSession";

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
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const user = useSession((s) => s.user);
  const density = useUiStore((s) => s.density);
  const setDensity = useUiStore((s) => s.setDensity);
  const c = crumbs(pathname);

  return (
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
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2.5 h-9 pl-3 pr-2 border border-rule bg-paper hover:border-blueprint/60 hover:bg-card rounded-md text-[12px] text-slate min-w-[320px] transition-all duration-150"
        >
          <Search size={13} className="text-slate-2" />
          <span className="flex-1 text-left">
            Search properties, tenants, deals…
          </span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-card border border-rule rounded text-slate-2">
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
          <div
            className="h-8 w-8 rounded-full grid place-items-center text-[11px] font-medium text-card shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-know) 0%, var(--accent-acq) 100%)",
            }}
          >
            {user?.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="text-[12px] leading-tight">
            <div className="text-ink font-medium">{user?.name.split(" ")[0]}</div>
            <div className="text-slate-2 text-[10px] capitalize">
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
