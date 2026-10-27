import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, ChevronRight, Inbox, Search } from "lucide-react";
import type { TasksFilter } from "@/lib/types";
import { TASKS_PAGE_SIZE, TERMINAL_COLUMN_STATUSES } from "@/lib/constants";
import { TASK_FILTERS, TASK_FILTER_VALUES } from "@/lib/workspace/constants";
import { getBoardIdentity } from "@/lib/utils/board-identity";
import { buildTasksUrl } from "@/lib/workspace/url";
import { getWorkspaceTasksOverviewPageForUser } from "@/lib/dal/task";
import Pagination from "./pagination";
import PriorityIndicator from "./task/priority-indicator";
import TaskColumnAge from "./task/task-column-age";
import TasksFilterNav from "./tasks-filter-nav";

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

  const MAX_SAFE_PAGE = Math.floor(2_147_483_647 / TASKS_PAGE_SIZE);
  const isInvalidFilter = !TASK_FILTER_VALUES.has(filter);
  const isInvalidPage = !Number.isSafeInteger(page) || page < 1 || page > MAX_SAFE_PAGE;

  if (isInvalidFilter || isInvalidPage) {
    redirect(buildTasksUrl(basePath, "all", 1, query));
  }

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
        filters={TASK_FILTERS}
        counts={counts}
        filter={filter}
        basePath={basePath}
        query={query}
      />

      {items.length === 0 ? (
        <div className="border-border/80 flex shrink-0 flex-col items-center justify-center rounded-xl border px-4 py-12 text-center shadow-xs">
          <div className="text-muted-foreground/50 mb-3 flex size-8 items-center justify-center">
            {query ? (
              <Search className="size-5" aria-hidden="true" />
            ) : (
              <Inbox className="size-5" aria-hidden="true" />
            )}
          </div>
          <p className="text-sm font-medium">
            {query
              ? "No matching tasks"
              : filter === "all"
                ? "No tasks yet"
                : "No matching tasks"}
          </p>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs">
            {query
              ? "Try adjusting your search query or switching to another filter."
              : filter === "all"
                ? "Create a task on one of your boards to see it here."
                : "Try another filter or return when your workflow changes."}
          </p>
        </div>
      ) : (
        <div className="border-border/80 bg-card/70 divide-border/80 min-h-0 overflow-x-hidden overflow-y-auto rounded-xl border shadow-xs">
          {items.map((task) => {
            const isStale =
              task.attentionReason === "stale" ||
              task.attentionReason === "high-priority-stale";

            const taskHref =
              basePath === "/demo"
                ? `/demo?focus=${task.id}`
                : `${basePath}/${task.board.slug}?focus=${task.id}`;

            return (
              <Link
                key={task.id}
                href={taskHref}
                className="hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:ring-ring group flex min-w-0 items-center gap-3 border-b p-3.5 outline-none transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:ring-inset sm:p-4"
                aria-label={`Focus ${task.title} in ${task.board.title}, ${task.column.status}, ${task.priority} priority`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <PriorityIndicator
                      priority={task.priority}
                      showLabel={false}
                      className="shrink-0"
                    />
                    <p className="text-foreground group-hover:text-primary truncate text-sm font-medium transition-colors">
                      {task.title}
                    </p>
                  </div>
                  <p className="text-muted-foreground mt-1 flex min-w-0 items-center gap-1.5 truncate text-xs">
                    <span
                      className={`${getBoardIdentity(task.board.title, task.board.id).className} flex size-4 shrink-0 items-center justify-center rounded-[3px] text-[0.625rem] leading-none font-semibold`}
                      aria-hidden="true"
                    >
                      {getBoardIdentity(task.board.title, task.board.id).initial}
                    </span>
                    <span className="truncate">
                      {task.board.title}
                    </span>
                    <span aria-hidden="true" className="text-muted-foreground/40">
                      •
                    </span>
                    <span className="truncate">
                      {task.column.status}
                    </span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 max-sm:flex-col max-sm:items-end">
                  {isStale && !TERMINAL_COLUMN_STATUSES.includes(task.column.status) && (
                    <span className="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium">
                      <Clock3 className="size-3" aria-hidden="true" />
                      <TaskColumnAge
                        columnEnteredAt={task.columnEnteredAt}
                        showIcon={false}
                        className="text-inherit dark:text-inherit"
                      />
                    </span>
                  )}
                  <PriorityIndicator
                    priority={task.priority}
                    showLabel
                    className="border-border/70 bg-muted/40 rounded-md border px-2 py-0.5 text-[11px] font-medium"
                  />
                </div>

                <ChevronRight
                  className="text-muted-foreground/60 group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
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
