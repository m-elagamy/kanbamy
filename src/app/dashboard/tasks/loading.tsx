import { Skeleton } from "@/components/ui/skeleton";
import TasksContentSkeleton from "@/components/workspace/tasks-content-skeleton";

export default function TasksPageLoading() {
  return (
    <main className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
      <div className="mb-4 shrink-0 space-y-2 sm:mb-6">
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <div className="shrink-0">
        <Skeleton className="mb-4 h-9 w-full shrink-0 sm:mb-5" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-6">
        <TasksContentSkeleton />
      </div>
    </main>
  );
}
