import { ChevronDown, Ellipsis, ListFilter, Plus, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const BoardHeaderSkeleton = ({
  hasDescription = true,
}: {
  hasDescription?: boolean;
}) => {
  return (
    <section className="border-border/50 bg-background/95 supports-backdrop-filter:bg-background/60 mb-4 shrink-0 border-b backdrop-blur">
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex h-14 min-w-0 items-start gap-3 lg:flex-1">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Skeleton className="mt-0.5 size-10 shrink-0 rounded-lg" />
            <div className="min-w-0 pt-0.5">
              <Skeleton className="h-7 w-36 md:h-8 md:w-48" />
              {hasDescription && (
                <Skeleton className="mt-1 h-5 w-44 animate-none sm:w-72" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(4,auto)] items-center justify-end gap-2 sm:flex sm:justify-end sm:gap-2.5 lg:gap-3">
          <div
            aria-hidden="true"
            className="border-input dark:bg-input/30 flex h-9 min-w-34 shrink-0 items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs max-[639px]:size-9 max-[639px]:min-w-9 max-[639px]:justify-center max-[639px]:gap-0 max-[639px]:p-0"
          >
              <span className="flex items-center gap-2 max-[639px]:gap-0">
              <ListFilter
                size={14}
                className="text-muted-foreground"
                aria-hidden="true"
              />
                <span className="max-[639px]:hidden">All priorities</span>
            </span>
            <ChevronDown
                className="text-muted-foreground size-4 opacity-50 max-[639px]:hidden"
              aria-hidden="true"
            />
          </div>
          <div
            aria-hidden="true"
            className={buttonVariants({
              variant: "outline",
                className:
                "text-muted-foreground h-9 min-w-0 justify-start gap-2 pr-2 pl-3 text-sm font-normal sm:w-50 md:w-62.5 max-[639px]:size-9 max-[639px]:justify-center max-[639px]:gap-0 max-[639px]:p-0",
            })}
          >
            <Search size={14} />
            <span className="min-w-0 flex-1 truncate text-left max-[639px]:hidden">
              Search tasks...
            </span>
            <kbd className="bg-muted pointer-events-none hidden rounded border px-1.5 py-0.5 font-mono text-[0.625rem] select-none md:inline-flex">
              Ctrl/Cmd K
            </kbd>
          </div>
          <div
            aria-hidden="true"
              className={buttonVariants({ className: "max-[639px]:size-9 max-[639px]:gap-0 max-[639px]:p-0 shrink-0" })}
          >
            <Plus size={16} />
            <span className="max-[639px]:hidden">Add task</span>
          </div>
          <div
            aria-hidden="true"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "size-8",
            })}
          >
            <Ellipsis />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardHeaderSkeleton;
