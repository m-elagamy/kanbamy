import { Skeleton } from "@/components/ui/skeleton";
import {
  OverviewContentSkeleton,
  OverviewSearchSkeleton,
} from "@/components/workspace/overview";

export default function DashboardLoading() {
  return (
    <main className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
      <div className="mb-6 flex w-full shrink-0 flex-col items-start gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="mb-1 h-3.5 w-28" />
          <Skeleton className="h-9 w-64 md:h-10 md:w-80" />
          <Skeleton className="mt-1.5 h-4 w-80 max-w-full sm:w-96" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="size-3.5 rounded-full" />
            <Skeleton className="h-4 w-12" />
            <span className="text-muted-foreground/30">•</span>
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg shadow-xs" />
        </div>
      </div>

      <div className="mb-6 shrink-0 sm:mb-8">
        <OverviewSearchSkeleton />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-10 overflow-hidden pb-6 sm:gap-12">
        <OverviewContentSkeleton />
      </div>
    </main>
  );
}
