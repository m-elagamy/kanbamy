import "server-only";

import { createHash } from "node:crypto";
import { Prisma, type Board, type Column, type Priority } from "@prisma/client";
import { generateKeyBetween } from "fractional-indexing";
import db from "@/lib/db";
import { unstable_cache } from "next/cache";
import { userBoardSlugTag } from "@/lib/cache-tags";
import { slugify } from "@/utils/slugify";

export const DEMO_BOARD_TITLE = "Weekly Focus";
const DEMO_BOARD_DESCRIPTION =
  "Plan your priorities, keep work moving, and finish what matters this week.";
const DEMO_COLUMN_STATUSES = ["To Do", "Today", "In Progress", "Done"] as const;

const DEMO_TASKS: Record<
  (typeof DEMO_COLUMN_STATUSES)[number],
  { title: string; description?: string; priority: Priority }[]
> = {
  "To Do": [
    { title: "Plan next week", priority: "low" },
    { title: "Book a health checkup", priority: "high" },
  ],
  Today: [
    { title: "Review monthly budget", priority: "medium" },
    {
      title: "Finish React lesson",
      description:
        "Complete the remaining section and write down the key takeaways.",
      priority: "low",
    },
  ],
  "In Progress": [
    {
      title: "Update portfolio project",
      description:
        "Polish the project page and review mobile responsiveness.",
      priority: "high",
    },
    { title: "Read 20 pages", priority: "low" },
  ],
  Done: [
    { title: "Morning workout", priority: "low" },
    { title: "Reply to important emails", priority: "low" },
  ],
};

export const getDemoBoardId = (ownerId: string) =>
  `demo_board_${createHash("sha256").update(ownerId).digest("hex")}`;

export const getDemoBoardSlug = () => slugify(DEMO_BOARD_TITLE);

const isUniqueConstraintError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

type DemoBoard = Board & { columns: Column[] };

export const getDemoBoardSummary = (ownerId: string) =>
  unstable_cache(
    async () =>
      db.board.findFirst({
        where: {
          id: getDemoBoardId(ownerId),
          userId: ownerId,
          user: { isDemo: true },
        },
        select: {
          id: true,
          createdAt: true,
          title: true,
          slug: true,
          description: true,
        },
      }),
    ["demo-board-summary-v2", ownerId],
    { tags: [userBoardSlugTag(ownerId, getDemoBoardSlug())] },
  )();

export async function ensureDemoBoard(ownerId: string): Promise<DemoBoard> {
  const boardId = getDemoBoardId(ownerId);
  const existing = await db.board.findFirst({
    where: {
      id: boardId,
      userId: ownerId,
      user: { isDemo: true },
    },
    include: { columns: { orderBy: { order: "asc" } } },
  });
  if (existing) return existing;

  const demoOwner = await db.user.findFirst({
    where: { id: ownerId, isDemo: true },
    select: { id: true },
  });
  if (!demoOwner) throw new Error("Demo owner not found.");

  try {
    return await db.$transaction(async (tx) => {
      const minOrderResult = await tx.board.aggregate({
        where: { userId: ownerId },
        _min: { order: true },
      });

      const board = await tx.board.create({
        data: {
          id: boardId,
          title: DEMO_BOARD_TITLE,
          description: DEMO_BOARD_DESCRIPTION,
          slug: getDemoBoardSlug(),
          order: (minOrderResult._min.order ?? 0) - 1,
          userId: ownerId,
        },
      });

      const columns: Column[] = [];
      for (const [order, status] of DEMO_COLUMN_STATUSES.entries()) {
        columns.push(
          await tx.column.create({
            data: { boardId: board.id, status, order },
          }),
        );
      }

      const tasks = columns.flatMap((column) => {
        const columnTasks = DEMO_TASKS[column.status as (typeof DEMO_COLUMN_STATUSES)[number]];
        let previousOrder: string | null = null;

        return columnTasks.map((task) => {
          const order = generateKeyBetween(previousOrder, null);
          previousOrder = order;

          return {
            ...task,
            columnId: column.id,
            order,
          };
        });
      });

      await tx.task.createMany({ data: tasks });
      await tx.user.update({
        where: { id: ownerId },
        data: { hasCreatedBoardOnce: true },
      });

      return { ...board, columns };
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;

    const concurrentBoard = await db.board.findFirst({
      where: {
        id: boardId,
        userId: ownerId,
        user: { isDemo: true },
      },
      include: { columns: { orderBy: { order: "asc" } } },
    });
    if (concurrentBoard) return concurrentBoard;
    throw error;
  }
}
