import { Skeleton } from "@/components/ui/skeleton";

export function ChatPageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden rounded-2xl border">
      <div className="hidden w-72 shrink-0 flex-col gap-2 border-r p-3 sm:flex">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-lg p-2">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="mt-1.5 h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className={`h-10 rounded-2xl ${index % 2 === 0 ? "w-2/3 self-start" : "w-1/2 self-end"}`}
          />
        ))}
      </div>
    </div>
  );
}
