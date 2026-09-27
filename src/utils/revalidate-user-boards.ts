import "server-only";

import { revalidateTag, updateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
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
