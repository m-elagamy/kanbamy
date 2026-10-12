import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 pt-0.5">
      {/* Greeting Header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="mb-1 h-4 w-28" />
          <Skeleton className="h-9 w-72 md:h-10 md:w-96" />
          <Skeleton className="mt-1.5 h-5 w-96 max-w-full" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-1 py-1.5">
            <Skeleton className="size-3.5 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* Search + Open Tasks */}
      <div className="flex w-full flex-col gap-2">
        <Skeleton className="h-11 w-full rounded-md" />
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-10 sm:gap-12">
        {/* Needs attention */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="border-border/80 bg-background flex flex-wrap items-center gap-3 rounded-xl border p-4 shadow-sm sm:p-5">
            <Skeleton className="size-8 shrink-0" />
            <div className="min-w-0 flex-1 basis-40 space-y-0.5">
              <Skeleton className="h-5 w-48 max-w-full" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Boards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
          </div>
          <div className="grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="border-border/80 bg-card flex flex-col gap-3 rounded-xl border p-4 pr-12 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <Skeleton className="size-7 shrink-0 rounded-md" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                  <Skeleton className="size-4 shrink-0" />
                </div>
                <div>
                  <Skeleton className="h-5 w-4/5" />
                </div>
                <div className="border-border/50 mt-auto flex gap-3 border-t pt-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
