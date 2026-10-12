import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AddColumnCard from "./add-column-card";

type ColumnSkeletonProps = {
  columnsNumber: number;
  tasksPerColumn: number[];
};

export default function ColumnSkeleton({
  columnsNumber,
  tasksPerColumn,
}: ColumnSkeletonProps) {
  const visibleColumns = Math.min(columnsNumber, 4);

  const taskCounts = tasksPerColumn
    ? tasksPerColumn.map((count) => (count === 0 ? 0 : Math.min(count, 3)))
    : Array(visibleColumns).fill(1);

  return (
    <div className="scrollbar-thumb-border flex h-full min-h-0 min-w-0 flex-1 snap-x snap-proximity scroll-px-3 gap-3 overflow-x-auto px-3 pb-4 sm:scroll-px-4 sm:gap-4 sm:px-4 md:snap-none md:justify-start">
      {Array.from({ length: visibleColumns }).map((_, columnIndex) => (
        <Card
          key={columnIndex}
          className="board-lane border-border/70 relative h-full min-h-0 w-[calc(100vw-4.5rem)] max-w-72 shrink-0 snap-start gap-0 overflow-hidden rounded-lg border py-0 md:w-[var(--board-column-width)] md:max-w-none"
        >
          <div className="bg-muted/30 dark:bg-muted/20 flex min-h-14 items-center justify-between border-b p-4 pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-7 rounded-md" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </div>

          <div className="grow space-y-2.5 overflow-hidden p-3">
            {Array.from({ length: taskCounts[columnIndex] }).map(
              (_, taskIndex) => (
                <Card
                  key={taskIndex}
                  className="border-border/80 border-s-border/50 bg-card min-h-20 gap-0 rounded-lg border-s-2 px-3 py-2 shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/5" />
                        {taskIndex % 2 === 0 && (
                          <>
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-4/5" />
                          </>
                        )}
                      </div>
                      <Skeleton className="size-6 rounded-md" />
                    </div>
                    <div className="flex min-h-5 items-center justify-between gap-3">
                      <Skeleton className="h-3 w-14" />
                      <Skeleton className="size-4 rounded-sm" />
                    </div>
                  </div>
                </Card>
              ),
            )}
          </div>
        </Card>
      ))}
      <AddColumnCard />
    </div>
  );
}
