import Link from "next/link";
import { redirect } from "next/navigation";
import { AlignLeft, ArrowUpRight, Clock3, RotateCcw, X } from "lucide-react";
import type { TasksFilter, TasksSort } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import EmptyResultsIllustration from "@/components/ui/empty-results-illustration";
import EmptyTasksIllustration from "@/components/ui/empty-tasks-illustration";
import { TASKS_PAGE_SIZE, TERMINAL_COLUMN_STATUSES } from "@/lib/constants";
import {
  TASK_FILTERS,
  TASK_FILTER_VALUES,
  TASK_SORT_VALUES,
} from "@/lib/workspace/constants";
import { getBoardIdentity } from "@/lib/utils/board-identity";
import { buildTasksUrl } from "@/lib/workspace/url";
import { getWorkspaceTasksOverviewPageForUser } from "@/lib/dal/task";
import columnStatusOptions from "./data/column-status-options";
import Pagination from "./pagination";
import PrioritySelector from "./task/priority-selector";
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
  const rangeStart = (page - 1) * TASKS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * TASKS_PAGE_SIZE, result.totalCount);

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
        <div className="border-border/80 bg-card/40 shrink-0 rounded-xl border shadow-xs">
          <EmptyState
            size="compact"
            className="min-h-64 py-10"
            illustration={
              query || filter !== "all" ? (
                <EmptyResultsIllustration />
              ) : (
                <EmptyTasksIllustration />
              )
            }
            title={
              query || filter !== "all" ? "No matching tasks" : "No tasks yet"
            }
            description={
              query
                ? "Try adjusting your search query or switching to another filter."
                : filter === "all"
                  ? "Create a task on one of your boards to see it here."
                  : "Try another filter or return when your workflow changes."
            }
            action={
              query || filter !== "all" ? (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={
                      query
                        ? buildTasksUrl(basePath, filter, 1, "", sort)
                        : buildTasksUrl(basePath, "all", 1, "", sort)
                    }
                  >
                    {query ? (
                      <>
                        <X className="size-3.5" aria-hidden="true" />
                        <span>Clear search</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="size-3.5" aria-hidden="true" />
                        <span>View all tasks</span>
                      </>
                    )}
                  </Link>
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="border-border/80 bg-card/70 divide-border/70 min-h-0 divide-y overflow-x-hidden overflow-y-auto rounded-xl border shadow-xs">
            {items.map((task) => {
              const isStale =
                (task.attentionReason === "stale" ||
                  task.attentionReason === "high-priority-stale") &&
                !TERMINAL_COLUMN_STATUSES.includes(task.column.status);
              const taskAgeDays = getTaskAgeDays(task.columnEnteredAt);
              const boardIdentity = getBoardIdentity(task.board.title, task.board.id);
              const statusOption =
                columnStatusOptions[task.column.status as keyof typeof columnStatusOptions];
              const StatusIcon = statusOption?.icon;

              const taskHref =
                basePath === "/demo"
                  ? `/demo?focus=${task.id}`
                  : `${basePath}/${task.board.id}?focus=${task.id}`;

              return (
                <Link
                  key={task.id}
                  href={taskHref}
                  className="hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:ring-ring group flex min-w-0 items-center justify-between gap-4 px-4 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset sm:px-4.5"
                  aria-label={`Focus ${task.title} in ${task.board.title}, ${task.column.status}, ${task.priority} priority`}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <PrioritySelector
                        priority={task.priority}
                        showLabel={false}
                        className="shrink-0"
                      />
                      <p className="text-foreground group-hover:text-primary truncate text-sm font-medium transition-colors">
                        {task.title}
                      </p>
                      {task.description && (
                        <span
                          className="text-muted-foreground/45 group-hover:text-muted-foreground/75 shrink-0 transition-colors"
                          title="Has description"
                          aria-label="Has description"
                        >
                          <AlignLeft size={13} aria-hidden="true" />
                        </span>
                      )}
                    </div>

                    <div className="text-muted-foreground flex min-w-0 shrink-0 flex-wrap items-center gap-1.5 pl-5.5 text-xs sm:pl-0">
                      <span
                        className={`${boardIdentity.className} flex size-3.5 shrink-0 items-center justify-center rounded-[3px] text-[9px] leading-none font-semibold`}
                        aria-hidden="true"
                      >
                        {boardIdentity.initial}
                      </span>
                      <span className="text-muted-foreground group-hover:text-foreground/80 max-w-40 truncate transition-colors">
                        {task.board.title}
                      </span>
                      {task.tags && task.tags.length > 0 && (
                        <span className="inline-flex items-center gap-1 sm:ml-0.5">
                          {task.tags.slice(0, 3).map((tag) => (
                            <TagBadge key={tag} tag={tag} size="sm" showDot={false} />
                          ))}
                          {task.tags.length > 3 && (
                            <span className="text-muted-foreground/70 px-0.5 text-[0.6875rem] font-medium">
                              +{task.tags.length - 3}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    {isStale && (
                      <span
                        className="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium"
                        title={
                          taskAgeDays !== null
                            ? `${taskAgeDays} ${taskAgeDays === 1 ? "day" : "days"} in ${task.column.status}`
                            : `Stale in ${task.column.status}`
                        }
                      >
                        <Clock3 className="size-3 shrink-0" aria-hidden="true" />
                        <span>{taskAgeDays !== null ? `Stale · ${taskAgeDays}d` : "Stale"}</span>
                      </span>
                    )}

                    <span
                      className="border-border/70 bg-muted/35 text-foreground/85 group-hover:border-border group-hover:bg-muted/55 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors"
                      title={`Status: ${task.column.status}`}
                    >
                      {StatusIcon && (
                        <StatusIcon
                          size={12}
                          color={statusOption.color}
                          className="shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="max-w-28 truncate sm:max-w-36">{task.column.status}</span>
                    </span>

                    <ArrowUpRight
                      className="text-muted-foreground/60 group-hover:text-primary hidden size-3.5 shrink-0 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex shrink-0 flex-col items-center justify-between gap-3 sm:grid sm:grid-cols-3">
            <p className="text-muted-foreground text-xs" aria-live="polite">
              Showing{" "}
              <span className="text-foreground font-semibold tabular-nums">{rangeStart}–{rangeEnd}</span>{" "}
              of{" "}
              <span className="text-foreground font-semibold tabular-nums">{result.totalCount}</span>{" "}
              {result.totalCount === 1 ? "task" : "tasks"}
            </p>
            <div className="flex justify-center">
              <Pagination
                className="mt-0"
                ariaLabel="Tasks pagination"
                currentPage={page}
                totalPages={totalPages}
                hrefForPage={(pageNumber) =>
                  buildTasksUrl(basePath, filter, pageNumber, query, sort)
                }
              />
            </div>
            {totalPages > 1 && (
              <p className="text-muted-foreground text-xs tabular-nums sm:text-right">
                Page {page} of {totalPages}
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
