import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { TasksFilter } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import TasksSearch from "./tasks-search";

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

interface TasksPageShellProps {
  children?: ReactNode;
  basePath?: string;
  backHref?: string;
  backLabel?: string;
}

export default function TasksPageShell({
  children,
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
}: TasksPageShellProps) {
  return (
    <main className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
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

      <div className="shrink-0">
        <Suspense
          fallback={<Skeleton className="mb-4 h-9 w-full shrink-0 sm:mb-5" />}
        >
          <TasksSearch />
        </Suspense>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-6">
        {children}
      </div>
    </main>
  );
}
