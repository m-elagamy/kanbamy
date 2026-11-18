"use server";

/* eslint-disable @clerk/next/require-auth-protection -- Each action validates the current user through requireAuth(), getAuthenticatedUserId(), or getAuthenticatedUser(). */

import { requireAuth } from "@/lib/auth";
import type { ServerActionResult } from "@/lib/types";
import { getUserBoardsPage } from "../lib/dal/user";
import type { BoardWithStats } from "@/lib/types/stores/board";
import { boardPageSchema } from "@/schemas/board";

export async function getUserBoardsPageAction(
  page: number,
  query = "",
): Promise<
  ServerActionResult<{ boards: BoardWithStats[]; totalCount: number }>
> {
  await requireAuth();

  const validated = boardPageSchema.safeParse({ page, query });
  if (!validated.success) {
    return {
      success: false,
      message: "Invalid pagination parameters.",
    };
  }

  const result = await getUserBoardsPage(
    validated.data.page,
    validated.data.query,
  );

  if (!result.success || !result.data) {
    return {
      success: false,
      message: "Failed to fetch boards.",
    };
  }

  return {
    success: true,
    message: "Boards fetched successfully.",
    fields: result.data,
  };
}
