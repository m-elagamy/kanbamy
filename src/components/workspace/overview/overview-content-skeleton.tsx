import { Skeleton } from "@/components/ui/skeleton";

export function NeedsAttentionItemsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="border-border/80 bg-card flex flex-col justify-between gap-3 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-3.5 rounded-sm" />
              <Skeleton className="h-4 w-44 sm:w-56" />
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Skeleton className="h-3 w-20" />
              <span className="text-muted-foreground/30">•</span>
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="size-4 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OverviewBoardsCardsSkeleton() {
  return (
    <div className="grid max-w-5xl grid-cols-1 gap-4 pt-0.5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="border-border/80 bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm"
        >
          {/* Header: Initial + Title + Arrow */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <Skeleton className="size-7 shrink-0 rounded-md" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="size-4 shrink-0 rounded-sm" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Footer: Columns/Tasks count + Created Date */}
          <div className="border-border/50 mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OverviewContentSkeleton() {
  return (
    <>
      {/* Needs attention */}
      <div className="shrink-0 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        <NeedsAttentionItemsSkeleton />
      </div>

      {/* Boards */}
      <div className="shrink-0 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        <OverviewBoardsCardsSkeleton />
      </div>
    </>
  );
}
