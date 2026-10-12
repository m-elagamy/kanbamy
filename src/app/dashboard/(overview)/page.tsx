import type { Metadata } from "next";
import {
  getAuthenticatedDashboardUser,
  requireAuth,
} from "@/lib/auth";
import {
  getUserBoardsWithStatsForUser,
  getDashboardStatsForUser,
} from "@/lib/dal/user";
import { getNeedsAttentionTasksForUser } from "@/lib/dal/task";
import BoardsGrid from "@/components/workspace/board/boards-grid";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

const Dashboard = async () => {
  await requireAuth();
  const user = await getAuthenticatedDashboardUser();

  const [boards, stats, needsAttentionTasks] = await Promise.all([
    getUserBoardsWithStatsForUser(user.id),
    getDashboardStatsForUser(user.id),
    getNeedsAttentionTasksForUser(user.id),
  ]);

  return (
    <main className="relative min-h-full overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 md:px-10">
      <section className="relative z-10 mx-auto max-w-5xl">
        <BoardsGrid
          boards={boards}
          userName={user.firstName}
          stats={stats}
          needsAttentionTasks={needsAttentionTasks}
        />
      </section>
    </main>
  );
};

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Track tasks, manage projects, and stay organized with Kanbamy's dashboard.",
};

export default Dashboard;
