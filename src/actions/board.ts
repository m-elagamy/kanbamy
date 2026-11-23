"use server";

/* eslint-disable @clerk/next/require-auth-protection -- Each action validates workspace access through requireWorkspaceAccess(). */

import { type Board, type Column } from "@prisma/client";
import { z } from "zod";
import { BOARD_TEMPLATE_STATUSES } from "@/lib/constants";
import { boardSchema, type BoardFormSchema } from "@/schemas/board";
import { type ServerActionResult } from "@/lib/types";
import {
  createBoard,
  deleteBoard,
  updateBoard,
  getBoardForRename,
} from "@/lib/dal/board";
import type { ColumnStatus } from "@/schemas/column";
import {
  getPrismaErrorDetails,
  default as handlePrismaError,
} from "@/lib/server/prisma-error-handler";
import {
  revalidateUserBoard,
  revalidateUserBoards,
  revalidateUserOnboarding,
} from "@/lib/cache/revalidate";
import { requireWorkspaceAccess } from "@/lib/auth/workspace-access";

export const createBoardAction = async (
  boardData: BoardFormSchema,
  requestId: string,
): Promise<ServerActionResult<Board & { columns: Column[] }>> => {
  const owner = await requireWorkspaceAccess();
  if (owner.isDemo) {
    return {
      success: false,
      message: "Create an account to manage boards.",
    };
  }
  const validatedData = boardSchema.safeParse(boardData);
  const validatedRequestId = z.uuid().safeParse(requestId);
  if (!validatedData.success || !validatedRequestId.success) {
    return { success: false, message: "Validation Errors" };
  }

  const {
    title,
    description,
    template: templateId,
    tags,
  } = validatedData.data;
  const templateStatus = (templateId && BOARD_TEMPLATE_STATUSES[templateId]) || [];

  try {
    const result = await createBoard(
      owner.ownerId,
      validatedRequestId.data,
      title,
      description,
      [...templateStatus] as ColumnStatus[],
      tags,
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        message: "Failed to create board. Please try again.",
      };
    }

    revalidateUserBoards(owner.ownerId);
    revalidateUserOnboarding(owner.ownerId);

    return {
      success: true,
      message: "Board created successfully",
      fields: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: handlePrismaError(error),
      ...(process.env.NODE_ENV === "development" && {
        debugMessage: getPrismaErrorDetails(error),
      }),
    };
  }
};

export const updateBoardAction = async (
  formData: FormData,
): Promise<
  ServerActionResult<Pick<Board, "title" | "description" | "tags">>
> => {
  const owner = await requireWorkspaceAccess();
  const data = {
    ...Object.fromEntries(formData.entries()),
    tags: formData.getAll("tags"),
  };
  const validatedData = boardSchema.omit({ template: true }).safeParse(data);
  const rawBoardId = formData.get("boardId");
  const validatedBoardId = z.string().min(1).safeParse(rawBoardId);

  if (!validatedData.success || !validatedBoardId.success) {
    return {
      success: false,
      message: "Validation Errors",
    };
  }

  const { title, description, tags } = validatedData.data;
  const boardId = validatedBoardId.data;

  const existingBoard = await getBoardForRename(owner.ownerId, boardId);

  if (!existingBoard.success || !existingBoard.data) {
    return { success: false, message: "Board not found." };
  }

  const titleChanged = existingBoard.data.title !== title;
  const descriptionChanged = existingBoard.data.description !== description;
  const tagsChanged =
    JSON.stringify(existingBoard.data.tags.slice().sort()) !==
    JSON.stringify(tags.slice().sort());

  if (!titleChanged && !descriptionChanged && !tagsChanged) {
    return {
      success: false,
      message:
        "No changes detected. Please update something before submitting.",
    };
  }

  const updatedData: Partial<
    Pick<Board, "title" | "description" | "tags">
  > = {
    ...(titleChanged && { title }),
    ...(descriptionChanged && { description }),
    ...(tagsChanged && { tags }),
  };

  const result = await updateBoard(owner.ownerId, boardId, updatedData);

  if (!result.success || !result.data) {
    return { success: false, message: "Failed to update board" };
  }

  revalidateUserBoards(owner.ownerId);
  revalidateUserBoard(owner.ownerId, boardId);

  return {
    success: true,
    message: "Board updated successfully",
    fields: result.data,
  };
};

export async function deleteBoardAction(
  boardId: string,
): Promise<ServerActionResult<{ boardId: string }>> {
  const owner = await requireWorkspaceAccess();
  if (owner.isDemo) {
    return {
      success: false,
      message: "Create an account to manage boards.",
    };
  }
  const validatedId = z.string().min(1).safeParse(boardId);
  if (!validatedId.success) {
    return { success: false, message: "Invalid Board ID" };
  }

  const result = await deleteBoard(owner.ownerId, validatedId.data);

  if (!result.success || !result.data) {
    return { success: false, message: "Failed to delete board" };
  }

  revalidateUserBoards(owner.ownerId);
  revalidateUserOnboarding(owner.ownerId);
  revalidateUserBoard(owner.ownerId, validatedId.data);

  return {
    success: true,
    message: "Board deleted successfully",
  };
}

