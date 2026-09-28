import "server-only";

import { unstable_cache } from "next/cache";
import { User, type Prisma } from "@prisma/client";
import { withUserId, ensureAuthenticated } from "@/utils/auth-wrappers";
import db from "../db";
import {
  BOARDS_LIST_LIMIT,
  BOARDS_PAGE_SIZE,
  DASHBOARD_BOARDS_LIMIT,
  TERMINAL_COLUMN_STATUSES,
} from "../constants";
import type { BoardWithStats } from "../types/stores/board";
import {
  userBoardsTag,
  userRecentlyVisitedBoardsTag,
} from "@/lib/cache-tags";

const boardWithStatsSelect = {
  id: true,
  createdAt: true,
  title: true,
  slug: true,
  description: true,
  _count: { select: { columns: true } },
  columns: {
    select: {
      status: true,
      _count: { select: { tasks: true } },
    },
  },
} satisfies Prisma.BoardSelect;

type BoardRowWithStats = Prisma.BoardGetPayload<{
  select: typeof boardWithStatsSelect;
}>;

const toBoardWithStats = (board: BoardRowWithStats): BoardWithStats => ({
  id: board.id,
  createdAt: board.createdAt,
  title: board.title,
  slug: board.slug,
  description: board.description,
  _count: {
    columns: board._count.columns,
    openTasks: board.columns.reduce(
      (sum, col) =>
        TERMINAL_COLUMN_STATUSES.includes(col.status)
          ? sum
          : sum + col._count.tasks,
      0,
    ),
  },
});

// Expects a server-authenticated profile; safe to call inside after().
export async function prepareUserRecord(
  data: Pick<User, "id" | "name" | "email">,
) {
  return db.user.upsert({
    where: { id: data.id },
    create: data,
    update: { id: data.id },
  });
}

export async function deleteUserRecord(userId: string) {
  return db.user.deleteMany({
    where: { id: userId },
  });
}

export const insertUser = ensureAuthenticated(
  async (data: Pick<User, "id" | "name" | "email">) => {
    return db.user.upsert({
      where: { id: data.id },
      update: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email } : {}),
      },
      create: {
        id: data.id,
        name: data.name,
        email: data.email,
      },
    });
  },
);

const fetchUserOnboardingState = (userId: string) =>
  unstable_cache(
    async () => {
      const [user, boardsCount] = await Promise.all([
        db.user.findUnique({
          where: { id: userId },
          select: { hasCreatedBoardOnce: true },
        }),
        db.board.count({ where: { userId } }),
      ]);

      return {
        boardsCount,
        hasCreatedBoardOnce: user?.hasCreatedBoardOnce ?? false,
      };
    },
    ["user-onboarding-state-v1", userId],
    { tags: [userBoardsTag(userId)] },
  )();

export const getUserOnboardingStateForUser = async (userId: string) =>
  fetchUserOnboardingState(userId);

export const getUserOnboardingState = withUserId(getUserOnboardingStateForUser);

const fetchUserBoards = (userId: string) =>
  unstable_cache(
    async () => {
      const [boards, totalCount] = await Promise.all([
        db.board.findMany({
          where: { userId },
          orderBy: { order: "asc" },
          select: {
            id: true,
            createdAt: true,
            title: true,
            slug: true,
            description: true,
          },
          take: BOARDS_LIST_LIMIT,
        }),
        db.board.count({ where: { userId } }),
      ]);

      return { boards, totalCount };
    },
    ["boards-list-v2", userId],
    { tags: [userBoardsTag(userId)] },
  )();

export const getAllUserBoards = withUserId(async (userId: string) => {
  return fetchUserBoards(userId);
});

const fetchDashboardStats = (userId: string) =>
  unstable_cache(
    async () => {
      const [totalBoards, openTasks] = await Promise.all([
        db.board.count({ where: { userId } }),
        db.task.count({
          where: {
            column: {
              status: { notIn: TERMINAL_COLUMN_STATUSES },
              board: { userId },
            },
          },
        }),
      ]);

      return { totalBoards, openTasks };
    },
    ["dashboard-stats-v4", userId],
    { tags: [userBoardsTag(userId)] },
  )();

export const getDashboardStats = withUserId(async (userId: string) => {
  return fetchDashboardStats(userId);
});

const fetchUserBoardsWithStats = (userId: string) =>
  unstable_cache(
    async (): Promise<BoardWithStats[]> => {
      const boardProbe = await db.board.findMany({
        where: { userId },
        orderBy: [{ order: "asc" }, { id: "asc" }],
        select: { id: true },
        take: DASHBOARD_BOARDS_LIMIT + 1,
      });
      const hasMoreBoards = boardProbe.length > DASHBOARD_BOARDS_LIMIT;
      const boards = await db.board.findMany({
        where: { userId },
        orderBy: hasMoreBoards
          ? [
              { lastVisitedAt: { sort: "desc", nulls: "last" } },
              { order: "asc" },
              { id: "asc" },
            ]
          : [{ order: "asc" }, { id: "asc" }],
        select: boardWithStatsSelect,
        take: DASHBOARD_BOARDS_LIMIT,
      });

      return boards.map(toBoardWithStats);
    },
    ["dashboard-boards-with-stats-v3", userId],
    {
      tags: [
        userBoardsTag(userId),
        userRecentlyVisitedBoardsTag(userId),
      ],
    },
  )();

export const getUserBoardsWithStats = withUserId(async (userId: string) => {
  return fetchUserBoardsWithStats(userId);
});

const fetchUserBoardsPage = (userId: string, page: number) =>
  unstable_cache(
    async () => {
      const [boards, totalCount] = await Promise.all([
        db.board.findMany({
          where: { userId },
          orderBy: { order: "asc" },
          select: boardWithStatsSelect,
          skip: (page - 1) * BOARDS_PAGE_SIZE,
          take: BOARDS_PAGE_SIZE,
        }),
        db.board.count({ where: { userId } }),
      ]);

      return { boards: boards.map(toBoardWithStats), totalCount };
    },
    ["boards-with-stats-paginated-v3", userId, String(page)],
    { tags: [userBoardsTag(userId)] },
  )();

export const getUserBoardsPage = withUserId(
  async (
    userId: string,
    page: number,
    query: string,
  ): Promise<{ boards: BoardWithStats[]; totalCount: number }> => {
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      const where: Prisma.BoardWhereInput = {
        userId,
        OR: [
          { title: { contains: normalizedQuery, mode: "insensitive" } },
          { description: { contains: normalizedQuery, mode: "insensitive" } },
        ],
      };
      const [boards, totalCount] = await Promise.all([
        db.board.findMany({
          where,
          orderBy: { order: "asc" },
          select: boardWithStatsSelect,
          skip: (page - 1) * BOARDS_PAGE_SIZE,
          take: BOARDS_PAGE_SIZE,
        }),
        db.board.count({ where }),
      ]);

      return { boards: boards.map(toBoardWithStats), totalCount };
    }

    return fetchUserBoardsPage(userId, page);
  },
);
