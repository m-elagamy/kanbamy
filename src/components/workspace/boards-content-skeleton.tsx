import { Skeleton } from "@/components/ui/skeleton";

export default function BoardsContentSkeleton() {
  return (
    <div className="grid max-w-5xl grid-cols-1 gap-4 pt-0.5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="border-border/80 bg-card/60 flex flex-col justify-between rounded-xl border p-4 shadow-xs"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
