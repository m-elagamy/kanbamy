import { CircleAlert, SquareKanban } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function NeedsAttentionItemsSkeleton() {
  return (
    <div className="border-border/80 bg-card divide-border/60 overflow-hidden rounded-xl border divide-y shadow-xs">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-start justify-between gap-3 px-4 py-2.5 sm:flex-row sm:items-center"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-3.5 rounded-sm" />
              <Skeleton className="h-5 w-44 sm:w-56" />
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Skeleton className="size-3.5 rounded-[3px]" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-[22px] w-24 rounded-md" />
            <Skeleton className="hidden size-3.5 shrink-0 rounded-sm sm:block" />
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
          className="border-border/80 bg-card flex h-full flex-col gap-3 rounded-xl border p-4 shadow-sm"
        >
          {/* Header: Initial + Title + Arrow */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <Skeleton className="size-7 shrink-0 rounded-md" />
              <Skeleton className="h-[22px] w-32" />
            </div>
            <Skeleton className="size-4 shrink-0 rounded-sm" />
          </div>

          {/* Description */}
          <div className="min-h-10 space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Footer: Columns/Tasks count + Created Date */}
          <div className="border-border/50 mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t pt-3">
            <div className="flex items-center gap-x-3 gap-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-20" />
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
      <section aria-labelledby="focus-heading-skeleton" className="shrink-0 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="focus-heading-skeleton"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <CircleAlert
                  className="text-foreground/60 size-4 shrink-0"
                  aria-hidden="true"
                />
                Needs attention
              </h2>
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Stale work and high-priority tasks across your boards.
            </p>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        <NeedsAttentionItemsSkeleton />
      </section>

      {/* Boards */}
      <section aria-labelledby="boards-heading-skeleton" className="shrink-0 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="boards-heading-skeleton"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <SquareKanban
                  className="text-foreground/60 size-4 shrink-0"
                  aria-hidden="true"
                />
                Your boards
              </h2>
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Choose a board to view and manage its tasks.
            </p>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        <OverviewBoardsCardsSkeleton />
      </section>
    </>
  );
}
