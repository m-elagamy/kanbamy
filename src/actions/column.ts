"use server";

/* eslint-disable @clerk/next/require-auth-protection -- Each action calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

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
import { requireAuth } from "@/utils/auth";

import { z } from "zod";

export async function createColumnAction(
  boardId: string,
  columnStatus: ColumnStatus,
): Promise<ServerActionResult<Column>> {
  await requireAuth();
  const validatedBoardId = z.string().min(1).safeParse(boardId);
  const validatedData = columnStatusSchema.safeParse({ status: columnStatus });

  if (!validatedBoardId.success || !validatedData.success) {
    return { success: false, message: "Invalid column status." };
  }

  try {
    const createdColumn = await createColumn(
      validatedBoardId.data,
      validatedData.data.status,
    );

    if (!createdColumn.success || !createdColumn.data) {
      return {
        success: false,
        message: "Failed to create a column.",
      };
    }

    await revalidateUserBoards();
    await revalidateUserBoard(validatedBoardId.data);

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
  await requireAuth();
  const validatedColumnId = z.string().min(1).safeParse(columnId);
  const validatedData = columnStatusSchema.partial().safeParse(data);

  if (!validatedColumnId.success || !validatedData.success) {
    return { success: false, message: "Invalid column status." };
  }

  try {
    const updatedColumn = await updateColumn(
      validatedColumnId.data,
      validatedData.data,
    );

    if (!updatedColumn.success || !updatedColumn.data) {
      return {
        success: false,
        message: "Failed to update column.",
      };
    }

    await revalidateUserBoards();
    await revalidateUserBoard(updatedColumn.data.boardId);

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
  await requireAuth();
  const validatedColumnId = z.string().min(1).safeParse(columnId);
  if (!validatedColumnId.success) {
    return { success: false, message: "Invalid column ID." };
  }

  try {
    const result = await deleteColumn(validatedColumnId.data);

    if (!result.success || !result.data) {
      return {
        success: false,
        message: "Failed to delete column",
      };
    }

    await revalidateUserBoards();
    await revalidateUserBoard(result.data.boardId);

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
  await requireAuth();
  const validatedData = columnPositionSchema.safeParse({
    boardId,
    newColumnOrder,
  });

  if (!validatedData.success) {
    return { success: false, message: "Invalid parameters provided." };
  }

  try {
    const result = await updateColumnPosition(
      validatedData.data.boardId,
      validatedData.data.newColumnOrder,
    );

    if (!result.success) {
      return { success: false, message: "Failed to reorder columns." };
    }

    await revalidateUserBoards();
    await revalidateUserBoard(validatedData.data.boardId);

    return { success: true, message: "Columns reordered successfully." };
  } catch (error) {
    return { success: false, message: handlePrismaError(error) };
  }
}
