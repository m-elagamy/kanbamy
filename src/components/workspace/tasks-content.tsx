import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, Inbox, Search, AlignLeft, RotateCcw, X } from "lucide-react";
import type { TasksFilter, TasksSort } from "@/lib/types";
import { TASKS_PAGE_SIZE, TERMINAL_COLUMN_STATUSES } from "@/lib/constants";
import {
  TASK_FILTERS,
  TASK_FILTER_VALUES,
  TASK_SORT_VALUES,
} from "@/lib/workspace/constants";
import { getBoardIdentity } from "@/lib/utils/board-identity";
import { buildTasksUrl } from "@/lib/workspace/url";
import { getWorkspaceTasksOverviewPageForUser } from "@/lib/dal/task";
import Pagination from "./pagination";
import PriorityIndicator from "./task/priority-indicator";
import { getTaskAgeDays } from "@/utils/task-helpers";
import TagBadge from "./task/tag-badge";
import TasksFilterNav from "./tasks-filter-nav";

type SearchParams = Promise<{
  filter?: string;
  page?: string;
  q?: string;
  sort?: string;
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

  const filter = (params.filter ?? "all") as TasksFilter;
  const sort = (params.sort ?? "default") as TasksSort;
  const page = Number(params.page ?? "1");
  const rawQuery = params.q ?? "";
  const query = rawQuery.trim().slice(0, 100);

  const MAX_SAFE_PAGE = Math.floor(2_147_483_647 / TASKS_PAGE_SIZE);
  const isInvalidFilter = !TASK_FILTER_VALUES.has(filter);
  const isInvalidSort = !TASK_SORT_VALUES.has(sort);
  const isInvalidPage = !Number.isSafeInteger(page) || page < 1 || page > MAX_SAFE_PAGE;

  if (isInvalidFilter || isInvalidSort || isInvalidPage) {
    redirect(buildTasksUrl(basePath, "all", 1, query));
  }

  if (
    params.page === "1" ||
    params.filter === "all" ||
    params.sort === "default" ||
    query !== rawQuery
  ) {
    redirect(buildTasksUrl(basePath, filter, page, query, sort));
  }

  const result = await getWorkspaceTasksOverviewPageForUser(
    ownerId,
    filter,
    page,
    query,
    TASKS_PAGE_SIZE,
    sort,
  );
  const totalPages = Math.max(1, Math.ceil(result.totalCount / TASKS_PAGE_SIZE));

  if (page > totalPages) {
    redirect(buildTasksUrl(basePath, filter, totalPages, query, sort));
  }

  const { items, counts } = result;

  return (
    <>
      <TasksFilterNav
        filters={TASK_FILTERS}
        counts={counts}
        filter={filter}
        sort={sort}
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
          {(query || filter !== "all") && (
            <Link
              href={
                query
                  ? buildTasksUrl(basePath, filter, 1, "", sort)
                  : buildTasksUrl(basePath, "all", 1, "", sort)
              }
              className="border-border/80 bg-background hover:bg-accent hover:text-accent-foreground mt-4 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors"
            >
              {query ? (
                <>
                  <X size={13} aria-hidden="true" />
                  <span>Clear search</span>
                </>
              ) : (
                <>
                  <RotateCcw size={13} aria-hidden="true" />
                  <span>View all tasks</span>
                </>
              )}
            </Link>
          )}
        </div>
      ) : (
        <div className="border-border/80 bg-card/70 divide-border/80 min-h-0 overflow-x-hidden overflow-y-auto rounded-xl border shadow-xs">
          {items.map((task) => {
            const isStale =
              task.attentionReason === "stale" ||
              task.attentionReason === "high-priority-stale";
            const taskAgeDays = getTaskAgeDays(task.columnEnteredAt);

            const taskHref =
              basePath === "/demo"
                ? `/demo?focus=${task.id}`
                : `${basePath}/${task.board.slug}?focus=${task.id}`;

            return (
              <Link
                key={task.id}
                href={taskHref}
                className="hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:ring-ring group flex min-w-0 items-center justify-between gap-4 border-b px-4 py-2.5 outline-none transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:ring-inset sm:py-3"
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
                    {task.description && (
                      <span
                        className="text-muted-foreground/50 group-hover:text-muted-foreground/80 shrink-0 transition-colors"
                        title="Has description"
                        aria-label="Has description"
                      >
                        <AlignLeft size={13} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1 flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
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
                    {task.tags && task.tags.length > 0 && (
                      <>
                        <span aria-hidden="true" className="text-muted-foreground/40">
                          •
                        </span>
                        <span className="flex items-center gap-1">
                          {task.tags.slice(0, 3).map((tag) => (
                            <TagBadge key={tag} tag={tag} size="sm" showDot={false} />
                          ))}
                          {task.tags.length > 3 && (
                            <span className="text-muted-foreground/70 px-0.5 text-[0.6875rem] font-medium">
                              +{task.tags.length - 3}
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                {isStale && !TERMINAL_COLUMN_STATUSES.includes(task.column.status) && (
                  <div className="flex shrink-0 items-center">
                    <span className="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium">
                      <Clock3 className="size-3 shrink-0" aria-hidden="true" />
                      <span>
                        {taskAgeDays !== null
                          ? `${taskAgeDays} ${taskAgeDays === 1 ? "day" : "days"} in ${task.column.status}`
                          : `Stale in ${task.column.status}`}
                      </span>
                    </span>
                  </div>
                )}
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
          buildTasksUrl(basePath, filter, pageNumber, query, sort)
        }
      />
    </>
  );
}
