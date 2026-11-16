"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import type { TasksFilter, TasksSort } from "@/lib/types";
import { buildTasksUrl } from "@/lib/workspace/url";
import TasksSearch from "./tasks-search";
import TasksSortControl from "./tasks-sort-control";

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
    <div className="mb-4 flex shrink-0 flex-col gap-3.5">
      <div className="border-border/70 relative border-b">
        <nav
          ref={navRef}
          aria-label="Filter tasks"
          aria-describedby="tasks-filter-hint"
          className="scrollbar-hide -mb-px flex items-center gap-1 overflow-x-auto sm:gap-2"
        >
          {filters.map(({ value, label }) => {
            const isActive = filter === value;
            return (
              <Link
                key={value}
                href={buildTasksUrl(basePath, value, 1, query, sort)}
                aria-current={isActive ? "page" : undefined}
                className={`focus-visible:ring-ring relative inline-flex shrink-0 items-center gap-1.5 px-2.5 pb-2.5 pt-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:text-[13px] ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-medium tabular-nums transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/70 text-muted-foreground"
                  }`}
                >
                  {counts[value]}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="tasks-filter-active-indicator"
                    transition={{ type: "spring", bounce: 0.18, duration: 0.35 }}
                    className="bg-primary absolute inset-x-0 bottom-0 h-0.5 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <span
          id="tasks-filter-hint"
          className="pointer-events-none sr-only transition-opacity max-md:not-sr-only max-md:absolute max-md:right-0 max-md:top-0 max-md:flex max-md:h-8 max-md:w-12 max-md:items-center max-md:justify-end max-md:bg-linear-to-l max-md:from-background max-md:via-background/90 max-md:to-transparent max-md:pr-1"
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
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute right-0 top-0 hidden h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0 max-md:flex"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <TasksSearch />
        </div>
        <TasksSortControl
          basePath={basePath}
          filter={filter}
          sort={sort}
          query={query}
        />
      </div>
    </div>
  );
}
