import { Suspense } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  ListTodo,
} from "lucide-react";
import type { TasksFilter, WorkspaceTasksPage } from "@/lib/types";
import { TASKS_PAGE_SIZE, TERMINAL_COLUMN_STATUSES } from "@/lib/constants";
import Pagination from "../components/pagination";
import PriorityIndicator from "../components/task/priority-indicator";
import TaskColumnAge from "../components/task/task-column-age";
import { getBoardIdentity } from "@/lib/utils/board-identity";
import { Skeleton } from "@/components/ui/skeleton";
import TasksSearch from "./tasks-search";
import TasksFilterNav from "./tasks-filter-nav";

export const filters: { value: TasksFilter; label: string }[] = [
  { value: "all", label: "All tasks" },
  { value: "open", label: "Open tasks" },
  { value: "needs-attention", label: "Needs attention" },
  { value: "stale", label: "Stale" },
  { value: "high-priority", label: "High priority" },
];

export const filterValues = new Set<TasksFilter>(
  filters.map(({ value }) => value),
);

export function tasksHref(
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

type TasksPageContentProps = {
  data: WorkspaceTasksPage;
  page: number;
  filter: TasksFilter;
  query: string;
  basePath?: string;
  backHref?: string;
  backLabel?: string;
};

export default function TasksPageContent({
  data,
  page,
  filter,
  query,
  basePath = "/dashboard",
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
}: TasksPageContentProps) {
  const { items, totalCount, counts } = data;
  const totalPages = Math.max(1, Math.ceil(totalCount / TASKS_PAGE_SIZE));

  return (
    <main className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
      <div className="mb-4 shrink-0 sm:mb-6">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-primary mb-3 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Link>
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.25em] uppercase">
            Your workspace
          </p>
          <h1 className="text-[clamp(1.5rem,2.5vw,1.875rem)] font-semibold">Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review work across all of your boards.
          </p>
        </div>
      </div>

      <SuspenseTasksSearch />

      <TasksFilterNav
        filters={filters}
        counts={counts}
        filter={filter}
        basePath={basePath}
        query={query}
      />

      {items.length === 0 ? (
        <div className="border-border/80 bg-background/80 flex flex-col items-center justify-center rounded-xl border px-4 py-12 text-center shadow-sm">
          <p className="text-sm font-medium">No matching tasks</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {query
              ? "Try a different search or filter."
              : filter === "all"
                ? "Create a task on one of your boards to see it here."
                : "Try another filter or return when your workflow changes."}
          </p>
        </div>
      ) : (
        <div className="border-border/80 bg-background/80 divide-border/80 overflow-hidden rounded-xl border shadow-sm">
          {items.map((task) => {
            const isStale =
              task.attentionReason === "stale" ||
              task.attentionReason === "high-priority-stale";
            const AttentionIcon = isStale
              ? Clock3
              : task.attentionReason === "high-priority"
                ? Flag
                : ListTodo;
            const iconStyle = isStale
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : task.attentionReason === "high-priority"
                ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                : "bg-muted/40 text-muted-foreground/80";
            const taskHref =
              basePath === "/demo"
                ? `/demo?focus=${task.id}`
                : `${basePath}/${task.board.slug}?focus=${task.id}`;

            return (
              <Link
                key={task.id}
                href={taskHref}
                className="hover:bg-accent/70 focus-visible:bg-accent/70 focus-visible:ring-ring group flex min-w-0 items-center gap-3 border-b p-3 outline-none last:border-b-0 focus-visible:ring-2 focus-visible:ring-inset sm:p-4"
                aria-label={`Focus ${task.title} in ${task.board.title}, ${task.column.status}, ${task.priority} priority`}
              >
                <span
                  className={`${iconStyle} flex size-9 shrink-0 items-center justify-center rounded-lg`}
                >
                  <AttentionIcon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="text-muted-foreground mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-xs">
                    <span
                      className={`${getBoardIdentity(task.board.title, task.board.id).className} flex size-4 shrink-0 items-center justify-center rounded-[3px] text-[0.625rem] leading-none font-semibold`}
                      aria-hidden="true"
                    >
                      {getBoardIdentity(task.board.title, task.board.id).initial}
                    </span>
                    <span className="truncate">
                      {task.board.title} · {task.column.status}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 items-end gap-2 max-sm:flex-col">
                  {!TERMINAL_COLUMN_STATUSES.includes(task.column.status) && (
                    <TaskColumnAge
                      columnEnteredAt={task.columnEnteredAt}
                    />
                  )}
                  <PriorityIndicator priority={task.priority} />
                </div>
                <ChevronRight
                  className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      )}

      <Pagination
        ariaLabel="Tasks pagination"
        currentPage={page}
        totalPages={totalPages}
        hrefForPage={(pageNumber) =>
          tasksHref(basePath, filter, pageNumber, query)
        }
      />
    </main>
  );
}

function SuspenseTasksSearch() {
  return (
    <Suspense
      fallback={<Skeleton className="mb-4 h-9 w-full shrink-0 sm:mb-5" />}
    >
      <TasksSearch />
    </Suspense>
  );
}
