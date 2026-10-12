"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { TasksFilter } from "@/lib/types";

type TasksFilterNavProps = {
  filters: { value: TasksFilter; label: string }[];
  counts: Record<TasksFilter, number>;
  filter: TasksFilter;
  basePath: string;
  query: string;
};

function tasksHref(
  basePath: string,
  filter: TasksFilter,
  page = 1,
  query = "",
) {
  const params = new URLSearchParams({ page: String(page) });
  if (filter !== "all") params.set("attention", filter);
  if (query) params.set("q", query);
  return `${basePath}/tasks?${params.toString()}`;
}

export default function TasksFilterNav({
  filters,
  counts,
  filter,
  basePath,
  query,
}: TasksFilterNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateScrollState = () => {
      setCanScrollRight(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 1);
    };

    updateScrollState();
    nav.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      nav.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [filters, counts]);

  return (
    <div className="relative -mx-1 min-w-0">
      <nav
        ref={navRef}
        aria-label="Filter tasks"
        aria-describedby="tasks-filter-hint"
        className="scrollbar-hide mb-6 flex shrink-0 gap-2 overflow-x-auto px-1 sm:mb-7"
      >
        {filters.map(({ value, label }) => (
          <Link
            key={value}
            href={tasksHref(basePath, value, 1, query)}
            aria-current={filter === value ? "page" : undefined}
            className={`focus-visible:ring-ring shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${filter === value ? "bg-accent text-accent-foreground shadow-xs" : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground"}`}
          >
            <span>{label}</span>
            <span
              className={`ml-1 text-xs font-normal ${filter === value ? "text-foreground/70" : "text-muted-foreground/70"}`}
            >
              {counts[value]}
            </span>
          </Link>
        ))}
      </nav>
      <span
        id="tasks-filter-hint"
        className="pointer-events-none sr-only max-md:not-sr-only max-md:absolute max-md:right-0 max-md:top-0 max-md:flex max-md:h-9 max-md:w-12 max-md:items-center max-md:justify-end max-md:bg-gradient-to-l max-md:from-background max-md:via-background/90 max-md:to-transparent max-md:pr-1"
      >
        <span className="sr-only">Swipe horizontally to see more filters</span>
      </span>
      <button
        type="button"
        aria-label="Show more task filters"
        title="Show more filters"
        disabled={!canScrollRight}
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
  );
}
