import { withUserId } from "@/utils/auth-wrappers";
import db from "../db";
import { Column } from "@prisma/client";
import type { ColumnStatus } from "@/schemas/column";

export const createColumn = withUserId(
  async (
    userId: string,
    boardId: string,
    status: ColumnStatus,
  ): Promise<Column> => {
    return db.$transaction(async (prisma) => {
      const board = await prisma.board.findFirst({
        where: { id: boardId, userId },
        select: { id: true },
      });
      if (!board) throw new Error("Board not found.");

      const highestOrderColumn = await prisma.column.findFirst({
        where: { boardId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const newOrder = highestOrderColumn ? highestOrderColumn.order + 1 : 0;

      return prisma.column.create({
        data: {
          status,
          boardId,
          order: newOrder,
        },
      });
    });
  },
);

export const updateColumn = withUserId(
  async (
    userId: string,
    columnId: string,
    data: Partial<Pick<Column, "status">>,
  ) => {
    const column = await db.column.findFirst({
      where: { id: columnId, board: { userId } },
      select: { id: true, boardId: true },
    });
    if (!column) return null;

    return db.column.update({
      where: { id: columnId },
      data,
    });
  },
);

export const deleteColumn = withUserId(
  async (userId: string, columnId: string) => {
    const column = await db.column.findFirst({
      where: { id: columnId, board: { userId } },
      select: { id: true, boardId: true },
    });
    if (!column) return null;

    return db.column.delete({
      where: { id: columnId },
    });
  },
);

export const updateColumnPosition = withUserId(
  async (userId: string, boardId: string, newColumnOrder: string[]) => {
    const matchingCount = await db.column.count({
      where: { id: { in: newColumnOrder }, board: { id: boardId, userId } },
    });

    if (matchingCount !== newColumnOrder.length) {
      throw new Error("One or more columns do not belong to this board.");
    }

    await db.$transaction(
      newColumnOrder.map((columnId, index) =>
        db.column.update({
          where: { id: columnId, boardId },
          data: { order: index },
        }),
      ),
    );
  },
);
