import { Suspense, type ReactNode } from "react";
import type { BoardWithStats } from "@/lib/types/stores/board";
import { Skeleton } from "@/components/ui/skeleton";
import { BoardSearch } from "@/components/workspace/board/board-search";
import OverviewHeader from "./overview-header";

export function OverviewSearchSkeleton() {
  return (
    <div className="border-border/80 bg-card/60 flex h-11 w-full items-center justify-between rounded-md border px-3 shadow-xs">
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-3.5 w-36" />
      </div>
      <Skeleton className="hidden h-5 w-16 rounded-md md:block" />
    </div>
  );
}

async function OverviewWorkspaceSearch({
  getInitialBoards,
  workspaceTabs = "all",
  basePath = "/dashboard",
}: {
  getInitialBoards?: () => Promise<BoardWithStats[]>;
  workspaceTabs?: "all" | "boards";
  basePath?: string;
}) {
  const initialBoards = getInitialBoards
    ? await getInitialBoards()
    : undefined;

  return (
    <BoardSearch
      scope="workspace"
      workspaceTabs={workspaceTabs}
      basePath={basePath}
      enableShortcut
      initialBoards={initialBoards}
      initialBoardsTotalCount={initialBoards?.length}
    />
  );
}

export interface OverviewPageShellProps {
  children?: ReactNode;
  getUserName?: () => Promise<string | null>;
  getInitialBoards?: () => Promise<BoardWithStats[]>;
  basePath?: string;
  canCreateBoard?: boolean;
  workspaceTabs?: "all" | "boards";
}

export default function OverviewPageShell({
  children,
  getUserName,
  getInitialBoards,
  basePath = "/dashboard",
  canCreateBoard = true,
  workspaceTabs = "all",
}: OverviewPageShellProps) {
  return (
    <main className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
      <div className="mb-6 shrink-0 sm:mb-8">
        <OverviewHeader
          getUserName={getUserName}
          canCreateBoard={canCreateBoard}
        />
      </div>

      <div className="mb-6 shrink-0 sm:mb-8">
        <Suspense fallback={<OverviewSearchSkeleton />}>
          <OverviewWorkspaceSearch
            getInitialBoards={getInitialBoards}
            workspaceTabs={workspaceTabs}
            basePath={basePath}
          />
        </Suspense>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-10 overflow-x-hidden overflow-y-auto pb-6 sm:gap-12">
        {children}
      </div>
    </main>
  );
}

