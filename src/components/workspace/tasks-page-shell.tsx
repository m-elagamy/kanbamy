import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TasksSearch from "./tasks-search";

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
      <div className="mb-5 shrink-0 sm:mb-6">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          {backLabel}
        </Link>
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.25em] uppercase">
            Your workspace
          </p>
          <h1 className="text-gradient text-[clamp(1.5rem,2.5vw,1.875rem)] font-semibold">Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review work across all of your boards.
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <Suspense
          fallback={
            <div className="border-border/80 bg-card/60 mb-5 flex h-11 w-full items-center rounded-md border px-3.5 shadow-xs sm:mb-6">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="ml-3 h-3.5 w-32" />
            </div>
          }
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
