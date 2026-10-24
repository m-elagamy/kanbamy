import {
  getDashboardStatsForUser,
  getUserBoardsWithStatsForUser,
} from "@/lib/dal/user";
import { getNeedsAttentionTasksForUser } from "@/lib/dal/task";
import NeedsAttentionSection from "./needs-attention-section";
import OverviewBoardsGrid, {
  type OverviewBoardsData,
} from "./overview-boards-grid";

export interface OverviewContentProps {
  getOwnerId: () => Promise<string>;
  getDemoBoardId?: () => Promise<string>;
  basePath?: string;
  canNavigateTasks?: boolean;
}

export default function OverviewContent({
  getOwnerId,
  getDemoBoardId,
  basePath = "/dashboard",
  canNavigateTasks = true,
}: OverviewContentProps) {
  const ownerIdPromise = getOwnerId();

  const tasksPromise = ownerIdPromise.then((ownerId) =>
    getNeedsAttentionTasksForUser(ownerId),
  );

  const boardsDataPromise: Promise<OverviewBoardsData> = Promise.all([
    ownerIdPromise,
    getDemoBoardId ? getDemoBoardId() : Promise.resolve(undefined),
  ]).then(async ([ownerId, demoBoardId]) => {
    const [allBoards, stats] = await Promise.all([
      getUserBoardsWithStatsForUser(ownerId),
      getDashboardStatsForUser(ownerId),
    ]);

    const boards = demoBoardId
      ? allBoards.filter((board) => board.id === demoBoardId)
      : allBoards;
    const totalBoards = demoBoardId ? boards.length : stats.totalBoards;

    return { boards, totalBoards };
  });

  return (
    <>
      <NeedsAttentionSection
        tasksPromise={tasksPromise}
        basePath={basePath}
        canNavigateTasks={canNavigateTasks}
      />

      <OverviewBoardsGrid
        boardsDataPromise={boardsDataPromise}
        basePath={basePath}
      />
    </>
  );
}
