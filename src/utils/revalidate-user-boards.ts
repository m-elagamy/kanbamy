import "server-only";

import { revalidateTag, updateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import {
  userBoardIdTag,
  userBoardSlugTag,
  userBoardsTag,
} from "@/lib/cache-tags";

export async function revalidateUserBoards() {
  const { userId } = await auth();
  if (!userId) return;

  updateTag(userBoardsTag(userId));
}

export async function revalidateUserBoard(boardId: string) {
  const { userId } = await auth();
  if (!userId) return;

  updateTag(userBoardIdTag(userId, boardId));

  const board = await db.board.findFirst({
    where: { id: boardId, userId },
    select: { slug: true },
  });
  if (board) updateTag(userBoardSlugTag(userId, board.slug));
}

export async function revalidateUserBoardSlug(slug: string) {
  const { userId } = await auth();
  if (!userId) return;

  updateTag(userBoardSlugTag(userId, slug));
}

export async function revalidateUserBoardList() {
  const { userId } = await auth();
  if (!userId) return;

  revalidateTag(userBoardsTag(userId), "max");
}
