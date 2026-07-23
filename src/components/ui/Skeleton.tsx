import { clsx } from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-lg bg-ink-200/70", className)} />;
}

export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-3">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
