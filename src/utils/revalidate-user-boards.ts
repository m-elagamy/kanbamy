import "server-only";

import { revalidateTag, updateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { userBoardDataTag, userBoardsTag } from "@/lib/cache-tags";

export async function revalidateUserBoards() {
  const { userId } = await auth();
  if (!userId) return;

  updateTag(userBoardsTag(userId));
  updateTag(userBoardDataTag(userId));
}

export async function revalidateUserBoardList() {
  const { userId } = await auth();
  if (!userId) return;

  revalidateTag(userBoardsTag(userId), "max");
}
