import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, SquareKanban } from "lucide-react";
import type { BoardWithStats } from "@/lib/types/stores/board";
import { Skeleton } from "@/components/ui/skeleton";
import BoardCard from "@/components/workspace/board/board-card";
import OverviewEmptyState from "./overview-empty-state";
import { OverviewBoardsCardsSkeleton } from "./overview-content-skeleton";

export interface OverviewBoardsData {
  boards: BoardWithStats[];
  totalBoards: number;
}

interface OverviewBoardsGridProps {
  boardsDataPromise: Promise<OverviewBoardsData>;
  basePath?: string;
}

async function OverviewBoardsCountBadge({
  boardsDataPromise,
}: {
  boardsDataPromise: Promise<OverviewBoardsData>;
}) {
  const { totalBoards } = await boardsDataPromise;

  return (
    <span className="border-border/60 bg-muted/50 text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 text-[11px] font-medium">
      {totalBoards}
    </span>
  );
}

async function OverviewBoardsViewAllLink({
  boardsDataPromise,
  basePath,
}: {
  boardsDataPromise: Promise<OverviewBoardsData>;
  basePath: string;
}) {
  const { totalBoards } = await boardsDataPromise;

  if (totalBoards === 0) return null;


  return (
    <Link
      href={`${basePath}/boards`}
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

async function OverviewBoardsCards({
  boardsDataPromise,
  basePath = "/dashboard",
}: {
  boardsDataPromise: Promise<OverviewBoardsData>;
  basePath?: string;
}) {
  const { boards } = await boardsDataPromise;

  if (boards.length === 0) {
    return <OverviewEmptyState />;
  }

  return (
    <div className="grid max-w-5xl grid-cols-1 gap-4 pt-0.5 sm:grid-cols-2 xl:grid-cols-3">
      {boards.map((board, index) => (
        <BoardCard
          key={board.id}
          board={board}
          isLastActive={
            boards.length > 1 && index === 0 && Boolean(board.lastVisitedAt)
          }
          basePath={basePath}
        />
      ))}
    </div>
  );
}

export default function OverviewBoardsGrid({
  boardsDataPromise,
  basePath = "/dashboard",
}: OverviewBoardsGridProps) {
  return (
    <section aria-labelledby="boards-heading" className="shrink-0 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2
              id="boards-heading"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <SquareKanban
                className="text-foreground/60 size-4 shrink-0"
                aria-hidden="true"
              />
              Your boards
            </h2>
            <Suspense fallback={<Skeleton className="h-5 w-6 rounded-full" />}>
              <OverviewBoardsCountBadge boardsDataPromise={boardsDataPromise} />
            </Suspense>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Choose a board to view and manage its tasks.
          </p>
        </div>
        {basePath !== "/demo" && (
          <Suspense fallback={<Skeleton className="h-4 w-16" />}>
            <OverviewBoardsViewAllLink
              boardsDataPromise={boardsDataPromise}
              basePath={basePath}
            />
          </Suspense>
        )}
      </div>

      <Suspense fallback={<OverviewBoardsCardsSkeleton />}>
        <OverviewBoardsCards
          boardsDataPromise={boardsDataPromise}
          basePath={basePath}
        />
      </Suspense>
    </section>
  );
}

