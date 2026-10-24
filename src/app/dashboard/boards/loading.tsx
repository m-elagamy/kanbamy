import { Skeleton } from "@/components/ui/skeleton";
import BoardsContentSkeleton from "@/components/workspace/boards-content-skeleton";

export default function BoardsPageLoading() {
  return (
    <main className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
      <div className="mb-4 shrink-0 sm:mb-6">
        <Skeleton className="mb-3 h-4 w-32" />
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      <div className="shrink-0">
        <Skeleton className="mb-4 h-9 w-full shrink-0 rounded-md sm:mb-5" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-6">
        <BoardsContentSkeleton />
      </div>
    </main>
  );
}
