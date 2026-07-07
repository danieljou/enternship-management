import { Skeleton } from "@/components/ui/skeleton";

export function DetailTabsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="mb-3 h-4 w-32" />
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 border-t pt-5 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
