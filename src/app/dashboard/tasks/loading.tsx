import { Skeleton } from "@/components/ui/skeleton";

export default function TasksPageLoading() {
  return (
    <main className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
      <div className="mb-4 shrink-0 space-y-2 sm:mb-6">
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="mb-4 h-9 w-full shrink-0 sm:mb-5" />
      <div className="scrollbar-hide mb-6 flex shrink-0 gap-2 overflow-hidden sm:mb-7">
        {["w-24", "w-28", "w-32", "w-16", "w-28"].map((width, index) => (
          <Skeleton key={`${width}-${index}`} className={`h-8 ${width} shrink-0 rounded-full`} />
        ))}
      </div>
      <div className="border-border/80 bg-background/80 divide-border/80 overflow-hidden rounded-xl border">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 border-b p-3 last:border-b-0 sm:p-4">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 max-w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-[3px]" />
                <Skeleton className="h-3 w-40 max-w-full" />
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-14 rounded-sm" />
            </div>
            <Skeleton className="size-4 shrink-0" />
          </div>
        ))}
      </div>
    </main>
  );
}
