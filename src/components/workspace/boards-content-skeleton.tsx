import { Skeleton } from "@/components/ui/skeleton";

export default function BoardsContentSkeleton() {
  return (
    <>
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="grid shrink-0 grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="border-border/60 bg-background/80 flex flex-col gap-4 rounded-xl border p-5"
          >
            <div className="flex items-start justify-between gap-6">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="size-4 shrink-0" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="mt-auto flex gap-2 pt-1">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

