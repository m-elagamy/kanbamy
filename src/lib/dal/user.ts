import "server-only";

import { unstable_cache } from "next/cache";
import { User, type Prisma } from "@prisma/client";
import { withUserId } from "@/lib/auth/wrappers";
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
} from "@/lib/cache/tags";

const boardWithStatsSelect = {
  lastVisitedAt: true,
  id: true,
  createdAt: true,
  title: true,
  slug: true,
  description: true,
  tags: true,
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
  lastVisitedAt: board.lastVisitedAt,
  id: board.id,
  createdAt: board.createdAt,
  title: board.title,
  slug: board.slug,
  description: board.description,
  tags: board.tags,
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

export type PrepareUserData = Pick<User, "id" | "name" | "email"> & {
  createdAt?: Date;
};

export async function prepareUserRecord(data: PrepareUserData) {
  return db.user.upsert({
    where: { id: data.id },
    create: data,
    update: data,
  });
}

export async function ensureUserRecord(data: PrepareUserData) {
  const existing = await db.user.findUnique({
    where: { id: data.id },
    select: { id: true, createdAt: true },
  });
  if (!existing) {
    return prepareUserRecord(data);
  }
  if (!existing.createdAt && data.createdAt) {
    return db.user.update({
      where: { id: data.id },
      data: { createdAt: data.createdAt },
    });
  }
  return existing;
}

export async function deleteUserRecord(userId: string) {
  return db.user.deleteMany({
    where: { id: userId },
  });
}


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
            tags: true,
          },
          take: BOARDS_LIST_LIMIT,
        }),
        db.board.count({ where: { userId } }),
      ]);

      return { boards, totalCount };
    },
    ["boards-list-v3", userId],
    { tags: [userBoardsTag(userId)] },
  )();

export const getAllUserBoardsForUser = async (userId: string) => {
  return fetchUserBoards(userId);
};

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

export const getDashboardStatsForUser = async (userId: string) =>
  fetchDashboardStats(userId);

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
        orderBy: true || hasMoreBoards
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
    ["dashboard-boards-with-stats-v4", userId],
    {
      tags: [
        userBoardsTag(userId),
        userRecentlyVisitedBoardsTag(userId),
      ],
    },
  )();

export const getUserBoardsWithStatsForUser = async (userId: string) =>
  fetchUserBoardsWithStats(userId);

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
    ["boards-with-stats-paginated-v4", userId, String(page)],
    { tags: [userBoardsTag(userId)] },
  )();

export const getUserBoardsPageForUser = async (
  userId: string,
  page: number,
  query = "",
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
};

export const getUserBoardsPage = withUserId(getUserBoardsPageForUser);
