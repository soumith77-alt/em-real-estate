import Link from "next/link";
import { cn } from "@/lib/cn";

interface Props {
  title: string;
  body?: string;
  action?: { label: string; href: string };
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function EmptyState({
  title,
  body,
  action,
  onAction,
  actionLabel,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "border border-dashed border-rule rounded-lg bg-card/60 p-10 text-center",
        className,
      )}
    >
      <div className="font-display text-[16px] font-medium text-ink">
        {title}
      </div>
      {body && (
        <div className="text-[13px] text-slate mt-2 max-w-md mx-auto leading-relaxed">
          {body}
        </div>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex h-10 px-5 items-center bg-blueprint text-card rounded-md text-[13px] font-medium hover:bg-blueprint-hover shadow-sm hover:shadow-md transition-all duration-150"
        >
          {action.label}
        </Link>
      )}
      {onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex h-10 px-5 items-center bg-blueprint text-card rounded-md text-[13px] font-medium hover:bg-blueprint-hover shadow-sm hover:shadow-md transition-all duration-150"
        >
          {actionLabel ?? "Continue"}
        </button>
      )}
    </div>
  );
}
