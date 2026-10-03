import Link from "next/link";
import { ChevronRight, LockKeyhole, Plus, SquareKanban } from "lucide-react";
import type { BoardWithStats } from "@/lib/types/stores/board";
import BoardCard from "./board-card";
import BoardModal from "./board-modal";
import DashboardStats from "./dashboard-stats";
import DashboardEmptyState from "./dashboard-empty-state";
import NeedsAttentionSection from "./needs-attention-section";
import DashboardClock from "./dashboard-clock-loader";
import { BoardSearch } from "./board-search";
import type { NeedsAttentionPreview } from "@/lib/types";
import DashboardGreeting from "./dashboard-greeting";

interface BoardsGridProps {
  boards: BoardWithStats[];
  userName: string | null;
  stats: {
    totalBoards: number;
    openTasks: number;
  };
  needsAttentionTasks: NeedsAttentionPreview | null;
  basePath?: string;
  canCreateBoard?: boolean;
  canNavigateTasks?: boolean;
  workspaceTabs?: "all" | "boards";
}

export default function BoardsGrid({
  boards,
  userName,
  stats,
  needsAttentionTasks,
  basePath = "/dashboard",
  canCreateBoard = true,
  canNavigateTasks = true,
  workspaceTabs = "all",
}: BoardsGridProps) {
  const hasBoards = boards.length > 0;
  const hasMoreBoards = stats.totalBoards > boards.length;
  return (
    <div className="flex flex-col gap-8">
      <div
        className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-[0.25em]">
            Your workspace
          </p>
          <h1 className="text-gradient text-[clamp(1.875rem,3vw,2.25rem)] font-semibold">
            <DashboardGreeting userName={userName} />
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {hasBoards
              ? "Search your workspace or choose a board to keep things moving."
              : "Your workspace is ready when you are."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DashboardClock />
          {hasBoards && canCreateBoard && (
            <BoardModal
              mode="create"
              trigger={
                <button>
                  <Plus className="h-4 w-4" />
                  New board
                </button>
              }
            />
          )}
          {hasBoards && !canCreateBoard && (
            <button
              type="button"
              disabled
              aria-label="Create an account to add more boards."
              title="Create an account to add more boards."
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border/70 px-3 text-sm font-medium text-muted-foreground opacity-70"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New board
              <LockKeyhole className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {hasBoards ? (
        <>
          <div className="flex w-full flex-col gap-2">
            <BoardSearch
              scope="workspace"
              workspaceTabs={workspaceTabs}
              basePath={basePath}
              enableShortcut
              initialBoards={boards}
              initialBoardsTotalCount={stats.totalBoards}
            />
            <DashboardStats
              openTasks={stats.openTasks}
              canNavigateTasks={canNavigateTasks}
              basePath={basePath}
            />
          </div>

          <div className="mt-4 flex flex-col gap-10 sm:gap-12">
            <NeedsAttentionSection
              tasks={needsAttentionTasks}
              basePath={basePath}
              canNavigateTasks={canNavigateTasks}
            />

            <section aria-labelledby="boards-heading" className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
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
                  <p className="text-muted-foreground text-sm">
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
                {boards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    basePath={basePath}
                  />
                ))}
              </div>
            </section>
          </div>
        </>
      ) : (
        <DashboardEmptyState />
      )}
    </div>
  );
}
