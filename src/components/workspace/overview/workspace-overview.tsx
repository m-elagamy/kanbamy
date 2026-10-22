import type { BoardWithStats } from "@/lib/types/stores/board";
import type { NeedsAttentionPreview } from "@/lib/types";
import { BoardSearch } from "@/components/workspace/board/board-search";
import OverviewHeader from "./overview-header";
import OverviewStats from "./overview-stats";
import OverviewEmptyState from "./overview-empty-state";
import NeedsAttentionSection from "./needs-attention-section";
import OverviewBoardsGrid from "./overview-boards-grid";

export interface WorkspaceOverviewProps {
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

export default function WorkspaceOverview({
  boards,
  userName,
  stats,
  needsAttentionTasks,
  basePath = "/dashboard",
  canCreateBoard = true,
  canNavigateTasks = true,
  workspaceTabs = "all",
}: WorkspaceOverviewProps) {
  const hasBoards = boards.length > 0;
  const hasMoreBoards = stats.totalBoards > boards.length;

  return (
    <div className="flex flex-col gap-8">
      <OverviewHeader
        userName={userName}
        hasBoards={hasBoards}
        canCreateBoard={canCreateBoard}
      />

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
            <OverviewStats
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

            <OverviewBoardsGrid
              boards={boards}
              hasMoreBoards={hasMoreBoards}
              basePath={basePath}
            />
          </div>
        </>
      ) : (
        <OverviewEmptyState />
      )}
    </div>
  );
}
