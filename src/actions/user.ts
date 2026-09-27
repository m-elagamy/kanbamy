"use server";

/* eslint-disable @clerk/next/require-auth-protection -- Each action validates the current user through requireAuth(), getAuthenticatedUserId(), or getAuthenticatedUser(). */

import {
  getAuthenticatedUser,
  getAuthenticatedUserId,
  requireAuth,
} from "@/utils/auth";
import { User } from "@prisma/client";
import type { ServerActionResult } from "@/lib/types";
import {
  insertUser,
  getAllUserBoards,
  getUserOnboardingState,
  getUserOnboardingStateForUser,
  getUserBoardsWithStats,
  getUserBoardsPage,
  getDashboardStats,
} from "../lib/dal/user";
import type { SimplifiedBoard, BoardWithStats } from "@/lib/types/stores/board";

export async function insertUserAction(
  data: Omit<User, "hasCreatedBoardOnce">,
): Promise<ServerActionResult<User>> {
  await requireAuth();
  const userId = await getAuthenticatedUserId();

  if (!userId || userId !== data.id) {
    return {
      success: false,
      message: "Authentication required.",
    };
  }

  const result = await insertUser(data);

  if (!result.success || !result.data) {
    return {
      success: false,
      message: "Failed to insert user.",
    };
  }

  return {
    success: true,
    message: "User inserted successfully.",
    fields: result.data,
  };
}

export async function getAllUserBoardsAction(): Promise<
  ServerActionResult<{ boards: SimplifiedBoard[]; totalCount: number }>
> {
  await requireAuth();
  const result = await getAllUserBoards();

  if (!result.success) {
    return {
      success: false,
      message: "Failed to fetch user boards.",
    };
  }

  return {
    success: true,
    message: "All user boards fetched successfully.",
    fields: result.data,
  };
}

export async function getUserBoardsWithStatsAction(): Promise<
  ServerActionResult<BoardWithStats[]>
> {
  await requireAuth();
  const result = await getUserBoardsWithStats();

  if (!result.success) {
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

export async function getUserBoardsPageAction(
  page: number,
  query = "",
): Promise<
  ServerActionResult<{ boards: BoardWithStats[]; totalCount: number }>
> {
  await requireAuth();
  const result = await getUserBoardsPage(page, query);

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

export async function getDashboardStatsAction(): Promise<
  ServerActionResult<{
    totalBoards: number;
    openTasks: number;
  }>
> {
  await requireAuth();
  const result = await getDashboardStats();

  if (!result.success) {
    return {
      success: false,
      message: "Failed to fetch dashboard stats.",
    };
  }

  return {
    success: true,
    message: "Dashboard stats fetched successfully.",
    fields: result.data,
  };
}

export async function getUserOnboardingStateAction(): Promise<
  ServerActionResult<{ boardsCount: number; hasCreatedBoardOnce: boolean }>
> {
  await requireAuth();
  const result = await getUserOnboardingState();

  if (!result.success || !result.data) {
    return {
      success: false,
      message: "Failed to fetch onboarding state.",
    };
  }

  return {
    success: true,
    message: "Onboarding state fetched successfully.",
    fields: result.data,
  };
}

export async function getDashboardLayoutDataAction(): Promise<
  ServerActionResult<{
    boardsCount: number;
    hasCreatedBoardOnce: boolean;
    user: {
      fullName: string | null;
      firstName: string | null;
      imageUrl: string;
      email: string;
    };
  }>
> {
  const user = await getAuthenticatedUser();
  const onboardingState = await getUserOnboardingStateForUser(user.id);

  return {
    success: true,
    message: "Dashboard layout data fetched successfully.",
    fields: {
      ...onboardingState,
      user: {
        fullName: user.fullName,
        firstName: user.firstName,
        imageUrl: user.imageUrl,
        email: user.primaryEmailAddress?.emailAddress ?? "",
      },
    },
  };
}
