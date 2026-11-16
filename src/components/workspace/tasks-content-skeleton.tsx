import { Skeleton } from "@/components/ui/skeleton";

export default function TasksContentSkeleton() {
  return (
    <>
      <div className="mb-4 flex shrink-0 flex-col gap-3.5">
        <div className="border-border/70 flex items-center gap-4 border-b pb-2.5">
          {["w-20", "w-20", "w-28", "w-14", "w-24"].map((width, index) => (
            <Skeleton
              key={`${width}-${index}`}
              className={`h-4 ${width} shrink-0 rounded-sm`}
            />
          ))}
        </div>
        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:items-center">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-12 shrink-0 rounded-lg" />
        </div>
      </div>
      <div className="border-border/80 bg-card/70 divide-border/70 shrink-0 divide-y overflow-hidden rounded-xl border shadow-xs">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-4.5"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-xs" />
                <Skeleton className="h-4 w-44 sm:w-56" />
              </div>
              <div className="flex shrink-0 items-center gap-1.5 pl-5.5 sm:pl-0">
                <Skeleton className="size-3.5 rounded-[3px]" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex shrink-0 items-center justify-between gap-3">
        <Skeleton className="h-3.5 w-44" />
        <Skeleton className="h-3.5 w-16" />
      </div>
    </>
  );
}
