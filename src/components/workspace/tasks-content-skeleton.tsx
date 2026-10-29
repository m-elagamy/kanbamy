import { Skeleton } from "@/components/ui/skeleton";

export default function TasksContentSkeleton() {
  return (
    <>
      <div className="mb-6 flex shrink-0 flex-col gap-3 sm:mb-7 md:flex-row md:items-center md:justify-between">
        <div className="scrollbar-hide flex shrink-0 gap-2 overflow-hidden">
          {["w-24", "w-28", "w-32", "w-16", "w-28"].map((width, index) => (
            <Skeleton
              key={`${width}-${index}`}
              className={`h-8 ${width} shrink-0 rounded-full`}
            />
          ))}
        </div>
        <Skeleton className="h-9 w-44 shrink-0 rounded-md" />
      </div>
      <div className="border-border/80 bg-card/70 divide-border/80 shrink-0 overflow-hidden rounded-xl border shadow-xs">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 border-b p-3.5 last:border-b-0 sm:p-4"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="size-3.5 rounded-xs" />
                <Skeleton className="h-4 w-48 max-w-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-[3px]" />
                <Skeleton className="h-3 w-36 max-w-full" />
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <Skeleton className="size-4 shrink-0" />
          </div>
        ))}
      </div>
    </>
  );
}
