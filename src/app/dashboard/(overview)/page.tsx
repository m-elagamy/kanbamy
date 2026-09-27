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
import { getServerTimestamp, logServerTiming } from "@/utils/server-timing";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

const Dashboard = async () => {
  const startedAt = getServerTimestamp();
  const authStartedAt = getServerTimestamp();
  await requireAuth();
  const authMs = getServerTimestamp() - authStartedAt;

  const measure = async <T,>(work: Promise<T>) => {
    const operationStartedAt = getServerTimestamp();
    const result = await work;

    return {
      result,
      durationMs: getServerTimestamp() - operationStartedAt,
    };
  };

  const [userMetric, boardsMetric, statsMetric, needsAttentionMetric] =
    await Promise.all([
      measure(getAuthenticatedUser()),
      measure(getUserBoardsWithStatsAction()),
      measure(getDashboardStatsAction()),
      measure(getNeedsAttentionTasksAction()),
    ]);

  const user = userMetric.result;
  const boardsResult = boardsMetric.result;
  const statsResult = statsMetric.result;
  const needsAttentionResult = needsAttentionMetric.result;

  logServerTiming(
    "dashboard.overview",
    getServerTimestamp() - startedAt,
    {
      authMs,
      userMs: userMetric.durationMs,
      boardsMs: boardsMetric.durationMs,
      statsMs: statsMetric.durationMs,
      needsAttentionMs: needsAttentionMetric.durationMs,
    },
  );

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
