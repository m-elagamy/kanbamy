import type { Metadata } from "next";
import BoardsGrid from "@/app/dashboard/components/board/boards-grid";
import { getNeedsAttentionTasksForUser } from "@/lib/dal/task";
import {
  getDashboardStatsForUser,
  getUserBoardsWithStatsForUser,
} from "@/lib/dal/user";
import { getDemoWorkspaceContext } from "@/lib/demo-workspace";

export const metadata: Metadata = {
  title: "Demo Overview",
  description: "Explore a real Kanbamy workspace with a temporary Demo session.",
};

export default async function DemoOverviewPage() {
  const { demoSession, demoBoard } = await getDemoWorkspaceContext();
  const [allBoards, stats, needsAttentionTasks] = await Promise.all([
    getUserBoardsWithStatsForUser(demoSession.ownerId),
    getDashboardStatsForUser(demoSession.ownerId),
    getNeedsAttentionTasksForUser(demoSession.ownerId),
  ]);

  const boards = allBoards.filter((board) => board.id === demoBoard.id);

  return (
    <main className="relative min-h-full overflow-hidden px-4 py-6 sm:px-6 sm:py-8 md:px-10">
      <section className="relative z-10 mx-auto max-w-5xl">
        <BoardsGrid
          boards={boards}
          userName={null}
          stats={{ totalBoards: boards.length, openTasks: stats.openTasks }}
          needsAttentionTasks={needsAttentionTasks}
          basePath="/demo"
          canCreateBoard={false}
          canNavigateTasks={false}
          workspaceTabs="boards"
        />
      </section>
    </main>
  );
}
