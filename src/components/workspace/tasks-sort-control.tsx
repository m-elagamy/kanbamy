"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  CalendarPlus,
  ChevronUp,
  Clock3,
  LoaderCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import type { TasksFilter, TasksSort } from "@/lib/types";
import { TASK_SORTS } from "@/lib/workspace/constants";
import { buildTasksUrl } from "@/lib/workspace/url";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TasksSortControlProps {
  basePath: string;
  filter: TasksFilter;
  sort: TasksSort;
  query: string;
}

const SORT_ICON_META: Record<
  TasksSort,
  { icon: LucideIcon; iconClassName: string }
> = {
  default: {
    icon: ArrowUpDown,
    iconClassName: "text-muted-foreground",
  },
  newest: {
    icon: CalendarPlus,
    iconClassName: "text-sky-400/75",
  },
  "oldest-in-column": {
    icon: Clock3,
    iconClassName: "text-amber-500/80",
  },
  "priority-desc": {
    icon: ChevronUp,
    iconClassName: "text-destructive/80",
  },
};

export default function TasksSortControl({
  basePath,
  filter,
  sort,
  query,
}: TasksSortControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const selectedSort =
    TASK_SORTS.find((option) => option.value === sort) ?? TASK_SORTS[0];
  const { icon: SelectedIcon, iconClassName: selectedIconClassName } =
    SORT_ICON_META[selectedSort.value];
  const canClear = sort !== "default";

  const handleSortChange = (nextValue: string) => {
    const nextSort = nextValue as TasksSort;
    if (nextSort === sort) return;

    startTransition(() => {
      router.replace(buildTasksUrl(basePath, filter, 1, query, nextSort), {
        scroll: false,
      });
    });
  };

  return (
    <div className="relative self-start sm:self-auto">
      <Select value={sort} onValueChange={handleSortChange}>
        <SelectTrigger
          className="shrink-0"
          aria-label="Sort tasks"
          aria-busy={isPending}
        >
          <SelectValue>
            <span className="flex items-center gap-2">
              {isPending ? (
                <LoaderCircle
                  size={14}
                  className="text-muted-foreground animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <SelectedIcon
                  size={14}
                  className={selectedIconClassName}
                  aria-hidden="true"
                />
              )}
              <span>{selectedSort.label}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end" className="min-w-48">
          <SelectGroup>
            <SelectLabel>Sort by</SelectLabel>
            <SelectItem value="default" className="py-2">
              <div className="flex items-center gap-2">
                <ArrowUpDown
                  size={14}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
                <span>{TASK_SORTS[0].label}</span>
              </div>
            </SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup className="space-y-0.5">
            {TASK_SORTS.slice(1).map(({ value, label }) => {
              const { icon: Icon, iconClassName } = SORT_ICON_META[value];
              return (
                <SelectItem key={value} value={value} className="py-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      size={14}
                      className={iconClassName}
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
      {canClear && (
        <button
          type="button"
          className="bg-background text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring absolute -top-2 -right-2 z-20 flex size-5 items-center justify-center rounded-full border shadow-sm transition-colors focus-visible:ring-2"
          aria-label="Reset sort order"
          title="Reset sort order"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleSortChange("default");
          }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
