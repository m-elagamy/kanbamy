import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import BoardModal from "./board/board-modal";
import BoardsSearch from "./boards-search";

interface BoardsPageShellProps {
  children?: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export default function BoardsPageShell({
  children,
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
}: BoardsPageShellProps) {
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
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.25em] uppercase">
              Your workspace
            </p>
            <h1 className="text-[clamp(1.5rem,2.5vw,1.875rem)] font-semibold">All boards</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Choose a board to view and manage its tasks.
            </p>
          </div>
          <BoardModal
            mode="create"
            trigger={
              <button>
                <Plus aria-hidden="true" />
                New board
              </button>
            }
          />
        </div>
      </div>

      <div className="shrink-0">
        <Suspense
          fallback={<Skeleton className="mb-4 h-9 w-full shrink-0 rounded-md sm:mb-5" />}
        >
          <BoardsSearch />
        </Suspense>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-6">
        {children}
      </div>
    </main>
  );
}

