import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, Flag, ListTodo, ChevronRight } from "lucide-react";
import type { TasksFilter } from "@/lib/types";
import { TASKS_PAGE_SIZE, TERMINAL_COLUMN_STATUSES } from "@/lib/constants";
import { getBoardIdentity } from "@/lib/utils/board-identity";
import { getWorkspaceTasksOverviewPageForUser } from "@/lib/dal/task";
import Pagination from "./pagination";
import PriorityIndicator from "./task/priority-indicator";
import TaskColumnAge from "./task/task-column-age";
import TasksFilterNav from "./tasks-filter-nav";
import { filters, filterValues, buildTasksUrl } from "./tasks-page-shell";

type SearchParams = Promise<{
  attention?: string;
  page?: string;
  q?: string;
}>;

interface TasksContentProps {
  searchParams: SearchParams;
  getOwnerId: () => Promise<string>;
  basePath: string;
}

export default async function TasksContent({
  searchParams,
  getOwnerId,
  basePath,
}: TasksContentProps) {
  const [params, ownerId] = await Promise.all([
    searchParams,
    getOwnerId(),
  ]);

  const filter = (params.attention ?? "all") as TasksFilter;
  const page = Number(params.page ?? "1");
  const rawQuery = params.q ?? "";
  const query = rawQuery.trim().slice(0, 100);

  // PostgreSQL 32-bit signed integer max limit (2^31 - 1) prevents SQL OFFSET overflow
  const MAX_SAFE_PAGE = Math.floor(2_147_483_647 / TASKS_PAGE_SIZE);
  const isInvalidFilter = !filterValues.has(filter);
  const isInvalidPage = !Number.isSafeInteger(page) || page < 1 || page > MAX_SAFE_PAGE;

  if (isInvalidFilter || isInvalidPage) {
    redirect(buildTasksUrl(basePath, "all", 1, query));
  }

  // Normalize URL: remove unnecessary `page=1` or trailing query whitespace
  if (params.page === "1" || query !== rawQuery) {
    redirect(buildTasksUrl(basePath, filter, page, query));
  }

  const result = await getWorkspaceTasksOverviewPageForUser(
    ownerId,
    filter,
    page,
    query,
    TASKS_PAGE_SIZE,
  );
  const totalPages = Math.max(1, Math.ceil(result.totalCount / TASKS_PAGE_SIZE));

  if (page > totalPages) {
    redirect(buildTasksUrl(basePath, filter, totalPages, query));
  }

  const { items, counts } = result;

  return (
    <>
      <TasksFilterNav
        filters={filters}
        counts={counts}
        filter={filter}
        basePath={basePath}
        query={query}
      />

      {items.length === 0 ? (
        <div className="border-border/80 bg-background/80 flex shrink-0 flex-col items-center justify-center rounded-xl border px-4 py-12 text-center shadow-sm">
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
        <div className="border-border/80 bg-background/80 divide-border/80 min-h-0 overflow-x-hidden overflow-y-auto rounded-xl border shadow-sm">
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
          buildTasksUrl(basePath, filter, pageNumber, query)
        }
      />
    </>
  );
}

