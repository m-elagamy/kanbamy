import "server-only";

import { revalidateTag, updateTag } from "next/cache";
import db from "@/lib/db";
import { DASHBOARD_BOARDS_LIMIT } from "@/lib/constants";
import { getUserOnboardingStateForUser } from "@/lib/dal/user";
import {
  userBoardIdTag,
  userBoardSlugTag,
  userBoardsTag,
  userRecentlyVisitedBoardsTag,
} from "@/lib/cache-tags";

export async function revalidateUserBoards(ownerId: string) {
  updateTag(userBoardsTag(ownerId));
}

export async function revalidateUserBoard(ownerId: string, boardId: string) {
  updateTag(userBoardIdTag(ownerId, boardId));

  const board = await db.board.findFirst({
    where: { id: boardId, userId: ownerId },
    select: { slug: true },
  });
  if (board) updateTag(userBoardSlugTag(ownerId, board.slug));
}

export async function revalidateUserBoardSlug(ownerId: string, slug: string) {
  updateTag(userBoardSlugTag(ownerId, slug));
}

export async function revalidateUserBoardList(ownerId: string) {
  await revalidateUserBoardListForUser(ownerId);
}

export async function revalidateUserBoardListForUser(userId: string) {
  const { boardsCount } = await getUserOnboardingStateForUser(userId);
  if (boardsCount <= DASHBOARD_BOARDS_LIMIT) return;

  revalidateTag(userRecentlyVisitedBoardsTag(userId), { expire: 0 });
}
