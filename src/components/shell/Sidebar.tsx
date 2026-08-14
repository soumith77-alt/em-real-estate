"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/useUiStore";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderArchive,
  LayoutDashboard,
  Library,
  Settings,
  Store,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  accent?: "acq" | "lea" | "know";
  children?: { href: string; label: string }[];
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    heading: "Overview",
    items: [{ href: "/home", label: "Today", icon: LayoutDashboard }],
  },
  {
    heading: "Agents",
    items: [
      { href: "/acquisitions", label: "Acquisitions", icon: Building2, accent: "acq" },
      {
        href: "/leasing",
        label: "Leasing",
        icon: Store,
        accent: "lea",
        children: [
          { href: "/leasing", label: "Tenant search" },
          { href: "/leasing/renewals", label: "Renewals" },
          { href: "/leasing/expiry-watch", label: "Expiry watch" },
        ],
      },
    ],
  },
  {
    heading: "Reference",
    items: [
      { href: "/vault", label: "Vault", icon: FolderArchive },
      {
        href: "/knowledge",
        label: "Knowledge",
        icon: Library,
        accent: "know",
        children: [
          { href: "/knowledge/properties", label: "Properties" },
          { href: "/knowledge/retailers", label: "Retailers" },
          { href: "/knowledge/criteria", label: "Criteria" },
          { href: "/knowledge/rules", label: "Rules" },
        ],
      },
      { href: "/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    heading: "System",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

const accentBar: Record<NonNullable<NavItem["accent"]>, string> = {
  acq: "bg-accent-acq",
  lea: "bg-accent-lea",
  know: "bg-accent-know",
};

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 bg-ink text-card border-r border-black/20 transition-[width] duration-200",
        collapsed ? "w-[60px]" : "w-[232px]",
      )}
    >
      <div className="h-[60px] flex items-center px-4 border-b border-white/[0.06]">
        <div className="grid place-items-center h-8 w-8 rounded-md bg-card font-display text-ink text-[13px] font-medium leading-none">
          <span className="inline-flex items-center gap-[3px]">
            <span>e</span>
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--blueprint)" }}
            />
            <span>m</span>
          </span>
        </div>
        {!collapsed && (
          <div className="ml-2.5 leading-none">
            <div className="font-display text-[13px] font-medium tracking-tight text-card">
              EM Real Estate
            </div>
            <div className="text-[10px] uppercase tracking-widest text-card/50 mt-0.5">
              Private workspace
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {groups.map((g, gi) => (
          <div key={g.heading} className={cn(gi > 0 && "mt-4")}>
            {!collapsed && (
              <div className="px-4 mb-1.5 text-[10px] uppercase tracking-[0.14em] text-card/40 font-medium">
                {g.heading}
              </div>
            )}
            {g.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/home" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <div key={item.href} className="mb-0.5 relative">
                  {active && item.accent && (
                    <span
                      className={cn(
                        "absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-sm",
                        accentBar[item.accent],
                      )}
                    />
                  )}
                  {active && !item.accent && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-sm bg-card/80" />
                  )}
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center h-9 px-4 text-[13px] transition-colors gap-2.5",
                      active
                        ? "bg-white/[0.06] text-card"
                        : "text-card/70 hover:text-card hover:bg-white/[0.04]",
                    )}
                  >
                    <Icon
                      size={14}
                      className={cn(
                        "shrink-0",
                        active ? "opacity-100" : "opacity-70",
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                  {!collapsed && active && item.children && (
                    <div className="ml-9 border-l border-white/10 pl-3 mt-0.5 mb-1.5 space-y-0.5">
                      {item.children.map((c) => {
                        const cActive = pathname === c.href;
                        return (
                          <Link
                            key={c.href}
                            href={c.href}
                            className={cn(
                              "block h-7 px-2 text-[12px] leading-7 rounded-md transition-colors",
                              cActive
                                ? "text-card bg-white/[0.08]"
                                : "text-card/55 hover:text-card",
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
          </div>
        ))}
      </nav>

      <button
        onClick={toggle}
        className="h-10 border-t border-white/[0.06] text-card/50 hover:text-card flex items-center justify-center"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
