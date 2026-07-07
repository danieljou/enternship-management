import { Skeleton } from "@/components/ui/skeleton";

export function TablePageSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="flex items-center gap-4 border-b bg-muted/30 px-4 py-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-b-0">
            {Array.from({ length: 5 }).map((_, cellIndex) => (
              <Skeleton key={cellIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
