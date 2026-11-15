import "server-only";

import { revalidateTag, updateTag } from "next/cache";
import {
  userBoardIdTag,
  userBoardsTag,
  userRecentBoardsTag,
} from "./tags";

export async function revalidateUserBoards(ownerId: string) {
  updateTag(userBoardsTag(ownerId));
}

export async function revalidateUserBoard(ownerId: string, boardId: string) {
  updateTag(userBoardIdTag(ownerId, boardId));
}

export async function revalidateRecentBoards(userId: string) {
  revalidateTag(userRecentBoardsTag(userId), { expire: 0 });
}
