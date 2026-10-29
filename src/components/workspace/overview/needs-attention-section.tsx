import { Suspense } from "react";
import Link from "next/link";
import {
  Clock3,
  CircleCheck,
  CircleAlert,
  ChevronRight,
  SignalHigh,
  LockKeyhole,
} from "lucide-react";
import type { NeedsAttentionPreview, NeedsAttentionTask } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import PriorityIndicator from "@/components/workspace/task/priority-indicator";
import { getTaskAgeDays } from "@/utils/task-helpers";
import { NeedsAttentionItemsSkeleton } from "./overview-content-skeleton";

async function NeedsAttentionCountBadge({
  tasksPromise,
}: {
  tasksPromise: Promise<NeedsAttentionPreview | null>;
}) {
  const tasks = await tasksPromise;
  const attentionCount = tasks?.items.length ?? 0;

  if (attentionCount === 0) {
    return (
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        0
      </span>
    );
  }

  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
      {attentionCount}
    </span>
  );
}

async function NeedsAttentionViewAllLink({
  tasksPromise,
  basePath,
  canNavigateTasks,
}: {
  tasksPromise: Promise<NeedsAttentionPreview | null>;
  basePath: string;
  canNavigateTasks: boolean;
}) {
  const tasks = await tasksPromise;
  const attentionCount = tasks?.items.length ?? 0;

  if (attentionCount === 0) {
    return null;
  }

  if (!canNavigateTasks) {
    return (
      <span
        aria-label="Create an account to view all attention tasks."
        title="Create an account to view all your tasks."
        className="text-muted-foreground inline-flex cursor-not-allowed items-center gap-1 text-sm opacity-70"
      >
        View all
        <LockKeyhole className="size-3.5" aria-hidden="true" />
      </span>
    );
  }

  return (
    <Link
      href={`${basePath}/tasks?filter=attention`}
      className="text-foreground/70 hover:text-primary group flex items-center gap-1 text-sm transition-colors"
    >
      View all
      <ChevronRight
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

function NeedsAttentionUnavailableState() {
  return (
    <div
      role="status"
      className="border-border/80 bg-card text-muted-foreground rounded-xl border p-4 text-sm shadow-sm"
    >
      Attention items are temporarily unavailable.
    </div>
  );
}

function NeedsAttentionEmptyState() {
  return (
    <div className="border-border/70 bg-card/40 flex flex-col items-center justify-center rounded-xl border px-4 py-5 text-center">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 shadow-[0_0_20px_-4px_rgba(16,185,129,0.25)] dark:text-emerald-400">
        <CircleCheck className="size-4" aria-hidden="true" />
      </span>
      <p className="mt-2.5 text-sm font-medium">You’re all caught up</p>
      <p className="text-muted-foreground mt-0.5 text-xs">
        No stale or high-priority tasks right now.
      </p>
    </div>
  );
}

function NeedsAttentionTaskCard({
  task,
  basePath,
  canNavigateTasks,
}: {
  task: NeedsAttentionTask;
  basePath: string;
  canNavigateTasks: boolean;
}) {
  const isStale =
    task.attentionReason === "stale" ||
    task.attentionReason === "high-priority-stale";
  const taskAgeDays = getTaskAgeDays(task.columnEnteredAt);

  const content = (
    <>
      <div className="via-primary/50 pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <PriorityIndicator
            priority={task.priority}
            showLabel={false}
            className="shrink-0"
          />
          <span className="text-foreground group-hover:text-primary truncate text-sm font-medium transition-colors">
            {task.title}
          </span>
        </div>
        <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs">
          <span>{task.board.title}</span>
          <span aria-hidden="true" className="text-muted-foreground/50">
            •
          </span>
          <span>{task.column.status}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 self-start sm:self-auto">
        {isStale ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/15 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400/90">
            <Clock3
              className="size-3 shrink-0 text-amber-400/80"
              aria-hidden="true"
            />
            {taskAgeDays !== null ? `Stale · ${taskAgeDays}d` : "Stale"}
          </span>
        ) : task.priority === "high" ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/15 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400/90">
            <SignalHigh
              className="size-3 shrink-0 text-rose-400/80"
              aria-hidden="true"
            />
            High priority
          </span>
        ) : null}
        {canNavigateTasks ? (
          <ChevronRight
            className="text-muted-foreground/60 size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        ) : (
          <LockKeyhole
            className="text-muted-foreground/60 size-3.5 shrink-0"
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

  if (canNavigateTasks) {
    return (
      <Link
        href={targetHref}
        className="border-border/80 bg-card hover:border-primary/40 group relative flex flex-col items-start justify-between gap-3 overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      aria-label="Create an account to open tasks directly."
      title="Create an account to open tasks directly."
      className="border-border/80 bg-card/70 flex cursor-not-allowed flex-col items-start justify-between gap-3 overflow-hidden rounded-xl border p-4 opacity-75 shadow-sm sm:flex-row sm:items-center"
    >
      {content}
    </div>
  );
}

async function NeedsAttentionItems({
  tasksPromise,
  basePath = "/dashboard",
  canNavigateTasks = true,
}: {
  tasksPromise: Promise<NeedsAttentionPreview | null>;
  basePath?: string;
  canNavigateTasks?: boolean;
}) {
  const tasks = await tasksPromise;

  if (tasks === null) {
    return <NeedsAttentionUnavailableState />;
  }

  if (tasks.items.length === 0) {
    return <NeedsAttentionEmptyState />;
  }

  return (
    <div className="space-y-2">
      {tasks.items.map((task) => (
        <NeedsAttentionTaskCard
          key={task.id}
          task={task}
          basePath={basePath}
          canNavigateTasks={canNavigateTasks}
        />
      ))}
    </div>
  );
}

export default function NeedsAttentionSection({
  tasksPromise,
  basePath = "/dashboard",
  canNavigateTasks = true,
}: {
  tasksPromise: Promise<NeedsAttentionPreview | null>;
  basePath?: string;
  canNavigateTasks?: boolean;
}) {
  return (
    <section aria-labelledby="focus-heading" className="shrink-0 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
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
            <Suspense fallback={<Skeleton className="h-5 w-6 rounded-full" />}>
              <NeedsAttentionCountBadge tasksPromise={tasksPromise} />
            </Suspense>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Stale work and high-priority tasks across your boards.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-4 w-16" />}>
          <NeedsAttentionViewAllLink
            tasksPromise={tasksPromise}
            basePath={basePath}
            canNavigateTasks={canNavigateTasks}
          />
        </Suspense>
      </div>

      <Suspense fallback={<NeedsAttentionItemsSkeleton />}>
        <NeedsAttentionItems
          tasksPromise={tasksPromise}
          basePath={basePath}
          canNavigateTasks={canNavigateTasks}
        />
      </Suspense>
    </section>
  );
}
