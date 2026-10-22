import Link from "next/link";
import { ChevronRight, SquareKanban } from "lucide-react";
import type { BoardWithStats } from "@/lib/types/stores/board";
import BoardCard from "@/components/workspace/board/board-card";

interface OverviewBoardsGridProps {
  boards: BoardWithStats[];
  hasMoreBoards: boolean;
  totalBoards?: number;
  basePath?: string;
}

export default function OverviewBoardsGrid({
  boards,
  hasMoreBoards,
  totalBoards,
  basePath = "/dashboard",
}: OverviewBoardsGridProps) {
  const displayCount = totalBoards ?? boards.length;

  return (
    <section aria-labelledby="boards-heading" className="space-y-4">
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
              {hasMoreBoards ? "Recent boards" : "Your boards"}
            </h2>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-border/60 bg-muted/50 px-1.5 text-[11px] font-medium text-muted-foreground">
              {displayCount}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {hasMoreBoards
              ? "Your most recently visited boards."
              : "Choose a board to view and manage its tasks."}
          </p>
        </div>
        {hasMoreBoards && (
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
        )}
      </div>

      <div className="grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {boards.map((board, index) => (
          <BoardCard
            key={board.id}
            board={board}
            isLastActive={boards.length > 1 && index === 0 && Boolean(board.lastVisitedAt)}
            basePath={basePath}
          />
        ))}
      </div>
    </section>
  );
}
