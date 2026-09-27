import db, { getDatabasePoolStats } from "../db";
import { unstable_cache } from "next/cache";
import { Board, type Column, type Priority, type Prisma } from "@prisma/client";
import { createHash } from "node:crypto";
import { getAuthenticatedUser } from "@/utils/auth";
import { withUserId } from "@/utils/auth-wrappers";
import type { ColumnStatus } from "@/schemas/column";
import { generateKeyBetween } from "fractional-indexing";
import { TASKS_PAGE_SIZE } from "@/lib/constants";
import { userBoardSlugTag } from "@/lib/cache-tags";
import {
  getServerTimestamp,
  logServerTiming,
} from "@/utils/server-timing";

const SAMPLE_TASKS: {
  title: string;
  description: string;
  priority: Priority;
}[] = [
  {
    title: "Move me to another column",
    description: "Drag this card to try it out.",
    priority: "low",
  },
  {
    title: "Create your first task",
    description: "Use + Add task to add something you're working on.",
    priority: "medium",
  },
  {
    title: "Open me to see the details",
    description: "Click this task to view and edit its details.",
    priority: "high",
  },
  {
    title: "You're all set!",
    description:
      "Make this board yours — add, move, and organize tasks however you like.",
    priority: "low",
  },
];

const seedSampleTasks = async (
  tx: Prisma.TransactionClient,
  columns: Column[],
) => {
  const orderedColumns = [...columns].sort((a, b) => a.order - b.order);
  const lastOrderByColumn = new Map<string, string>();

  const data = SAMPLE_TASKS.map((task, index) => {
    const column =
      orderedColumns[
        Math.floor((index * orderedColumns.length) / SAMPLE_TASKS.length)
      ];
    const order = generateKeyBetween(
      lastOrderByColumn.get(column.id) ?? null,
      null,
    );
    lastOrderByColumn.set(column.id, order);

    return {
      title: task.title,
      description: task.description,
      priority: task.priority,
      columnId: column.id,
      order,
    };
  });

  await tx.task.createMany({ data });
};

const createBoard = withUserId(
  async (
    userId: string,
    requestId: string,
    title: string,
    slug: string,
    description?: string | null,
    columnsStatus?: ColumnStatus[],
  ): Promise<Board & { columns: Column[] }> => {
    const startedAt = getServerTimestamp();
    // Reuse the board ID on retries, scoped to its owner.
    const boardId = `board_${createHash("sha256").update(`${userId}:${requestId}`).digest("hex")}`;
    const [existing, existingAccount] = await Promise.all([
      db.board.findUnique({
        where: { id: boardId, userId },
        include: { columns: { orderBy: { order: "asc" } } },
      }),
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          hasCreatedBoardOnce: true,
        },
      }),
    ]);
    const existingCheckedAt = getServerTimestamp();
    if (existing) {
      logServerTiming("board.create.dal", existingCheckedAt - startedAt, {
        existingMs: existingCheckedAt - startedAt,
        accountMs: 0,
        transactionMs: 0,
        reused: true,
      });
      return existing;
    }

    let account = existingAccount;
    if (!account) {
      const profile = await getAuthenticatedUser();
      const email = profile?.primaryEmailAddress?.emailAddress;
      if (!profile || profile.id !== userId || !email) {
        throw new Error(
          "Unable to prepare your account. Please sign in again.",
        );
      }
      account = {
        id: userId,
        name: profile.fullName,
        email,
        hasCreatedBoardOnce: false,
      };
    }
    if (!account) throw new Error("Unable to prepare your account.");
    const accountData = {
      id: account.id,
      name: account.name,
      email: account.email,
    };
    const accountCheckedAt = getServerTimestamp();

    const result = await db.$transaction(async (tx) => {
      let hasCreatedBoardOnce = existingAccount?.hasCreatedBoardOnce ?? false;

      if (!existingAccount) {
        // Keep the fallback for accounts that have not been prepared yet.
        const user = await tx.user.upsert({
          where: { id: userId },
          create: accountData,
          update: { id: userId },
        });
        hasCreatedBoardOnce = user.hasCreatedBoardOnce;
      }

      const saved = await tx.board.findUnique({
        where: { id: boardId, userId },
        include: { columns: { orderBy: { order: "asc" } } },
      });
      if (saved) return saved;

      const minOrderResult = await tx.board.aggregate({
        where: { userId },
        _min: { order: true },
      });
      const isFirstBoard =
        !hasCreatedBoardOnce && minOrderResult._min.order === null;
      const board = await tx.board.create({
        data: {
          id: boardId,
          title,
          slug,
          description,
          userId,
          order: (minOrderResult._min.order ?? 0) - 1,
          columns: columnsStatus?.length
            ? {
                create: columnsStatus.map((status, order) => ({
                  status,
                  order,
                })),
              }
            : undefined,
        },
        include: { columns: { orderBy: { order: "asc" } } },
      });

      if (isFirstBoard && board.columns.length) {
        await seedSampleTasks(tx, board.columns);
      }
      if (isFirstBoard) {
        await tx.user.update({
          where: { id: userId },
          data: { hasCreatedBoardOnce: true },
        });
      }
      return board;
    });
    const finishedAt = getServerTimestamp();

    logServerTiming("board.create.dal", finishedAt - startedAt, {
      existingMs: existingCheckedAt - startedAt,
      accountMs: accountCheckedAt - existingCheckedAt,
      transactionMs: finishedAt - accountCheckedAt,
      reused: false,
    });

    return result;
  },
);

const updateBoard = withUserId(
  async (
    userId: string,
    boardId: string,
    data: Partial<Omit<Board, "id" | "userId" | "order">>,
  ) => {
    const existing = await db.board.findFirst({
      where: { id: boardId, userId },
      select: { id: true },
    });
    if (!existing) return null;

    return db.board.update({
      where: { id: boardId },
      data,
    });
  },
);

const recordBoardVisitForUser = async (userId: string, boardId: string) => {
  const result = await db.board.updateMany({
    where: { id: boardId, userId },
    data: { lastVisitedAt: new Date() },
  });

  if (result.count === 0) return null;

  return { id: boardId };
};

const recordBoardVisit = withUserId(recordBoardVisitForUser);

const deleteBoard = withUserId(async (userId: string, boardId: string) => {
  const existing = await db.board.findFirst({
    where: { id: boardId, userId },
    select: { slug: true },
  });
  if (!existing) return null;

  const result = await db.board.deleteMany({
    where: { id: boardId, userId },
  });
  if (result.count === 0) return null;
  return { id: boardId, slug: existing.slug };
});

const getBoardForRename = withUserId(
  async (userId: string, boardId: string) => {
    return db.board.findFirst({
      where: { id: boardId, userId },
      select: { title: true, description: true, slug: true },
    });
  },
);

const countBoardsBySlug = withUserId(
  async (userId: string, boardId: string, slug: string) => {
    return db.board.count({
      where: { userId, slug, NOT: { id: boardId } },
    });
  },
);

const boardDetailSelect = {
  id: true,
  createdAt: true,
  title: true,
  slug: true,
  description: true,
  columns: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      status: true,
      order: true,
      _count: { select: { tasks: true } },
      tasks: {
        orderBy: [{ order: "asc" }, { id: "asc" }],
        take: TASKS_PAGE_SIZE + 1,
        select: {
          id: true,
          createdAt: true,
          title: true,
          order: true,
          priority: true,
          description: true,
          columnId: true,
          columnEnteredAt: true,
        },
      },
    },
  },
} satisfies Prisma.BoardSelect;

type BoardDetail = Prisma.BoardGetPayload<{ select: typeof boardDetailSelect }>;

const toBoardDetail = (board: BoardDetail) => ({
  ...board,
  columns: board.columns.map((column) => {
    const hasMore = column.tasks.length > TASKS_PAGE_SIZE;
    const page = hasMore
      ? column.tasks.slice(0, TASKS_PAGE_SIZE)
      : column.tasks;

    return {
      id: column.id,
      status: column.status,
      order: column.order,
      totalCount: column._count.tasks,
      nextCursor: hasMore ? (page.at(-1)?.order ?? null) : null,
      tasks: page.map((task) => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        columnEnteredAt: task.columnEnteredAt.toISOString(),
      })),
    };
  }),
});

const fetchBoardBySlug = (userId: string, slug: string) =>
  unstable_cache(
    async () => {
      const startedAt = getServerTimestamp();
      const poolBefore = getDatabasePoolStats();
      const connectStartedAt = getServerTimestamp();
      await db.$connect();
      const connectedAt = getServerTimestamp();
      const poolAfterConnect = getDatabasePoolStats();
      const queryStartedAt = getServerTimestamp();
      const board = await db.board.findUnique({
        where: { userId_slug: { userId, slug } },
        select: boardDetailSelect,
      });
      const queryFinishedAt = getServerTimestamp();
      const normalizedBoard = board ? toBoardDetail(board) : null;
      const finishedAt = getServerTimestamp();
      const taskCount =
        board?.columns.reduce((count, column) => count + column.tasks.length, 0) ??
        0;

      logServerTiming("board.detail", finishedAt - startedAt, {
        slug,
        connectMs: connectedAt - connectStartedAt,
        queryMs: queryFinishedAt - queryStartedAt,
        mapMs: finishedAt - queryFinishedAt,
        found: Boolean(board),
        columns: board?.columns.length ?? 0,
        tasks: taskCount,
        poolTotalBefore: poolBefore.poolTotal,
        poolIdleBefore: poolBefore.poolIdle,
        poolWaitingBefore: poolBefore.poolWaiting,
        poolTotalAfterConnect: poolAfterConnect.poolTotal,
        poolIdleAfterConnect: poolAfterConnect.poolIdle,
        clientAgeMs: poolBefore.clientAgeMs,
        processUptimeMs: poolBefore.processUptimeMs,
      });

      return normalizedBoard;
    },
    ["board-detail-by-slug-v3", userId, slug],
    { tags: [userBoardSlugTag(userId, slug)] },
  )();

export const getBoardBySlugForUser = (userId: string, slug: string) =>
  fetchBoardBySlug(userId, slug);

const getBoardBySlug = withUserId((userId: string, slug: string) =>
  fetchBoardBySlug(userId, slug),
);

export {
  createBoard,
  getBoardBySlug,
  recordBoardVisit,
  recordBoardVisitForUser,
  updateBoard,
  deleteBoard,
  getBoardForRename,
  countBoardsBySlug,
};
