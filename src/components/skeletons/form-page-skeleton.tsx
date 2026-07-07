import { Skeleton } from "@/components/ui/skeleton";

export function FormPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="max-w-2xl rounded-2xl border bg-card p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-9 w-40 rounded-md" />
      </div>
    </div>
  );
}
