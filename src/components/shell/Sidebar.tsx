"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/useUiStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  children?: NavItem[];
}

const nav: NavItem[] = [
  { href: "/home", label: "Today" },
  { href: "/acquisitions", label: "Acquisitions" },
  {
    href: "/leasing",
    label: "Leasing",
    children: [
      { href: "/leasing", label: "Tenant search" },
      { href: "/leasing/renewals", label: "Renewals" },
      { href: "/leasing/expiry-watch", label: "Expiry watch" },
    ],
  },
  { href: "/vault", label: "Vault" },
  {
    href: "/knowledge",
    label: "Knowledge",
    children: [
      { href: "/knowledge/properties", label: "Properties" },
      { href: "/knowledge/retailers", label: "Retailers" },
      { href: "/knowledge/criteria", label: "Criteria" },
      { href: "/knowledge/rules", label: "Rules" },
    ],
  },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 bg-ink text-card border-r border-slate/40 transition-[width] duration-200",
        collapsed ? "w-[56px]" : "w-[220px]",
      )}
    >
      <div className="h-14 flex items-center px-4 border-b border-slate/40">
        <div className="grid place-items-center h-7 w-7 rounded-sm bg-card text-ink font-display font-semibold tracking-tight text-[12px]">
          EM
        </div>
        {!collapsed && (
          <div className="ml-2.5 leading-none">
            <div className="font-display text-[13px] font-medium tracking-tight text-card">
              EM Real Estate
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-2 mt-0.5">
              Workspace
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));
          return (
            <div key={item.href} className="mb-0.5">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center h-8 px-4 text-[13px] transition-colors",
                  active
                    ? "bg-blueprint/30 text-card border-l-2 border-card"
                    : "text-card/75 hover:text-card hover:bg-slate/30 border-l-2 border-transparent",
                )}
              >
                {collapsed ? item.label.slice(0, 1) : item.label}
              </Link>
              {!collapsed && active && item.children && (
                <div className="ml-4 border-l border-slate/40 pl-3 mt-0.5 mb-1.5 space-y-0.5">
                  {item.children.map((c) => {
                    const cActive = pathname === c.href;
                    return (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={cn(
                          "block h-7 px-2 text-[12px] leading-7 rounded-sm transition-colors",
                          cActive
                            ? "text-card bg-slate/40"
                            : "text-card/60 hover:text-card",
                        )}
                      >
                        {c.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button
        onClick={toggle}
        className="h-10 border-t border-slate/40 text-card/60 hover:text-card flex items-center justify-center"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
