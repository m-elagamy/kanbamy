"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { TasksFilter, TasksSort } from "@/lib/types";
import { buildTasksUrl } from "@/lib/workspace/url";
import TasksSortControl from "./tasks-sort-control";
import { useSearchParams } from "next/navigation";

type TasksFilterNavProps = {
  filters: { value: TasksFilter; label: string }[];
  counts: Record<TasksFilter, number>;
  filter: TasksFilter;
  sort?: TasksSort;
  basePath: string;
  query: string;
};

export default function TasksFilterNav({
  filters,
  counts,
  filter,
  sort = "default",
  basePath,
  query,
}: TasksFilterNavProps) {
  const navRef = useRef<HTMLElement>(null);
  
 useEffect(() => {
  const nav = navRef.current;

  if (!nav) return;

  const activeElement = nav.querySelector<HTMLElement>('[aria-current="page"]');

  activeElement?.scrollIntoView({
    behavior: "smooth",
    inline: "center",
  });
}, [filter]);

  return (
    <div className="mb-6 flex shrink-0 flex-col gap-3 sm:mb-7 md:flex-row md:items-center md:justify-between">
      <div className="relative min-w-0 flex-1">
        <nav
          ref={navRef}
          aria-label="Filter tasks"
          aria-describedby="tasks-filter-hint"
          className="scrollbar-hide flex shrink-0 gap-2 overflow-x-auto"
        >
          {filters.map(({ value, label }) => (
            <Link
              key={value}
              href={buildTasksUrl(basePath, value, 1, query, sort)}
              aria-current={filter === value ? "page" : undefined}
              className={`focus-visible:ring-ring inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none ${filter === value ? "bg-accent text-accent-foreground shadow-xs" : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground"}`}
            >
              <span>{label}</span>
              <span
                className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[11px] font-medium transition-colors ${filter === value ? "bg-background/80 text-foreground shadow-2xs" : "bg-muted/70 text-muted-foreground"}`}
              >
                {counts[value]}
              </span>
            </Link>
          ))}
        </nav>
        <span
          id="tasks-filter-hint"
          className={`pointer-events-none sr-only transition-opacity max-md:not-sr-only max-md:absolute max-md:right-0 max-md:top-0 max-md:flex max-md:h-9 max-md:w-12 max-md:items-center max-md:justify-end max-md:bg-linear-to-l max-md:from-background max-md:via-background/90 max-md:to-transparent max-md:pr-1`}
        >
          <span className="sr-only">Swipe horizontally to see more filters</span>
        </span>
        <button
          type="button"
          aria-label="Show more task filters"
          title="Show more filters"
          onClick={() =>
            navRef.current?.scrollBy({
              left: navRef.current.clientWidth * 0.75,
              behavior: "smooth",
            })
          }
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute right-0 top-0 hidden h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0 max-md:flex"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <TasksSortControl
        basePath={basePath}
        filter={filter}
        sort={sort}
        query={query}
      />
    </div>
  );
}
