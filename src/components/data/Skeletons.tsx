import { cn } from "@/lib/cn";

export function SkeletonLine({
  className,
  w = "100%",
  h = 12,
}: {
  className?: string;
  w?: number | string;
  h?: number;
}) {
  return (
    <div
      className={cn("skeleton", className)}
      style={{ width: typeof w === "number" ? `${w}px` : w, height: h }}
    />
  );
}

export function SkeletonBlock({
  className,
  h = 60,
}: {
  className?: string;
  h?: number;
}) {
  return (
    <div className={cn("skeleton rounded-sm", className)} style={{ height: h }} />
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <SkeletonLine h={28} w={280} />
      <div className="space-y-1 mt-4">
        {Array.from({ length: rows }, (_, i) => (
          <SkeletonBlock key={i} h={36} />
        ))}
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="bg-card border border-rule rounded-sm p-4 space-y-2">
      <SkeletonLine w={80} h={10} />
      <SkeletonLine w={120} h={26} />
      <SkeletonLine w={140} h={10} />
    </div>
  );
}
