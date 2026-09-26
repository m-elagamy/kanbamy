import type { Metadata } from "next";
import {
  getAuthenticatedUser,
  requireAuth,
} from "@/utils/auth";
import {
  getUserBoardsWithStatsAction,
  getDashboardStatsAction,
} from "@/actions/user";
import BoardsGrid from "../components/board/boards-grid";
import { getNeedsAttentionTasksAction } from "@/actions/task";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

const Dashboard = async () => {
  await requireAuth();

  const [user, boardsResult, statsResult, needsAttentionResult] = await Promise.all([
    getAuthenticatedUser(),
    getUserBoardsWithStatsAction(),
    getDashboardStatsAction(),
    getNeedsAttentionTasksAction(),
  ]);

  if (
    !boardsResult.success ||
    !boardsResult.fields ||
    !statsResult.success ||
    !statsResult.fields
  ) {
    throw new Error("Failed to load your dashboard. Please try again.");
  }

  const boards = boardsResult.fields;
  const stats = statsResult.fields;

  return (
    <main className="relative min-h-full overflow-hidden px-4 py-6 sm:px-6 sm:py-8 md:px-10">
      <section className="relative z-10 mx-auto max-w-5xl">
        <BoardsGrid
          boards={boards}
          userName={user.firstName}
          stats={stats}
          needsAttentionTasks={
            needsAttentionResult.success
              ? (needsAttentionResult.fields ?? { items: [], hasMore: false })
              : null
          }
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
