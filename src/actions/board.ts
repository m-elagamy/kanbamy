"use server";

/* eslint-disable @clerk/next/require-auth-protection -- Each action validates the current user through requireAuth() or getAuthenticatedUserId(). */

import { type Board, type Column } from "@prisma/client";
import { z } from "zod";
import { redirect } from "next/navigation";
import { after } from "next/server";
import columnsTemplates from "@/app/dashboard/data/columns-templates";
import { boardSchema, type BoardFormSchema } from "@/schemas/board";
import { slugify } from "@/utils/slugify";
import { type ServerActionResult } from "@/lib/types";
import {
  createBoard,
  deleteBoard,
  recordBoardVisit,
  recordBoardVisitForUser,
  getBoardBySlugForUser,
  updateBoard,
  getBoardForRename,
  countBoardsBySlug,
} from "@/lib/dal/board";
import type { ColumnStatus } from "@/schemas/column";
import {
  getPrismaErrorDetails,
  default as handlePrismaError,
} from "@/utils/prisma-error-handler";
import {
  revalidateUserBoardList,
  revalidateUserBoard,
  revalidateUserBoardSlug,
  revalidateUserBoards,
} from "@/utils/revalidate-user-boards";
import { getAuthenticatedUserId, requireAuth } from "@/utils/auth";
import {
  getServerTimestamp,
  logServerTiming,
} from "@/utils/server-timing";

export const createBoardAction = async (
  boardData: BoardFormSchema,
  requestId: string,
  options?: { redirectAfterCreate?: boolean },
): Promise<ServerActionResult<Board & { columns: Column[] }>> => {
  const startedAt = getServerTimestamp();
  await requireAuth();
  const authenticatedAt = getServerTimestamp();
  const validatedData = boardSchema.safeParse(boardData);
  const validatedRequestId = z.uuid().safeParse(requestId);
  if (!validatedData.success || !validatedRequestId.success) {
    return { success: false, message: "Validation Errors" };
  }

  const { title, description, template: templateId } = validatedData.data;
  const boardSlug = slugify(title);
  const template = columnsTemplates.find((t) => t.id === templateId) || {
    status: [],
  };

  try {
    const result = await createBoard(
      validatedRequestId.data,
      title,
      boardSlug,
      description,
      template?.status as ColumnStatus[],
    );
    const createdAt = getServerTimestamp();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: "Failed to create board. Please try again.",
      };
    }

    await revalidateUserBoards();
    const revalidatedAt = getServerTimestamp();

    logServerTiming("board.create", revalidatedAt - startedAt, {
      authMs: authenticatedAt - startedAt,
      createMs: createdAt - authenticatedAt,
      revalidateMs: revalidatedAt - createdAt,
      redirected: Boolean(options?.redirectAfterCreate),
    });

    if (options?.redirectAfterCreate) {
      redirect(`/dashboard/${result.data.slug}?new=1`);
    }

    return {
      success: true,
      message: "Board created successfully",
      fields: result.data,
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

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
  ServerActionResult<Pick<Board, "title" | "description" | "slug">>
> => {
  await requireAuth();
  const data = Object.fromEntries(formData.entries());
  const validatedData = boardSchema.omit({ template: true }).safeParse(data);
  const rawBoardId = formData.get("boardId");
  const validatedBoardId = z.string().min(1).safeParse(rawBoardId);

  if (!validatedData.success || !validatedBoardId.success) {
    return {
      success: false,
      message: "Validation Errors",
    };
  }

  const { title, description } = validatedData.data;
  const boardId = validatedBoardId.data;

  const existingBoard = await getBoardForRename(boardId);

  if (!existingBoard.success || !existingBoard.data) {
    return { success: false, message: "Board not found." };
  }

  const titleChanged = existingBoard.data.title !== title;
  const descriptionChanged = existingBoard.data.description !== description;

  if (!titleChanged && !descriptionChanged) {
    return {
      success: false,
      message:
        "No changes detected. Please update something before submitting.",
    };
  }

  let newSlug: string | undefined;

  if (titleChanged) {
    newSlug = slugify(title);

    const duplicateCount = await countBoardsBySlug(boardId, newSlug);

    if (!duplicateCount.success) {
      return { success: false, message: "Board not found." };
    }

    if ((duplicateCount.data ?? 0) > 0) {
      return {
        success: false,
        message: `A board with the name "${title}" already exists.`,
      };
    }
  }

  const updatedData: Partial<Pick<Board, "title" | "description" | "slug">> = {
    ...(titleChanged && { title, slug: newSlug }),
    ...(descriptionChanged && { description }),
  };

  const result = await updateBoard(boardId, updatedData);

  if (!result.success || !result.data) {
    return { success: false, message: "Failed to update board" };
  }

  await revalidateUserBoards();
  await revalidateUserBoard(boardId);
  await revalidateUserBoardSlug(existingBoard.data.slug);
  if (newSlug) await revalidateUserBoardSlug(newSlug);

  return {
    success: true,
    message: "Board updated successfully",
    fields: result.data,
  };
};

export async function deleteBoardAction(
  boardId: string,
): Promise<ServerActionResult<{ boardId: string }>> {
  await requireAuth();
  const validatedId = z.string().min(1).safeParse(boardId);
  if (!validatedId.success) {
    return { success: false, message: "Invalid Board ID" };
  }

  const result = await deleteBoard(validatedId.data);

  if (!result.success || !result.data) {
    return { success: false, message: "Failed to delete board" };
  }

  await revalidateUserBoards();
  await revalidateUserBoard(validatedId.data);
  await revalidateUserBoardSlug(result.data.slug);

  return {
    success: true,
    message: "Board deleted successfully",
  };
}

export async function recordBoardVisitAction(
  boardId: string,
): Promise<ServerActionResult<{ boardId: string }>> {
  await requireAuth();
  const validatedId = z.string().min(1).safeParse(boardId);
  if (!validatedId.success) {
    return { success: false, message: "Invalid Board ID" };
  }

  const result = await recordBoardVisit(validatedId.data);
  if (!result.success || !result.data) {
    return { success: false, message: "Board not found" };
  }

  await revalidateUserBoardList();

  return {
    success: true,
    message: "Board visit recorded",
    fields: { boardId: result.data.id },
  };
}

export async function getBoardBySlugAction(slug: string) {
  const userId = await getAuthenticatedUserId();
  const validatedSlug = z.string().min(1).safeParse(slug);
  if (!validatedSlug.success) {
    return { success: false, message: "Board not found" };
  }

  const result = await getBoardBySlugForUser(userId, validatedSlug.data);

  if (!result) {
    return {
      success: false,
      message: "Board not found",
    };
  }

  after(async () => {
    try {
      await recordBoardVisitForUser(userId, result.id);
    } catch (error) {
      console.error("Failed to record board visit:", error);
    }
  });

  return {
    success: true,
    board: result,
  };
}
