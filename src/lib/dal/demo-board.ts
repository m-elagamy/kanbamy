import "server-only";

import { createHash } from "node:crypto";
import { Prisma, type Board, type Column, type Priority } from "@prisma/client";
import { generateKeyBetween } from "fractional-indexing";
import db from "@/lib/db";
import { unstable_cache } from "next/cache";
import { userBoardSlugTag } from "@/lib/cache-tags";
import { slugify } from "@/utils/slugify";

export const DEMO_BOARD_TITLE = "October Goals";
const DEMO_BOARD_DESCRIPTION =
  "Track learning, health, and personal goals for the month.";
const DEMO_COLUMN_STATUSES = ["To Do", "Today", "In Progress", "Done"] as const;

const DEMO_TASKS: Record<
  (typeof DEMO_COLUMN_STATUSES)[number],
  { title: string; description?: string; priority: Priority }[]
> = {
  "To Do": [
    {
      title: "Finish English Level 3",
      description: "Complete the remaining lessons and final review.",
      priority: "medium",
    },
    {
      title: "حفظ سورة الأعراف",
      description: "Review the next passage and keep the weekly habit consistent.",
      priority: "high",
    },
    {
      title: "Plan next portfolio case study",
      priority: "medium",
    },
    {
      title: "قراءة 20 دقيقة يوميًا",
      priority: "low",
    },
  ],
  Today: [
    {
      title: "Complete portfolio improvements",
      description: "Finish the remaining UI polish and performance checks.",
      priority: "high",
    },
    {
      title: "مراجعة خطة الأسبوع",
      priority: "medium",
    },
    {
      title: "Practice TypeScript for 45 minutes",
      priority: "medium",
    },
    {
      title: "30-minute conditioning workout",
      description: "Complete a focused session and note how it felt afterward.",
      priority: "low",
    },
  ],
  "In Progress": [
    {
      title: "Learn advanced TypeScript patterns",
      description: "Work through one practical pattern and apply it to a small example.",
      priority: "high",
    },
    {
      title: "تحسين اللياقة والتحمل",
      priority: "medium",
    },
    {
      title: "Refine Kanbamy board experience",
      priority: "medium",
    },
  ],
  Done: [
    {
      title: "تنظيم أهداف الشهر",
      priority: "medium",
    },
    {
      title: "Update resume and portfolio links",
      description: "Refresh the links that represent the latest work.",
      priority: "high",
    },
    {
      title: "Review September progress",
      priority: "low",
    },
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
