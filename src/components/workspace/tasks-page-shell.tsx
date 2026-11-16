import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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
    <main className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-clip px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
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

      <div className="flex min-h-0 flex-1 flex-col pb-6">
        {children}
      </div>
    </main>
  );
}
