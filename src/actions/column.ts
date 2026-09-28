"use server";

/* eslint-disable @clerk/next/require-auth-protection -- Each action validates workspace access through requireWorkspaceAccess(). */

import { Column } from "@prisma/client";
import {
  createColumn,
  updateColumn,
  deleteColumn,
  updateColumnPosition,
} from "@/lib/dal/column";
import columnStatusSchema, {
  columnPositionSchema,
  type ColumnStatus,
} from "@/schemas/column";
import type { ServerActionResult } from "@/lib/types";
import handlePrismaError from "@/utils/prisma-error-handler";
import {
  revalidateUserBoard,
  revalidateUserBoards,
} from "@/utils/revalidate-user-boards";
import { requireWorkspaceAccess } from "@/utils/workspace-access";

import { z } from "zod";

export async function createColumnAction(
  boardId: string,
  columnStatus: ColumnStatus,
): Promise<ServerActionResult<Column>> {
  const owner = await requireWorkspaceAccess();
  const validatedBoardId = z.string().min(1).safeParse(boardId);
  const validatedData = columnStatusSchema.safeParse({ status: columnStatus });

  if (!validatedBoardId.success || !validatedData.success) {
    return { success: false, message: "Invalid column status." };
  }

  try {
    const createdColumn = await createColumn(
      owner.ownerId,
      validatedBoardId.data,
      validatedData.data.status,
    );

    if (!createdColumn.success || !createdColumn.data) {
      return {
        success: false,
        message: "Failed to create a column.",
      };
    }

    await revalidateUserBoards(owner.ownerId);
    await revalidateUserBoard(owner.ownerId, validatedBoardId.data);

    return {
      success: true,
      message: `Column was added successfully.`,
      fields: createdColumn.data,
    };
  } catch (error) {
    return { success: false, message: handlePrismaError(error) };
  }
}

export async function updateColumnAction(
  columnId: string,
  data: Partial<Pick<Column, "status">>,
): Promise<ServerActionResult<Column>> {
  const owner = await requireWorkspaceAccess();
  const validatedColumnId = z.string().min(1).safeParse(columnId);
  const validatedData = columnStatusSchema.partial().safeParse(data);

  if (!validatedColumnId.success || !validatedData.success) {
    return { success: false, message: "Invalid column status." };
  }

  try {
    const updatedColumn = await updateColumn(
      owner.ownerId,
      validatedColumnId.data,
      validatedData.data,
    );

    if (!updatedColumn.success || !updatedColumn.data) {
      return {
        success: false,
        message: "Failed to update column.",
      };
    }

    await revalidateUserBoards(owner.ownerId);
    await revalidateUserBoard(owner.ownerId, updatedColumn.data.boardId);

    return {
      success: true,
      message: "Column updated successfully.",
      fields: updatedColumn.data,
    };
  } catch (error) {
    return { success: false, message: handlePrismaError(error) };
  }
}

export async function deleteColumnAction(
  columnId: string,
): Promise<ServerActionResult<Column>> {
  const owner = await requireWorkspaceAccess();
  const validatedColumnId = z.string().min(1).safeParse(columnId);
  if (!validatedColumnId.success) {
    return { success: false, message: "Invalid column ID." };
  }

  try {
    const result = await deleteColumn(owner.ownerId, validatedColumnId.data);

    if (!result.success || !result.data) {
      return {
        success: false,
        message: "Failed to delete column",
      };
    }

    await revalidateUserBoards(owner.ownerId);
    await revalidateUserBoard(owner.ownerId, result.data.boardId);

    return {
      success: true,
      message: "Column deleted successfully",
    };
  } catch (error) {
    return { success: false, message: handlePrismaError(error) };
  }
}

export async function updateColumnPositionAction(
  boardId: string,
  newColumnOrder: string[],
): Promise<ServerActionResult<null>> {
  const owner = await requireWorkspaceAccess();
  const validatedData = columnPositionSchema.safeParse({
    boardId,
    newColumnOrder,
  });

  if (!validatedData.success) {
    return { success: false, message: "Invalid parameters provided." };
  }

  try {
    const result = await updateColumnPosition(
      owner.ownerId,
      validatedData.data.boardId,
      validatedData.data.newColumnOrder,
    );

    if (!result.success) {
      return { success: false, message: "Failed to reorder columns." };
    }

    await revalidateUserBoards(owner.ownerId);
    await revalidateUserBoard(owner.ownerId, validatedData.data.boardId);

    return { success: true, message: "Columns reordered successfully." };
  } catch (error) {
    return { success: false, message: handlePrismaError(error) };
  }
}
