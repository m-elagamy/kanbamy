import "server-only";

import { revalidateTag, updateTag } from "next/cache";
import db from "@/lib/db";
import {
  userBoardIdTag,
  userBoardSlugTag,
  userBoardsTag,
  userRecentBoardsTag,
} from "./tags";

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

export async function revalidateRecentBoards(userId: string) {
  revalidateTag(userRecentBoardsTag(userId), { expire: 0 });
}
