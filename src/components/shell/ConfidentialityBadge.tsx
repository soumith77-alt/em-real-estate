import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  ndaDate?: string;
  className?: string;
}

export function ConfidentialityBadge({ ndaDate, className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2 rounded-sm bg-ink text-card text-[11px]",
        className,
      )}
    >
      <ShieldCheck size={11} />
      <span className="uppercase tracking-wider">Confidential</span>
      {ndaDate && (
        <span className="text-card/70 font-mono">
          · NDA {ndaDate}
        </span>
      )}
    </div>
  );
}
