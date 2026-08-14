"use client";
import { Building2, FolderUp, Store, X } from "lucide-react";
import { db } from "@/mock/db";

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
}

export function NewDialog({ open, onClose, onNavigate }: Props) {
  if (!open) return null;

  // Route the "start a search" option at the first vacant unit — Kyle can
  // pick a different one on the search config page.
  const firstVacant = db.units.find(
    (u) => u.status === "vacant" || u.status === "notice-given",
  );
  // Route the acquisitions data-room upload at the open deal by default.
  const openDeal = db.deals.find((d) => d.stage === "data-room-open");
  const options = [
    {
      icon: FolderUp,
      title: "Upload an acquisition data room",
      body: "Drop the broker's folder into the deal-in-flight room. Ingest is staged; scans and password-protected files are surfaced separately.",
      href: openDeal
        ? `/acquisitions/${openDeal.id}/data-room`
        : "/acquisitions",
      accent: "acq",
    },
    {
      icon: Building2,
      title: "Log a new acquisition deal",
      body: "Start a new deal record from a brochure. Broker, asking, cap, bid deadline.",
      href: "/acquisitions",
      accent: "acq",
    },
    {
      icon: Store,
      title: "Start a tenant search",
      body: "Pick a vacant unit and run the criteria set. Deterministic filters + AI-scored ranking.",
      href: firstVacant
        ? `/leasing/search?unit=${firstVacant.id}`
        : "/leasing",
      accent: "lea",
    },
  ] as const;

  const accentBg: Record<"acq" | "lea", string> = {
    acq: "bg-accent-acq-tint text-accent-acq",
    lea: "bg-accent-lea-tint text-accent-lea",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4 bg-ink/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[520px] card overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="flex items-center justify-between px-5 h-12 border-b border-rule">
          <div className="eyebrow">Start something new</div>
          <button
            onClick={onClose}
            className="text-slate-2 hover:text-ink p-1 rounded-md hover:bg-paper"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-2">
          {options.map((o) => {
            const Icon = o.icon;
            return (
              <button
                key={o.title}
                onClick={() => onNavigate(o.href)}
                className="w-full flex items-start gap-3 p-3 rounded-md hover:bg-paper text-left transition-colors"
              >
                <div
                  className={`grid place-items-center h-9 w-9 rounded-md shrink-0 ${accentBg[o.accent]}`}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-ink font-medium">
                    {o.title}
                  </div>
                  <div className="text-[11px] text-slate mt-0.5 leading-snug">
                    {o.body}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-5 py-2.5 border-t border-rule text-[11px] text-slate-2 flex items-center justify-between">
          <span>Every upload lands on infrastructure EM controls.</span>
          <span>Nothing runs until you trigger it.</span>
        </div>
      </div>
    </div>
  );
}
