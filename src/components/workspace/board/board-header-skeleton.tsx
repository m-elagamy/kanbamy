import { Ellipsis, ListFilter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const BoardHeaderSkeleton = ({
  hasDescription = false,
}: {
  hasDescription?: boolean;
}) => {
  return (
    <section className="border-border/50 bg-background/95 supports-backdrop-filter:bg-background/60 mb-4 shrink-0 border-b backdrop-blur">
      <div className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-h-14 min-w-0 items-start gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Skeleton className="mt-0.5 size-10 shrink-0 rounded-lg" />
            <div className="min-w-0 pt-0.5">
              <Skeleton className="h-[30px] w-36 sm:w-44 rounded-md" />
              {hasDescription && (
                <Skeleton className="mt-1 h-4.5 w-44 animate-none sm:w-72" />
              )}
            </div>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-[1fr_auto] items-center justify-between gap-2 sm:flex sm:items-center sm:gap-2.5 xl:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:contents">
            <Button
              variant="outline"
              size="sm"
              disabled
              tabIndex={-1}
              aria-hidden="true"
              className="h-9 gap-2 border-dashed font-medium pointer-events-none disabled:opacity-100 max-[639px]:size-9 max-[639px]:p-0 max-[639px]:justify-center"
            >
              <ListFilter
                size={14}
                className="text-muted-foreground"
                aria-hidden="true"
              />
              <span className="max-[639px]:hidden">Filters</span>
            </Button>
            <Button
              variant="outline"
              disabled
              tabIndex={-1}
              aria-hidden="true"
              className="text-muted-foreground h-9 min-w-0 justify-start gap-2 pr-2 pl-3 text-sm font-normal pointer-events-none disabled:opacity-100 sm:w-50 md:w-62.5 max-[639px]:size-9 max-[639px]:justify-center max-[639px]:gap-0 max-[639px]:p-0"
            >
              <Search size={14} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-left max-[639px]:hidden">
                Search tasks...
              </span>
              <kbd className="bg-muted pointer-events-none hidden rounded border px-1.5 py-0.5 font-mono text-[0.625rem] select-none md:inline-flex">
                Ctrl/Cmd K
              </kbd>
            </Button>
            <Button
              disabled
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none disabled:opacity-100 max-[639px]:size-9 max-[639px]:shrink-0 max-[639px]:gap-0 max-[639px]:p-0"
              aria-label="Add task"
            >
              <Plus size={16} />
              <span className="max-[639px]:hidden">Add task</span>
            </Button>
          </div>
          <div className="shrink-0">
            <Button
              variant="ghost"
              size="icon"
              disabled
              tabIndex={-1}
              aria-hidden="true"
              className="size-8 pointer-events-none disabled:opacity-100"
            >
              <Ellipsis />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardHeaderSkeleton;
