import Link from "next/link";
import {
  Clock3,
  CircleCheck,
  CircleAlert,
  ChevronRight,
  Flag,
  SignalHigh,
  LockKeyhole,
} from "lucide-react";
import type { NeedsAttentionPreview } from "@/lib/types";
import PriorityIndicator from "@/components/workspace/task/priority-indicator";
import { getTaskAgeDays } from "@/utils/task-helpers";

export default function NeedsAttentionSection({
  tasks,
  basePath = "/dashboard",
  canNavigateTasks = true,
}: {
  tasks: NeedsAttentionPreview | null;
  basePath?: string;
  canNavigateTasks?: boolean;
}) {
  if (tasks?.items.length === 0) {
    return (
      <section aria-labelledby="focus-heading" className="space-y-4">
        <div>
          <h2
            id="focus-heading"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <CircleAlert
              className="text-foreground/60 size-4 shrink-0"
              aria-hidden="true"
            />
            Needs attention
          </h2>
          <p className="text-muted-foreground text-sm">
            Stale work and high-priority tasks across your boards.
          </p>
        </div>
        <div className="border-border/80 bg-background flex items-center gap-3 rounded-xl border p-4 shadow-sm">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <CircleCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium">You’re all caught up</p>
            <p className="text-muted-foreground text-xs">
              No stale or high-priority tasks.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="focus-heading" className="space-y-4">
      <div>
        <h2
          id="focus-heading"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <CircleAlert
            className="text-foreground/60 size-4 shrink-0"
            aria-hidden="true"
          />
          Needs attention
        </h2>
        <p className="text-muted-foreground text-sm">
          Stale work and high-priority tasks across your boards.
        </p>
      </div>

      {tasks === null ? (
        <div
          role="status"
          className="border-border/80 bg-background text-muted-foreground rounded-xl border p-4 text-sm shadow-sm"
        >
          Attention items are temporarily unavailable.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.items.map((task) => {
            const isStale =
              task.attentionReason === "stale" ||
              task.attentionReason === "high-priority-stale";
            const taskAgeDays = getTaskAgeDays(task.columnEnteredAt);

            const content = (
              <>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <PriorityIndicator priority={task.priority} />
                    <span className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {task.title}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                    <span>{task.board.title}</span>
                    <span>•</span>
                    <span>{task.column.status}</span>
                    {taskAgeDays !== null && isStale && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
                          <Clock3 className="size-3" aria-hidden="true" />
                          In column {taskAgeDays}d
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                  {task.priority === "high" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-300">
                      <SignalHigh className="size-3" aria-hidden="true" />
                      High priority
                    </span>
                  )}
                  {isStale && task.priority !== "high" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                      <Clock3 className="size-3" aria-hidden="true" />
                      Stale
                    </span>
                  )}
                  {canNavigateTasks ? (
                    <ChevronRight
                      className="text-muted-foreground/60 size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  ) : (
                    <LockKeyhole
                      className="text-muted-foreground/60 size-3.5"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </>
            );

            const targetHref =
              basePath === "/demo"
                ? `/demo?focus=${task.id}`
                : `${basePath}/${task.board.slug}?focus=${task.id}`;

            return canNavigateTasks ? (
              <Link
                key={task.id}
                href={targetHref}
                className="group border-border/80 bg-background hover:border-primary/50 flex flex-col items-start justify-between gap-3 rounded-xl border p-4 shadow-sm transition-all sm:flex-row sm:items-center"
              >
                {content}
              </Link>
            ) : (
              <div
                key={task.id}
                aria-label="Create an account to open tasks directly."
                title="Create an account to open tasks directly."
                className="border-border/80 bg-background/70 flex cursor-not-allowed flex-col items-start justify-between gap-3 rounded-xl border p-4 opacity-75 shadow-sm sm:flex-row sm:items-center"
              >
                {content}
              </div>
            );
          })}
        </div>
      )}

      {tasks && tasks.items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
          {canNavigateTasks ? (
            <>
              <Link
                href={`${basePath}/tasks?attention=stale&page=1`}
                className="hover:text-primary flex items-center gap-1 transition-colors"
              >
                <Clock3 className="size-3.5 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                <span>Stale in column</span>
              </Link>
              <span>•</span>
              <Link
                href={`${basePath}/tasks?attention=high-priority&page=1`}
                className="hover:text-primary flex items-center gap-1 transition-colors"
              >
                <Flag className="size-3.5 text-rose-700 dark:text-rose-300" aria-hidden="true" />
                <span>High priority</span>
              </Link>
              {tasks.hasMore && (
                <>
                  <span>•</span>
                  <Link
                    href={`${basePath}/tasks?attention=needs-attention&page=1`}
                    className="text-foreground/70 hover:text-primary group inline-flex items-center gap-0.5 font-medium transition-colors"
                  >
                    <span>View all</span>
                    <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <span
                aria-label="Create an account to view stale tasks."
                title="Create an account to view stale tasks."
                className="inline-flex cursor-not-allowed items-center gap-1 opacity-70"
              >
                <Clock3 className="size-3.5 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                <span>Stale in column</span>
                <LockKeyhole className="size-3" aria-hidden="true" />
              </span>
              <span>•</span>
              <span
                aria-label="Create an account to view high priority tasks."
                title="Create an account to view high priority tasks."
                className="inline-flex cursor-not-allowed items-center gap-1 opacity-70"
              >
                <Flag className="size-3.5 text-rose-700 dark:text-rose-300" aria-hidden="true" />
                <span>High priority</span>
                <LockKeyhole className="size-3" aria-hidden="true" />
              </span>
            </>
          )}
        </div>
      )}
    </section>
  );
}
