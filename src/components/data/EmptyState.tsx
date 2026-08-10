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
        "border border-dashed border-rule rounded-sm bg-card/40 p-8 text-center",
        className,
      )}
    >
      <div className="font-display text-[15px] font-medium text-ink">
        {title}
      </div>
      {body && (
        <div className="text-[13px] text-slate mt-1.5 max-w-md mx-auto">
          {body}
        </div>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex h-9 px-4 items-center bg-blueprint text-card rounded-sm text-[13px] font-medium hover:bg-blueprint-hover"
        >
          {action.label}
        </Link>
      )}
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex h-9 px-4 items-center bg-blueprint text-card rounded-sm text-[13px] font-medium hover:bg-blueprint-hover"
        >
          {actionLabel ?? "Continue"}
        </button>
      )}
    </div>
  );
}
