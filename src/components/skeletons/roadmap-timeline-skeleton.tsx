import { Skeleton } from "@/components/ui/skeleton";

export function RoadmapTimelineSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border bg-card p-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="mt-2 h-4 w-32" />
        <div className="mt-5 max-w-md">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="mt-2 h-3 w-40" />
        </div>
      </div>

      {Array.from({ length: 2 }).map((_, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-4">
          <Skeleton className="h-5 w-56" />
          <div className="flex flex-col">
            {Array.from({ length: 3 }).map((_, stepIndex) => (
              <div key={stepIndex} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  {stepIndex < 2 && <Skeleton className="my-1 h-16 w-0.5" />}
                </div>
                <Skeleton className="mb-4 h-16 flex-1 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
