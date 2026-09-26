import { withUserId } from "@/utils/auth-wrappers";
import db from "../db";
import { Prisma, Task, type Priority } from "@prisma/client";
import type {
  NeedsAttentionPreview,
  NeedsAttentionTask,
  TaskPage,
  TaskSearchPage,
  TasksFilter,
  WorkspaceTasksPage,
} from "@/lib/types";
import { generateKeyBetween } from "fractional-indexing";
import {
  DASHBOARD_FOCUS_PREVIEW_SIZE,
  STALE_TASK_DAYS,
  TERMINAL_COLUMN_STATUSES,
} from "@/lib/constants";

const getStaleTaskBoundary = (now = new Date()) =>
  new Date(now.getTime() - STALE_TASK_DAYS * 24 * 60 * 60 * 1000);

const TASK_CREATE_MAX_ATTEMPTS = 3;

const isTaskOrderConflict = (error: unknown) => {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes("columnId") && target.includes("order");
  }

  return (
    typeof target === "string" &&
    (target.includes("Task_columnId_order_key") ||
      (target.includes("columnId") && target.includes("order")))
  );
};

export const createTask = withUserId(
  async (
    userId: string,
    columnId: string,
    title: string,
    description?: string,
    priority?: Priority,
  ): Promise<Task> => {
    const column = await db.column.findFirst({
      where: { id: columnId, board: { userId } },
      select: { id: true },
    });
    if (!column) throw new Error("Column not found.");

    for (
      let attempt = 1;
      attempt <= TASK_CREATE_MAX_ATTEMPTS;
      attempt += 1
    ) {
      const highestOrderTask = await db.task.findFirst({
        where: { columnId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const newOrder = generateKeyBetween(
        highestOrderTask?.order ?? null,
        null,
      );

      try {
        return await db.task.create({
          data: {
            title,
            description,
            priority,
            columnId,
            order: newOrder,
          },
        });
      } catch (error) {
        if (!isTaskOrderConflict(error) || attempt === TASK_CREATE_MAX_ATTEMPTS) {
          throw error;
        }
      }
    }

    throw new Error("Task creation failed.");
  },
);

export const updateTask = withUserId(
  async (
    userId: string,
    taskId: string,
    data: Omit<Partial<Task>, "id" | "order">,
  ): Promise<Task> => {
    const existing = await db.task.findFirst({
      where: { id: taskId, column: { board: { userId } } },
      select: { id: true },
    });
    if (!existing) throw new Error("Task not found.");

    return db.task.update({
      where: { id: taskId },
      data,
    });
  },
);

export const deleteTask = withUserId(async (userId: string, taskId: string) => {
  const result = await db.task.deleteMany({
    where: { id: taskId, column: { board: { userId } } },
  });
  if (result.count === 0) return null;
  return { id: taskId };
});

export const getTaskForRename = withUserId(
  async (userId: string, taskId: string) => {
    return db.task.findFirst({
      where: { id: taskId, column: { board: { userId } } },
      select: {
        title: true,
        description: true,
        priority: true,
      },
    });
  },
);

export const getTaskDetails = withUserId(
  async (userId: string, taskId: string) => {
    const task = await db.task.findFirst({
      where: { id: taskId, column: { board: { userId } } },
      select: {
        id: true,
        createdAt: true,
        title: true,
        description: true,
        priority: true,
        order: true,
        columnId: true,
        columnEnteredAt: true,
        column: { select: { board: { select: { slug: true } } } },
      },
    });

    if (!task) return null;

    return {
      id: task.id,
      createdAt: task.createdAt.toISOString(),
      title: task.title,
      description: task.description,
      priority: task.priority,
      order: task.order,
      columnId: task.columnId,
      columnEnteredAt: task.columnEnteredAt.toISOString(),
      boardSlug: task.column.board.slug,
    };
  },
);

export const updateTaskPosition = withUserId(
  async (
    userId: string,
    taskId: string,
    newColumnId: string,
    previousTaskId: string | null,
    nextTaskId: string | null,
  ): Promise<
    Pick<Task, "columnId" | "order" | "columnEnteredAt"> & {
      movedBetweenColumns: boolean;
    }
  > => {
    if (previousTaskId === taskId || nextTaskId === taskId) {
      throw new Error("Invalid task position.");
    }

    return db.$transaction(async (tx) => {
      const [sourceTask, targetColumn] = await Promise.all([
        tx.task.findUnique({
          where: { id: taskId },
          select: {
            columnId: true,
            order: true,
            column: { select: { boardId: true } },
          },
        }),
        tx.column.findUnique({
          where: { id: newColumnId },
          select: { boardId: true, board: { select: { userId: true } } },
        }),
      ]);

      if (
        !sourceTask ||
        !targetColumn ||
        targetColumn.board.userId !== userId ||
        sourceTask.column.boardId !== targetColumn.boardId
      ) {
        throw new Error("Target column not found.");
      }

      const anchorIds = [previousTaskId, nextTaskId].filter(
        (id): id is string => Boolean(id),
      );
      const anchors = await tx.task.findMany({
        where: { id: { in: anchorIds }, columnId: newColumnId },
        select: { id: true, order: true },
      });
      const anchorOrders = new Map(
        anchors.map((task) => [task.id, task.order]),
      );

      if (
        (previousTaskId && !anchorOrders.has(previousTaskId)) ||
        (nextTaskId && !anchorOrders.has(nextTaskId))
      ) {
        throw new Error("Task position is out of date. Please try again.");
      }

      let previousOrder = previousTaskId
        ? anchorOrders.get(previousTaskId)!
        : null;
      const nextOrder = nextTaskId ? anchorOrders.get(nextTaskId)! : null;

      if (!previousTaskId && !nextTaskId) {
        const lastTask = await tx.task.findFirst({
          where: { columnId: newColumnId, id: { not: taskId } },
          orderBy: { order: "desc" },
          select: { order: true },
        });
        previousOrder = lastTask?.order ?? null;
      }

      const followingTask =
        previousOrder && !nextOrder
          ? await tx.task.findFirst({
              where: {
                columnId: newColumnId,
                id: { not: taskId },
                order: { gt: previousOrder },
              },
              orderBy: { order: "asc" },
              select: { order: true },
            })
          : null;
      const resolvedNextOrder = nextOrder ?? followingTask?.order ?? null;

      if (
        previousOrder &&
        resolvedNextOrder &&
        previousOrder >= resolvedNextOrder
      ) {
        throw new Error("Invalid task position.");
      }

      const order = generateKeyBetween(previousOrder, resolvedNextOrder);

      const updateResult = await tx.task.updateMany({
        where: {
          id: taskId,
          columnId: sourceTask.columnId,
          order: sourceTask.order,
        },
        data: {
          columnId: newColumnId,
          order,
          ...(sourceTask.columnId !== newColumnId && {
            columnEnteredAt: new Date(),
          }),
        },
      });

      if (updateResult.count !== 1) {
        throw new Error("Task position is out of date. Please try again.");
      }

      const updatedTask = await tx.task.findUnique({
        where: { id: taskId },
        select: {
          columnId: true,
          order: true,
          columnEnteredAt: true,
        },
      });

      if (!updatedTask) {
        throw new Error("Task position is out of date. Please try again.");
      }

      return {
        ...updatedTask,
        movedBetweenColumns: sourceTask.columnId !== newColumnId,
      };
    });
  },
);

export const getTasksPage = withUserId(
  async (
    userId: string,
    boardId: string | null,
    query: string,
    cursor: string | null,
    limit: number,
  ): Promise<TaskSearchPage> => {
    const normalizedQuery = query.trim();
    const tasks = await db.task.findMany({
      where: {
        column: {
          board: {
            userId,
            ...(boardId && { id: boardId }),
          },
        },
        ...(normalizedQuery && {
          OR: [
            { title: { contains: normalizedQuery, mode: "insensitive" } },
            {
              description: {
                contains: normalizedQuery,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take: limit + 1,
      select: {
        id: true,
        createdAt: true,
        title: true,
        description: true,
        priority: true,
        order: true,
        columnId: true,
        columnEnteredAt: true,
        column: {
          select: {
            status: true,
            board: { select: { id: true, title: true, slug: true } },
          },
        },
      },
      orderBy: [{ column: { order: "asc" } }, { order: "asc" }, { id: "asc" }],
    });

    const hasMore = tasks.length > limit;
    const page = hasMore ? tasks.slice(0, limit) : tasks;

    return {
      items: page.map((task) => ({
        ...task,
        board: task.column.board,
        column: { status: task.column.status },
        columnEnteredAt: task.columnEnteredAt.toISOString(),
        createdAt: task.createdAt.toISOString(),
      })),
      nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null,
    };
  },
);

const workspaceTaskSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
  priority: true,
  order: true,
  columnId: true,
  columnEnteredAt: true,
  column: {
    select: {
      status: true,
            board: { select: { id: true, title: true, slug: true } },
    },
  },
} satisfies Prisma.TaskSelect;

const toWorkspaceTask = <
  T extends {
    createdAt: Date;
    columnEnteredAt: Date;
    priority: Priority;
      column: {
        status: string;
        board: { id: string; title: string; slug: string };
      };
  },
>(
  task: T,
  staleBoundary: Date,
) => ({
  ...task,
  board: task.column.board,
  column: { status: task.column.status },
  createdAt: task.createdAt.toISOString(),
  columnEnteredAt: task.columnEnteredAt.toISOString(),
  attentionReason: (() => {
    const isStale = task.columnEnteredAt <= staleBoundary;
    const isHighPriority = task.priority === "high";

    if (isStale && isHighPriority) return "high-priority-stale" as const;
    if (isStale) return "stale" as const;
    if (isHighPriority) return "high-priority" as const;
    return null;
  })(),
});

type AttentionGroup =
  | "high-priority-stale"
  | "high-priority"
  | "stale";

type WorkspaceTaskRow = Prisma.TaskGetPayload<{
  select: typeof workspaceTaskSelect;
}>;

const attentionGroups: AttentionGroup[] = [
  "high-priority-stale",
  "high-priority",
  "stale",
];

const getAttentionGroupWhere = (
  group: AttentionGroup,
  userId: string,
  searchWhere: Prisma.TaskWhereInput,
  staleBoundary: Date,
): Prisma.TaskWhereInput => {
  const groupWhere: Prisma.TaskWhereInput =
    group === "high-priority-stale"
      ? {
          priority: "high",
          columnEnteredAt: { lte: staleBoundary },
        }
      : group === "high-priority"
        ? {
            priority: "high",
            columnEnteredAt: { gt: staleBoundary },
          }
        : {
            priority: { not: "high" },
            columnEnteredAt: { lte: staleBoundary },
          };

  return {
    AND: [
      { column: { board: { userId } } },
      { column: { status: { notIn: TERMINAL_COLUMN_STATUSES } } },
      searchWhere,
      groupWhere,
    ],
  };
};

const getRankedNeedsAttentionPage = async (
  userId: string,
  searchWhere: Prisma.TaskWhereInput,
  staleBoundary: Date,
  page: number,
  limit: number,
  groupCounts?: number[],
): Promise<{ items: WorkspaceTaskRow[]; totalCount: number }> => {
  const counts =
    groupCounts ??
    (await Promise.all(
      attentionGroups.map((group) =>
        db.task.count({
          where: getAttentionGroupWhere(
            group,
            userId,
            searchWhere,
            staleBoundary,
          ),
        }),
      ),
    ));
  const totalCount = counts.reduce((sum, count) => sum + count, 0);
  const pageStart = (page - 1) * limit;
  const pageEnd = pageStart + limit;
  let groupsBeforePage = 0;

  const groupQueries = attentionGroups.map((group, index) => {
    const groupStart = Math.max(pageStart - groupsBeforePage, 0);
    const groupEnd = Math.min(pageEnd - groupsBeforePage, counts[index]);
    const take = Math.max(groupEnd - groupStart, 0);
    groupsBeforePage += counts[index];

    if (take === 0) return Promise.resolve([] as WorkspaceTaskRow[]);

    return db.task.findMany({
      where: getAttentionGroupWhere(
        group,
        userId,
        searchWhere,
        staleBoundary,
      ),
      orderBy: [{ columnEnteredAt: "asc" }, { id: "asc" }],
      skip: groupStart,
      take,
      select: workspaceTaskSelect,
    });
  });

  const groupItems = await Promise.all(groupQueries);

  return {
    items: groupItems.flat(),
    totalCount,
  };
};

export const getNeedsAttentionTasks = withUserId(
  async (userId: string): Promise<NeedsAttentionPreview> => {
    const staleBoundary = getStaleTaskBoundary();
    const { items: rankedTasks, totalCount } =
      await getRankedNeedsAttentionPage(
        userId,
        {},
        staleBoundary,
        1,
        DASHBOARD_FOCUS_PREVIEW_SIZE + 1,
      );

    return {
      items: rankedTasks
        .slice(0, DASHBOARD_FOCUS_PREVIEW_SIZE)
        .map(
          (task) => toWorkspaceTask(task, staleBoundary) as NeedsAttentionTask,
        ),
      hasMore: totalCount > DASHBOARD_FOCUS_PREVIEW_SIZE,
    };
  },
);

export const getWorkspaceTasksOverviewPage = withUserId(
  async (
    userId: string,
    filter: TasksFilter,
    page: number,
    query: string,
    limit: number,
  ): Promise<WorkspaceTasksPage> => {
    const staleBoundary = getStaleTaskBoundary();
    const activeColumn = { status: { notIn: TERMINAL_COLUMN_STATUSES } };
    const normalizedQuery = query.trim();
    const searchWhere: Prisma.TaskWhereInput = normalizedQuery
      ? {
          OR: [
            { title: { contains: normalizedQuery, mode: "insensitive" } },
            {
              description: {
                contains: normalizedQuery,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};
    const filterWhere = (currentFilter: TasksFilter): Prisma.TaskWhereInput =>
      currentFilter === "open"
        ? { column: activeColumn }
        : currentFilter === "needs-attention"
          ? {
              OR: [
                { columnEnteredAt: { lte: staleBoundary } },
                { priority: "high" },
              ],
              column: activeColumn,
            }
          : currentFilter === "stale"
            ? {
                columnEnteredAt: { lte: staleBoundary },
                column: activeColumn,
              }
            : currentFilter === "high-priority"
              ? { priority: "high", column: activeColumn }
              : {};
    const whereFor = (currentFilter: TasksFilter): Prisma.TaskWhereInput => ({
      AND: [
        { column: { board: { userId } } },
        searchWhere,
        filterWhere(currentFilter),
      ],
    });
    const where = whereFor(filter);
    const taskResultPromise: Promise<WorkspaceTaskRow[]> =
      filter === "needs-attention"
        ? getRankedNeedsAttentionPage(
            userId,
            searchWhere,
            staleBoundary,
            page,
            limit,
          ).then(({ items }) => items)
        : db.task.findMany({
            where,
            orderBy:
              filter === "all"
                ? [
                    { column: { board: { order: "asc" } } },
                    { column: { order: "asc" } },
                    { order: "asc" },
                    { id: "asc" },
                  ]
                : [{ columnEnteredAt: "asc" }, { id: "asc" }],
            skip: (page - 1) * limit,
            take: limit,
            select: workspaceTaskSelect,
          });
    const countFilters: TasksFilter[] = [
      "all",
      "open",
      "needs-attention",
      "stale",
      "high-priority",
    ];

    const [tasks, ...countResults] = await Promise.all([
      taskResultPromise,
      ...countFilters.map((currentFilter) =>
        db.task.count({ where: whereFor(currentFilter) }),
      ),
    ]);

    const counts = Object.fromEntries(
      countFilters.map((currentFilter, index) => [
        currentFilter,
        countResults[index],
      ]),
    ) as Record<TasksFilter, number>;

    return {
      items: tasks.map((task) => toWorkspaceTask(task, staleBoundary)),
      totalCount: counts[filter],
      counts,
    };
  },
);

export const getColumnTasksPage = withUserId(
  async (
    userId: string,
    columnId: string,
    cursor: string | null,
    limit: number,
    priority: Priority | null,
  ): Promise<TaskPage> => {
    const where = {
      columnId,
      column: { board: { userId } },
      ...(priority && { priority }),
    } satisfies Prisma.TaskWhereInput;
    const [tasks, totalCount] = await Promise.all([
      db.task.findMany({
        where: {
          ...where,
          ...(cursor && { order: { gt: cursor } }),
        },
        take: limit + 1,
        orderBy: [{ order: "asc" }, { id: "asc" }],
        select: {
          id: true,
          createdAt: true,
          title: true,
          description: true,
          priority: true,
          order: true,
          columnId: true,
          columnEnteredAt: true,
        },
      }),
      db.task.count({ where }),
    ]);

    const hasMore = tasks.length > limit;
    const page = hasMore ? tasks.slice(0, limit) : tasks;

    return {
      items: page.map((task) => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        columnEnteredAt: task.columnEnteredAt.toISOString(),
      })),
      nextCursor: hasMore ? (page.at(-1)?.order ?? null) : null,
      totalCount,
    };
  },
);
